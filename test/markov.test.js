const Markov = require('../src/markov');

test('can be instantiated', () => {
  const markov = new Markov();
  expect(markov.constructor.name).toBe('Markov');
})

describe('transition table construction', () => {
  test('no repeat words', () => {
    const markov = new Markov();
    const text = "the quick brown fox";
    const expected_transitions = {
      '<start-document>': { the: 1 },
      the: { quick: 1 },
      quick: { brown: 1 },
      brown: { fox: 1 },
      fox: { '<end-document>': 1 },
      '<end-document>': {}
    }
    markov.process(text);
    expect(markov.transitions).toEqual(expected_transitions);
  })

})