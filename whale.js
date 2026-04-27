
function detectWhaleBuys(txs, smartWallets){
  const whales = [];
  for(const tx of txs.slice(0, 30)){
    for(const t of tx.tokenTransfers || []){
      const amount = Number(t.tokenAmount || 0);
      if(amount > 5000 && smartWallets.includes(t.toUserAccount)){
        whales.push({
          wallet: t.toUserAccount,
          amount
        });
      }
    }
  }
  return whales;
}
module.exports = { detectWhaleBuys };
