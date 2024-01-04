import { epsilon, dot } from './formula';
import { Plane3D } from './Plane3D';
import { ConflictList } from './ConflictList';
import { Vector } from './Vector';
import { HEdge } from './HEdge';
import WeightedVoronoiError from './WeightedVoronoiError';
// a, b, c三个点确定的三角面Face
export class Face {
  conflicts: ConflictList | any;
  verts: any[];
  singed: boolean | any;
  normalVector: any;
  faceDualPoint: null | any;
  edgesList: any;
  isEmpty: boolean;
  constructor(a: any, b: any, c: any, orient?: any) {
    this.conflicts = new ConflictList(true);
    this.verts = [a, b, c];
    this.singed = false;
    let target = a.subtract(b).crossproduct(b.subtract(c));

    this.normalVector = new Vector(-target.x, -target.y, -target.z);
    this.normalVector.normalize();
    this.createEdges();
    this.faceDualPoint = null;
    this.isEmpty = false;
    if (orient !== undefined) {
      this.orient(orient);
    }
  }
  // 三维空间的三角面映射在对偶空间中的point
  getDualPoint() {
    if (this.faceDualPoint === null) {
      let plane3d = new Plane3D(this);
      this.faceDualPoint = plane3d.getDualPointMappedToPlane();
    }
    return this.faceDualPoint;
  }
  // 是否可以从下面看到该点（判断是否是下凸包面）
  isVisibleFromBelow() {
    return this.normalVector.z < -1.4259414393190911e-9;
  }
  createEdges() {
    this.edgesList = [];
    this.edgesList[0] = new HEdge(this.verts[0], this.verts[1], this);
    this.edgesList[1] = new HEdge(this.verts[1], this.verts[2], this);
    this.edgesList[2] = new HEdge(this.verts[2], this.verts[0], this);
    this.edgesList[0].next = this.edgesList[1];
    this.edgesList[0].prev = this.edgesList[2];
    this.edgesList[1].next = this.edgesList[2];
    this.edgesList[1].prev = this.edgesList[0];
    this.edgesList[2].next = this.edgesList[0];
    this.edgesList[2].prev = this.edgesList[1];
  }
  // vertex的方向
  orient(orient: any) {
    if (
      !(dot(this.normalVector, orient) < dot(this.normalVector, this.verts[0]))
    ) {
      let tempVertex = this.verts[1];
      this.verts[1] = this.verts[2];
      this.verts[2] = tempVertex;
      this.normalVector.negate();
      this.createEdges();
    }
  }
  // 点vertex0和vertex1的连边
  getEdge(vertex0: any, vertex1: any) {
    for (let i = 0; i < 3; i++) {
      if (this.edgesList[i].isEqual(vertex0, vertex1)) {
        return this.edgesList[i];
      }
    }
    return null;
  }
  // 将点vertex0和vertex1与面face相连
  link(face?: any, vertex0?: any, vertex1?: any) {
    if (face instanceof Face) {
      let twin = face.getEdge(vertex0, vertex1);
      if (twin === null) {
        throw new WeightedVoronoiError('链接时twin为空');
      }
      let linkingEdge = this.getEdge(vertex0, vertex1);
      if (linkingEdge === null) {
        throw new WeightedVoronoiError('链接时twin为空');
      }
      twin.twin = linkingEdge;
      linkingEdge.twin = twin;
    } else {
      let twin: any = face;
      let linkingEdge = this.getEdge(twin.origin, twin.destine);
      twin.twin = linkingEdge;
      linkingEdge.twin = twin;
    }
  }
  // 通过点积计算交点
  conflict(v: any) {
    return (
      dot(this.normalVector, v) >
      dot(this.normalVector, this.verts[0]) + epsilon
    );
  }
  // 计算平行边
  getHorizon() {
    let twinExist: boolean, twinHorizon: boolean;
    for (let i: number = 0; i < 3; i++) {
      twinExist = this.edgesList[i].twin !== null;
      twinHorizon = this.edgesList[i].twin.isHorizon();
      if (twinExist && twinHorizon) {
        return this.edgesList[i];
      } else {
        continue;
      }
    }
    return null;
  }
  // 清除交点
  removeConflict() {
    this.isEmpty = true;
    this.conflicts.removeAll();
  }
}
