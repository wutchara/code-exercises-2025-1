import {
  getUserProfilePromise,
  getFinancialDataPromise,
  getTransactionHistoryPromise,
} from "./utils-promise.js";

export async function getCompleteUserProfileAsync(userId) {
  console.log("Starting....", userId);

  try {
    const profile = await getUserProfilePromise(userId);
    const financialData = await getFinancialDataPromise(profile);
    const history = await getTransactionHistoryPromise(financialData);

    return history;
  } catch (error) {
    console.error("Error:", error);
  }
}
