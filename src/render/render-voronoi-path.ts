import { StyleCfg } from "../interface/style";

const renderVoronoiPath = (container: any, cfgs: StyleCfg, hierarchicalInfo: any) => {
  // 绘制voronoi cell
  const voronoiPathCell = container.append('g')
    .attr('id', 'voronoi-pod-cell')
    .attr("transform", `translate(${[-cfgs.width / 2, -cfgs.height / 2]})`)
    .selectAll("path")
    .data(hierarchicalInfo)
    .enter();
  voronoiPathCell.append('path')
    .attr('class', (d: any) => d.data.hierarchy)
    .attr('name', (d: any) => {
      if (d.data.hierarchy === 'az') {
        return d.data.name;
      } else if (d.data.hierarchy === 'pod') {
        return d.parent.data.name;
      }
    })
    .attr('id', (d: any) => {
      if (d.data.hierarchy === 'pod') {
        return d.data.name;
      }
    })
    .attr('d', (d: any) => {
      return 'M' + d.polygon.join('L') + 'Z';
    })
    .attr('fill', cfgs.maskStyle.normal.color)
    .attr('opacity', cfgs.maskStyle.normal.opacity)
    .attr('stroke', cfgs.maskStyle.normal.strokeColor)
    .attr('stroke-width', cfgs.maskStyle.normal.strokeWidth);
  return voronoiPathCell;
}
export default renderVoronoiPath;