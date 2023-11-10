import {polygonLength} from 'd3-polygon';
import {epsilon} from './formula';
import {ConvexHull} from './ConvexHull';
import {polygonClip} from './polygonClip';

// 计算原始点所在的三维面face
function getFacesOfDestVertex(edge: any) {
  let facesList: any[] = [];
  let previousEdge = edge;
  let first = edge.destine;
  let site = first.originalObject;
  let neighboursList: any[] = [];
  do {
    previousEdge = previousEdge.twin.prev;
    let originSite = previousEdge.origin.originalObject;
    if (!originSite.dummyStatus) {
      neighboursList.push(originSite);
    }
    let iFace = previousEdge.iFace;
    if (iFace.isVisibleFromBelow()) {
      facesList.push(iFace);
    }
  } while (previousEdge !== edge);
  site.neighboursList = neighboursList;
  return facesList;
}

// 计算幂加权voronoi图
export function computePowerDiagramIntegrated (sites: any, boundSitesList: any, clippingPolygon: any[]) {
  let convexHull = new ConvexHull();
  convexHull.clear();
  convexHull.init(boundSitesList, sites);

  let facesList: any[] = convexHull.compute();
  let powerWeightedPolygons: any[] = []; 
  let verticesVisited: any[] = [];
  let facetCount: number = facesList.length;

  for (let i = 0; i < facetCount; i++) {
    let facet = facesList[i];
    if (facet.isVisibleFromBelow()) {
      for (let e = 0; e < 3; e++) {
        // 遍历双向连接的边列表建立站点的多边形区域
        let edge = facet.edgesList[e];
        let destineVertex = edge.destine;
        let curSite = destineVertex.originalObject; 

        if (!verticesVisited[destineVertex.index]) {
          verticesVisited[destineVertex.index] = true;
          if (curSite.dummyStatus) {
            // 检查该站点是否是该多边形区域对应的站点
            continue;
          }
          // 对偶空间中包含某个点的所有面，这些面对应三维空间中的多边形顶点
          let faces = getFacesOfDestVertex(edge);
          let protopoly: any = [];
          let lastXCoordinate: null | any = null;
          let lastYCoordinate: null | any = null;
          let deltaX = 1;
          let deltaY = 1;
          for (let j = 0; j < faces.length; j++) {
            let point = faces[j].getDualPoint();
            let x1 = point.x;
            let y1 = point.y;
            if (lastXCoordinate !== null) {
              deltaX = lastXCoordinate - x1;
              deltaY = lastYCoordinate - y1;
              if (deltaX < 0) {
                deltaX = -deltaX;
              }
              if (deltaY < 0) {
                deltaY = -deltaY;
              }
            }
            if (deltaX > epsilon || deltaY > epsilon) {
              protopoly.push([x1, y1]);
              lastXCoordinate = x1;
              lastYCoordinate = y1;
            }
          }
          
          curSite.nonClippedPolygon = protopoly.reverse();
          let calStatus: boolean = !curSite.dummyStatus && polygonLength(curSite.nonClippedPolygon) > 0;
          if (calStatus) {
            let clippedPolygon = polygonClip(clippingPolygon, curSite.nonClippedPolygon);
            curSite.polygon = clippedPolygon;
            clippedPolygon.site = curSite;
            if (clippedPolygon.length > 0) {
              powerWeightedPolygons.push(clippedPolygon);
            }
          }
        }
      }
    }
  }
  return powerWeightedPolygons;
}
