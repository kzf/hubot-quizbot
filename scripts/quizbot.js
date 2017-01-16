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

var MAX_BURST_MESSAGES = 5,
    BURST_INTERVAL     = 1200,
    MESSAGE_INTERVAL   = 40;

module.exports = function (robot) {
  var messageQueue = [];
  var sendMessage = function(arg1, arg2, attempts) {
    var opts = {room: process.env.ROCKETCHAT_ROOM},
        msg;
    if (arg2) {
      msg = arg2;
      opts = _.extend(opts, arg1);
    } else {
      msg = arg1;
    }
    messageQueue.push({opts: opts, msg: msg});
  };

  // Send messages in small bursts to prevent us from
  // hitting the system timeout, regardless of how many
  // times we have called sendMessage
  var i = 0;
  var sendMessages = function() {
    if (i === 0 && messageQueue.length > 0) {
      messageQueue.splice(0, MAX_BURST_MESSAGES).forEach(function(m) {
        robot.send(m.opts, m.msg);
      });
      i = Math.ceil(BURST_INTERVAL / MESSAGE_INTERVAL);
    }
    if (i > 0) i--;
  };
  setInterval(sendMessages, MESSAGE_INTERVAL);

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
    // We don't care at all if msg.text is undefined
    return !!msg.text;
  }, function(res) {
    quiz.checkResponse(res.envelope.message.text, res.envelope.user);
  });

  // Define commands
  // TODO: How can we avoid the ugly escaping here?
  var commands = {
    'score' : function (res) {
      quiz.showScore(res.envelope.user);
    },
    '(score|leader(board)?)s?' : function(res) {
      quiz.showLeaderboard();
    },
    'ask( \\d+)?( .*)?' : function(res) {
      quiz.askQuestions(res.match[1], res.match[2]);
    },
    'repeat' : function(res) {
      quiz.repeatQuestions();
    },
    'skip' : function(res) {
      quiz.forfeitQuestions();
    },
    'endround' : function(res) {
      quiz.resetScores();
    },
    'hints?( \\d+)?' : function(res) {
      quiz.getHints(res.match[1]);
    },
  };

  _.mapObject(commands, function(handler, command) {
    if (process.env.QUIZBOT_BANG_COMMANDS === 'true') {
      robot.hear(new RegExp("^!"+command+"$", 'i'), handler);
    } else {
      robot.respond(new RegExp(command, 'i'), handler);
    }
  });
};
