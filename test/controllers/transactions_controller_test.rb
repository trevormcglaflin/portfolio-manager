require "test_helper"

class TransactionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @transaction = transactions(:one)
  end

  test "should get index" do
    get transactions_url, as: :json
    assert_response :success
  end

  test "should create transaction" do
    assert_difference("Transaction.count") do
      post transactions_url, params: { transaction: { buy_action: @transaction.buy_action, num_shares: @transaction.num_shares, portfolio_id: @transaction.portfolio_id, price_per_share: @transaction.price_per_share, ticker: @transaction.ticker } }, as: :json
    end

    assert_response :created
  end

  test "should show transaction" do
    get transaction_url(@transaction), as: :json
    assert_response :success
  end

  test "should update transaction" do
    patch transaction_url(@transaction), params: { transaction: { buy_action: @transaction.buy_action, num_shares: @transaction.num_shares, portfolio_id: @transaction.portfolio_id, price_per_share: @transaction.price_per_share, ticker: @transaction.ticker } }, as: :json
    assert_response :success
  end

  test "should destroy transaction" do
    assert_difference("Transaction.count", -1) do
      delete transaction_url(@transaction), as: :json
    end

    assert_response :no_content
  end
end
