class Api::V1::PortfoliosController < ApplicationController
  before_action :set_portfolio, only: %i[ show update destroy ]

  # GET /portfolios
  def index
    @portfolios = Portfolio.order(created_at: :desc)

    render json: @portfolios
  end

  # GET /portfolios/1
  def show
    @portfolio = Portfolio.find(params[:id])
    @transactions = @portfolio.transactions

    custom_response = @portfolio.as_json
    custom_response['transactions'] = @transactions

    render json: custom_response
  end

  # POST /portfolios
  def create
    @portfolio = Portfolio.new(portfolio_params)

    if @portfolio.save
      render json: @portfolio, status: :created, location: api_v1_portfolio_url(@portfolio)
    else
      render json: @portfolio.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /portfolios/1
  def update
    if @portfolio.update(portfolio_params)
      render json: @portfolio
    else
      render json: @portfolio.errors, status: :unprocessable_entity
    end
  end

  # DELETE /portfolios/1
  def destroy
    @portfolio.destroy
  end

  def get_portfolio_rows
    @portfolio = Portfolio.find(params[:id])
    @portfolio_rows = @portfolio.get_portfolio_rows

    render json: { portfolio: @portfolio, portfolio_rows: @portfolio_rows }
  end


  private
    # Use callbacks to share common setup or constraints between actions.
    def set_portfolio
      @portfolio = Portfolio.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def portfolio_params
      params.require(:portfolio).permit(:name, :cash_basis)
    end
end
