import { defineComponent, onMounted, ref } from 'vue'
import './tab-gear.less'
import { cubeFileService, cubeMdataService } from '@/api/server'
import { useRoute } from 'vue-router'
import { PullRefresh, Image, showImagePreview, Icon, showNotify } from 'vant'
import { kkFilePreview, type FileState } from '@ghcloud/cube-utils'
export const TabGear = defineComponent({
  setup () {
    const { id } = useRoute().query as { id: string; }
    const typeList = ['doc', 'docx', 'excel', 'xlsx', 'xls', 'pdf', 'ppt', 'txt']
    const loading = ref(false)
    const dataInfo = ref()
    const fileImgList = ref<FileState[]>([])
    const getImg = async (): Promise<void> => {
      try {
        fileImgList.value = []
        if (dataInfo.value?.files?.length > 0) {
          dataInfo.value?.files.forEach(async (item: { id: string; }, index: number) => {
            const info = await cubeFileService.getFileInfo(item.id)
            if (info?.path) {
              fileImgList.value.splice(index, 0, {
                path: info?.path,
                type: info?.type ?? '',
                name: info?.name ?? '',
                id: info.id ?? ''
              })
            }
          })
        }
      } catch (error) {
        showNotify({ type: 'warning', message: (error as { errorMessage: string; })?.errorMessage ?? '操作失败' })
      } finally {
        loading.value = false
      }
    }
    const getData = async (): Promise<void> => {
      try {
        const params = {
          id
        }
        loading.value = true
        const res = await cubeMdataService.getStallDetail(params)
        dataInfo.value = res
        await getImg()
      } catch {
      } finally {
        loading.value = false
      }
    }

    const preview = (index: number, item: FileState): void => {
      if (typeList.includes(item.type ?? '')) {
        kkFilePreview(item)
      } else {
        const imgList = fileImgList.value.filter(item => !typeList.includes(item.type ?? '')).map(item => {
          return item.path ?? ''
        })
        showImagePreview(imgList, index)
      }
    }
    const onRefresh = (): void => {
      getData()
    }

    onMounted(() => {
      getData()
    })
    const fileSlots = {
      loading: (): JSX.Element => {
        return <Icon name='description-o' size='20' />
      }
    }
    return (): JSX.Element =>
      <PullRefresh v-model={loading.value} onRefresh={onRefresh}>
        {
          !loading.value &&
            <div class='info'>
              <div class='content'>
                <div class='item'>
                  <span class='label'>档位名称</span>
                  <span class='value'>{dataInfo.value?.name || '--'}</span>
                </div>
                <div class='item'>
                  <span class='label'>档位编码</span>
                  <span class='value'>{dataInfo.value?.code || '--'}</span>
                </div>
                <div class='item'>
                  <span class='label'>档位类型</span>
                  <span class='value'>{dataInfo.value?.typeName || '--'}</span>
                </div>
                <div class='item'>
                  <span class='label'>所属部门</span>
                  <span class='value'>{(dataInfo.value?.deptNames && Array.isArray(dataInfo.value?.deptNames) ? dataInfo.value?.deptNames.join('/') : dataInfo.value?.deptNames) || '--'}</span>
                </div>
                <div class='item'>
                  <span class='label'>所属区域</span>
                  <span class='value'>{(dataInfo.value?.areaNames && Array.isArray(dataInfo.value?.areaNames) ? dataInfo.value?.areaNames.join('/') : dataInfo.value?.areaNames) || '--'}</span>
                </div>
                <div class='item'>
                  <span class='label'>具体地址</span>
                  <span class='value'>{dataInfo.value?.location || '--'}</span>
                </div>
                <div class='item'>
                  <span class='label'>档主姓名</span>
                  <span class='value'>{dataInfo.value?.masterName || '--'}</span>
                </div>
                <div class='item'>
                  <span class='label'>档主联系方式</span>
                  <span class='value'>{dataInfo.value?.masterPhone || '--'}</span>
                </div>
                <div class='item img-list'>
                  <span class='label'>附件信息</span>
                  <span class='value'>
                    {
                      fileImgList.value.length === 0
                        ? <span class='no-data'>--</span>
                        : fileImgList.value.map((item, index) => {
                          return (
                            <div class='img-warp' key={index} onClick={() => { preview(index, item) }}>
                              {
                                typeList.includes(item.type ?? '')
                                  ? <Image v-slots={fileSlots} class='img-item' />
                                  : <Image src={item.path} class='img-item' />
                              }
                            </div>
                          )
                        })
                    }
                  </span>
                </div>
              </div>
            </div>
        }
      </PullRefresh>
  }
})
