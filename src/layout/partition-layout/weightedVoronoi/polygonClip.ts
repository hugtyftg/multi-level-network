// 将传入的subjectPolygon分割成若干小的逆时针凸多边形
export function polygonClip(clippingPolygon: any, subjectPolygon: any) {
  let inputList: any;
  let isClosed: boolean = polygonClosed(subjectPolygon);
  let i: number = -1,
    j: number;
  // 用于分割的多边形的实际顶点数 去掉空洞顶点
  let n: number =
    clippingPolygon.length - Number(polygonClosed(clippingPolygon));
  // 被分割的目标多边形的实际顶点数 去掉空洞顶点
  let m: number;
  // 用于分割的多边形的四个顶点
  let x: any = clippingPolygon[n - 1],
    y: any,
    z: any,
    w: any;
  let intersectionLine: any; // 交线
  while (++i < n) {
    inputList = subjectPolygon.slice();
    subjectPolygon.length = 0;
    y = clippingPolygon[i];
    z = inputList[(m = inputList.length - Number(isClosed)) - 1];
    j = -1;
    while (++j < m) {
      w = inputList[j];
      if (polygonInside(w, x, y)) {
        if (!polygonInside(z, x, y)) {
          intersectionLine = polygonIntersect(z, w, x, y);
          if (isFinite(intersectionLine[0])) {
            subjectPolygon.push(intersectionLine);
          }
        }
        subjectPolygon.push(w);
      } else if (polygonInside(z, x, y)) {
        intersectionLine = polygonIntersect(z, w, x, y);
        if (isFinite(intersectionLine[0])) {
          subjectPolygon.push(intersectionLine);
        }
      }
      z = w;
    }
    if (isClosed) subjectPolygon.push(subjectPolygon[0]);
    x = y;
  }

  return subjectPolygon;
}

function polygonInside(
  p: number[] | any,
  a: number[] | any,
  b: number[] | any
) {
  let isInside = (b[0] - a[0]) * (p[1] - a[1]) < (b[1] - a[1]) * (p[0] - a[0]);
  return isInside;
}

// 直线ab和cd相交，若共线则返回infinity，否则返回交点
function polygonIntersect(c: any, d: any, a: any, b: any) {
  let x1 = c[0];
  let x3 = a[0];
  let x2_1 = d[0] - x1;
  let x4_3 = b[0] - x3;
  let y1 = c[1];
  let y3 = a[1];
  let y2_1 = d[1] - y1;
  let y4_3 = b[1] - y3;
  let ratio =
    (x4_3 * (y1 - y3) - y4_3 * (x1 - x3)) / (y4_3 * x2_1 - x4_3 * y2_1);
  let intersectPoint = [x1 + ratio * x2_1, y1 + ratio * y2_1];
  return intersectPoint;
}

// 如果多边形闭合则返回true，否则false
function polygonClosed(coordinates: any[] | any): boolean {
  let firstPoint = coordinates[0];
  let lastPoint = coordinates[coordinates.length - 1];
  return !(firstPoint[0] - lastPoint[0] || firstPoint[1] - lastPoint[1]);
}
