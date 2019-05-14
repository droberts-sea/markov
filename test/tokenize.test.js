/* eslint-disable no-constant-condition */
import tokenize from '../src/tokenize';

const verifyTokenization = (text, expectedTokens) => {
  const tokenStream = tokenize(text);
  const tokens = [];
  let result;
  while (true) {
    result = tokenStream.next();
    if (result.done) break;

    tokens.push(result.value);
  }
  
  expect(tokens).toEqual(expectedTokens);
}

test('is a generator function', () => {
  const text = 'the quick brown fox';
  const expectedTokens = ['the', 'quick', 'brown', 'fox']

  verifyTokenization(text, expectedTokens);
})

test('converts everything to lower case', () => {
  const text = 'the Quick BROWN fOx';
  const expectedTokens = ['the', 'quick', 'brown', 'fox']

  verifyTokenization(text, expectedTokens);
})

test('repeated space is ignored', () => {
  const text = 'the  quick brown    fox';
  const expectedTokens = ['the', 'quick', 'brown', 'fox']

  verifyTokenization(text, expectedTokens);
})

test('single newline is ignored', () => {
  const text = '\nthe \nquick\nbrown \n fox\n';
  const expectedTokens = ['the', 'quick', 'brown', 'fox']

  verifyTokenization(text, expectedTokens);
})

test('multiple newlines mark a paragraph', () => {
  const text = 'the\n\nquick\n\n\nbrown \n\n fox';
  const expectedTokens = ['the', '<paragraph>', 'quick', '<paragraph>', 'brown', '<paragraph>', 'fox']

  verifyTokenization(text, expectedTokens);
})

test('counts CR and CRLF as newlines', () => {
  const text = '\r\nthe\r\n\r\nquick\r\rbrown\r\nfox\rjumped\r\n\r\n\r\nover';
  const expectedTokens = [
    'the',
    '<paragraph>',
    'quick',
    '<paragraph>',
    'brown',
    'fox',
    'jumped',
    '<paragraph>',
    'over'
  ];
  verifyTokenization(text, expectedTokens);
})

test('punctuation is escaped', () => {
  const text = 'the. quick, brown: fox; .jumped ,over, :the ; lazy dog';
  const expectedTokens = ['the', '<period>', 'quick', '<comma>', 'brown', '<colon>', 'fox', '<semicolon>', '<period>', 'jumped', '<comma>', 'over', '<comma>', '<colon>', 'the', '<semicolon>', 'lazy', 'dog'];
  verifyTokenization(text, expectedTokens);
})

test('wikipedia citations are escaped', () => {
  const text = 'the quick[3] brown fox[9][22] jumped.[1][4]';
  const expectedTokens = ['the', 'quick', '<wiki-citation>', 'brown', 'fox', '<wiki-citation>', '<wiki-citation>', 'jumped', '<period>', '<wiki-citation>', '<wiki-citation>']
  verifyTokenization(text, expectedTokens);
})

test('parentheses are escaped', () => {
  const text = '(the ((quick brown) fox ) jumped ()())( over';
  const expectedTokens = ['<open-paren>', 'the', '<open-paren>', '<open-paren>', 'quick', 'brown', '<close-paren>', 'fox', '<close-paren>', 'jumped', '<open-paren>', '<close-paren>', '<open-paren>', '<close-paren>', '<close-paren>', '<open-paren>', 'over']

  verifyTokenization(text, expectedTokens);
});

test('bible verses are escaped', () => {
  const text = '3:18 the quick; 3:19 brown fox.\n\n4:1 jumped over 4:2 the lazy 4:3 4:4';
  const expectedTokens = [
    '<bible-line-verse>',
    'the',
    'quick',
    '<semicolon>',
    '<bible-line-verse>',
    'brown',
    'fox',
    '<period>',
    '<paragraph>',
    '<bible-line-verse>',
    'jumped',
    'over',
    '<bible-line-verse>',
    'the',
    'lazy',
    '<bible-line-verse>',
    '<bible-line-verse>'
  ];
  verifyTokenization(text, expectedTokens);
})