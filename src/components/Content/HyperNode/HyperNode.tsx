import BaseGraph from '@/graph';
import ForceGraph from '@/graph/ForceGraph';
import { group } from '@/interface/partition';
import { useStore } from '@/store/graphStore';
import { autorun, reaction } from 'mobx';
import React from 'react';
const ViewName: React.FC = () => {
  const store = useStore();
  const dispose =reaction(() => store.hyperNodeData, (hyperNodeData: group | null) => {
    if (!store.isCurHyperNodeDataEmpty && store.curViewName === 'HYPERNODE') {
      if (store.isCurGraphInstanceEmpty) {
        // 如果已经有graph，先清空画布，然后重置graph instance，再绘制
        (store.curGraphInstance as BaseGraph).destory();
        store.resetGraphInstance();
      }
      // store.updateGraphInstance(new ForceGraph({
      //   dataName: 'hyper',
      //   data: 
      // }));
    }
  })
  return (
    <div className="hyper-node-view">

    </div>
  );
};

export default ViewName;