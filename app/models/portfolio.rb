require_relative "./portfolio_row"

class Portfolio < ApplicationRecord
  has_many :transactions

  def get_portfolio_rows
    puts self.transactions
    portfolio_rows = []
    ticker_map = {}

    self.transactions.each do |transaction|
      if !ticker_map.key?(transaction.ticker)
        pr = PortfolioRow.new
        pr.ticker = transaction.ticker
        portfolio_rows.push(pr)
        ticker_map[transaction.ticker] = 1
      end
    end

    portfolio_rows.each do |portfolio_row|
      portfolio_row_data = get_portfolio_row_data_for_ticker_from_transactions(portfolio_row.ticker)
      quantity = portfolio_row_data[0]
      cost_basis = portfolio_row_data[1]
      
      # retrieve market price
      query = BasicYahooFinance::Query.new

      data = query.quotes(portfolio_row.ticker, 'price')
      if data[portfolio_row.ticker]["code"] == "Not Found"
        render json: { error: 'Invalid Stock Ticker'}, status: :bad_request
      end
      market_price = data[portfolio_row.ticker]['regularMarketPrice']['fmt'].to_f

      portfolio_row.quantity = quantity
      portfolio_row.cost_basis = cost_basis
      portfolio_row.market_value = quantity * market_price
      portfolio_row.dollar_gain = portfolio_row.market_value - portfolio_row.cost_basis
      portfolio_row.percent_gain = portfolio_row.dollar_gain / portfolio_row.cost_basis
      portfolio_row.market_price = market_price
    end

    total_row_before_cash = get_total_portfolio_row(portfolio_rows)
    portfolio_rows.push(total_row_before_cash)
    liquid_cash_row = get_liquid_cash_row(total_row_before_cash.cost_basis, self.cash_basis)
    portfolio_rows.push(liquid_cash_row)
    total_row_after_cash = get_total_row_including_cash(total_row_before_cash, liquid_cash_row, self.cash_basis)
    portfolio_rows.push(total_row_after_cash)
    return portfolio_rows.map { |row| row.to_dict }
  end

  def get_portfolio_row_data_for_ticker_from_transactions(ticker)
    quantity = 0
    total_cost = 0
    self.transactions.each do |transaction|
      if transaction.ticker == ticker
        if transaction.buy_action
          quantity += transaction.num_shares
          total_cost += transaction.num_shares * transaction.price_per_share
        else
          quantity -= transaction.num_shares
          total_cost -= transaction.num_shares * transaction.price_per_share
        end
      end
    end
    return [quantity, total_cost]
  end

  def get_total_portfolio_row(portfolio_rows)
    tr = PortfolioRow.new
    tr.ticker = 'Total Equities'
    market_value_sum = 0
    cost_basis_sum = 0
    portfolio_rows.each do |pr|
      market_value_sum += pr.market_value
      cost_basis_sum += pr.cost_basis
    end
    tr.cost_basis = cost_basis_sum
    tr.market_value = market_value_sum
    tr.dollar_gain = tr.market_value - tr.cost_basis
    if cost_basis_sum == 0
      tr.percent_gain = 0
    else
      tr.percent_gain = tr.dollar_gain / tr.cost_basis
    end

    return tr
  end

  def get_liquid_cash_row(cost_basis, cash_basis)
    cash_row = PortfolioRow.new
    cash_row.ticker = "Available Cash"
    available_cash = cash_basis - cost_basis
    cash_row.market_value = available_cash
    cash_row.cost_basis = available_cash
    return cash_row
  end

  def get_total_row_including_cash(total_row_before_cash, liquid_cash_row, cash_basis)
    total_row = PortfolioRow.new
    total_row.ticker = 'Total'
    total_row.cost_basis = cash_basis
    total_row.market_value = total_row_before_cash.market_value + liquid_cash_row.market_value
    total_row.dollar_gain = total_row.market_value - total_row.cost_basis
    if total_row.cost_basis == 0
      total_row.percent_gain = 0
    else
      total_row.percent_gain = total_row.dollar_gain / total_row.cost_basis
    end
    return total_row
  end

  def get_liquid_cash_balance()
    portfolio_rows = self.get_portfolio_rows()
    return portfolio_rows[-2]['market_value']
  end

  def get_num_shares_owned(ticker)
    num_shares_owned = 0
    self.transactions.each do |transaction|
      if transaction.ticker == ticker
        if transaction.buy_action
          num_shares_owned += transaction.num_shares
        else
          num_shares_owned -= transaction.num_shares
        end
      end
    end
    return num_shares_owned
  end
end
