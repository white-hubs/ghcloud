import { defineComponent, ref, onMounted, computed, watch } from 'vue'
import styles from './command-create.module.less'
import { Field, Button, showToast, Icon, showNotify } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { DisplayCell } from '@/components/displayCell/displayCell'

// 在文件顶部引入store
import { useCommandStore } from '@/store/command'
import { cubeZhongdaHeshunService } from '@/api/server'
import { storeKill } from '@/store/kill'

/**
 * 创建指令页面组件
 */
export const CommandCreate = defineComponent({
  setup: () => {
    const commandStore = useCommandStore()
    const store = storeKill()
    const isAdmin = ref(store.isAdmin)
    const router = useRouter()
    const route = useRoute()
    const commandName = ref(commandStore.name)
    const loading = ref(false)

    const Id = route.query.id as string
    // 在setup函数中


    // 添加时间数据的显示
    const timeInfo = computed(() => {
      return commandStore.timer || '请选择时间'
    })

    // 添加设备数据的显示
    const deviceInfo = computed(() => {
      return commandStore.actionName || '请选择设备'
    })
    /**
     * 处理返回按钮点击
     */
    const handleBack = (): void => {
      router.back()
    }

    onMounted(async ()=>{
      await store.updateGroupInfo()
      isAdmin.value = store.isAdmin
      if (Id){
        // 获取详情
      }
    })


    const cancel = (): void => {
      router.back()
    }
    /**
     * 处理提交表单
     */
    const handleSubmit = (): void => {
      if (!commandName.value) {
        showToast('请输入指令名称')
        return
      }
      if (!timeInfo.value || !deviceInfo.value){
        showToast('请完善执行条件')
        return
      }
      // 提交表单逻辑
      createCommand()
    }
    watch(() => commandName.value, () => {
      commandStore.saveName({ name: commandName.value })
    }, {
      deep: true
    })
    // saveName
    const createCommand = async (): Promise<void> => {
      loading.value = true
      const params = {
        name: commandStore.name,
        display: timeInfo.value + '&&' + deviceInfo.value,
        deviceId: commandStore.deviceId,
        propWriteValueList: commandStore.propWriteValueList,
        loopType: commandStore.loopType,
        loopDay: commandStore.loopDay.join(','),
        loopHour: commandStore.loopHour,
        groupId: store.groupActive,
      }
      const api = commandStore.state ? cubeZhongdaHeshunService.editCommandPageList({ ...params, id: commandStore.state }) : cubeZhongdaHeshunService.addCommandPageList(params)
      try {
        const data = await api;
        if (data){
          commandStore.resetStore()
          !commandStore.state ? showNotify({ type: 'success', message: '创建成功' }) : showNotify({ type: 'success', message: '修改成功' });
          router.back()
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON();
        showNotify({ type: 'danger', message: errorMessage || '请求失败' });
      } finally {
        loading.value = false;
      }
    };
    const Icon1 = {
      'icon': (): JSX.Element => {
        return (
          <Icon name='guide-o' />
        )
      },
    }
    const Icon2 = {
      'icon': (): JSX.Element => {
        return (
          <Icon name='flag-o' />
        )
      },
    }
    /**
      * 处理条件点击，弹出选择框
      */
    const conditionClick = () =>{
      router.push('/command-time-select')
    //  showConfirmDialog({
    //   cancelButtonText:'时间',
    //   confirmButtonText:'设备状态',
    //   cancelButtonColor:'rgb(61, 138, 242)',
    //   message:
    //     '请选择配置执行条件类型',
    //   })
    // .then(() => {
    //   // on confirm
    //   router.push('/command-status-select')
    // })
    // .catch(() => {
    //   // on cancel
    //   router.push('/command-time-select')
    // });
    }
    const actionClick = () =>{
      router.push('/command-action-select')
    }
    // 在组件卸载时重置store
    // onUnmounted(() => {
    //   commandStore.resetStore()
    // })

    // // 在JSX中使用计算属性显示数据
    // <DisplayCell value={deviceInfo.value} placeholder='请选择设备' onClick={handleAddAction}></DisplayCell>
    // <DisplayCell value={timeInfo.value} placeholder='请选择时间' onClick={conditionClick}></DisplayCell>
    return (): JSX.Element => (
      <div class={styles.container}>
        {/* <NavBar
          title="创建指令"
          leftArrow
          onClickLeft={handleBack}
          class={styles.navbar}
        /> */}

        <div class={styles.content}>
          <div class={styles.sectionTitle}>{commandStore.state?'编辑':'创建'}指令</div>
          <div class={styles.formItem}>
            <Field
              label=''
              v-model={commandName.value}
              placeholder="输入指令名称"
              class={styles.nameInput}
            />
          </div>
          <div class={styles.sectionTitle}>当</div>
          <DisplayCell value={timeInfo.value} disabled={Boolean(Id)} placeholder ='添加触发条件' v-slots={Icon1} onClick={conditionClick}></DisplayCell>

          <div class={styles.sectionTitle}>执行</div>
          <DisplayCell value={deviceInfo.value} disabled={Boolean(Id)} placeholder ='添加执行动作' v-slots={Icon2} onClick={actionClick}></DisplayCell>
        </div>
      { isAdmin.value &&
        <div class={styles.footer}>
          {commandStore.state ?
            <div class={styles.submitBtnGroup}>
              <Button
                type="default"
                block
                onClick={cancel}
                loading={loading.value}
                class={styles.cancelBtn}
              >
                取消
              </Button>
              <Button
                type="primary"
                block
                onClick={handleSubmit}
                loading={loading.value}
                class={styles.submitBtn}
              >
                保存
            </Button>
            </div>
            : <Button
              type="primary"
              block
              onClick={handleSubmit}
              loading={loading.value}
              class={styles.submitBtn}
            >
              提交
            </Button>}

        </div>
        }
      </div>
    )
  }
})


