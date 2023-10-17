
class PortfolioRow
  def ticker
    @ticker
  end

  def ticker=( value )
    @ticker = value
  end

  def quantity
    @quantity
  end

  def quantity=( value )
    @quantity = value
  end

  def market_price
    @market_price
  end

  def market_price=( value )
    @market_price = value
  end

  def market_value
    @market_value
  end

  def market_value=( value )
    @market_value = value
  end

  def cost_basis
    @cost_basis
  end

  def cost_basis=( value )
    @cost_basis = value
  end

  def dollar_gain
    @dollar_gain
  end

  def dollar_gain=( value )
    @dollar_gain = value
  end

  def percent_gain
    @percent_gain
  end

  def percent_gain=( value )
    @percent_gain = value
  end

  def to_dict
    {
      'ticker' => @ticker,
      'quantity' => @quantity,
      'market_price' => @market_price,
      'market_value' => @market_value,
      'cost_basis' => @cost_basis,
      'dollar_gain' => @dollar_gain,
      'percent_gain' => @percent_gain
    }
  end
end