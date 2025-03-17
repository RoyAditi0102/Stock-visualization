import { useEffect, useState } from "react";
import { fetchStockData } from "./utils/api";
import Chart from "./components/Chart";
import backgroundImage from "./assets/trading-bg.webp"
function App() {
    const [stockData, setStockData] = useState([]);

    useEffect(() => {
        fetchStockData("TSLA")
            .then(data => {
                console.log("Fetched Data:", data);

                // ✅ Check if data is already in the correct array format
                if (Array.isArray(data)) {
                    setStockData(data.reverse()); // Ensure chronological order
                } else {
                    console.error("Invalid API Response:", data);
                }
            })
            .catch(error => console.error("API Fetch Error:", error));
    }, []);

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            color: "#fff",
            fontFamily: "Arial, sans-serif",
        }}>
            <h1 style={{
    fontSize: "32px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "20px",
    padding: "12px 20px",
    background: "rgba(0, 0, 0, 0.5)",  // Semi-transparent dark theme
    color: "#ff758c",  // Pink text for vibrant contrast
    textShadow: `
        0px 0px 8px rgba(0, 0, 0, 0.9),   /* Strong black neon glow */
        0px 0px 15px rgba(0, 0, 0, 0.7),  /* Extended black blur */
        0px 0px 25px rgba(0, 0, 0, 0.5)   /* Softer outer glow */
    `,
    borderRadius: "10px",
    display: "inline-block",
}}>
    Stock Price Visualization
</h1>
<p></p>
            <Chart data={stockData} />
        </div>
    );
}

export default App;
