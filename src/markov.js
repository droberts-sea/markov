import dbg from 'debug';
const debug = dbg('markov');

import tokenize from './tokenize';


const TOKENS = {
  START_DOCUMENT: '<start-document>',
  END_DOCUMENT: '<end-document>'
}

class Markov {

  constructor({transitions}={}) {
    debug("In the constructor");
    
    if (transitions) {
      this.transitions = transitions;
    } else {
      this.transitions = {};
      this.transitions[TOKENS.START_DOCUMENT] = {};
    }
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

  

  process(data) {
    debug(`data is of class ${data.constructor.name}`);
    
    this.beginDocument();
    
    const text = data.toString();
    const tokenStream = tokenize(text);
    for (const token of tokenStream) {
      this.addToken(token);
    }

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
    // console.log(`Normalizing tranistion table with ${Object.keys(this.transitions).length} tokens`);
    
    const normalized = {}
    for (const token in this.transitions) {
      // console.log(`token ${token}, targets ${Object.keys(this.transitions[token])}`);
      
      let tokenHits = 0.0
      for (const target in this.transitions[token]) {
        tokenHits += this.transitions[token][target];
      }

      if (normalized.hasOwnProperty(token)) {
        throw new Error('Invariant violated: token repeated in transition table');
      }
      
      normalized[token] = {}

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

  selectNewToken(token, transitions) {
    const threshold = Math.random();
    let sum = 0;
    let selectedTarget;
    for (const target in transitions[token]) {
      sum += transitions[token][target];
      if (sum > threshold) {
        selectedTarget = target;
        break;
      }
    }
    if (!selectedTarget) {
      throw new Error(`Invariant violated: no new token was selected, token was ${token}, targets are ${JSON.stringify(transitions[token])}`);
    }
    return selectedTarget;
  }

  generate(wordCount) {
    const transitions = this.normalizeTransitions();
    let token = TOKENS.START_DOCUMENT;
    let artifact = "";

    for (let i = 0; i < wordCount; i++) {
      token = this.selectNewToken(token, transitions);

      if (token === TOKENS.END_DOCUMENT) {
        // Much more likely on our small testing datasets
        break;
      }

      // TODO: rules for weird tokens like punctuation
      artifact += token + " ";
    }

    return artifact.trim();
  }
}

export default Markov;