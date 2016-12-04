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

  var loadScores = function() {
    // TODO: Get this from somewhere
    return {
      'kevinf': 12,
      'doris': 3,
      'rog': 71,
    };
  };

  var saveScores = function(newScores) {
    // TODO: Persistence
  };

  var quiz = new Quiz({
    FORFEIT_TIME: process.env.QUIZBOT_FORFEIT_TIME || 10,
    allQuestions: allQuestions,
    sendMessage: sendMessage,
    loadScores: loadScores,
    saveScores: saveScores,
    // TODO: Dont pass these things in!!!
    _: _,
  });

  //
  //  DEFINE ALL HUBOT COMMANDS
  //

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
    // TODO: Skip all open questions
    res.send("I am going to skip all open questsions");
  });

  robot.respond(/endround/i, function(res) {
    // TODO: End the round
    res.send("I am going to end the current round");
  });

  robot.listen(function (msg) {
    return quiz.checkResponse(msg);
  }, function(res) {
    quiz.checkResponse(msg, 'kevinf');
  });
};
