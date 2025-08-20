# Problem: Aggregating User Data for KYC

**Difficulty**: Medium

## Context

In FinTech systems, Know Your Customer (KYC) is a critical process. Imagine you are developing a backend service that needs to fetch user data from three separate, asynchronous services to build a complete user profile. Each service must be called in sequence because the data from one service is required to call the next.

- `getUserProfile(userId, callback)`: Fetches the user's basic information (e.g., name, address).
- `getFinancialData(profile, callback)`: Uses the profile data from the first step to fetch financial information (e.g., account number, credit limit).
- `getTransactionHistory(financialData, callback)`: Uses the financial data from the second step to fetch recent transaction history.

Each of these functions is asynchronous and uses the traditional callback pattern, common in older NodeJS codebases.

## Task

Write a function `getCompleteUserProfile(userId)` that calls these three functions in sequence and aggregates their results into a single object.

### Input

- `userId` (string): The ID of the user whose data you want to fetch.

### Output

A `Promise` that resolves with a complete user profile object containing data from all three services, or rejects with an `Error` message if any step fails.

## Constraints

- The functions must be called in the correct order: `getUserProfile` -> `getFinancialData` -> `getTransactionHistory`.