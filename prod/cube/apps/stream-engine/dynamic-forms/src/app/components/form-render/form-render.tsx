// import { Col, Form, FormItem } from 'ant-design-vue'
// import { defineComponent } from 'vue'
// import { FormItemRender } from './form-item-render'

// export const FormRender=defineComponent({
//   setup(){
//     return ()=>
//       <>
//       {
//         initialized
//         ?<Form ref="formRef" class="process-form" laba-position="top" model={formData} rules={rules}
//         labelCol={{style: { minWidth: '120px' } }}>
//         {
//           formOptions.map((item,index)=>
//             <div key={index}>
//           {getPermission(item).show?<Col width={item.width} v-show={item.show} key={item.id}>
//           <FormItem name={item.id} label={item.title} class={{ 'group-list-components': item.name === 'GroupList' || item.props.hideLabel, 'description-component': item.name === 'Description' }}>
//           <FormItemRender v-model={formData[item.id]} config={item} formData={formData} ref="formItemRef" readonly={getPermission(item).readonly} form-ref={formRef} />
//           </FormItem>
//           </Col>
//           :<span ref="formItemRef"></span>}
//           </div>
//           )
//         }
//         <template v-for="(item, index) in formOptions">
         
//         </template>
//       </Form>:null
//       }
//       </>
  
//   }
// })