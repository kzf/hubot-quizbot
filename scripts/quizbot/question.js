var Question = function(content, answer) {
  this.content = content;
  this.answer = answer;
  this.answered = false;
};

Question.prototype.checkResponse = function(response) {
  if (response == answer) {
    return true;
  } else {
    return false;
  }
};

Question.prototype.getQuestionMessage = function() {
  return "Question: " + this.content;
};

Question.prototype.getAnswerMessage = function() {
  return "The answer was: **" + this.answer + "**";
};

Question.prototype.getCorrectAnswerMessage = function(user) {
  return user + " got the correct answer: **" + this.answer + "**";
};

module.exports = Question;
