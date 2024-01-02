import { StyleCfg } from "@/interface/style";
import BaseGraph from ".";
import { forceCenter, forceLink, forceManyBody, forceSimulation, select, zoom, zoomIdentity } from "d3";
import { deviceNode, group, originLink } from "@/interface/partition";

export default class ForceGraph extends BaseGraph {
  // svg画布宽高
  protected _width: number = 0;
  protected _height: number = 0;
  // 当前展示的group
  protected _data: group;
  // 原始脱敏数据的ip连边信息
  protected _originIpLinks: Array<originLink>;
  constructor(props: StyleCfg) {
    super(props);
    this._width = this.cfgs.width;
    this._height = this.cfgs.height;
    this._data = this.cfgs.data;
    this._originIpLinks = this.cfgs.originIpLinks as Array<originLink>;
    this.run();
  }
  public run(): void {
    this.initSvg();
    // 初始绑定画布事件
    this.beforeRenderBindEvent();
    // 计算布局并且绘制
    this.calculateAndDraw();
  }
  // 初始化画布
  protected initSvg() {
    // 画布容器div
    this.divBox = select(this.cfgs.divBoxSelector);
    // svg画布
    this.svg = this.divBox.append('svg')
      .attr('id', 'graph-svg')
      .attr('width', this._width)
      .attr('height', this._height);
    // 画布分割的graph g元素
    this.container = this.svg.append('g')
      .attr('id', 'graph-container');
    this.bottomCells = this.container.append('g')
    .attr('id',"bottom-cells")
    .attr("transform", `translate(${[-this._width / 2, -this._height / 2]})`);
    // 底层的nodes和edges容器cell
    this.bottomEdgeCell = this.bottomCells.append('g').attr('id', 'bottom-edge-cell');
    this.bottomNodeCell = this.bottomCells.append('g').attr('id', 'bottom-node-cell');
  }
  // 渲染点边之前绑定的事件
  protected beforeRenderBindEvent() {
    // zoom 解决pinning的抖动问题：zoom事件绑定在svg，transfrom绑定在svg下面的container
    const zoomObj = zoom()
      .translateExtent([[-this._width*4, -this._height*4], [this._width * 5, this._height * 5]])
      .scaleExtent([0.3, 5])
      .on('zoom', (event: any) => {
        this.container.attr("transform", event.transform);
      })
    this.svg
      .call(zoomObj)
      // 指定初始缩放状态，注意，scale是按照面积放缩的，需要开根号
      .call(zoomObj.transform, 
        zoomIdentity
        .scale(0.99)
        .translate(this._width * (1-Math.sqrt(0.99)), this._height * (1-Math.sqrt(0.99)))
      )
      // 禁止双击自动放缩
      .on('dblclick.zoom', null)
  }
  // 计算布局并绘制力导引图
  protected calculateAndDraw() {
    const nodes = this._data.children;
    const isIpInGroup = (ip: string, nodeInGroup: deviceNode[]): boolean => {
      return nodeInGroup.findIndex((node: deviceNode) => {
        return node.mgmt_ip === ip;
      }) === -1 ? false : true;
    }
    const links = this._originIpLinks.filter((originIpLink: originLink) => {
      let sourceIp: string = originIpLink.src_ip;
      let targetIp: string = originIpLink.dst_ip;
      let isSourceInGroup: boolean = isIpInGroup(sourceIp, nodes);
      let isTargetInGroup: boolean = isIpInGroup(targetIp, nodes);
      // 只有起始端点都属于这个group的连边才满足要求
      if (isSourceInGroup && isTargetInGroup) {
        return true;
      } else {
        return false;
      }
    }).map((originIpLinnk: originLink) => ({
      source: originIpLinnk.src_ip,
      target: originIpLinnk.dst_ip
    }))
    this.nodesDOM = this.bottomNodeCell
      .append('g')
      .attr('class', 'nodesDOM')
      .selectAll('g.node')
      .data(nodes)
        .join('g')
        .attr('class', 'node');
    this.nodesDOM
      .append('circle')
      .attr('radius', 5)
      .attr('fill', 'blue');
    this.edgesDOM = this.bottomEdgeCell
      .append('g')
      .attr('class', 'edgesDOM')
      .selectAll('g.link')
      .data(links)
        .join('g')
        .attr('class', 'link')
          .append('line')
          .attr('stroke', 'black');
    const ticked = () => {
      this.edgesDOM
      .attr("x1", (d: any) => d.source.x)
      .attr("y1", (d: any) => d.source.y)
      .attr("x2", (d: any) => d.target.x)
      .attr("y2", (d: any) => d.target.y);
      this.nodesDOM
        .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`)
    }
    const simulation = forceSimulation(nodes)
    .force('link', forceLink(links).id((node: any) => node.mgmt_ip))
    .force('charge', forceManyBody())
    .force('center', forceCenter(this._width / 2, this._height / 2))
    .on('tick', ticked);


    
  }
  // 销毁，清除指定svg的所有内容 #graph-svg，解除事件绑定
  public destory() {
    if (this.svg && !this.svg.empty()) {
      this.removeGraphEventListener();
      this.removeNodesEdgesEventListener();
      this.svg.remove();
    }
  }
  // 撤销绘制点边或清除画布时，去除对应的事件监听器
  private removeGraphEventListener() {
    this.svg.on('zoom', null)
    .on('dblclick.zoom', null);
  }
  private removeNodesEdgesEventListener() {
    // 如果销毁的时候，nodes和edges还没有render完毕，那么就不予处理
    if (this.nodesDOM) {
      this.nodesDOM.on('click', null);
      this.nodesDOM.on('dblclick', null);   
    }
    if (this.edgesDOM) {
      this.edgesDOM.on('click', null);
    }
  }
}