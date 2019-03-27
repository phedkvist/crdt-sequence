// @ts-ignore
import QuillCursors from 'quill-cursors';
import * as React from 'react';
// @ts-ignore
import ReactQuill, { Quill, Range } from 'react-quill'; 
import 'react-quill/dist/quill.snow.css';
import { Char } from '../crdt/Char';
import { History } from '../service/History';
import './Document.css';
import { Cursor } from 'src/service/Cursor';
// tslint:disable-next-line: no-var-requires
const uuidv1 = require('uuid/v1');

Quill.register('modules/cursors', QuillCursors)
const modules = {
  cursors: true,
};

// tslint:disable-next-line: no-empty-interface
export interface IProps {
}

interface IState {
  text: string,
  doc: any,
  history: History,
}

class Document extends React.Component<IProps, IState> {
  private reactQuillRef = React.createRef<ReactQuill>();

  constructor(props: IProps) {
    super(props)

    this.state = {
      doc: "",
      history: new History(uuidv1(), this.remoteInsert.bind(this), this.remoteDelete.bind(this),
        this.remoteRetain.bind(this)),
      text: "",
    }
    
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeSelection = this.handleChangeSelection.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  componentDidMount() {
    if (this.reactQuillRef.current) {
      this.reactQuillRef.current.getEditor().enable;
      //console.log(this.reactQuillRef.current);
      //this.reactQuillRef.current.editor.register('modules/cursors', QuillCursors);
      //this.reactQuillRef.current.Quill.register('modules/cursors', QuillCursors);
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
      //console.log("remote delete: ", index);
      this.reactQuillRef.current.getEditor().deleteText(index, 1, "silent");
    }
  }

  public remoteRetain(index: number, char: Char) {
    if (this.reactQuillRef.current) {
      console.log('remote retain', char);
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

  public updateRemoteCursors() {
    if (this.reactQuillRef.current) {
      const quillCursors = this.reactQuillRef.current.getEditor().getModule('cursors');
      const cursors : Array<Cursor> = this.state.history.getCursors();
      for (let i in cursors) {
        const cursor : Cursor = cursors[i];
        const qC = quillCursors.cursors.find((c: { id: string; }) => c.id === cursor.userID);
        if (qC) {
          quillCursors.moveCursor(qC.id, {index: cursor.start, length: cursor.length})
        } else {
          quillCursors.createCursor(cursor.userID, 'Bob', cursor.color);
        }
      }
    }
  }

  private testCursor() {
    if (this.reactQuillRef.current) {
      const cursorOne = this.reactQuillRef.current.getEditor().getModule('cursors');
      console.log(cursorOne);
      
      cursorOne.createCursor(1, 'Test', 'blue');
      cursorOne.moveCursor(1, { index: 1, length: 3 })
      
    }
  }

  private singleInsert(char: string, index: number, attributes: object, source: string) {
    let crdtIndex = this.state.history.getRelativeIndex(index);
    this.state.history.insert(crdtIndex[0].index, crdtIndex[1].index, char, attributes, source);
  }

  private multiInsert(chars: String, startIndex: number, attributes: object, source: string) {
    let index = startIndex;
    for (let i in chars) {
      let char = chars[i];
      this.singleInsert(char, index, attributes, source);
      index += 1;
    }
  }

  private singleDelete(index: number, source: string) {
    try {
      let chars = this.state.history.getRelativeIndex(index);
      //console.log(index, crdtIndex);
      this.state.history.delete(chars[1], source);
    } catch {
      alert("failed to find relative index");
    }
  }

  private multiDelete(startIndex: number, length: number, source: string) {
    let index = startIndex;
    //console.log(length)
    for (let i = 0; i < length; i++) {
      //console.log(i, index)
      this.singleDelete(index, source);
      //index += 1;
    }
  }

  private singleRetain(index: number, attribute: object, source: string) {
    try {
      console.log("single retain", index, attribute);
      let chars = this.state.history.getRelativeIndex(index);
      console.log(index, chars[1]);
      this.state.history.retain(chars[1], attribute, source);
    } catch {
      alert("failed to find relative index");
    }
  }

  private multiRetain(index: number, length: number, attribute: object, source: string) {
    console.log("multi retain", index, attribute);
    for (let i = 0; i < length; i++) {
      //console.log(i, index)
      this.singleRetain(index, attribute, source);
      index += 1;
    }
  }

  private inspectDelta(ops: any, index: number, source: string) {
    if (ops["insert"] != null) {
      let chars = ops["insert"];
      let attributes = ops["attributes"];
      if (chars.length > 1) {
        this.multiInsert(chars, index, attributes, source);
      } else {
        this.singleInsert(chars, index, attributes, source);
      }
    } else if (ops["delete"] != null) {
      let chars = ops["delete"];
      //console.log(index, ops, chars);
      if (chars > 1) {
        this.multiDelete(index, chars, source);
      } else {
        this.singleDelete(index, source);
      }
    } else if (ops["retain"] != null) {
      let len = ops["retain"];
      let attributes = ops["attributes"];
      if (len > 1) {
        this.multiRetain(index, len, attributes, source);
      } else {
        this.singleRetain(index, attributes, source);
      }
    }
  }

  private handleChange(value: any, delta: any, source: any) {
    //console.log('!== api')
    let index = delta.ops[0]["retain"] || 0;
    if (delta.ops.length > 1) {
      this.inspectDelta(delta.ops[1], index, source);
    } else {
      this.inspectDelta(delta.ops[0], index, source);
    }
    this.setState({ text: value }) 
  }

  private handleChangeSelection(range: any, source: string, editor: any) {
    console.log("onChangeSelection", range, source, editor);
  }

  private onFocus(range: Range, source: string, editor: any) {
    console.log("onFocus: ", range)
  }
  
  private onBlur(previousRange: Range, source: string, editor: any) {
    console.log("onBlur: ", previousRange)
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