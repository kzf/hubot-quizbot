var Question = require('./question.js'),
    _ = require('underscore');

var Quiz = function(options) {
  // Load options
  this.FORFEIT_TIME = options.FORFEIT_TIME;
  this.scores = options.scores;
  this.sendMessage = options.sendMessage;
  this.allQuestions = options.allQuestions;
  this.loadScores = options.loadScores;
  this.saveScores = options.saveScores;

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

// Show score for one user
Quiz.prototype.showScore = function(user) {
  var score = this.scores[user.name] || 0;
  this.sendMessage("@" + user.name + " your score is " + score);
};

// Show points for every user in the system
Quiz.prototype.showLeaderboard = function() {
  var sorted = _.sortBy(_.pairs(this.scores), function(pair) {
    return pair[1];
  });
  var msg = "";
  _.each(sorted, function(pair, i) {
    msg += "" + (i+1) + ". " + pair[0] + ": " + pair[1] + "\n";
  });
  this.sendMessage(msg);
};

// Reset everybody's scores to zero
Quiz.prototype.resetScores = function() {
  this.sendMessage("The round is ending and scores will be reset. Here are the final standings:");
  this.showLeaderboard();
  // Revert scores to 0 for anybody who had a nonzero score, and drop anybody off the list if they had a zero score
  var nonZero = _.pick(this.scores, function(v) { return (v >= 0); });
  this.scores = _.mapObject(nonZero, function() { return 0; });
};

// Repeat all questions that are currently active
Quiz.prototype.repeatQuestions = function() {
  this.questions.forEach(function(q) {
    this.sendMessage(q.getQuestionMessage());
  }.bind(this));
};

// Ask a new question, push it onto the list of currently active questions
Quiz.prototype.askQuestion = function() {
  var rawQuestion, newQuestion, forfeitTimeout;

  if (this.allQuestions.length <= 0) {
    this.sendMessage("No more questions left to ask!");
    return;
  }

  rawQuestion = this.allQuestions.shift();
  newQuestion = new Question(rawQuestion.question, rawQuestion.answer);
  this.questions.push(newQuestion);

  // Send the message
  this.sendMessage(newQuestion.getQuestionMessage());

  // Set up a timeout to forfeit the question if it isn't answered
  // TODO: Memory leak here with newQuestion
  forfeitTimeout = setTimeout(function() {
    this.forfeitQuestion(newQuestion);
  }.bind(this), this.FORFEIT_TIME * 1000);
  newQuestion.forfeitTimeout = forfeitTimeout;
};

// Check a user's typed response for matches to any active questions
Quiz.prototype.checkResponse = function(response, user) {
  // If called without a userID, will just return true if the response matches
  // any of the open questions. Otherwise, will handle closing the question
  // and assigning points to the user
  var correctQuestion = _.find(this.questions, function(question) {
    return question.checkResponse(response);
  });
  if (correctQuestion && user) {
    this.sendMessage(correctQuestion.getCorrectAnswerMessage(user.name));
    correctQuestion.complete();
    this.forfeitQuestion(correctQuestion);
    // TODO: Assign points to user
    this.scores[user.name] += 5;
    this.saveScores();
  } else {
    return !!correctQuestion;
  }
};

// Forfeit a question, revealing the answer if it was still open and closing it
Quiz.prototype.forfeitQuestion = function(question) {
  if (!question.answered) {
    // Mark this question as answered
    question.complete();
    this.sendMessage(question.getAnswerMessage());
  }
  // Remove it from the questions array
  var i = this.questions.indexOf(question);
  if (i >= 0) this.questions.splice(i, 1);
};

// Forfeit all questions that are currently active
Quiz.prototype.forfeitQuestions = function() {
  this.questions.forEach(function(q) {
    this.forfeitQuestion(q);
  }.bind(this));
};

module.exports = Quiz;
