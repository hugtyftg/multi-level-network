import BaseGraph from '@/graph';
import ForceGraph from '@/graph/ForceGraph';
import { originData } from '@/interface/partition';
import { useStore } from '@/store/graphStore';
import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
const HyperNode: React.FC = () => {
  const store = useStore();
  const dispose = reaction(() => ({
    hyperNodeData: store.hyperNodeData,
    originGraphData: store.originGraphData,
    viewName: store.viewName
  }),
  (observableObj) => {
    console.log('hypernode reaction');
    if (!store.isCurHyperNodeDataEmpty 
      && !store.isCurOriginGraphDataEmpty 
      && store.curViewName === 'HYPERNODE'
    ) {
      console.log('hypernode render');
      if (!store.isCurGraphInstanceEmpty) {
        // 如果已经有graph，先清空画布，然后重置graph instance，再绘制
        (store.curGraphInstance as BaseGraph).destory();
        store.resetGraphInstance();
      }
      let originIpLinks = (observableObj.originGraphData as originData).links;
      store.updateGraphInstance(new ForceGraph({
        dataName: 'hyper',
        data: observableObj.hyperNodeData,
        width: 1876,
        height: 1081,
        originIpLinks,
        divBoxSelector: '.hyper-node-view',
        nodeStyle: {
          normal: {

          },
          selected: {

          }
        },
        nodeLabelStyle: {

        },
        edgeStyle: {
          normal: {

          },
          selected: {

          }
        }
      }));
    }
  })
  useEffect(() => {
    return () => {
      dispose();
      if (!store.isCurGraphInstanceEmpty) {
        (store.curGraphInstance as BaseGraph).destory();
        store.resetGraphInstance();
      }
    }
  })
  return (
    <div className="hyper-node-view">

    </div>
  );
};

export default observer(HyperNode);