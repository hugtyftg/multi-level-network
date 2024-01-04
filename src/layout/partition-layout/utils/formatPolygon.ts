// UPDATE5: 将划分得到的polygon转化成计算内切圆所需的标准形式，即逆时针、首尾节点相同的polygon
function formatPolygon(originpolygon: any) {
  let firstPoint: any = originpolygon[0];
  originpolygon.push(firstPoint);
  originpolygon = originpolygon.reverse();
}
export { formatPolygon };
