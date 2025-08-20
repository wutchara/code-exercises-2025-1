# Problem: Transaction Rate Limiter

**Difficulty:** Medium

**Context:** 🏦
In FinTech systems, protecting against API abuse and Denial-of-Service attacks is crucial. A fundamental defense mechanism is a **Rate Limiter**, which restricts the number of requests a user can make within a specified time frame.

You are tasked with building a rate limiter for a transaction processing API. Its purpose is to prevent a single user from submitting transactions too frequently, which could indicate suspicious behavior or unnecessarily burden the system.

---

## Problem Statement

Design and implement a `TransactionRateLimiter` class with a method `shouldAllow(userId, timestamp)`.

This method should return a `boolean` (`true` if the transaction is allowed, `false` if it is denied). The rule is that each user (`userId`) can make **no more than 10 transactions** within a **60-second rolling time window**.

**Input:**

- `userId` (string): A unique identifier for the user.
- `timestamp` (integer): The time the transaction occurred, represented as a Unix timestamp (in seconds).

**Output:**

- `boolean`: `true` if the transaction is allowed, `false` otherwise.

**Constraints:**

- `userId` will be a non-empty string.
- `timestamp` will be a positive integer. Calls to `shouldAllow` will always have monotonically increasing timestamps.
- The total number of calls to `shouldAllow` can be up to $10^5$.

---

## Examples

<br>

<details>
<summary><strong>Example 1: Basic Limit</strong></summary>

```javascript
const limiter = new TransactionRateLimiter();
limiter.shouldAllow("user1", 1); // true
limiter.shouldAllow("user1", 2); // true
limiter.shouldAllow("user1", 3); // true
// ... 7 more successful calls
limiter.shouldAllow("user1", 10); // true (10th successful call)
limiter.shouldAllow("user1", 11); // false (Exceeds 10 requests in the window)
```

</details>

<details>
<summary><strong>Example 2: Window Expiration</strong></summary>

```javascript
const limiter = new TransactionRateLimiter();
limiter.shouldAllow("user1", 1); // true
limiter.shouldAllow("user2", 2); // true (Different user, separate limit)
limiter.shouldAllow("user1", 60); // true (Still within the limit for user1)
limiter.shouldAllow("user1", 61); // true (The request at timestamp 1 has now expired)
```

</details>

<details>
<summary><strong>Example 3: Staggered Requests</strong></summary>

```javascript
const limiter = new TransactionRateLimiter();
for (let i = 1; i <= 10; i++) {
  limiter.shouldAllow("userA", i * 5); // Timestamps: 5, 10, ..., 50 -> all return true
}
limiter.shouldAllow("userA", 55); // false (11th request, window is [0, 55])
limiter.shouldAllow("userA", 64); // false (Oldest request at ts=5 is still valid in window [5, 64])
limiter.shouldAllow("userA", 65); // true (Oldest request at ts=5 has expired from window [6, 65])
```

</details>

<details>
<summary><strong>Example 4: Multiple Users</strong></summary>

```javascript
const limiter = new TransactionRateLimiter();
limiter.shouldAllow("A", 1); // true
limiter.shouldAllow("B", 2); // true
limiter.shouldAllow("A", 3); // true
limiter.shouldAllow("B", 4); // true
// ... interleaved calls, neither user exceeds their own quota
```

</details>

<details>
<summary><strong>Example 5: Edge Case on Expiration</strong></summary>

```javascript
const limiter = new TransactionRateLimiter();
limiter.shouldAllow("userX", 100); // true
limiter.shouldAllow("userX", 159); // true (Still within quota)
limiter.shouldAllow("userX", 160); // true (Request at ts=100 is now expired at exactly ts=160)
```

</details>
