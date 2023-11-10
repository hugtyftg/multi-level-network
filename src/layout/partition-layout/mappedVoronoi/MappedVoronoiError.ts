export default class MappedVoronoiError implements Error {
  public message: any;
  public stack: any;
  public name: string;
  constructor(message: any) {
    this.message = message;
    this.stack = new Error().stack;
    this.name = 'MappedVoronoiError'
  }
}