class HomeController < ApplicationController
  def index
    gon.key = ENV['AW_KEY']
  end
end
