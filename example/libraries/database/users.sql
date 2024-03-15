CREATE TABLE if NOT EXISTS "users" (
  uuid text primary key,
  user_name text,
  full_name text,
  hash_password text
)