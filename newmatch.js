var _ = require('underscore');
var natural = require('natural');

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
    insertion_cost: 1, deletion_cost: 0.5, substitution_cost: 1
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

function checkAnswer(message, response, verbose) {
  var len = Math.min(message.length, response.length);
  var normalMessage = normalize(message),
      normalResponse = normalize(response),
      respNoParens = removeParens(response),
      normalRespNoParens = normalize(respNoParens);
  var score1 = matchScore(normalMessage, normalResponse, 8, verbose)/Math.min(message.length, response.length);
  var score2 = matchScore(normalMessage, normalRespNoParens, 8, verbose)/Math.min(message.length, respNoParens.length);
  if (verbose) console.log('comparing', normalMessage, normalResponse);
  if (verbose) console.log('comparing', normalMessage, normalRespNoParens);
  if (verbose) console.log('got score', score1, score2);
  var sc = Math.min(score1, score2);
  if (sc < 0.2) return true;
  if (sc < 0.6) return 'close';
  if (normalMessage.length >= 5 && normalResponse.indexOf(normalMessage) >= 0) return 'close';
  return false;
}

function testAnswer(message, response, testValue) {
  var result = checkAnswer(message, response);
  if (result === testValue) {
    console.log('passed');
  } else {
    console.log('Test Failed: ', message, '=!=', response, '(', result, ')');
    console.log('------------------------------------');
    checkAnswer(message, response, true);
    console.log('------------------------------------');
  }
}


testAnswer('red', 'red', true)
testAnswer('rod', 'red', 'close')
testAnswer('strumming', 'Strumming', true)
testAnswer('strummin', 'Strumming', true)
testAnswer('', 'red', false)
testAnswer('r', 'red', false)
testAnswer('thud', 'T-H-U-D', true)
testAnswer('Mr Rogers', 'Rogers', true)
testAnswer('Mr. Rogers', 'rogers', true)
testAnswer('dennis kusinich', 'Dennis (T.) Kusinich', true)
testAnswer('dennis t kusinich', 'Dennis (T.) Kusinich', true)
testAnswer('dennis kusinch', 'Dennis (T.) Kusinich', true)
testAnswer('denis kusinich', 'Dennis (T.) Kusinich', true)
testAnswer('des kusinich', 'Dennis (T.) Kusinich', 'close')
testAnswer('dennas kusinich', 'Dennis (T.) Kusinich', true)
testAnswer('someone red', 'Someone', true)
testAnswer('red cross', 'The Red Cross', true)
testAnswer('ford', '(Harold) Ford', true)
testAnswer('harold ford', '(Harold) Ford', true)
testAnswer('hardold ford', '(Harold) Ford', true)
testAnswer('harry ford', '(Harold) Ford', true)
testAnswer('harry', '(Harold) Ford', false)
testAnswer('Harold', '(Harold) Ford', 'close')
testAnswer('george carlin', 'KLM', false)
testAnswer('come on joon you are the tennis man', '(Arthur) Ashe', false)
testAnswer('come on joon you aseh tennis man', '(Arthur) Ashe', false)
testAnswer('peace and quiet', '"Peace of Mind"', 'close')
testAnswer('etaoi', 'i', false);
testAnswer('etaoinshrdlu', 'i', false);
testAnswer('the lion', 'the cowardly lion', false);
testAnswer('cool', 'kool', 'close');
testAnswer('nobel', 'nobel prizes', 'close');
testAnswer('new york yankees', 'neck', false);
testAnswer('canvasse', 'a canvas', 'close');


// testAnswer('', 'red', false)
//
// // testAnswer('Mr Rogers', 'Rogers', true)
