// routes/logs.routes.js
import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const LOG_DIR    = path.join(__dirname, '..', 'logs');

router.get('/monitor', async (req, res) => {
  try {
    const lines = Math.min(parseInt(req.query.lines || '200', 10), 2000);
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    const file = path.join(LOG_DIR, `monitor-${yyyy}-${mm}-${dd}.log`);

    const data = await fs.readFile(file, 'utf8').catch(() => '');
    const arr = data.split('\n').filter(Boolean);
    const tail = arr.slice(-lines).map(s => JSON.parse(s));
    res.json(tail);
  } catch (e) {
    res.status(500).json({ message: 'Cannot read logs', error: String(e?.message || e) });
  }
});

export default router;
