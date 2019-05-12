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

export { WHITESPACE, ESCAPES };