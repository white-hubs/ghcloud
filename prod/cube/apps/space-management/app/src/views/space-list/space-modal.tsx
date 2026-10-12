import { cubeMdataService } from "@/api/service";
import { FeatureSelect } from "@/components/feature-select/feature-select";
import { StatusSelect } from "@/components/status-select/status-select";
import { FileUpload, useCubeModal } from "@ghcloud/cube-app-design";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import type { AreaRecord } from "@ghcloud/cube-mdata-service";
import type { AreaListVO } from "@ghcloud/cube-mdata-service/src/type";
import { Form, FormItem, Input, InputNumber, Textarea, message, type FormExpose } from "@ghcloud/cube-ui";
import type { OSSFile } from "@ghcloud/generic-component";
import { defineComponent, reactive, ref } from "vue";

interface Props {
  title: string;
}
export const SpaceModal = defineComponent({
  props: ["title"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>();
    const formState = reactive<{
      parentId?: string | number | null;
      id?: string | undefined;
      code?: string | undefined;
      name: string | undefined;
      introduce?: null | string;
      pictureFiles?: OSSFile[] | null;
      videoFiles?: OSSFile[] | null;
      builtUpArea?: number | null;
      statusId?: string | number | null;
      featureIds?: string | string[] | null;
    }>({
      parentId: null,
      id: undefined,
      code: undefined,
      name: undefined,
      introduce: null,
      pictureFiles: null,
      videoFiles: null,
      builtUpArea: null,
      statusId: null,
      featureIds: null,
    });
    const modalRules = {
      name: [{ required: true, message: "请输入空间名称", trigger: "blur" }],
    };
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        try {
          modalApi.setState({ confirmLoading: true });
          await formRenderRef.value?.validate();
          const { statusId, featureIds, name, introduce, pictureFiles, videoFiles } = formState;
          const pictureIds = pictureFiles?.map((item) => item.id) ?? [];
          const videoIds = videoFiles?.map((item) => item.id) ?? [];
          const params = {
            ...formState,
            name: name || "",
            statusId: Array.isArray(statusId) ? statusId.join(",") : ((statusId as string) ?? ""),
            featureIds: Array.isArray(featureIds) ? featureIds.join(",") : (featureIds ?? ""),
            areaExtend: {
              introduce: introduce || "",
              pictureFiles: pictureIds ?? [],
              videoFiles: videoIds ?? [],
            },
            builtUpArea: formState.builtUpArea as unknown as string,
            parentId: formState.parentId as unknown as string,
          };
          if (formState.id) {
            await cubeMdataService.updateArea(params as AreaRecord);
          } else {
            await cubeMdataService.insertArea(params as AreaRecord);
          }
          message.success("操作成功");
          modalApi.close();
          emit("enter");
        } catch (error) {
          message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
        } finally {
          modalApi.setState({ confirmLoading: false });
        }
      },
      onCancel: () => {
        formRenderRef.value?.resetFields();
        modalApi.close();
        emit("cancel");
      },
    });
    const getDetail = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaById(formState.id as string);
      if (res?.areaExtend) {
        const { pictureFiles, videoFiles, introduce } = res.areaExtend;
        if (pictureFiles) {
          formState.pictureFiles = Array.isArray(pictureFiles)
            ? (pictureFiles as unknown as OSSFile[])
            : [pictureFiles as unknown as OSSFile];
        }
        if (videoFiles) {
          formState.videoFiles = Array.isArray(videoFiles) ? (videoFiles as unknown as OSSFile[]) : [videoFiles as unknown as OSSFile];
        }
        if (introduce) {
          formState.introduce = introduce;
        }
      }
      formState.featureIds = res.featureIds ? res.featureIds.split(",") : null;
      formState.statusId = res.statusId || null;
    };
    const isEdit = ref(false);
    const openModal = (record?: AreaListVO, addSub?: boolean): void => {
      modalApi.open();
      isEdit.value = false;
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined;
      }
      if (addSub) {
        modalApi.setState({ title: `【${record?.name}】新增下级` });
        formState.parentId = record?.id ?? null;
      } else {
        if (record) {
          isEdit.value = true;
          modalApi.setState({ title: `编辑${props.title}` });
          Object.assign(formState, record);
          getDetail();
        } else {
          modalApi.setState({ title: `新增${props.title}` });
        }
      }
    };
    expose({
      openModal,
    });
    const modalSlots = {
      default: (): JSX.Element => (
        <div style={{ "max-height": "500px", "overflow-y": "auto" }}>
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: "100px" } }}>
            {isEdit.value && <FormItem label="空间编号"> {formState.code ?? "--"} </FormItem>}
            <FormItem label="空间名称" name="name">
              <Input v-model:value={formState.name} placeholder="请输入空间名称" />
            </FormItem>
            <FormItem label="空间状态" name="statusId">
              <StatusSelect v-model:value={formState.statusId} />
            </FormItem>
            <FormItem label="空间特征" name="featureIds">
              <FeatureSelect v-model:value={formState.featureIds} />
            </FormItem>
            <FormItem label="空间面积(m²)" name="builtUpArea">
              <InputNumber v-model:value={formState.builtUpArea} precision={2} placeholder="请输入空间面积(m²)" />
            </FormItem>
            <FormItem label="空间介绍" name="introduce">
              <Textarea v-model:value={formState.introduce} placeholder="请输入空间介绍" maxlength={200} />
            </FormItem>
            <FormItem label="空间图片" name="pictureFiles">
              <FileUpload
                sceneCode={GLOBAL_SCENE_CODE.spaceList}
                v-model:value={formState.pictureFiles}
                showText={true}
                maxCount={1}
                type="picture-card"
                size={100}
                customText="请上传图片|单个附件最大支持100MB"
                typeList={[".png", ".jpg", ".jpeg"]}
              />
            </FormItem>
            <FormItem label="视频介绍" name="videoFiles">
              <FileUpload
                sceneCode={GLOBAL_SCENE_CODE.spaceList}
                v-model:value={formState.videoFiles}
                showText={true}
                maxCount={1}
                type="picture-card"
                size={300}
                customText="请上传视频|单个附件最大支持300MB"
                typeList={[".mp3", ".mp4"]}
              />
            </FormItem>
          </Form>
        </div>
      ),
    };
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
