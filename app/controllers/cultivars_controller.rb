class CultivarsController < ApplicationController
  def index
    @cultivars = Cultivar.all
  end

  def show
    @cultivar = Cultivar.find(params[:id])
  end
end