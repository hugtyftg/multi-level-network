interface StyleCfg {
  data?: any,
  dataName: string,
  width: number,
  height: number,
  divBoxSelector: string,
  emphasisName: string,
  // 节点标签超过阈值自动显示
  scaleThreshold?: number,
  // 空白填充度和强度，可暴露出来让用户配置，blankFillDegree和blankFillStrength越大，填充部分越大
  blankFillDegree: number,
  blankFillStrength: number,
  nodeStyle: {
    normal: NodeStyle,
    selected: NodeStyle,
  },
  nodeLabelStyle: NodeLabelStyle,
  edgeStyle: {
    normal: EdgeStyle
    selected: EdgeStyle,
  },
  maskStyle: {
    normal: MaskStyle
    selected: MaskStyle
  },
  maskLabelStyle: MaskLabelStyle
}
// 多边形样式
interface MaskStyle {
  color?: string | any,
  strokeColor?: string | any,
  strokeWidth?: number | any,
  opacity?: number,
}
// 多边形标签样式
interface MaskLabelStyle {
  fill: string | ((d: any) => string),
  opacity?: number,
  fontWeight?: number | string,
}
// 节点样式
interface NodeStyle {
  radius?: number,
  opacity?: number,
  strokeWidth?: number,
  stroke?: string | any,
  fill?: string | any,
}
// 节点标签样式
interface NodeLabelStyle {
  stroke?: string | any,
  strokeWidth?: number,
  fontSize?: string,
  textAnchor?: string,
  show?: boolean | 'auto',
}
// 连边样式
interface EdgeStyle {
  opacity?: number,
  strokeWidth?: number,
  strokeColor?: string | any,
  strokeDash?: string | any,
}

export type {
  StyleCfg,
  NodeStyle,
  NodeLabelStyle,
  EdgeStyle,
  MaskStyle,
  MaskLabelStyle
}