#! env node

const fs = require('fs');

const Markov = require('../lib/markov');

// const FILENAME = 'data/kingjamesbible.txt';
const FILENAME = 'data/wwii.txt';
const markov = new Markov();

fs.readFile(FILENAME, (err, data) => {
  if (err) throw err;

  markov.process(data);
  console.log(markov.generate(100));
});