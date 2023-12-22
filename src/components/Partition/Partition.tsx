import React, { useEffect } from 'react'
import MultiLevelPartitionGraph from '@/graph/MultiLevelPartitionGraph';
import { StyleCfg } from '@/interface/style';
import { useStore } from '@/store/graphStore';
import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
const graphCfg: StyleCfg = {
  dataName: '',
  width: 1876,
  height: 1081,
  // 空白填充度和强度，可暴露出来让用户配置，blankFillDegree和blankFillStrength越大，填充部分越大
  divBoxSelector: '.partition',
  emphasisName: 'cnt',
  blankFillDegree: 14,
  blankFillStrength: 1,
  svgPadding: 10,
  nodeStyle: {
    normal: {
      radius: 12,
      opacity: 1,
      strokeWidth: 1,
      stroke: 'none',
      fill: 'none'
    },
    selected: {
      radius:12,
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
      opacity: 0.2,
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
        if (d.data.hierarchy === "az") {
          return "#F7F7F7";
        } else if (d.data.hierarchy === "pod") {
          if (d.data.name === "cnt") {
            return "#B3F0FA";
          } else {
            return "#F7F7F7";
          }
        } else {
          throw new Error("当前层级不是level2或者level3");
        }
      },
      strokeColor: (d: any) => {
        if (d.data.hierarchy === "az") {
          return "gray";
        } else if (d.data.hierarchy === "pod") {
          return "gray";
        } else {
          throw new Error("当前层级不是level2或者level3");
        }
      },
      strokeWidth: (d: any) => {
        if (d.data.hierarchy === "az") {
          return 10;
        } else if (d.data.hierarchy === "pod") {
          return 3;
        } else {
          throw new Error("当前层级不是level2或者level3");
        }
      },
      opacity: 1,
    },
    selected: {
      color: "#CEDEFF",
      strokeColor: "#fff",
      strokeWidth: 5,
      opacity: 1,
    },
  },
  maskLabelStyle: {
    fill: (d: any) => {
      if (d.data.hierarchy === 'az') {
        return '#000';
      } else {
        return '#555';
      }
    },
    opacity: 0.8,
    fontWeight: 800
  }
}
function Partition() {
  // 引入store
  const store = useStore();  
  // autorun在初始化时自动运行，以及涉及到的observer值改变的时候也运行effect函数
  // reaction在初始化时不运行，只有data函数中访问过的observer变更的时候才调用effect函数
  const dispose = reaction(() => store.graphData,
  (graphData) => {
    if (!store.isCurGraphDataEmpty) {
      // 如果当前没有graph，直接生成
      if (!store.isCurGraphInstanceEmpty) { 
        // 如果已经有graph，先清空画布，然后重置graph instance，再绘制
        (store.curGraphInstance as MultiLevelPartitionGraph).destory();
        store.resetGraphInstance();
      }
      const blankFillDegree = store.datasetName === '20000_processed.json' ? 10 : 14;
      const r = store.datasetName === '20000_processed.json' ? 8 : 12;
      store.updateGraphInstance(new MultiLevelPartitionGraph({
        ...graphCfg, 
        dataName: store.datasetName,
        data: graphData,
        blankFillDegree,
        nodeStyle: {
          normal: {
            radius: r,
            opacity: 1,
            strokeWidth: 1,
            stroke: 'none',
            fill: 'none'
          },
          selected: {
            radius: r,
            opacity: 1,
            strokeWidth: 5,
            stroke: '#2B41FF',  
            fill: 'none',
          }
        }
      }));
    }
  })
  // autorun和reaction返回一个取消响应式函数的dispose，需要在组件卸载的时候执行，以便释放该函数
  useEffect(() => {
    return () => {
      dispose();
    }
  })
  return (
    <div className='partition' style={{
      width: '100%',
      height: '100%',
    }}></div>
  )
}
export default observer(Partition);