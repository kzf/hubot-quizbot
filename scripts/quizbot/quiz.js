var Question = require('./question.js'),
    _;

var Quiz = function(options) {
  // Load options
  this.FORFEIT_TIME = options.FORFEIT_TIME;
  this.scores = options.scores;
  this.sendMessage = options.sendMessage;
  this.allQuestions = options.allQuestions;
  this.loadScores = options.loadScores;
  this.saveScores = options.saveScores;

  // TODO: DONT Passing through global things...
  _ = options._;

  // Set up internal properties
  this.started = false;
  this.questions = [];
  try {
    this.scores = this.loadScores();
  } catch (e) {
    this.sendMessage("Could not load scores");
    throw 1;
  }
};

// TODO: The start/stop functionality is not really needed, until we work
//       on the autoquiz functionality

Quiz.prototype.hasStarted = function() {
  !!this.started;
};

Quiz.prototype.start = function() {
  this.started = true;
};

Quiz.prototype.stop = function() {
  this.started = false;
};

Quiz.prototype.skip = function() {
  this.questions.forEach(function(q) {
    this.forfeitQuestion(q);
  }.bind(this));
  this.questions = [];
};

Quiz.prototype.showScore = function(user) {
  var score = this.scores[user.name] || 0;
  this.sendMessage("@" + user.name + " your score is " + score);
};

Quiz.prototype.showLeaderboard = function(user) {
  var sorted = _.sortBy(_.pairs(this.scores), function(pair) {
    return pair[1];
  });
  var msg = "";
  _.each(sorted, function(pair, i) {
    msg += "" + (i+1) + ". " + pair[0] + ": " + pair[1] + "\n";
  });
  this.sendMessage(msg);
};

Quiz.prototype.askQuestion = function() {
  if (this.allQuestions.length <= 0) {
    this.sendMessage("No more questions left to ask!");
    return;
  }

  var rawQuestion = this.allQuestions.shift();
  var newQuestion = new Question(rawQuestion.question, rawQuestion.answer);
  this.questions.push(newQuestion);

  // Send the message
  this.sendMessage(newQuestion.getQuestionMessage());

  // Set up a timeout to forfeit the question if it isn't answered
  // TODO: Memory leak here with newQuestion
  setTimeout(function() {
    this.forfeitQuestion(newQuestion);
  }.bind(this), this.FORFEIT_TIME * 1000);
};

Quiz.prototype.repeatQuestions = function() {
  this.questions.forEach(function(q) {
    this.sendMessage(q.getQuestionMessage());
  }.bind(this));
};

Quiz.prototype.checkResponse = function(response, userID) {
  // If called without a userID, will just return true if the response matches
  // any of the open questions. Otherwise, will handle closing the question
  // and assigning points to the user
  var correctQuestion = _.find(this.questions, function(question) {
    question.checkResponse(response);
  });
  if (correctQuestion && userID) {
    this.sendMessage(correctQuestion.getCorrectAnswerMessage(userID));
    this.forfeitQuestion(correctQuestion);
    // TODO: Assign points to userID
  } else {
    return !!correctQuestion;
  }
};

Quiz.prototype.forfeitQuestion = function(question) {
  if (!question.answered) {
    // Mark this question as answered
    question.answered = true;
    this.sendMessage(question.getAnswerMessage());

    // Remove it from the questions array
    var i = this.questions.indexOf(question);
    this.questions.splice(i, 1);
  }
};

module.exports = Quiz;
