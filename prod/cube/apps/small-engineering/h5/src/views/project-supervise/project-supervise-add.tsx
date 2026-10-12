import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { Field, Popup, Picker, Button, Form, type FormInstance, Loading, DatePicker, showNotify, Icon } from 'vant'
import './project-supervise-add.less'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { cubeSmallEngineeringService } from '@/api/server'
import { DeptSelect } from '@/components/dept-select'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { showImagePreview } from '@ghcloud/cube-utils'

const SE_IMG = '/resource/v1/small-engineering/images'
const iconDOC = `${SE_IMG}/icon-doc.png`
const iconPPT = `${SE_IMG}/icon-ppt.png`
const iconPDF = `${SE_IMG}/icon-pdf.png`
const iconTXT = `${SE_IMG}/icon-txt.png`
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { storeProject } from '@/store/project'
import type { ProjectSupervise } from '@/types/project-type'

export const ProjectSuperviseAdd = defineComponent({
  setup: () => {
    const projectStore = storeProject()
    const router = useRouter()
    const route = useRoute()
    const formRef = ref<FormInstance>()
    const state = reactive<ProjectSupervise>({
      showProjectType: false,
      showDatePicker: false,
      showDeptSelect: false,
      loading: false,
      showDateRangePicker: false,
      formState: {
        projectName: '',
        typeId: '',
        typeName: '',
        constructB: '',
        partyB: '',
        duration: '',
        completionTime: '',
        superviseDep: '',
        superviseDepName: '',
        constructionSite: '',
        superviseUsers: '',
        safetyDockUserId: '',
        remarks: '',
        projectFiles: ''
      },
      files: [],
      dataRange: {
        startDate: '',
        endDate: '',
      },
      rangeType: 'startDate',
      userNames: [],
      typeOptions: [],
      safetyDockUserNames: [],
      superviseDepList: [],
      superviseDepNemas: []
    })
    const defaultDate = [
      new Date().getFullYear().toString(),
      (new Date().getMonth() + 1).toString().padStart(2, '0'),
      new Date().getDate().toString().padStart(2, '0')
    ];
    const dateSelect = ref<string[]>(defaultDate)
    const dateRangeSelect = ref<string[]>(dayjs().format('YYYY-MM-DD').split('-'))
    const initData = async (): Promise<void> => {
      const result = await cubeSmallEngineeringService.getProjectTypeList()
      state.typeOptions = result
    }
    const getBaseInfo = async (): Promise<void> => {
      try {
        const res = await cubeSmallEngineeringService.projectScheduleDetail(route.query.id as string)
        state.formState = {
          ...res,
          typeId: res.projectType,
          typeName: res.projectTypeName as unknown as string,
          completionTime: res.completionTime ? dayjs(res.completionTime).format('YYYY-MM-DD') : '',
          superviseUsers: res.superviseUser.map((item: { id: string; }) => item.id).join(','),
          safetyDockUserId: res.safetyDockUser.map((item: { id: string; }) => item.id).join(','),
          superviseDep: res.superviseDepList.map((item: { id: string; }) => item.id).join(','),
          projectFiles: res.projectFiles?.map(item => item.id).join(',') as unknown as string
        }
        state.dataRange.startDate = res.duration.split(',')[0]
        state.dataRange.endDate = res.duration.split(',')[1] !== 'undefined' ? res.duration.split(',')[1] : ''
        state.userNames = res.superviseUser.map(item => item.name)
        state.safetyDockUserNames = res.safetyDockUser.map(item => item.name)
        state.superviseDepNemas = res.superviseDepList?.map(item => item.name)
        state.superviseDepList = res.superviseDepList?.map((item) => {
          return {
            text: item.name,
            value: item.id
          }
        })
        formData.fileVOS = res.projectFiles as unknown as { id: string; name: string; path: string;type: string; }[]

      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    const type = computed(() => {
      return (fileType: string): string=> {
        fileType = fileType.toLowerCase()
        if ('.png/.jpeg/.jpg/.gif/.webp'.includes(fileType)) {
          return 'img'
        }
        if ('mp4、avi、mkv'.includes(fileType)) {
          return 'video'
        }
        if ('.doc/.docx'.includes(fileType)) {
          return 'doc'
        }
        if ('.xls/.xlsx'.includes(fileType)) {
          return 'xls'
        }
        if ('.pptx/.ppt'.includes(fileType)) {
          return 'ppt'
        }
        if ('.pdf'.includes(fileType)) {
          return 'pdf'
        }
        if ('.txt'.includes(fileType)) {
          return 'txt'
        }
        return 'doc'
      }
    })
    const getFileIcon = computed(() => {
      return (fileType: string): string => {
        fileType = fileType.toLowerCase()
        if ('.doc/.docx'.includes(fileType)) {
          return iconDOC
        } else if ('.pdf'.includes(fileType)) {
          return iconPDF
        } else if ('.pptx/.ppt'.includes(fileType)) {
          return iconPPT
        } else if ('.txt'.includes(fileType)) {
          return iconTXT
        } else {
          return iconDOC
        }
      }
    })
    const formData = reactive<{
      description: string;
      acceptanceResult: string;
      acceptanceResultText: string;
      fileVOS: { id: string;path: string;type: string; }[];
    }>({
      description: '',
      acceptanceResult: '',
      acceptanceResultText: '',
      fileVOS: []
    })
    const fileMaxCount = 10
    const filedUploadSlots = {
      input: (): JSX.Element => {
        return (
          <div>
            <div class='uploadedList'>
              {
                formData.fileVOS.map((item, index) => {
                  return (
                    <div class='uploaded' key={item.id} onClick={() => {
                      handlePreviewImage(index)
                    }}>
                      <img src={item.path} v-show={type.value(item.type) === 'img'} alt='' width={60} height={60} />
                      <img src={getFileIcon.value(item.type)} v-show={type.value(item.type) !== 'img'} />
                      <Icon
                        name='clear' size='20px' color='#000'
                        onClick={(e: Event) => {
                          e.stopPropagation()
                          deleteImage(item.id)
                        }}
                      />
                    </div>
                  )
                })
              }
              {formData.fileVOS.length < fileMaxCount &&
                <div class='upload' onClick={handleUploadImage}>
                  <Icon name='plus' size='30px' color='#d9d9d9' />
                </div>}
            </div>
            <div style={{ marginTop: '6px' }}>
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
            </div>

          </div>
        )
      }
    }
    const handleUploadImage = async (): Promise<void> => {
      try {
        const result = await cubeAppService.uploadFile(String(fileMaxCount - formData.fileVOS.length), {
          sceneCode: GLOBAL_SCENE_CODE.smallEngineering
        })
        formData.fileVOS = [...formData.fileVOS, ...result]
      } catch (error) {
      }
    }
    const handlePreviewImage = (showIndex: number): void => {
      showImagePreview(formData.fileVOS.map(item => item.path), showIndex)
    }
    const deleteImage = (id: string): void => {
      formData.fileVOS = formData.fileVOS.filter(item => item.id !== id)
    }
    onMounted(async () => {
      route.query.id && await getBaseInfo()
      await initData()

      if (projectStore.projectSupervise) {
        Object.assign(state, projectStore.projectSupervise)
        formData.fileVOS = projectStore.projectSupervise?.fileVOS ?? []
      }
      if (projectStore.checkSuperviseUsers) {
        state.formState.superviseUsers = projectStore.checkSuperviseUsers?.map(i => (i as { id: string; }).id).join(',') ?? ''
        state.userNames = projectStore.checkSuperviseUsers?.map(i=> (i as { name: string; }).name) ?? []
      }
      if (projectStore.checkSafetyDockUser) {
        state.formState.safetyDockUserId = projectStore.checkSafetyDockUser?.map(i => (i as { id: string; }).id).join(',') ?? ''
        state.safetyDockUserNames = projectStore.checkSafetyDockUser?.map(i=> (i as { name: string; }).name) ?? []
      }
    })
    const handleDateRange = ({ selectedValues }: { selectedValues: string[]; }): void => {
      if (state.rangeType === 'endDate' && state.dataRange.startDate) {
        const endDate = new Date(selectedValues.join('-') + ' 00:00:00').getTime()
        const startTime = new Date(state.dataRange.startDate).getTime()
        if (startTime > endDate) {
          showNotify({
            type: 'warning',
            message: '结束时间不能小于开始时间'
          })
          return
        }
      }
      if (state.rangeType === 'startDate' && state.dataRange.endDate) {
        const startTime = new Date(selectedValues.join('-') + ' 00:00:00').getTime()
        const endDate = new Date(state.dataRange.endDate).getTime()
        if (startTime > endDate) {
          showNotify({
            type: 'warning',
            message: '开始时间不能大于结束时间'
          })
          return
        }
      }
      state.showDateRangePicker = false
      state.dataRange[state.rangeType] = selectedValues.join('-')
      if (state.dataRange.startDate && state.dataRange.endDate) {
        state.formState.duration = `${state.dataRange.startDate },${state.dataRange.endDate}`
      }
    }
    const handleSubmit = async (): Promise<void> => {
      if (state.dataRange.startDate && !state.dataRange.endDate) {
        showNotify({
          type: 'warning',
          message: '请选择工期结束时间'
        })
        return
      }
      if (!state.dataRange.startDate && state.dataRange.endDate) {
        showNotify({
          type: 'warning',
          message: '请选择工期开始时间'
        })
        return
      }
      formRef.value?.validate().then(async () => {
        try {
          state.loading = true
          const params = {
            ...state.formState,
            projectFiles: formData.fileVOS.map((item) => item.id).join(','),
            duration: `${state.dataRange.startDate},${state.dataRange.endDate}`
          }
          if (route.query.id){
            await cubeSmallEngineeringService.updateProjectSupervise(params)
          } else {
            const projectId = await cubeSmallEngineeringService.createProjectSupervise(params)
            sessionStorage.setItem('add-project', projectId)
          }
          showNotify({ type: 'success', message: '提交成功' })
          setTimeout(() => {
            router.back()
          }, 1000)
        } catch (error) {
          const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
          showNotify({ type: 'danger', message: errorMessage || '请求失败' })
        } finally {
          state.loading = false
          projectStore.resetCache()
        }
      })
    }
    const dateRangeSlot = {
      input: (): JSX.Element => {
        return (
          <div class='date-range'>
            <div
              class={[!state.dataRange.startDate && 'placeholder']} onClick={() => {
                if (state.dataRange.startDate){
                  dateRangeSelect.value = state.dataRange.startDate?.split('-')
                } else {
                  dateRangeSelect.value = defaultDate
                }
                state.showDateRangePicker = true
                state.rangeType = 'startDate'
              }}
            >{state.dataRange.startDate || '开始时间'}
            </div>
            <span>~</span>
            <div
              class={[!state.dataRange.startDate && 'placeholder']} onClick={() => {
                if (state.dataRange.endDate){
                  dateRangeSelect.value = state.dataRange.endDate?.split('-')
                } else {
                  dateRangeSelect.value = defaultDate
                }
                state.showDateRangePicker = true
                state.rangeType = 'endDate'
              }}
            >{state.dataRange.endDate || '结束时间'}
            </div>
          </div>
        )
      }
    }
    const handleConfirmSelectDept = (value: { text: string;value: string; }[]): void => {
      state.superviseDepList = value
      state.superviseDepNemas = value.map((item) => item.text)
      state.formState.superviseDep = value.map((item) => item.value).join(',')
      state.formState.superviseDepName = value.map((item) => item.text).join(',')
      state.showDeptSelect = false
    }
    const clickUser = (): void => {
      const names = typeof state.userNames === 'string' ? state.userNames.split(',') : state.userNames
      projectStore.checkSuperviseUsers = state.formState.superviseUsers.split(',').map((item, index) => {
        return {
          id: item,
          name: names[index]
        }
      }).filter((item) => item.id)
      projectStore.projectSupervise = { ...state, fileVOS: formData.fileVOS }
      router.push({ path: '/person-page', query: { type: 'superviseUsers' } })
    }
    const clickSafetyDockUser = (): void => {
      const names = typeof state.safetyDockUserNames === 'string' ? state.safetyDockUserNames.split(',') : state.userNames
      projectStore.checkSafetyDockUser = state.formState.safetyDockUserId.split(',').map((item, index) => {
        return {
          id: item,
          name: names[index]
        }
      }).filter((item) => item.id)
      projectStore.projectSupervise = { ...state, fileVOS: formData.fileVOS }
      router.push({ path: '/person-page', query: { type: 'safetyDockUser' } })
    }
    const handleClickLeft = (): void => {
      projectStore.resetCache()
    }
    const title = computed(() => {
      return route.query.id ? '编辑工程' : '新增工程'
    })
    return (): JSX.Element => (
      <div class='project-supervise'>
        <CubeNavBar title={title.value} showBack onClickLeft={handleClickLeft} />
        <div class='form'>
          {state.loading && <Loading type='spinner' size='24px' vertical>加载中...</Loading>}
          <Form ref={formRef} label-width='100px'>
            <Field
              v-model={state.formState.projectName}
              rules={[{ required: true, message: '选输入工程名称' }]}
              label='小散工程名称'
              placeholder='请输入小散工程名称'
              required
              maxlength='50'
              show-word-limit
            />
            <Field
              v-model={state.formState.typeName}
              rules={[{ required: true, message: '选选择工程类型' }]}
              label='工程类型'
              isLink
              placeholder='请选择工程类型'
              required
              readonly
              onClick={() => {
                state.showProjectType = true
              }}
            />
            <Field
              v-model={state.formState.constructB}
              rules={[{ required: true, message: '选输入建设方' }]}
              label='建设方'
              maxlength='50'
              placeholder='输入建设方'
              required
            />
            <Field
              v-model={state.formState.constructionSite}
              rules={[{ required: true, message: '选输入施工地点' }]}
              label='施工地点'
              maxlength='50'
              placeholder='输入施工地点'
              required
            />
            <Field
              v-model={state.formState.partyB}
              rules={[{ required: true, message: '选输入施工方' }]}
              label='施工方'
              maxlength='50'
              placeholder='输入施工方'
              required
            />
            <Field
              v-model={state.formState.partyBMobile}
              label='施工方联系方式'
              maxlength='50'
              placeholder='输入施工方联系方式'
            />
            <Field
              v-model={state.formState.stallCode}
              label='档位号'
              maxlength='50'
              placeholder='输入档位号'
            />
            <Field
              v-model={state.formState.stallLiaison}
              label='档位联系人'
              maxlength='50'
              placeholder='输入档位联系人'
            />
            <Field
              v-model={state.formState.stallMobile}
              label='档位联系方式'
              maxlength='50'
              placeholder='输入档位联系方式'
            />
            <Field
              label='工程时间'
              is-link
              placeholder='选择工程时间'
              readonly
              v-model={state.formState.completionTime}
              onClick={() => {
                state.showDatePicker = true
              }}
            />
            <Field
              label='工期'
              is-link
              placeholder='选择工期'
              readonly
              v-model={state.formState.duration}
              rules={[{ required: true, message: '选择工期时间' }]}
              v-slots={
                dateRangeSlot
              }
              required
            />
            <Field
              label='工程对接人'
              placeholder='选择工程对接人'
              v-model={state.userNames}
              readonly
              is-link
              onClick={clickUser}
            />
            <Field
              label='安全对接人'
              placeholder='选择安全对接人'
              v-model={state.safetyDockUserNames}
              readonly
              is-link
              onClick={clickSafetyDockUser}
            />
            <Field
              label='监管部门'
              placeholder='选择监管部门'
              v-model={state.superviseDepNemas}
              rules={[{ required: true, message: '选择监管部门' }]}
              readonly
              is-link
              onClick={() => {
                state.showDeptSelect = true
              }}
              required
            />
            <Field
              v-model={state.formState.remarks}
              label='备注'
              rows='2'
              autosize
              type='textarea'
              maxlength='200'
              placeholder='输入备注'
              show-word-limit
            />
            <Field label='附件' readonly />
            <Field v-slots={filedUploadSlots} readonly />
          </Form>
        </div>
        <div class='footer'>
          <Button block type='primary' loading={state.loading} onClick={handleSubmit}>保存</Button>
        </div>
        <Popup v-model:show={state.showProjectType} round position='bottom'>
          <Picker
            title='工程类型'
            columns={state.typeOptions}
            onConfirm={({ selectedOptions }: { selectedOptions: { name: string;id: string; }[]; }) => {
              state.formState.typeName = selectedOptions[0].name
              state.formState.typeId = selectedOptions[0].id
              state.showProjectType = false
            }}
            onCancel={() => {
              state.showProjectType = false
            }}
            columns-field-names={{ text: 'name', value: 'id' }}
          />
        </Popup>
        <Popup v-model:show={state.showDatePicker} position='bottom'>
          <DatePicker
            title='选择日期'
            v-model={dateSelect.value}
            onCancel={() => {
              state.showDatePicker = false
            }}
            onConfirm={({ selectedValues }: { selectedValues: string[]; }) => {
              state.formState.completionTime = selectedValues.join('-')
              state.showDatePicker = false
            }}
          />
        </Popup>
        <Popup v-model:show={state.showDateRangePicker} position='bottom'>
          <DatePicker
            onCancel={() => {
              state.showDateRangePicker = false
            }}
            title={`${state.rangeType === 'startDate' ? '开始时间' : '结束时间'}`}
            v-model={dateRangeSelect.value}
            onConfirm={handleDateRange}
          />
        </Popup>
        <DeptSelect
          v-model:show={state.showDeptSelect}
          onClose={
            () => {
              state.showDeptSelect = false
            }
          }
          value={state.superviseDepList}
          onConfirm={handleConfirmSelectDept}
          multiple={true}
        />
      </div>
    )
  }
})
