import { ApiError } from "@/utils/errors/api-error";

export class NotFound extends ApiError {

    constructor(
        message: string
    ) {
        super(404, message);
    }
}
