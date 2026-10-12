import { defineComponent, ref, watch } from 'vue'
import { Button, Dialog, showNotify } from 'vant'
import { VueSignaturePad } from 'vue-signature-pad'
import styles from './signature.module.less'
export const Signature = defineComponent({
  name: 'Signature',
  emits: ['confirm', 'cancel'],
  setup (props, { emit, expose }) {
    const signaturePad = ref()
    const visible = ref(false)
    const onConfirm = () => {
      const { isEmpty, data } = signaturePad.value.saveSignature()
      if (!isEmpty) {
        emit('confirm', data)
        clearSignature()
      }
    }

    const onCancel = () => {
      emit('cancel')
      clearSignature()
    }
    const onBeforeClose = (action: string): boolean => {
      const isEmpty = signaturePad.value.isEmpty()
      if (action === 'confirm') {
        isEmpty && showNotify({ type: 'warning', message: '请手写签名' })
        return !isEmpty
      } else {
        return true
      }
    }
    const clearSignature = () => {
      signaturePad.value && signaturePad.value?.clearSignature()
    }
    const openDialog = () => {
      clearSignature()
      visible.value = true
    }
    const closeDialog = () => {
      clearSignature()
      visible.value = false
    }
    expose({
      clearSignature,
      openDialog,
      closeDialog
    })
    return () => (
      <Dialog
        v-model:show={visible.value}
        title='交接确认'
        show-cancel-button
        confirm-button-text='提交'
        onConfirm={onConfirm}
        onCancel={onCancel}
        class={styles.signatureDialog}
        beforeClose={onBeforeClose}
      >
        <div class={styles.signatureContainer}>
          <div class={styles.signatureLabel}>签名:</div>
          <div class={styles.signaturePadWrapper}>
            <VueSignaturePad
              ref={signaturePad}
              width='100%'
              height='200px'
              id='signature-pad'
            />
            <div class={styles.signaturePlaceholder}>手写签名</div>
          </div>
          <Button size='small' onClick={clearSignature} class={styles.clearButton}>
            清除
          </Button>
        </div>
      </Dialog>
    )
  }
})