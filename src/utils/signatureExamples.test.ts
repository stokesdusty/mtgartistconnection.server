import { moveExample } from './signatureExamples';

const examples = ['a', 'b', 'c'].map((id) => ({ id, imageUrl: `${id}.jpg`, label: id }));

describe('moveExample', () => {
  it('swaps an example with its neighbour', () => {
    expect(moveExample(examples, 0, 1)).toEqual(['b', 'a', 'c']);
    expect(moveExample(examples, 2, -1)).toEqual(['a', 'c', 'b']);
  });

  it('leaves the order alone at either end', () => {
    expect(moveExample(examples, 0, -1)).toEqual(['a', 'b', 'c']);
    expect(moveExample(examples, 2, 1)).toEqual(['a', 'b', 'c']);
  });
});
