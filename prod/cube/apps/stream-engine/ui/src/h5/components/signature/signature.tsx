import { defineComponent, reactive, ref, watch } from 'vue'
import {Button, CellGroup, Dialog, Field, Form, Popup } from 'vant'
import { VueSignaturePad } from 'vue-signature-pad'
import './signature.less'
export const Signature = defineComponent({
  emits:['signaturePadConfirm','signFormSubmit','cancelSubmit'],
  props:{
    /** 是否需要签名 */
    needApprovalText:{
      type:Boolean,
      default:true
    },
    showSignature:{
      type:Boolean,
      default:true
    },
    /** 是否需要审批意见 */
    needApprovalSign:{
      type:Boolean,
      default:true
    },
    /** 获取签名 */
    file:{
      type:Object,
      default:()=>{
        return {id:'',path:''}
      }
    }
  },
  setup (props,{emit}) {
    const showPopup = ref(true)
    const showSignPad = ref(false) // 纯H5手写签名面板
    const signPic = ref('') //签名回显图片
    const subLoading = ref(false)
    const signPadFormRef = ref()
    const signaturePad = ref();
    /** 审批意见数据 */
    const formState = reactive({sign: '',opinion: ''})
    //提交审批
    const handleSignFormSubmit = async () => {
      signPadFormRef.value.validate().then(async () => {
        try {
          subLoading.value = true
          const params: { [key: string]: any } = {}
          if (props.needApprovalText) {
            params.text = formState.opinion
          }
          if (props.needApprovalSign) {
            params.sign = formState.sign
          }
          //批量审核
          signPadFormRef.value?.resetValidation()
          showPopup.value = false
          emit('signFormSubmit',formState)
        } catch (error) {
        } finally {
          subLoading.value = false
        }
      })
    }
    //取消审批
    const cancelSubmit= () => {
      showPopup.value = false
      emit('cancelSubmit',true)
    }
    //将base64转换为文件对象
    const dataUrlToFile=(dataUrl: string, filename: string) =>{
      let arr = dataUrl.split(",");
      //@ts-ignore
      let mime = arr[0].match(/:(.*?);/)[1];
      let bstr = atob(arr[1]);
      let n = bstr.length;
      let u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      //转换成file对象
      return new File([u8arr], filename, { type: mime });
    }
    // H5 手写签名回调
    const signaturePadConfirm = async (action:string) => {
      if(action==='confirm'){
        const { isEmpty, data } = signaturePad.value.saveSignature();
        if (isEmpty) {
          return false  
        }
        let fileObj = dataUrlToFile(data, "sign-" + new Date().valueOf() + ".png");
        const payload = {
          businessKey: "maintain",
          file: fileObj,
        }
        emit('signaturePadConfirm',payload)
        return true
      }else{
        // signaturePad.value.clearSignature()
        return true
      }
    }
    //清除签名
    const clearWriteSign=()=>{
      signaturePad.value?.clearSignature()
      signPic.value=''
      formState.sign=''
    }  
    watch(()=>props.file,()=>{
      signPic.value = props.file.path
      formState.sign=props.file.id
    },{deep:true,immediate:true})      
    watch(()=>props.showSignature,()=>{
      showPopup.value=props.showSignature
    })          
    return () =>
      <>
        <Popup show={showPopup.value} position="bottom" class="operate-pop">
          <Form ref={signPadFormRef}>
            <CellGroup inset>
              {
                props.needApprovalText
                ?<Field v-model={formState.opinion} name="审批意见" label="审批意见" type="textarea"
                  placeholder="请输入审批意见" class="cube-input-textarea" label-width="18vw" />
                :null
              }
              {
                props.needApprovalSign?
                <Field  
                  v-model={formState.sign}
                  name="手写签名" 
                  required 
                  label="手写签名" 
                  placeholder="请手写签名"
                  rules={[{ required: true, message: '请手写签名' }]} 
                  label-width="18vw" 
                  class="cube-input-signPad"
                  v-slots={{input:()=><div class="sign-area" onClick={()=>{showSignPad.value=true}}>
                    {signPic.value?<img src={signPic.value}/>:<span>轻触开始签名</span>}
                  </div>}}
                  >
                  </Field>
                :null
              }
              <div class="sign-btn" v-show={props.needApprovalSign}>
                <div onClick={clearWriteSign}>清除签名</div>
              </div>
            </CellGroup>
            <div class="sub-btn">
            <Button  onClick={cancelSubmit}>
                取消
              </Button>
              <Button  type="primary" loading={subLoading.value} onClick={handleSignFormSubmit}>
                提交
              </Button>
            </div>
          </Form>
        </Popup>
        <Dialog v-model:show={showSignPad.value} title="手写签名" show-cancel-button before-close={signaturePadConfirm}>
          <VueSignaturePad id="signature" width="100%" height="40vh" ref={signaturePad} />
        </Dialog>
      </>
  }
})