export class FlickeringMitigation {
  growthRatioChangeLength: any;
  allAvailableArea: any;
  lastErrorOfArea: any;
  lastGrowth: any;
  growthRatioChange: any;
  growthChangeWeights: any;
  growthChangeWeightsSum: any;
  constructor() {
    this.growthRatioChangeLength = DEFAULT_LENGTH;
    this.allAvailableArea = NaN;
  
    this.lastErrorOfArea = NaN;
    this.lastGrowth = NaN;
    this.growthRatioChange = [];
    this.growthChangeWeights = generateGrowthChangeWeights(this.growthRatioChangeLength); 
    this.growthChangeWeightsSum = computeGrowthChangeWeightsSum(this.growthChangeWeights);
  }
  reset() {
    this.lastErrorOfArea = NaN;
    this.lastGrowth = NaN;
    this.growthRatioChange = [];
    this.growthRatioChangeLength = DEFAULT_LENGTH;
    this.growthChangeWeights = generateGrowthChangeWeights(this.growthRatioChangeLength);
    this.growthChangeWeightsSum = computeGrowthChangeWeightsSum(this.growthChangeWeights);
    this.allAvailableArea = NaN;
  
    return this;
  };
  clear() {
    this.lastErrorOfArea = NaN;
    this.lastGrowth = NaN;
    this.growthRatioChange = [];
    return this;
  };
  length(newLength?: any) {
    if (!newLength) { 
      return this.growthRatioChangeLength; 
    }
    if (parseInt(newLength)>0) {
      this.growthRatioChangeLength = Math.floor(parseInt(newLength));
      this.growthChangeWeights = generateGrowthChangeWeights(this.growthRatioChangeLength);
      this.growthChangeWeightsSum = computeGrowthChangeWeightsSum(this.growthChangeWeights);
    } else {
      console.warn("FlickeringMitigation.length() 只接受正整数 "+newLength);
    }
    return this;
  };
  totalArea(newAllAbailbaleArea?: any) {
    if (!newAllAbailbaleArea) { 
      return this.allAvailableArea; 
    }
  
    if (parseFloat(newAllAbailbaleArea)>0) {
      this.allAvailableArea = parseFloat(newAllAbailbaleArea);
    } else {
      console.warn("FlickeringMitigation.totalArea() 只接受正数 "+newAllAbailbaleArea);
    }
    return this;
  };
  add(areaError: any) {
    let secondTolastErrorOfArea: any, fromSecToLastGrowth: any;
  
    secondTolastErrorOfArea = this.lastErrorOfArea;
    this.lastErrorOfArea = areaError;
    if (!isNaN(secondTolastErrorOfArea)) {
      fromSecToLastGrowth = this.lastGrowth;
      this.lastGrowth = direction(this.lastErrorOfArea, secondTolastErrorOfArea);
    }
    if (!isNaN(fromSecToLastGrowth)) {
      this.growthRatioChange.unshift(this.lastGrowth !== fromSecToLastGrowth);
    }
  
    if (this.growthRatioChange.length>this.growthRatioChangeLength) {
      this.growthRatioChange.pop();
    }
    return this;
  };
  ratio() {
    let weightedChangeNum = 0;
    let newRatio: number;
  
    if (this.growthRatioChange.length < this.growthRatioChangeLength) { return 0; }
    if (this.lastErrorOfArea > this.allAvailableArea/10) { return 0; }
  
    for(let i=0; i<this.growthRatioChangeLength; i++) {
      if (this.growthRatioChange[i]) {
        weightedChangeNum += this.growthChangeWeights[i];
      }
    }
    newRatio = weightedChangeNum / this.growthChangeWeightsSum;
  
    return newRatio;
  };
}

let DEFAULT_LENGTH = 10;

function direction(h0: any, h1: any) {
  let mitigationDirection = h0 >= h1? 1 : -1
  return mitigationDirection;
}

function generateGrowthChangeWeights(length: number | any) {
  let initWeight = 3;  
  let decrementStep = 1;
  let minWeight = 1;

  let curWeight = initWeight;
  let growthChangeWeights: any[] = [];

  for (let i=0; i<length; i++) {
    growthChangeWeights.push(curWeight);
    curWeight -= decrementStep;
    if (curWeight < minWeight) { 
      curWeight = minWeight; 
    }
  }
  return growthChangeWeights;
}

function computeGrowthChangeWeightsSum (growthChangeWeights: number | any) {
  let curGrowthChangeWeightsSum = 0;
  for (let i: number = 0; i<growthChangeWeights.length; i++) {
    curGrowthChangeWeightsSum += growthChangeWeights[i];
  }
  return curGrowthChangeWeightsSum;
}