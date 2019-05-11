const fs = require('fs');

class Markov {

  constructor() {
    console.log("In the constructor");
    
    this.transitions = {
      '<start-document>': {}
    }
  }

  beginDocument() {
    this.tokenHistory = '<start-document>';
  }

  endDocument() {
    this.addToken('<end-document>');
  }

  printTransitions() {
    console.log("Transitions:");
    for (const key in this.transitions) {
      console.log(`${key}: ${JSON.stringify(this.transitions[key])}`);
    }
  }

  ingest(filename) {
    console.log(`Reading file ${filename}...`);
    
    fs.readFile(filename, (err, data) => {
      if (err) throw err;
      console.log(`Read ${data.length} characters.`);
      
      this.process(data);

      this.printTransitions();
    });
  }

  process(data) {
    console.log(`data is of class ${data.constructor.name}`);
    const text = data.toString();

    this.beginDocument();
    
    const lines = text.split('\n');
    lines.forEach(line => {
      if (line === '') {
        console.log("Empty line");
      } else {
        const tokens = this.splitTokens(line);
        console.log(`Line beginning with ${tokens[0]} and containing ${tokens.length} tokens`);
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
    this.tokenHistory = token;
  }
}

module.exports = Markov;