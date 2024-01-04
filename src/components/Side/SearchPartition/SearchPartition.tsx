import MultiLevelPartitionGraph from '@/graph/MultiLevelPartitionGraph';
import { useStore } from '@/store/graphStore';
import { GlobalOutlined } from '@ant-design/icons';
import { Space, Input, Button } from 'antd';
import React, { useRef } from 'react';
const SearchPartition: React.FC = () => {
  const store = useStore();
  const inputPartition1Ref: any = useRef(null);
  const inputPartition2Ref: any = useRef(null);
  const onSearchPartition = () => {
    const partition1: string = inputPartition1Ref.current.input.value;
    const partition2: string = inputPartition2Ref.current.input.value;
    (store.curGraphInstance as MultiLevelPartitionGraph).searchPartition(
      partition1,
      partition2,
      true,
      true,
      {
        nodeStyle: {
          stroke: 'blue',
          opacity: 1,
          strokeWidth: 3,
        },
        edgeStyle: {
          strokeColor: 'black',
          strokeWidth: 3,
          opacity: 1,
          strokeDash: 'solid',
        },
        maskStyle: {
          opacity: 0.6,
          color: '#80AED2',
          strokeWidth: 3,
          strokeColor: 'blue',
        },
      }
    );
  };
  return (
    <div className="search-partition">
      <Space.Compact size="large">
        <Input
          addonBefore={<GlobalOutlined />}
          placeholder="az"
          style={{
            width: '150%',
          }}
          ref={inputPartition1Ref}
        />
        <Input placeholder="pod" ref={inputPartition2Ref} />
        <Button type="primary" onClick={onSearchPartition}>
          Search
        </Button>
      </Space.Compact>
    </div>
  );
};
export default SearchPartition;
