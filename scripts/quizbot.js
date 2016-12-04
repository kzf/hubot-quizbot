// Description:
//   Asks questions and listens for the correct answers
//
// Configuration:
//   LIST_OF_ENV_VARS_TO_SET
//
// Commands:
//   hubot score - Gives the user's current score
//   hubot leaderboard - Gives the leaderboard
//   hubot endround - Ends the current round
//   hubot ask (\d+) - Asks a number of questions
//   hubot skip - Skips all currently open questions
//
// Notes:
//   <optional notes required for the script>
//
// Author:
//   kzf

var Quiz = require('./quizbot/quiz.js');

module.exports = function (robot) {
  var quiz = new Quiz({
    forfeitTime: 10,
  });

  robot.respond(/start/i, function (res) {
    if (!quiz.hasStarted()) {
      quiz.start();
    } else {
      res.send("The quiz has already started!");
    }
  });

  robot.respond(/stop/i, function (res) {
    if (quiz) {
      quiz.stop();
      res.send("The quiz has been stopped");
    } else {
      res.send("The quiz is already stopped!");
    }
  });

  robot.respond(/score/i, function (res) {
    // TODO: Retrieve user's scores
    var userScore = 5;
    res.reply("your score is " + userScore);
    quiz.showScore();
  });

  robot.respond(/ask (\d+)/i, function(res) {
    var n = res.match[1];
    // TODO: Ask N questions;
    res.send("I am going to ask " + n + " questions");
    for (var i = 0; i < n; i++) {
      quiz.askQuestion();
    }
  });

  robot.respond(/skip/i, function(res) {
    // TODO: Skip all open questions
    res.send("I am going to skip all open questsions");
  });

  robot.respond(/leaderboard/i, function(res) {
    // TODO: Show leaderboard
    res.send("I am going to skip all open questsions");
  });

  robot.respond(/endround/i, function(res) {
    // TODO: End the round
    res.send("I am going to end the current round");
  });
};
