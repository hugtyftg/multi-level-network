import React, { Fragment } from 'react'
import Legend from '@/components/Legend/Legend'
import Partition from '@/components/Partition/Partition'
import { useStore } from '@/store/graphStore'
import ViewName from '../ViewName/ViewName';

export default function Content() {
  const store = useStore();
  return (
    <div className="content" style={{
      flex: 1,
      padding: 24,
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection:  'column',
      justifyContent: 'space-between',
      alignItems: 'stretch',
    }}>
      <div className="content-top" style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <ViewName/>
        <Legend/>
      </div>
      <div className="content-bottom" style={{
        flex: 19,
      }}>
        <Partition/>
      </div>
    </div>
  )
}