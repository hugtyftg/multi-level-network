import { action, makeAutoObservable, observable } from 'mobx'
class graphStore {
  datasetName: string = '20000_processed.json';
  searchedAzName: string = '';
  searchedPodName: string = '';
  searchedIp: string = '';
  maskLabelLayer: boolean = false;
  constructor() {
    makeAutoObservable(this, {
      datasetName: observable,
      searchedAzName: observable,
      searchedPodName: observable,
      searchedIp: observable,
      maskLabelLayer: observable,
      updateDatasetName: action,
      updateSearchedAzName: action,
      updateSearchedPodName: action,
      updateSearchedIp: action,
      updateMaskLabellayer: action
    })
  }
  updateDatasetName() {

  }
  updateSearchedAzName() {
  
  }
  updateSearchedPodName() {
  
  }
  updateSearchedIp() {
  
  }
  updateMaskLabellayer() {

  }
}
export {
  graphStore
}