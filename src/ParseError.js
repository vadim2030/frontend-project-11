class ParserError extends Error {
  constructor(rawData, dataFromParser) {
    super('invalid_RSS');
    this.name = 'ParserError';
    this.data = rawData;
    this.dataFromParser = dataFromParser;
  }
}

export default ParserError;
