import { UserVersion } from './UserVersion';
import { Socket } from './Socket';
import { Sequence } from 'src/crdt/Sequence';
import { Char } from 'src/crdt/Char';

export class History {
    sequence: Sequence;
    versionVector: Array<UserVersion>;
    currentUserID: number;
    socket: Socket;
    remoteInsert: (index: number, char: string) => void;
    remoteDelete: (index: number) => void;
    constructor(currentUserID: string, remoteInsert: (index: number, char: string) => void, 
        remoteDelete: (index: number) => void) {

        this.socket = new Socket(this.remoteChange.bind(this), this.updateConnectionState.bind(this))
        this.sequence = new Sequence();
        this.versionVector = [];
        this.remoteInsert = remoteInsert;
        this.remoteDelete = remoteDelete;
    }

    updateConnectionState() {

    }

    insert(indexStart: number, indexEnd: number, char: string, source: string) {
        //console.log("insert: ", char, ", at: ", indexStart, ", source: ", source);
        if (source !== 'silent') {
            let charObj: Char = this.sequence.insert(indexStart, indexEnd, char);
            //console.log('insert');
            this.socket.send(JSON.stringify({type: 'insert', data: charObj}));
        }
    }

    delete(char: Char, source: string) {
        if (source !== 'silent') {
            this.sequence.delete(char.id);
            //console.log('delete sent now!');
            this.socket.send(JSON.stringify({type: 'delete', data: char}));
        }
    }

    getRelativeIndex(index: number): Array<Char> {
        return this.sequence.getRelativeIndex(index);
    }

    remoteChange(jsonMessage: any) {
        //TODO: Validate data in jsonMessage
        let change = JSON.parse(jsonMessage);
        let char : Char = change.data;
        if (change.type === 'insert') {
            this.sequence.remoteInsert(char);
            let index = this.sequence.getCharRelativeIndex(char);
            console.log("remote ins", 'index: ',index, ', char: ', char);
            this.remoteInsert(index, char.char);
        } else if (change.type === 'delete') {
            let id : string = char.id;
            //console.log('delete', id);
            this.sequence.delete(id);
            try {
                let index = this.sequence.getCharRelativeIndex(char);
                console.log("remote del", 'index: ',index, ', char: ', char);
                this.remoteDelete(index);
            } catch (e) {
                console.log(e);
            }
        }
    }
}