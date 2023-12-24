import { useStore } from '@/store/graphStore';
import React from 'react';
const ViewName: React.FC = () => {
  const store = useStore();
  return (
    <div className="view-name" style={{
      flex: 1,
      height: 60,
    }}>
      <div style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: 'gray',
        padding: 10,
        lineHeight: '30px',
        borderLeft: '5px solid gray',
      }}>
        {store.curViewName === 'PARTITION' ? 'Overview' : 'HyperNode View'}
      </div>
    </div>
  );
};

export default ViewName;