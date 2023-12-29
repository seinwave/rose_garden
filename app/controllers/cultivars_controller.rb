class CultivarsController < ApplicationController
  def index
    @cultivars = Cultivar.all
  end

  def show
    @cultivar = Cultivar.find(params[:id])
    render json: @cultivar
  end

  def pan_to_plant
    @cultivar = Cultivar.find(params[:id])
    first_plant = @cultivar.get_first_plant
    @coordinates = first_plant.get_coordinates
    respond_to do |format|
      format.turbo_stream
    end
  end

  def coordinates
    @cultivar = Cultivar.find(params[:id])
    @first_plant = @cultivar.get_first_plant
    @coordinates = @first_plant.get_coordinates
    render json: @coordinates
  end 


  def query
    if request.referer == nil
      redirect_to controller: 'map', action: 'show_with_query', query: params[:query]
    else
      query_string = params[:query]
      @cultivars = Cultivar.where("name LIKE ?", "%#{query_string}%")
      respond_to do |format|
        format.turbo_stream
      end
    end 
  end

end
