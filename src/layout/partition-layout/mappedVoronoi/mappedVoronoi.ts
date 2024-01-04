import {
  polygonCentroid as d3PolygonCentroid,
  polygonArea as d3PolygonArea,
  polygonContains as d3PolygonContains,
} from 'd3-polygon';
import { timer as d3Timer } from 'd3-timer';
import { dispatch as d3Dispatch } from 'd3-dispatch';
import { weightedVoronoi as d3WeightedVoronoi } from '../weightedVoronoi';
import { FlickeringMitigation } from './flickeringMitigation';
import randomInitialPosition from './random';
import halfAverageAreaInitialWeight from './halfAverageArea';
import MappedVoronoiError from './MappedVoronoiError';
import { seed } from '../nestedVoronoi/seed';
export function mappedVoronoiSimulation(data: any) {
  let CONVERGE_RATIO_DEFAULT: number = 0.01;
  let MAX_ITER_NUM_DEFAULT: number = 50;
  let MIN_WEIGHT_RATIO_DEFAULT: number = 0.01;
  let PNG_DEFAULT = seed(0);
  let INIT_POS_DEFAULT = randomInitialPosition();
  let INIT_WEIGHT_DEFAULT = halfAverageAreaInitialWeight();
  const CONS_EPSILON: number = 1e-10;

  let weight = (d: any) => d.weight; // 权重accessor
  let convergenceRatio: number = CONVERGE_RATIO_DEFAULT; // 目标阈值error ratio；默认0.01停止迭代，即当前划分的各区域面积与其期望面积的差值小于该层总面积的1%
  let maxIterNum: number = MAX_ITER_NUM_DEFAULT; // 最大循环次数，若达到该次数，即使还没满足convergence的error ratio条件，迭代计算也停止
  let minWeightRatio: number = MIN_WEIGHT_RATIO_DEFAULT; // 计算某个情况下保持幂加权图几何性质正确的的最小权重，默认为最大权重的1，避免某个小区域的权重太接近1
  let prng = PNG_DEFAULT; // 伪随机数生成器 pseudorandom number generator
  let initialPosition = INIT_POS_DEFAULT; // 初始位置访问器
  let initialWeight = INIT_WEIGHT_DEFAULT; // 初始权重访问器

  let weightedVoronoi = d3WeightedVoronoi(),
    flickeringMitigation = new FlickeringMitigation(),
    needInit: boolean = true,
    siteCount: number | any, // 站点数目
    allArea: number | any, // 划分多边形的面积
    errorOfAreaTreshold: number | any, // 目标area error阈值 area error (= allArea * convergenceRatio); 低于该阈值时停止迭代
    curIterNum: number | any, // 当前循环次数
    resultPolgon: number[] | any, // 当前分割得到的各个多边形
    errorOfArea: any, // 当前area error
    converged: boolean | any, // 当errorOfArea < errorOfAreaTreshold为true
    simulationFinished: boolean | any; // 如果终止迭代计算 或 达到convergenceRatio 或 达到最大迭代次数时 结束

  let simulation: any,
    simulationStepper: any = d3Timer(step),
    simulationEvent: any = d3Dispatch('tick', 'end');
  const HANDLE_OVERWEIGHTED_letIANT: number | any = 1;
  const HANDLE_OVERWEIGHTED_CASES = [0, 1];
  const HANLDE_OVERWEIGHTED_MAX_ITERATION_COUNT: number | any = 1000; // 优化权重过大的站点的最大迭代次数
  let handleOverweighted: boolean | any; // 是否解决了站点权重过大的问题
  // 两点距离的平方
  function squaredDistance(s0: number[] | any, s1: number[] | any) {
    let squaredDistance =
      (s1.x - s0.x) * (s1.x - s0.x) + (s1.y - s0.y) * (s1.y - s0.y);
    return squaredDistance;
  }

  // 暴露出来的力模拟器
  simulation = {
    tick,
    restart() {
      simulationStepper.restart(step);
      return simulation;
    },
    stop() {
      simulationStepper.stop();
      return simulation;
    },

    weight(newWeight?: any) {
      if (!newWeight) {
        return weight;
      }

      weight = newWeight;
      needInit = true;
      return simulation;
    },

    convergenceRatio(newConvergence?: any) {
      if (!newConvergence) {
        return convergenceRatio;
      }

      convergenceRatio = newConvergence;
      needInit = true;
      return simulation;
    },

    maxIterationCount(newMaxIterNum?: any) {
      if (!newMaxIterNum) {
        return maxIterNum;
      }

      maxIterNum = newMaxIterNum;
      return simulation;
    },

    minWeightRatio(newMinWeightRatio?: any) {
      if (!newMinWeightRatio) {
        return minWeightRatio;
      }

      minWeightRatio = newMinWeightRatio;
      needInit = true;
      return simulation;
    },

    clip(newSubjectPolygon?: any) {
      if (!newSubjectPolygon) {
        return weightedVoronoi.clip();
      }

      weightedVoronoi.clip(newSubjectPolygon);
      needInit = true;
      return simulation;
    },

    extent(newExtent?: any) {
      if (!newExtent) {
        return weightedVoronoi.extent();
      }

      weightedVoronoi.extent(newExtent);
      needInit = true;
      return simulation;
    },

    size(newSize?: any) {
      if (!newSize) {
        return weightedVoronoi.size();
      }

      weightedVoronoi.size(newSize);
      needInit = true;
      return simulation;
    },

    prng(newPng?: any) {
      if (!newPng) {
        return prng;
      }

      prng = newPng;
      needInit = true;
      return simulation;
    },

    initialPosition(newPos?: any) {
      if (!newPos) {
        return initialPosition;
      }

      initialPosition = newPos;
      needInit = true;
      return simulation;
    },

    initialWeight(newInitWeight?: any) {
      if (!newInitWeight) {
        return initialWeight;
      }

      initialWeight = newInitWeight;
      needInit = true;
      return simulation;
    },

    state() {
      if (needInit) {
        initializeSimulation();
      }
      let resultConvergenRatio = errorOfArea / allArea;
      return {
        ended: simulationFinished,
        iterationCount: curIterNum,
        convergenceRatio: resultConvergenRatio,
        polygons: resultPolgon,
      };
    },

    on(name: string | any, callback?: any) {
      if (!callback) {
        return simulationEvent.on(name);
      }

      simulationEvent.on(name, callback);
      return simulation;
    },
  };

  // 迭代计算的主循环
  function step() {
    tick();
    simulationEvent.call('tick', simulation);
    if (simulationFinished) {
      simulationStepper.stop();
      simulationEvent.call('end', simulation);
    }
  }

  // 每次迭代计算调用
  function tick() {
    if (!simulationFinished) {
      if (needInit) {
        initializeSimulation();
      }
      resultPolgon = adapt(resultPolgon, flickeringMitigation.ratio());
      curIterNum++;
      errorOfArea = computeerrorOfArea(resultPolgon);
      flickeringMitigation.add(errorOfArea);
      converged = errorOfArea < errorOfAreaTreshold;
      simulationFinished = converged || curIterNum >= maxIterNum;
    }
  }

  function initializeSimulation() {
    // 解决权重不合理的情况
    setHandleOverweighted();

    siteCount = data.length;
    allArea = Math.abs(d3PolygonArea(weightedVoronoi.clip()));
    errorOfAreaTreshold = convergenceRatio * allArea;
    flickeringMitigation.clear().totalArea(allArea);

    curIterNum = 0;
    converged = false;
    resultPolgon = initialize(data, simulation);
    simulationFinished = false;
    needInit = false;
  }

  function initialize(data: any, simulation: any) {
    let maxWeight = data.reduce((max: any, d: any) => {
      return Math.max(max, weight(d));
    }, -Infinity);
    let minAllowedWeight = maxWeight * minWeightRatio;
    let weights, mapPointsList: any;

    // 提取权重
    weights = data.map((originalData: any, index: number, arr: any) => ({
      index,
      weight: Math.max(weight(originalData), minAllowedWeight),
      initialPosition: initialPosition(originalData, index, arr, simulation),
      initialWeight: initialWeight(originalData, index, arr, simulation),
      originalData,
    }));

    // 用目标面积（期望面积）、初始位置和初始权重创建map points
    mapPointsList = createMapPoints(weights, simulation);
    handleOverweighted(mapPointsList);
    return weightedVoronoi(mapPointsList);
  }

  function createMapPoints(basePoints: any, simulation: any) {
    let totalWeight = basePoints.reduce(
      (acc: any, bp: any) => (acc += bp.weight),
      0
    );
    let initPos: any;

    return basePoints.map((basePoint: any, i: number | any, bps: any) => {
      initPos = basePoint.initialPosition;
      let inPolygon = d3PolygonContains(weightedVoronoi.clip(), initPos);
      if (!inPolygon) {
        initPos = INIT_POS_DEFAULT(basePoint, i, bps, simulation);
      }
      let targetedArea: number = (allArea * basePoint.weight) / totalWeight;
      return {
        index: basePoint.index,
        targetedArea,
        data: basePoint,
        x: initPos[0],
        y: initPos[1],
        weight: basePoint.initialWeight,
      };
    });
  }
  // 优化站点的权重和位置
  function adapt(
    resultPolgon: number[] | any,
    flickeringMitigationRatio: number | any
  ) {
    let adaptedMapPoints: any;

    adaptPositions(resultPolgon, flickeringMitigationRatio);
    adaptedMapPoints = resultPolgon.map(
      (polygon: any) => polygon.site.originalObject
    );
    resultPolgon = weightedVoronoi(adaptedMapPoints);
    if (resultPolgon.length < siteCount) {
      throw new MappedVoronoiError('至少有一个站点还没分得区域!');
    }

    adaptWeights(resultPolgon, flickeringMitigationRatio);
    adaptedMapPoints = resultPolgon.map(
      (polygon: any) => polygon.site.originalObject
    );
    resultPolgon = weightedVoronoi(adaptedMapPoints);
    if (resultPolgon.length < siteCount) {
      throw new MappedVoronoiError('至少有一个站点还没分得区域!');
    }

    return resultPolgon;
  }
  // 优化站点位置
  function adaptPositions(
    resultPolgon: number[] | any,
    flickeringMitigationRatio: number | any
  ) {
    let newMapPoints: any[] = [];
    let flickeringInfluence: number = 0.5;
    let flickeringMitigation: number,
      d: number,
      polygon: any,
      mapPoint: any,
      centroidPos: number[],
      deltaX: number,
      deltaY: number;

    flickeringMitigation = flickeringInfluence * flickeringMitigationRatio;
    d = 1 - flickeringMitigation; // in [0.5, 1]
    for (let i = 0; i < siteCount; i++) {
      polygon = resultPolgon[i];
      mapPoint = polygon.site.originalObject;
      centroidPos = d3PolygonCentroid(polygon);
      deltaX = centroidPos[0] - mapPoint.x;
      deltaY = centroidPos[1] - mapPoint.y;
      deltaX *= d;
      deltaY *= d;
      mapPoint.x += deltaX;
      mapPoint.y += deltaY;
      newMapPoints.push(mapPoint);
    }

    handleOverweighted(newMapPoints);
  }
  // 优化站点权重
  function adaptWeights(
    resultPolgon: number[] | any,
    flickeringMitigationRatio: number | any
  ) {
    let newMapPoints: any = [];
    let flickeringInfluence = 0.1;
    let flickeringMitigation: number,
      polygon: any,
      curMappedPoint: any,
      curArea: number,
      adaptedRatio: number,
      adaptedWeight: number;

    flickeringMitigation = flickeringInfluence * flickeringMitigationRatio;
    for (let i = 0; i < siteCount; i++) {
      polygon = resultPolgon[i];
      curMappedPoint = polygon.site.originalObject;
      curArea = d3PolygonArea(polygon);
      adaptedRatio = curMappedPoint.targetedArea / curArea;
      adaptedRatio = Math.max(
        adaptedRatio,
        1 - flickeringInfluence + flickeringMitigation
      );
      adaptedRatio = Math.min(
        adaptedRatio,
        1 + flickeringInfluence - flickeringMitigation
      );
      adaptedWeight = curMappedPoint.weight * adaptedRatio;
      adaptedWeight = Math.max(adaptedWeight, CONS_EPSILON);
      curMappedPoint.weight = adaptedWeight;

      newMapPoints.push(curMappedPoint);
    }

    handleOverweighted(newMapPoints);
  }

  // 启发式的策略解决权重过大、违背几何含义的情况:将站点移动到质心位置时,大的权重可能导致站点的圆里有多个站点
  function handleOverweighted0(mapPoints: any) {
    let fixedNum = 0;
    let isFixed: boolean, tempPoint1: any, tempPoint2: any;
    let weightest: any, lightest: any;
    let squareDiameter: number, adaptedWeight: number;
    do {
      if (fixedNum > HANLDE_OVERWEIGHTED_MAX_ITERATION_COUNT) {
        throw new MappedVoronoiError('handleOverweighted0 迭代太多次了!');
      }
      isFixed = false;
      for (let i = 0; i < siteCount; i++) {
        tempPoint1 = mapPoints[i];
        for (let j = i + 1; j < siteCount; j++) {
          tempPoint2 = mapPoints[j];
          if (tempPoint1.weight > tempPoint2.weight) {
            weightest = tempPoint1;
            lightest = tempPoint2;
          } else {
            weightest = tempPoint2;
            lightest = tempPoint1;
          }
          squareDiameter = squaredDistance(tempPoint1, tempPoint2);
          if (squareDiameter < weightest.weight - lightest.weight) {
            adaptedWeight = squareDiameter + lightest.weight / 2;
            adaptedWeight = Math.max(adaptedWeight, CONS_EPSILON);
            weightest.weight = adaptedWeight;
            isFixed = true;
            fixedNum++;
            break;
          }
        }
        if (isFixed) {
          break;
        }
      }
    } while (isFixed === true);
  }

  // 启发式地逐渐增大权重
  function handleOverweighted1(mapPoints: any) {
    let fixedNum = 0;
    let isFixed: boolean,
      tempPoint1: any,
      tempPoint2: any,
      weightest: any,
      lightest: any,
      squareDiameter: number,
      overweight: number;
    do {
      if (fixedNum > HANLDE_OVERWEIGHTED_MAX_ITERATION_COUNT) {
        throw new MappedVoronoiError('handleOverweighted1 迭代太多次了!');
      }
      isFixed = false;
      for (let i = 0; i < siteCount; i++) {
        tempPoint1 = mapPoints[i];
        for (let j = i + 1; j < siteCount; j++) {
          tempPoint2 = mapPoints[j];
          if (tempPoint1.weight > tempPoint2.weight) {
            weightest = tempPoint1;
            lightest = tempPoint2;
          } else {
            weightest = tempPoint2;
            lightest = tempPoint1;
          }
          squareDiameter = squaredDistance(tempPoint1, tempPoint2);
          if (squareDiameter < weightest.weight - lightest.weight) {
            overweight = weightest.weight - lightest.weight - squareDiameter;
            lightest.weight += overweight + CONS_EPSILON;
            isFixed = true;
            fixedNum++;
            break;
          }
        }
        if (isFixed) {
          break;
        }
      }
    } while (isFixed);
  }
  // 在优化步骤中根据权重违背几何性质的情形来启发式地改变权重
  function setHandleOverweighted() {
    switch (HANDLE_OVERWEIGHTED_letIANT) {
      case HANDLE_OVERWEIGHTED_CASES[0]:
        handleOverweighted = handleOverweighted0;
        break;
      case HANDLE_OVERWEIGHTED_CASES[1]:
        handleOverweighted = handleOverweighted1;
        break;
      default:
        console.error('未知的权重不符合几何性质的情况');
        handleOverweighted = handleOverweighted0;
    }
  }
  // 计算某个区域的实际面积与期望面积的差值
  function computeerrorOfArea(resultPolgon: number[] | any) {
    let errorOfAreaSum = 0;
    let curPolygon: any, mapPoint: any, currentArea: number;
    for (let i = 0; i < siteCount; i++) {
      curPolygon = resultPolgon[i];
      mapPoint = curPolygon.site.originalObject;
      currentArea = d3PolygonArea(curPolygon);
      errorOfAreaSum += Math.abs(mapPoint.targetedArea - currentArea);
    }
    return errorOfAreaSum;
  }
  return simulation;
}
