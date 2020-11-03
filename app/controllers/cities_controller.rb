class CitiesController < ApplicationController
    def index
        @cities = City.all
        render json: @cities
    end
    
    def create
        @city = City.new(city_params)

        if @city.save
            render json: @city, status: :ok
        else
            render json: @city, status: :not_acceptable
        end
    end

    private
    def city_params
        params.require(:city).permit(:name, :key)
    end
end