const USER_COLORS = ['blue', 'green', 'red', 'orange'];
const USER_NAMES = ['Barack Obama', 'Donald Trump', 'Angela Merkel', 'Vladimir Puttin']

export default class Cursor {
	constructor(userID: string, index: number, length: number, userCount: number) {
		this.userID = userID;
    this.index = 1;
    this.length = 0;
    this.color = userCount <= 3 ? USER_COLORS[userCount] : USER_COLORS[0];
    this.name = userCount <= 3 ? USER_NAMES[userCount] : USER_NAMES[0];
	}
	userID: string;
  index: number;
  length: number;
  color: string;
  name: string;
  
  updateRange(index: number, length: number) {
    this.index = index;
    this.length = length;
  }
}