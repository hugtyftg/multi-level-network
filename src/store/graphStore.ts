import { makeAutoObservable } from 'mobx'
import { createContext, useContext } from 'react';
import MultiLevelPartitionGraph from '../graph/MultiLevelPartitionGraph';
import { datasetRangeList, ViewTypes } from '@/config/DEFAULT';
import { group, originData } from '@/interface/partition';
import BaseGraph from '@/graph';
class Store {
  // 在右侧展示的主图的实例
  graphInstance: MultiLevelPartitionGraph | BaseGraph | object = {};
  // 右侧展示的主图的类型
  viewName: ViewTypes  = 'PARTITION';
  // roleDistribution图实例
  roleDistriGraphInstance: object = {};
  // alarming distribution图实例
  alarmDistriGraphInstance: object = {};
  // 当前展示的分割图的数据
  partitionGraphData: object = {};
  // 当前分割图的数据集名称
  datasetName: string = `${datasetRangeList[0]}_processed.json`;
  // 当前展示的超点的数据
  hyperNodeData: group | object = {};
  // 原始图的数据
  originGraphData: originData | object = {};
  constructor() {
    // 通过 action.bound 绑定 this 的指向
    makeAutoObservable(this, {}, {autoBind: true});
  }
  updateGraphInstance(newGraphInstance: any) {
    this.graphInstance = newGraphInstance;
  }
  updateRoleDistriGraphInstance(newRoleDistriGraphInstance: any) {
    this.roleDistriGraphInstance = newRoleDistriGraphInstance;
  }
  updateAlarmDistriGraphInstance(newAlarmDistriGraphInstance: any) {
    this.alarmDistriGraphInstance = newAlarmDistriGraphInstance;
  }
  updatePartitionGraphData(newPartitionGraphData: any) {
    this.partitionGraphData = newPartitionGraphData;
  }
  updateDatasetName(newDatasetName: string) {
    this.datasetName = newDatasetName;
  }
  updateViewName(newViewName: ViewTypes) {
    this.viewName = newViewName;
  }
  updateHyperNodeData(newHyperNodeData: group) {
    this.hyperNodeData = newHyperNodeData;
  }
  updateOriginGraphData(newOriginGraphData: originData) {
    this.originGraphData = newOriginGraphData;
  }
  resetGraphInstance() {
    this.graphInstance = {};
  }
  resetRoleDistriGraphInstance() {
    this.roleDistriGraphInstance = {};
  }
  resetAlarmDistriGraphInstance() {
    this.alarmDistriGraphInstance = {};
  }
  resetPartitionGraphData() {
    this.partitionGraphData = {};
  }
  resetGraphDatasetName() {
    this.datasetName = `${datasetRangeList[0]}_processed.json`;
  }
  resetViewName() {
    this.viewName = 'PARTITION';
  }
  resetHyperNodeData() {
    this.hyperNodeData = {};
  }
  resetOriginGraphData() {
    this.originGraphData = {};
  }
  get curGraphInstance() {
    return this.graphInstance;
  }
  get curRoleDistriGraphInstance() {
    return this.roleDistriGraphInstance;
  }
  get curAlarmDistriGraphInstance() {
    return this.alarmDistriGraphInstance;
  }
  get curPartitionGraphData() {
    return this.partitionGraphData;
  }
  get curDatasetName() {
    return this.datasetName;
  }
  get curViewName() {
    return this.viewName;
  }
  get curHyperNodeData (){
    return this.hyperNodeData;
  }
  get curOriginGraphData() {
    return this.originGraphData;
  }
  get isCurGraphInstanceEmpty() {
    return Object.keys(this.curGraphInstance).length === 0;
  }
  get isCurRoleDistriGraphInstanceEmpty() {
    return Object.keys(this.curRoleDistriGraphInstance).length === 0;
  }
  get isCurAlarmDistriGraphInstanceEmpty() {
    return Object.keys(this.curAlarmDistriGraphInstance).length === 0;
  }
  get isCurPartitionGraphDataEmpty() {    
    return Object.keys(this.curPartitionGraphData).length === 0;
  }
  get isCurHyperNodeDataEmpty() {
    return Object.keys(this.curHyperNodeData).length === 0;
  }
  // 在mobx中所有的property会默认加上一个symbol表示它是被mobx监测观察的，
  // 因此即使在这个对象为空的时候，仍然有这么一个symbol属性，不可以通过后两种方法判断这个对象是否传入了数据
  get isCurOriginGraphDataEmpty() {
    // console.log(Reflect.ownKeys(this.curOriginGraphData));
    return Object.keys(this.curOriginGraphData).length === 0;
  }
  get allDatasetNames(): Array<{name: string, id: string}> {
    return datasetRangeList.map((v: string) => {
      return {
        name: `${v}_processed.json`,
        id: `${v}_processed.json`
      }
    });
  }
}
const store = new Store();
const Context = createContext(store);
export const useStore = () => {
  return useContext(Context);
}