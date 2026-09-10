import app from '../backend/src/server';

export default function handler(req: any, res: any) {
    if (req.url && req.url.startsWith('/api/')) {
        req.url = req.url.substring(4);
    } else if (req.url === '/api') {
        req.url = '/';
    }
    return app(req, res);
}
