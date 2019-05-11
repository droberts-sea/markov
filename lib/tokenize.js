const SPECIAL_TOKENS = [{
  pattern: /\n\n+/g,
  escape: 'paragraph'
}, {
  pattern: /\[.\]/g,
  escape: 'wiki-citation'
}, {
  pattern: /\d+:\d+/g,
  escape: 'bible-line-verse'
}, {
  pattern: /\./g,
  escape: 'period'
}, {
  pattern: /,/g,
  escape: 'comma'
}, {
  pattern: /:/g,
  escape: 'colon'
}, {
  pattern: /;/g,
  escape: 'semicolon'
}];

function* tokenize(text) {
  // Find paragraph breaks
  text = text.trim();

  // Find punctuation
  SPECIAL_TOKENS.forEach(special => {
    text = text.replace(special.pattern, ` <${special.escape}> `);
  });

  const tokens = text.split(/\s+/);
  for (const token of tokens) {
    if (token === "") continue;

    yield token;
  }
  return;
}

export default tokenize;