import { Route, Routes} from "react-router-dom";
import PortfolioList from "./PortfolioList";
import PortfolioDetails from "./PortfolioDetails";
import PortfolioEditForm from "./PortfolioEditForm";
import NewPortfolioForm from "./NewPortfolioForm";
import NewTransactionForm from "./NewTransactionForm";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PortfolioList />} />
      <Route path="/portfolios/:id" element={<PortfolioDetails />} />
      <Route path="/portfolios/:id/edit" element={<PortfolioEditForm />} />
      <Route path="/portfolios/new" element={<NewPortfolioForm />} />
      <Route path="/portfolios/:portfolioId/transactions/new" element={<NewTransactionForm />} />
    </Routes>
  )
}

export default AppRoutes;