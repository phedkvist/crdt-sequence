import * as React from 'react';
import './Document.css';
import 'react-quill/dist/quill.snow.css'; // ES6

import  ReactQuill from 'react-quill'; // Typescript
import { History } from '../service/History';
const uuidv1 = require('uuid/v1');


export interface Props {
}

interface State {
  text: string,
  doc: any,
  history: History,
}

class Document extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      text: "",
      doc: "",
      history: new History(uuidv1()),
    }
    
    this.handleChange = this.handleChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.insertText = this.insertText.bind(this);
  }
  private reactQuillRef = React.createRef<ReactQuill>();

  insertText() {
    if (this.reactQuillRef.current) {
      this.reactQuillRef.current.getEditor().insertText(0, "Hej", "bold", "api");
    }
  }

  singleInsert(char: string, index: number) {
    let crdtIndex = this.state.history.sequence.getRelativeIndex(index);
    this.state.history.sequence.insert(crdtIndex[0], crdtIndex[1], char);
    console.log(crdtIndex, char);
  }

  multiInsert(chars: String, startIndex: number) {
    let index = startIndex;
    for (let i in chars) {
      let char = chars[i];
      this.singleInsert(char, index);
      index += 1;
    }
  }

  singleDelete(index: number) {
    try {
      let crdtIndex = this.state.history.sequence.getRelativeIndex(index);
      console.log(index, crdtIndex);
      this.state.history.sequence.delete(crdtIndex[1]);
    } catch {
      alert("failed to find relative index");
    }
  }

  multiDelete(startIndex: number, length: number) {
    let index = startIndex;
    console.log(length)
    for (let i = 0; i < length; i++) {
      console.log(i, index)
      this.singleDelete(index);
      //index += 1;
    }
  }

  inspectDelta(ops: any, index: number) {
    console.log(ops, index)
    if (ops["insert"] != null) {
      let chars = ops["insert"];
      console.log(chars);
      if (chars.length > 1) {
        this.multiInsert(chars, index);
      } else {
        this.singleInsert(chars, index);
      }
    } else if (ops["delete"] != null) {
      let chars = ops["delete"];
      console.log(index, ops, chars);
      if (chars > 1) {
        this.multiDelete(index, chars);
      } else {
        this.singleDelete(index);
      }
    }
  }

  handleChange(value, delta, source) {
    console.log(value, delta, source);
    if (source !== 'api') {
      let index = delta.ops[0]["retain"] || 0;
      if (delta.ops.length > 1) {
        this.inspectDelta(delta.ops[1], index);
      } else {
        this.inspectDelta(delta.ops[0], index);
      }
      this.setState({ text: value }) 
    } else {
      let index = delta.ops[0]["retain"] || 0;
      let insert = delta.ops[0];
      this.inspectDelta(insert, index);
      console.log(insert);
      this.forceUpdate();
    }
  }

  onFocus(range, source, editor) {
    console.log("onFocus: ", range)
  }
  
  onBlur(previousRange, source, editor) {
    console.log("onBlur: ", previousRange)
  }

  render() {
    let table_content = this.state.history.sequence.chars.map(char => {
      return (
        <tr>
          <td>{char.char}</td>
          <td>{char.index}</td>
          <td>{char.siteID}</td>
          <td>{char.tombstone.toString()}</td>
        </tr>
      );
    });
   
    return (
      <div className="editor">
        <h3>CRDT Sequence</h3>
        <ReactQuill value={this.state.text} theme={"snow"} ref={this.reactQuillRef}
                  onChange={this.handleChange} onFocus={this.onFocus} onBlur={this.onBlur} />
        
        <button onClick={this.insertText}>Insert Text</button>
        <table className="sequenceTable">
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>Site ID</th>
            <th>Tombstone</th>
          </tr>
          {table_content}
        </table>
      </div>
    );
  }
}

export default Document;