var natural = require('natural');

// Answer matching

function normalize(string) {
  return string.toLowerCase()
               .replace(/\b(a|an|the|in|of|it|its|his|her|hers)\b/gi,'')
               .replace(/[^\w\s]/gi, '')
               .trim();
}

function removeParens(string) {
  return string.replace(/\([^\)]*\)/gi, '');
}

function matchScore(message, response, earlyExitThreshold, verbose) {
  if (message === '' || response === '') return Infinity;
  var baseScore = natural.LevenshteinDistance(message, response, {
    insertion_cost: 1, deletion_cost: 0.65, substitution_cost: 1
  });
  if (verbose) console.log('baseScore:    [', message, '<=>', response, '] is', baseScore);
  // natural.JaroWinklerDistance(message, response);
  if (baseScore == 0) return baseScore;
  if (earlyExitThreshold && (baseScore >= earlyExitThreshold)) return baseScore;
  // remove characters from left while it gets closer
  // remove from right while it gets closer
  var split = message.split(/\W+/);
  var left = split.slice(1).join(' ');
  var leftScore = left ? matchScore(left, response, baseScore) : Infinity;
  if (verbose) console.log('    leftScore : [', left, '<=>', response, '] is', leftScore);
  var right = split.slice(0, -1).join(' ');
  var rightScore = right ? matchScore(right, response, baseScore) : Infinity;
  if (verbose) console.log('    rightScore: [', right, '<=>', response, '] is', rightScore);
  return Math.min(baseScore, leftScore, rightScore);
}


function adjustScore(message, response, verbose) {
  var rawScore = matchScore(message, response, Infinity, verbose),
      length = Math.min(Math.pow(Math.min(message.length, response.length), 1.2)/1.6, 14);
  if (verbose) console.log('    ---adjust [', message, '<==>', response, '] from ('+rawScore+') to ('+rawScore/length+')')
  return rawScore/length;
}

function checkAnswer(message, response, verbose) {
  var len = Math.min(message.length, response.length);
  var normalMessage = normalize(message),
      normalResponse = normalize(response),
      respNoParens = removeParens(response),
      normalRespNoParens = normalize(respNoParens);
  var score1 = adjustScore(normalMessage, normalResponse, verbose);
  var score2 = adjustScore(normalMessage, normalRespNoParens, verbose);
  if (verbose) console.log('comparing', normalMessage, normalResponse);
  if (verbose) console.log('comparing', normalMessage, normalRespNoParens);
  if (verbose) console.log('got score', score1, score2);
  var sc = Math.min(score1, score2);
  if (sc < 0.2) return true;
  if (sc < 0.4) return 'close';
  if (normalMessage.length >= 5 && normalResponse.indexOf(normalMessage) >= 0) return 'close';
  return false;
}

// hints

function maskify(word, showFirst) {
  var spl = word.split('');
  var ret = showFirst ? spl[0] : '_';
  for (var i = 0; i < spl.length - 1; i++) {
    ret += " _";
  }
  return ret;
}

function getHint(response, level, verbose) {
  var split = response.split(/\b/);
  if (verbose) console.log('      Split: ', split);
  var i, tmp, words = 0, transformed = [];
  for (i = 0; i < split.length; i++) {
    if (split[i].match(/^\w+$/)) {
      if (level > 0) {
        transformed[i] = maskify(split[i], true);
        level--;
      } else {
        transformed[i] = maskify(split[i]);
      }
      words++;
    } else if (split[i].match(/^\s+$/)) {
      transformed[i] = ' / ';
    } else {
      transformed[i] = split[i];
    }
  }
  if (level >= words) return false;
  for (i = 0; i < split.length; i++) {
    if (split[i].match(/^\w+$/)) {
      if (level > 0) {
        transformed[i] = split[i];
        level--;
      }
    }
  }
  if (verbose) console.log('Transformed: ', transformed);
  return transformed.join('');
}

var Question = function(id, content, answer) {
  this.id = id;
  this.content = content;
  this.answer = answer;
  this.answered = false;
  this.forfeitTimeout = null;
  this.hintLevel = 0;
};

Question.prototype.complete = function() {
  this.answered = true;
  if (this.forfeitTimeout) clearTimeout(this.forfeitTimeout);
};

Question.prototype.checkResponse = function(response, verbose) {
  return checkAnswer(response, this.answer, verbose);
};

Question.prototype.getQuestionMessage = function() {
  return "**Q" + this.id + "** " + this.content;
};

Question.prototype.getAnswerMessage = function() {
  return "The answer to **Q" + this.id + "** was: **" + this.answer + "**";
};

Question.prototype.getCorrectAnswerMessage = function(user) {
  return "@" + user + " answered **Q" + this.id + "** correctly: **" + this.answer + "**";
};

Question.prototype.getCloseAnswerMessage = function(response, user) {
  return "**" + response + "** is close for **Q" + this.id + "**, keep trying @" + user;
};

Question.prototype.getHint = function(level) {
  return getHint(this.answer, level || this.hintLevel);
};

Question.prototype.improveHint = function() {
  this.hintLevel++;
};

module.exports = Question;
