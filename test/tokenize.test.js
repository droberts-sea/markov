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

test('punctuation is escaped', () => {
  const text = 'the. quick, brown: fox; .jumped ,over, :the ; lazy dog';
  const expectedTokens = ['the', '<period>', 'quick', '<comma>', 'brown', '<colon>', 'fox', '<semicolon>', '<period>', 'jumped', '<comma>', 'over', '<comma>', '<colon>', 'the', '<semicolon>', 'lazy', 'dog'];
  verifyTokenization(text, expectedTokens);
})

test('wikipedia citations are escaped', () => {
  const text = 'the quick[3] brown fox[9][22] jumped.[1][4]';
  const expectedTokens = ['the', 'quick', '<wiki-citation>', 'brown', 'fox', '<wiki-citation>', '<wiki-citation>', 'jumped', '<period>', '<wiki-citation>', '<wiki-citation>']
})