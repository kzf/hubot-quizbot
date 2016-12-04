docker run -it -e ROCKETCHAT_URL=rocketchat:3000 \
    -e ROCKETCHAT_ROOM='YOUR_ROOM_HERE' \
    -e LISTEN_ON_ALL_PUBLIC=true \
    -e ROCKETCHAT_USER=YOUR_USER_HERE \
    -e ROCKETCHAT_PASSWORD=YOUR_PASSWORD_HERE \
    -e ROCKETCHAT_AUTH=password \
    -e BOT_NAME=quizbot \
    -e EXTERNAL_SCRIPTS=hubot-help \
    -v $PWD/scripts:/home/hubot/scripts \
    -v $PWD/questions:/home/hubot/questions \
    -e QUIZBOT_FORFEIT_TIME=5 \
    -e QUIZBOT_QUESTIONS_FILE=/home/hubot/questions/questions.json \
    --link rocketchat \
    rocketchat/hubot-rocketchat
