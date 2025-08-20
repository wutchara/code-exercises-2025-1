import {
  getUserProfile,
  getFinancialData,
  getTransactionHistory,
} from "./utils.js";

import {
  getUserProfilePromise,
  getFinancialDataPromise,
  getTransactionHistoryPromise,
} from "./utils-promise.js";

import { getCompleteUserProfileAsync } from "./utils-async.js";

console.log("================= Promise  ==================");
function getCompleteUserProfile(userId) {
  console.log("Starting....", userId);
  getUserProfile(userId, (error, profile) => {
    if (error) {
      throw error;
    } else {
      console.log("profile", profile);

      getFinancialData(profile, (error, financialData) => {
        if (error) {
          throw error;
        } else {
          console.log("financialData", financialData);

          getTransactionHistory(financialData, (error, history) => {
            if (error) {
              throw error;
            } else {
              console.log("history", history);
            }
          });
        }
      });
    }
  });
  console.log("End....", userId);
}

// getCompleteUserProfile("123");
// getCompleteUserProfile("456");

console.log("================= Promise  ==================");

const processPromise = (userId) =>
  getUserProfilePromise(userId)
    .then((profile) => {
      console.log("profile", profile);
      return getFinancialDataPromise(profile);
    })
    .then((financialData) => {
      console.log("financialData", financialData);
      return getTransactionHistoryPromise(financialData);
    })
    .then((history) => {
      console.log("history", history);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

// processPromise("123");
// processPromise("456");

console.log("================= Async/Await  ==================");
console.log(
  'getCompleteUserProfileAsync("123")',
  await getCompleteUserProfileAsync("123")
);

console.log(
  'getCompleteUserProfileAsync("123")',
  await getCompleteUserProfileAsync("456")
);
