import React from 'react'
const iconNameList = ['CORE', 'SPINE', 'LEAF', 'SERVER', 'VIRTUAL', 'hyperNode']
export default function Legend() {
  return (
    <div className='legend' style={{
      display: 'flex',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      width: '40%',
      height: 50,
    }}>
      {iconNameList.map(name => {
        return <div className="legend-icon" key={name} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 130,
          height: '100%',
          margin: '0 5px',
          fontSize: 16,
          fontWeight: 'bold'
        }}>
          <img src={`/icon/normal-${name}.svg`} alt={name} style={{
            width: 30,
            height: 30,
            marginRight: 10
          }}></img>
          <span>{name}</span>
        </div>
      })}
    </div>
  )
}
