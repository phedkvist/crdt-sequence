export class UserVersion {
	constructor(userID: string) {
		this.userID = userID;
		this.clock = 1; //when its first created it starts at one.
	}
	userID: string;
	clock: number;
}