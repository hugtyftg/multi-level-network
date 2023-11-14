import React from 'react'
import { Side, Content, Header } from '../components'

export default function View() {
  return (
    <div className='view' style={{
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Header/>
      <div className="main" style={{
        flex: 1,
        backgroundColor: '#f5f5f5',
        width: 2284,
        margin: 10,
        display: 'flex',
      }}>
        <Side/>
        <Content/>
      </div>
    </div>
  )
}
