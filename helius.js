
const axios = require("axios");

async function getTx(token){
  try{
    const res = await axios.get(
      `https://api.helius.xyz/v0/addresses/${token}/transactions?api-key=${process.env.HELIUS_API_KEY}`
    );
    return res.data || [];
  }catch{
    return [];
  }
}

module.exports = { getTx };
