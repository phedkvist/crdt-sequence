export class Cursor {
	constructor(userID: string, index: number, length: number) {
		this.userID = userID;
    this.index = 1;
    this.length = 0;
    this.color;
	}
	userID: string;
  index: number;
  length: number;
  color: string;
  
  updateRange(index: number, length: number) {
    this.index = index;
    this.length = length;
  }
}