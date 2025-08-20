/**
 * Mock functions simulating calls to external services with latency.
 */

export function getUserProfile(userId, callback) {
  console.log("1. Fetching user profile...");
  setTimeout(() => {
    if (userId === "123") {
      const profile = { id: userId, name: "John Doe", city: "New York" };
      callback(null, profile); // (error, result)
    } else {
      callback(new Error("User not found"), null);
    }
  }, 1000);
}

export function getFinancialData(profile, callback) {
  console.log("2. Fetching financial data...");
  setTimeout(() => {
    if (profile.name === "John Doe") {
      const financial = { accountNumber: "ACC456", creditLimit: 5000 };
      callback(null, financial);
    } else {
      callback(new Error("Financial data not found for this user"), null);
    }
  }, 1000);
}

export function getTransactionHistory(financialData, callback) {
  console.log("3. Fetching transaction history...");
  setTimeout(() => {
    if (financialData.accountNumber) {
      const history = { transactions: ["-100 USD", "+500 USD", "-25 USD"] };
      callback(null, history);
    } else {
      callback(new Error("Cannot fetch history without account number"), null);
    }
  }, 1000);
}
