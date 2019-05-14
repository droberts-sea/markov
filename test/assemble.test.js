import assemble from '../src/assemble';

const verifyAssembly = (tokens, expectedArtifact) => {
  const artifact = assemble(tokens);
  expect(artifact).toBe(expectedArtifact);
}

test('capitalizes first the first word', () => {
  const tokens = ['the', 'quick', 'brown', 'fox'];
  const expectedArtifact = "The quick brown fox";

  verifyAssembly(tokens, expectedArtifact);
})

test('omits space before and capitalizes after a period', () => {
  const tokens = ['the', 'quick', '<period>', 'brown', 'fox'];
  const expectedArtifact = "The quick. Brown fox";

  verifyAssembly(tokens, expectedArtifact);
})

test('two periods', () => {
  const tokens = ['<period>', '<period>'];
  const expectedArtifact = "..";

  verifyAssembly(tokens, expectedArtifact);
})

test('wiki citation', () => {
  const tokens = ['the', 'quick', '<period>', '<wiki-citation>', 'brown', 'fox'];

  // Need to do a regex because the citation number is random -> no verifyAssembly
  const artifactPattern = /The quick\.\[\d+\] Brown fox/;

  const artifact = assemble(tokens);
  expect(artifact).toMatch(artifactPattern);
})

test('wiki citation mid-sentence', () => {
  const tokens = ['the', 'quick', '<comma>', '<wiki-citation>', 'brown', 'fox'];
  const artifactPattern = /The quick,\[\d+\] brown fox/;

  const artifact = assemble(tokens);
  expect(artifact).toMatch(artifactPattern);
})

test('paragraph', () => {
  const tokens = ['the', 'quick', '<paragraph>', 'brown', 'fox'];
  const expectedArtifact = "The quick\n\nBrown fox";

  verifyAssembly(tokens, expectedArtifact);
})

test('various punctuation', () => {
  const tokens = ['the', '<comma>', 'quick', '<colon>', '<comma>', 'brown', '<semicolon>'];
  const expectedArtifact = "The, quick:, brown;";

  verifyAssembly(tokens, expectedArtifact);
})

test('parentheticals', () => {
  const tokens = ['the', '<open-paren>', 'quick', 'brown', '<close-paren>', 'fox'];
  const expectedArtifact = "The (quick brown) fox";

  verifyAssembly(tokens, expectedArtifact);
});

test('parentheticals + puncutation', () => {
  const tokens = ['the', '<period>', '<open-paren>', 'quick', 'brown', '<comma>', '<close-paren>', '<semicolon>', 'fox'];
  const expectedArtifact = "The. (Quick brown,); fox";

  verifyAssembly(tokens, expectedArtifact);
})

test('odd parentheticals', () => {
  const tokens = ['<close-paren>', '<open-paren>', '<open-paren>', '<open-paren>', 'quick', 'brown', '<paragraph>', 'fox', '<close-paren>', '<close-paren>', '<close-paren>'];
  const expectedArtifact = ") (((Quick brown\n\nFox)))";

  verifyAssembly(tokens, expectedArtifact);
})

test('bible line verses', () => {
  const tokens = [
    '<bible-line-verse>',
    'the',
    'quick',
    '<semicolon>',
    '<bible-line-verse>',
    'brown',
    'fox',
    '<period>',
    '<paragraph>',
    '<bible-line-verse>',
    'jumped',
    'over',
    '<bible-line-verse>',
    'the',
    'lazy',
    '<bible-line-verse>',
    '<bible-line-verse>'
  ];
  const artifactPattern = /\d+:\d+ the quick; \d+:\d+ brown fox\.\n\n\d+:\d+ jumped over \d+:\d+ the lazy \d+:\d+ \d+:\d+/i;
  const artifact = assemble(tokens);
  expect(artifact).toMatch(artifactPattern);
});