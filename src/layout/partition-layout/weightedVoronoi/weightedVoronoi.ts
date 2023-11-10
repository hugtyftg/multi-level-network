import { extent as d3Extent } from 'd3-array';
import { polygonHull as d3PolygonHull } from 'd3-polygon';
import { epsilon, polygonDirection } from './formula';
import { Vertex } from './Vertex';
import { computePowerDiagramIntegrated } from './powerDiagram';

export function weightedVoronoi() {
  // 带参数时为设置器，空参数时为访问器
  let x = (d?: any) => {
    return d.x;
  }; // x访问器
  let y = (d?: any) => {
    return d.y;
  }; // y访问器
  let weight = (d?: any) => {
    return d.weight;
  }; // 权重访问器
  let clip: number[][] = [[0, 0], [0, 1], [1, 1], [1, 0]]; // clipping polygon
  let extent: number[][] = [[0, 0], [1, 1]]; // clipping polygon的范围
  let size: number[] | any = [1, 1]; // clipping polygon的宽高

  // 将带有权重的站点映射成幂加权Voronoi图
  function weightedVoronoiGenerator(data: any) {
    let formatedMappedSites: any;
    formatedMappedSites = data.map((d: any) => new Vertex(x(d), y(d), null, weight(d), d, false));
    let calPowerDiagram = computePowerDiagramIntegrated(formatedMappedSites, boundingSites(), clip)
    return calPowerDiagram;
  }

  // x的访问器（不传参）/设置器（传入新的x访问器函数）
  weightedVoronoiGenerator.x = (arg?: any): any => {
    if (!arg) {
      return x;
    }
    x = arg;
    return weightedVoronoiGenerator;
  };
  // y的访问器（不传参）/设置器（传入新的访问器函数）
  weightedVoronoiGenerator.y = (arg?: any): any => {
    if (!arg) {
      return y;
    }
    y = arg;
    return weightedVoronoiGenerator;
  };
  // 权重的访问器（不传参）/设置器（传入新的访问器函数）
  weightedVoronoiGenerator.weight = (arg?: any): any => {
    if (!arg) {
      return weight;
    }

    weight = arg;
    return weightedVoronoiGenerator;
  };
  // clipping polygon的访问器（不传参）/设置器（传入新的访问器函数）
  weightedVoronoiGenerator.clip = (arg?: any): any => {
    let direction: any, xExtent: any[], yExtent: any[];

    if (!arg) {
      return clip;
    }
    xExtent = d3Extent(
      arg.map(function (c: any) {
        return c[0];
      })
    );
    yExtent = d3Extent(arg.map((c: any) => c[1]));
    direction = polygonDirection(arg);
    if (direction === undefined) {
      clip = d3PolygonHull(arg) as any[]; // ensure clip to be a convex, hole-free, counterclockwise polygon
    } else if (direction === 1) {
      clip = arg.reverse(); // already convex, order array in the same direction as d3-polygon.polygonHull(...)
    } else {
      clip = arg;
    }
    extent = [[xExtent[0], yExtent[0]], [xExtent[1], yExtent[1]]];
    let xRange = xExtent[1] - xExtent[0];
    let yRange = yExtent[1] - yExtent[0];
    size = [xRange, yRange];
    return weightedVoronoiGenerator;
  };
  // clipping polygon的范围的访问器（不传参）/设置器（传入新的访问器函数）
  weightedVoronoiGenerator.extent = (arg?: any): any => {
    if (!arg) {
      return extent;
    }

    clip = [arg[0], [arg[0][0], arg[1][1]], arg[1], [arg[1][0], arg[0][1]]];
    extent = arg;
    size = [arg[1][0] - arg[0][0], arg[1][1] - arg[0][1]];
    return weightedVoronoiGenerator;
  };
  // clipping polygon的宽高尺寸的访问器（不传参）/设置器（传入新的访问器函数）
  weightedVoronoiGenerator.size = (arg?: any): any => {
    if (!arg) {
      return size;
    }

    clip = [
      [0, 0],
      [0, arg[1]],
      [arg[0], arg[1]],
      [arg[0], 0],
    ];
    extent = [[0, 0], arg];
    size = arg;
    return weightedVoronoiGenerator;
  };
  // 给每个站点绑定初始数据，如站点的多边形区域的坐标、宽高、权重等
  function boundingSites() {
    let minXCoordinate: number,
      maxXCoordinate: number,
      minYCoordinate: number,
      maxYCoordinate: number,
      subAreaWidth: number,
      subAreaHeight: number,
      boundInitX0: number,
      boundInitX1: number,
      boundInitY0: number,
      boundInitY1: number,
      boundSitesData: any[] = [],
      boundSitesList: any[] = [];

    minXCoordinate = extent[0][0];
    maxXCoordinate = extent[1][0];
    minYCoordinate = extent[0][1];
    maxYCoordinate = extent[1][1];
    subAreaWidth = maxXCoordinate - minXCoordinate;
    subAreaHeight = maxYCoordinate - minYCoordinate;
    boundInitX0 = minXCoordinate - subAreaWidth;
    boundInitX1 = maxXCoordinate + subAreaWidth;
    boundInitY0 = minYCoordinate - subAreaHeight;
    boundInitY1 = maxYCoordinate + subAreaHeight;
    boundSitesData[0] = [boundInitX0, boundInitY0];
    boundSitesData[1] = [boundInitX0, boundInitY1];
    boundSitesData[2] = [boundInitX1, boundInitY1];
    boundSitesData[3] = [boundInitX1, boundInitY0];

    for (let i = 0; i < 4; i++) {
      boundSitesList.push(
        new Vertex(
          boundSitesData[i][0],
          boundSitesData[i][1],
          null,
          epsilon,
          new Vertex(boundSitesData[i][0], boundSitesData[i][1], null, epsilon, null, true),
          true
        )
      );
    }

    return boundSitesList;
  }

  return weightedVoronoiGenerator;
}
