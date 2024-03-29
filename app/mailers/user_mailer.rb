class UserMailer < ApplicationMailer

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.user_mailer.magic_link.subject
  #
  def magic_link(user)
    @user = user

    mail to: user.email, subject: "Here's your BBG Roses ✨magic link✨!"
  end
end
