import {useState, useEffect} from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchPortfolio, updatePortfolio } from "../services/portfolioService";

function PortfolioEditForm() {
  const [portfolio, setPortfolio] = useState(null)
  const { id } = useParams();

  const [, setError] = useState(true);
  const [, setLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentPortfolio = async () => {
      try {
        const json = await fetchPortfolio(id);
        setPortfolio(json);
      } catch (e) {
        console.error("Could not retrieve portfolio", e);
        setError(e);
      } finally {
        setLoading(false);
      }
    }
    fetchCurrentPortfolio();
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedPortfolio = {
      name: portfolio.name,
      cash_basis: portfolio.cash_basis,
    };
    try {
      await updatePortfolio(id, updatedPortfolio);
      navigate(`/portfolios/${id}`);
    } catch (e) {
      alert(e);
      console.error('Could not update portfolio: ', e);
    }
  }

  if (!portfolio) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "15px"}}>
      <h2>Edit Portfolio</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="portfolioName">Name</label>
          <br />
          <input
            id="portfolioName"
            type="text"
            value={portfolio.name}
            onChange={(e) => setPortfolio({ ...portfolio, name: e.target.value})}
          />
        </div>
        <div>
          <label htmlFor="portfolioCashBasis">Cash Basis</label>
          <br />
          <input
            id="portfolioCashBasis"
            type="text"
            value={portfolio.cash_basis}
            onChange={(e) => setPortfolio({ ...portfolio, cash_basis: e.target.value})}
          />
        </div>
        <div style={{ paddingTop: "15px" }}>
          <Link to={`../portfolios/${portfolio.id}`} className="portfolio-name btn btn-link">Back to Portfolio</Link>
          <button className="btn btn-primary" type="submit">Update</button>
        </div>
      </form>
    </div>
  )

}

export default PortfolioEditForm;