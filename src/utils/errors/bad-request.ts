import { ApiError } from "@/utils/errors/api-error";

export class BadRequest extends ApiError {

    constructor(
        message: string
    ) {
        super(400, message);
    }
}
