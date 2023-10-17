import {useEffect, useState} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPortfolio, deletePortfolio, fetchPortfolioRows } from "../services/portfolioService";

function PortfolioDetails() {
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [portfolioRows, setPortfolioRows] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentPortfolio = async () => {
      try {
        const json = await fetchPortfolio(id);
        setPortfolio(json);
        setTransactions(json['transactions'])
      } catch (e) {
        console.log("error retrieving portfolio", e);
      }
    }

    const fetchCurrentPortfolioRows = async () => {
      try {
        const json = await fetchPortfolioRows(id);
        console.log(json['portfolio_rows'])
        setPortfolioRows(json['portfolio_rows'])
      } catch (e) {
        console.log("error retrieving portfolio rows", e);
      }
    }
    fetchCurrentPortfolio();
    fetchCurrentPortfolioRows();
  }, [id])
  

  const deletePortfolioHandler = async () => {
    try {
      await deletePortfolio(id);
      navigate("/");
    } catch (e) {
      console.log("Failed to delete portfolio", e);
    }
  }

  const formatNum = (num) => {
    if (num === undefined || num === '-' || num === null) {
      return '-'
    }

    return `\$${num.toFixed(2)}`
  }

  const formatPercent = (num) => {
    if (num === undefined || num === '-' || num === null) {
      return '-'
    }

    return `${num.toFixed(2)}%`
  }

  const formattedDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  }

  if (!portfolio) return <h2>Loading...</h2>;

  return (
    <div className="container">
      <div className="row">
        <div className="col col-10">
          <h3>{portfolio.name}</h3>
        </div>
        <div className="col col-2">
          <Link to={`/portfolios/${portfolio.id}/edit`}>Edit</Link>
          <button className="btn btn-link" onClick={deletePortfolioHandler} style={{ fontWeight: "500", marginBottom: "3px" }}>Delete</button>
        </div>
      </div>
      <div className="row">
        <div className="col col-12">
          <h3>Portfolio</h3>
        </div>
      </div>
      <div className="row">
        <div className="col col-12">
          <table className="table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Quantity</th>
                <th>Market Price</th>
                <th>Market Value</th>
                <th>Cost Basis</th>
                <th>Dollar Gain</th>
                <th>Percent Gain</th>
              </tr>
            </thead>
            <tbody>
              {portfolioRows.map((pr) => (
                <tr key={pr.ticker}>
                  <td>{pr.ticker}</td>
                  <td>{pr.quantity}</td>
                  <td>{formatNum(pr.market_price)}</td>
                  <td>{formatNum(pr.market_value)}</td>
                  <td>{formatNum(pr.cost_basis)}</td>
                  <td style={{ color: pr.dollar_gain > 0 ? 'green' : 'red' }}>{formatNum(pr.dollar_gain)}</td>
                  <td style={{ color: pr.percent_gain > 0 ? 'green' : 'red' }}>{formatPercent(pr.percent_gain)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="row">
        <div className="col col-10">
          <h3>Transactions</h3>
        </div>
        <div className="col col-2">
          <Link to={`/portfolios/${portfolio.id}/transactions/new`}>Add Transaction</Link>
        </div>
      </div>
      <div className="row">
        <div className="col col-12">
          <table className="table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Buy Action</th>
                <th>Num Shares</th>
                <th>Price per Share</th>
                <th>Total Price</th>
                <th>Datetime</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.ticker}</td>
                  <td style={{ color: transaction.buy_action ? 'green' : 'red' }}>{transaction.buy_action ? 'Buy' : 'Sell'}</td>
                  <td>{transaction.num_shares}</td>
                  <td>{formatNum(transaction.price_per_share)}</td>
                  <td>{formatNum(transaction.num_shares * transaction.price_per_share)}</td>
                  <td>{formattedDate(transaction.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  )
}

export default PortfolioDetails;
