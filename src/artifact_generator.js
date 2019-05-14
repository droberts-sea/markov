import dbg from 'debug';
const debug = dbg('artifact_gen');

import assemble from './assemble';
import { DOCUMENT_TOKENS } from './tokens';

class ArtifactGenerator {
  constructor(normalizedTransitions, historyLength=1) {
    this.transitions = normalizedTransitions;
    this.historyLength = historyLength;
  }

  currentState() {
    return this.history.join(' ');
  }

  updateHistory(token) {
    while (this.history.length > this.historyLength - 1) {
      this.history.shift();
    }
    this.history.push(token);
  }

  selectNewToken() {
    const token = this.currentState();

    const threshold = Math.random();
    let sum = 0;
    let selectedTarget;
    for (const target in this.transitions[token]) {
      sum += this.transitions[token][target];
      if (sum > threshold) {
        selectedTarget = target;
        break;
      }
    }
    if (!selectedTarget) {
      throw new Error(`Invariant violated: no new token was selected, token was '${token}', targets are ${JSON.stringify(this.transitions[token])}`);
    }
    return selectedTarget;
  }

  generate(wordCount, {startToken=DOCUMENT_TOKENS.START_DOCUMENT}={}) {
    // TODO this solution is hackey garbage - if the history length is > 1 you
    // have to pass in multiple tokens as a string, and it has to match the history length.
    // Might be better some day if I implement variable history length
    this.history = [...startToken.split(' ')];
    const artifactTokens = [];
    if (startToken != DOCUMENT_TOKENS.START_DOCUMENT) {
      for (const token of startToken.split(' ')) {
        artifactTokens.push(token);
      }
    }

    for (let i = 0; i < wordCount; i++) {
      const token = this.selectNewToken();
      this.updateHistory(token)

      if (token === DOCUMENT_TOKENS.END_DOCUMENT) {
        // Much more likely on our small testing datasets
        break;
      }

      // TODO: rules for weird tokens like punctuation
      artifactTokens.push(token);
    }

    return assemble(artifactTokens);
  }
}

export default ArtifactGenerator;