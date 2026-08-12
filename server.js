require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const MAX_BODY_SIZE = 50 * 1024;
const recipient = process.env.CONTACT_RECIPIENT || process.env.GMAIL_USER;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !recipient) {
    console.warn('Email is not configured. Add GMAIL_USER, GMAIL_APP_PASSWORD, and CONTACT_RECIPIENT to .env.');
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

const mimeTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf'
};

function sendJson(response, status, body) {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(body));
}

function applyCors(request, response) {
    const origin = request.headers.origin;
    if (!origin) return true;

    // CORS is a browser safeguard, not an authentication mechanism. The form
    // endpoint is intentionally public, but this setting prevents other sites
    // from reading its responses in visitors' browsers.
    if (allowedOrigins.length && !allowedOrigins.includes(origin)) return false;

    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    response.setHeader('Vary', 'Origin');
    return true;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[char]);
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        request.on('data', chunk => {
            body += chunk;
            if (body.length > MAX_BODY_SIZE) {
                reject(new Error('Request body is too large'));
                request.destroy();
            }
        });
        request.on('end', () => {
            try {
                resolve(JSON.parse(body || '{}'));
            } catch {
                reject(new Error('Invalid request data'));
            }
        });
        request.on('error', reject);
    });
}

async function handleContact(request, response) {
    try {
        const { name, email, subject, message } = await readJsonBody(request);
        const fields = { name, email, subject, message };
        const hasAllFields = Object.values(fields).every(value => typeof value === 'string' && value.trim());
        const validEmail = typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!hasAllFields || !validEmail) {
            sendJson(response, 400, { error: 'Please provide a name, valid email address, subject, and message.' });
            return;
        }
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !recipient) {
            sendJson(response, 503, { error: 'The email service is not configured yet.' });
            return;
        }

        const clean = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value.trim()]));
        await transporter.sendMail({
            from: `Portfolio Contact <${process.env.GMAIL_USER}>`,
            to: recipient,
            replyTo: clean.email,
            subject: `Portfolio contact: ${clean.subject}`,
            text: `Name: ${clean.name}\nEmail: ${clean.email}\nSubject: ${clean.subject}\n\n${clean.message}`,
            html: `<h2>New portfolio message</h2><p><strong>Name:</strong> ${escapeHtml(clean.name)}</p><p><strong>Email:</strong> ${escapeHtml(clean.email)}</p><p><strong>Subject:</strong> ${escapeHtml(clean.subject)}</p><p><strong>Message:</strong></p><p>${escapeHtml(clean.message).replace(/\n/g, '<br>')}</p>`
        });

        sendJson(response, 200, { message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Contact email failed:', error.message);
        sendJson(response, 500, { error: 'Unable to send the message right now.' });
    }
}

const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const corsAllowed = applyCors(request, response);

    if (request.method === 'OPTIONS') {
        if (!corsAllowed) {
            sendJson(response, 403, { error: 'Origin not allowed.' });
        } else {
            response.writeHead(204);
            response.end();
        }
        return;
    }

    if (!corsAllowed) {
        sendJson(response, 403, { error: 'Origin not allowed.' });
        return;
    }

    if (request.method === 'POST' && url.pathname === '/api/contact') {
        handleContact(request, response);
        return;
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
        sendJson(response, 405, { error: 'Method not allowed.' });
        return;
    }

    const relativePath = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^[/\\]+/, '');
    const filePath = path.resolve(ROOT, relativePath);
    if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
        sendJson(response, 403, { error: 'Forbidden.' });
        return;
    }

    fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) {
            response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end('Not found');
            return;
        }
        response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
        if (request.method === 'HEAD') response.end();
        else fs.createReadStream(filePath).pipe(response);
    });
});

server.listen(PORT, '0.0.0.0', () => console.log(`Portfolio server is running at http://localhost:${PORT}`));
