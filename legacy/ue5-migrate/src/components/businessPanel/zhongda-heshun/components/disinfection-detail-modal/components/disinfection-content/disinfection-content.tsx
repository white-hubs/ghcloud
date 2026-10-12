import { defineComponent, onMounted, ref } from 'vue'
import { Button, ImagePreviewGroup, Image, Popover, Spin, Table, Tabs } from 'ant-design-vue'
import styles from './disinfection-content.module.less'
import dayjs from 'dayjs'
import { EyeOutlined } from '@ant-design/icons-vue'
import { kkFilePreview } from '@ghcloud/cube-utils'

interface Props {
  disinfectionData: Record<string, unknown>;
}

export const DisinfectionContent = defineComponent({
  props: ['disinfectionData'],
  setup: (props: Props) => {
    const disinfectionData = ref<any>(props.disinfectionData)
    const loading = ref(false)
    const fileList = ['doc', 'docx', 'excel', 'xlsx', 'xls', 'pdf', 'ppt', 'txt']
    const getNotificationTypeText = (notificationType: string, data: any): string => {
      const typeMap = {
        'GROUP': '小组',
        'DEPT': '部门',
        'POST': '岗位',
        'GROUP_ROLE': '小组+角色',
        'ROLE': '角色'
      }
      let name = ''
      if (notificationType === 'GROUP'){
        name = data.notificationGroupName ?? ''
      } else if (notificationType === 'DEPT'){
        name = data.notificationDeptName ?? ''
      } else if (notificationType === 'POST'){
        name = data.notificationPostName ?? ''
      } else if (notificationType === 'ROLE'){
        name = data.notificationRoleName ?? ''
      } else if (notificationType === 'GROUP_ROLE'){
        let roles = []
        if (data.notificationGroupName) roles.push(data.notificationGroupName)
        if (data.notificationRoleName) roles.push(data.notificationRoleName)
        name = roles.join(' - ')
      }
      const typeName = typeMap[notificationType as keyof typeof typeMap]
      return notificationType || name ? (typeName + ' : ' + name) : '--'
    }
    onMounted(() => {
      loading.value = true
      setTimeout(()=>{
        loading.value = false
      }, 500)
    })
    const renderBasicInfo = (): JSX.Element => (
      <Spin spinning={loading.value}>
        <div class={styles['disinfection-info']}>
          <div class={styles['info-item']}>
            <span class={styles.label}>重点场所名称：</span>
            <span class={styles.value}>{disinfectionData.value?.placeName || '--'}</span>
          </div>
          <div class={styles['info-item']}>
            <span class={styles.label}>场所分类：</span>
            <span class={styles.value}>{disinfectionData.value?.placeTypeName || '--'}</span>
          </div>
          <div class={styles['info-item']}>
            <span class={styles.label}>完成时间：</span>
            <span class={styles.value}>{disinfectionData.value?.createTime ? dayjs(disinfectionData.value?.createTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
          </div>
          <div class={styles['info-item']}>
            <span class={styles.label}>完成人员：</span>
            <span class={styles.value}>{disinfectionData.value?.executorName || '--'}</span>
            {/* <span class={styles.value}>{getNotificationTypeText(disinfectionData.value?.notificationType ?? '', disinfectionData.value)}</span> */}
          </div>
          <div class={styles['info-item']}>
            <span class={styles.label}>完成说明：</span>
            <span class={styles.value}>{disinfectionData.value?.taskDesc || '--'}</span>
          </div>
          <div class={styles['info-item']}>
            <span class={styles.label}>现场图片：</span>
            <span class={styles.value}>
              {
                disinfectionData.value?.fileVOList ?
                  <ImagePreviewGroup>
                    {(disinfectionData.value?.fileVOList || [])?.map((item: any, index: number) => {
                      const url = item.path?.startsWith('http') ? item.path : `${location.origin}${item.path}`
                      const isFile = fileList.includes(item.type || '')
                      return <>
                        {isFile ? <>
                          <Button type="link" size="small" onClick={() => kkFilePreview(item)}>{item.name || '--'}</Button>
                        </>
                          : <Image key={index} src={url} width={60} height={60} previewMask={() => <><EyeOutlined />预览</>} />}
                      </>
                    })}
                  </ImagePreviewGroup>
                  : '--'
              }
            </span>
          </div>
        </div>
      </Spin>
    )
    return (): JSX.Element => (
      <div class={styles['disinfection-content-container']}>
        {renderBasicInfo()}
      </div>
    )
  }
})