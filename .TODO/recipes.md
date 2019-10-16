# Recipes

- Custom settings/connection
https://github.com/eventide-examples/account-basics/blob/supplied-session/service.rb#L205-L221

- ActiveRecord transaction
Retry.(MessageStore::ExpectedVersion::Error) do
  ActiveRecord::Base.transaction do
    user.save
    Messaging::Postgres::Write(user_saved, user_stream_name, expected_version: user_version)
  end
end
