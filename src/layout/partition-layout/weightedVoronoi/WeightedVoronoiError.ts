export default class WeightedVoronoiError implements Error {
  public message: any;
  public stack: any;
  public name: any;
  constructor(message: any) {
    this.name = 'WeightedVoronoiError';
    this.stack = new Error().stack;
    this.message = message;
  }
}
