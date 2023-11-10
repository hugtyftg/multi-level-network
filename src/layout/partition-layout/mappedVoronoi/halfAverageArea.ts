import {
  polygonArea as d3PolygonArea
} from 'd3-polygon';

export default function halfAverageAreaGenerator () {

  let clippingPolygon: number[] | any,
    dataList: number[] | any,
    siteNum: number | any,
    allArea: number | any,
    halfAverageAreaValue: number | any;

    // 被划分的多边形区域的平均面积的一半
  function halfAverageAreaGenerator(d: any, index: number, arr: any, voronoiMapSimulation: any) {
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
    return halfAverageAreaValue;
  };

  function updateInternals() {
    siteNum = dataList.length;
    allArea = d3PolygonArea(clippingPolygon);
    halfAverageAreaValue = allArea / siteNum / 2; 
  }

  return halfAverageAreaGenerator;
};