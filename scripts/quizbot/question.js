var Question = function(content, answer) {
  this.content = content;
  this.answer = answer;
  this.answered = false;
  this.forfeitTimeout = null;
};

Question.prototype.complete = function() {
  this.answered = true;
  if (this.forfeitTimeout) clearTimeout(this.forfeitTimeout);
};

Question.prototype.checkResponse = function(response) {
  console.log('Checking resp::::', response, 'vs', this.answer);
  if (response === this.answer) {
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
