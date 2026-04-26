
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const { getTokenData } = require("./data");
const { getTx } = require("./helius");
const { analyze } = require("./engine");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const SENT = new Set();

async function scan(){
  console.log("Scanning...");

  try{
    const res = await axios.get("https://api.dexscreener.com/latest/dex/pairs/solana");
    const pairs = res.data?.pairs || [];

    for(const p of pairs.slice(0, 40)){
      const token = p.baseToken?.address;
      if(!token || SENT.has(token)) continue;

      const data = await getTokenData(token);
      if(!data) continue;

      if(data.liquidity < 800) continue;

      const txs = await getTx(token);
      const result = analyze(data, txs);

      if(result.score >= 6){
        const msg = `
🚀 SNIPER ALERT

🪙 ${token}

💧 LIQ: $${Math.round(data.liquidity)}
📊 VOL: $${Math.round(data.volume)}

🎯 SNIPERS: ${result.snipers}
⭐ SCORE: ${result.score}

🔥 ${result.verdict}

📊 https://dexscreener.com/solana/${token}
`;

        bot.sendMessage(process.env.CHAT_ID, msg);

        SENT.add(token);
        setTimeout(()=>SENT.delete(token), 600000);
      }
    }

  }catch(e){
    console.log("SCAN ERROR", e.message);
  }
}

setInterval(scan, 30000);

bot.on("message", async (msg)=>{
  const text = msg.text?.trim();
  if(!text || text.startsWith("/")) return;

  const regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  if(!regex.test(text)) return;

  const data = await getTokenData(text);
  if(!data) return bot.sendMessage(msg.chat.id, "❌ No data");

  const txs = await getTx(text);
  const result = analyze(data, txs);

  bot.sendMessage(msg.chat.id, `
🪙 ${text}

💧 LIQ: $${Math.round(data.liquidity)}
📊 VOL: $${Math.round(data.volume)}

🎯 SNIPERS: ${result.snipers}
⭐ SCORE: ${result.score}

📊 ${result.verdict}
`);
});
