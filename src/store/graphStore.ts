import { makeAutoObservable } from 'mobx'
import { createContext, useContext } from 'react';
import MultiLevelPartitionGraph from '../graph/MultiLevelPartitionGraph';
const datasetRangeList = ['10000', '20000', '6000', '2500', '1500', '500'];
class Store {
  graphInstance: MultiLevelPartitionGraph | {} = {};
  graphData: any = {};
  datasetName: string = `${datasetRangeList[0]}_processed.json`;
  constructor() {
    makeAutoObservable(this, {}, {autoBind: true});
  }
  updateGraphInstance(newGraphInstance: any) {
    this.graphInstance = newGraphInstance;
  }
  updateGraphData(newGraphData: any) {
    this.graphData = newGraphData;
  }
  updateDatasetName(newDatasetName: string) {
    this.datasetName = newDatasetName;
  }
  resetGraphInstance() {
    this.graphInstance = {};
  }
  resetGraphData() {
    this.graphData = {};
  }
  get curGraphInstance() {
    return this.graphInstance;
  }
  get curGraphData() {
    return this.graphData;
  }
  get isCurGraphInstanceEmpty() {
    return Object.keys(this.curGraphInstance).length === 0;
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
  get curDatasetName() {
    return this.datasetName;
  }
}
const store = new Store();
const Context = createContext(store);
export const useStore = ()=> {
  return useContext(Context);
}