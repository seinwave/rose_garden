class UsersController < ApplicationController
  def new
  end

  def show
    @user = User.find(params[:id])
  end

  def create
    @user = User.new(user_params)

    if @user.save
      # handle a successful save
    else 
      render 'new', status: :unprocessable_entity
    end 
  end
  
  private 
    def user_params
      params.require(:user).permit(:first_name, :last_name, :email)
    end
end
