import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortfolio } from "../services/portfolioService";

function NewPortfolioForm() {
  const [name, setName] = useState("");
  const [cashBasis, setCashBasis] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const portfolioData = { name, cashBasis };

    try {
      const response = await createPortfolio(portfolioData);
      navigate(`../portfolios/${response.id}`)
    } catch (e) {
      console.error("Error creating portfolio", e);
    }
  }


  return (
    <div style={{ padding: "15px"}}>
      <h2>Create Portfolio</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ padding: "8px"}}>
          <label htmlFor="nameInput" style={{ fontWeight: "bold", paddingRight: "8px" }}>Name</label>
          <input
            id="nameInput"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div style={{ padding: "8px"}}>
          <label htmlFor="cashBasisInput" style={{ fontWeight: "bold", paddingRight: "8px" }}>Cash Basis</label>
          <input
            id="cashBasisInput"
            type="text"
            value={cashBasis}
            onChange={(e) => setCashBasis(e.target.value)}
            required
          />
        </div>
        <div style={{ paddingTop: "15px" }}>
          <button className="btn btn-primary" type="submit">Create Portfolio</button>
        </div>
      </form>

    </div>
  )

}

export default NewPortfolioForm;