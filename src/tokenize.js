import dbg from 'debug';
const debug = dbg('tokenizer');

import { ESCAPES } from './tokens';

function* tokenize(text) {
  text = text.trim().toLowerCase();
  
  for (const name in ESCAPES) {
    const token = ESCAPES[name];
    text = text.replace(token.pattern, ` <${name}> `);
  }

  const tokens = text.split(/\s+/);
  for (const token of tokens) {
    if (token === "") continue;

    yield token;
  }
  return;
}

export default tokenize;