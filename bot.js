
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const { getTokenData } = require("./data");
const { getTx } = require("./helius");
const { updateWallets, getSmartWallets } = require("./walletAI");
const { detectWhaleBuys } = require("./whale");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

async function scan(){
  console.log("Scanning V11...");

  try{
    const res = await axios.get("https://api.dexscreener.com/latest/dex/search/?q=SOL");
    const pairs = res.data?.pairs || [];

    for(const p of pairs.slice(0, 40)){
      const token = p.baseToken?.address;
      if(!token) continue;

      const data = await getTokenData(token);
      if(!data) continue;

      const txs = await getTx(token);

      const wallets = new Set();
      txs.slice(0,40).forEach(tx=>{
        tx.tokenTransfers?.forEach(t=>{
          if(t.toUserAccount) wallets.add(t.toUserAccount);
        });
      });

      const walletList = [...wallets];
      updateWallets(walletList);
      const smartWallets = getSmartWallets(walletList);

      const whales = detectWhaleBuys(txs, smartWallets);

      if(
        data.mcap >= 10000 &&
        data.mcap <= 30000 &&
        whales.length > 0
      ){
        const whaleInfo = whales.slice(0,3)
          .map(w => `🐋 ${w.wallet.slice(0,6)}... $${Math.round(w.amount)}`)
          .join("\n");

        bot.sendMessage(process.env.CHAT_ID, `
🧠 SMART MONEY ALERT

🪙 ${data.name}
📍 ${token}

💰 MCAP: $${Math.round(data.mcap)}
💧 LIQ: $${Math.round(data.liquidity)}
📊 VOL: $${Math.round(data.volume)}

🐋 SMART WHALES:
${whaleInfo}

📊 https://dexscreener.com/solana/${token}
`);
      }
    }

  }catch(e){
    console.log("SCAN ERROR", e.message);
  }
}

setInterval(scan, 30000);
