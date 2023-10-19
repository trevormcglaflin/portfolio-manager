import { API_URL } from "../constants";

async function fetchAllPortfolios() {
  const response = await fetch(`${API_URL}/portfolios`);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
}

async function fetchPortfolio(id) {
  const response = await fetch(`${API_URL}/portfolios/${id}`);

  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response.json()
}

async function fetchPortfolioRows(id) {
  const response = await fetch(`${API_URL}/portfolios/${id}/get_portfolio_rows`);

  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response.json()
}

async function fetchPortfolioChartData(id) {
  const response = await fetch(`${API_URL}/portfolios/${id}/get_chart_data`);

  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response.json()
}

async function createPortfolio(portfolioData) {
  const portfolioDataSerialized = {
    name: portfolioData['name'],
    cash_basis: portfolioData['cashBasis']
  }
  const response = await fetch(`${API_URL}/portfolios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(portfolioDataSerialized )
  });

  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response.json()
}

async function updatePortfolio(id, portfolioData) {
  const response = await fetch(`${API_URL}/portfolios/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(portfolioData)
  });

  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response.json()
}

async function deletePortfolio(id) {
  const response = await fetch(`${API_URL}/portfolios/${id}`, {
    method: "DELETE"
  })

  if (!response.ok) {
    throw Error(response.statusText);
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}




export { fetchAllPortfolios, fetchPortfolio, fetchPortfolioRows, fetchPortfolioChartData, createPortfolio,  updatePortfolio, deletePortfolio };