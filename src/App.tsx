import React, { Profiler } from 'react';
import View from '@/views/view';
const App: React.FC = () => {
  const onRenderCallback = (
    id: string, // 发生提交的 Profiler 树的 “id”
    phase: string, // "mount" （如果组件树刚加载） 或者 "update" （如果它重渲染了）之一
    actualDuration: number, // 本次更新 committed 花费的渲染时间
    baseDuration: number, // 估计不使用 memoization 的情况下渲染整棵子树需要的时间
    startTime: number, // 本次更新中 React 开始渲染的时间
    commitTime: number, // 本次更新中 React committed 的时间
    interactions: any // 属于本次更新的 interactions 的集合
  ) => {
    // console.log(id);
    // console.log(phase);
  };
  return (
    <div className="app">
      <Profiler id="view" onRender={onRenderCallback}>
        <View />
      </Profiler>
    </div>
  );
};
export default App;
