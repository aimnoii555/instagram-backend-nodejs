curl --location 'http://localhost:5050/api/v1/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{"username":"join","email":"join@example.com","password":"123456"}'

curl --location 'http://localhost:5050/api/v1/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{"email":"ais@example.com","password":"123456"}'
