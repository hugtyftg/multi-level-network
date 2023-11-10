import { select } from "d3";
import { StyleCfg } from "../interface/style";
const renderIcons = (container: any, cfgs: StyleCfg, iconTypeList: string[]) => {
  // 设置节点的icon defs元素，方便节点直接使用
  let iconDefs: any; // 节点icon声明元素
  if (document.querySelector(`svg#graph-painter defs#icon-defs`)) {
    // 存在则直接获取
    iconDefs = select('defs#icon-defs');
  } else {
    // 否则新建
    iconDefs = container.append('defs')
      .attr('id', 'icon-defs');
  }
  // 遍历待绘制的 icon 元素列表
  iconTypeList.forEach((iconType: string) => {
    const iconPattern = iconDefs.append('pattern')
      .datum(iconType)
      .attr('id', `node-icon-${iconType}`)
      .attr('width', 1)
      .attr('height', 1);
    iconPattern.append('image')
      .attr('href', `/icon/${iconType}.svg`) // 图标svg
      .attr('preserveAspectRatio', 'none') // 放缩比，填充整个circle
      .attr('width', cfgs.nodeStyle.normal.radius as number * 1.4)
      .attr('height', cfgs.nodeStyle.normal.radius as number * 1.4)
      .attr('x', cfgs.nodeStyle.normal.radius as number * 0.3)
      .attr('y', cfgs.nodeStyle.normal.radius as number * 0.3)
      })
}
export {
  renderIcons
}