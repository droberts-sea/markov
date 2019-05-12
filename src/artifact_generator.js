import dbg from 'debug';
const debug = dbg('artifact_gen');

import assemble from './assemble';
import { DOCUMENT_TOKENS } from './tokens';

class ArtifactGenerator {
  constructor(normalizedTransitions, historyLength=1) {
    this.transitions = normalizedTransitions;
    this.historyLength = historyLength;
  }

  beginArtifact() {
    this.history = [DOCUMENT_TOKENS.START_DOCUMENT];
  }

  updateHistory(token) {
    this.history = [token];
  }

  selectNewToken() {
    const token = this.history[this.history.length - 1];

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
      throw new Error(`Invariant violated: no new token was selected, token was ${token}, targets are ${JSON.stringify(this.transitions[token])}`);
    }
    return selectedTarget;
  }

  generate(wordCount) {
    this.beginArtifact();
    const artifactTokens = [];

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