const CUBE_DESIGN_UPLOAD_IMG = '/resource/v1/cube-design/upload-file/images'
const iconDOC = `${CUBE_DESIGN_UPLOAD_IMG}/icon-doc.png`
const iconPDF = `${CUBE_DESIGN_UPLOAD_IMG}/icon-pdf.png`
const iconPPT = `${CUBE_DESIGN_UPLOAD_IMG}/icon-ppt.png`
const iconTXT = `${CUBE_DESIGN_UPLOAD_IMG}/icon-txt.png`
import styles from "./upload-file.module.less";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { Icon } from "vant";
import { computed, defineComponent, type PropType } from "vue";
export interface FileListVo {
  id: string;
  path: string;
  type: string;
}
[];

/**
 * 文件上传组件
 * 用于处理图片和文件的上传、展示和删除功能
 */
export const UploadFile = defineComponent({
  props: {
    fileList: {
      type: Array as PropType<FileListVo[]>,
      default: () => [],
    },
    fileMaxCount: {
      type: Number,
      default: 5,
    },
    uploadType: {
      type: String as PropType<"IMAGE" | "FILE">,
      default: "FILE",
    },
    sceneCode: {
      type: String,
      default: "smallEngineering",
    },
  },
  emits: ["update:fileList"],
  setup: (props, { emit }) => {
    const type = computed(() => (fileType: string): string => {
      fileType = fileType.toLowerCase();
      if (".png/.jpeg/.jpg/.gif/.webp".includes(fileType)) {
        return "img";
      }
      if ("mp4、avi、mkv".includes(fileType)) {
        return "video";
      }
      if (".doc/.docx".includes(fileType)) {
        return "doc";
      }
      if (".xls/.xlsx".includes(fileType)) {
        return "xls";
      }
      if (".pptx/.ppt".includes(fileType)) {
        return "ppt";
      }
      if (".pdf".includes(fileType)) {
        return "pdf";
      }
      if (".txt".includes(fileType)) {
        return "txt";
      }
      return "doc";
    });
    const getFileIcon = computed(() => (fileType: string): string => {
      fileType = fileType.toLowerCase();
      if (".doc/.docx".includes(fileType)) {
        return iconDOC;
      } else if (".pdf".includes(fileType)) {
        return iconPDF;
      } else if (".pptx/.ppt".includes(fileType)) {
        return iconPPT;
      } else if (".txt".includes(fileType)) {
        return iconTXT;
      }
      return iconDOC;
    });
    const handleUploadImage = async (): Promise<void> => {
      try {
        const result =
          props.uploadType === "FILE"
            ? await cubeAppService.uploadFile(String(props.fileMaxCount - props.fileList.length), {
                sceneCode: props.sceneCode,
              })
            : await cubeAppService.uploadImage(String(props.fileMaxCount - props.fileList.length), {
                sceneCode: props.sceneCode,
              });
        const fileList = [...props.fileList, ...result];
        emit("update:fileList", fileList);
      } catch (error) {
        // eslint-disable-next-line no-console
      }
    };
    const deleteImage = (id: string): void => {
      const fileList = props.fileList.filter((item) => item.id !== id);
      emit("update:fileList", fileList);
    };
    return (): JSX.Element => (
      <div class={styles.uploadFile}>
        {props.fileList.map((item: FileListVo) => (
          <div class={styles.uploaded} key={item.id}>
            <img src={item.path} v-show={type.value(item.type) === "img"} alt="" width={60} height={60} />
            <img src={getFileIcon.value(item.type)} v-show={type.value(item.type) !== "img"} />
            <Icon
              name="clear"
              size="20px"
              color="#000"
              onClick={(e: Event) => {
                e.stopPropagation();
                deleteImage(item.id);
              }}
            />
          </div>
        ))}
        {props.fileList.length < props.fileMaxCount && (
          <div class={styles["upload"]} onClick={handleUploadImage}>
            <Icon name="plus" size="30px" color="#d9d9d9" />
          </div>
        )}
      </div>
    );
  },
});
