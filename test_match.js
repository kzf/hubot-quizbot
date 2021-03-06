var Question = require('./scripts/quizbot/question.js')

function testAnswer(message, response, testValue) {
  var q = new Question(1, '', response);
  var result = q.checkResponse(message);
  if (result === testValue) {
    console.log('passed');
  } else {
    console.log('Test Failed: ', message, '=!=', response, '(', result, ')');
    console.log('------------------------------------');
    q.checkResponse(message, true)
    console.log('------------------------------------');
  }
}


testAnswer('red', 'red', true)
testAnswer('rod', 'red', false)
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
testAnswer('canvass', 'a canvas', 'close');
testAnswer('canvasse', 'a canvas', false);
testAnswer('tiger lily', 'the Aztecs', false);
testAnswer('trix is for keeds!', '"The Wizard of Oz"', false);
testAnswer('carrot', 'carrots', true);
testAnswer('ashton kutcher and demi moorse', 'ashton kutcher and demi moore', true);
testAnswer('ashton kutcher demi moorse', 'ashton kutcher and demi moore', true);
testAnswer('aston kotcher dami moorse', 'ashton kutcher and demi moore', 'close');
testAnswer('i cant help love with you', 'i cant help falling in love with you', false);
testAnswer('i cant help falling', 'i cant help falling in love with you', 'close');
testAnswer('i can pleh fullin low vit you', 'i cant help falling in love with you', false);
testAnswer('i can help falling in lve with you', 'i cant help falling in love with you', true);
testAnswer('the preponderance of evidence', 'evidence', true);
testAnswer('the spirelles', 'the supremes', false);
testAnswer('tetanus racket', 'a tennis racket', 'close');
testAnswer('bobby juner', 'bobby jones', 'close');
testAnswer('the untitld kingdom', 'the United Kingdom', 'close');
testAnswer('opens and closes', 'open & close', true); // something with plurals?


// testAnswer('', 'red', false)
//
// // testAnswer('Mr Rogers', 'Rogers', true)
