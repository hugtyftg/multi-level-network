import { makeAutoObservable } from 'mobx'
import { createContext, useContext } from 'react';
import MultiLevelPartitionGraph from '../graph/MultiLevelPartitionGraph';
import { datasetRangeList, ViewTypes } from '@/config/DEFAULT';
class Store {
  // 画布分割图实例
  graphInstance: MultiLevelPartitionGraph | any = {};
  // roleDistribution图实例
  roleDistriGraphInstance: any = {};
  // alarming distribution graph instance
  alarmDistriGraphInstance: any = {};
  // 全局共用的数据
  graphData: any = {};
  datasetName: string = `${datasetRangeList[0]}_processed.json`;
  // 当前视图
  viewName: ViewTypes  = 'PARTITION';
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
  updateGraphData(newGraphData: any) {
    this.graphData = newGraphData;
  }
  updateDatasetName(newDatasetName: string) {
    this.datasetName = newDatasetName;
  }
  updateViewName(newViewName: ViewTypes) {
    this.viewName = newViewName;
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
  resetGraphData() {
    this.graphData = {};
  }
  resetGraphDatasetName() {
    this.datasetName = `${datasetRangeList[0]}_processed.json`;
  }
  resetViewName() {
    this.viewName = 'PARTITION';
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
  get curGraphData() {
    return this.graphData;
  }
  get curDatasetName() {
    return this.datasetName;
  }
  get curViewName() {
    return this.viewName;
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
  get isCurGraphDataEmpty() {    
    return Object.keys(this.curGraphData).length === 0;
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