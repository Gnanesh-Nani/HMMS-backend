import { HttpException, HttpStatus } from "@nestjs/common";

export function handleError(message: string, status: number = HttpStatus.BAD_REQUEST) {

    const errorResponse = {
        error: true,
        message,
        data: {}
    }

    throw new HttpException(errorResponse,status);
}