var natural = require('natural');

function normalize(string) {
  return string.replace(/\b(a|an|the|in|of|it|its|his|her|hers)\b/gi,'')
               .replace(/[^\w]/gi, '')
               .replace(/\s/gi, '')
               .toLowerCase();
}

function removeParens(string) {
  return string.replace(/\([^\)]*\)/gi, '');
}

// Calculate score recursively by stripping letters off each side
// and seeing if it gets us closer to a match
function matchScore(message, response, earlyExitThreshold) {
  // Early exit if message or response is blank
  if (message === '' || response === '') return Math.INFINITY;
  var baseScore = natural.LevenshteinDistance(message, response, {
    insertion_cost: 1, deletion_cost: 0.5, substitution_cost: 1
  });
  if (baseScore == 0) return baseScore; // exact match
  // Early exit if score gets too big
  if (earlyExitThreshold && (baseScore >= earlyExitThreshold)) return baseScore;
  var leftScore = matchScore(message.substr(1), response, baseScore);
  var rightScore = matchScore(message.substr(0, message.length-1), response, baseScore);
  return Math.min(baseScore, leftScore, rightScore);
}

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
  var noParens = removeParens(this.answer);
  var score1 = matchScore(normalize(response), normalize(this.answer))/Math.min(response.length, this.answer.length);
  var score2 = matchScore(normalize(response), normalize(noParens))/Math.min(response.length, noParens.length);
  var correctAnswer = Math.min(score1, score2) < 0.2;

  if (correctAnswer) {
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
