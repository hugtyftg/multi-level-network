/**
 * 将fatherObj中的特定childObj的polygon
 * 与距离父质心欧氏距离最近、节点数最相近的childObj的polygon相互替换
 * @param fatherObj 父层级的obj（az），有children字段，包含若干子层级的obj（pod）
 * @param attr 按照子层级的attr字段（name）将某个子层级obj对象的位置中心化
 * @param attrValue 被中心化的子层级对象的attr字段的值（cnt）
 * @param centroidDistanceWeight childobj的polygon质心与fatherobj的polygon的质心的欧式距离在目标函数中的权重
 * @param nodesNumWeight childobj的节点个数与目标替换的childobj的节点个数的差值在目标函数中的权重
 */
function centralizing(
  fatherObj: any,
  attr: string,
  attrValue: string,
  nodesNumWeight: number = 0.6,
  centroidDistanceWeight: number = 0.4
) {
  // 如果没有children字段，说明没有子层级
  if (!fatherObj.children) {
    return;
  }
  // 目标替换子层级在children中的索引
  let targetChildObjIndex = fatherObj.children.findIndex(
    (child: any) => child.data[attr] === attrValue
  );
  // 如果当前father obj没有需要中心化的子层级，则返回
  if (targetChildObjIndex === -1) {
    return;
  }
  // 目标替换子层级
  let targetChildObj = fatherObj.children[targetChildObjIndex];
  // 储存所有子层级的NND、CD、NND Ratio、CD Ratio和score
  let info = Array.from({ length: fatherObj.children.length }, () => ({
    NND: Infinity,
    CD: Infinity,
    NNDNormalization: Infinity,
    CDNormalization: Infinity,
    score: Infinity,
  }));
  // 子层级的最大NND和最小NND、最大CD和最小CD
  let maxNND: number = 0,
    minNND: number = Infinity;
  let maxCD: number = 0,
    minCD: number = Infinity;
  // 计算所有子层级的NND、CD
  for (let i = 0; i < fatherObj.children.length; i++) {
    const curChildObj = fatherObj.children[i];
    // 计算NND
    let curNND = nodesNumDifferential(curChildObj, targetChildObj);
    // 计算CD
    let curCD = centroidDistance(curChildObj, fatherObj);
    // 子层级的最大NND和最小NND、最大CD和最小CD
    if (curNND > maxNND) {
      maxNND = curNND;
    }
    if (curCD > maxCD) {
      maxCD = curCD;
    }
    if (curNND < minNND) {
      minNND = curNND;
    }
    if (curCD < minCD) {
      minCD = curCD;
    }
    // 存储NND、CD
    info[i].NND = curNND;
    info[i].CD = curCD;
  }
  // 最小score及其child索引，也就是需要和targetObj替换的child obj
  let minScore = Infinity,
    minScoreChildIndex = -1;
  // 计算所有子层级的NND Ratio、CD Ratio和score
  for (let i = 0; i < info.length; i++) {
    info[i].NNDNormalization = info[i].NND / (maxNND - minNND);
    info[i].CDNormalization = info[i].CD / (maxCD - minCD);
    info[i].score =
      info[i].NNDNormalization * nodesNumWeight +
      info[i].CDNormalization * centroidDistanceWeight;
    if (info[i].score < minScore) {
      minScore = info[i].score;
      minScoreChildIndex = i;
    }
  }
  // 如果能找到可以替换的pod，那么就替换；如果当前数据集的pod太少、找不到可以替换的，就不替换
  if (minScoreChildIndex !== -1) {
    // 将targeChildtObj和minScoreChild互换
    let minScoreChildObj = fatherObj.children[minScoreChildIndex];
    [targetChildObj.area, minScoreChildObj.area] = [
      minScoreChildObj.area,
      targetChildObj.area,
    ];
    [targetChildObj.polygon, minScoreChildObj.polygon] = [
      minScoreChildObj.polygon,
      targetChildObj.polygon,
    ];
    [targetChildObj.maxIncircle, minScoreChildObj.maxIncircle] = [
      minScoreChildObj.maxIncircle,
      targetChildObj.maxIncircle,
    ];
  }
}
/**
 * 两个区域的节点数之差
 * @param area1
 * @param area2
 * @returns
 */
function nodesNumDifferential(area1: any, area2: any): number {
  return Math.abs(area1.value - area2.value);
}
/**
 * 两个区域之间质心的欧式距离
 * @param area1 区域1
 * @param area2 区域2
 */
function centroidDistance(area1: any, area2: any): number {
  let area1Site = area1.polygon['site'];
  let area2Site = area2.polygon['site'];
  // let area1Site = area1.site || area1.polygon.site;
  // let area2Site = area2.site || area2.polygon.site;
  if (!area1Site || !area2Site) {
    return NaN;
  }
  let centroid1: number[] = [area1Site.x, area1Site.y];
  let centroid2: number[] = [area2Site.x, area2Site.y];
  let deltaX: number = centroid1[0] - centroid2[0];
  let deltaY: number = centroid1[1] - centroid2[1];
  return Math.sqrt(deltaX ** 2 + deltaY ** 2);
}
export { centralizing };
