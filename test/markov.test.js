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

  test('one repeated word', () => {
    const markov = new Markov();
    const text = "the quick brown quick fox";
    const expected_transitions = {
      '<start-document>': { the: 1 },
      the: { quick: 1 },
      quick: { brown: 1, fox: 1 },
      brown: { quick: 1 },
      fox: { '<end-document>': 1 },
      '<end-document>': {}
    }
    markov.process(text);
    expect(markov.transitions).toEqual(expected_transitions);
  })

  test('one word repeated several times', () => {
    const markov = new Markov();
    const text = "the quick quick quick quick fox quick";
    const expected_transitions = {
      '<start-document>': { the: 1 },
      the: { quick: 1 },
      quick: { quick: 3, fox: 1, '<end-document>': 1 },
      fox: { quick: 1 },
      '<end-document>': {}
    }
    markov.process(text);
    expect(markov.transitions).toEqual(expected_transitions);
  })

  test('several repeated words', () => {
    const markov = new Markov();
    const text = "the quick brown fox quick brown fox quick brown fox fox brown quick";
    const expected_transitions = {
      '<start-document>': { the: 1 },
      the: { quick: 1 },
      quick: { brown: 3, '<end-document>': 1 },
      brown: { fox: 3, quick: 1 },
      fox: { quick: 2, fox: 1, brown: 1 },
      '<end-document>': {}
    }
    markov.process(text);
    expect(markov.transitions).toEqual(expected_transitions);
  })
})