import { DEFAULT_STYLE_CFG } from '@/config/DEFAULT';
import { StyleCfg } from '@/interface/style';
class BaseGraph {
  // 图的相关样式参数配置
  protected cfgs: StyleCfg = DEFAULT_STYLE_CFG;
  /* -----------------------------外层画布--------------------------- */
  // 画布形状
  public shape = 'rectangle';
  /* -----------------------------外层画布--------------------------- */
  /* -----------------------------渲染相关cell--------------------------- */
  // 最外层的div box
  protected divBox: any;
  // 整个图的svg画布
  protected svg: any;
  // 整个g容器
  protected container: any;
  // 整个partition Layout的cell
  public partitionLayoutCell: any;
  // 多边形的cell
  public voronoiPathCell: any;
  // 多边形标签的cell（错峰渲染多边形和标签，用视觉效果优化减缓布局速度的影响）
  public voronoiLabelCell: any;
  // 最底层的cell
  public bottomCells: any;
  // 节点和连边的Cell
  public bottomNodeCell: any;
  public bottomEdgeCell: any;
  // 节点和连边的DOM
  public nodesDOM: any;
  public edgesDOM: any;
  /* -----------------------------渲染相关cell--------------------------- */
  /* -----------------------------点击高亮--------------------------- */
  public clickedNodeGroupDatum: any;
  public clickedNodeGroupIndex: number = -1;
  constructor(props: StyleCfg) {
    this.setCfgs(props);
  }
  // 运行
  protected run() {}
  // 初始化参数
  protected setCfgs(props: StyleCfg) {
    Object.assign(this.cfgs, props);
  }
  // 初始化画布
  protected initSvg() {}

  // 销毁
  public destory() {}
}
export default BaseGraph;
