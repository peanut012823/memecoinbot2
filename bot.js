
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const { getNewTokens, getTokenOverview } = require("./moralis");
const { getTx } = require("./helius");
const { analyze } = require("./engine");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const SENT = new Set();

async function scan(){

  console.log("Scanning new tokens...");

  const tokens = await getNewTokens();

  for(const t of tokens){

    const token = t.address || t.tokenAddress;
    if(!token || SENT.has(token)) continue;

    const overview = await getTokenOverview(token);
    if(!overview) continue;

    const txs = await getTx(token);

    const result = analyze(overview, txs);

    if(result.score >= 5){

      const msg = `
🚀 NEW SNIPER ALERT

🪙 ${token}

💧 LIQ: $${overview.liquidity}
📊 VOL: $${overview.volume24h}

🎯 SNIPERS: ${result.snipers}
⭐ SCORE: ${result.score}

🔥 SIGNAL: ${result.verdict}

📊 https://dexscreener.com/solana/${token}
`;

      bot.sendMessage(process.env.CHAT_ID, msg);

      SENT.add(token);
      setTimeout(()=>SENT.delete(token), 600000);
    }
  }
}

setInterval(scan, 30000);

bot.on("message", async (msg)=>{
  const text = msg.text?.trim();
  if(!text || text.startsWith("/")) return;

  const regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  if(!regex.test(text)) return;

  const overview = await getTokenOverview(text);
  const txs = await getTx(text);

  const result = analyze(overview, txs);

  bot.sendMessage(msg.chat.id, `
🪙 ${text}

💧 LIQ: $${overview?.liquidity}
📊 VOL: $${overview?.volume24h}

🎯 SNIPERS: ${result.snipers}
⭐ SCORE: ${result.score}

📊 ${result.verdict}
`);
});
