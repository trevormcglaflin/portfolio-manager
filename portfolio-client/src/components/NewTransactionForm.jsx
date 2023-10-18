import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createTransaction } from "../services/transactionService";

function NewTransactionForm() {
  const [ticker, setTicker] = useState("");
  const [buyAction, setBuyAction] = useState(true);
  const [numShares, setNumShares] = useState(0);
  const [pricePerShare, setPricePerShare] = useState(0);

  const { portfolioId } = useParams();
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const transactionData = { ticker, buyAction, numShares, pricePerShare, portfolioId };

    try {
      await createTransaction(transactionData);
      navigate(`../portfolios/${portfolioId}`)
    } catch (e) {
      alert(e);
      console.error("Error creating transaction", e);
    }
  }


  return (
    <div style={{ padding: "15px"}}>
      <h2>Create Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ padding: "8px"}}>
          <label htmlFor="tickerInput" style={{ fontWeight: "bold", paddingRight: "8px" }}>Ticker</label>
          <input
            id="tickerInput"
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            required
          />
        </div>

        <div style={{ padding: "8px"}}>
          <label htmlFor="buyActionInput" style={{ fontWeight: "bold", paddingRight: "8px" }}>Buy?</label>
          <input
            id="buyActionInput"
            type="checkbox"
            checked={buyAction}
            onChange={(e) => setBuyAction(e.target.checked)}
          />
        </div>
        
        <div style={{ padding: "8px"}}>
          <label htmlFor="numSharesInput" style={{ fontWeight: "bold", paddingRight: "8px" }}># of Shares</label>
          <input
            id="numSharesInput"
            type="text"
            value={numShares}
            onChange={(e) => setNumShares(e.target.value)}
            required
          />
        </div>
       
        <div style={{ paddingTop: "15px" }}>
          <Link to={`../portfolios/${portfolioId}`} className="portfolio-name btn btn-link">Back to Portfolio</Link>
          <button className="btn btn-primary" type="submit">Create Transaction</button>
        </div>
      </form>
    </div>
  )

}

export default NewTransactionForm;