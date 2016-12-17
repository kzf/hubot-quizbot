docker run --name db -d mongo:3.0 --smallfiles

docker run --name rocketchat -p 80:3000 --env ROOT_URL=http://localhost --link db -d rocket.chat
