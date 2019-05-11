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

  test('repeated document', () => {
    const markov = new Markov();
    const text = "the quick brown fox";
    const expected_transitions = {
      '<start-document>': { the: 2 },
      the: { quick: 2 },
      quick: { brown: 2 },
      brown: { fox: 2 },
      fox: { '<end-document>': 2 },
      '<end-document>': {}
    }
    markov.process(text);
    markov.process(text);
    expect(markov.transitions).toEqual(expected_transitions);
  })

  test('different documents', () => {
    const markov = new Markov();
    const text1 = "the quick brown fox";
    const text2 = "jumped over the lazy dog";
    const expected_transitions = {
      '<start-document>': { the: 1, jumped: 1 },
      the: { quick: 1, lazy: 1 },
      quick: { brown: 1 },
      brown: { fox: 1 },
      fox: { '<end-document>': 1 },
      jumped: { over: 1 },
      over: { the: 1 },
      lazy: { dog: 1 },
      dog: { '<end-document>': 1 },
      '<end-document>': {}
    }
    markov.process(text1);
    markov.process(text2);
    expect(markov.transitions).toEqual(expected_transitions);
  })

  test('empty document by itself should match the initial state', () => {
    const markov = new Markov();
    const initialState = JSON.parse(JSON.stringify(markov.transitions));

    markov.process("");

    expect(markov.transitions).toEqual(initialState);
  })

  test('empty document is ignored', () => {
    const markov = new Markov();
    markov.process("the quick brown fox");
    const initialState = JSON.parse(JSON.stringify(markov.transitions));

    markov.process("");

    expect(markov.transitions).toEqual(initialState);
  })
})