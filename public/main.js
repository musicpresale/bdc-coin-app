const $ = id => document.getElementById(id);
const fmtUSD = n => n>=1 ? n.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}) : '$'+n.toFixed(8);
const fmtNum = n => n.toLocaleString('en-US');

let price = 0.0075, circulatingSupply=100000000, tradeVolume=0;
let userUSD=1000, userBDC=0;

async function fetchData(){
  const res = await fetch('/api/transactions');
  const d = await res.json();
  price = d.price; circulatingSupply=d.circulatingSupply;
  tradeVolume=d.tradeVolume; userUSD=d.userUSD; userBDC=d.userBDC;
  renderLog(d.log); updateDisplay();
}

function updateDisplay(){
  $('priceNow').textContent = fmtUSD(price);
  $('mcap').textContent = fmtUSD(price*circulatingSupply);
  $('supplyNow').textContent = fmtNum(circulatingSupply);
  $('volNow').textContent = fmtUSD(tradeVolume);
  $('userUSD').textContent = fmtUSD(userUSD);
  $('userBDC').textContent = fmtNum(userBDC)+" BDC";
}

async function userBuy(){
  const usd = parseFloat($('usdAmount').value);
  if(!usd || usd<=0 || usd>userUSD){ alert("Saldo USD tidak cukup!"); return;}
  const koin = Math.floor(usd/price);
  const transaksi = {source:'user', dir:'up', tradeUSD:usd};
  await fetch('/api/transactions',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({type:'buy', usd, koin, transaksi})});
  fetchData();
}

async function userSell(){
  const usd = parseFloat($('usdAmount').value);
  const koin = Math.min(Math.floor(usd/price), userBDC);
  if(koin<=0){ alert("Saldo BDC tidak cukup!"); return;}
  const hasilUSD = koin*price;
  const transaksi = {source:'user', dir:'down', tradeUSD:hasilUSD};
  await fetch('/api/transactions',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({type:'sell', usd:hasilUSD, koin, transaksi})});
  fetchData();
}

function renderLog(log){
  const tbody = $('logBody');
  tbody.innerHTML = '';
  log.slice(0,50).forEach((d,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${d.source}</td><td>${new Date(d.waktu).toLocaleString()}</td>
      <td class="${d.dir==='up'?'up':'down'}">${d.dir==='up'?'Naik':'Turun'}</td>
      <td>${fmtUSD(d.tradeUSD)}</td>`;
    tbody.appendChild(tr);
  });
}

// Event listeners
$('btnBuy').addEventListener('click', userBuy);
$('btnSell').addEventListener('click', userSell);

// Initial load
fetchData();
