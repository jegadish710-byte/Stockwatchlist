const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let watchlist = [];

// Get all stocks
app.get("/api/stocks", (req, res) => {
  res.json(watchlist);
});

// Add a stock
app.post("/api/stocks", (req, res) => {
  const { ticker } = req.body;
  if (!ticker) return res.status(400).json({ error: "Ticker is required" });
  watchlist.push(ticker.toUpperCase());
  res.json({ message: "Stock added", watchlist });
});

// Remove a stock
app.delete("/api/stocks/:ticker", (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  watchlist = watchlist.filter(stock => stock !== ticker);
  res.json({ message: "Stock removed", watchlist });
});

// Mock stock details
app.get("/api/quote/:symbol", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  // Static dummy data
  const mockData = {
    AAPL: {
      symbol: "AAPL",
      price: 175.50,
      change: 1.25,
      changePercent: "0.72%",
      previousClose: 174.25,
      volume: 98234100,
      latestTradingDay: "2025-09-26",
    },
    TSLA: {
      symbol: "TSLA",
      price: 245.30,
      change: -2.15,
      changePercent: "-0.87%",
      previousClose: 247.45,
      volume: 65321400,
      latestTradingDay: "2025-09-26",
    },
    INFY: {
      symbol: "INFY",
      price: 1550.75,
      change: 5.60,
      changePercent: "0.36%",
      previousClose: 1545.15,
      volume: 12003450,
      latestTradingDay: "2025-09-26",
    },
  };

  res.json(mockData[symbol] || {
    symbol,
    price: 100.00,
    change: 0.00,
    changePercent: "0%",
    previousClose: 100.00,
    volume: 0,
    latestTradingDay: "2025-09-26",
  });
});



// Start server
app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));
