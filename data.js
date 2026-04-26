
const axios = require("axios");

const MORALIS = "https://solana-gateway.moralis.io";

async function getFromMoralis(token){
  try{
    const res = await axios.get(
      `${MORALIS}/token/mainnet/${token}/pairs`,
      {
        headers: {
          "X-API-Key": process.env.MORALIS_API_KEY
        }
      }
    );

    const pairs = res.data?.result || [];
    if(!pairs.length) return null;

    pairs.sort((a,b)=>(b.liquidityUsd||0)-(a.liquidityUsd||0));

    const p = pairs[0];

    return {
      price: Number(p.priceUsd || 0),
      liquidity: Number(p.liquidityUsd || 0),
      volume: Number(p.volume24hUsd || 0)
    };

  }catch{
    return null;
  }
}

async function getFromDex(token){
  try{
    const res = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${token}`
    );

    const pairs = res.data?.pairs || [];
    if(!pairs.length) return null;

    pairs.sort((a,b)=>(b.liquidity?.usd||0)-(a.liquidity?.usd||0));

    const p = pairs[0];

    return {
      price: Number(p.priceUsd || 0),
      liquidity: Number(p.liquidity?.usd || 0),
      volume: Number(p.volume?.h24 || 0)
    };

  }catch{
    return null;
  }
}

async function getTokenData(token){
  let data = await getFromMoralis(token);

  if(!data || data.liquidity === 0){
    data = await getFromDex(token);
  }

  return data;
}

module.exports = { getTokenData };
