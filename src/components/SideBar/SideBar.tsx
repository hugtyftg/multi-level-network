import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { PagePropsType } from '../../type';
import './SideBar.less';
import { Button, Input, Select, Space } from 'antd';
import { GlobalOutlined, ContainerOutlined, CloudServerOutlined } from '@ant-design/icons'

export default function SideBar(props: PagePropsType) {
  const {padding, margin, background, dataNameList} = props;
  const options: any[] = dataNameList.toReversed().map((data: any) => ({
    value: data.name,
    label: data.name,
  }))
  const handleChange = () => {
    
  }
  return <Sider className='side-bar' style={{
      margin: '10px 0px 10px 10px',
    }}>
      <Content style={{padding, margin, background}}>
        <div className="select-dataset">
          <p>Please select dataset:</p>
          <Select
            defaultValue={options[0].value}
            onChange={handleChange}
            options={options}
            menuItemSelectedIcon={<ContainerOutlined/>}
          />
        </div>
        <div className="search-partition">
          <Space.Compact size="large">
            <Input addonBefore={<GlobalOutlined />} placeholder="az" />
            <Input placeholder="pod" />
            <Button type="primary">Search</Button>
          </Space.Compact>
        </div>
        <div className="search-ip">
        <Space.Compact size="large">
          <Input addonBefore={<CloudServerOutlined />} placeholder="device ip" />
          <Button type="primary">Search</Button>
        </Space.Compact>
        </div>
      </Content>
    </Sider>
}
