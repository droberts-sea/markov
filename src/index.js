const fs = require('fs');

const ingest = (filename) => {
  console.log(`Reading file ${filename}...`);
  
  fs.readFile(filename, (err, data) => {
    if (err) throw err;
    console.log(`Read ${data.length} characters.`);
    
    process(data);
  });
};

const process = (data) => {
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

const FILENAME = 'data/wwii.txt';
ingest(FILENAME);


// module.exports = function markov(string) {
//   if (typeof string !== "string") throw new TypeError("Tiny wants a string!");
//   return string.replace(/\s/g, "");
// };