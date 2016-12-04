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
//   hubot repeat - Repeats all currently open questions
//
// Notes:
//   <optional notes required for the script>
//
// Author:
//   kzf

var Quiz = require('./quizbot/quiz.js'),
    _ = require('underscore'),
    Fs = require("fs");


module.exports = function (robot) {
  var sendMessage = function(arg1, arg2) {
    var opts = {room: process.env.ROCKETCHAT_ROOM},
        msg;
    if (arg2) {
      msg = arg2;
      opts = _.extend(opts, arg1);
    } else {
      msg = arg1;
    }
    robot.send(opts, msg);
  };

  //
  //  ENVIORNMENT VARIABLE CHECKS
  //
  if (!process.env.QUIZBOT_QUESTIONS_FILE) {
    sendMessage("Cannot start: questions file was not provided");
    throw 1;
  }

  //
  //  INITIAL SETUP
  //
  var allQuestions;
  try {
    allQuestions = JSON.parse(Fs.readFileSync(process.env.QUIZBOT_QUESTIONS_FILE));
    allQuestions = _.shuffle(allQuestions);
  } catch (e) {
    sendMessage("Cannot start: could not read questions file");
    throw 1;
  }

  var scores;
  try {
    scores = JSON.parse(Fs.readFileSync(process.env.QUIZBOT_SCORES_FILE));
  } catch (e) {
    scores = {};
  }

  var saveScores = function(newScores) {
    try {
      Fs.writeFileSync(process.env.QUIZBOT_SCORES_FILE, JSON.stringify(newScores), 'utf8');
    } catch (e) {
      sendMessage("Cannot save scores to file!");
    }
  };

  var quiz = new Quiz({
    FORFEIT_TIME: process.env.QUIZBOT_FORFEIT_TIME || 60,
    allQuestions: allQuestions,
    sendMessage: sendMessage,
    saveScores: saveScores,
    scores: scores,
  });

  //
  //  DEFINE ALL HUBOT COMMANDS
  //
  robot.listen(function (msg) {
    return quiz.checkResponse(msg.text);
  }, function(res) {
    quiz.checkResponse(res.envelope.message.text, res.envelope.user);
  });

  robot.respond(/score/i, function (res) {
    quiz.showScore(res.envelope.user);
  });

  robot.respond(/leaderboard/i, function(res) {
    quiz.showLeaderboard();
  });

  robot.respond(/ask (\d+)/i, function(res) {
    var n = res.match[1];
    for (var i = 0; i < n; i++) {
      quiz.askQuestion();
    }
  });

  robot.respond(/repeat/i, function(res) {
    quiz.repeatQuestions();
  });

  robot.respond(/skip/i, function(res) {
    quiz.forfeitQuestions();
  });

  robot.respond(/endround/i, function(res) {
    quiz.resetScores();
  });
};
