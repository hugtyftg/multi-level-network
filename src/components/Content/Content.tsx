import React, { Fragment } from 'react'
import Legend from '@/components/Legend/Legend'
import Partition from '@/components/Partition/Partition'

export default function Content() {
  return <div className="content" style={{
  flex: 1,
  padding: 24,
  backgroundColor: '#fff',
  display: 'flex',
  flexDirection:  'column',
  justifyContent: 'space-between',
  alignItems: 'stretch',
}}>
  <div className="legend" style={{
    flex: 1,
  }}>
    <Legend/>
  </div>
  <div className="partition-chart-box" style={{
    flex: 19,
  }}>
    <Partition/>
  </div>
</div>
}