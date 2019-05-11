const fs = require('fs');

class Markov {

  constructor() {
    console.log("In the constructor");
    
  }

  ingest(filename) {
    console.log(`Reading file ${filename}...`);
    
    fs.readFile(filename, (err, data) => {
      if (err) throw err;
      console.log(`Read ${data.length} characters.`);
      
      this.process(data);
    });
  }

  process(data) {
    console.log(`data is of class ${data.constructor.name}`);
    data = data.toString();
    
    const lines = data.split('\n');
    lines.forEach(line => {
      if (line === '') {
        console.log("Empty line");
      } else {
        const tokens = line.split(' ');
        console.log(`Line beginning with ${tokens[0]} and containing ${tokens.length} tokens`);
      }
    });
  }
}

module.exports = Markov;