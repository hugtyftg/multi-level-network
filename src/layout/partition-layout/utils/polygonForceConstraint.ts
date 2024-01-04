/**
 * 关于多边形力约束的accessor
 * @param {[number, number][]} constraintPolygon  多边形的顶点坐标，逆时针并且首尾节点相同！
 * @param {number} borderPadding
 * @returns 约束位置的ticker
 */
function polygonForceConstraintAccessor(
  constraintPolygon: [number, number][],
  borderPadding: number
) {
  const polygon = constraintPolygon;
  const basePadding = borderPadding;
  /**
   * 已知某个坐标，求另一个坐标满足限制在多边形内且形状距离不越界的数值解
   * @param {number} nodeRadius 由于节点是有尺寸的，因此需要传入节点的半径
   * @param {number} nodeStrokeWidth 每个节点的连边宽度
   * @param {number} fixedCoordinate 被固定的坐标，也就是已知坐标
   * @param {number} unknownCoordinate 待求解的坐标
   * @param {string} calCoordname 待求解坐标名
   * @returns 待求解的坐标限制在多边形内的解
   */
  function posTicker(
    nodeRadius: number,
    nodeStrokeWidth: number,
    fixedCoordinate: number,
    unknownCoordinate: number,
    calCoordname: string
  ) {
    nodeRadius += basePadding;
    let solution: number = NaN;
    if (calCoordname === 'x') {
      // 已知y，求解x
      // 被固定的坐标为了保证限制在多边形内，y应该能取的最小坐标值和最大坐标值
      const minFixedCoordinate: number =
        get2DArrayMin(polygon, (d: [number, number]) => d[1]) +
        (nodeRadius + nodeStrokeWidth);
      const maxFixedCoordinate: number =
        get2DArrayMax(polygon, (d: [number, number]) => d[1]) -
        (nodeRadius + nodeStrokeWidth);
      // 将被固定的坐标y调整到圆内
      let newFixedCoordinate: number = Math.min(
        maxFixedCoordinate,
        Math.max(minFixedCoordinate, fixedCoordinate)
      );
      // 求解当前y直线与多边形的两个交点
      const intersects: [number, number][] | any = getHorizontalIntersect(
        polygon,
        newFixedCoordinate
      );
      // 待求解的坐标为了保证限制在多边形内，x应该能取的最小坐标值和最大坐标值
      const minSolutionCoordinate: number =
        get2DArrayMin(intersects, (d: [number, number]) => d[0]) +
        (nodeRadius + nodeStrokeWidth);
      const maxSolutionCoordinate: number =
        get2DArrayMax(intersects, (d: [number, number]) => d[0]) -
        (nodeRadius + nodeStrokeWidth);
      // 尝试将待求解的坐标调整到多边形内
      solution = Math.min(
        maxSolutionCoordinate,
        Math.max(minSolutionCoordinate, unknownCoordinate)
      );
    } else if (calCoordname === 'y') {
      // 已知x，求解y
      // 被固定的坐标为了保证限制在多边形内，x应该能取的最小坐标值和最大坐标值
      const minFixedCoordinate =
        get2DArrayMin(polygon, (d: [number, number]) => d[0]) +
        (nodeRadius + nodeStrokeWidth);
      const maxFixedCoordinate =
        get2DArrayMax(polygon, (d: [number, number]) => d[0]) -
        (nodeRadius + nodeStrokeWidth);
      // 将被固定的坐标y调整到圆内
      let newFixedCoordinate = Math.min(
        maxFixedCoordinate,
        Math.max(minFixedCoordinate, fixedCoordinate)
      );
      // 求解当前x直线与多边形的两个交点
      const intersects: [number, number][] | any = getVerticalIntersect(
        polygon,
        newFixedCoordinate
      );
      // 待求解的坐标为了保证限制在多边形内，y应该能取的最小坐标值和最大坐标值
      const minSolutionCoordinate: number =
        get2DArrayMin(intersects, (d: [number, number]) => d[1]) +
        (nodeRadius + nodeStrokeWidth);
      const maxSolutionCoordinate: number =
        get2DArrayMax(intersects, (d: [number, number]) => d[1]) -
        (nodeRadius + nodeStrokeWidth);
      // 尝试将待求解的坐标调整到多边形内
      solution = Math.min(
        maxSolutionCoordinate,
        Math.max(minSolutionCoordinate, unknownCoordinate)
      );
    }
    return solution;
  }
  return posTicker;
}
/**
 * 获取polygon和水平直线的交点坐标，已知y求x，也就是与y=xxx相交的交点，水平
 * @param polygon 多边形的顶点坐标，逆时针并且首尾节点相同！
 * @param givenCoord 给定的点的坐标，y
 * @returns [[number, number], [number, number]] 两个交点的坐标
 */
function getHorizontalIntersect(
  polygon: [number, number][],
  givenCoord: number
): [number, number][] {
  let result: number[] = [];
  for (let i = 0; i < polygon.length - 1; i++) {
    // 检查每一条line segment的固定坐标的范围是否能cover givenCoord，如果不能cover，则肯定不会相交
    let v1: [number, number] = polygon[i];
    let v2: [number, number] = polygon[i + 1];
    if ((v1[1] - givenCoord) * (v2[1] - givenCoord) < 0) {
      // givenCoord在这个line segement范围内，可以求点
      let k: number = getHorizontalColinearCoef(v1, v2, givenCoord);
      let x: number = v1[0] + k * (v2[0] - v1[0]);
      result.push(x);
    }
  }
  return result.map((v) => [v, givenCoord]);
}
/**
 * 获取polygon和水平直线的交点坐标，已知x求y，也就是与x=xxx相交的交点，垂直
 * @param polygon 多边形的顶点坐标，逆时针并且首尾节点相同！
 * @param givenCoord 给定的点的坐标，x
 * @returns [[number, number], [number, number]] 两个交点的坐标
 */
function getVerticalIntersect(
  polygon: [number, number][],
  givenCoord: number
): [number, number][] {
  let result: number[] = [];
  for (let i = 0; i < polygon.length - 1; i++) {
    // 检查每一条line segment的固定坐标的范围是否能cover givenCoord，如果不能cover，则肯定不会相交
    let v1: [number, number] = polygon[i];
    let v2: [number, number] = polygon[i + 1];

    if ((v1[0] - givenCoord) * (v2[0] - givenCoord) < 0) {
      // givenCoord在这个line segement范围内，可以求点
      let k: number = getVerticalColinearCoef(v1, v2, givenCoord);
      let y: number = v1[1] + k * (v2[1] - v1[1]);
      result.push(y);
    }
  }
  let verticalIntersect: [number, number][] = result.map((v: number) => [
    givenCoord,
    v,
  ]);
  return verticalIntersect;
}
/**
 * 根据已知的y坐标求这个点的共线增量，A+kv = F, v是向量AB，F是未知一个坐标的点
 * 已知y求x，也就是与y=xxx相交的交点的向量共线系数，水平，平行于x轴
 * @param endPoint1 端点1
 * @param endPoint2 端点2
 * @param givenY 已知的y坐标
 * @returns 增量系数
 */
function getHorizontalColinearCoef(
  endPoint1: [number, number],
  endPoint2: [number, number],
  givenY: number
): number {
  let k = (givenY - endPoint1[1]) / (endPoint2[1] - endPoint1[1]);
  return k;
}
/**
 * 根据已知的y坐标求这个点的共线增量，A+kv = F, v是向量AB，F是未知一个坐标的点
 * 已知x求y，也就是与x=xxx相交的交点的向量共线系数，垂直，平行于y轴
 * @param endPoint1 端点1
 * @param endPoint2 端点2
 * @param givenY 已知的y坐标
 * @returns 增量系数
 */
function getVerticalColinearCoef(
  endPoint1: [number, number],
  endPoint2: [number, number],
  givenX: number
): number {
  let k = (givenX - endPoint1[0]) / (endPoint2[0] - endPoint1[0]);
  return k;
}

function get2DArrayMax(
  arr: [number, number][],
  cb: (d: [number, number]) => number
): number {
  if (typeof cb === 'function') {
    let max = -Infinity;
    arr.forEach((d) => {
      let curNum = cb(d);
      if (curNum > max) {
        max = curNum;
      }
    });
    return max;
  } else {
    throw Error('需要传入callback');
  }
}
function get2DArrayMin(
  arr: [number, number][],
  cb: (d: [number, number]) => number
): number {
  if (typeof cb === 'function') {
    let min = Infinity;
    arr.forEach((d: [number, number]) => {
      let curNum = cb(d);
      if (curNum < min) {
        min = curNum;
      }
    });
    return min;
  } else {
    throw Error('需要传入callback');
  }
}
export {
  polygonForceConstraintAccessor,
  getHorizontalIntersect,
  getVerticalIntersect,
};
