import { UserVersion } from './UserVersion';
import { Socket } from './Socket';
import { Sequence } from 'src/crdt/Sequence';
import { Char } from 'src/crdt/Char';

export class History {
    sequence: Sequence;
    versionVector: Array<UserVersion>;
    currentUserID: number;
    socket: Socket;
    constructor(currentUserID: string,) {
        this.socket = new Socket(this.remoteChange.bind(this))
        this.sequence = new Sequence();
        this.versionVector = [];
    }

    insert(indexStart: number, indexEnd: number, char: string) {
        this.sequence.insert(indexStart, indexEnd, char);
    }

    delete(index: number) {
        this.sequence.delete(index);
    }

    getRelativeIndex(index: number): Array<number> {
        return this.sequence.getRelativeIndex(index);
    }

    remoteChange(jsonMessage: any) {
        let char : Char = JSON.parse(jsonMessage);
        this.sequence.remoteInsert(char);
    }
}