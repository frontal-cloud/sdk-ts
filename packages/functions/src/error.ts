export class FrontalError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "FrontalError";
	}
}
