
***Register****
curl --location 'http://localhost:5050/api/v1/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{"username":"join","email":"join@example.com","password":"123456"}'

***login****
curl --location 'http://localhost:5050/api/v1/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{"email":"ais@example.com","password":"123456"}'

***logout****
curl --location 'http://localhost:5050/api/v1/auth/logout' \
--header 'Content-Type: application/json' \
--data '{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTAxNjUsImV4cCI6MTc1ODkwMjE2NX0.cWFQPD9UeU_PEq9vq91PFttIw2Hqdam389dwF7YZnB8",
  "all": true
}'

***Refresh token****
curl --location 'http://localhost:5050/api/v1/auth/refresh' \
--header 'Content-Type: application/json' \
--data '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJpYXQiOjE3NTYzMTA1MzUsImV4cCI6MTc1ODkwMjUzNX0.gmrUwm40AZQPOyRYwlvt6hsJsfED4Rqw4YeuvbRILM4"
}'

***get profile public****
curl --location 'http://localhost:5050/api/v1/users/test' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJ1c2VybmFtZSI6ImFpcyIsImlhdCI6MTc1NjM3MTc4NCwiZXhwIjoxNzU2MzcyNjg0fQ.xCYUzuIvGOg_Fv9529jRTnb-Q9_-7SX4Fwjzpg2KdE0' \
--data ''


***get my profile***
curl --location 'http://localhost:5050/api/v1/me' \
--data ''

***edit my profile***
curl --location --request PUT 'http://localhost:5050/api/v1/me' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJ1c2VybmFtZSI6ImFpbSIsImlhdCI6MTc1NjMxMTc0NSwiZXhwIjoxNzU2MzEyNjQ1fQ.ek3Ps2ktGNf3sOd3rZ4vgWGwlRNO5cZ2ojTfxYlWBH0' \
--data '{
  "name": "Natee",
  "bio": "hello world",
  "website": "natee.dev",
  "avatar_url": "https://cdn.example.com/u/1.jpg"
}'

***follow***
curl --location --request POST 'http://localhost:5050/api/v1/users/11/follow' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3NTYzNzQ1OTksImV4cCI6MTc1NjM3NTQ5OX0.NMB_Q10OHiNY44z1mgy-nrNaQi0Z57ILUkkaTRfQCxI' \
--data ''

***unfollow***
curl --location --request DELETE 'http://localhost:5050/api/v1/users/11/follow'

***get follower***
curl --location 'http://localhost:5050/api/v1/me' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJ1c2VybmFtZSI6ImFpbSIsImlhdCI6MTc1NjMxMTc0NSwiZXhwIjoxNzU2MzEyNjQ1fQ.ek3Ps2ktGNf3sOd3rZ4vgWGwlRNO5cZ2ojTfxYlWBH0' \
--data ''


***get following***
curl --location 'http://localhost:5050/api/v1/users/13/following?limit=20&offset=0' \
--data ''


***unlinke post***
curl --location --request DELETE 'http://localhost:5050/api/v1/posts/1/like'

***add post***
curl --location 'http://localhost:5050/api/v1/posts' \
--header 'Content-Type: multipart/form-data' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3NTYzMTU2MzYsImV4cCI6MTc1NjMxNjUzNn0.SIpFk6GdrIEb0mhhmmcRYYYjHSR7zJyHmGCEyPIkFtQ' \
--form 'caption="How are you today?"' \
--form 'location="Thailand"' \
--form 'files=@"/Users/mac/Downloads/13007570_1920_1080_30fps.mp4"'


***feed***
curl --location 'http://localhost:5050/api/v1/feed?limit=20&offset=0'

***like post***
curl --location --request POST 'http://localhost:5050/api/v1/posts/4/like' \
--data ''


***comment post***
curl --location 'http://localhost:5050/api/v1/posts/1/comments' \
--data '{
  "text": "สุดๆ",
  "parent_id": null
}'


***get comments***
curl --location --request GET 'http://localhost:5050/api/v1/posts/1/comments' \
--data '{
  "text": "สวยมาก!",
  "parent_id": null
}'

***search***
curl --location --request GET 'http://localhost:5050/api/v1/search?q=sunset&u=6&p=9' \
--header 'Content-Type: text/plain' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJ1c2VybmFtZSI6ImFpbSIsImlhdCI6MTc1NjMxNzUyMywiZXhwIjoxNzU2MzE4NDIzfQ.4o864MH4nIvAlTq4VpOAzrTEx3nRRDk4OQO1dp1JnOY' \
--data '{
  "text": "สวยมาก!",
  "parent_id": null
}'


***add story***
curl --location 'http://localhost:5050/api/v1/stories' \
--header 'Content-Type: multipart/form-data' \
--form 'file=@"/Users/mac/Downloads/20250824_0059_ภาพรักกลางสายฝน_remix_01k3c17qx9e9vttgvae435tm83.png"'

***get stories my follow***
curl --location 'http://localhost:5050/api/v1/stories' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJ1c2VybmFtZSI6ImFpcyIsImlhdCI6MTc1NjM2NTkwMSwiZXhwIjoxNzU2MzY2ODAxfQ.F_hRvS-MN5LWMuFgZ-KqtwtZ-8yAKWLVDYmtIuGDzbs'


***watch story***
curl --location --request POST 'http://localhost:5050/api/v1/stories/11/view'


***views stories***
curl --location 'http://localhost:5050/api/v1/users/11/stories'



***add reel***
curl --location 'http://localhost:5050/api/v1/reels' \
--header 'Content-Type: application/json' \
--form 'file=@"/Users/mac/Downloads/13007570_1920_1080_30fps.mp4"' \
--form 'caption="อากาศดีมาก"'

***get reels***
curl --location 'http://localhost:5050/api/v1/reels?limit=20&offset=0'


***like reel***
curl --location --request POST 'http://localhost:5050/api/v1/reels/1/like' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyLCJ1c2VybmFtZSI6ImFpbSIsImlhdCI6MTc1NjM2NzIyMCwiZXhwIjoxNzU2MzY4MTIwfQ.mAcjiHu8VIggXF3r70NaFv3jVlzANvkoJZChL45s0Hg'


***unlike reel***
curl --location --request DELETE 'http://localhost:5050/api/v1/reels/1/like'

***get notifcaiton***
curl --location 'http://localhost:5050/api/v1/notifications?limit=20&offset=0'

***request user private***
curl --location --request POST 'http://localhost:5050/api/v1/users/11/follow' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJ1c2VybmFtZSI6ImFpcyIsImlhdCI6MTc1NjM3NDY1MSwiZXhwIjoxNzU2Mzc1NTUxfQ.odCT_B4sRTa12i2YMyO53mJZgHUjOr6Sws7pwvAFweU'

***cancel request user private***
curl --location --request DELETE 'http://localhost:5050/api/v1/users/11/follow'

***get my request follow***
curl --location 'http://localhost:5050/api/v1/me/follow-requests' \
--header 'Content-Type: application/json' \
--data ''


***accept follow***
curl --location --request POST 'http://localhost:5050/api/v1/follow-requests/14/accept' \
--header 'Content-Type: application/json' \
--data ''


***decline follow***
curl --location --request POST 'http://localhost:5050/api/v1/follow-requests/14/decline'

***open profile is not followed***
curl --location 'http://localhost:5050/api/v1/users/11/posts' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJ1c2VybmFtZSI6ImFpcyIsImlhdCI6MTc1NjM3NTAyMiwiZXhwIjoxNzU2Mzc1OTIyfQ.mCg-UB33BfUIDCsY9bwj7PVAO3uwJbuqMpkkP3GjsXk'
