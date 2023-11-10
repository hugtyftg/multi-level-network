const rc4ModUnit: number = 256; // RC4算法后续生成随机数的mod单位
const entropyPool: any = []; // 熵池，记录无序性，也就是固定的随机序列池
// 为了得到一个double类型的random number，至少需要6个RC4算法输出数
const significantBit: number = Math.pow(2, 52); // 有效位数
const bitMask: number = rc4ModUnit - 1; // 位掩码

// 返回一个具有随机种子、输出固定随机数序列的伪随机数发生器 pseudoRandomNumGenerator
const seed = (seedNum: number): any => {
  // 使用传入的seed初始化密码流
  const keyStream: number[] = [seedNum];
  // 初始化密码算法的发生器
  const RC4: any = rc4Encrypt(keyStream, rc4ModUnit, seedNum);
  // pseudo random number generator，返回一个[0,1)区间内的随机double数字
  const pseudoRandomNumGenerator = (): number => {
    let number: number = RC4.generator(6); // 初始化number
    let denominator: number = Math.pow(rc4ModUnit, 6); // 初始化分母
    let significant: number = 0; // 初始化当前的有效位数
    // 如果number太小以至于下溢、小于有效位，那么通过RC4增大数值
    while (number < significantBit) {
      ({ number, denominator, significant } = dealUnderflow(number, denominator, significant, RC4));
    }
    // 如果number太大以至于上溢，就将所有数除以2，直至不再上溢
    while (number >= significantBit * 2) {
      ({ number, denominator, significant } = dealOverflow(number, denominator, significant));
    }
    return (number + significant) / denominator;
  };
  // 将随机性混合到无序熵池中
  getKeyStreaming(charCodeToStr(RC4.scheduling), entropyPool);
  return pseudoRandomNumGenerator;
}
// 解决number上溢问题
const dealOverflow = (number: number, denominator: number, significant: number) => {
  number /= 2;
  denominator /= 2;
  significant >>>= 1; // 无符号右移x = significant / (2*1)
  return {
    number,
    denominator,
    significant
  }
}
// 下溢处理
const dealUnderflow = (number: number, denominator: number, significant: number, RC4: any) => {
  number = rc4ModUnit * (significant + number);
  denominator *= rc4ModUnit;
  significant = RC4.generator(1); // 更新有效位数
  return {
    number,
    denominator,
    significant
  }
}
// 将seed混入伪随机整数序列，该方法返回一个和伪随机数数值相等的字符串seed，以便产生下次的随机数
const getKeyStreaming = (seed: any, keyStream: number[]): string => {
  let result: string;
  let dirtyValue: any;
  let seedStr = String(seed);
  for (let i = 0; i < seedStr.length; i++) {
    const keyIndex = bitMask & i;
    let xorOperator: number = keyStream[bitMask & i] * 19;
    dirtyValue ^= xorOperator;
    let bitwiseOperator: number = dirtyValue + seedStr.charCodeAt(i);
    keyStream[keyIndex] = bitMask & bitwiseOperator;
  }
  result = charCodeToStr(keyStream);
  return result;
}

interface rc4EncryptInterface {
  i: number;
  j: number;
  scheduling: any[];
  generator: (() => number) | any;
}
// RC4密码算法
const rc4Encrypt = (keyStream: number[], bound: number, seedNum: number): rc4EncryptInterface => {
  // 工厂模式，返回实例对象
  const _this: rc4EncryptInterface = {
    i: 0,
    j: 0,
    scheduling: [],
    generator: null
  };
  let loalI: number = 0;
  let localJ: number = 0;
  const localScheduling: number[] = _this.scheduling;
  // 使用标准密钥调度算法设置S值
  // 修改内部的状态并输出keystream的一个字节。
  // 在每次循环中，i++，并把i所指向的S值加到j上去，然后交换scheduling[i]和scheduling[j]的值，
  // 最后输出scheduling[i]和scheduling[j]的和(取256的模)对应的S值。至多经过256次，S每个位置上的值都被交换一次
  while (loalI < rc4ModUnit) {
    localScheduling[loalI] = loalI++;
  }
  for (loalI = 0; loalI < rc4ModUnit; loalI++) {
    let biter = localJ + keyStream[mod(loalI, keyStream.length)] + localScheduling[loalI];
    localJ = bitMask & biter;
    // 交换
    [localScheduling[loalI], localScheduling[localJ]] = [localScheduling[localJ], localScheduling[loalI]];
  }
  // 返回结果数
  (_this.generator = (bitNum: number): number => {
    let temp: number;
    let result: number = 0;
    let closureBitwiseOperator: number;
    let mutor: number;
    let closureI = _this.i;
    let closureJ = _this.j;
    let localScheduling = _this.scheduling;
    for (let index = bitNum; index > 0; index--) {
      closureI = bitMask & (closureI + 1);
      temp = localScheduling[closureI];
      closureJ = bitMask & (closureJ + localScheduling[closureI]);
      localScheduling[closureI] = localScheduling[closureJ]
      localScheduling[closureJ] = temp;
      closureBitwiseOperator = localScheduling[closureI] + localScheduling[closureJ]
      mutor = localScheduling[bitMask & closureBitwiseOperator];
      result = result * rc4ModUnit + mutor;
    }
    _this.i = closureI;
    _this.j = closureJ;
    return result;
  })(bound);
  return _this;
}
// 模运算
const mod = (number: number, modUnit: number) => number % modUnit;
// 将每个字符对应的unicode编码转化为字符串
const charCodeToStr = (charCode: number[]): string => String.fromCharCode.apply(this, charCode);
export {
  seed
};