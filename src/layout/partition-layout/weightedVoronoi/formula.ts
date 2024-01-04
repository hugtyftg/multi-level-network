export const epsilon = 1e-10;
export function epsilonesque(n: number | any) {
  let absCompare: boolean = n <= epsilon && n >= -epsilon;
  return absCompare;
}
// 向量点积（由于基准坐标是(0,0,0)，因此实际上是点的点积）
export function dot(vertex0: any, vertex1: any) {
  return vertex0.x * vertex1.x + vertex0.y * vertex1.y + vertex0.z * vertex1.z;
}
// 计算两点（向量）是否线性独立
export function linearDependent(vertex0: any, vertex1: any) {
  return (
    epsilonesque(vertex0.x * vertex1.y - vertex0.y * vertex1.x) &&
    epsilonesque(vertex0.y * vertex1.z - vertex0.z * vertex1.y) &&
    epsilonesque(vertex0.z * vertex1.x - vertex0.x * vertex1.z)
  );
}

// 判断多边形是否为无孔洞、不相交的凸多边形，若是则返回true
export function polygonDirection(polygon: any) {
  let sign: any,
    crossproduct: number | any,
    point0: any,
    point1: any,
    point2: any,
    vertex0: any,
    vertex1: any;

  point0 = polygon[polygon.length - 2];
  point1 = polygon[polygon.length - 1];
  point2 = polygon[0];
  vertex0 = vect(point0, point1);
  vertex1 = vect(point1, point2);
  crossproduct = calculateCrossproduct(vertex0, vertex1);
  sign = Math.sign(crossproduct);

  point0 = point1;
  point1 = point2;
  vertex0 = vertex1;
  vertex1 = vect(point1, point2);
  crossproduct = calculateCrossproduct(vertex0, vertex1);
  let directionValide = Math.sign(crossproduct) !== sign;
  if (directionValide) {
    return undefined;
  }
  for (let i: number = 2; i < polygon.length - 1; i++) {
    point0 = point1;
    point1 = point2;
    point2 = polygon[i];
    vertex0 = vertex1;
    vertex1 = vect(point1, point2);
    crossproduct = calculateCrossproduct(vertex0, vertex1);
    let isValide = Math.sign(crossproduct) !== sign;
    if (isValide) {
      return undefined;
    }
  }

  return sign;
}
// 通过起始点计算向量
function vect(startPoint: any, endPoint: any) {
  return [endPoint[0] - startPoint[0], endPoint[1] - startPoint[1]];
}
// 计算叉乘积
function calculateCrossproduct(vertex0: any, vertex1: any) {
  return vertex0[0] * vertex1[1] - vertex0[1] * vertex1[0];
}
