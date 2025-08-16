// api/transactions.js
let data = {
  price: 0.0075,
  circulatingSupply: 100000000,
  tradeVolume: 0,
  userUSD: 1000,
  userBDC: 0,
  log: []
};

export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json(data);
  } else if (req.method === "POST") {
    const { type, usd, koin, transaksi } = req.body;

    if (type === "buy") {
      data.userUSD -= usd;
      data.userBDC += koin;
      data.circulatingSupply += koin;
      data.tradeVolume += usd;
    } else if (type === "sell") {
      data.userUSD += usd;
      data.userBDC -= koin;
      data.circulatingSupply -= koin;
      data.tradeVolume += usd;
    }

    data.log.unshift({ ...transaksi, waktu: new Date() });
    if (data.log.length > 100) data.log.pop(); // batasi log 100
    res.status(200).json(data);
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
