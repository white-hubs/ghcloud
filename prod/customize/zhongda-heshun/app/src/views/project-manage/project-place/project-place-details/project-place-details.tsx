import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui/src/components/form/form'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import { Button, message, Textarea } from '@ghcloud/cube-ui'
import { cubeZhongdaHeshunService } from '@/api/service'
import { useRoute } from 'vue-router'
import { CubeLayout, FileUpload } from '@ghcloud/cube-app-design'
import type { OSSFile } from '@ghcloud/cube-app-design/src/business-components/file-upload/file-upload'
import { ProjectPlaceTypeSelect } from '@/components/project-place-type-select/project-place-type-select'
import { ProjectSelect } from '@/components/project-select/project-select'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { DMap } from '../../project-library/map'
import { DivisionTree } from '@/components/division-tree/division-tree'

export const ProjectPlaceDetails = defineComponent({
  setup: () => {
    const { id, action } = useRoute().query
    const readonly = action === 'details'
    const goBack = (): void => {
      history.back()
    }
    const title = computed(() => {
      let res = '场所信息'
      if (action === 'add') {
        res += ' / 新增'
      } else if (action === 'edit') {
        res += ' / 编辑'
      } else {
        res += ' / 详情'
      }
      return res
    })

    const formData = ref<{
      id: string;
      projectId: string | null;
      projectName?: string;
      placeName: string;
      placeTypeId: string | null;
      placeTypeName?: string;
      placeDetail?: string | null;
      longitude?: string;
      latitude?: string;
      lonAndLat?: string | null;
      placeDescription?: string;
      division: string[] | null;
      files: OSSFile[];
    }>({
      id: '',
      projectId: null,
      projectName: '',
      placeName: '',
      placeTypeId: null,
      placeTypeName: '',
      placeDetail: null,
      longitude: '',
      latitude: '',
      lonAndLat: null,
      placeDescription: '',
      division: null,
      files: [],
    })
    // const divisionTree = ref<Division[]|null>([])
    const dMapData = reactive<{
      value: string;
      address: string;
    }>({
      // value: '104.05906925176734,30.589318900275615',
      // address: '四川省成都市武侯区桂溪街'
      value: '',
      address: ''
    })
    /** 表单实例 */
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed(() => {
      const res: DynamicFormRenderOptionProps[] = [
        { title: '场所名称', key: 'placeName', width: 46, componentName: 'TextInput', required: true, readonly: readonly },
        { title: '场所类型', key: 'placeTypeId', width: 46, customComponent: ProjectPlaceTypeSelect, required: true, readonly: readonly, componentProps: { options: readonly ? [{ label: formData.value.placeTypeName, value: formData.value.placeTypeId }] : undefined } },
        { title: '所属项目', key: 'projectId', width: 46, customComponent: ProjectSelect, required: true, readonly: readonly, componentProps: { options: readonly ? [{ label: formData.value.projectName, value: formData.value.projectId }] : undefined } },
        { title: '行政区域', key: 'division', width: 46, customComponent: DivisionTree, required: true, readonly: readonly },
        { title: '详细位置', key: 'placeDetail', width: 46, componentName: 'TextInput', readonly: readonly },
        { title: '经纬度', key: 'lonAndLat', width: 46, customComponent: <DMap showLat={true} address={dMapData.address} value={dMapData.value}
          onUpdate:value={(val: string) => {
            dMapData.value = val
          } }
          onAddressName={(val: string) => {
            dMapData.address = val
          } }
        />, readonly: readonly },
        { title: '现场图片', key: 'files', width: 46, customComponent: FileUpload, componentProps: { readonly: readonly, sceneCode: GLOBAL_SCENE_CODE.disinfectionkeyplace, type: 'picture-card', typeList: ['.jpg', '.png', '.svg'], customText: '支持jpg,png,svg格式,单个附件最大支持100MB', showText: true, multiple: true, maxCount: 5 }, readonly: readonly },
        { title: '备注', key: 'placeDescription', width: 46, customComponent: readonly ? <span>{formData.value.placeDescription || '--'}</span> : <Textarea />, readonly: readonly },
      ]
      return res
    })

    const customValidatesRules = computed(() => {
      const res: Record<string, RuleObject> = {
        placeTypeId: { required: true, trigger: 'change', message: '请选择场所类型' } satisfies RuleObject,
        projectId: { required: true, trigger: 'change', message: '请选择所属项目' } satisfies RuleObject,
        division: { required: true, trigger: 'change', message: '请选择区域' } satisfies RuleObject,
      }
      return res
    })
    watch(() => formData.value.placeTypeId, () => {
      if (!readonly) {
        dynamicFormRenderRef.value?.formRef.clearValidate('placeTypeId')
      }
    })
    watch(() => formData.value.projectId, () => {
      if (!readonly) {
        dynamicFormRenderRef.value?.formRef.clearValidate('projectId')
      }
    })

    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate()
      await dynamicFormRenderRef.value?.formRef.validate()
      try {
        saveLoading.value = true
        const params = {
          ...formData.value,
          imgs: formData.value.files.map((item) => item.id).join(','),
          placeAddress: '',
          province: '',
          city: '',
          region: ''
        }
        switch (formData.value.division?.length) {
          case 3:
            params.province = formData.value.division[0]
            params.city = formData.value.division[1]
            params.region = formData.value.division[2]
            break
          case 2:
            params.province = formData.value.division[0]
            params.city = formData.value.division[1]
            break
          case 1:
            params.province = formData.value.division[0]
            break
        }
        params.longitude = dMapData.value?.split(',')[0] ?? ''
        params.latitude = dMapData.value?.split(',')[1] ?? ''
        params.placeAddress = dMapData.address
        if (action === 'add') {
          await cubeZhongdaHeshunService.addProjectPlace(params)
        } else {
          await cubeZhongdaHeshunService.updateProjectPlace(params)
        }
        message.success('操作成功')
        history.back()
      } catch {
        message.error('操作失败')
      } finally {
        saveLoading.value = false
      }
    }

    const init = ref(false)
    onMounted(async () => {
      if (action !== 'add') {
        if (id) {
          const response = await cubeZhongdaHeshunService.getProjectPlaceDetails(id as string)
          formData.value = {
            ...response,
            division: [response.province, response.city, response.region]
          }

          dMapData.address = response.address ?? ''
          if (response.longitude && response.latitude){
            formData.value.lonAndLat = `${response.longitude},${response.latitude}`
            dMapData.value = `${response.longitude},${response.latitude}`

          }
        }
      }
      init.value = true
      // const res = await cubeZhongdaHeshunService.getDivisionTree()
      // divisionTree.value = res

    })


    const layoutSlots = {
      'layout-content': (): JSX.Element | undefined => {
        if (!init.value) {
          return
        }
        return (
          <DynamicFormRender
            formOptions={options.value}
            customValidatesRules={customValidatesRules.value}
            labelWidth='150px'
            v-model:formData={formData.value}
            ref={dynamicFormRenderRef}
            style={{ margin: '20px' }}
          />
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button onClick={goBack}>返回</Button>
            {action !== 'details' && <Button type='primary' style={{ marginLeft: '10px' }} loading={saveLoading.value} onClick={save}>保存</Button>}
          </>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <CubeLayout title={title.value} v-slots={layoutSlots} />
      </>

  }
})