#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime, timezone
import re

def clean_number(text):
    """Remove commas and extract the first number"""
    if not text:
        return None
    text = text.replace(",", "").strip()
    match = re.search(r"[\d.]+", text)
    return float(match.group()) if match else None

def extract_usd(text):
    """Extract the USD value from something like '0.0011 BTC ($69.18)'"""
    match = re.search(r"\$([\d,.]+)", text)
    if match:
        return float(match.group(1).replace(",", ""))
    return None

def main():
    url = "https://bitinfocharts.com/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    print("Fetching BitInfoCharts...")
    resp = requests.get(url, headers=headers, timeout=30)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    # The main stats are in a big table. We look for the rows by text.
    data = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "source": "https://bitinfocharts.com/",
        "btc": {},
        "ltc": {},
        "doge": {}
    }

    # ---------- Transactions last 24h ----------
    # Find the row that contains "Transactions last 24h"
    for tr in soup.find_all("tr"):
        cells = tr.find_all(["td", "th"])
        if not cells:
            continue
        first_cell = cells[0].get_text(strip=True)

        if "Transactions last 24h" in first_cell:
            # Order on the page is usually: BTC, ETH, XRP, LTC, BCH, DOGE
            # We take the 1st (BTC), 4th (LTC), 6th (DOGE)
            nums = []
            for cell in cells[1:]:
                n = clean_number(cell.get_text())
                if n is not None:
                    nums.append(n)
            if len(nums) >= 6:
                data["btc"]["tx_24h"] = int(nums[0])
                data["ltc"]["tx_24h"] = int(nums[3])
                data["doge"]["tx_24h"] = int(nums[5])
            break

    # ---------- Median Transaction Value ----------
    for tr in soup.find_all("tr"):
        cells = tr.find_all(["td", "th"])
        if not cells:
            continue
        first_cell = cells[0].get_text(strip=True)

        if "Median Transaction Value" in first_cell:
            # Same column order
            usd_values = []
            for cell in cells[1:]:
                usd = extract_usd(cell.get_text())
                if usd is not None:
                    usd_values.append(usd)
            if len(usd_values) >= 5:   # BTC, ETH, LTC, BCH, DOGE
                data["btc"]["median_usd"] = usd_values[0]
                data["ltc"]["median_usd"] = usd_values[2]
                data["doge"]["median_usd"] = usd_values[4]
            break

    # Safety check
    required = ["tx_24h", "median_usd"]
    for coin in ["btc", "ltc", "doge"]:
        for key in required:
            if key not in data[coin]:
                raise Exception(f"Failed to extract {coin}.{key}")

    # Write the file
    with open("metrics.json", "w") as f:
        json.dump(data, f, indent=2)

    print("Successfully wrote metrics.json")
    print(json.dumps(data, indent=2))

if __name__ == "__main__":
    main()
