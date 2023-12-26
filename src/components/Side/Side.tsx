import React, { useEffect, useRef } from 'react';
import './Side.less'
import { Button, Input, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons'
import { useStore } from '@/store/graphStore';
import { observer } from 'mobx-react-lite';
import MultiLevelPartitionGraph from '@/graph/MultiLevelPartitionGraph';
import { autorun } from 'mobx';
import RoleDistribution from '@/components/Side/RoleDistribution/RoleDistribution';
import AlarmDistribution from '@/components/Side/AlarmDistribution/AlarmDistribution';
import SelectDataset from './SelectDataset/SelectDataset';
import SearchIp from './SearchIp/SearchIp';

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

  const inputPartition1Ref: any = useRef(null);
  const inputPartition2Ref: any = useRef(null);
  const onSearchPartition = () => {
    const partition1: string = inputPartition1Ref.current.input.value;
    const partition2: string = inputPartition2Ref.current.input.value;
    (store.curGraphInstance as MultiLevelPartitionGraph)
    .searchPartition(partition1, partition2, true, true, {
      nodeStyle: {
        stroke: 'blue',
        opacity: 1,
        strokeWidth: 3,
      },
      edgeStyle: {
        strokeColor: 'black',
        strokeWidth: 3,
        opacity: 1,
        strokeDash: 'solid'
      },
      maskStyle: {
        opacity: 0.6,
        color: '#80AED2',
        strokeWidth: 3,
        strokeColor: 'blue'
      },
    });
  }
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
  <div className="search-partition">
    <Space.Compact size="large">
      <Input addonBefore={<GlobalOutlined />} placeholder="az" style={{
        width: '150%'
      }} ref={inputPartition1Ref}/>
      <Input placeholder="pod" ref={inputPartition2Ref}/>
      <Button type="primary" onClick={onSearchPartition}>Search</Button>
    </Space.Compact>
  </div>
  <SearchIp />
  <div className="distribution">
    <AlarmDistribution/>
    <RoleDistribution/>
  </div>
</div>
}
export default observer(Side);