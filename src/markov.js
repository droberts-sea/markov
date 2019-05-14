import dbg from 'debug';
const debug = dbg('markov');

import ArtifactGenerator from './artifact_generator';
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

  currentState() {
    return this.tokenHistory.join(' ');
  }

  recordTransition(token) {
    const currentState = this.currentState();
    const previousTransitions = this.transitions[currentState];

    if (!previousTransitions) {
      throw new Error('Invariant violated: token history not in transition list');
    }

    if (previousTransitions.hasOwnProperty(token)) {
      previousTransitions[token] += 1;
    } else {
      previousTransitions[token] = 1;
    }
  }

  updateHistory(token) {
    while (this.tokenHistory.length > this.historyLength - 1) {
      this.tokenHistory.shift();
    }
    this.tokenHistory.push(token);

    const currentState = this.currentState();
    if (!this.transitions.hasOwnProperty(currentState)) {
      this.transitions[currentState] = {};
    }
  }

  addToken(token) {
    this.recordTransition(token)

    this.updateHistory(token);
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

  buildGenerator() {
    return new ArtifactGenerator(this.normalizeTransitions(), this.historyLength);
  }
}

export default Markov;