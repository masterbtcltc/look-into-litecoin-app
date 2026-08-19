#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime, timezone
import re

def extract_numbers(text):
    """Extract all numbers (with commas) from text"""
    return [float(x.replace(",", "")) for x in re.findall(r"[\d,]+\.?\d*", text)]

def main():
    url = "https://bitinfocharts.com/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    print("Fetching BitInfoCharts...")
    resp = requests.get(url, headers=headers, timeout=30)
    resp.raise_for_status()
    html = resp.text
    soup = BeautifulSoup(html, "html.parser")

    data = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "source": "https://bitinfocharts.com/",
        "btc": {},
        "ltc": {},
        "doge": {}
    }

    # ---------- Transactions last 24h ----------
    # Look for the text "Transactions last 24h" and grab nearby numbers
    page_text = soup.get_text(" ", strip=True)

    # Find the section around "Transactions last 24h"
    match = re.search(
        r"Transactions last 24h.*?(\d[\d,]+).*?(\d[\d,]+).*?(\d[\d,]+).*?(\d[\d,]+).*?(\d[\d,]+).*?(\d[\d,]+)",
        page_text,
        re.IGNORECASE | re.DOTALL
    )

    if match:
        # Order is normally: BTC, ETH, XRP, LTC, BCH, DOGE
        nums = [int(x.replace(",", "")) for x in match.groups()]
        data["btc"]["tx_24h"] = nums[0]
        data["ltc"]["tx_24h"] = nums[3]
        data["doge"]["tx_24h"] = nums[5]
        print(f"Found tx counts: BTC={nums[0]}, LTC={nums[3]}, DOGE={nums[5]}")
    else:
        raise Exception("Could not find Transactions last 24h numbers")

    # ---------- Median Transaction Value (USD) ----------
    # Look for median values with $ signs
    match = re.search(
        r"Median Transaction Value.*?\$([\d,.]+).*?\$([\d,.]+).*?\$([\d,.]+).*?\$([\d,.]+).*?\$([\d,.]+)",
        page_text,
        re.IGNORECASE | re.DOTALL
    )

    if match:
        # Order is normally: BTC, ETH, LTC, BCH, DOGE
        usd_values = [float(x.replace(",", "")) for x in match.groups()]
        data["btc"]["median_usd"] = usd_values[0]
        data["ltc"]["median_usd"] = usd_values[2]
        data["doge"]["median_usd"] = usd_values[4]
        print(f"Found median USD: BTC=${usd_values[0]}, LTC=${usd_values[2]}, DOGE=${usd_values[4]}")
    else:
        raise Exception("Could not find Median Transaction Value numbers")

    # Final check
    for coin in ["btc", "ltc", "doge"]:
        if "tx_24h" not in data[coin] or "median_usd" not in data[coin]:
            raise Exception(f"Missing data for {coin}")

    with open("metrics.json", "w") as f:
        json.dump(data, f, indent=2)

    print("\nSuccessfully wrote metrics.json")
    print(json.dumps(data, indent=2))

if __name__ == "__main__":
    main()
