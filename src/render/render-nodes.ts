import { StyleCfg } from '../interface/style';
import { renderIcons } from './render-icons';
// 节点标签显示的三种状态：true -> 全都显示 false -> 全都不显示 auto ->只显示告警节点
const nodeLabelDisplayFn = (d: any, cfgs: StyleCfg): string => {
  if (cfgs.nodeLabelStyle.show === true) {
    return 'block';
  } else if (cfgs.nodeLabelStyle.show === false) {
    return 'none';
  } else if (cfgs.nodeLabelStyle.show === 'auto') {
    return d.children[0].is_alarming ? 'block' : 'none';
  } else {
    return 'auto';
  }
};
const iconTypeList: string[] = [
  'alarming-CORE',
  'alarming-LEAF',
  'alarming-SERVER',
  'alarming-SPINE',
  'alarming-VIRTUAL',
  'normal-CORE',
  'normal-hyperNode',
  'normal-LEAF',
  'normal-SERVER',
  'normal-SPINE',
  'normal-VIRTUAL',
];
const renderNodesElWithoutTick = (
  allNodesData: any,
  container: any,
  bottomNodeCell: any,
  drag: any,
  cfgs: StyleCfg
) => {
  if (iconTypeList.length > 0) {
    renderIcons(container, cfgs, iconTypeList);
  }

  // 每个节点的group
  let nodeEl = bottomNodeCell
    .selectAll('g.node_group')
    .data(allNodesData)
    .enter()
    .append('g')
    .attr('az', (d: any) => `${d.az}`)
    .attr('pod', (d: any) => `${d.pod}`)
    .attr('isHyperNode', (d: any) => `${d.isHyperNode}`)
    .attr('groupIndex', (d: any) => `${d.groupIndex}`)
    .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`)
    .call(drag()); // 给group绑定drag
  // 给每个节点添加circle，后期改成symbol或者icon
  // 节点背景
  nodeEl
    .append('circle')
    .attr('class', 'circle-background')
    .attr('stroke', cfgs.nodeStyle.normal.stroke)
    .attr('stroke-width', cfgs.nodeStyle.normal.strokeWidth)
    .attr('opacity', cfgs.nodeStyle.normal.opacity)
    .attr('r', cfgs.nodeStyle.normal.radius)
    .attr('fill', cfgs.nodeStyle.normal.fill);
  // 节点图标
  nodeEl
    .append('circle')
    .attr('class', 'circle-node')
    .attr('stroke', 'none') // 节点图标圆形没有边框，只作为承载icon的载体
    .attr('r', cfgs.nodeStyle.normal.radius)
    .attr('fill', (d: any) => {
      if (d.isHyperNode) {
        // 超点不可能告警
        return `url(#node-icon-normal-hyperNode)`;
      } else {
        if (d.children[0].is_alarming) {
          return `url(#node-icon-alarming-${d.children[0].role.toUpperCase()})`;
        } else {
          return `url(#node-icon-normal-${d.children[0].role.toUpperCase()})`;
        }
      }
    })
    .attr('opacity', cfgs.nodeStyle.normal.opacity);

  // 给每个节点group添加label，默认只显示告警节点的标签
  nodeEl
    .append('text')
    .text((d: any) =>
      d.isHyperNode
        ? 'group:' + String(d.groupIndex)
        : String(d.children[0].mgmt_ip)
    )
    .attr('stroke', cfgs.nodeLabelStyle.stroke)
    .attr('stroke-width', cfgs.nodeLabelStyle.strokeWidth)
    .attr('font-size', cfgs.nodeLabelStyle.fontSize)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('pointer-events', 'none')
    .attr(
      'transform',
      (d: any) => `translate(0, ${cfgs.nodeStyle.normal.radius})`
    )
    .attr('display', (d: any) => nodeLabelDisplayFn(d, cfgs));
  return nodeEl;
};
export { renderNodesElWithoutTick, nodeLabelDisplayFn };
