import { arc, easePoly, pie, scaleOrdinal, schemeDark2, select } from "d3";
import BaseGraph from ".";
import { group, groupData } from "../interface/partition";
import { StyleCfg } from "../interface/style";

class RoleDistributionGraph extends BaseGraph {
  // svg画布宽高
  protected _width: number = 0;
  protected _height: number = 0;
  // 传入的原始数据
  protected _data: groupData;
  // 统计数据
  protected statistics: any = {};
  // 原始的groups
  protected groupList: group[];
  constructor(props: StyleCfg) {
    super(props);
    this.setCfgs(props);
    this._data = this.cfgs.data;
    this.groupList = this._data.groupList;
    this._width = this.cfgs.width;
    this._height = this.cfgs.height;
    this.run();
  }
  // 运行
  protected run() {
    this.initSvg();
    this.statistics = this.calStatistics();
    this.drawDonut();
  }
  // 初始化画布
  protected initSvg() {
    // 画布容器div
    this.divBox = select(this.cfgs.divBoxSelector);
    // svg画布
    this.svg = this.divBox.append('svg')
      .attr('id', 'graph-svg')
      .attr('width', this._width)
      .attr('height', this._height)

    // 画布分割的graph g元素
    this.container = this.svg.append('g')
      .attr('id', 'graph-container')
      .attr("transform", `translate(${this._width/2},${this._height/2})`);
  }
  private calStatistics(): any {
    let statistics: any = {};
    for (let i = 0;  i < this.groupList.length;  i++) {
      const curGroup: group = this.groupList[i];
      const curType: string = curGroup.isHyperNode ? 'hyper' : String(curGroup.children[0].role);
      if (Object.hasOwn(statistics, curType)) {
        statistics[curType] ++;
      } else {
        statistics[curType] = 0;
      }
    }
    return statistics;
  }
  private drawDonut() {
// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
const radius = Math.min(this._width, this._height) / 2 - 25;

// set the color scale
const color = scaleOrdinal()
  .domain(Object.keys(this.statistics))
  .range(schemeDark2);

// Compute the position of each group on the pie:
const peiGenerator = pie()
  .sort(null) // Do not sort group by size
  .value((d: any) => d[1])
const data_ready = peiGenerator(Object.entries(this.statistics) as any)

// The arc generator
const arcGenerator = arc()
  .innerRadius(radius * 0.5)         // This is the size of the donut hole
  .outerRadius(radius * 0.8)

// Another arc that won't be drawn. Just for labels positioning
const outerArcGenerator = arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
this.container
  .selectAll('allSlices')
  .data(data_ready)
  .join('path')
  .attr('d', arcGenerator)
  .attr('fill', (d: any) => color(d.data[1]))
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)

// Add the polylines between chart and labels:
this.container
  .selectAll('allPolylines')
  .data(data_ready)
  .join('polyline')
    .attr("stroke", "black")
    .style("fill", "none")
    .attr("stroke-width", 1)
    .attr('points', function(d: any) {
      const posA = arcGenerator.centroid(d) // line insertion in the slice
      const posB = outerArcGenerator.centroid(d) // line break: we use the other arc generator that has been built only for that
      const posC = outerArcGenerator.centroid(d); // Label position = almost the same as posB
      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
      posC[0] = radius * (midangle < (Math.PI) || midangle > (2 * Math.PI - 0.1)  ? 1 : -1);
      return [posA, posB, posC]
    })

// Add the polylines between chart and labels:
this.container
  .selectAll('allLabels')
  .data(data_ready)
  .join('text')
    .text((d: any) => d.data[0])
    // .transition()
    // .duration(500)
    .attr('transform', function(d: any, i: number) {
        const pos = outerArcGenerator.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * (midangle < (Math.PI) || midangle > (2 * Math.PI - 0.1)  ? 1 : -1);
        return `translate(${pos})`;
    })
    .attr('text-anchor', function(d: any) {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < (Math.PI) || midangle > (2 * Math.PI - 0.1) ? 'start' : 'end')
    })
    .attr('font-size', 11)
    .attr('font-weight', 800)
  }
  // 销毁
  public destory() {
    if (this.svg && !this.svg.empty()) {
      this.svg.remove();
    }
  }
}
export default RoleDistributionGraph;