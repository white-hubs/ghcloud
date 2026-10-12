import { defineComponent, onMounted, ref } from 'vue'
import './tab-business.less'
import { cubeCompaniesService } from '@/api/server'
import { useRoute } from 'vue-router'
import { PullRefresh, Image, showImagePreview, Icon, showNotify } from 'vant'
import { kkFilePreview } from '@ghcloud/cube-utils'
import { getFileName, type FileState } from '@/utils'

export const TabBusiness = defineComponent({
  setup () {
    const { id } = useRoute().query as { id: string; }
    const typeList = ['doc', 'docx', 'excel', 'xlsx', 'xls', 'pdf', 'ppt', 'txt']
    const imgType = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'jpge', 'webp', 'mpeg', 'raw', 'heic']
    const loading = ref(false)
    const dataInfo = ref()
    const fileImgList = ref<FileState[]>([])
    const getImg = async (): Promise<void> => {
      try {
        fileImgList.value = []
        const securityImg = dataInfo.value?.securityFileVOS?.filter((item: FileState) => imgType.includes(item.type ?? '')) || []
        const trainingPhotoImg = dataInfo.value?.trainingPhotoFileVOS ?? []
        const companyPhotoImg = dataInfo.value?.companyPhotoFileVOS ?? []
        const businessLicenseImg = dataInfo.value?.businessLicenseFileVOS ?? []
        const companyFileIdsImg = dataInfo.value?.companyFileIdsFileVOS?.filter((item: FileState) => imgType.includes(item.type ?? '')) || []
        fileImgList.value = [
          ...securityImg,
          ...trainingPhotoImg,
          ...companyPhotoImg,
          ...businessLicenseImg,
          ...companyFileIdsImg,
        ]
      } catch {
      } finally {
        loading.value = false
      }
    }
    const getData = async (): Promise<void> => {
      try {
        const params = {
          stallId: id
        }
        loading.value = true
        const res = await cubeCompaniesService.getCompaniesDetailByStall(params)
        dataInfo.value = res
        await getImg()
      } catch (error) {
        showNotify({ type: 'warning', message: (error as { errorMessage: string; })?.errorMessage ?? '操作失败' })
      } finally {
        loading.value = false
      }
    }

    const preview = (item: FileState): void => {
      if (typeList.includes(item.type ?? '')) {
        kkFilePreview(item)
      } else {
        const index = fileImgList.value.findIndex(f => f.id === item.id) ?? 0
        showImagePreview(fileImgList.value.map(f => { return f.path }), index)
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
                  <span class='label'>商户编号</span>
                  <span class='value'>{dataInfo.value?.code || '--'}</span>
                </div>
                <div class='item'>
                  <span class='label'>商户名称</span>
                  <span class='value'>{dataInfo.value?.name || '--'}</span>
                </div>
                <div class='item'>
                  <span class='label'>所属人姓名</span>
                  <span class='value'>{dataInfo.value?.owner || '--'}</span>
                </div>
                <div class='item'>
                  <span class='label'>关联空间</span>
                  <span class='value'>{(dataInfo.value?.spaces && Array.isArray(dataInfo.value?.spaces) ? dataInfo.value?.spaces.join(',') : dataInfo.value?.spaces) || '--'}</span>
                </div>
                <div class='item'>
                  <span class='label'>所属档位</span>
                  <span class='value'>{dataInfo.value?.stallName || '--'}</span>
                </div>
                <div class='item img-list details-file'>
                  <span class='label'>安全协议</span>
                  <span class='value'>
                    {
                      !dataInfo.value?.securityFileVOS || dataInfo.value?.securityFileVOS.length === 0
                        ? <span class='no-data'>--</span>
                        : dataInfo.value?.securityFileVOS.map((e: FileState, i: number) => {
                          return (
                            <div class='details-file-item' key={`${e.id}-${i}`} onClick={() => { preview(e) }}>
                              <img class='details-file-img' src={getFileName(e)} />
                              <div class='details-file-name'>{e.name}</div>
                            </div>
                          )
                        })
                    }
                  </span>
                </div>
                <div class='item img-list'>
                  <span class='label'>安全培训照片</span>
                  <span class='value'>
                    {
                      !dataInfo.value?.trainingPhotoFileVOS || dataInfo.value?.trainingPhotoFileVOS.length === 0
                        ? <span class='no-data'>--</span>
                        : dataInfo.value?.trainingPhotoFileVOS.map((item: FileState, index: number) => {
                          return (
                            <div class='img-warp' key={index} onClick={() => { preview(item) }}>
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
                <div class='item img-list'>
                  <span class='label'>商户灭火器/消防栓</span>
                  <span class='value'>
                    {
                      !dataInfo.value?.companyPhotoFileVOS || dataInfo.value?.companyPhotoFileVOS.length === 0
                        ? <span class='no-data'>--</span>
                        : dataInfo.value?.companyPhotoFileVOS.map((item: FileState, index: number) => {
                          return (
                            <div class='img-warp' key={index} onClick={() => { preview(item) }}>
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
                <div class='item'>
                  <span class='label'>营业期限</span>
                  <span class='value'>
                    {
                      (dataInfo.value?.longTerm ? '长期' : (dataInfo.value?.startTime && dataInfo.value?.endTime ? `${dataInfo.value?.startTime} 至 ${dataInfo.value?.endTime}` : '')) || '--'
                    }
                  </span>
                </div>
                <div class='item img-list'>
                  <span class='label'>营业执照</span>
                  <span class='value'>
                    {
                      !dataInfo.value?.businessLicenseFileVOS || dataInfo.value?.businessLicenseFileVOS.length === 0
                        ? <span class='no-data'>--</span>
                        : dataInfo.value?.businessLicenseFileVOS.map((item: FileState, index: number) => {
                          return (
                            <div class='img-warp' key={index} onClick={() => { preview(item) }}>
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
                <div class='item'>
                  <span class='label'>经营信息</span>
                  <span class='value'>{dataInfo.value?.introduction || '--'}</span>
                </div>
                <div class='item img-list details-file'>
                  <span class='label'>附件</span>
                  <span class='value'>
                    {
                      !dataInfo.value?.companyFileIdsFileVOS || dataInfo.value?.companyFileIdsFileVOS.length === 0
                        ? <span class='no-data'>--</span>
                        : dataInfo.value?.companyFileIdsFileVOS.map((e: FileState, i: number) => {
                          return (
                            <div class='details-file-item' key={`${e.id}-${i}`} onClick={() => { preview(e) }}>
                              <img class='details-file-img' src={getFileName(e)} />
                              <div class='details-file-name'>{e.name}</div>
                            </div>
                          )
                        })
                    }
                  </span>
                </div>
                <div class='item'>
                  <span class='label'>备注</span>
                  <span class='value'>{dataInfo.value?.remark || '--'}</span>
                </div>
              </div>
            </div>
        }
      </PullRefresh>
  }
})
