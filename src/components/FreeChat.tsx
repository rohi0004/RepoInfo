"use client";
import { useState, useRef, useEffect } from 'react';

export default function FreeChat() {
    const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'model'; content: string }>>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef<HTMLDivElement | null>(null);
    const visitorKeyRef = useRef<string>('');

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load persisted messages for this visitor (if any) - try server-side first, fallback to localStorage
    useEffect(() => {
        (async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                let visitorId = localStorage.getItem('visitor_id') || params.get('visitorId') || '';
                if (!visitorId) {
                    visitorId = crypto.randomUUID();
                    localStorage.setItem('visitor_id', visitorId);
                }
                const key = `freechat:messages:${visitorId || 'anon'}`;
                visitorKeyRef.current = key;
                
                // Try server-side history first
                try {
                    const res = await fetch(`/api/chat/history?visitorId=${encodeURIComponent(visitorId)}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data.messages) && data.messages.length > 0) {
                            setMessages(data.messages);
                            return;
                        }
                    }
                } catch (e) {
                    console.warn('Failed to load server-side history, falling back to localStorage', e);
                }
                
                // Fallback to localStorage
                const raw = localStorage.getItem(key);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) setMessages(parsed);
                }
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    // Persist messages whenever they change - save to both localStorage and server
    useEffect(() => {
        if (messages.length === 0) return;
        try {
            const key = visitorKeyRef.current || `freechat:messages:anon`;
            localStorage.setItem(key, JSON.stringify(messages));
            
            // Also save to server
            const visitorId = localStorage.getItem('visitor_id');
            if (visitorId) {
                fetch('/api/chat/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ visitorId, messages })
                }).catch(e => console.warn('Failed to save history to server', e));
            }
        } catch (e) {
            // ignore
        }
    }, [messages]);

    const send = async () => {
        if (!input.trim() || loading) return;
        const userMsg = { id: Date.now().toString(), role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        try {
            const params = new URLSearchParams(window.location.search);
            const visitorId = localStorage.getItem('visitor_id') || params.get('visitorId') || '';
            const res = await fetch('/api/chat/open', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: userMsg.content, visitorId }) });
            const data = await res.json();
            if (data.answer) {
                setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', content: data.answer }]);
            } else {
                setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', content: data.error || 'Failed to get answer' }]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', content: 'Error contacting server' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto w-full">
            <div className="bg-white dark:bg-[#071024] rounded-lg p-4 mb-4 shadow">
                <h2 className="text-lg font-semibold">Chat</h2>
                <p className="text-sm text-zinc-500">Ask general questions — your plan applies here.</p>
            </div>

            <div className="space-y-4 mb-4">
                {messages.map(m => (
                    <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                        <div className={`inline-block px-4 py-2 rounded-lg ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-white'}`}>{m.content}</div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            <div className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything..." className="flex-1 px-4 py-2 rounded border" />
                <button onClick={send} disabled={loading} className="px-4 py-2 rounded bg-zinc-900 text-white">{loading ? 'Sending...' : 'Send'}</button>
            </div>
        </div>
    );
}
