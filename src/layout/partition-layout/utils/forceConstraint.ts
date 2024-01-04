/**
 * 关于力约束的accessor
 * @param constraintCircleCx circle constraint bound的圆心坐标
 * @param constraintCircleCy circle constraint bound的圆心坐标
 * @param constraintRadius circle constraint bound的半径
 * @param borderPadding 默认粒子群和circle constraint bound的padding
 * @returns 获取约束位置的ticker
 */
function forceConstraintAccessor(
  constraintCircleCx: number,
  constraintCircleCy: number,
  constraintRadius: number,
  borderPadding: number
): any {
  const radius = constraintRadius;
  const circleCx = constraintCircleCx;
  const circleCy = constraintCircleCy;
  const basePadding = borderPadding;
  /**
   * 固定一个坐标的情况下，将另一个坐标调整到圆内
   * @param nodeRadius 由于节点是有尺寸的，因此需要传入节点的半径
   * @param nodeStrokeWidth 每个节点的连边宽度
   * @param fixedCoordinate 被固定的坐标
   * @param unknownCoordinate 待求解的坐标
   * @returns 待求解的坐标固定到园内的结果
   */
  const posTicker = (
    nodeRadius: number,
    nodeStrokeWidth: number,
    fixedCoordinate: number,
    unknownCoordinate: number,
    calCoordname: string
  ): number => {
    nodeRadius += basePadding;
    let solution: number = 0;
    if (calCoordname === 'y') {
      // 被固定的坐标为了保证限制在圆内，应该能取的最小坐标值和最大坐标值
      const minFixedCoordinate: number =
        circleCx - radius + nodeRadius + nodeStrokeWidth;
      const maxFixedCoordinate: number =
        circleCx + radius - nodeRadius - nodeStrokeWidth;
      // 将被固定的坐标x调整到圆内
      let newFixedCoordinate: number = Math.min(
        maxFixedCoordinate,
        Math.max(minFixedCoordinate, fixedCoordinate)
      );
      // 被固定的坐标与圆心所成的直角边的平方值
      const fixedSideSquare: number = (newFixedCoordinate - circleCx) ** 2;
      // 待求解的坐标与圆心所成的直角边的值
      const solveSide: number = Math.sqrt(radius ** 2 - fixedSideSquare);
      // 待求解的坐标为了保证限制在圆内，应该能取的最小坐标值和最大坐标值
      const minSolutionCoordinate: number =
        circleCy - solveSide + (nodeRadius + nodeStrokeWidth);
      const maxSolutionCoordinate: number =
        circleCy + solveSide - (nodeRadius + nodeStrokeWidth);
      // 将待求解的坐标调整到圆内
      solution = Math.min(
        maxSolutionCoordinate,
        Math.max(minSolutionCoordinate, unknownCoordinate)
      );
    }
    if (calCoordname === 'x') {
      // 待求解x
      const minFixedCoordinate: number =
        circleCy - radius + nodeStrokeWidth + nodeRadius;
      const maxFixedCoordinate: number =
        circleCy + radius - nodeStrokeWidth - nodeRadius;
      // 将被固定的坐标y调整到圆内
      let newFixedCoordinate: number = Math.min(
        maxFixedCoordinate,
        Math.max(minFixedCoordinate, fixedCoordinate)
      );
      const fixedSideSquare: number = (newFixedCoordinate - circleCy) ** 2;
      const solveSide: number = Math.sqrt(radius ** 2 - fixedSideSquare);
      const minSolutionCoordinate: number =
        circleCx - solveSide + (nodeRadius + nodeStrokeWidth);
      const maxSolutionCoordinate: number =
        circleCx + solveSide - (nodeRadius + nodeStrokeWidth);
      solution = Math.min(
        maxSolutionCoordinate,
        Math.max(minSolutionCoordinate, unknownCoordinate)
      );
    }
    return solution;
  };
  return posTicker;
}
export { forceConstraintAccessor };
