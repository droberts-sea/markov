import {toBeDeepCloseTo,toMatchCloseTo} from 'jest-matcher-deep-close-to';
import { log } from 'core-js';
expect.extend({toBeDeepCloseTo, toMatchCloseTo});

import Markov from '../src/markov';

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

describe('normalizeTransitions', () => {
  test('individual numbers turn into 1', () => {
    const markov = new Markov({transitions: {
      '<start-document>': { the: 1 },
      the: { quick: 1 },
      quick: { brown: 2 },
      brown: { fox: 3 },
      fox: { '<end-document>': 1 },
      '<end-document>': {}
    }})

    const normalizedTransitions = markov.normalizeTransitions();
    expect(normalizedTransitions).toBeDeepCloseTo({
      '<start-document>': { the: 1.0 },
      the: { quick: 1.0 },
      quick: { brown: 1.0 },
      brown: { fox: 1.0 },
      fox: { '<end-document>': 1.0 },
      '<end-document>': {}
    }, 3)
  })

  test('transitions are normalized appropriately', () => {
    const markov = new Markov({transitions: {
      '<start-document>': { the: 1 },
      the: { quick: 1, brown: 2, fox: 1 },
      quick: { brown: 2, quick: 2 },
      brown: { fox: 1, the: 1, brown: 1, quick: 7 },
      fox: { '<end-document>': 1 },
      '<end-document>': {}
    }})

    const normalizedTransitions = markov.normalizeTransitions();
    expect(normalizedTransitions).toBeDeepCloseTo({
      '<start-document>': { the: 1.0 },
      the: { quick: .25, brown: .5, fox: .25 },
      quick: { brown: .5, quick: .5 },
      brown: { fox: .1, the: .1, brown: .1, quick: .7 },
      fox: { '<end-document>': 1.0 },
      '<end-document>': {}
    }, 3)
  })
})

describe('artifact generation', () => {
  test('generates the source text if given no repeated words', () => {
    const markov = new Markov();
    const text = "The quick brown fox";
    const wordCount = text.split(' ').length
    markov.process(text);

    let artifact = markov.generate(2);
    expect(artifact).toEqual("The quick");

    artifact = markov.generate(wordCount);
    expect(artifact).toEqual(text);
  })

  test('stops early if asked for more words than it can give', () => {
    const markov = new Markov();
    const text = "The quick brown fox";
    markov.process(text);

    const artifact = markov.generate(100);
    expect(artifact).toEqual(text);
  })

  test('generates documents of varying length', () => {
    const markov = new Markov();
    markov.process("onestep");
    markov.process("two steps");
    markov.process("three whole steps");
    const artifacts = [];
    for (let i = 0; i < 1000; i++) {
      artifacts.push(markov.generate(3));
    }
    const artifact_lengths = new Set(artifacts.map(art => art.split(' ').length));
    expect(artifact_lengths.size).toBe(3)
  })
})