import React, { useEffect } from 'react';
import './Side.less'
import { useStore } from '@/store/graphStore';
import { observer } from 'mobx-react-lite';
import { autorun } from 'mobx';
import RoleDistribution from '@/components/Side/RoleDistribution/RoleDistribution';
import AlarmDistribution from '@/components/Side/AlarmDistribution/AlarmDistribution';
import SelectDataset from './SelectDataset/SelectDataset';
import SearchIp from './SearchIp/SearchIp';
import SearchPartition from './SearchPartition/SearchPartition';

function Side() {
  const store = useStore();
  const dispose = autorun(() => {
    // 当curDatesetName改变的时候，更新数据
    // fetch(`/data/${store.curDatasetName}`)
    fetch(`${import.meta.env.BASE_URL}data/${store.curDatasetName}`)
    .then(res => res.json())
    .then(newGraphData => {
      store.updateGraphData(newGraphData);
    })
  })
  // autorun和reaction返回一个取消响应式函数的dispose，需要在组件卸载的时候执行，以便释放该函数
  useEffect(() => {
    return () => {
      dispose();
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