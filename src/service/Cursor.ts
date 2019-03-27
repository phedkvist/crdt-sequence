
export class Cursor {
	constructor(userID: string) {
		this.userID = userID;
    this.start;
    this.length;
    this.color;
	}
	userID: string;
  start: number;
  length: number;
  color: string;
  
  updateRange(start: number, length: number) {

  }
}