import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import { fetchAllPortfolios } from "../services/portfolioService";

function PortfolioList() {
  const [portfolios, setPortfolios] = useState([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState(null);

  useEffect(() => {
    async function loadPortfolios() {
      try {
        const data = await fetchAllPortfolios();
        setPortfolios(data);
        console.log(data);
        setLoading(false);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolios();
  }, [])

  return (
    <div className="container">
      <div className="row">
        <div className="col col-10">
          <h3>Portfolios</h3>
        </div>
        <div className="col col-2">
          <Link to={`/portfolios/new`}>Create New Portfolio</Link>
        </div>
      </div>
      <div className="row">
        <div className="col col-12">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Cash Basis</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolios.map((portfolio) => (
                <tr key={portfolio.id}>
                  <td>{portfolio.name}</td>
                  <td>{portfolio.cash_basis}</td>
                  <td>
                    <Link to={`portfolios/${portfolio.id}`} className="portfolio-name">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PortfolioList;