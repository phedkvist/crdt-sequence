import { Sequence } from '../crdt/Sequence';
import { Char } from '../crdt/Char';

describe('Sequence', () => {
  let sequence;
  let bof;
  let eof;
  beforeEach(() => {
    sequence = new Sequence();
    bof = sequence.chars[0];
    eof = sequence.chars[1];
  });

  test('can add abc', () => {
    sequence.insert(bof.index, eof.index,'a');
    let relIndex = sequence.getRelativeIndex(1);
    sequence.insert(relIndex[0].index,relIndex[1].index, 'b', {});
    relIndex = sequence.getRelativeIndex(2);
    sequence.insert(relIndex[0].index,relIndex[1].index, 'c', {});

    expect(sequence.getSequence()).toEqual('abc');
  })

  test('can remove char', () => {
    sequence.insert(bof.index, eof.index,'a');
    let relIndex = sequence.getRelativeIndex(1);
    sequence.delete(relIndex[0].id);

    expect(sequence.getSequence()).toEqual('');
  })

  test('can get start and end char', () => {
    let relIndex = sequence.getRelativeIndex(0);

    //sequence.pretty();
    expect(relIndex[0]).toEqual(bof);
    expect(relIndex[1]).toEqual(eof);
  })

  test('can add remote inserts', () => {
    sequence.insert(bof.index, eof.index,'a');
    let relIndex = sequence.getRelativeIndex(1);
    sequence.insert(relIndex[0].index, relIndex[1].index, 'b', {});
    relIndex = sequence.getRelativeIndex(2);
    sequence.insert(relIndex[0].index, relIndex[1].index, 'c', {});

    let char = new Char(10, "1", 2, {});
    sequence.remoteInsert(char);
    char = new Char(15, "2", 3, {});
    sequence.remoteInsert(char);

    //sequence.pretty();
    expect(sequence.getSequence()).toEqual('a12bc');
  })

  /*
    insert:  0   a
    delete:  0
    insert:  0   a
    insert:  0   
    insert:  0   x
  */
  test('remote inserts / deletes at the beginning', () => {
    let secondSequence = new Sequence();
    let aChar = sequence.insert(bof.index, eof.index,'a');
    secondSequence.remoteInsert(aChar);
    expect(sequence.getSequence()).toEqual(secondSequence.getSequence());

    sequence.delete(aChar.id);
    secondSequence.delete(aChar.id);
    expect(sequence.getSequence()).toEqual(secondSequence.getSequence());
  })
  
  test.only('can generate index between integer 1 and 2', () => {
    let index = sequence.generateIndex(1,2);
    expect()
  })
});