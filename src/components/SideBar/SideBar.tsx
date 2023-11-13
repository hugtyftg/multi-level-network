import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import React, { useEffect, useRef } from 'react';
import { PagePropsType } from '../../type';
import './SideBar.less';
import { Button, Input, Select, Space } from 'antd';
import { GlobalOutlined, ContainerOutlined, CloudServerOutlined } from '@ant-design/icons'
import { useStore } from '../../store/graphStore';
import { observer } from 'mobx-react-lite';
import MultiLevelPartitionGraph from '../../graph/MultiLevelPartitionGraph';
import { autorun } from 'mobx';
import RoleDistribution from '../RoleDistribution/RoleDistribution';
import AlarmDistribution from '../AlarmDistribution/AlarmDistribution';

function SideBar(props: PagePropsType) {
  const store = useStore();
  const dispose = autorun(() => {
    // 当curDatesetName改变的时候，更新数据
    fetch(`/data/${store.curDatasetName}`)
    .then(res => res.json())
    .then(newGraphData => {
      store.updateGraphData(newGraphData);
    })
  })
  const options: any[] = store.allDatasetNames.map((data: any) => ({
    value: data.name,
    label: data.name,
  }))
  const {padding, margin, background} = props;
  const inputIpRef: any = useRef(null);
  const inputPartition1Ref: any = useRef(null);
  const inputPartition2Ref: any = useRef(null);

  const onSelectDataset = (value: any) => {
    store.updateDatasetName(value);
  }
  const onSearchIp = () => {
    // input框输入的字符串默认是''
    const inputIp: string = inputIpRef.current.input.value;
    const result: boolean = (store.curGraphInstance as MultiLevelPartitionGraph).searchIp(inputIp);
    // 如果没有查找到，返回false
    if (!result) {
      alert('当前未查找到该ip对应的设备节点')
    }
  }
  const onSearchPartition = () => {
    const partition1: string = inputPartition1Ref.current.input.value;
    const partition2: string = inputPartition2Ref.current.input.value;
    (store.curGraphInstance as MultiLevelPartitionGraph)
    .searchPartition(partition1, partition2, true, true, {
      nodeStyle: {
        stroke: 'black',
        opacity: 1,
        strokeWidth: 5
      },
      edgeStyle: {
        strokeColor: 'red',
        strokeWidth: 3,
        opacity: 1,
        strokeDash: 'solid'
      },
      maskStyle: {
        opacity: 1,
        color: 'pink',
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
  return <Sider className='side-bar' style={{
      margin: '10px 0px 10px 10px',
    }}>
      <Content style={{padding, margin, background}}>
        <div className="select-dataset">
          <p>Please select dataset:</p>
          <Select
            defaultValue={options[0].value}
            onChange={(value) => onSelectDataset(value)}
            options={options}
            menuItemSelectedIcon={<ContainerOutlined/>}
          />
        </div>
        <div className="search-partition">
          <Space.Compact size="large">
            <Input addonBefore={<GlobalOutlined />} placeholder="az" style={{
              width: '150%'
            }} ref={inputPartition1Ref}/>
            <Input placeholder="pod" ref={inputPartition2Ref}/>
            <Button type="primary" onClick={onSearchPartition}>Search</Button>
          </Space.Compact>
        </div>
        <div className="search-ip">
          <Space.Compact size="large">
            <Input addonBefore={<CloudServerOutlined />} placeholder="device ip" ref={inputIpRef}/>
            <Button type="primary" onClick={onSearchIp} >Search</Button>
          </Space.Compact>
        </div>
        <div className="distribution" style={{
          margin: '160px 0',
        }}>
          <AlarmDistribution/>
          <RoleDistribution/>
        </div>
      </Content>
    </Sider>
}
export default observer(SideBar);