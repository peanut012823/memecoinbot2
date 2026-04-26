
function analyze(data, txs){

  const liq = data?.liquidity || 0;
  const vol = data?.volume || 0;

  const early = txs.slice(0, 30);
  const wallets = new Set();

  early.forEach(tx=>{
    tx.tokenTransfers?.forEach(t=>{
      if(t.toUserAccount) wallets.add(t.toUserAccount);
    });
  });

  const snipers = wallets.size;

  let score = 0;

  if(liq > 1000) score += 2;
  if(liq > 5000) score += 1;

  if(vol > 3000) score += 1;
  if(vol > 10000) score += 2;

  if(snipers > 5) score += 1;
  if(snipers > 15) score += 2;
  if(snipers > 40) score -= 2;

  if(liq < 500) score -= 3;
  if(vol < 1000) score -= 2;

  let verdict = "❌ SKIP";

  if(score >= 6) verdict = "🔥 STRONG BUY";
  else if(score >= 4) verdict = "⚠️ WATCH";
  else if(score >= 2) verdict = "🤔 LOW";

  return { snipers, score, verdict };
}

module.exports = { analyze };
