import styles from "./index.module.less";
import { cubeFileService } from "@/api/server";
import { cubeGridManagementService } from "@/api/server";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { Button, showNotify } from "vant";
import { defineComponent, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
// @ts-expect-error
import { VueSignaturePad } from "vue-signature-pad";
//将base64转换为文件对象
export const dataUrlToFile = (dataUrl: string, filename: string) => {
  let arr = dataUrl.split(",");
  //@ts-expect-error
  let mime = arr[0].match(/:(.*?);/)[1];
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  //转换成file对象
  return new File([u8arr], filename, { type: mime });
};
export const Signature = defineComponent({
  setup: () => {
    const signaturePad = ref();
    const route = useRoute();
    const router = useRouter();
    const redirectPath = String(route.query.redirect || "");
    const activeTab = String(route.query.active || "");
    const backSteps = Number(route.query.backSteps || 0);
    const state = reactive({
      signature: "",
      formState: {
        takeSignFileId: "",
      },
    });
    const clearSignature = () => {
      signaturePad.value && signaturePad.value?.clearSignature();
    };
    const onConfirm = async () => {
      const { isEmpty, data } = signaturePad.value.saveSignature();
      if (isEmpty) {
        showNotify({ type: "warning", message: "请手写签名" });
        return;
      }
      state.signature = data;
      await uploadSignature();
      await cubeGridManagementService.receiveShift({
        ...state.formState,
        id: route.query.id as string,
      });
      showNotify({ type: "success", message: "交接成功" });
      if (backSteps > 0) {
        router.go(-backSteps);
      } else if (redirectPath) {
        router.replace({ path: redirectPath, query: activeTab ? { active: activeTab } : undefined });
      } else {
        router.back();
      }
    };
    const uploadSignature = async (): Promise<void> => {
      try {
        let fileObj = dataUrlToFile(state.signature, "sign-" + new Date().valueOf() + ".png");
        const res = await cubeFileService.uploadFile({
          file: fileObj,
          businessKey: "maintain",
          sceneCode: GLOBAL_SCENE_CODE.gridManagement,
        });
        if (res) {
          state.formState.takeSignFileId = res.id;
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };
    return (): JSX.Element => (
      <>
        <div class={styles.signatureContainer}>
          <div class={styles.signatureLabel}>签名:</div>
          <div class={styles.signaturePadWrapper}>
            <VueSignaturePad ref={signaturePad} width="100%" height="200px" id="signature-pad" />
            <div class={styles.signaturePlaceholder}>手写签名</div>
          </div>
          <div class={styles.buttons}>
            <Button round block size="small" onClick={clearSignature} class={styles.clearButton}>
              清除
            </Button>
            <Button type="primary" round block size="small" onClick={onConfirm} class={styles.clearButton}>
              确定
            </Button>
          </div>
        </div>
      </>
    );
  },
});
