const Markov = require('../src/markov');

test('can be instantiated', () => {
  const markov = new Markov();
  expect(markov.constructor.name).toBe('Markov');
})