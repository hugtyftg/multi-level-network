// 交点和交点列表
export class ConflictListNode {
  face: any;
  vert: any;
  nextFace: any;
  previousFace: any;
  nextVertex: any;
  previousVertext: any;
  constructor(face: any, vert: any) {
    this.face = face;
    this.vert = vert;
    this.nextFace = null;
    this.previousFace = null;
    this.nextVertex = null;
    this.previousVertext = null;
  }
}
export class ConflictList {
  public forFace: any;
  public header: any;
  constructor(forFace: any) {
    this.forFace = forFace;
    this.header = null;
  }
  add(cln: any) {
    if (this.header === null) {
      this.header = cln;
    } else {
      if (this.forFace) {
        // 如果是三角面faces列表
        this.header.previousVertext = cln;
        cln.nextVertex = this.header;
        this.header = cln;
      } else {
        // 如果是节点vertex列表
        this.header.previousFace = cln;
        cln.nextFace = this.header;
        this.header = cln;
      }
    }
  }
  isEmpty() {
    let isEmptyStatus = this.header === null;
    return isEmptyStatus;
  }
  // 可见的三角面faces的数组
  fill(evident: any) {
    if (this.forFace) {
      return;
    }
    let curPointer = this.header;
    do {
      evident.push(curPointer.face);
      curPointer.face.singed = true;
      curPointer = curPointer.nextFace;
    } while (curPointer !== null);
  }
  // 移除三角面face的所有节点
  removeAll() {
    if (this.forFace) {
      let curPointer = this.header;
      do {
        // 当前节点是header
        if (curPointer.previousFace === null) {
          if (curPointer.nextFace === null) {
            curPointer.vert.conflicts.header = null;
          } else {
            curPointer.nextFace.previousFace = null;
            curPointer.vert.conflicts.header = curPointer.nextFace;
          }
        } else {
          // 当前节点不是header
          if (curPointer.nextFace !== null) {
            curPointer.nextFace.previousFace = curPointer.previousFace;
          }
          curPointer.previousFace.nextFace = curPointer.nextFace;
        }
        curPointer = curPointer.nextVertex;
        if (curPointer !== null) {
          curPointer.previousVertext = null;
        }
      } while (curPointer !== null);
    } else {
      // 把vertex的所有JFaces移除
      let curPointer = this.header;
      do {
        // 此节点为header
        if (curPointer.previousVertext === null) {
          if (curPointer.nextVertex === null) {
            curPointer.face.conflicts.header = null;
          } else {
            curPointer.nextVertex.previousVertext = null;
            curPointer.face.conflicts.header = curPointer.nextVertex;
          }
        } else {
          // 此节点不是header
          if (curPointer.nextVertex !== null) {
            curPointer.nextVertex.previousVertext = curPointer.previousVertext;
          }
          curPointer.previousVertext.nextVertex = curPointer.nextVertex;
        }
        curPointer = curPointer.nextFace;
        if (curPointer !== null) curPointer.previousFace = null;
      } while (curPointer !== null);
    }
  }
  // 得到当前节点的所有vertices
  getVertices() {
    let verticesList: any[] = [],
      curPointer = this.header;
    while (curPointer !== null) {
      verticesList.push(curPointer.vert);
      curPointer = curPointer.nextVertex;
    }
    return verticesList;
  }
}
