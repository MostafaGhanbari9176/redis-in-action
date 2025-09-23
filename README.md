# redis-in-action 🚀

A hands-on backend lab showcasing real-world Redis use cases—from OTP storage and caching to search indexing, queues, and analytics. Built with Node.js and powered by [ioredis](https://github.com/luin/ioredis).

## 🔧 What This Repo Covers

This sandbox demonstrates how Redis can power scalable backend systems using its diverse data types and modules:

### 🔐 Authentication & Security

- OTP storage with expiry — ✅ Implemented
- Rate limiting & API throttling — 🛠️ Coming Soon
- Distributed locks (Redlock) — 🛠️ Coming Soon

### 🧠 Caching & Sessions
- Session management (user sessions, tokens) — 🛠️ Coming Soon
- API response caching with invalidation — 🛠️ Coming Soon

### 📊 Analytics & Metrics
- Bitmaps for user activity tracking (daily/weekly active users, streaks) — 🛠️ Coming Soon
- HyperLogLog for unique counts (e.g., unique visitors) — 🛠️ Coming Soon

### 🧩 Data Structures & Features
- Leaderboards with sorted sets — 🛠️ Coming Soon
- Autocomplete & prefix search with sorted sets — 🛠️ Coming Soon
- Delayed jobs & scheduling with sorted sets — 🛠️ Coming Soon
- Reliable task queues with lists (BRPOPLPUSH pattern) — 🛠️ Coming Soon

### 🗺️ Advanced Queries
- Geospatial queries for location-based features — 🛠️ Coming Soon
- Full-text search with RediSearch — 🛠️ Coming Soon

### 🔄 Messaging & Event Processing
- Pub/Sub for lightweight real-time messaging — 🛠️ Coming Soon
- Streams for event sourcing, messaging, and logs — 🛠️ Coming Soon

## 🚀 Getting Started

```bash
git clone git@github.com:MostafaGhanbari9176/redis-in-action.git
cd redis-in-action
npm install
docker run -dp 6379:6379 redis
npm start
```
## 📚 Why Redis?
Redis is more than a cache. It’s a versatile data engine that powers search engines, analytics platforms, messaging systems, and real-time applications. This repo shows how to harness its full potential in backend development.

## 🛠 Tech Stack
- Node.js
- ioredis

