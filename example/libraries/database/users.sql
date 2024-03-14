CREATE TABLE if NOT EXISTS "users" (
  id auto primary key,
  username text,
  full_name text,
  photo text,
  hash_password text
)