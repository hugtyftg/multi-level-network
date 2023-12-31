import React from 'react';
import Legend from '@/components/Content/Legend/Legend';
import Partition from '@/components/Content/Partition/Partition';
import ViewName from '@/components/Content/ViewName/ViewName';
import HyperNode from '@/components/Content/HyperNode/HyperNode';
import { useStore } from '@/store/graphStore';
import { observer } from 'mobx-react-lite';
function Content() {
  const { curViewName } = useStore();
  return (
    <div
      className="content"
      style={{
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
      }}
    >
      <div
        className="content-top"
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <ViewName />
        <Legend />
      </div>
      <div
        className="content-bottom"
        style={{
          flex: 19,
        }}
      >
        {curViewName === 'PARTITION' ? <Partition /> : <HyperNode />}
      </div>
    </div>
  );
}
export default observer(Content);
