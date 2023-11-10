// UPDATE10: 点是否在多边形内（包含视觉效果的更严格计算）——方法2，如果点到每条边的距离都大于某个阈值，则认为它在多边形内
import { pointLineDistance } from "./polygonIncircle";

// 可以一边判断，一边修改坐标位置
function isInPolygon(polygon: number[] | any, point: any) {
  let threshold: number = 5;
  let crossBoundary: boolean = false;
  // 只要点到某一条边的距离小于阈值，则这个点被认为越界
  for (let i = 0; i < polygon.length - 1; i++) {
    let j = i + 1;
    let point1 = polygon[i];
    let point2 = polygon[j];
    let distance = pointLineDistance(point, point1, point2)
    if (distance < threshold) {
      crossBoundary = !crossBoundary;
    }
  }
  return !crossBoundary
}

// UPDATE11: 由于设备节点circle有形状、Voronoi Cell有stroke-width，
// 因此在计算点是否在多边形内部时需要考虑这些因素，判断有半径尺寸的设备节点是否在视觉上处于多边形内，否则视觉上仍可能越界
// 核心思想：加入扰动项，在判断点是否在多边形内部时以该距离拉动节点远离内切圆
function isInPolygonVisually(excitationPadding: number | any, [currentCx, currentCy]: number[] | any, [maxIncircleCx, maxIncircleCy]: number[] | any, polygon: number[] | any) {
  if (currentCx < maxIncircleCx) {
    currentCx -= excitationPadding;
  } else {
    currentCx += excitationPadding;
  }
  // 判断节点坐标和圆心y坐标的位置关系，判断怎样移动节点坐标
  if (currentCy < maxIncircleCy) {
    currentCy -= excitationPadding;
  } else {
    currentCy += excitationPadding;
  }
  let isInside = isInPolygon(polygon, [currentCx, currentCy])
  return isInside;
}
export {
  isInPolygonVisually
}