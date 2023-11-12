import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.less';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // 在strictmode下，开发模式的uesEffect和mobx的reaction会反复触发多次，生产环境下正常。
  // 这是因为为了模拟立即写在组件和重新挂载组件，帮助开发者提前发现重复挂载组件可能产生的bug
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
