import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/billing';

// PDF generation using pdfkit
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const sessionId = url.searchParams.get('session_id') || '';
        if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });

        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['customer_details'] });

        // Dynamically import pdfkit to avoid top-level dependency issues
        const PDFModule: any = await import('pdfkit');
        const PDFDocument = PDFModule.default || PDFModule;

        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Try to register a TTF font from common system locations to avoid
        // pdfkit trying to load AFM files from its package (which can fail
        // in some bundlers/environments). If a font is found, register and
        // use it; otherwise continue and let pdfkit use its default (may fail).
        try {
            const fs = await import('fs');
            const candidateFonts = [
                process.env.FONT_PATH || '',
                '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
                '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
                '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
                '/Library/Fonts/Arial.ttf',
            ];
            const fontPath = candidateFonts.find(p => p && fs.existsSync(p));
            if (fontPath) {
                try {
                    (doc as any).registerFont('Base', fontPath);
                    doc.font('Base');
                } catch (e) {
                    // ignore registration errors and proceed
                    console.warn('font register failed', e);
                }
            }
        } catch (e) {
            // ignore font-detection errors
        }
        const chunks: Uint8Array[] = [];

        doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));

        const endPromise = new Promise<Uint8Array>((resolve, reject) => {
            doc.on('end', () => {
                try {
                    const result = Buffer.concat(chunks as any);
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            });
            doc.on('error', reject);
        });

        // Build PDF content
        doc.fontSize(20).text('Receipt', { align: 'center' });
        doc.moveDown();

        const plan = session.metadata?.planId || 'Unknown plan';
        const visitorId = session.metadata?.visitorId || '';
        const customer = session.customer_details?.email || session.customer_email || '';
        const amount = session.amount_total ? `$${(session.amount_total/100).toFixed(2)}` : '';
        const date = new Date((session.created || Date.now()/1000) * 1000).toLocaleString();

        doc.fontSize(12).text(`Plan: ${plan}`);
        doc.text(`Visitor ID: ${visitorId}`);
        doc.text(`Customer email: ${customer}`);
        doc.text(`Amount: ${amount}`);
        doc.text(`Date: ${date}`);

        doc.moveDown();
        doc.text('Thank you for your purchase.', { align: 'left' });

        doc.end();

        const buffer = await endPromise;

        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=receipt_${session.id}.pdf`
            }
        });
    } catch (e: any) {
        console.error('generate receipt error', e);
        return NextResponse.json({ error: e.message || 'Failed to generate PDF' }, { status: 500 });
    }
}
