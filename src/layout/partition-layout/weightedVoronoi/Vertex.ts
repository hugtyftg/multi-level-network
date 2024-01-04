import { epsilon } from './formula';
import { ConflictList } from './ConflictList';
// 三维点
export class Vertex {
  weight: number | any;
  index: number | any;
  conflicts: ConflictList | any;
  x: number;
  y: number;
  z: number;
  neighboursList: any;
  nonClippedPolygon: number[] | any;
  polygon: number[] | any;
  originalObject: any;
  dummyStatus: boolean | any;

  constructor(
    xCoordinate: any,
    yCoordinate: any,
    zCoordinate: any,
    weight?: any,
    origin?: any,
    dummyStatus?: any
  ) {
    this.x = xCoordinate;
    this.y = yCoordinate;
    this.weight = weight ?? epsilon;
    this.z = zCoordinate ?? this.projectZ(this.x, this.y, this.weight);
    this.index = 0;
    this.conflicts = new ConflictList(false);
    this.neighboursList = null;
    this.nonClippedPolygon = null;
    this.polygon = null;
    this.originalObject = origin ?? null;
    this.dummyStatus = dummyStatus ?? false;
  }
  // 投影
  projectZ(xCoordinate: number, yCoordinate: number, weight: number) {
    let calZ = xCoordinate * xCoordinate + yCoordinate * yCoordinate - weight;
    return calZ;
  }
  // 设置权重
  setWeight(w: any) {
    this.weight = w;
    this.z = this.projectZ(this.x, this.y, this.weight);
  }
  // 向量相减
  subtract(vertex: any) {
    return new Vertex(vertex.x - this.x, vertex.y - this.y, vertex.z - this.z);
  }
  // 叉乘
  crossproduct(vertex: any) {
    let newVertexX = this.y * vertex.z - this.z * vertex.y;
    let newVertexY = this.z * vertex.x - this.x * vertex.z;
    let newVertexZ = this.x * vertex.y - this.y * vertex.x;
    return new Vertex(newVertexX, newVertexY, newVertexZ);
  }
  // 三维点是否相等
  equals(vertex: any) {
    return this.x === vertex.x && this.y === vertex.y && this.z === vertex.z;
  }
}
