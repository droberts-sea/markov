import dbg from 'debug';
const debug = dbg('tokenizer');

const WHITESPACE = {
  BEFORE: 'before',
  AFTER: 'after',
  BOTH: 'both',
  NONE: 'none',
  DEFAULT: 'after'
}

const ESCAPES = {
  paragraph: {
    pattern: /\n\n+/g,
    artifact: '\n\n',
    whitespace: WHITESPACE.NONE,
    capitalizeNext: true
  },
  'wiki-citation': {
    pattern: /\[.\]/g,
    buildArtifact: () => {
      const citationNo = Math.ceil(Math.random() * 25);
      return `[${citationNo}]`;
    }
  },
  'bible-line-verse': {
    pattern: /\d+:\d+/g
  },
  period: {
    pattern: /\./g,
    artifact: '.',
    capitalizeNext: true
  },
  comma: {
    pattern: /,/g,
    artifact: ','
  },
  colon: {
    pattern: /:/g,
    artifact: ':'
  },
  semicolon: {
    pattern: /;/g,
    artifact: ';'
  }
};

function* tokenize(text) {
  text = text.trim().toLowerCase();
  
  for (const name in ESCAPES) {
    const token = ESCAPES[name];
    text = text.replace(token.pattern, ` <${name}> `);
  }

  const tokens = text.split(/\s+/);
  for (const token of tokens) {
    if (token === "") continue;

    yield token;
  }
  return;
}

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const assemble = (tokens) => {
  let artifact = "";
  let previousWhitespace = WHITESPACE.NONE;
  let capitalizeNext = true;

  tokens.forEach(token => {
    

    const match = token.match(/^<(.*)>$/);
    if (match) {
      // Special token!
      const escapeName = match[1];
      const escape = ESCAPES[escapeName];

      if (escape) {
        if ((previousWhitespace === WHITESPACE.AFTER ||
          previousWhitespace === WHITESPACE.BOTH) &&
          (escape.whitespace === WHITESPACE.BEFORE ||
            escape.whatespace === WHITESPACE.BOTH)) {
          artifact += " ";
        }

        if (escape.artifact) {
          token = escape.artifact;
        } else if (escape.buildArtifact) {
          token = escape.buildArtifact();
        } else {
          throw new Error(`No artifact defined for escape sequence '${escapeName}'`)
        }

        artifact += token;

        if (escape.capitalizeNext) {
          // only toggle on, so that multiple escapes don't accidentally turn off capitalization
          capitalizeNext = true;
        }

        previousWhitespace = escape.whitespace || WHITESPACE.DEFAULT;

      } else {
        debug(`WARNING: found unknown escape sequence '${escapeName}'. Treating like a normal word.`);
        artifact += token;
        previousWhitespace = WHITESPACE.DEFAULT;
      }

    } else {
      // Normal word
      if (previousWhitespace === WHITESPACE.AFTER ||
        previousWhitespace === WHITESPACE.BOTH) {
        artifact += " ";
      }

      if (capitalizeNext) {
        token = capitalize(token);
        capitalizeNext = false;
      }
      artifact += token;
      previousWhitespace = WHITESPACE.BOTH;
    }

  });

  return artifact;
}

export { tokenize, assemble };