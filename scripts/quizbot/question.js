var Question = function(content, answer) {
  this.content = content;
  this.answer = answer;
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
