var Question = require('./question.js');

var Quiz = function(options) {
  // Load options
  this.scores = options.scores;
  this.sendMessage = options.sendMessage;

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

Quiz.prototype.showScore = function() {

};

Quiz.prototype.askQuestion = function() {
  var newQuestion = Question.new();
  this.sendMessage(newQuestion.getQuestionMessage());
  this.questions.push(newQuestion);
};

module.exports = Quiz;
