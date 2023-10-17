

class Api::V1::TransactionsController < ApplicationController
  before_action :set_transaction, only: %i[ show update destroy ]

  # GET /transactions
  def index
    @transactions = Transaction.all

    render json: @transactions
  end

  # GET /transactions/1
  def show
    render json: @transaction
  end

  # POST /transactions
  def create
    @transaction = Transaction.new(transaction_params)

     # if the buy action is sell, confirm you have enough shares to sell off
     portfolio = Portfolio.find(@transaction.portfolio_id)
     if !@transaction.buy_action
      num_shares_owned = portfolio.get_num_shares_owned(@transaction.ticker)
      if num_shares_owned < @transaction.num_shares
        render json: { error: 'Not enough shares to sell'}, status: :bad_request
        return
      end
    end
    
    # fetch latest stock price from yahoo finance, and set price_per_share
    query = BasicYahooFinance::Query.new
    data = query.quotes(@transaction.ticker, 'price')

    # if no data is returned, that means the ticker doesnt exist, return error
    if data[@transaction.ticker]["code"] == "Not Found"
      render json: { error: 'Invalid Stock Ticker'}, status: :bad_request
      return
    end

    @transaction.price_per_share = data[@transaction.ticker]['regularMarketPrice']['fmt']

    # if buy action is buy, confirm that you have enough cash to make transaction
    if @transaction.buy_action
      liquid_cash = portfolio.get_liquid_cash_balance
      price_of_transaction = @transaction.price_per_share.to_f * @transaction.num_shares
      if liquid_cash < price_of_transaction
        render json: { error: 'Not enough available cash'}, status: :bad_request
        return
      end
    end


    if @transaction.save
      render json: @transaction, status: :created, location: @transaction
    else
      render json: @transaction.errors, status: :unprocessable_entity
      return
    end
  end

  # PATCH/PUT /transactions/1
  def update
    if @transaction.update(transaction_params)
      render json: @transaction
    else
      render json: @transaction.errors, status: :unprocessable_entity
    end
  end

  # DELETE /transactions/1
  def destroy
    @transaction.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_transaction
      @transaction = Transaction.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def transaction_params
      params.require(:transaction).permit(:ticker, :buy_action, :num_shares, :price_per_share, :portfolio_id)
    end
end
