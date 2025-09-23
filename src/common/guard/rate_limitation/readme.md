# Rate Limiting Approaches Comparison

This document compares different approaches for implementing rate limiting in a NestJS project.

---

## Sliding Window (Current Guard)

**How it works:**  
Tracks requests over a rolling window of time in Redis. Each request is counted, and if the number of requests exceeds `maxRate` within `windowMillisecond`, it is blocked.

**Pros:**  
- Smooth request limiting, avoids spikes at window boundaries.  
- Works well for small to medium traffic.  
- Easy to implement with Redis.

**Cons:**  
- Requires Redis.  
- Slightly more complex than fixed window.  
- Needs tuning for `maxRate` and `windowMillisecond`.

**Use Case:**  
APIs where fair request distribution over time is needed and bursts should be minimized.

---

## Fixed Window

**How it works:**  
Counts requests in fixed time intervals (e.g., per minute). Resets at the end of each window.

**Pros:**  
- Simple to implement.  
- Easy to understand.  
- Can work without external storage for very small projects.

**Cons:**  
- Can allow bursts at the edges of windows.  
- Less smooth than sliding window.

**Use Case:**  
Low-traffic APIs or simple rate-limiting needs.

---

## Token Bucket

**How it works:**  
Each client has a bucket of tokens. Each request consumes a token, and tokens are replenished at a fixed rate.

**Pros:**  
- Allows short bursts of requests.  
- Smooth rate-limiting over time.  
- Flexible for variable traffic patterns.

**Cons:**  
- More complex to implement.  
- Requires storage (Redis) for distributed systems.

**Use Case:**  
High-traffic APIs where short bursts are acceptable.

---

## Leaky Bucket

**How it works:**  
Requests enter a “bucket” and leak out at a steady rate. Excess requests are dropped.

**Pros:**  
- Smooths bursts efficiently.  
- Easy to enforce strict request rates.

**Cons:**  
- Can be complex in distributed setups.  
- Less flexible for sudden traffic spikes.

**Use Case:**  
High-frequency traffic in real-time systems where strict rate control is needed.

---

**Note:**  
For our NestJS project, the **Sliding Window Guard** is currently preferred due to its balance of simplicity and smooth request handling. Tuning `maxRate` and `windowMillisecond` allows adjusting limits based on API usage patterns.
