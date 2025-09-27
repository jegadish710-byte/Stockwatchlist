import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import "./App.css";

const API_BASE = "http://localhost:5000";

function Home() {
  const [stocks, setStocks] = useState([]);
  const [ticker, setTicker] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE}/api/stocks`)
      .then(r => setStocks(r.data))
      .catch(console.error);
  }, []);

  const addStock = async () => {
    if (!ticker.trim()) return;
    const res = await axios.post(`${API_BASE}/api/stocks`, { ticker });
    setStocks(res.data.watchlist);
    setTicker("");
  };

  const removeStock = async (t) => {
    const res = await axios.delete(`${API_BASE}/api/stocks/${t}`);
    setStocks(res.data.watchlist);
  };

  const goToDetails = (t) => navigate(`/stock/${t}`);

  return (
    <div className="app">
      <header className="header">
        <span className="badge">📈 Stock Watchlist</span>
        <h1 className="title">Track Your Favorite Tickers</h1>
        <p className="sub">Click a ticker to see details.</p>
      </header>

      <div className="card">
        <div className="form">
          <input
            className="input"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Enter stock ticker (e.g., AAPL)"
            onKeyDown={(e) => e.key === "Enter" && addStock()}
          />
          <button className="btn" onClick={addStock}>Add to Watchlist</button>
        </div>

        <ul className="list">
          {stocks.length === 0 && <li className="sub">No stocks yet — add one above.</li>}
          {stocks.map((s, i) => (
            <li key={i} className="chip">
              <button className="linklike" onClick={() => goToDetails(s)}>{s}</button>
              <button className="x" onClick={() => removeStock(s)}>×</button>
            </li>
          ))}
        </ul>

        <div className="footer">Backend connected at {API_BASE}</div>
      </div>
    </div>
  );
}

function StockDetail() {
  const { symbol } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/quote/${symbol}`);
        setData(res.data);
      } catch (e) {
        setErr("Could not load quote. Try again.");
      }
    })();
  }, [symbol]);

  if (err) return <div className="app"><p className="sub">{err}</p></div>;
  if (!data) return <div className="app"><p className="sub">Loading {symbol}…</p></div>;

  const isUp = (data.change ?? 0) >= 0;

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="badge">← Back to Watchlist</Link>
        <h1 className="title">{data.symbol}</h1>
        <p className="sub">{data.latestTradingDay || ""}</p>
      </header>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div style={{ fontSize: 42, fontWeight: 800 }}>
              ₹{Number(data.price || 0).toFixed(2)}
            </div>
            <div className={isUp ? "chg up" : "chg down"}>
              {isUp ? "▲" : "▼"} {Number(data.change || 0).toFixed(2)} ({data.changePercent})
            </div>
          </div>
          <div className="mini">
            <div>Prev Close: <strong>₹{Number(data.previousClose || 0).toFixed(2)}</strong></div>
            <div>Volume: <strong>{data.volume?.toLocaleString?.() || data.volume}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stock/:symbol" element={<StockDetail />} />
    </Routes>
  );
}
