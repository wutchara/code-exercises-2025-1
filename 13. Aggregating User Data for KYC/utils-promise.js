import {
  getUserProfile,
  getFinancialData,
  getTransactionHistory,
} from "./utils.js";

export function getUserProfilePromise(userId) {
  console.log("Starting....", userId);
  return new Promise((resolve, reject) => {
    getUserProfile(userId, (error, profile) => {
      if (error) {
        reject(error);
      } else {
        resolve(profile);
      }
    });
  });
}

export function getFinancialDataPromise(profile) {
  return new Promise((resolve, reject) => {
    getFinancialData(profile, (error, financialData) => {
      if (error) {
        reject(error);
      } else {
        resolve(financialData);
      }
    });
  });
}

export function getTransactionHistoryPromise(financialData) {
  return new Promise((resolve, reject) => {
    getTransactionHistory(financialData, (error, history) => {
      if (error) {
        reject(error);
      } else {
        resolve(history);
      }
    });
  });
}
