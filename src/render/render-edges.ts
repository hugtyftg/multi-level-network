// 无tick动画

import { StyleCfg } from "../interface/style";

// 所有edge对应的el
const renderEdgesElWithoutTick = (allEdgesData: any, bottomEdgeCell: any, cfgs: StyleCfg) => {
  let edgeEl = bottomEdgeCell
    .selectAll('g.edge_group')
    .data(allEdgesData, (d: any) => d.index)
    .enter()
      .append('g')
      .attr('sourceGroupIndex', (d: any) => d.source.groupIndex)
      .attr('targetGroupIndex', (d: any) => d.target.groupIndex)
        .append('line')
        .attr('opacity', cfgs.edgeStyle.normal.opacity)
        .attr('stroke', cfgs.edgeStyle.normal.strokeColor)
        .attr('stroke-width', cfgs.edgeStyle.normal.strokeWidth)
        .attr('stroke-dasharray', cfgs.edgeStyle.normal.strokeDash)
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)
  return edgeEl;
}
export {
  renderEdgesElWithoutTick
}