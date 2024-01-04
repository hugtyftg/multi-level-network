// 计算任意凸多边形的最大内切圆半径和圆心坐标
function polygonIncircle(polygon: number[] | any) {
  let circle: number[] | any = [NaN, NaN, 0];
  for (let i = 0, n = polygon.length - 1; i < n; ++i) {
    const pi0 = polygon[i],
      pi1 = polygon[i + 1];
    for (let j = i + 1; j < n; ++j) {
      const pj0 = polygon[j],
        pj1 = polygon[j + 1];
      // 计算任意两条边所成夹角的角平分线，并依次求角平分线交点，
      // 若该交点到其他边的距离均大于当前交点所成的内切圆的半径（在我们约定的误差范围内，如10^-6），则该交点即为所求
      search: for (let k = j + 1; k < n; ++k) {
        const pk0 = polygon[k],
          pk1 = polygon[k + 1];
        const c: any = circleTangent(pi0, pi1, pj0, pj1, pk0, pk1);
        if (!(c[2] > circle[2])) continue;
        for (let l = 0; l < n; ++l) {
          if (l === i || l === j || l === k) continue;
          const d = pointLineDistance(c, polygon[l], polygon[l + 1]);
          if (d + 1e-6 < c[2]) continue search;
        }
        circle = c;
      }
    }
  }
  return circle;
}
// 计算两条边的角平分线交点
function circleTangent(
  p0: number[] | any,
  p1: number[] | any,
  p2: number[] | any,
  p3: number[] | any,
  p4: number[] | any,
  p5: number[] | any
) {
  const b0 = lineLineBisect(p0, p1, p3, p2);
  const b1 = lineLineBisect(p2, p3, p5, p4);
  // const i = lineLineIntersect(...b0, ...b1);
  const i = lineLineIntersect(b0, b1);
  return [...i, pointLineDistance(i, p0, p1)];
}
// function pointLineDistance([x0, y0], [x2, y2], [x1, y1]) {
function pointLineDistance(
  i: number[] | any,
  p0: number[] | any,
  p1: number[] | any
) {
  let x0 = i[0],
    y0 = i[1],
    x2 = p0[0],
    y2 = p0[1],
    x1 = p1[0],
    y1 = p1[1];
  const x21 = x2 - x1,
    y21 = y2 - y1;
  return (
    (y21 * x0 - x21 * y0 + x2 * y1 - y2 * x1) / Math.sqrt(y21 * y21 + x21 * x21)
  );
}
// 计算两条边所成夹角的角平分线
// function lineLineBisect([x0, y0], [x1, y1], [x2, y2], [x3, y3]): number[][] | any {
function lineLineBisect(
  p0: number[] | any,
  p1: number[] | any,
  p3: number[] | any,
  p2: number[] | any
): number[][] | any {
  let x0 = p0[0],
    y0 = p0[1],
    x1 = p1[0],
    y1 = p1[1],
    x2 = p3[0],
    y2 = p3[1],
    x3 = p2[0],
    y3 = p2[1];
  const x02 = x0 - x2,
    y02 = y0 - y2;
  const x10 = x1 - x0,
    y10 = y1 - y0,
    l10 = Math.sqrt(x10 ** 2 + y10 ** 2);
  const x32 = x3 - x2,
    y32 = y3 - y2,
    l32 = Math.sqrt(x32 ** 2 + y32 ** 2);
  const ti = (x32 * y02 - y32 * x02) / (y32 * x10 - x32 * y10);
  const xi = x0 + ti * x10,
    yi = y0 + ti * y10;
  return [
    [xi, yi],
    [xi + x10 / l10 + x32 / l32, yi + y10 / l10 + y32 / l32],
  ];
}
// 计算两条边的交点
// function lineLineIntersect([x0, y0], [x1, y1], [x2, y2], [x3, y3]) {
function lineLineIntersect(
  b0: number[][] | any,
  b1: number[][] | any
): number[] {
  let x0 = b0[0][0],
    y0 = b0[0][1],
    x1 = b0[1][0],
    y1 = b0[1][1];
  let x2 = b1[0][0],
    y2 = b1[0][1],
    x3 = b1[1][0],
    y3 = b1[1][1];
  const x02 = x0 - x2,
    y02 = y0 - y2;
  const x10 = x1 - x0,
    y10 = y1 - y0;
  const x32 = x3 - x2,
    y32 = y3 - y2;
  const t = (x32 * y02 - y32 * x02) / (y32 * x10 - x32 * y10);
  return [x0 + t * x10, y0 + t * y10];
}
export { polygonIncircle, pointLineDistance };
