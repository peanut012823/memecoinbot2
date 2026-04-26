
const axios = require("axios");

const API = "https://solana-gateway.moralis.io";
const KEY = process.env.MORALIS_API_KEY;

async function getNewTokens(){
  try{
    const res = await axios.get(`${API}/token/mainnet/trending`, {
      headers: { "X-API-Key": KEY }
    });
    return res.data?.result || [];
  }catch{
    return [];
  }
}

async function getTokenOverview(token){
  try{
    const res = await axios.get(`${API}/token/mainnet/${token}`, {
      headers: { "X-API-Key": KEY }
    });
    return res.data;
  }catch{
    return null;
  }
}

module.exports = { getNewTokens, getTokenOverview };
