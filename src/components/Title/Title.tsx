import { Header, Content } from 'antd/es/layout/layout';
import React from 'react';
import { PagePropsType } from '../../type';
export default function Title(props: PagePropsType) {
  let {children, color, fontWeight, fontSize, fontFamily} = props;
  return (
    <Header style={{ display: 'flex', alignItems: 'center' }}>
      <Content style={{color, fontWeight, fontSize, fontFamily, textAlign: 'center'}}>
        {children}
      </Content>
    </Header>
  )
}
