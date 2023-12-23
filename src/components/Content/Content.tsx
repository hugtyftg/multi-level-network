import React, { Fragment } from 'react'
import Legend from '@/components/Legend/Legend'
import Partition from '@/components/Partition/Partition'
import { useStore } from '@/store/graphStore'

export default function Content() {
  const store = useStore();
  return <div className="content" style={{
  flex: 1,
  padding: 24,
  backgroundColor: '#fff',
  display: 'flex',
  flexDirection:  'column',
  justifyContent: 'space-between',
  alignItems: 'stretch',
}}>
  <div className="view-bar" style={{
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
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
    <div className="legend">
      <Legend/>
    </div>
  </div>
  <div className="partition-chart-box" style={{
    flex: 19,
  }}>
    <Partition/>
  </div>
</div>
}