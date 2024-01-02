import React, { useEffect } from 'react';
import './Side.less'
import { useStore } from '@/store/graphStore';
import { observer } from 'mobx-react-lite';
import { autorun, reaction } from 'mobx';
import RoleDistribution from '@/components/Side/RoleDistribution/RoleDistribution';
import AlarmDistribution from '@/components/Side/AlarmDistribution/AlarmDistribution';
import SelectDataset from './SelectDataset/SelectDataset';
import SearchIp from './SearchIp/SearchIp';
import SearchPartition from './SearchPartition/SearchPartition';
import { groupData, originData } from '@/interface/partition';

const Side: React.FC = () => {
  const store = useStore();
  const dispose = autorun(() => {
    // 当curDatesetName改变的时候，更新数据
    // fetch(`/data/${store.curDatasetName}`)
    fetch(`${import.meta.env.BASE_URL}data/${store.curDatasetName}`)
    .then(res => res.json())
    .then((newPartitionGraphData: groupData) => {
      store.updatePartitionGraphData(newPartitionGraphData);
    })
  })
  const dispose2 = autorun(() => {
    fetch(`${import.meta.env.BASE_URL}data/origin.json`)
    .then(res => res.json())
    .then((newOriginGraphData: originData) => {
      store.updateOriginGraphData(newOriginGraphData);
    })
  })
  // TODO：模拟展开的力导引图是第一个超点里面的数据
  // const dispose3 = reaction(() => store.partitionGraphData, (partitionGraphData) => {
  //   if (!store.isCurPartitionGraphDataEmpty) {
  //     store.updateHyperNodeData((partitionGraphData as groupData).groupList[16]);
  //     store.updateViewName('HYPERNODE');
  //   }
  // })
  // autorun和reaction返回一个取消响应式函数的dispose，需要在组件卸载的时候执行，以便释放该函数
  useEffect(() => {
    return () => {
      dispose();
      dispose2();
      // dispose3();
    }
  })
  return <div className="side" style={{
          width: 350,
          margin: '0 10px 0 0',
          padding: 24,
          backgroundColor: '#fff'
        }}>
  <SelectDataset />
  <SearchPartition />
  <SearchIp />
  <div className="distribution">
    <AlarmDistribution/>
    <RoleDistribution/>
  </div>
</div>
}
export default observer(Side);