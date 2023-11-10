import { mappedVoronoiSimulation as d3VoronoiMapSimulation} from '../mappedVoronoi';
import { seed } from './seed';
export function nestedVoronoi(seedNum: number) {
  let curClipPolygon: number[][] = [[0, 0], [0, 1], [1, 1], [1, 0]]; // 划分多边形
  let extent: number[][] = [[0, 0], [1, 1]]; // 划分多边形的范围
  let size: number[] = [1, 1]; // 划分多边形的宽高
  let CONVERGE_RATIO_DEFAULT: number = 0.01;
  let MAX_ITER_NUM_DEFAULT: number = 50;
  let MINST_WEIGHT_DEFAULT: number = 0.01;
  /* ------------------消除随机性的分割----------------- */
  // let PNG_DEFAULT = Math.random;
  let PNG_DEFAULT = seed(seedNum);
  /* ------------------消除随机性的分割----------------- */
  let convergenceRatio: number = CONVERGE_RATIO_DEFAULT; // 目标阈值error ratio；默认0.01停止迭代，即当前划分的各区域面积与其期望面积的差值小于该层总面积的1%
  let maxIterNum: number = MAX_ITER_NUM_DEFAULT; // 最大循环次数，若达到该次数，即使还没满足convergence的error ratio条件，迭代计算也停止
  let minWeightRatio: number = MINST_WEIGHT_DEFAULT; // 计算某个情况下保持幂加权图几何性质正确的的最小权重，默认为最大权重的1，避免某个小区域的权重太接近1
  let pseudorandomNumberGenerator = PNG_DEFAULT; // 伪随机数生成器
  let unrelevantButNeedeData = Array.from({length: 2}, () => {})
  let _convenientReusableVoronoiMapSimulation = d3VoronoiMapSimulation(unrelevantButNeedeData).stop();

  function nestedVoronoiGenerator(rootNode: any) {
    recurse(curClipPolygon, rootNode);
  }

  nestedVoronoiGenerator.clip = (newClipPolygon?: any): any => {
    if (!newClipPolygon) {
      return curClipPolygon;
    }
    // 使用voronoiMap.clip()计算clip
    _convenientReusableVoronoiMapSimulation.clip(newClipPolygon);
    curClipPolygon = _convenientReusableVoronoiMapSimulation.clip();
    extent = _convenientReusableVoronoiMapSimulation.extent();
    size = _convenientReusableVoronoiMapSimulation.size();
    return nestedVoronoiGenerator;
  };

  function recurse(clippingPolygon?: any, site?: any) {
    let simulation: any;
    let simulateStatus: any;
    //设置每个站点的polygon
    site.polygon = clippingPolygon;

    if (site.height !== 0) {
      simulation = d3VoronoiMapSimulation(site.children)
        .clip(clippingPolygon)
        .weight((datam: any) => datam.value)
        .convergenceRatio(convergenceRatio)
        .maxIterationCount(maxIterNum)
        .minWeightRatio(minWeightRatio)
        .prng(pseudorandomNumberGenerator)
        .stop();
      simulateStatus = simulation.state(); // 存储voronoi simulation 的状态

      // 一直迭代直至voronoi simulation 的状态为end
      while (simulateStatus.ended === false) {
        simulation.tick();
        simulateStatus = simulation.state();
      }

      // 迭代计算子层级
      simulateStatus.polygons.forEach((clipPolygonObj: any) => {
        recurse(clipPolygonObj, clipPolygonObj.site.originalObject.data.originalData);
      });
    }
  }

  return nestedVoronoiGenerator;
}
