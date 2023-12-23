import React from 'react';
import { getAssetsImgUrl } from '@/utils/fileAccessor';
const iconNameList = ['CORE', 'SPINE', 'LEAF', 'SERVER', 'VIRTUAL', 'hyperNode']
export default function Legend() {
  return (
    <div className='legend' style={{
      display: 'flex',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      width: 800,
    }}>
      {iconNameList.map(name => {
        return <div className="legend-icon" key={name} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 5px',
          fontSize: 16,
          fontWeight: 'bold'
        }}>
          {/* `../../assets/icon/normal-${name}.svg` */}
          <img src={getAssetsImgUrl(`normal-${name}`)} alt={name} style={{
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
