import Markov from '../src/markov';
import ArtifactGenerator from '../src/artifact_generator';

describe('artifact generation', () => {
  test('generates the source text if given no repeated words', () => {
    const markov = new Markov();
    const text = "The quick brown fox";
    const wordCount = text.split(' ').length
    markov.process(text);

    const generator = new ArtifactGenerator(markov.normalizeTransitions());
    let artifact = generator.generate(2);
    expect(artifact).toEqual("The quick");

    artifact = generator.generate(wordCount);
    expect(artifact).toEqual(text);
  })

  test('stops early if asked for more words than it can give', () => {
    const markov = new Markov();
    const text = "The quick brown fox";
    markov.process(text);

    const generator = new ArtifactGenerator(markov.normalizeTransitions());
    let artifact = generator.generate(100);
    expect(artifact).toEqual(text);
  })

  test('generates documents of varying length', () => {
    const markov = new Markov();
    markov.process("onestep");
    markov.process("two steps");
    markov.process("three whole steps");

    const generator = new ArtifactGenerator(markov.normalizeTransitions());
    const artifacts = [];
    for (let i = 0; i < 1000; i++) {
      artifacts.push(generator.generate(3));
    }
    const artifact_lengths = new Set(artifacts.map(art => art.split(' ').length));
    expect(artifact_lengths.size).toBe(3)
  })
})