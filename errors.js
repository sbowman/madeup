export class ErrorResponse {
  /**
   * @constructor
   *
   * @param {string} code the error code, ideally in line with HTTP response codes
   * @param {string} reason some information about what went wrong
   */
  constructor(code, reason) {
    this.code = parseInt(code);
    this.reason = reason;
  }

  /**
   * The response to the client providing additional details about the error.
   * This message may come from the remote manufacturer's API, or may be
   * replaced by the Smartcar layer.
   *
   * Example:
   *
   *     {
   *       "status": "error",
   *       "code": 404,
   *       "reason": "A vehicle with that ID could not be found"
   *     }
   *
   * @returns {Object} JSON representation of the error message
   */
  toJSON() {
    return {
      status: 'error',
      code: this.code,
      reason: this.reason,
    };
  }
}