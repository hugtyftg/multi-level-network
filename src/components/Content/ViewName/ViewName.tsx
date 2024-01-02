import { ViewTypes } from '@/config/DEFAULT';
import { useStore } from '@/store/graphStore';
import { observer } from 'mobx-react-lite';
import React from 'react';
const ViewName: React.FC = () => {
  const store = useStore();
  const changeView = () => {
    let nextView: ViewTypes = (store.curViewName === 'HYPERNODE') ? 'PARTITION' : 'HYPERNODE';
    store.updateViewName(nextView);
  }
  return (
    <div className="view-name" style={{
      flex: 1,
      height: 60,
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: 'gray',
        padding: 10,
        lineHeight: '30px',
        borderLeft: '5px solid gray',
      }}>
        {store.viewName === 'PARTITION' ? 'Partition' : 'Hypernode'}
      </div>
      {/* <button onClick={changeView} style={{
        height: 30
      }}>change view</button> */}
    </div>
  );
};

export default observer(ViewName);