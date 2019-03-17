import { Sequence } from '../crdt/Sequence';
import { Char } from '../crdt/Char';

describe('Sequence', () => {
  let sequence;
  beforeEach(() => {
    sequence = new Sequence();
  });

  test('can add abc', () => {
    sequence.insert(0, 100,'a');
    let relIndex = sequence.getRelativeIndex(1);
    sequence.insert(relIndex[0],relIndex[1], 'b');
    relIndex = sequence.getRelativeIndex(2);
    sequence.insert(relIndex[0],relIndex[1], 'c');

    //sequence.pretty();
    expect(sequence.getSequence()).toEqual('abc');
  })

  test('can remove char', () => {
    sequence.insert(0, 100,'a');
    let relIndex = sequence.getRelativeIndex(1);
    sequence.delete(relIndex[0]);

    //sequence.pretty();
    expect(sequence.getSequence()).toEqual('');
  })

  test('can get start and end char', () => {
    let relIndex = sequence.getRelativeIndex(0);

    //sequence.pretty();
    expect(relIndex[0]).toEqual(0);
    expect(relIndex[1]).toEqual(100);
  })

  test('can add remote inserts', () => {
    sequence.insert(0, 100,'a');
    let relIndex = sequence.getRelativeIndex(1);
    sequence.insert(relIndex[0],relIndex[1], 'b');
    relIndex = sequence.getRelativeIndex(2);
    sequence.insert(relIndex[0],relIndex[1], 'c');

    let char = new Char(50, "1", 2);
    sequence.remoteInsert(char);
    char = new Char(50, "2", 3);
    sequence.remoteInsert(char);

    //sequence.pretty();
    expect(sequence.getSequence()).toEqual('a12bc');
  })
});