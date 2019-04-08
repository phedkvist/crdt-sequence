// @ts-ignore
import QuillCursors from 'quill-cursors';
import * as React from 'react';
// @ts-ignore
import ReactQuill, { Quill, Range } from 'react-quill'; 
import 'react-quill/dist/quill.snow.css';
import Char from '../crdt/Char';
import History from '../service/History';
import './Document.css';
import Cursor from 'src/service/Cursor';
import ActiveUsers from './ActiveUsers';

// tslint:disable-next-line: no-var-requires
const uuidv1 = require('uuid/v1');

Quill.register('modules/cursors', QuillCursors)
const modules = {
  cursors: true,
  toolbar: ['bold', 'italic', 'underline'],
};

// tslint:disable-next-line: no-empty-interface
export interface IProps {
}

interface IState {
  text: string,
  doc: any,
  history: History,
  selectedRange: [],
}

class Document extends React.Component<IProps, IState> {
  private reactQuillRef = React.createRef<ReactQuill>();

  constructor(props: IProps) {
    super(props)

    this.state = {
      doc: "",
      history: new History(uuidv1(), this.remoteInsert.bind(this), this.remoteDelete.bind(this),
        this.remoteRetain.bind(this), this.updateRemoteCursors.bind(this)),
      text: "",
      selectedRange: [],
    }
    
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeSelection = this.handleChangeSelection.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);

  }

  componentDidMount() {
    if (this.reactQuillRef.current) {
      this.reactQuillRef.current.getEditor().enable;
    }
  }

  public remoteInsert(index: number, char: Char) {
    if (this.reactQuillRef.current) {
      this.reactQuillRef.current.getEditor().insertText(index, char.char, {
        'italic': char.italic,
        'bold': char.bold,
        'underline': char.underline,
      }, "silent");
    }
    this.forceUpdate();
  }

  public remoteDelete(index: number) {
    if (this.reactQuillRef.current) {
      this.reactQuillRef.current.getEditor().deleteText(index, 1, "silent");
    }
  }

  public remoteRetain(index: number, char: Char) {
    if (this.reactQuillRef.current) {
      this.reactQuillRef.current.getEditor().formatText(index,1,
        {
          'italic': char.italic,
          'bold': char.bold,
          'underline': char.underline,
          'link': char.link,
        }, 'silent'
      );
    } 
  }

  private insert(chars: String, startIndex: number, attributes: object, source: string) {
    console.log('insert: ', startIndex, ' ', chars)
    let index = startIndex;
    for (let i in chars) {
      let char = chars[i];
      let crdtIndex = this.state.history.getRelativeIndex(index);
      this.state.history.insert(crdtIndex[0].index, crdtIndex[1].index, char, attributes, source);
      index += 1;
    }
  }

  private delete(startIndex: number, length: number, source: string) {
    console.log('delete: ', startIndex)
    let index = startIndex;
    for (let i = 0; i < length; i++) {
      try {
        let chars = this.state.history.getRelativeIndex(index);
        this.state.history.delete(chars[1], source);
      } catch {
        alert("failed to find relative index");
      }
    }
  }

  private retain(index: number, length: number, attribute: object, source: string) {
    for (let i = 0; i < length; i++) {
      try {
        let chars = this.state.history.getRelativeIndex(index);
        this.state.history.retain(chars[1], attribute, source);
      } catch {
        alert("failed to find relative index");
      }
      index += 1;
    }
  }

  private inspectDelta(ops: any, index: number, source: string) {
    if (ops["insert"] != null) {
      console.log('INSERT', ' RANGE: ', this.state.selectedRange);
      let chars = ops["insert"];
      let attributes = ops["attributes"];
      this.insert(chars, index, attributes, source);
    } else if (ops["delete"] != null) {
      let len = ops["delete"];
      this.delete(index, len, source);
    } else if (ops["retain"] != null) {
      let len = ops["retain"];
      let attributes = ops["attributes"];
      this.retain(index, len, attributes, source);
    }
  }

  private handleChange(value: any, delta: any, source: any) {
    let index = delta.ops[0]["retain"] || 0;
    if (delta.ops.length > 1) {
      this.inspectDelta(delta.ops[1], index, source);
    } else {
      this.inspectDelta(delta.ops[0], index, source);
    }
    this.setState({ text: value }) 
  }

  public updateRemoteCursors(cursor: Cursor) {
    if (this.reactQuillRef.current) {
      const quillCursors = this.reactQuillRef.current.getEditor().getModule('cursors');
      const qC = quillCursors.cursors().find((c: { id: string; }) => c.id === cursor.userID);
      if (qC) {
        quillCursors.moveCursor(qC.id, {index: cursor.index, length: cursor.length})
      } else {
        quillCursors.createCursor(cursor.userID, cursor.name, cursor.color);
        quillCursors.moveCursor(cursor.userID, {index: cursor.index, length: cursor.length})
      }
    }
  }

  private testCursor() {
    if (this.reactQuillRef.current) {
      const cursorOne = this.reactQuillRef.current.getEditor().getModule('cursors');
      //console.log(cursorOne);
      cursorOne.createCursor(1, 'Test', 'blue');
      cursorOne.moveCursor(1, { index: 1, length: 3 })
    }
  }

  private handleChangeSelection(range: any, source: string, editor: any) {
    //console.log('changeSelection ', source);
    if (range && range.index !== null) {
      this.state.history.updateCursor(range.index, range.length);
      this.setState({selectedRange: range});
    } else {
      this.setState({selectedRange: []});
    }
    console.log(this.state.selectedRange);
  }

  private onFocus(range: Range, source: string, editor: any) {
    //console.log("onFocus: ", range)
  }
  
  private onBlur(previousRange: Range, source: string, editor: any) {
    //console.log("onBlur: ", previousRange)
  }

  public render() {
    let table_content = this.state.history.sequence.chars.map(char => {
      return (
        <tr key={char.id}>
          <td>{char.char}</td>
          <td>{char.index}</td>
          <td>{char.tombstone.toString()}</td>
          <td>
            b: {char.bold !== null ? char.bold.toString() : ''},
            u: {char.underline !== null ? char.underline.toString() : ''}, 
            i: {char.italic !== null ? char.italic.toString() : ''}
          </td>
          <td>
            {char.link}
          </td>
        </tr>
      );
    });
   
    return (
      <div className="editor">
        <h3>CRDT Sequence</h3>
        <ActiveUsers users={this.state.history.cursors} />
        <ReactQuill value={this.state.text} theme={"snow"} ref={this.reactQuillRef} 
                  onChange={this.handleChange} onFocus={this.onFocus} onBlur={this.onBlur}
                  onChangeSelection={this.handleChangeSelection} modules={modules}/>
        <button onClick={this.testCursor.bind(this)}>Cursor</button>
        <table className="sequenceTable">
          <thead>
            <tr>
              <th>#</th>
              <th>Index</th>
              <th>Tombstone</th>
              <th>Attributes</th>
              <th>link</th>
            </tr>
          </thead>
          <tbody>
            {table_content}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Document;