class CreatePortfolios < ActiveRecord::Migration[7.0]
  def change
    create_table :portfolios do |t|
      t.string :name
      t.integer :cash_basis

      t.timestamps
    end
  end
end
