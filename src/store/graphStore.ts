import { makeAutoObservable } from 'mobx'
import { createContext, useContext } from 'react';
import MultiLevelPartitionGraph from '../graph/MultiLevelPartitionGraph';
import { datasetRangeList, ViewTypes } from '@/config/DEFAULT';
import { group } from '@/interface/partition';
import BaseGraph from '@/graph';
class Store {
  // 在右侧展示的图形的实例
  graphInstance: MultiLevelPartitionGraph | BaseGraph | object = {};
  // roleDistribution图实例
  roleDistriGraphInstance: any = {};
  // alarming distribution graph instance
  alarmDistriGraphInstance: any = {};
  // 当前展示的分割图的数据
  partitionGraphData: any = {};
  // 当前分割图的数据集名称
  datasetName: string = `${datasetRangeList[0]}_processed.json`;
  // 当前视图
  viewName: ViewTypes  = 'PARTITION';
  // 当前展示的超点的数据
  hyperNodeData: group | any = {};
  constructor() {
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
    this.hyperNodeData = null;
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
export const useStore = ()=> {
  return useContext(Context);
}