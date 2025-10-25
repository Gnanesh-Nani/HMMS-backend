import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : exception;

    // If it's a http exception, it's message field is string
    // our custom handleError method return a object 
    // {
    //     error: true,
    //     message,
    //     data: {}
    // }
    // we have to extract the message from the object and append it

    if (typeof message === 'object' && message && 'error' in message) {
      response.status(status).json(message);
    } else {
      response.status(status).json({
        error: true,
        statusCode: status,
        message,
      });
    }
  }
}
