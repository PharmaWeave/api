import { ApiError } from "@/utils/errors/api-error";

export class Forbidden extends ApiError {

    constructor(
        message: string
    ) {
        super(403, message);
    }
}
