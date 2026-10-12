import React, { useState, useEffect } from 'react';
// import { connect } from 'umi';
import { Button, Card, Col, DatePicker, Form, Input, Popover, Row, Select, TimePicker } from 'antd';

import styles from './propertiesPanel.less'

import PropertiesForm from './propertiesForm.jsx';

import { customDescriptors } from "../../config.default";
const fieldNames = [
  '$type',
  'name',
  'id',
  ...customDescriptors.customProperties.types[1].properties.map( t => t.name )
];
// TODO 怎么关联customDescriptors和fields? 根据element.type 来生成fields
/**
 * createFiled 生产 From.item 需要的field
 * @param {String} name  
 * @param {String} type 类型,通过类型用不同的input
 * @param {Boolean} isRequired 是否必须, 空校验
 * @param {Array|String} valueResources 备选值
 * @param {Array|String|any} defaultValue 默认值
 */
function createFiled(name, type, isRequired, valueResources, defaultValue){
  let valueList, valueListUrl;
  if(valueResources){
    if(Array.isArray(valueResources)){
      return {
        name,
        type,
        isRequired,
        valueList: valueResources,
        defaultValue,
      }
    }else if(typeof valueResources === 'string'){
      return {
        name,
        type,
        isRequired,
        valueListUrl: valueResources,
        defaultValue,
      }
    }
  }
  return {
    name,
    type,
    isRequired,
    defaultValue,
  };
}
function getDefaultFields(){
  return [
    createFiled('name', 'string', false),
    createFiled('id', 'string', true),
  ]
}
const fieldsMap = {
  'process': {
    fields: [
      ...getDefaultFields(),
      createFiled('isExecutable', 'boolean', false),
      createFiled('type', 'string', true, ['a', 'b', 'c'], 'a'),
      // { name: 'isExecutable', type: 'boolean', required: false },
      // { name: 'type', type: 'string', required: true, valueList: []},
    ],
  },
  'startEvent': {
    fields: [
      ...getDefaultFields(),
    ],
  },
  'userTask': {
    fields: [
      ...getDefaultFields(),
      createFiled('assignee', 'string', true, ['张三', '李四', '王五'], '张三'), // 任务所属用户,只能指定用户完成这个任务,即任务办理人
      createFiled('candidateUsers', 'array', true, ['张三', '李四', '王五'], ['张三', '王五']), // 多个任务办理人
      createFiled('candidateGroups', 'array', true, ['一组', '二组', '三组'], ['一组']), // 任务处理人候选组,处理人必须在这个组内
      createFiled('exclusive', ), // 独家的,好像是在排它性网关中使用,意思应该是在有并行分支情况下,只会走其中一条
      createFiled('dueDate', 'date', true, null, 'nextDay'), // 任务到期日期
      createFiled('priority', 'number', true, null, 100), // 任务到期日期
      // { name: 'assignee', type: 'string', required: true}, // 任务所属用户,只能指定用户完成这个任务,即任务办理人
    ],
  },
  'taskListener': {
    fields: [
      
    ]
  }
};
/**
 * 这里的fields 还差一些东西
 * 理想中的样子: 
cosnt fields = [
  {
    name: 'xxx', // field 名字
    value: 'xxx', // 当前值 可以是各种数据类型
    type: 'string', // 指定数据类型 方便在Form.item里面选择用哪种输入框 input select checkbox radio switch 等等
    valueList: [], // 待选的数据, 针对select,checkbox等等, 
    valueListUrl: 'xxx', // 当待选数据是动态或者太多,可以考虑动态ajax加载?
  },
  // {...}
]
 */

function PropertiesPanel({modeler}) {
  const [element, setElement] = useState(null);
  const [fields, setFields] = useState([]);
  // const fields = []; 
  
  useEffect(() => {    
    const func = (e) => {
      const element = e.newSelection[0] || null;
      setElement(element);
      
      const fields = [
        // {name: 'name', value: 'XXLLKK'},
        // {name: 'id', value: 'LKJ_1332'},
      ];
      if(element && element.businessObject){
        const elType = element.type;
        const businessObject = element.businessObject;
        const keys = Object.keys(businessObject).sort();
        keys.forEach((key) => {
          if(!fieldNames.includes(key)){
            return;
          }
          fields.push({
            name: key,
            label: '汉化' + key,
            type: '暂时没有',
            value: businessObject[key],
          })
        });
        
      }
      setFields(fields);
    }
    modeler.on('selection.changed', func);
    return () => {
      modeler.off('selection.changed', func);
    }
  });
  const modeling = modeler.get('modeling');
    return element 
      ?<div className={styles.main}>
        <Card title="属性面板" className={styles.card} bordered={false}>
          <PropertiesForm element={element} fields={fields} 
          onChange={ (newFields) => {
              modeling.updateProperties(element, newFields);

            } }
            ></PropertiesForm>
        </Card>
      </div>
     :<div className={styles.main}>
          <Card title="属性面板" className={styles.card} bordered={false}>
          </Card>
        </div>;
}

export default PropertiesPanel;
