const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json());

// ── CONFIG ──────────────────────────────────────────
const BETFAIR_SESSION = process.env.BETFAIR_SESSION;
const BETFAIR_APPKEY  = process.env.BETFAIR_APPKEY;
const CLAUDE_KEY      = process.env.ANTHROPIC_API_KEY;
const PORT            = process.env.PORT || 3001;

// ── PROXY para Betfair API ──────────────────────────
app.post('/api/betfair/:endpoint', async (req, res) => {
  try {
    const r = await axios.post(
      `https://api.betfair.com/exchange/betting/rest/v1.0/${req.params.endpoint}/`,
      req.body,
      { headers: {
          'X-Authentication': BETFAIR_SESSION,
          'X-Application':    BETFAIR_APPKEY,
          'Content-Type':     'application/json'
      }}
    );
    res.json(r.data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Proxy para Claude AI ────────────────────────────
app.post('/api/analyze', async (req, res) => {
  try {
    const r = await axios.post(
      'https://api.anthropic.com/v1/messages',
      req.body,
      { headers: {
          'x-api-key': CLAUDE_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
      }}
    );
    res.json(r.data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Health check ────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'BetfairShot Bot activo ✅',
    time: new Date().toISOString(),
    betfair: BETFAIR_SESSION ? 'Conectado' : 'Sin credenciales',
    claude: CLAUDE_KEY ? 'Conectado' : 'Sin API key'
  });
});

// ── Scan automático cada 2 horas ────────────────────
cron.schedule('0 */2 * * *', () => {
  console.log('[BOT] Scan automático Betfair -', new Date().toLocaleString('es-ES'));
});

app.listen(PORT, () => {
  console.log(`BetfairShot corriendo en puerto ${PORT}`);
});
