export class TransactionRateLimiter {
  transactionHistories = {};
  MAX_TRANSACTIONS = 10;
  WINDOW_IN_SECONDS = 60;

  /**
   * Determines if a transaction should be allowed based on a rate limit.
   * @param {string} userId - The ID of the user making the transaction.
   * @param {number} timestamp - The Unix timestamp (in seconds) of the transaction.
   * @returns {boolean} - True if the transaction is allowed, false otherwise.
   */
  shouldAllow(userId, timestamp) {
    // Initialize transaction history for new users.
    if (!this.transactionHistories[userId]) {
      this.transactionHistories[userId] = [];
    }

    const userHistory = this.transactionHistories[userId];

    // Determine the start of the 60-second rolling window.
    const windowStartTime = timestamp - this.WINDOW_IN_SECONDS;

    // Filter out transactions that are outside the current window.
    const transactionsInWindow = userHistory.filter(
      (ts) => ts > windowStartTime
    );

    const isAllowed = transactionsInWindow.length < this.MAX_TRANSACTIONS;

    // Check if the user has exceeded the transaction limit.
    if (isAllowed) {
      // If allowed, add the new transaction to the history.
      transactionsInWindow.push(timestamp);
    }
    this.transactionHistories[userId] = transactionsInWindow;

    return isAllowed;
  }
}
