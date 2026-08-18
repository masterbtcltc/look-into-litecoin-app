const BTC_UP_COLOR = "yellow";
const BTC_DOWN_COLOR = "#00A0FF";

const LTC_UP_COLOR = "yellow";
const LTC_DOWN_COLOR = "#00A0FF";

const ETH_UP_COLOR = "yellow";
const ETH_DOWN_COLOR = "#00A0FF";

const DOGE_UP_COLOR = "yellow";
const DOGE_DOWN_COLOR = "#00A0FF";

let lastLTCPrice = null;
let lastBTCPrice = null;
let lastETHPrice = null;
let lastDOGEPrice = null;

let lastRatioBTCtoLTC = null;
let lastRatioLTCtoBTC = null;
let lastRatioETHtoLTC = null;
let lastRatioLTCtoETH = null;
let lastRatioDOGEtoLTC = null;
let lastRatioLTCtoDOGE = null;

function addCommas(num) {
  const str = num.toString();
  if (str.includes(".")) {
    const [intPart, decPart] = str.split(".");
    return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "." + decPart;
  } else {
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

function formatBTCPrice(price) {
  return Math.round(price).toString();
}
function formatLTCPrice(price) {
  return price.toFixed(2);
}
function formatETHPrice(price) {
  return Math.round(price).toString();
}
function formatDOGEPrice(price) {
  return price.toFixed(4);
}

async function fetchPrices() {
  try {
    const [ltcRes, btcRes, ethRes, dogeRes] = await Promise.all([
      fetch("https://api.coinbase.com/v2/prices/LTC-USD/spot"),
      fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot"),
      fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot"),
      fetch("https://api.coinbase.com/v2/prices/DOGE-USD/spot"),
    ]);

    const ltcPrice = parseFloat((await ltcRes.json()).data.amount);
    const btcPrice = parseFloat((await btcRes.json()).data.amount);
    const ethPrice = parseFloat((await ethRes.json()).data.amount);
    const dogePrice = parseFloat((await dogeRes.json()).data.amount);

    const ltcDisplay = formatLTCPrice(ltcPrice);
    const btcDisplay = formatBTCPrice(btcPrice);
    const ethDisplay = formatETHPrice(ethPrice);
    const dogeDisplay = formatDOGEPrice(dogePrice);

    const ltcElem = document.getElementById("ltc-price");
    const btcElem = document.getElementById("btc-price");
    const ethElem = document.getElementById("eth-price");
    const dogeElem = document.getElementById("doge-price");

    const btcLtcElem = document.getElementById("btc-ltc-ratio");
    const ltcBtcElem = document.getElementById("ltc-btc-ratio");
    const ethLtcElem = document.getElementById("eth-ltc-ratio");
    const ltcEthElem = document.getElementById("ltc-eth-ratio");
    const dogeLtcElem = document.getElementById("doge-ltc-ratio");
    const ltcDogeElem = document.getElementById("ltc-doge-ratio");

    ltcElem.textContent = `$${addCommas(ltcDisplay)} LTC`;
    btcElem.textContent = `$${addCommas(btcDisplay)} BTC`;
    ethElem.textContent = `$${addCommas(ethDisplay)} ETH`;
    dogeElem.textContent = `$${dogeDisplay} DOGE`;

    const ratioBTCtoLTC = (btcPrice / ltcPrice).toFixed(0);
    const ratioLTCtoBTC = (ltcPrice / btcPrice).toFixed(6);
    const ratioETHtoLTC = (ethPrice / ltcPrice).toFixed(2);
    const ratioLTCtoETH = (ltcPrice / ethPrice).toFixed(6);
    const ratioDOGEtoLTC = (dogePrice / ltcPrice).toFixed(8);
    const ratioLTCtoDOGE = (ltcPrice / dogePrice).toFixed(0);

    btcLtcElem.textContent = `${ratioBTCtoLTC} BTCLTC`;
    ltcBtcElem.textContent = `${ratioLTCtoBTC} LTCBTC`;
    ethLtcElem.textContent = `${ratioETHtoLTC} ETHLTC`;
    ltcEthElem.textContent = `${ratioLTCtoETH} LTCETH`;
    dogeLtcElem.textContent = `${ratioDOGEtoLTC} DOGELTC`;
    ltcDogeElem.textContent = `${ratioLTCtoDOGE} LTCDOGE`;

    if (lastLTCPrice !== null) {
      ltcElem.style.color =
        parseFloat(ltcDisplay) > parseFloat(lastLTCPrice) ? LTC_UP_COLOR : LTC_DOWN_COLOR;
    }
    lastLTCPrice = ltcDisplay;

    if (lastBTCPrice !== null) {
      btcElem.style.color =
        parseFloat(btcDisplay) > parseFloat(lastBTCPrice) ? BTC_UP_COLOR : BTC_DOWN_COLOR;
    }
    lastBTCPrice = btcDisplay;

    if (lastETHPrice !== null) {
      ethElem.style.color =
        parseFloat(ethDisplay) > parseFloat(lastETHPrice) ? ETH_UP_COLOR : ETH_DOWN_COLOR;
    }
    lastETHPrice = ethDisplay;

    if (lastDOGEPrice !== null) {
      dogeElem.style.color =
        parseFloat(dogeDisplay) > parseFloat(lastDOGEPrice) ? DOGE_UP_COLOR : DOGE_DOWN_COLOR;
    }
    lastDOGEPrice = dogeDisplay;

    if (lastRatioBTCtoLTC !== null) {
      // BTCLTC: up = blue, down = yellow
      btcLtcElem.style.color =
        parseFloat(ratioBTCtoLTC) > parseFloat(lastRatioBTCtoLTC) ? "#00A0FF" : "yellow";
    }
    lastRatioBTCtoLTC = ratioBTCtoLTC;

    if (lastRatioLTCtoBTC !== null) {
      ltcBtcElem.style.color =
        parseFloat(ratioLTCtoBTC) > parseFloat(lastRatioLTCtoBTC) ? LTC_UP_COLOR : LTC_DOWN_COLOR;
    }
    lastRatioLTCtoBTC = ratioLTCtoBTC;

    if (lastRatioETHtoLTC !== null) {
      // ETHLTC: up = blue, down = yellow
      ethLtcElem.style.color =
        parseFloat(ratioETHtoLTC) > parseFloat(lastRatioETHtoLTC) ? "#00A0FF" : "yellow";
    }
    lastRatioETHtoLTC = ratioETHtoLTC;

    if (lastRatioLTCtoETH !== null) {
      ltcEthElem.style.color =
        parseFloat(ratioLTCtoETH) > parseFloat(lastRatioLTCtoETH) ? LTC_UP_COLOR : LTC_DOWN_COLOR;
    }
    lastRatioLTCtoETH = ratioLTCtoETH;

    if (lastRatioDOGEtoLTC !== null) {
      dogeLtcElem.style.color =
        parseFloat(ratioDOGEtoLTC) > parseFloat(lastRatioDOGEtoLTC) ? "#00A0FF" : "yellow";
    }
    lastRatioDOGEtoLTC = ratioDOGEtoLTC;

    if (lastRatioLTCtoDOGE !== null) {
      ltcDogeElem.style.color =
        parseFloat(ratioLTCtoDOGE) > parseFloat(lastRatioLTCtoDOGE) ? LTC_UP_COLOR : LTC_DOWN_COLOR;
    }
    lastRatioLTCtoDOGE = ratioLTCtoDOGE;

  } catch (error) {
    console.error("Error fetching prices:", error);
    [
      "ltc-price",
      "btc-price",
      "eth-price",
      "doge-price",
      "btc-ltc-ratio",
      "ltc-btc-ratio",
      "eth-ltc-ratio",
      "ltc-eth-ratio",
      "doge-ltc-ratio",
      "ltc-doge-ratio"
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = `Error`;
        el.style.color = "red";
      }
    });
  }
}

// Fetch every 5 seconds to avoid rate limits
fetchPrices();
setInterval(fetchPrices, 1000);
