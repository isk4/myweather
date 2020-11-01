class CitiesController < ApplicationController
    def index
        @cities = City.all
    end
    
    def create
        @city = City.new(city_params)

        if @city.save
            redirect_to root_path, notice: "New city added."
        else
            redirect_to root_path, notice: "There was an error saving this city."
        end
    end

    private
    def city_params
        params.require(:city).permit(:name, :key)
    end
end