
function analyze(overview, txs){

  const liq = Number(overview?.liquidity || 0);
  const vol = Number(overview?.volume24h || 0);

  const early = txs.slice(0,30);
  const wallets = new Set();

  early.forEach(tx=>{
    tx.tokenTransfers?.forEach(t=>{
      if(t.toUserAccount) wallets.add(t.toUserAccount);
    });
  });

  const snipers = wallets.size;

  let score = 0;

  if(liq > 1500) score += 2;
  if(vol > 5000) score += 2;
  if(snipers > 10) score += 2;
  if(snipers < 5) score += 1;

  let verdict = "SKIP";
  if(score >= 5) verdict = "🔥 STRONG";
  else if(score >= 3) verdict = "⚠️ WATCH";

  return { snipers, score, verdict };
}

module.exports = { analyze };
