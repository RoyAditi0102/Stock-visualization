const API_KEY = "f5f2ebbe19d44ecfa268f27f17617f24";  
const BASE_URL = "https://api.twelvedata.com/time_series";

export const fetchStockData = async (symbol = "TSLA") => {
    const cacheKey = `stockData_${symbol}`;
    const cacheExpiration = 5 * 60 * 1000; // Cache for 5 minutes

    // Check if cached data exists & is still valid
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(`${cacheKey}_time`);

    if (cachedData && cachedTime && Date.now() - cachedTime < cacheExpiration) {
        console.log("Using cached stock data");
        return JSON.parse(cachedData);
    }

    try {
        const response = await fetch(`${BASE_URL}?symbol=${symbol}&interval=1day&apikey=${API_KEY}`);
        const data = await response.json();

        if (data.values) {
            const formattedData = data.values.map(entry => ({
                date: entry.datetime,
                open: parseFloat(entry.open),
                high: parseFloat(entry.high),
                low: parseFloat(entry.low),
                close: parseFloat(entry.close)
            })).slice(0, 30).reverse();   // Keep last 30 days, in correct order

            // Save to cache
            localStorage.setItem(cacheKey, JSON.stringify(formattedData));
            localStorage.setItem(`${cacheKey}_time`, Date.now());

            return formattedData;
        } else {
            throw new Error("Invalid API response");
        }
    } catch (error) {
        console.error("Error fetching stock data:", error);
        return [];
    }
};