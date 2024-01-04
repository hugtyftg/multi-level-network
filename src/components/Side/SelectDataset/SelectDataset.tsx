import React from 'react';
import { Select } from 'antd';
import { useStore } from '@/store/graphStore';
import { ContainerOutlined } from '@ant-design/icons';
const SelectDataset: React.FC = () => {
  const store = useStore();
  const options: Array<{ value: string; label: string }> =
    store.allDatasetNames.map((data: { name: string; id: string }) => ({
      value: data.name,
      label: data.name,
    }));
  const onSelectDataset = (value: any) => {
    store.updateDatasetName(value);
  };
  return (
    <div className="select-dataset">
      <p>Please select dataset:</p>
      <Select
        defaultValue={options[0].value}
        onChange={(value) => onSelectDataset(value)}
        options={options}
        menuItemSelectedIcon={<ContainerOutlined />}
      />
    </div>
  );
};

export default SelectDataset;
