
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const { getTokenData } = require("./data");
const { getTx } = require("./helius");
const { analyze } = require("./engine");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const SENT = new Set();

async function scan(){
  console.log("Scanning V10...");

  try{
    const res = await axios.get("https://api.dexscreener.com/latest/dex/search/?q=SOL");
    const pairs = res.data?.pairs || [];

    for(const p of pairs.slice(0, 40)){
      const token = p.baseToken?.address;
      if(!token || SENT.has(token)) continue;

      const data = await getTokenData(token);
      if(!data) continue;

      if(data.liquidity < 800) continue;

      const txs = await getTx(token);
      const result = analyze(data, txs);

      if(result.score >= 7){
        const msg = `
🚀 V10 SNIPER ALERT

🪙 ${token}

💰 MCAP: $${Math.round(data.mcap)}
💧 LIQ: $${Math.round(data.liquidity)}
📊 VOL: $${Math.round(data.volume)}

🎯 SNIPERS: ${result.snipers}
🧠 SMART WALLETS: ${result.smartWallets}

🧪 LIQ EVENT: ${result.liquidityFresh ? "YES" : "NO"}
📈 VOLUME SPIKE: ${result.volumeSpike ? "YES" : "NO"}

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

💰 MCAP: $${Math.round(data.mcap)}
💧 LIQ: $${Math.round(data.liquidity)}
📊 VOL: $${Math.round(data.volume)}

🎯 SNIPERS: ${result.snipers}
🧠 SMART WALLETS: ${result.smartWallets}

⭐ SCORE: ${result.score}

📊 ${result.verdict}
`);
});
