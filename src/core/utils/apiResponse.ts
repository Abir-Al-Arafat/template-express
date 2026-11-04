export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
}

export class ResponseBuilder {
  static success<T>(
    message: string,
    data?: T,
    statusCode: number = 200,
  ): ApiResponse<T> {
    if (typeof data === "undefined") {
      return {
        success: true,
        status: statusCode,
        message,
      };
    }

    return {
      success: true,
      status: statusCode,
      message,
      data,
    };
  }

  static failure(
    message: string,
    statusCode: number = 500,
  ): ApiResponse<undefined> {
    return {
      success: false,
      status: statusCode,
      message,
    };
  }
}
