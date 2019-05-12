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
    pattern: /\[\d+\]/g,
    buildArtifact: () => {
      const citationNo = Math.ceil(Math.random() * 25);
      return `[${citationNo}]`;
    }
  },
  'bible-line-verse': {
    pattern: /\d+:\d+/g,
    buildArtifact:(() => {
      let book = Math.ceil(Math.random() * 10);
      let verse = Math.ceil(Math.random() * 20);
      return () => {
        verse += 1;
        if (verse > 15 && Math.random() > .8) {
          book += 1;
          verse = 1;
        }
        return `\n\n${book}:${verse}`;
      }
    })()
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
  },
  'open-paren': {
    pattern: /\(/g,
    artifact: '(',
    whitespace: WHITESPACE.BEFORE
  },
  'close-paren': {
    pattern: /\)/g,
    artifact: ')',
    whitespace: WHITESPACE.AFTER
  }
};

const DOCUMENT_TOKENS = {
  START_DOCUMENT: '<start-document>',
  END_DOCUMENT: '<end-document>'
}

export { WHITESPACE, ESCAPES, DOCUMENT_TOKENS };