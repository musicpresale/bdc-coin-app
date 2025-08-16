import { kv } from '@vercel/kv';

const DATA_KEY = 'simulasi-bdc-data';

// Inisialisasi data default
async function getData() {
  let data = await kv.get(DATA_KEY);
  if (!data) {
    data = {
      price: 0.0075,
      circulatingSupply: 100000000,
      tradeVolume: 0,
      userUSD: 1000,
      userBDC: 0,
      log: []
    };
    await kv.set(DATA_KEY, data);
  }
  return data;
}

export default async function handler(req, res) {
  let data = await getData();

  if (req.method === 'GET') {
    res.status(200).json(data);
    return;
  }

  if (req.method === 'POST') {
    const { type, usd, koin, transaksi } = req.body;

    if (type === 'buy') {
      data.userUSD -= usd;
      data.userBDC += koin;
      data.circulatingSupply += koin;
      data.tradeVolume += usd;
    } else if (type === 'sell') {
      data.userUSD += usd;
      data.userBDC -= koin;
      data.circulatingSupply -= koin;
      data.tradeVolume += usd;
    }

    data.log.unshift({ ...transaksi, waktu: new Date() });
    if (data.log.length > 100) data.log.pop(); // batasi log

    await kv.set(DATA_KEY, data);
    res.status(200).json(data);
    return;
  }

  res.status(405).send('Method Not Allowed');
}
