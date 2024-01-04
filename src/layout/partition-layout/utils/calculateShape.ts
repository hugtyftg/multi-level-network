function getSides(shape: string) {
  switch (shape) {
    case 'triangle':
      return 3;
    case 'square':
      return 4;
    case 'pentagon':
      return 5;
    case 'hexagon':
      return 6;
    case 'octagon':
      return 8;
    case 'circle':
      return 100;
    default:
      return 4;
  }
}
/**
 * 以某个矩形为基准计算容器，计算画布多边形的顶点坐标
 * @param x 从基准矩形左上角顶点x坐标开始计算目标多边形
 * @param y 从基准矩形左上角顶点y坐标开始计算目标多边形
 * @param width 基准矩形宽度
 * @param height 基准矩形高度
 * @param shape 目标多边形名称
 * @param sideNum 目标正多边形边数，如果有shape则失效
 * @returns
 */
function calculateShapeCanvas(
  x: number = 0,
  y: number = 0,
  width: number,
  height: number,
  shape?: string,
  sideNum?: number
) {
  // 最终的画布的形状坐标
  let resultCoordinates: number[][] = [];
  // 如果是矩形，则直接按照svg绘制，否则再计算其他形状画布坐标
  if (shape === 'rectangle') {
    resultCoordinates = [
      [x, y],
      [x, height],
      [width, y],
      [width, height],
    ];
  } else {
    let sides: number;
    if (shape) {
      sides = getSides(shape);
    } else if (sideNum) {
      sides = sideNum;
    } else {
      throw new Error('请输入画布形状或边数');
    }
    const center: number[] = [width * 0.5, height * 0.5];
    let widthRadius: number = (width - 2 * (x ? x : 0)) * 0.5;
    let heightRadius: number = (height - 2 * (y ? y : 0)) * 0.5;
    let radius: number = Math.min(widthRadius, heightRadius);
    const angleRadians: number = (2 * Math.PI) / sides;
    let initAngle: number =
      sides % 2 === 0 ? -Math.PI / 2 - angleRadians * 0.5 : -Math.PI / 2; // subtract angles

    // 对三角形和正方形需要进行特殊预处理
    if (sides === 3) {
      center[1] += heightRadius / 3.0;
      let radiusForWidth: number = (widthRadius * 2) / Math.sqrt(3);
      let radiusForHeight: number = (heightRadius * 4.0) / 3.0;
      radius = Math.min(radiusForWidth, radiusForHeight);
    } else if (sides === 4) {
      radius *= Math.sqrt(2);
    }

    for (let i = 0; i < sides; i++) {
      resultCoordinates.push([
        center[0] + radius * Math.cos(initAngle - i * angleRadians),
        center[1] + radius * Math.sin(initAngle - i * angleRadians),
      ]);
    }
  }
  return resultCoordinates;
}
export { getSides, calculateShapeCanvas };
