import MultiLevelPartitionGraph from '@/graph/MultiLevelPartitionGraph';
import { useStore } from '@/store/graphStore';
import { CloudServerOutlined } from '@ant-design/icons';
import { Space, Input, Button } from 'antd';
import React, { useRef } from 'react';
const SearchIp: React.FC = () => {
  const inputIpRef: any = useRef(null);
  const store = useStore();
  const onSearchIp = () => {
    // input框输入的字符串默认是''
    const inputIp: string = inputIpRef.current.input.value;
    const result: boolean = (
      store.curGraphInstance as MultiLevelPartitionGraph
    ).searchIp(inputIp);
    // 如果没有查找到，返回false
    if (!result) {
      alert('当前未查找到该ip对应的设备节点');
    }
  };
  return (
    <div className="search-ip">
      <Space.Compact size="large">
        <Input
          addonBefore={<CloudServerOutlined />}
          placeholder="device ip"
          ref={inputIpRef}
        />
        <Button type="primary" onClick={onSearchIp}>
          Search
        </Button>
      </Space.Compact>
    </div>
  );
};
export default SearchIp;
