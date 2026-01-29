export class CustomError extends Error {
  /**
   *
   * @param message - An Error Message
   * @param statusCode - Then Error's Status Code!
   * @param error - Errors
   */
  constructor(
    public message: string,
    public statusCode: number,
    public error: { [key: string]: any } | any = {},
  ) {
    super();
  }
}

export * from "./keep-alive";
