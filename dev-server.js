#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
};

const loginHandler = require('./api/login.js');
const profileHandler = require('./api/profile.js');

const server = http.createServer(async (req, res) => {
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };

    res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
    };

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`${req.method} ${pathname}`);

    if (pathname === '/api/login') {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', async () => {
                req.body = JSON.parse(body);
                await loginHandler(req, res);
            });
        } else {
            await loginHandler(req, res);
        }
        return;
    }

    if (pathname === '/api/profile') {
        req.query = parsedUrl.query;
        await profileHandler(req, res);
        return;
    }

    let filePath = '';

    if (pathname === '/') {
        filePath = path.join(__dirname, 'public', 'index.html');
    } else if (pathname === '/dashboard.html') {
        filePath = path.join(__dirname, 'public', 'dashboard.html');
    } else if (pathname === '/styles.css') {
        filePath = path.join(__dirname, 'public', 'styles.css');
    } else {
        filePath = path.join(__dirname, 'public', pathname);
    }

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath);
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
                return;
            }

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    });
});

const tryListen = (port) => {
    server.listen(port, () => {
        console.log('');
        console.log('🚀 CTF Challenge - Local Development Server');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Server running at: http://localhost:${port}`);
        console.log('');
        console.log('📝 Demo Credentials:');
        console.log('   Username: employee1');
        console.log('   Password: pass123');
        console.log('');
        console.log('🎯 Flag Location: Admin account (id: 0)');
        console.log('');
        console.log('⚠️  Cara Stop: Tekan Ctrl+C');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️  Port ${port} sedang digunakan, mencoba port ${port + 1}...`);
            tryListen(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
};

tryListen(PORT);
