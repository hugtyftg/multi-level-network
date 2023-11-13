import Layout, { Content } from 'antd/es/layout/layout';
import React from 'react';
import { PagePropsType } from '../../type';
import Partition from '../Partition/Partition';
export default function ContentBox(props: PagePropsType) {
  const {padding, margin, minHeight, background} = props;
  return <Layout className='content-box' style={{ 
      padding: '10px',
    }}>
      <Content style={{padding, margin, minHeight, background,
            display: 'flex',
            flexDirection:  'column',
            justifyContent: 'space-between',
            alignItems: 'stretch',
      }}>
        <div className="legend" style={{
          flex: 1,
        }}>
          legend
        </div>
        <div className="partition-chart-box" style={{
          flex: 19,
        }}>
          <Partition/>
        </div>
      </Content>
    </Layout>
}
