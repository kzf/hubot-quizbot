# hubot-quizbot

A hubot script for running a quiz with questions sourced from a simple JSON file.

The repository is set up for use with the _hubot-rocketchat_ docker image but you could just as easily take the contents of the _/scripts_ directory and use it in another hubot environment.

You will need a shared volume with the docker container to store the scores and questions. The scores are persisted as a simple JSON file in the shared volume.

## Setup:

Run an `npm install` in the scripts directory to install dependencies.

You can use `dockerlocal.sh` to start up a local docker instance, just change the configuration settings in _dockerlocal.sh.example_.

## Environment Variables:

* **QUIZBOT_SCORES_FILE** - Location of the scores file within the docker container.
* **QUIZBOT_QUESTIONS_FILE** - Location of the questions file within the docker container.
* **QUIZBOT_BANG_COMMANDS** - Set to true if you would like to address quizbot using !scores, !ask, rather than 'quizbot scores', 'quizbot ask' and so on.
* **QUIZBOT_FORFEIT_TIME** - Time (in seconds) before a question will automatically reveal the answer.
