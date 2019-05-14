#! env node
import fs from 'fs';

import Markov from '../src/markov';

const FILENAME = 'data/kingjamesbible.txt';
// const FILENAME = 'data/wwii.txt';
const markov = new Markov({historyLength: 2});

fs.readFile(FILENAME, (err, data) => {
  if (err) throw err;
  
  markov.process(data);

  const generator = markov.buildGenerator();
  console.log(generator.generate(150));
});
