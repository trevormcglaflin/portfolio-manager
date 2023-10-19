require_relative "./portfolio_row"
require 'httparty'
API_KEY = 'PRLK8RSPVRO6G9PX'

# helper method to fetch daily stock data
def fetch_intraday_data(symbol, api_key)
  url = "https://www.alphavantage.co/query"
  params = {
    function: 'TIME_SERIES_INTRADAY',
    symbol: symbol,
    interval: '30min',
    apikey: api_key
  }

  response = HTTParty.get(url, query: params)

  if response.code == 200
    return JSON.parse(response.body)
  else
    puts "Error: Unable to fetch data. HTTP Status: #{response.code}"
    return nil
  end
end


class Portfolio < ApplicationRecord
  has_many :transactions

  def get_portfolio_rows
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

  def get_portfolio_chart_data
    portfolio_chart_data = []

    # very janky but start by getting a list of timestamps we will use to create chart
    date_list = []

    attempts = 0
    data = fetch_intraday_data('AAPL', API_KEY)
    while (data.nil? || !data.has_key?('Time Series (30min)')) && attempts <= 10
      puts data
      puts "attempt" << attempts
      data = fetch_intraday_data('AAPL', API_KEY)
      attempts += 1
    end

    if attempts >= 10
      return nil
    end

    data['Time Series (30min)'].each do |timestamp, stock_data|
      date_list.push(timestamp)
    end

    ticker_map = {}
    ticker_to_stock_data_map = {}
    portfolio_rows = []
    self.transactions.each do |transaction|
      if !ticker_map.key?(transaction.ticker)
        pr = PortfolioRow.new
        pr.ticker = transaction.ticker
        ticker_map[transaction.ticker] = 1

        attempts = 0
        data = fetch_intraday_data(transaction.ticker, API_KEY)
        while (data.nil? || !data.has_key?('Time Series (30min)')) && attempts <= 10
          data = fetch_intraday_data(transaction.ticker, API_KEY)
          attempts += 1
        end
    
        if attempts >= 10
          return nil
        end
    
        data['Time Series (30min)'].each do |timestamp, stock_data|
          date_list.push(timestamp)
        end
        
        final_stock_data = {}
        data['Time Series (30min)'].each do |timestamp, stock_data|
          # there are 100 total but just get most recent 50
          final_stock_data[timestamp] = stock_data['1. open']
        end
        
        ticker_to_stock_data_map[transaction.ticker] = final_stock_data
        portfolio_rows.push(pr)
      end
    end

    date_list.each do |timestamp|
      mv = get_portfolio_market_value_at_timestamp(timestamp, ticker_to_stock_data_map, portfolio_rows)
      if mv > 0
        portfolio_chart_data.push({
          date_time: timestamp,
          market_value: mv
        })
      end
    end

    return portfolio_chart_data.reverse
  end

  def get_portfolio_market_value_at_timestamp(timestamp, ticker_to_stock_data_map, portfolio_rows)
    portfolio_rows.each do |portfolio_row|
      portfolio_row_data = get_portfolio_row_data_for_ticker_from_transactions_at_timestamp(portfolio_row.ticker, timestamp)
      quantity = portfolio_row_data[0]
      cost_basis = portfolio_row_data[1]
      
      # retrieve market price
      market_price = ticker_to_stock_data_map[portfolio_row.ticker][timestamp].to_f

      portfolio_row.quantity = quantity
      portfolio_row.cost_basis = cost_basis
      portfolio_row.market_value = quantity * market_price
      portfolio_row.dollar_gain = portfolio_row.market_value - portfolio_row.cost_basis
      portfolio_row.percent_gain = portfolio_row.dollar_gain / portfolio_row.cost_basis
      portfolio_row.market_price = market_price
    end
    total_row_before_cash = get_total_portfolio_row(portfolio_rows)
    return total_row_before_cash.market_value
  end

  def get_portfolio_row_data_for_ticker_from_transactions_at_timestamp(ticker, timestamp)
    quantity = 0
    total_cost = 0
    self.transactions.each do |transaction|
      # only count the transaction if it was before the timestamp
      if transaction.created_at <= DateTime.parse(timestamp)
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
    end
    return [quantity, total_cost]
  end
end



