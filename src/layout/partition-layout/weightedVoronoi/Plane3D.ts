// 三维平面
export class Plane3D {
  a: any;
  b: any;
  c: any;
  d: any;
  constructor(face: any) {
    let point1 = face.verts[0];
    let point2 = face.verts[1];
    let point3 = face.verts[2];
    this.a =
      point1.y * (point2.z - point3.z) +
      point2.y * (point3.z - point1.z) +
      point3.y * (point1.z - point2.z);
    this.b =
      point1.z * (point2.x - point3.x) +
      point2.z * (point3.x - point1.x) +
      point3.z * (point1.x - point2.x);
    this.c =
      point1.x * (point2.y - point3.y) +
      point2.x * (point3.y - point1.y) +
      point3.x * (point1.y - point2.y);
    this.d =
      -1 *
      (point1.x * (point2.y * point3.z - point3.y * point2.z) +
        point2.x * (point3.y * point1.z - point1.y * point3.z) +
        point3.x * (point1.y * point2.z - point2.y * point1.z));
  }
  // 计算标准化的平面方程params
  getNormZPlane() {
    let A = -1 * (this.a / this.c);
    let B = -1 * (this.b / this.c);
    let C = -1 * (this.d / this.c);
    let equotionParams = [A, B, C];
    return equotionParams;
  }
  // 计算n维平面的对偶点
  getDualPointMappedToPlane() {
    let nDimensionPlane = this.getNormZPlane();
    let faceDualPoint = new Point2D(
      nDimensionPlane[0] / 2,
      nDimensionPlane[1] / 2
    );
    return faceDualPoint;
  }
}

// 二维平面的点
export class Point2D {
  x: any;
  y: any;
  constructor(xCoordinate: any, yCoordinate: any) {
    this.x = xCoordinate;
    this.y = yCoordinate;
  }
}
