// 水平边
export class HEdge {
  twin: any;
  origin: any; // HEdge的起始节点
  next: any;
  prev: any;
  destine: any; // HEdge的终止节点
  iFace: any;
  constructor(origin: any, destine: any, iFaceInstance: any) {
    this.next = null;
    this.prev = null;
    this.twin = null;
    this.origin = origin;
    this.destine = destine;
    this.iFace = iFaceInstance;
  }
  isHorizon() {
    let horizonal = this.twin !== null && !this.iFace.singed && this.twin.iFace.singed;
    return horizonal;
  }
  findHorizon(horizontalEdge: any[]) {
    if (!this.isHorizon()){
      if (this.twin !== null) {
        this.twin.next.findHorizon(horizontalEdge);
      }
    } else {
      if (horizontalEdge.length > 0 && this === horizontalEdge[0]) {
        return;
      } else {
        horizontalEdge.push(this);
        this.next.findHorizon(horizontalEdge);
      }
    } 
  }
  // 判断起止点是否相同
  isEqual(source: any, target: any): boolean {
    let startSame: boolean = (this.origin.equals(source) && this.destine.equals(target));
    let endSame: boolean = (this.origin.equals(target) && this.destine.equals(source));
    return ( startSame || endSame);
  }
}