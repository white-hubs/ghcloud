import { computed, defineComponent, nextTick, onMounted, reactive, ref, watch, type PropType } from 'vue'
import styles from './basic-info.module.less'
import { Form, FormItem, Input, Row, Col, DatePicker, Select, Textarea, DateRangePicker, type FormInstance } from '@ghcloud/cube-ui'
import { VerticalLine, UserPickerInput, DeptTreeSelect } from '@ghcloud/generic-component'
import { ProgressTable } from './components/progress-table/progress-table'
import { Result } from './components/result/result'
import type { SuperviseDetailVo, SuperviseProgressVo } from '@/api/type'
import { cubeSmallEngineeringService } from '@/api/server'
import dayjs from 'dayjs'
import { FileUpload } from '@ghcloud/cube-app-design'
import { useRoute } from 'vue-router'
import { trackDownList } from '@/api/supervise'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
interface OptionVo {
  name: string;
  id: string;
}
interface FormStateVo {
  projectName: string;
  typeId: string;
  completionTime: string;
  stallCode?: string;
  stallLiaison?: string;
  stallMobile?: string;
  partyBMobile?: string;
  safetyDockUserId?: string;
  constructionSite: string;
  superviseDep: string;
  constructB: string;
  partyB: string;
  superviseUsers: string;
  remarks: string;
  duration: string[];
  projectFiles: string;
}
export const BasicInfo = defineComponent({
  props: {
    info: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    },
    details: {
      type: Object as PropType<SuperviseDetailVo>,
      default: () => ({})
    }
  },
  setup: (props, { expose }) => {
    const route = useRoute()
    const formRef = ref<FormInstance>()
    const state = reactive<{
      formState: FormStateVo;
      files: { id: string; name: string; path: string; }[];
      users: OptionVo[];
      safetyDockUsers: OptionVo[];
      dataSource: SuperviseProgressVo[];
      superviseDepIds: string[];
      typeOptions: OptionVo[];
    }>({
      dataSource: [],
      formState: {
        projectName: '',
        typeId: '',
        constructB: '',
        partyB: '',
        duration: [],
        completionTime: '',
        superviseDep: '',
        constructionSite: '',
        superviseUsers: '',
        remarks: '',
        projectFiles: '',
        stallCode: '',
        stallLiaison: '',
        stallMobile: '',
        partyBMobile: ''
      },
      files: [],
      users: [],
      safetyDockUsers: [],
      superviseDepIds: [],
      typeOptions: []
    })
    const rules = {
      projectName: [
        {
          required: true,
          message: '请输入小散工程名称',
          trigger: 'blur'
        }
      ],
      typeId: [
        {
          required: true,
          message: '请选择工程类型',
          trigger: 'blur'
        }
      ],
      duration: [
        {
          required: true,
          message: '请选择工期时间',
          trigger: 'blur'
        }
      ],
      constructB: [
        {
          required: true,
          message: '请输入建设方',
          trigger: 'blur'
        }
      ],
      partyB: [
        {
          required: true,
          message: '请输入施工方',
          trigger: 'blur'
        }
      ],
      constructionSite: [
        {
          required: true,
          message: '请输入施工地点',
          trigger: 'blur'
        }
      ],
      superviseDep: [
        {
          required: true,
          message: '请选择监管部门',
          trigger: 'blur'
        }
      ]
    }
    const submit = async (): Promise<void> => {
      state.formState.superviseUsers = state.users.map(e => {
        return e.id
      }).join(',')
      state.formState.projectFiles = state.files.map(e => {
        return e.id
      }).join(',')
      state.formState.safetyDockUserId = state.safetyDockUsers.map(e => {
        return e.id
      }).join(',')
      state.formState.superviseDep = state.superviseDepIds.join(',')
      await formRef.value?.validate()
      route.query.edit
        ? await cubeSmallEngineeringService.updateProjectSupervise({
          ...state.formState,
          duration: state.formState.duration.join(',')
        })
        : await cubeSmallEngineeringService.createProjectSupervise({
          ...state.formState,
          duration: state.formState.duration.join(',')
        })
      history.back()
    }
    watch(() => state.users, () => {
      state.formState.superviseUsers = state.users.map(e => {
        return e.id
      }).join(',')
      nextTick(() => {
        !props.info && formRef.value?.validateFields(['superviseUsers'])
      })
    })
    watch(()=>state.safetyDockUsers, ()=>{
      state.formState.safetyDockUserId = state.safetyDockUsers.map(e => {
        return e.id
      }).join(',')
      nextTick(() => {
        !props.info && formRef.value?.validateFields(['safetyDockUserId'])
      })
    })
    watch(()=>state.superviseDepIds, ()=>{
      state.formState.superviseDep = state.superviseDepIds.join(',')
      nextTick(() => {
        !props.info && formRef.value?.validateFields(['superviseDep'])
      })
    })
    watch(() => props.details, () => {
      if (props.details.id) {
        state.formState = {
          ...props.details,
          projectFiles: props.details.checkFiles.map((item: { id: string; }) => item.id).join(','),
          superviseUsers: props.details.superviseUser.map((item: { id: string; }) => item.id).join(','),
          safetyDockUserId: props.details.safetyDockUserId ?? '',
          completionTime: props.details.completionTime ? dayjs(props.details.completionTime).format('YYYY-MM-DD') : '',
          typeId: props.details.projectType,
          duration: props.details.duration ? props.details.duration.split(',') : [],
          superviseDep: props.details?.superviseDepList?.map((item) => item.id).join(','),
        }
        state.users = props.details.superviseUser
        state.safetyDockUsers = props.details.safetyDockUser ?? []
        state.superviseDepIds = props.details.superviseDepList?.map((item) => item.id) ?? []
        state.files = props.details.projectFiles as { id: string; name: string; path: string; }[]
      }
    })
    const progressDataSource = computed(() => {
      return state.dataSource.filter(item => item.operationCode === 'FEEDBACK')
    })
    const checkDataSource = computed(() => {
      return state.dataSource.filter(item => item.operationCode !== 'FEEDBACK')
    })
    const getProgressList = async (): Promise<void> => {
      if (!props.id) return
      const result = await trackDownList(props.id)
      state.dataSource = result.data
    }

    const getTypeList = async (): Promise<void> => {
      const result = await cubeSmallEngineeringService.getProjectTypeList()
      state.typeOptions = result
    }
    onMounted(() => {
      getTypeList()
      getProgressList()
    })
    expose({
      submit, getProgressList
    })
    return (): JSX.Element => (
      <div class={styles.container}>
        <VerticalLine title='基本信息' />
        <Form
          model={state.formState}
          ref={formRef}
          rules={rules}
          style={{
            marginTop: '12px'
          }} labelCol={{
            style: {
              width: '120px'
            }
          }}
        >
          <Row>
            <Col span={12}>
              <FormItem label='小散工程名称' name='projectName'>
                <Input maxlength='50' disabled={props.info} v-model:value={state.formState.projectName} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='工程类型' name='typeId'>
                <Select disabled={props.info} v-model:value={state.formState.typeId} allowClear fieldNames={{ label: 'name', value: 'id' }} options={state.typeOptions} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='工程时间' name='completionTime'>
                <DatePicker disabled={props.info} v-model:value={state.formState.completionTime} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='工期' name='duration'>
                <DateRangePicker disabled={props.info} v-model:value={state.formState.duration} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='建设方' name='constructB'>
                <Input disabled={props.info} maxlength={50} showCount={false} v-model:value={state.formState.constructB} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='施工地点' name='constructionSite'>
                <Input disabled={props.info} maxlength={50} showCount={false} v-model:value={state.formState.constructionSite} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='施工方' name='partyB'>
                <Input disabled={props.info} maxlength={50} showCount={false} v-model:value={state.formState.partyB} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='施工方联系方式' name='partyBMobile'>
                <Input disabled={props.info} maxlength={50} showCount={false} v-model:value={state.formState.partyBMobile} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='档位号' name='stallCode'>
                <Input disabled={props.info} maxlength={50} showCount={false} v-model:value={state.formState.stallCode} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='档位联系人' name='stallLiaison'>
                <Input disabled={props.info} maxlength={50} showCount={false} v-model:value={state.formState.stallLiaison} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='档位联系方式' name='stallMobile'>
                <Input disabled={props.info} maxlength={50} showCount={false} v-model:value={state.formState.stallMobile} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='工程对接人' name='superviseUsers'>
                <UserPickerInput disabled={props.info} multiple v-model:value={state.users} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='安全对接人' name='safetyDockUserId'>
                <UserPickerInput disabled={props.info} multiple v-model:value={state.safetyDockUsers} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='监管部门' name='superviseDep'>
                <DeptTreeSelect deleteAll={true} readonly={props.info} multiple v-model:value={state.superviseDepIds} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='备注' name='remarks'>
                <Textarea disabled={props.info} maxlength={200} v-model:value={state.formState.remarks} />
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label='附件' name='projectFiles'>
                <FileUpload readonly={props.info} multiple sceneCode={GLOBAL_SCENE_CODE.smallEngineering} v-model:value={state.files} maxCount={10} type='picture-card' customText='支持上传图片（.png/.jpeg/.jpg）、文档（.pdf,doc,docx）表格(xlsx‌，xls)、压缩包（.zip,.rar）,最大为300MB' typeList={['.pdf', '.png', '.jpg', '.jpeg', '.xlsx', '.xls', '.doc', '.docx', '.zip', '.rar', '.tgz', '.tgz.gz']} />
                {!props.info &&
                  <div>
                    <div>上传可参考以下资料（如部分材料没有，则不进行上传）</div>
                    <div style={{ padding: '6px' }}>
                      <div>1.安全责任承诺书</div>
                      <div>2.动火作业申请表</div>
                      <div>3.特种作业操作证</div>
                      <div>4.技术交底文件</div>
                      <div>5.风险告知书</div>
                      <div>6.安全管理协议</div>
                      <div>7.资质文件</div>
                    </div>
                  </div>}
              </FormItem>
            </Col>
          </Row>
        </Form>
        {props.info && <ProgressTable dataSource={progressDataSource.value} />}
        {props.info && <Result dataSource={checkDataSource.value} />}
      </div>
    )
  }
})
