var Question = require('./question.js');

var Quiz = function(options) {
  // Load options
  this.FORFEIT_TIME = options.FORFEIT_TIME;
  this.scores = options.scores;
  this.sendMessage = options.sendMessage;
  this.allQuestions = options.allQuestions;

  console.log('allqs', this.allQuestions);

  // Set up internal properties
  this.started = false;
  this.questions = [];
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

Quiz.prototype.showScore = function() {

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
