const debug = require('debug')('markov');
const fs = require('fs');

const TOKENS = {
  START_DOCUMENT: '<start-document>',
  END_DOCUMENT: '<end-document>'
};

class Markov {

  constructor({ transitions = {} } = {}) {
    debug("In the constructor");

    this.transitions = transitions;
    this.transitions[TOKENS.START_DOCUMENT] = {};
  }

  beginDocument() {
    this.tokenHistory = TOKENS.START_DOCUMENT;
  }

  endDocument() {
    if (this.tokenHistory === TOKENS.START_DOCUMENT) {
      debug("Ignored empty document");
    } else {
      this.addToken(TOKENS.END_DOCUMENT);
    }
  }

  printTransitions() {
    console.log("Transitions:");
    for (const key in this.transitions) {
      console.log(`${key}: ${JSON.stringify(this.transitions[key])}`);
    }
  }

  ingest(filename) {
    debug(`Reading file ${filename}...`);

    fs.readFile(filename, (err, data) => {
      if (err) throw err;
      debug(`Read ${data.length} characters.`);

      this.process(data);

      // this.printTransitions();
    });
  }

  process(data) {
    debug(`data is of class ${data.constructor.name}`);
    const text = data.toString();

    this.beginDocument();

    const lines = text.split('\n');
    lines.forEach(line => {
      if (line === '') {
        debug("Empty line");
      } else {
        const tokens = this.splitTokens(line);
        debug(`Line beginning with ${tokens[0]} and containing ${tokens.length} tokens`);
        tokens.forEach(this.addToken.bind(this));
      }
    });

    this.endDocument();
  }

  splitTokens(line) {
    return line.split(' ');
  }

  addToken(token) {
    const state = this.transitions[this.tokenHistory];
    if (!state) {
      throw new Error('Invariant violated: token history not in transition list');
    }

    // Record this transition
    if (state.hasOwnProperty(token)) {
      state[token] += 1;
    } else {
      state[token] = 1;
    }

    // Add a new transition record for this token if needed
    if (!this.transitions.hasOwnProperty(token)) {
      this.transitions[token] = {};
    }

    // Set the history
    this.tokenHistory = this.updateHistory(token, this.tokenHistory);
  }

  normalizeTransitions() {
    const normalized = {};
    for (const token in this.transitions) {
      let tokenHits = 0.0;
      for (const target in this.transitions[token]) {
        tokenHits += this.transitions[token][target];
      }

      if (normalized.hasOwnProperty(token)) {
        throw new Error('Invariant violated: token repeated in transition table');
      }

      normalized[token] = {};

      for (const target in this.transitions[token]) {
        if (normalized[token].hasOwnProperty(target)) {
          throw new Error('Invariant violated: target repeated in transition table');
        }
        normalized[token][target] = this.transitions[token][target] / tokenHits;
      }
    }

    return normalized;
  }

  updateHistory(token, _oldHistory) {
    return token;
  }

  generate(wordCount) {
    const transitions = this.normalizeTransitions();
    let token = TOKENS.START_DOCUMENT;
    let artifact = "";
    for (let i = 0; i < wordCount; i++) {
      artifact += token;
    }
  }
}

module.exports = Markov;