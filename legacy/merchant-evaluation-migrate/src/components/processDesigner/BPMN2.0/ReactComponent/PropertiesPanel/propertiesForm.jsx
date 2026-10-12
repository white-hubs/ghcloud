
import { Button, Col, DatePicker, Form, Input, Popover, Row, Select, TimePicker } from 'antd';
// import { render } from 'react-dom';
import styles from './propertiesForm.less';

const PropertiesForm = ({ fields, onChange }) => {
  const onFieldsChange = (changedFields) => {
    if(changedFields && changedFields.length){
      let newFields = {};
      changedFields.forEach(field => {
        newFields[field.name] = field.value;
      });
      onChange(newFields);
    }
  }
  return (
    <Form
      // layout="horizontal"
      // labelCol={{span: 4}}
      layout="vertical"
      fields={fields}
      onFieldsChange={onFieldsChange}
      >
        {
          fields.map((field) =>  
            <Form.Item label={field.label} name={field.name} key={field.name}>
              <Input placeholder="节点名字"></Input>
            </Form.Item>
          )
        }
        {/* <Form.Item label="名字" name="name">
          <Input placeholder="节点名字"></Input>
        </Form.Item>
        <Form.Item label="ID" name="id" 
          rules={
            [{required: true, message: '必须有一个ID'}]
          }>
          <Input placeholder="节点ID"></Input>
        </Form.Item> */}
    </Form>
  );
};

export default PropertiesForm;