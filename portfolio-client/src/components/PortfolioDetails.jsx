import {useEffect, useState} from "react";
import { PieChart, Pie, Cell, Tooltip as PieChartTooltip, LineChart, 
  ResponsiveContainer, 
  Legend, Tooltip, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid  } from 'recharts';

import { useParams, useNavigate } from "react-router-dom";
import { fetchPortfolio, deletePortfolio, fetchPortfolioRows, fetchPortfolioChartData } from "../services/portfolioService";

function PortfolioDetails() {
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [portfolioRows, setPortfolioRows] = useState([]);
  const [portfolioPieChartData, setPortfolioPieChartData] = useState([]);
  const [portfolioLineChartData, setPortfolioLineChartData] = useState([]);
  const [tab, setTab] = useState('portfolio');


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
        setPortfolioRows(json['portfolio_rows'])
      } catch (e) {
        console.log("error retrieving portfolio rows", e);
      }
    }

    const fetchCurrentPortfolioLineChartData = async () => {
      try {
        const json = await fetchPortfolioChartData(id);
        console.log(json['portfolio_chart_data'])
        setPortfolioLineChartData(json['portfolio_chart_data'])
      } catch (e) {
        console.log("error retrieving portfolio chart data", e);
      }
    }
    fetchCurrentPortfolio();
    fetchCurrentPortfolioRows();
    fetchCurrentPortfolioLineChartData();
  }, [id])

  useEffect(() => {
    if (portfolioRows.length) {
      const tempPortfolioPieChartData = [];
      const totalEquities = portfolioRows[portfolioRows.length-3]['market_value']
      portfolioRows.forEach((portfolioRow) => {
        // TODO: clean this up
        if (!portfolioRow['ticker'].includes('Total') && !portfolioRow['ticker'].includes('Available Cash')) {
          tempPortfolioPieChartData.push({
            name: portfolioRow['ticker'],
            value: Number(((portfolioRow['market_value'] / totalEquities) * 100).toFixed(2))
          })
        }
      })
      setPortfolioPieChartData(tempPortfolioPieChartData);
    } 
  }, [portfolioRows])

  const refreshPortfolioRows = async () => {
    try {
      const json = await fetchPortfolioRows(id);
      console.log(json['portfolio_rows'])
      setPortfolioRows(json['portfolio_rows'])
    } catch (e) {
      console.log("error retrieving portfolio rows", e);
    }
  }
  

  const deletePortfolioHandler = async () => {
    try {
      await deletePortfolio(id);
      navigate("/");
    } catch (e) {
      console.log("Failed to delete portfolio", e);
    }
  }

  const showTransactionClick = () => {
    setTab('transactions');
  }

  const showPortfolioClick = () => {
    setTab('portfolio')
  }

  const showAllocationsClick = () => {
    setTab('allocations')
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
  
  const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  if (!portfolio) return <h2>Loading...</h2>;

  return (
    <>
      <PortfolioNavBar 
        portfolio={portfolio}
        transactions={transactions}
        showPortfolioClick={showPortfolioClick}
        showTransactionClick={showTransactionClick}
        showAllocationsClick={showAllocationsClick}
        deletePortfolioHandler={deletePortfolioHandler}
      />
      <div className="container" style={{ margin: "12px" }}>
        {tab === 'portfolio' ? (
          <>
            <div className="row">
              <div className="col col-10">
                <h4>Portfolio</h4>
              </div>
              <div className="col col-2">
                <button className="btn btn-link" style={{ float: "right" }} onClick={refreshPortfolioRows}>Refresh</button>
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
                      <tr
                        key={pr.ticker}
                        style={{ fontWeight: pr.ticker.includes('Total') ? "bold" : "", borderTop: pr.ticker.includes('Total') ? "1.5px solid black" : "" }}
                      >
                        <td>{pr.ticker}</td>
                        <td>{pr.quantity}</td>
                        <td>{formatNum(pr.market_price)}</td>
                        <td>{formatNum(pr.market_value)}</td>
                        <td>{formatNum(pr.cost_basis)}</td>
                        <td style={{ color: pr.dollar_gain > 0 ? 'green' : 'red' }}>{formatNum(pr.dollar_gain)}</td>
                        <td style={{ color: pr.percent_gain > 0 ? 'green' : 'red' }}>{formatPercent(pr.percent_gain * 100)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="row">
              <div className="col col-12">
                <h4>Performance</h4>
              </div>
            </div>
            <div className="row">
              <div className="col col-12">
              <ResponsiveContainer width="100%" aspect={3}> 
                  <LineChart data={portfolioLineChartData} margin={{ right: 300 }}> 
                      <CartesianGrid /> 
                      <XAxis dataKey="date_time" 
                          interval={'preserveStartEnd'} /> 
                      <YAxis domain={['auto', 'auto']}></YAxis> 
                      <Legend /> 
                      <Tooltip /> 
                      <Line dataKey="market_value"
                          stroke="black" activeDot={{ r: 8 }} /> 
                  </LineChart> 
              </ResponsiveContainer> 
              </div>
            </div>
          </>
        ) : (
          <>
            {tab === 'transactions' ? (
              <>
                <div className="row">
                  <div className="col col-12">
                    <h4>Transactions</h4>
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
              </>
            ): (
              <>
                <div className="row">
                  <div className="col col-12">
                    <h4>Allocations</h4>
                  </div>
                  <div className="col col-12">
                    <PieChart width={500} height={500}>
                      <Pie
                        data={portfolioPieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={200}
                      >
                        {portfolioPieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getRandomColor()} />
                        ))}
                      </Pie>
                      <PieChartTooltip
                        cursor={false}
                        formatter={(value, name) => [value, name]}
                      />
                    </PieChart>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}

function PortfolioNavBar(props) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light" style={{ marginBottom: "12px", padding: "0px 24px 12px 24px", borderBottom: "1px solid #eeeeee", backgroundColor: "white" }}>
      <a className="navbar-brand" href="/">{props.portfolio.name} Profile</a>
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item active" style={{ cursor: "pointer" }}>
            <p className="nav-link" onClick={props.showPortfolioClick} style={{ marginBottom: "0px" }}>Portfolio</p>
          </li>
          <li className="nav-item active" style={{ cursor: "pointer" }}>
            <p className="nav-link" onClick={props.showTransactionClick} style={{ marginBottom: "0px" }}>Transaction Log</p>
          </li>
          <li className="nav-item active" style={{ cursor: "pointer" }}>
            <p className="nav-link" onClick={props.showAllocationsClick} style={{ marginBottom: "0px" }}>Allocations</p>
          </li>
          <li className="nav-item active" style={{ cursor: "pointer" }}>
            <a className="nav-link" href={`/portfolios/${props.portfolio.id}/transactions/new`} style={{ marginBottom: "0px" }}>Add Transaction</a>
          </li>
          <li className="nav-item active" style={{ cursor: "pointer" }}>
            <a className="nav-link" href={`/portfolios/${props.portfolio.id}/edit`} style={{ marginBottom: "0px" }}>Edit Portfolio</a>
          </li>
          {
            !props.transactions.length ? (
              <li className="nav-item active" style={{ cursor: "pointer" }}>
                <p className="nav-link" onClick={props.deletePortfolioHandler} style={{ marginBottom: "0px" }}>Delete Portfolio</p>
              </li>
            ) : (<p></p>)
          }
        </ul>
      </div>
    </nav>
)
}

export default PortfolioDetails;
