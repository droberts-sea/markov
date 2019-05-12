import dbg from 'debug';
const debug = dbg('markov');

import tokenize from './tokenize';
import { DOCUMENT_TOKENS } from './tokens';

class Markov {

  constructor({transitions, historyLength=1}={}) {
    debug("In the constructor");

    this.historyLength = historyLength;
    
    if (transitions) {
      this.transitions = transitions;
    } else {
      this.transitions = {};
      this.transitions[DOCUMENT_TOKENS.START_DOCUMENT] = {};
    }
  }

  beginDocument() {
    this.tokenHistory = [DOCUMENT_TOKENS.START_DOCUMENT];
  }

  endDocument() {
    if (this.tokenHistory.length === 1 &&
      this.tokenHistory[0] === DOCUMENT_TOKENS.START_DOCUMENT) {
      debug("Ignored empty document");
    } else {
      this.addToken(DOCUMENT_TOKENS.END_DOCUMENT);
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

  updateHistory(token, _oldHistory) {
    return [token];
  }

  getTransitions() {
    const token = this.tokenHistory[this.tokenHistory.length - 1];
    return this.transitions[token];
  }

  addToken(token) {
    const previousTransitions = this.getTransitions();
    if (!previousTransitions) {
      throw new Error('Invariant violated: token history not in transition list');
    }

    // Record this transition
    if (previousTransitions.hasOwnProperty(token)) {
      previousTransitions[token] += 1;
    } else {
      previousTransitions[token] = 1;
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
}

export default Markov;