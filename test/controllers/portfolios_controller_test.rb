require "test_helper"

class PortfoliosControllerTest < ActionDispatch::IntegrationTest
  setup do
    @portfolio = portfolios(:one)
  end

  test "should get index" do
    get portfolios_url, as: :json
    assert_response :success
  end

  test "should display portfolios in desceding order" do
    get portfolios_url, as: :json
    assert_equal Portfolio.order(created_at: :desc), assigns(:portfolios)
  end

  test "should create portfolio" do
    assert_difference("Portfolio.count") do
      post portfolios_url, params: { portfolio: { cash_basis: @portfolio.cash_basis, name: @portfolio.name } }, as: :json
    end

    assert_response :created
  end

  test "should show portfolio" do
    get portfolio_url(@portfolio), as: :json
    assert_response :success
  end

  test "should update portfolio" do
    patch portfolio_url(@portfolio), params: { portfolio: { cash_basis: @portfolio.cash_basis, name: @portfolio.name } }, as: :json
    assert_response :success
  end

  test "should destroy portfolio" do
    assert_difference("Portfolio.count", -1) do
      delete portfolio_url(@portfolio), as: :json
    end

    assert_response :no_content
  end
end
