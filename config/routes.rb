Rails.application.routes.draw do
  resources :transactions
  # api routes should be in api/v1
  namespace :api do
    namespace :v1 do
      resources :portfolios do
        member do
          get 'get_portfolio_rows'
        end
      end
      resources :transactions
    end
  end
end
