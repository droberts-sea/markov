#! env node

const Markov = require('../src/markov');

const FILENAME = 'data/wwii.txt';
const markov = new Markov();
markov.ingest(FILENAME);