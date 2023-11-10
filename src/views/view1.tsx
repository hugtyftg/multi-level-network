import React, { Fragment } from 'react'
import { ContentBox, SideBar, Title } from '../components';
import { theme, Layout } from 'antd';
import { PagePropsType } from '../type';
const dataNameList = ['500', '1500', '2500', '6000', '10000', '20000'].map((v: string) => {
  return {
    name: `${v}_processed.json`,
    id: `${v}_processed.json`
  }
});
export default function View1() {
  const {
    token: { colorBgElevated: colorBgContainer },
  } = theme.useToken();
  const headerStyleObj: PagePropsType = {
    children: 'Multilevel Network Intelligent Partition Layout',
    color: colorBgContainer,
    fontWeight: 'bold',
    fontSize: 30,
    fontFamily: 'sans-serif',
  }
  const sideBarStyleObj: PagePropsType = {
    padding: 24,
    margin: 0,
    background: colorBgContainer,
  }
  const contentBoxStyleObj = {...sideBarStyleObj};

  return (
    <Fragment>
      <Layout className='view'>
        <Title className='title' {...headerStyleObj}/>
        <Layout className='main-box'>
          <SideBar {...sideBarStyleObj} dataNameList={dataNameList} />
          <ContentBox {...contentBoxStyleObj}/>
        </Layout>
      </Layout>
    </Fragment>
  );
}
