var Question = require('./scripts/quizbot/question.js')

function testHint(response, expected, level) {
  var q = new Question(1, '', response);
  var result = q.getHint(level);
  if (result === expected) {
    console.log('passed');
  } else {
    console.log('Test Failed: ', result, '=!=', expected, '(', level, ')');
    console.log('------------------------------------');
    q.getHint(response, level, true);
    console.log('------------------------------------');
  }
}

testHint("The Moon", "T _ _ / _ _ _ _", 1);
testHint("The Moon", "T _ _ / M _ _ _", 2);
testHint("The Moon", "The / M _ _ _", 3);
testHint("The Moon", false, 4);
testHint('"Jon Snow"', '"J _ _ / _ _ _ _"', 1);
testHint('"Jon Snow"', '"J _ _ / S _ _ _"', 2);
testHint('"Jon Snow"', '"J _ _ / S _ _ _"', 2);
testHint('"Jon, Snow"', '"J _ _, S _ _ _"', 2);
