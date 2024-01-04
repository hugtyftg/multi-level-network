import { polygonContains as d3PolygonContains } from 'd3-polygon';
export default function random() {
  let clippingPolygon: number[] | any,
    clippingExtent: number[] | any,
    minXCoordinate: number | any,
    maxXCoordinate: number | any,
    minYCoordinate: number | any,
    maxYCoordinate: number | any,
    deltaX: number | any,
    deltaY: number | any;

  function randomGenerator(
    d: any,
    i: number,
    arr: any,
    voronoiMapSimulation: any
  ) {
    let needUpdateInternals: boolean = false;
    let xCoordinate: any, yCoordinate: any;
    if (clippingPolygon !== voronoiMapSimulation.clip()) {
      clippingPolygon = voronoiMapSimulation.clip();
      clippingExtent = voronoiMapSimulation.extent();
      needUpdateInternals = true;
    }

    if (needUpdateInternals) {
      updateInternals();
    }

    xCoordinate = minXCoordinate + deltaX * voronoiMapSimulation.prng()();
    yCoordinate = minYCoordinate + deltaY * voronoiMapSimulation.prng()();
    while (!d3PolygonContains(clippingPolygon, [xCoordinate, yCoordinate])) {
      xCoordinate = minXCoordinate + deltaX * voronoiMapSimulation.prng()();
      yCoordinate = minYCoordinate + deltaY * voronoiMapSimulation.prng()();
    }
    return [xCoordinate, yCoordinate];
  }

  function updateInternals() {
    minXCoordinate = clippingExtent[0][0];
    maxXCoordinate = clippingExtent[1][0];
    minYCoordinate = clippingExtent[0][1];
    maxYCoordinate = clippingExtent[1][1];
    deltaX = maxXCoordinate - minXCoordinate;
    deltaY = maxYCoordinate - minYCoordinate;
  }

  return randomGenerator;
}
