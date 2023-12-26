import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { useStore } from '@/store/graphStore';
import { reaction } from 'mobx';
import { StyleCfg } from '@/interface/style';
import AlarmDistributionGraph from '@/graph/AlarmDistributionGraph';
const graphCfg: StyleCfg = {
  dataName: '10000_processed.json',
  width: 1620,
  height: 764,
  // 空白填充度和强度，可暴露出来让用户配置，blankFillDegree和blankFillStrength越大，填充部分越大
  divBoxSelector: '.partition',
  emphasisName: 'cnt',
  blankFillDegree: 12,
  blankFillStrength: 1,
  nodeStyle: {
    normal: {
      radius: 8,
      opacity: 1,
      strokeWidth: 1,
      stroke: 'none',
      fill: 'none'
    },
    selected: {
      radius:8,
      opacity: 1,
      strokeWidth: 5,
      stroke: '#2B41FF',  
      fill: 'none',
    }
  },
  nodeLabelStyle: {
    stroke: 'black',
    strokeWidth: 1,
    fontSize: '8px',
    textAnchor: 'middle',
    show: 'auto',
  },
  edgeStyle: {
    normal: {
      opacity: 0.4,
      strokeWidth: 1,
      strokeColor: 'gray',
      strokeDash: 'solid',
    },
    selected: {
      opacity: 1,
      strokeWidth: 2,
      strokeColor: '#3980FE',
      strokeDash: 'solid',
    }
  },
  maskStyle: {
    normal: {
      color: (d: any) => {
        if (d.data.hierarchy === 'az') {
          return '#DCDCDC';
        } else if (d.data.hierarchy === 'pod') {
          if (d.data.name === 'cnt') {
            return '#dff6fd';
          } else {
            return '#DCDCDC';
          }
        } else {
          throw new Error("当前层级不是level2或者level3");
        }
      },
      strokeColor: (d: any) => {
        if (d.data.hierarchy === 'az') {
          return 'white';
        } else if (d.data.hierarchy === 'pod') {
          return 'white'
        } else {
          throw new Error("当前层级不是level2或者level3");
        }
      },
      strokeWidth: (d: any) => {
        if (d.data.hierarchy === 'az') {
          return 3;
        } else if (d.data.hierarchy === 'pod') {
          return 3;
        } else {
          throw new Error("当前层级不是level2或者level3");
        }
      },
      opacity: 1
    },
    selected: {
      color: '#CEDEFF',
      strokeColor: 'white',
    }
  },
  maskLabelStyle: {
    fill: (d: any) => {
      if (d.data.hierarchy === 'az') {
        return '#000';
      } else {
        return '#555';
      }
    }
  }
}
const AlarmDistribution:React.FC = () => {
  const store = useStore();
  const dispose = reaction(() => store.graphData,
  (graphData) => {
    if (!store.isCurGraphDataEmpty) {
      // 如果当前已经加载过图实例，需要先清空再重新绘制
      if (!store.isCurAlarmDistriGraphInstanceEmpty) {
        (store.curAlarmDistriGraphInstance as AlarmDistributionGraph).destory();
        store.resetAlarmDistriGraphInstance();
      }
      store.updateAlarmDistriGraphInstance(new AlarmDistributionGraph({
        ...graphCfg,
        data: graphData,
        dataName: store.datasetName,
        width: 300,
        height: 250,
        divBoxSelector: '.alarm-distribution',
      }))
    }
  })
  useEffect(() => {
    return () => {
      dispose();
    }
  })
  return (
    <div className='alarm-distribution' style={{
      width: '100%',
      height: '300px',
      marginBottom: '25px'
    }}>
      <p style={{
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#000',
        margin: '5px 0',
        lineHeight: '30px',
        height: '30px',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '5px',
        boxShadow: '0px 0px 5px gray'
      }}>Device Alarm Distribution</p>
    </div>
  )
}
export default observer(AlarmDistribution);