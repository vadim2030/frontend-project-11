class ParserError extends Error {
  constructor() {
    super('invalid_RSS');
    this.name = 'ParserError';
  }
}

export default ParserError;
