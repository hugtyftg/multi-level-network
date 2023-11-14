import {
  polygonCentroid as d3PolygonCentroid
} from 'd3-polygon';


export default function pie () {
  let startAngle: number | any = 0;
  let clippingPolygon: number[] | any,
    dataList: number[] | any,
    dataListLength: number | any,
    clippingPolygonCentroidPos: any,
    curHalfIncircleRadius: number | any,
    angleBetweenData: number | any;
  function pieGenerator(d: any, i: number, arr: any, voronoiMapSimulation: any) {
    let needUpdateInternals = false;

    if (clippingPolygon !== voronoiMapSimulation.clip()) {
      clippingPolygon = voronoiMapSimulation.clip();
      needUpdateInternals = needUpdateInternals || true;
    }
    if (dataList !== arr) {
      dataList = arr;
      needUpdateInternals = needUpdateInternals || true;
    }

    if (needUpdateInternals) {
      updateInternals();
    }
    // 随机加上很小的浮动避免出现共线性或共圆性的点,再整体减去0.5保持平均数不变
    return [
      clippingPolygonCentroidPos[0] + Math.cos(startAngle + i * angleBetweenData) * curHalfIncircleRadius + (voronoiMapSimulation.prng()() - 0.5) * 1E-3,
      clippingPolygonCentroidPos[1] + Math.sin(startAngle + i * angleBetweenData) * curHalfIncircleRadius + (voronoiMapSimulation.prng()() - 0.5) * 1E-3
    ];
  }

  pieGenerator.startAngle = (newStartAngle: any) => {
    if (!newStartAngle) {
      return startAngle;
    }
    startAngle = newStartAngle;
    return pieGenerator;
  };

  function updateInternals() {
    clippingPolygonCentroidPos = d3PolygonCentroid(clippingPolygon);
    curHalfIncircleRadius = computeMinDistFromEdges(clippingPolygonCentroidPos, clippingPolygon) / 2;
    dataListLength = dataList.length;
    angleBetweenData = 2 * Math.PI / dataListLength;
  }

  function computeMinDistFromEdges(vertex: any, clippingPolygon: any) {
    let minDistanceFromEdges = Infinity,
      curEdgeIndex = 0,
      edgeVertex0 = clippingPolygon[clippingPolygon.length - 1],
      edgeVertex1 = clippingPolygon[curEdgeIndex];
    let distanceFromCurrentEdge: any;

    while (curEdgeIndex < clippingPolygon.length) {
      distanceFromCurrentEdge = vDistance(vertex, edgeVertex0, edgeVertex1);
      if (distanceFromCurrentEdge < minDistanceFromEdges) {
        minDistanceFromEdges = distanceFromCurrentEdge;
      }
      curEdgeIndex++;
      edgeVertex0 = edgeVertex1;
      edgeVertex1 = clippingPolygon[curEdgeIndex];
    }

    return minDistanceFromEdges;
  }
  // 点到线段的最短距离
  function vDistance(vertex: number[] | any, edgeVertex0: number[] | any, edgeVertex1: number[] | any) {
    let vertexXCoordinate = vertex[0],
      vertexYCoordinate = vertex[1],
      edgeVertex0CoordinateX1 = edgeVertex0[0],
      edgeVertex0CoordinateY1 = edgeVertex0[1],
      edgeVertex0CoordinateX2 = edgeVertex1[0],
      edgeVertex0CoordinateY2 = edgeVertex1[1];
    let A = vertexXCoordinate - edgeVertex0CoordinateX1,
      B = vertexYCoordinate - edgeVertex0CoordinateY1,
      C = edgeVertex0CoordinateX2 - edgeVertex0CoordinateX1,
      D = edgeVertex0CoordinateY2 - edgeVertex0CoordinateY1;
    let dotProduct = A * C + B * D;
    let lenSq = C * C + D * D;
    let parameter = -1;

    if (lenSq !== 0) {
      parameter = dotProduct / lenSq;
    }
    let xx: any, yy: any;

    if (parameter < 0) { // 此时被划分的多边形区域是凸多边形
      xx = edgeVertex0CoordinateX1;
      yy = edgeVertex0CoordinateY1;
    } else if (parameter > 1) { // 此时被划分的多边形区域不是凸多边形
      xx = edgeVertex0CoordinateX2;
      yy = edgeVertex0CoordinateY2;
    } else {
      xx = edgeVertex0CoordinateX1 + parameter * C;
      yy = edgeVertex0CoordinateY1 + parameter * D;
    }

    let deltaX = vertexXCoordinate - xx;
    let deltaY = vertexYCoordinate - yy;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
  return pieGenerator;
}