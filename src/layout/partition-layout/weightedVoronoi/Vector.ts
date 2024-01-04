// 将三维点转化为向量
export class Vector {
  public x: any;
  public y: any;
  public z: any;
  constructor(xCoordinate: any, yCoordinate: any, zCoordinate: any) {
    this.x = xCoordinate;
    this.y = yCoordinate;
    this.z = zCoordinate;
  }
  // 原向量的负向量
  negate() {
    this.x = this.x * -1;
    this.y = this.y * -1;
    this.z = this.z * -1;
  }
  // 向量标准化
  normalize() {
    let modulus = Math.sqrt(
      this.x * this.x + this.y * this.y + this.z * this.z
    );
    if (modulus > 0) {
      this.x /= modulus;
      this.y /= modulus;
      this.z /= modulus;
    }
  }
}
