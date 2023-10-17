class CreateTransactions < ActiveRecord::Migration[7.0]
  def change
    create_table :transactions do |t|
      t.string :ticker
      t.boolean :buy_action
      t.integer :num_shares
      t.float :price_per_share
      t.references :portfolio, null: false, foreign_key: true

      t.timestamps
    end
  end
end
