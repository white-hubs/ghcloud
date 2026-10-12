
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import './tab-info.less'
import { Icon, showNotify, Image } from 'vant'
import { Card } from '../custom-card'
import { ProjectProgress } from '../project-progress'
import { cubeSmallEngineeringService } from '@/api/server'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { kkFilePreview, type FileState } from '@ghcloud/cube-utils'
import { ResultProgress } from '../result-progress'
import { imgType, typeList } from '@/utils'
import type { ScheduleFile } from '@ghcloud/cube-small-engineering-service'
import { showImagePreview } from '@ghcloud/cube-utils'
interface FormStateVo {
  projectName: string;
  projectTypeName: string;
  typeId: string;
  completionTime: string;
  constructionSite: string;
  duration: string;
  stallCode?: string;
  stallLiaison?: string;
  stallMobile?: string;
  partyBMobile?: string;
  superviseDepName: string;
  constructB: string;
  partyB: string;
  superviseUser: { id: string; name: string; path: string; }[];
  remarks: string;
  projectFiles: ScheduleFile[];
}
export const TabInfo = defineComponent({
  setup () {
    const { id } = useRoute().query as { id: string; }
    const loading = ref(false)
    const dataInfo = reactive<{
      formState: FormStateVo;
      files: { id: string; name: string; path: string; type: string; }[];
      users: { name: string; id: string; }[];
      typeOptions: { name: string; id: string; }[];
    }>({
      formState: {
        projectName: '',
        projectTypeName: '',
        typeId: '',
        constructB: '',
        partyB: '',
        duration: '',
        completionTime: '',
        superviseDepName: '',
        constructionSite: '',
        superviseUser: [],
        remarks: '',
        projectFiles: []
      },
      files: [],
      users: [],
      typeOptions: []
    })
    const getBaseInfo = async (): Promise<void> => {
      try {
        const res = await cubeSmallEngineeringService.projectScheduleDetail(id)
        dataInfo.formState = res as unknown as FormStateVo
      } catch (error) {
        showNotify({ type: 'warning', message: (error as { errorMessage: string; })?.errorMessage ?? '操作失败' })
      } finally {
        loading.value = false
      }
    }
    const userNames = computed(() => {
      return dataInfo.formState?.superviseUser.map(item => item.name).join(',')
    })
    const preview = (item: { id: string; name: string; path: string; type: string; } | FileState): void => {
      if (['zip', 'rar'].includes(item.type ?? '')) {
        showNotify({ type: 'warning', message: '暂不支持该文件类型的预览, 请到电脑端查看' })
        return
      }
      if (typeList.includes(item.type ?? '')) {
        kkFilePreview(item)
      } else {
        const imgList = dataInfo.formState.projectFiles.filter(f => imgType.includes(f.type ?? '')) || []
        const index = imgList.findIndex(f => f.id === item.id) ?? 0
        showImagePreview(imgList.map(f => {
          return f.path
        }), index)
      }
    }
    onMounted(() => {
      getBaseInfo()
    })
    const fileSlots = {
      loading: (): JSX.Element => {
        return <Icon name='description-o' size='20' />
      }
    }
    return (): JSX.Element =>
      <div>
        {
          !loading.value &&
            <div class='info'>
              <Card title='基本信息'>
                <div class='content'>
                  <div class='item'>
                    <span class='label'>小散工程名称</span>
                    <span class='value'>{dataInfo.formState?.projectName || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>工程类型</span>
                    <span class='value'>{dataInfo.formState?.projectTypeName || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>建设方</span>
                    <span class='value'>{dataInfo.formState?.constructB || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>施工地点</span>
                    <span class='value'>{dataInfo.formState?.constructionSite || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>施工方</span>
                    <span class='value'>{dataInfo.formState?.partyB || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>施工方联系方式</span>
                    <span class='value'>{dataInfo.formState?.partyBMobile || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>档位号</span>
                    <span class='value'>{dataInfo.formState?.stallCode || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>档位联系人</span>
                    <span class='value'>{dataInfo.formState?.stallLiaison || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>档位联系方式</span>
                    <span class='value'>{dataInfo.formState?.stallMobile || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>工程时间</span>
                    <span class='value'>{(dataInfo.formState?.completionTime && dayjs(dataInfo.formState?.completionTime).format('YYYY-MM-DD')) || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>工期</span>
                    <span class='value'>{dataInfo.formState.duration ? `${dataInfo.formState.duration.split(',')[0]}~${dataInfo.formState.duration.split(',')[1]}` : '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>监管部门</span>
                    <span class='value'>{dataInfo.formState?.superviseDepName || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>监管人</span>
                    <span class='value'>{userNames.value || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>备注</span>
                    <span class='value'>{dataInfo.formState?.remarks || '--'}</span>
                  </div>
                  <div class='item'>
                    <span class='label'>工程详细资料</span>
                    <span class='value' />
                  </div>
                  <div class='item'>
                    <span class='value' style='text-align: left'>
                      {
                        !dataInfo.formState.projectFiles
                          ? <span class='no-data'>--</span>
                          : dataInfo.formState.projectFiles.map((item) => {
                            return (
                              <div class={typeList.includes(item.type ?? '') ? '' : 'img-warp'} key={item.id} onClick={() => {
                                preview(item)
                              }}>
                                {
                                  typeList.includes(item.type)
                                    ? (
                                      <div class='img-item'>
                                        <Image v-slots={fileSlots} class='file-img' />
                                        <div class='file-name'>{item.name}</div>
                                      </div>
                                    )
                                    : (
                                      <div class='img-item '>
                                        <Image src={item.path} class='file-img' />
                                      </div>
                                    )
                                }
                              </div>
                            )
                          })
                      }
                    </span>
                  </div>
                </div>
              </Card>
              <Card title='工程进度'>
                <div class='content'>
                  <ProjectProgress />
                </div>
              </Card>
              <Card title='工程结果'>
                <div class='content'>
                  <ResultProgress />
                </div>
              </Card>
            </div>
        }
      </div>
  }
})
