
const WALLET_MEMORY = new Map();

function trackWallets(wallets){
  wallets.forEach(w => {
    WALLET_MEMORY.set(w, (WALLET_MEMORY.get(w) || 0) + 1);
  });
}

function getRepeatWallets(wallets){
  return wallets.filter(w => WALLET_MEMORY.get(w) > 2);
}

module.exports = { trackWallets, getRepeatWallets };
