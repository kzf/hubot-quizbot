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

function testHint(response, expected, level) {
  var result = getHint(response, level);
  if (result === expected) {
    console.log('passed');
  } else {
    console.log('Test Failed: ', result, '=!=', expected, '(', level, ')');
    console.log('------------------------------------');
    getHint(response, level, true);
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
