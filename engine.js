
const { trackWallets, getRepeatWallets } = require("./memory");

function analyze(data, txs){

  const liq = data?.liquidity || 0;
  const vol = data?.volume || 0;
  const mcap = data?.mcap || 0;

  const early = txs.slice(0, 40);

  const wallets = new Set();
  early.forEach(tx=>{
    tx.tokenTransfers?.forEach(t=>{
      if(t.toUserAccount) wallets.add(t.toUserAccount);
    });
  });

  const walletList = [...wallets];
  trackWallets(walletList);

  const repeat = getRepeatWallets(walletList);

  const liquidityFresh = liq > 1000 && liq < 10000;
  const volumeSpike = vol > 5000 && vol < 50000;

  const smartWallets = repeat.length;
  const snipers = walletList.length;

  let score = 0;

  if(liquidityFresh) score += 2;
  if(volumeSpike) score += 2;

  if(snipers > 5) score += 1;
  if(snipers > 15) score += 2;
  if(snipers > 40) score -= 2;

  if(smartWallets > 2) score += 2;
  if(mcap > 8000 && mcap < 30000) score += 2;

  if(liq < 800) score -= 3;
  if(vol < 1000) score -= 2;

  let verdict = "❌ SKIP";

  if(score >= 7) verdict = "🚀 EARLY GEM";
  else if(score >= 5) verdict = "🔥 STRONG";
  else if(score >= 3) verdict = "⚠️ WATCH";

  return {
    snipers,
    smartWallets,
    score,
    verdict,
    liquidityFresh,
    volumeSpike
  };
}

module.exports = { analyze };
