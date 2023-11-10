import { group, groupData } from '../interface/partition';
import {select, selectAll} from "d3-selection";
import * as d3Scale from "d3-scale";
import * as d3Drag from "d3-drag";
import { hierarchy, polygonArea, forceSimulation, forceX, forceY, forceCollide, zoom, easePoly } from 'd3';
//因为layout、apps里面没写index，所以这里引入写法不太合规
import { nestedVoronoi } from '../layout/partition-layout/nestedVoronoi';
import { calculateShapeCanvas, formatPolygon, polygonIncircle,  centralizing, forceConstraintAccessor } from '../layout/partition-layout/utils';
import { renderEdgesElWithoutTick } from '../render/render-edges';
import { nodeLabelDisplayFn, renderNodesElWithoutTick } from '../render/render-nodes';
import BaseGraph from '.';
import { EdgeStyle, MaskStyle, NodeStyle, StyleCfg } from '../interface/style';
import renderVoronoiLabel from '../render/render-voronoi-labels';
import renderVoronoiPath from '../render/render-voronoi-path';
import { polygonForceConstraintAccessor } from '../layout/partition-layout/utils/polygonForceConstraint';
import {v4 as uuid} from 'uuid';
export default class MultiLevelPartitionGraph extends BaseGraph{
    // svg画布宽高
    protected _width: number = 0;
    protected _height: number = 0;
    // 传入的原始数据
    protected _data: groupData;
    // 计算权重后的层级化数据，每个pod下面还有对应的点的数据，后续会在此基础上分割多边形
    public weightedHierarchicalData: any;
    // 存储az pod层级化的信息，为绘制voronoi cell做准备
    private hierarchicalInfo: any;
    // 用于一个共有力模拟器的所有节点的坐标
    public allNodesData: any[] = [];
    // 每个group与其incircle的对应关系
    public groupIncircleMap: any = {};
    // 每个group与其polygon的对应关系
    public groupPolygonMap: any = {};
    constructor(props: StyleCfg) {
      super(props);
      // 参数初始化
      this.setCfgs(props);
      this._data = this.cfgs.data;
      this._width = this.cfgs.width;
      this._height = this.cfgs.height;
      this.run();
    }

    public run() {
      // 初始化画布
      this.initSvg()
      // 初始绑定画布事件
      this.beforeRenderBindEvent()
      // 载入数据，计算分割布局，绘制初始分割多边形
      this.loadDataAndDraw();
  
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
        .attr('id', 'graph-container')
    }
    // 渲染完多边形、点边之前绑定的事件画布的zoom事件
    protected beforeRenderBindEvent() {
      // zoom 解决pinning的抖动问题：zoom事件绑定在svg，transfrom绑定在svg下面的container
      const zoomObj = zoom()
        .translateExtent([[-this._width*4, -this._height*4], [this._width * 5, this._height * 5]])
        .scaleExtent([0.3, 5])
        .on('zoom', (event: any) => {
          this.container.attr("transform", event.transform);
          // console.log(event.transform.k);
          // TODO: 添加标签的自动隐藏和现实效果
        })
      this.svg.call(zoomObj)
      // 禁止双击自动放缩
      .on('dblclick.zoom', null)
    }
    // 渲染完多边形、点边之后绑定的事件
    protected afterRenderBindEvent() {
      // 点击节点的高亮事件
      this.nodesDOM.on('click', this.onClickNode.bind(this, this.allNodesData));
      // 点击画布的空白区域可以取消高亮效果
      select('g#voronoi-pod-cell').on('click', this.onClickCanvas.bind(this));
    }
    // 加载数据
    private async loadDataAndDraw() {
      // 获取层级化数据
      let hierarchicalData = this.gethierarchicalData();
      // 计算层级化数据的权重
      this.weightedHierarchicalData = hierarchy(hierarchicalData)
        // 均衡较小的权重、给强调中心化显示的区域增加权重
        .sum(d => d.hasOwnProperty('num') ? 
          (d.num < 3 || d.name === this.cfgs.emphasisName) ?
             d.num + 1: d.num : 0
        )
        // 按照权重从高到低排列
        .sort((a: any, b: any) => { return a - b});
      // 计算指定图形的画布顶点坐标
      let canvasPolygon: any = calculateShapeCanvas(0, 0, this._width, this._height, this.shape);
      console.time('canvas partition');
      // 根据指定图形的画布和层级化数据，得到若干层级化的多边形
      this.partition(canvasPolygon, this.weightedHierarchicalData);
      console.timeEnd('canvas partition');
      
      // 绘制画布
      this.drawShapeCanvas(canvasPolygon, [this._width / 2, this._height / 2]);
      // 绘制voronoi多边形
      this.drawVoronoiDomain(this.weightedHierarchicalData);
      // 绘制Group和GroupLink
      this.drawBottom(this.partitionLayoutCell, this.allNodesData, this.groupIncircleMap, this.groupPolygonMap);
    }
    // 取消高亮
    private cancelHighlight(){
      // 取消连边的高亮状态
      selectAll('#bottom-edge-cell line')
        .attr('opacity', this.cfgs.edgeStyle.normal.opacity as number)
        .attr('stroke', this.cfgs.edgeStyle.normal.strokeColor)
        .attr('stroke-width', this.cfgs.edgeStyle.normal.strokeWidth as number)
        .attr('stroke-dasharray', this.cfgs.edgeStyle.normal.strokeDash)
      // 取消节点的高亮状态
      selectAll('#bottom-node-cell circle.circle-background')
        .attr('opacity', this.cfgs.nodeStyle.normal.opacity as number)
        .attr('stroke', this.cfgs.nodeStyle.normal.stroke)
        .attr('stroke-width', this.cfgs.nodeStyle.normal.strokeWidth as number)
        .attr('fill', this.cfgs.nodeStyle.normal.fill)
      // 取消节点标签的高亮状态，回归正常的显示模式
      selectAll('#bottom-node-cell text')
        .attr('display', (d: any) => nodeLabelDisplayFn(d, this.cfgs as StyleCfg))
    }
    // highlightAttr是方便搜索ip的时候复用这个函数
    private highlightNodesEdges(d: any, clickedNodeGroupIndex: any, relatedNodeGourpIndexSet: any, highlightAttr?: {
      nodeStyle?: NodeStyle,
      edgeStyle?: EdgeStyle,
      maskStyle?: MaskStyle,
    }){
      // 当前连边是否和高亮节点相关
      const isRelateEdge = (d: any): boolean => 
        d['source']['groupIndex'] ===  clickedNodeGroupIndex || 
        d['target']['groupIndex'] ===  clickedNodeGroupIndex;
      // 当前节点是否和高亮节点相关
      const isRelateNode = (d: any): boolean => relatedNodeGourpIndexSet.has(d['groupIndex']);
      // 解构以便复用
      const {nodeStyle, edgeStyle} = this.cfgs; 
      // 高亮连边
      selectAll('#bottom-edge-cell line')
        .attr('opacity', (d: any) => {          
          if (isRelateEdge(d)) {
            // 如果当前连边和高亮节点有关，那么另一个节点一定是高亮节点的关联节点，都放在set里面，集合最终是高亮节点和所有的相关节点
            relatedNodeGourpIndexSet.add(d['source']['groupIndex']);
            relatedNodeGourpIndexSet.add(d['target']['groupIndex']);
            return highlightAttr?.edgeStyle?.opacity ?? edgeStyle.selected.opacity as number;
          } else {
            return edgeStyle.normal.opacity as number;
          }
        })
        .attr('stroke', (d: any) => isRelateEdge(d) ? 
          (highlightAttr?.edgeStyle?.strokeColor ?? edgeStyle.selected.strokeColor) : edgeStyle.normal.strokeColor
        )
        .attr('stroke-width', (d: any) => isRelateEdge(d) ? 
          (highlightAttr?.edgeStyle?.strokeWidth ?? edgeStyle.selected.strokeWidth as number) : edgeStyle.normal.strokeWidth as number
        )
        .attr('stroke-dasharray', (d: any) => isRelateEdge(d) ?
          (highlightAttr?.edgeStyle?.strokeDash ?? edgeStyle.selected.strokeDash) : edgeStyle.normal.strokeDash
        )
      // symbol node
      // selectAll('#bottom-node-cell path')

      // 高亮节点
      selectAll('#bottom-node-cell circle.circle-background')
      .attr('opacity', (d: any) => isRelateNode(d) ? 
        (highlightAttr?.nodeStyle?.opacity ?? nodeStyle.selected.opacity as number) : nodeStyle.normal.opacity as number
      )
      .attr('stroke-width', (d: any) => isRelateNode(d) ? 
        (highlightAttr?.nodeStyle?.strokeWidth ?? nodeStyle.selected.strokeWidth as number) : nodeStyle.normal.strokeWidth as number
      )
      .attr('stroke', (d: any) => isRelateNode(d) ? 
        (highlightAttr?.nodeStyle?.stroke ?? nodeStyle.selected.stroke) : nodeStyle.normal.stroke
      )
      .attr('fill', (d: any) => {
        if (isRelateNode(d)) {
          if (highlightAttr) {
            // 如果传入了自定义的高亮样式，那就以自定义样式为主，如果没有传入，就以初始传入的高亮样式为主
            return highlightAttr.nodeStyle?.fill;
          } else {
            return typeof nodeStyle.selected.fill === 'string' ? nodeStyle.selected.fill : nodeStyle.selected.fill(d);
          }
        } else {
          return typeof nodeStyle.normal.fill === 'string' ? nodeStyle.normal.fill : nodeStyle.normal.fill(d);
        }
      })

      // 显示节点的label
      // 高亮节点
      selectAll('#bottom-node-cell text')
      .attr('display',
        (d: any) => {
          if (this.cfgs.nodeLabelStyle.show === 'auto') {
            // 如果是auto show，那么告警节点的标签始终显示
            if (d.children[0].is_alarming === true) {
              return 'block';
            }
          }
          if (isRelateNode(d)) {
            return 'block';
          } else {
            return 'none';
          }
        })
    }
    // 显示voronoi mask和文字
    private highlightMask(relatedMask: string, highlightAttr?: {
      nodeStyle?: NodeStyle,
      edgeStyle?: EdgeStyle,
      maskStyle?: MaskStyle,
    }){
      this.container.selectAll(`path.pod[data-id=${relatedMask}]`)
        // 存在某些pod高亮改顺序之后，遮盖az的边界的问题
        // .raise()
        .attr('opacity', highlightAttr?.maskStyle?.opacity ?? this.cfgs.maskStyle.selected.opacity)
        .attr('fill', highlightAttr?.maskStyle?.color ?? this.cfgs.maskStyle.selected.color)
        .attr('stroke-width', highlightAttr?.maskStyle?.strokeWidth ?? this.cfgs.maskStyle.selected.strokeWidth)
        .attr('stroke', highlightAttr?.maskStyle?.strokeColor ?? this.cfgs.maskStyle.selected.strokeColor);
    }
    private resetMask(hierarchy: string) {
      selectAll(`path.${hierarchy}`)
        .attr('fill', this.cfgs.maskStyle.normal.color)
        .attr('opacity', this.cfgs.maskStyle.normal.opacity as number)
        .attr('stroke-width', this.cfgs.maskStyle.normal.strokeWidth as number)
        .attr('stroke', this.cfgs.maskStyle.normal.strokeColor);
    }
    // 点击节点，高亮/取消高亮节点、连边及其关联节点
    private onClickNode(allNodesData: any, event: Event | any, highLightedNodeDatum: any) {
      // 如果本次点击的节点和上一个节点相同，就取消高亮
      // if (this.clickedNodeGroupIndex === highLightedNodeDatum.groupIndex) {
      //   this.cancelHighlight();
      //   this.resetMask('pod');
      //   this.clickedNodeGroupIndex = -1;
      //   this.clickedNodeGroupDatum = null;     
      // } else {
        this.highlight(allNodesData, highLightedNodeDatum);
      // }
    }
    // 高亮节点、连边、关联节点和所在区域
    private highlight(allNodesData: any, highLightedNodeDatum: any,  highlightAttr?: {
      nodeStyle?: NodeStyle,
      edgeStyle?: EdgeStyle,
      maskStyle?: MaskStyle,
    }) {
      // 保存当前高亮的节点信息 
      this.clickedNodeGroupDatum = highLightedNodeDatum;
      this.clickedNodeGroupIndex = highLightedNodeDatum.groupIndex;
      let relatedNodeGourpIndexSet: Set<any> = new Set();
      relatedNodeGourpIndexSet.add(this.clickedNodeGroupIndex)
      // 将相关联的边及其节点高亮
      this.highlightNodesEdges(this.clickedNodeGroupDatum, this.clickedNodeGroupIndex, relatedNodeGourpIndexSet, highlightAttr);
      // 还原mask
      this.resetMask('pod');
      // 显示voronoi mask 和文字
      for (const relatedGroupIndex of relatedNodeGourpIndexSet) {
        // 关联到的点对象，里面有层级信息
        const relatedGroupDatum = allNodesData.find((item: any) => item.groupIndex === relatedGroupIndex);
        // 根据az名称和pod名称找到对应的pod id
        const relatedMask = relatedGroupDatum.level3Id;
        this.highlightMask(relatedMask, highlightAttr);
      }
    }
    // 当前有高亮节点的时候，点击画布可以取消高亮
    private onClickCanvas(event: Event) {
      event.stopPropagation();
      // 已经被点击过，点击画布取消高亮效果
      if (this.clickedNodeGroupIndex !== -1) {
        this.cancelHighlight();
        this.resetMask('pod');
        this.clickedNodeGroupIndex = -1;
        this.clickedNodeGroupDatum = null;
      }
    }
  
    // 未化简的详细数据的层级化
    private gethierarchicalData(): any {
      const { groupList: nodes} = this._data;
      // 确定层级关系
      let result:any = {
        "hierarchy": "region",
        'id': 'm' + uuid(),
        "children": []
      }
      let curAz: any,
        curAzName: string,
        curAzNameIndex: number,
        curPod: any,
        curPodName: string | undefined,
        curPodNameIndex: number,
        curGroup: group
      
      // 添加Group
      for (let i = 0; i < nodes.length; i++) {
        curGroup = nodes[i];
        curAzName = curGroup['children'][0]['az'] ?? 'other';
        curPodName = curGroup['children'][0]['pod_name'] as string;
  
        // 1.检查当前result里面是否已经有当前az
        curAzNameIndex = result['children'].findIndex((az: any) => az.name === curAzName);
        // 如果没有则添加该az和空数组，否则在这一层什么也不做
        if (curAzNameIndex === -1) {
          result['children'].push({
            "name": curAzName,
            "hierarchy": "az",
            'id': 'm' + uuid(),
            "children": [],
          });
        }
        // 2.检查当前az里面是否已经有当前pod
        curAzNameIndex = curAzNameIndex === -1 ? result['children'].length - 1 : curAzNameIndex;
        curAz = result['children'][curAzNameIndex]
        curPodNameIndex = curAz['children'].findIndex((pod: any) => pod.name === curPodName);
        // 如果没有则添加该pod和空数组，否则在这一层什么也不做
        if (curPodNameIndex === -1) {
          curAz['children'].push({
            "name": curPodName,
            "hierarchy": "pod",
            'id': 'm' + uuid(),
            "num": 0,
            "nodes": [], // 记录当前pod里面所有group
            "edges": [], // 记录当前pod里面所有group的group link
          })
        }        
        // 3.添加Group
        curPodNameIndex = curPodNameIndex === -1 ? curAz['children'].length - 1 : curPodNameIndex;
        curPod = curAz['children'][curPodNameIndex];
        curPod['num'] += 1;
        curPod['nodes'].push({
          ...curGroup,
          'az': curAzName,
          'pod': curPodName
        });
      }
      return result;
    }
    private drawVoronoiDomain(weightedHierarchicalData: any) {
      // simulator所用到的所有nodes，最重要的是它们的group和对应的maxIncircle
      // 统计所有层级的pod的最大和最小节点数
      let [min, max] = this.calHierarchicalInfo(weightedHierarchicalData);
      // 根据节点数确定字号大小，以便渲染后续pod标签
      let fontScale = this.configFontsize(min, max);
      // 渲染层级化voronoi多边形
      this.voronoiPathCell = renderVoronoiPath(this.partitionLayoutCell, this.cfgs, this.hierarchicalInfo);
    /* ------------------------ 错峰渲染多边形和标签，用视觉效果优化减缓布局速度的影响 ----------------------- */
      this.staggerRenderVoronoiLabel(fontScale, 400);
    /* ------------------------ 错峰渲染多边形和标签，用视觉效果优化减缓布局速度的影响 ----------------------- */
    }
    private drawShapeCanvas(canvasPolygon: number[][], nestedVoronoiCenter: number[]) {
      // 绘制容器
      this.partitionLayoutCell = this.container.append('g')
        .attr('id', "nested-voronoi-container")
        .attr('transform', `translate(${nestedVoronoiCenter})`);
      // 绘制矩形region框
      this.partitionLayoutCell.append("path")
      .attr("id", "region")
      .attr("transform", `translate(${[-this._width / 2, -this._height / 2]})`)
      .attr("d", "M" + canvasPolygon.join("L") + "Z")
      .attr('fill', '#fff');
    }
    private partition(canvasPolygon: number[][], weightedHierarchicalData: any) {
      /* ------------------消除随机性的分割----------------- */           
      // 传入每个数据集的唯一标识
      let dataIdentifier = 0;
      
      for (let i = 0; i < this.cfgs.dataName.length; i++) {
        dataIdentifier += this.cfgs.dataName.charCodeAt(i);
      }
      let canvasSpliter = nestedVoronoi(dataIdentifier).clip(canvasPolygon);
      canvasSpliter(weightedHierarchicalData);
      /* ------------------消除随机性的分割----------------- */     
      /* ------------------cnt中心化----------------- */      
      for (let i = 0; i < weightedHierarchicalData.children.length; i++) {
        centralizing(weightedHierarchicalData.children[i], 'name', this.cfgs.emphasisName)        
      }
       /* ------------------cnt中心化----------------- */
    }

    // 存储每一级的区域信息
    private saveRegionInfo(weightedHierarchicalData: any, min: any, max: any, allNodesData: any, groupIncircleMap: any, groupPolygonMap: any) {
      if(weightedHierarchicalData.children[0].data.hierarchy === 'pod'){
        // AZ层
        weightedHierarchicalData.children.forEach((d: any) => {
          // pod层
          if (d.value < min) {
            min = d.value;
          }
          if (d.value > max) {
            max = d.value
          }

          // 删除多余不需要的site信息
          d.siteX = d.polygon.site.x;
          d.siteY = d.polygon.site.y;
          d.site = d.polygon.site;
          delete d.polygon.site;
          // 将polygon数组变为标准化的逆时针数组
          formatPolygon(d.polygon);
          // 保存最大内切圆信息
          d['maxIncircle'] = polygonIncircle(d.polygon);
          d['area'] = -Number(polygonArea(d.polygon));
          let azPodName: string = `${d.data.name}${d.height === 0 ? '-' + d.parent.data.name : ''}`;
          d['azPodName'] = azPodName;
          groupIncircleMap[azPodName] = d.maxIncircle;
          /* ---------------------问题：多边形区域限制--------------------- */
          groupPolygonMap[azPodName] = d.polygon;
          /* ---------------------问题：多边形区域限制--------------------- */
          // 遍历pod内所有节点，将它们添加上group、maxIncircle、polygon的信息后存储在allNodesData中
          d.data.nodes.forEach((node: any) => {
            node.group = azPodName;
            // 给每个节点上绑定对应的pod的id
            node.level3Id = d.data.id;
            node.maxIncircle = d.maxIncircle;
            /* ---------------------问题：多边形区域限制--------------------- */
            node.polygon = d.polygon;
            node.siteX = d.siteX;
            node.siteY = d.siteY;
            /* ---------------------问题：多边形区域限制--------------------- */
            allNodesData.push(node);
          });
          this.hierarchicalInfo.push(d);
        })
      }else{
        // Region层
        weightedHierarchicalData.children.forEach((d: any) => {
          // 删除多余不需要的site信息
          d.siteX = d.polygon.site.x;
          d.siteY = d.polygon.site.y;
          d.site = d.polygon.site;
          delete d.polygon.site;
          // 将polygon数组变为标准化的逆时针数组
          formatPolygon(d.polygon)
          // 保存最大内切圆信息
          d['maxIncircle'] = polygonIncircle(d.polygon);
          d['area'] = -Number(polygonArea(d.polygon));
          this.hierarchicalInfo.push(d);
  
          [min, max] = this.saveRegionInfo(d, min, max, allNodesData, groupIncircleMap, groupPolygonMap);
        })
      }     
      return [min, max];
    }

    private calHierarchicalInfo(weightedHierarchicalData: any): number[] {
      // 绘制分割区域
      let min = Infinity; // 记录最少的设备数目
      let max = 0; // 记录最多的设备数目

      // 存储每个AZ、POD的区域信息
      this.hierarchicalInfo = [];

      [min, max] = this.saveRegionInfo(weightedHierarchicalData, min, max, this.allNodesData,this.groupIncircleMap, this.groupPolygonMap);
      return [min, max];
    }
    // 多边形标签的字体大小映射
    private configFontsize(min: number, max: number):any {
      let fontScale = d3Scale.scaleLinear()
        .domain([min, max])
        .range([12, 60])
        .clamp(true);
      return fontScale;
    }
    /* ------------------------ 错峰渲染多边形和标签，用视觉效果优化减缓布局速度的影响 ----------------------- */
    // 错峰显示标签
    private staggerRenderVoronoiLabel(fontScale: any, delayTime: number) {
      // 渲染voronoi多边形的标签【优化视觉效果，延迟显示】
      this.voronoiLabelCell = renderVoronoiLabel(fontScale, this.partitionLayoutCell, this.cfgs, this.hierarchicalInfo);
      setTimeout(() => {
        this.voronoiLabelCell
        .transition()
        .duration(50)
        .ease(easePoly)
          .attr('opacity', (d: any) => {
            if (d.data.hierarchy === 'az') {
              return 0.5
            } else {
              return 1
            }
          })
      }, delayTime);
    }
    /* ------------------------ 错峰渲染多边形和标签，用视觉效果优化减缓布局速度的影响 ----------------------- */
  /**
   * 绘制多边形画布内的具体设备节点连边
   * @param container 多边形画布的selection
   * @param allData az pod层级化数据铺平得到的信息，包含各自的具体设备
   */
  private drawBottom(container: any, allNodesData: any, groupIncircleMap: any, groupPolygonMap: any) {
    this.prepareBottomContainer(container);
    this.calNodesCoordinates(allNodesData, groupIncircleMap, groupPolygonMap);
  }
  private prepareBottomContainer(container: any) {
    this.bottomCells = container.append('g')
    .attr('id',"bottom-cells")
    .attr("transform", `translate(${[-this._width / 2, -this._height / 2]})`);
    // 底层的nodes和edges容器cell
    this.bottomEdgeCell = this.bottomCells.append('g').attr('id', 'bottom-edge-cell');
    this.bottomNodeCell = this.bottomCells.append('g').attr('id', 'bottom-node-cell');
  }
  private calNodesCoordinates(allNodesData: any, groupIncircleMap: any, groupPolygonMap: any) {
    this.partitionForceLayout(allNodesData, groupIncircleMap, groupPolygonMap);
  }
  private partitionForceLayout(allNodesData: any, groupIncircleMap: any, groupPolygonMap: any) {
    const basePadding = 3;
    // 每个group对应的ticker
    let groupTickerMap: any = {};
    Object.keys(groupIncircleMap).forEach((key: string) => {
      groupTickerMap[key] = forceConstraintAccessor(
        groupIncircleMap[key][0],
        groupIncircleMap[key][1],
        groupIncircleMap[key][2],
        basePadding
      )
    })
    /* ---------------------问题：多边形区域限制--------------------- */
    // 每个group对应的polygon ticker
    let groupPolygonTickerMap: any = {};
    Object.keys(groupPolygonMap).forEach((key: string) => {
      groupPolygonTickerMap[key] = polygonForceConstraintAccessor(
        groupPolygonMap[key],
        basePadding
      )
    })
    /* ---------------------问题：多边形区域限制--------------------- */

    // 给node对应的group绑定的拖拽方法
    const drag = () => {
      // 通过closure优化，避免在drag过程中一直select
      let dragNodeEl: any = null,
        asSourceEdgeEl: any = null,
        asTargetEdgeEl: any = null;
      const dragstarted = (event: any, nodeDatum: any) => {
        dragNodeEl = select(`g[groupIndex="${nodeDatum.groupIndex}"]`);
        asSourceEdgeEl = selectAll(`g[sourceGroupIndex="${nodeDatum.groupIndex}"] line`);
        asTargetEdgeEl = selectAll(`g[targetGroupIndex="${nodeDatum.groupIndex}"] line`);
      };
      const dragged = (event: any, nodeDatum: any) => {
        // 最大内切圆限制
        // let constraintX = groupTickerMap[nodeDatum.group](5, 1, event.y, event.x, 'x');
        // let constraintY = groupTickerMap[nodeDatum.group](5, 1, event.x, event.y, 'y');
        /* ---------------------问题：多边形区域限制--------------------- */
        let constraintX = groupPolygonTickerMap[nodeDatum.group](5, 1, event.y, event.x, 'x');
        let constraintY = groupPolygonTickerMap[nodeDatum.group](5, 1, event.x, event.y, 'y');
        /* ---------------------问题：多边形区域限制--------------------- */
        if (!isNaN(constraintX)) {
          nodeDatum.x = constraintX;
        }
        if (!isNaN(constraintY)) {
          nodeDatum.y = constraintY;
        }
        // drag的时候改变节点group的位置
        dragNodeEl
          .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`)
        // drag的时候改变以该节点为source或者target的连边的位置
        asSourceEdgeEl
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y);
        asTargetEdgeEl
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);
      }
      const dragended = () => {
        dragNodeEl = null;
        asSourceEdgeEl = null;
        asTargetEdgeEl = null;
      };
      return d3Drag.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    // tick的过程中用force Constraint修改节点的xy坐标
    const onTick = () => {
      allNodesData.forEach((d: any) => {
        // 最大内切圆限制
        // let constraintX = groupTickerMap[d.group](5, 1, d.y, d.x, 'x');
        // let constraintY = groupTickerMap[d.group](5, 1, d.x, d.y, 'y');
        
        /* ---------------------问题：多边形区域限制--------------------- */
        let constraintX = groupPolygonTickerMap[d.group](5, 1, d.y, d.x, 'x');
        let constraintY = groupPolygonTickerMap[d.group](5, 1, d.x, d.y, 'y');
        /* ---------------------问题：多边形区域限制--------------------- */

        if (!isNaN(constraintX)) {
          d.x = constraintX;
        }
        if (!isNaN(constraintY)) {
          d.y = constraintY;
        }
      });
    }
    // 根据计算完毕的node坐标和原始的edge坐标，得到每条边最终的端点坐标，以便绘制连边
    const getEdgesData = (allNodesData: any, originEdgesData: any) => {
      let allEdgesData: any = [];
      for (let i = 0; i < originEdgesData.length; i++) {
        let originEdge = originEdgesData[i];
        let originEdgeSourceGroupIndex = originEdge.source;
        let originEdgeTargetGroupIndex = originEdge.target;
        let source = allNodesData.find((d: any) => d.groupIndex === originEdgeSourceGroupIndex);
        let target = allNodesData.find((d: any) => d.groupIndex === originEdgeTargetGroupIndex);
        allEdgesData.push({
          source,
          target
        })
      }
      return allEdgesData;
    }
    // tickend的时候更新连边位置，渲染点边，绑定事件
    const onTickEnd = () => {
      console.timeEnd('force without tick');
      let allEdgesData = getEdgesData(allNodesData, this._data.groupLinks);
      // 渲染点边
      this.edgesDOM = renderEdgesElWithoutTick(allEdgesData, this.bottomEdgeCell, this.cfgs);
      this.nodesDOM = renderNodesElWithoutTick(allNodesData, this.container, this.bottomNodeCell, drag, this.cfgs);
      // 渲染后绑定点的高亮事件和画布的取消高亮事件
      this.afterRenderBindEvent();
    }
    const positionStrength = 1;
    console.time('force without tick');
    let simulation = forceSimulation(allNodesData)
      // 删除弹簧作用力
      // .force('x', forceX().x((d: any) => d.maxIncircle[0]).strength(positionStrength))
      // .force('y', forceY().y((d: any) => d.maxIncircle[1]).strength(positionStrength))
      /* ---------------------问题：多边形区域限制--------------------- */
      .force('x', forceX().x((d: any) => d.siteX).strength(positionStrength))
      .force('y', forceY().y((d: any) => d.siteY).strength(positionStrength))
      /* ---------------------问题：多边形区域限制--------------------- */
      // 将radius调成很大的数值，可以得到四散的平铺效果（没有清晰的边界和聚类的感觉）
      .force('collide', forceCollide().radius(this.cfgs.blankFillDegree).strength(this.cfgs.blankFillStrength))
      .alphaDecay(0.15);
    simulation.on('tick', onTick);
    simulation.on('end', onTickEnd);
  }
  /**
   * 传入az和pod名查找多边形区域并高亮。高亮分区包括：高亮多边形、高亮多边形内的所有节点、高亮这些节点之间存在的同pod连边
   * @param {string} level2Name az名
   * @param {string} level3Name pod名
   * @param {boolean} isHighlightNodes 是否高亮多边形内部节点
   * @param {boolean} isHighlightEdges 是否高亮多边形内部连边（非跨层级）
   * @param { nodeStyle?: NodeStyle, edgeStyle?: EdgeStyle, maskStyle?: MaskStyle} highlightAttr 用户自定义传入的搜索高亮样式
   * @returns {boolean} 如果找到，返回true；如果没找到返回false
   */
  public searchPartition(level2Name: string, level3Name: string, isHighlightNodes: boolean, isHighlightEdges: boolean, highlightAttr?: {
    nodeStyle?: NodeStyle,
    edgeStyle?: EdgeStyle,
    maskStyle?: MaskStyle,
  }): boolean {
    // 1.根据az名称和pod名称找到对应的pod，在dii中，第二个判断条件应该是item.parentName === level2Name，因为已经删除了对parent的circular reference）
    const searchedPartition = this.hierarchicalInfo.find((item: any) => item.data.name === level3Name && item.parent.data.name === level2Name)
    // 如果没有找到分区，说明图中不存在这个分区，返回false
    if (searchedPartition === undefined) {
      return false;
    }
    // 分区的id（gethierarchicalData中通过uuid生成的）
    const searchedPartitionId = searchedPartition.data.id;
    // 2.高亮分区，如果用户传入了新的样式，就用新的样式高亮分区；如果没传入，就用初始传入的selected样式高亮分区
    this.container.selectAll(`path.pod[data-id=${searchedPartitionId}]`)
      // .raise()
      .attr('opacity', highlightAttr?.maskStyle?.opacity ?? this.cfgs.maskStyle.selected.opacity) // this.cfgs.maskStyle.selected.opacity和dii中的d.attr.selected.opacity是一样的逻辑，全局样式参数
      .attr('fill', highlightAttr?.maskStyle?.color ?? this.cfgs.maskStyle.selected.color)
      .attr('stroke-width', highlightAttr?.maskStyle?.strokeWidth ?? this.cfgs.maskStyle.selected.strokeWidth)
      .attr('stroke', highlightAttr?.maskStyle?.strokeColor ?? this.cfgs.maskStyle.selected.strokeColor);
    // 内部节点的groupIndex（dii中已经将其处理成id string了，所以应该改成string[]）
    const innerGroupIndexList: number[] = [];
    // 3.高亮内部节点（仅当用户传入的flag为true且nodes已经在tickend时绘制完毕之后）
    if (isHighlightNodes) {
      if (this.nodesDOM) {
        // 过滤得到所有在这个pod下的node selection
        const innerNodesSelection = this.nodesDOM.filter((node: any) => {
          // 利用&&运算的特性和push有返回值（数组新长度）的特性，将这个分区内的所有node的groupIndex放入innerGroupIndexList，方便后面查找需要高亮的内部连边
          return node.level3Id === searchedPartitionId && innerGroupIndexList.push(node.groupIndex)
        });
        // 更新selection的样式——节点的背景（circle-background是仿照dii写的）
        innerNodesSelection.selectAll('circle.circle-background')
          .attr('opacity', highlightAttr?.nodeStyle?.opacity ?? this.cfgs.nodeStyle.selected.opacity)
          .attr('stroke-width', highlightAttr?.nodeStyle?.strokeWidth ?? this.cfgs.nodeStyle.selected.strokeWidth)
          .attr('stroke', highlightAttr?.nodeStyle?.stroke ?? this.cfgs.nodeStyle.selected.stroke)
          // 判断用户是否传入新的样式fill，如果没有传入，就用默认的样式，并且默认的fill可能是string，也可能是function
          .attr('fill', (d: any) => highlightAttr?.nodeStyle?.fill ??
            // 这里是判断初始传入的配置项是函数还是字符串
            (typeof this.cfgs.nodeStyle.normal.fill === 'string' ? 
            this.cfgs.nodeStyle.normal.fill : this.cfgs.nodeStyle.normal.fill(d)))
        // 将全局的this.clickedNodeGroupIndex设置为非-1的数字，这样一来，点击画布可以自动触发取消高亮效果，dii可以决定是否需要这个功能
        this.clickedNodeGroupIndex = 0;
      } else {
        console.error('请在节点渲染完毕之后再使用搜索分区的功能');
        return false;
      }
    } 
    // 4.高亮内部节点之间存在的连边（仅当用户传入的flag为true且edges已经在tickend绘制完毕之后）
    if (isHighlightEdges) {
      if (this.edgesDOM) {
        // 过滤得到所有在这个pod内的连边，通过判断每条边的source和target的groupIndex来确定。
        // 注意：（这里的source和target被d3替换成了节点对象，在dii中是sourceNode和targetNode）
        const innerEdgesSelection = this.edgesDOM
        .filter((edge: any) => {
          return (innerGroupIndexList.findIndex((groupIndex: number) => groupIndex === edge.source.groupIndex) !== -1)
          && (innerGroupIndexList.findIndex((groupIndex: number) => groupIndex === edge.target.groupIndex) !== -1)
        })
        // 更新selection的样式——连边
        // 注意：（这里的innerEdgesSelection是每个具体的line所以直接修改的样式，dii要注意将其换成内部的edgeEl）
        innerEdgesSelection
          .attr('opacity', highlightAttr?.edgeStyle?.opacity ?? this.cfgs.edgeStyle.selected.opacity)
          .attr('stroke-width', highlightAttr?.edgeStyle?.strokeWidth ?? this.cfgs.edgeStyle.selected.strokeWidth)
          .attr('stroke', highlightAttr?.edgeStyle?.strokeColor ?? this.cfgs.edgeStyle.selected.strokeColor)
          .attr('stroke-dasharray', highlightAttr?.edgeStyle?.strokeDash ?? this.cfgs.edgeStyle.selected.strokeDash);
      } else {
        console.error('请在连边渲染完毕之后再使用搜索分区的功能');
        return false;
      }
    }
    return true;
  }
  /**
   * 搜索高亮指定ip的节点、连边、关联关系和所在多边形
   * @param ip 查找的设备的ip
   * @param { nodeStyle?: NodeStyle, edgeStyle?: EdgeStyle, maskStyle?: MaskStyle} highlightAttr 用户自定义传入的搜索高亮样式
   * @returns {boolean} 若查找到该ip对应节点返回true；若没有查找到，返回false
   */
  public searchIp(ip: string,  highlightAttr?: {
    nodeStyle?: NodeStyle,
    edgeStyle?: EdgeStyle,
    maskStyle?: MaskStyle,
  }): boolean {
    // 只有在nodes渲染完毕之后才能查找
    if (this.nodesDOM && this.edgesDOM && this.voronoiPathCell) {
      // 查找这个ip对应的node的数据，满足两个条件：不是超点，并且ip符合
      const searchedNodeDatum = this.allNodesData.find((node: any) => !node.isHyperNode && node.children[0].mgmt_ip === ip);
      // 如果没有找到，说明这个ip可能不存在，或者已经被聚合了，返回false
      if (searchedNodeDatum === undefined) {
        return false;
      }
      // 找到了该节点，并且此时nodes、edges和多边形masks都渲染完毕，可以高亮样式
      this.highlight(this.allNodesData, searchedNodeDatum, highlightAttr);
      return true;
    } else {
      // 说明nodes、edgesDOM或多边形还没有绘制完毕，这个方法必须在tickend后执行！
      return false;
    }
  }
  // 高亮节点的新函数和现在点击高亮的效果差不多。如果用户传入了新的样式obj，则按照那个样式obj；如果没有传入，就按照当前的点击高亮效果。
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
    this.nodesDOM.on('click', null);
    this.edgesDOM.on('click', null);
  }
}