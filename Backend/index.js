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

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let users = []; // temporary in-memory store

// Register user
app.post("/api/users/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  // check if user already exists
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: "User already exists" });
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // store user
  const user = { id: Date.now(), username, password: hashedPassword };
  users.push(user);

  res.json({ message: "User registered successfully" });
});

// Login user
app.post("/api/users/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  // create token
  
  const token = jwt.sign({ id: user.id, username: user.username }, "secretkey", {
    expiresIn: "1h",
  });

  res.json({ message: "Login successful", token });
});

// Protected route (profile)

app.get("/api/users/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "secretkey");
    res.json({ message: "Profile data", user: decoded });
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
});



// Start server
app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));
