import axios from "axios";

/**
 * Fetch all prelaunch markets or upcoming tokens.
 */
export async function getPrelaunchMarkets() {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/prelaunch/markets`);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch prelaunch markets:", err);
    return [];
  }
}

/**
 * Fetch detailed info for a specific prelaunch token by symbol.
 */
export async function getPrelaunchTokenInfo(tokenSymbol: string) {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/prelaunch/token/${tokenSymbol}`);
    return res.data;
  } catch (err) {
    console.error(`Failed to fetch prelaunch token info for ${tokenSymbol}:`, err);
    return null;
  }
}
