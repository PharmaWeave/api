export class ApiError extends Error {

    public message: string;
    public status: number;

    constructor(
        status: number,
        message: string
    ) {
        super(message);

        this.status = status;
        this.message = message;
    }
}
