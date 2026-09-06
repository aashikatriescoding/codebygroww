# SHIFT — Signals That Matter

Shift is a smart market watchlist designed to answer one question:

> **What meaningfully changed since I last checked?**

Traditional watchlists show prices and percentage changes, but users still have to manually scan everything to understand what deserves attention.

Shift detects unusual changes, ranks them by importance, and explains why they matter.

## 🚀 Live Demo

https://shift-two-kappa.vercel.app/

## 🎥 Demo

https://drive.google.com/file/d/1H5OOM89CjxO95T7EMl5w0hGxnbz9thbF/view?usp=sharing


## 💡 What Makes Shift Different

Shift does not use a single fixed percentage threshold for every stock.

Instead, each stock gets its own normal volatility baseline based on its recent price history.

A stock can be flagged when:

- Its movement exceeds 2.5× its normal volatility
- It reaches a 52-week high or low
- It shows unusual volume activity

These signals are combined into an attention score so the most important stocks appear first.

This means Shift focuses on **unusual movement**, rather than simply large movement.

---

## 🧠 Core Features

### Since Last Checked

Shift stores the last-seen price and timestamp for each watchlist item.

When the user returns, the current market state is compared with the stored state to determine what changed.

### Adaptive Significance

Each stock has its own volatility baseline calculated from recent seven-day price history.

This avoids using the same threshold for stocks with completely different volatility patterns.

### Attention Score

Multiple signals are combined to rank stocks by how much attention they deserve.

### Quiet State

If nothing meaningful changed, Shift explicitly tells the user:

**"Nothing meaningful changed."**

Instead of generating unnecessary alerts, the application reassures the user that their watchlist remained within its normal range.

### AI Explanations

The backend calculates the actual market signals first.

AI is then used to explain those trusted signals in simple language.

> **The algorithm decides what happened; AI explains it.**

### Resilient Market Data

Market data can be delayed or unavailable.

Shift uses:

- Short-lived quote caching
- Persisted price snapshots
- Last-known-value fallback
- Explicit stale-data indicators

This prevents outdated data from being silently presented as live.

### Multiple Watchlists

Users can create and manage multiple named watchlists and maintain separate stocks and state.

### Markets & News

Shift also provides market information and finance-focused news alongside the personalized watchlist.

### CSV Export

Users can export their complete watchlist and its calculated signals as a CSV file.

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      React + Vite    │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Node + Express    │
                    │      Backend API     │
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   Market Data Service   Significance Service   AI Service
          │                    │                    │
          ▼                    ▼                    ▼
    Yahoo Finance        Volatility Engine        Groq
          │
          ▼
    Price Snapshots
          │
          ▼
    MongoDB Atlas
