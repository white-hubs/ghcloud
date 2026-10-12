import { defineComponent } from 'vue'
import { NModal,type ModalProps } from 'naive-ui'
interface Ins extends ModalProps{
  modalStyle:object
}
export default defineComponent({
  props:{
   modalStyle:{
      type:Object,
      default:()=> {return {} }
    },
    positiveText:String
  },
  setup (props: Ins, { emit, slots }) {
    return () => <NModal {...props} style={props.modalStyle} >{slots}</NModal>
  }
})
