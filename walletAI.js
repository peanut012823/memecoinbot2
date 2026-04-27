
const WALLET_DB = {};

function updateWallets(wallets){
  wallets.forEach(w => {
    if(!WALLET_DB[w]){
      WALLET_DB[w] = { seen: 0, tokens: 0, score: 0 };
    }
    WALLET_DB[w].seen += 1;
    WALLET_DB[w].tokens += 1;
    WALLET_DB[w].score = WALLET_DB[w].seen * 2;
    if(WALLET_DB[w].tokens > 10){
      WALLET_DB[w].score -= 5;
    }
  });
}

function getSmartWallets(wallets){
  return wallets.filter(w => {
    const d = WALLET_DB[w];
    return d && d.score >= 5;
  });
}

module.exports = { updateWallets, getSmartWallets };
