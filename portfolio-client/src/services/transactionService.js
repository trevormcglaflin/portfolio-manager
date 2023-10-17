import { API_URL } from "../constants";

async function createTransaction(transactionData) {
  const transactionDataSerialized = {
    ticker: transactionData['ticker'],
    buy_action: transactionData['buyAction'],
    num_shares: transactionData['numShares'],
    price_per_share: transactionData['pricePerShare'],
    portfolio_id: transactionData['portfolioId'],
  }

  const response = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(transactionDataSerialized)
  });

  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response.json()
}

export { createTransaction };
