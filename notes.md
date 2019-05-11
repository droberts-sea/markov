Creating an NPM package:
https://medium.freecodecamp.org/how-to-make-a-beautiful-tiny-npm-package-and-publish-it-2881d4307f78

Reading files:
https://nodejs.org/api/fs.html#fs_file_system

Jest for testing
https://jestjs.io/docs/en/getting-started

Debug for logging
DEBUG=markov bin/main.js

TODO List 5/10:
- Handle punctuation (period, comma, citation, etc)
  - Tokenization
  - Artifact generation
- Capitalization (input and output)
- Finish with a period
  - Limit is soft, find the last period and go until the next period, figure out which gets you closer to the goal
  - Increase the probability of a period around the word count.
- Multi-token history (input and output)