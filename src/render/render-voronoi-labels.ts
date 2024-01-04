import { StyleCfg } from '../interface/style';
import { formatName } from '../layout/partition-layout/utils';
/**
 * 渲染voronoi多边形的标签
 * @param fontScale 根据每个voronoi权重大小影射字体大小
 * @param container voronoi label的承载元素
 * @param cfgs 图样式参数
 * @param hierarchicalInfo 每个层级（az、pod）的信息
 * @returns 标签元素
 */
const renderVoronoiLabel = (
  fontScale: (value: number) => number,
  container: any,
  cfgs: StyleCfg,
  hierarchicalInfo: any
) => {
  const voronoiLabelCell = container
    .append('g')
    .attr('id', 'labels')
    .attr('transform', `translate(${[-cfgs.width / 2, -cfgs.height / 2]})`)
    .selectAll('labels')
    .data(hierarchicalInfo)
    .enter()
    .append('g')
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
    /* 问题：标签越界——标签自适应 */
    .attr('transform', (d: any) => {
      return `translate(${d.siteX}, ${d.siteY})`;
    })
    .attr('font-size', (d: any) => {
      return fontScale(d.value);
    })
    .attr('opacity', 0)
    // .attr('fill', (d: any) => {
    //   if (d.data.hierarchy === 'az') {
    //     return '#000';
    //   } else {
    //     return '#555';
    //   }
    // })
    .attr('fill', cfgs.maskLabelStyle?.fill);

  // text标签的cell
  let voronoiLabelTextCell: any = voronoiLabelCell
    .append('text')
    // 文字标签自动水平和垂直都居中
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('pointer-events', 'none')
    .attr('font-weight', cfgs.maskLabelStyle?.fontWeight)
    .attr('opacity', cfgs.maskLabelStyle?.opacity)
    /* 单行标签直接显示 */
    .html((d: any) => formatName(d));

  /* 多行标签自适应放置 */
  // .attr('', (d: any) => {
  //   let maskLabel = formatName(d);
  //   // 总的字符数
  //   let totalCharacterNum = maskLabel.length;
  //   // 每个字符的尺寸
  //   let fontSize = fontScale(d.value);
  //   // 每行的最大长度
  //   let rowMaxLength = d.maxIncircle[2] * 2.2;
  //   // 每行最大字符数
  //   let rowCharacterNum = Math.floor(rowMaxLength / fontSize);
  //   // 将原始的字符串分成最大长度为rowCharacterNum的子字符串
  //   let subStrs: string[] = []
  //   for (let i = 0; i < totalCharacterNum; i+= rowCharacterNum) {
  //     if (i + rowCharacterNum > totalCharacterNum) {
  //       subStrs.push(maskLabel.slice(i, totalCharacterNum));
  //     } else {
  //       subStrs.push(maskLabel.slice(i, i+rowCharacterNum));
  //     }
  //   }
  //   // 保存该属性
  //   d.subStrs = subStrs
  // })
  // voronoiLabelTextCell.selectAll('tspan')
  //   .data((d: any) =>
  //     Array.from({length: d.subStrs.length}, (v: any, i: number) => {
  //       return {
  //         fontSize: Number(fontScale(d.value)),
  //         subStr: d.subStrs[i],
  //         totalSubStrNum: d.subStrs.length
  //       }
  //     }
  //   ))
  //   .join('tspan')
  //   .attr('x', 0)
  //   .attr('y', (d: any, i: number) => {
  //     let midIndex = Math.floor(d.totalSubStrNum / 2);
  //     let deltaY = (i - midIndex) * Number(d.fontSize);
  //     let baseY = 0;
  //     let y = String(baseY + deltaY);
  //     return y;
  //   })
  //   .text((d: any) => d.subStr)
  return voronoiLabelCell;
};
export default renderVoronoiLabel;
