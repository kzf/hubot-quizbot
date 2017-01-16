var Question = require('./question.js'),
    _ = require('underscore');

var Quiz = function(options) {
  // Load options
  this.FORFEIT_TIME = options.FORFEIT_TIME;
  this.scores = options.scores;
  this.sendMessage = options.sendMessage;
  this.allQuestions = options.allQuestions;
  this.saveScores = options.saveScores;

  // Set up internal properties
  this.started = false;
  this.questions = [];
  this.scores = options.scores;
  this.questionCount = 0;
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

Quiz.prototype.resetQuestionCount = function() {
  if (this.questions.length == 0) this.questionCount = 0;
};

// Show score for one user
Quiz.prototype.showScore = function(user) {
  var score = this.scores[user.name] || 0;
  this.sendMessage("@" + user.name + " your score is " + score);
};

// Show points for every user in the system
Quiz.prototype.showLeaderboard = function() {
  var sorted = _.sortBy(_.pairs(this.scores), function(pair) {
    return -pair[1];
  });
  var msg = "";
  _.each(sorted, function(pair, i) {
    msg += "" + (i+1) + ". **" + pair[0] + "**: " + pair[1] + "\n";
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
  this.saveScores(this.scores);
};

// Repeat all questions that are currently active
Quiz.prototype.repeatQuestions = function() {
  this.questions.forEach(function(q) {
    this.sendMessage(q.getQuestionMessage());
  }.bind(this));
};

// Ask a new question, push it onto the list of currently active questions
Quiz.prototype.askQuestion = function(question) {
  var rawQuestion, newQuestion, forfeitTimeout;

  if (!question && this.allQuestions.length <= 0) {
    this.sendMessage("No more questions left to ask!");
    return;
  }

  rawQuestion = question || this.allQuestions.shift();
  newQuestion = new Question(++this.questionCount, rawQuestion.question, rawQuestion.response);
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

// Ask multiple questions
Quiz.prototype.askQuestions = function(_n, _category) {
  var n = parseInt(_n),
      category = _category && _category.trim();
  if (isNaN(n)) n = 1;
  if (n > 10) {
    this.sendMessage("I can't ask more than 10 questions at once!");
    return;
  }
  if (category) {
    return this.askQuestionsFromCategory(n, category);
  }
  for (var i = 0; i < n; i++) {
    this.askQuestion();
  }
};

Quiz.prototype.askQuestionsFromCategory = function(n, category) {
  var fromCategoryIndices = [],
      shuffled,
      reg = new RegExp(category, 'i');
  this.allQuestions.forEach(function(q, i) {
    if (q.question.match(reg)) {
      fromCategoryIndices.push(i);
    }
  });
  //
  qIndices = _.shuffle(fromCategoryIndices).slice(0, n);
  qIndices.sort(function (a,b) { return a - b; });

  var i, j;
  for (i = qIndices.length - 1; i >= 0; i--) {
    j = qIndices[i];
    this.askQuestion(this.allQuestions[j]);
    this.allQuestions.splice(j, 1);
  }

  if (qIndices.length < n) {
    this.sendMessage("I can't find any more questions for **" + category + "**");
  }
};

// Check a user's typed response for matches to any active questions
Quiz.prototype.checkResponse = function(response, user) {
  if (!user) return;
  var correctQuestion, oldScore;
  this.questions.forEach(function(question) {
    var check = question.checkResponse(response);
    if (check == true) {
      // Correct Answer
      this.sendMessage(question.getCorrectAnswerMessage(user.name));
      question.complete();
      this.forfeitQuestion(question);
      // Increment points by 5 for the correct answer
      oldScore = this.scores[user.name] || 0;
      this.scores[user.name] = oldScore + 5;
      this.saveScores(this.scores);
    } else if (check == 'close') {
      // Close Answer
      this.sendMessage(question.getCloseAnswerMessage(response, user.name));
    } else {
      // Wrong answer, do nothing
    }
  }.bind(this));
};

// Forfeit a question, revealing the answer if it was still open and closing it
Quiz.prototype.forfeitQuestion = function(question) {
  this._forfeitQuestionInternal(question);
  // Remove it from the questions array
  var i = this.questions.indexOf(question);
  if (i >= 0) this.questions.splice(i, 1);
  this.resetQuestionCount();
};

// Forfeit all questions that are currently active
Quiz.prototype.forfeitQuestions = function() {
  this.questions.forEach(function(q) {
    this._forfeitQuestionInternal(q);
  }.bind(this));
  this.questions = [];
  this.resetQuestionCount();
};

// What is actually involved in forefeiting a question
Quiz.prototype._forfeitQuestionInternal = function(question) {
  if (!question.answered) {
    // Mark this question as answered
    question.complete();
    this.sendMessage(question.getAnswerMessage());
  }
};

// Get hint(s) to open questions
Quiz.prototype.getHints = function(n) {
  n = n || 1;
  this.questions.forEach(function(q) {
    _.times(n, () => q.improveHint());
    var hint = q.getHint();
    if (hint) {
      this.sendMessage("**Q" + q.id + "** hint: `" + hint + "`");
    }
  }.bind(this));
};

module.exports = Quiz;
