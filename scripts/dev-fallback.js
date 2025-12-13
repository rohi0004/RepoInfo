#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

function nodeSatisfies() {
  const v = process.version.replace(/^v/, '').split('.').map(Number);
  const [major, minor, patch] = v;
  if (major > 20) return true;
  if (major === 20) {
    if (minor > 9) return true;
    if (minor === 9 && patch >= 0) return true;
  }
  return false;
}

if (nodeSatisfies()) {
  console.log('Node >=20.9.0 detected — launching Next dev...');
  const child = spawn('npx', ['next', 'dev'], { stdio: 'inherit', shell: true });
  child.on('exit', (code) => process.exit(code));
  child.on('error', (err) => {
    console.error('Failed to launch Next dev:', err);
    process.exit(1);
  });
} else {
  const startPort = Number(process.env.PORT) || 3000;
  const MAX_ATTEMPTS = 50;
  console.log(`Node ${process.version} detected — attempting fallback static server starting at port ${startPort}`);

  const publicDir = path.join(__dirname, '..', 'standalone');

  function sendFile(filePath, res) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
      };
      const ct = contentTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': ct });
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      console.error(err);
      res.writeHead(500);
      res.end('Server error');
    }
  }

  const server = http.createServer((req, res) => {
    try {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
      const filePath = path.join(publicDir, decodeURIComponent(reqPath));

      // Prevent path traversal
      if (!filePath.startsWith(publicDir)) {
        res.writeHead(403);
        return res.end('Forbidden');
      }

      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        return res.end('Not found');
      }

      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        res.writeHead(404);
        return res.end('Not found');
      }

      sendFile(filePath, res);
    } catch (err) {
      console.error(err);
      res.writeHead(500);
      res.end('Server error');
    }
  });

  // Try to find a free port starting at startPort
  (async () => {
    const net = require('net');
    function checkPort(p) {
      return new Promise((resolve) => {
        const tester = net.createServer()
          .once('error', () => {
            tester.close();
            resolve(false);
          })
          .once('listening', () => {
            tester.close();
            resolve(true);
          })
          .listen(p, '0.0.0.0');
      });
    }

    let portToUse = null;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const p = startPort + i;
      // eslint-disable-next-line no-await-in-loop
      const ok = await checkPort(p);
      if (ok) {
        portToUse = p;
        break;
      }
    }

    if (!portToUse) {
      console.error(`No free ports found in range ${startPort}-${startPort + MAX_ATTEMPTS - 1}`);
      process.exit(1);
    }

    server.listen(portToUse, () => {
      console.log(`Fallback server ready — serving files from ${publicDir} on http://localhost:${portToUse}`);
    });
  })();
}
