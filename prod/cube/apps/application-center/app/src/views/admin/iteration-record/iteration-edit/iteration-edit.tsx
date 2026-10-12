import { defineComponent, ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Form, FormItem, Input, message, Select } from '@ghcloud/cube-ui'
import styles from './iteration-edit.module.less'
import { VerticalLine } from '@ghcloud/generic-component'
import { AppSelect } from '@/components/app-select/app-select'
import { cubeApplicationCenterService } from '@/api/service'
import type { ApplicationEntity, ApplicationIterationEntity } from '@ghcloud/cube-application-center-service'
import { IterationTypeOptions } from '@/constants/iteration'

export const IterationEdit = defineComponent({
  setup () {
    const router = useRouter()
    const route = useRoute()
    const iterationId = route.query.id as string
    const formRef = ref()
    const loading = ref<boolean>(false)
    const selectedApp = ref<ApplicationEntity>()
    const iterationData = ref<ApplicationIterationEntity>()

    // 表单状态
    const formState = reactive<{
      id?: string;
      applicationId: string;
      version: string;
      lastVersion: string;
      contentList: {
        key: string;
        category: string;
        content: string;
      }[];
    }>({
      applicationId: '',
      version: '',
      lastVersion: '0.0.0',
      contentList: []
    })

    // 表单验证规则
    const rules = {
      applicationId: [{ required: true, message: '请选择迭代应用', trigger: 'change' }],
      version: [
        { required: true, message: '请输入迭代版本', trigger: 'blur' },
        {
          pattern: /^(\d+)\.(\d+)(?:\.(\d+))?$/,
          message: '请输入有效的版本号格式，如：1.0.0或1.0',
          trigger: 'blur'
        },
        {
          validator: async (rule: any, value: string) => {
            if (!value || !formState.lastVersion) return Promise.resolve();

            // 解析版本号
            const parseVersion = (version: string): number[] => {
              const parts = version.split('.');
              return parts.map(part => parseInt(part, 10));
            };

            const currentVersion = parseVersion(value);
            const lastVersion = parseVersion(formState.lastVersion);

            // 比较版本号
            for (let i = 0; i < Math.max(currentVersion.length, lastVersion.length); i++) {
              const current = currentVersion[i] || 0;
              const last = lastVersion[i] || 0;

              if (current > last) return Promise.resolve();
              if (current < last) return Promise.reject('新版本号不能小于上次迭代版本');
            }

            // 如果所有部分都相等，则版本号相同
            return Promise.reject('新版本号不能等于上次迭代版本');
          },
          trigger: 'blur'
        }
      ]
    }

    // 初始化数据
    const initData = async (): Promise<void> => {
      if (!iterationId) return
      iterationData.value = await cubeApplicationCenterService.getApplicationIterationDetails(iterationId)
      Object.assign(formState, iterationData.value)
      formState.contentList = iterationData.value.content.map(item => ({
        key: item.iterationId,
        category: item.category,
        content: item.content,
      }))
    }

    const handleAppChange = (value: string | undefined, originalData: ApplicationEntity | undefined): void => {
      selectedApp.value = originalData
      formState.lastVersion = originalData?.version || '0.0.0'
    }

    // 新增迭代项
    const handleAddItem = (): void => {
      const newItem = {
        key: Math.random().toString(36).substring(2, 9),
        category: '',
        content: '',
      }
      formState.contentList.push(newItem)
    }

    // 删除迭代项
    const handleDeleteItem = (index: number): void => {
      formState.contentList.splice(index, 1)
    }

    // 保存数据
    const handleSave = async (): Promise<void> => {
      try {
        loading.value = true
        await formRef.value?.validate()

        // 验证迭代项
        const hasEmptyItems = formState.contentList.some(item => !item.category || !item.content)
        if (hasEmptyItems) {
          message.error('请完善迭代内容')
          loading.value = false
          return
        }
        await cubeApplicationCenterService.updateApplicationIterationDetails(formState)
        message.success('保存成功')
        router.back()
      } catch {
        message.error('保存失败，请检查表单数据')
      } finally {
        loading.value = false
      }
    }

    // 返回上一页
    const handleBack = (): void => {
      router.back()
    }

    onMounted(() => {
      initData()
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div class={styles.editContainer}>
            <Form
              ref={formRef}
              model={formState}
              rules={rules}
              layout="horizontal"
            >
              <VerticalLine title='迭代应用' />
              <div class={styles.basicInfo}>
                <div class={styles.infoRow}>
                  <FormItem
                    label="迭代应用"
                    name="applicationId"
                    required
                    class={styles.infoItem}
                  >
                    <AppSelect
                      v-model:value={formState.applicationId}
                      onChange={handleAppChange}
                      style={{ width: '240px' }}
                    />
                  </FormItem>

                  <FormItem
                    label="迭代版本"
                    name="version"
                    required
                    class={styles.infoItem}
                  >
                    <Input
                      v-model:value={formState.version}
                      placeholder="请输入版本号，如：1.0.0或1.0"
                      style={{ width: '240px' }}
                      showCount={false}
                    />
                  </FormItem>

                  <div class={styles.infoItem}>
                    <span class={styles.label}>上次迭代版本：</span>
                    <span class={styles.value}>{formState.lastVersion}</span>
                  </div>
                </div>
              </div>

              <VerticalLine title='迭代内容' />
              <div class={styles.iterationContent}>
                <div class={styles.tableContainer}>
                  {/* 表头 */}
                  <div class={styles.tableHeader}>
                    <div class={`${styles.headerCell} ${styles.typeCol}`}>类型</div>
                    <div class={`${styles.headerCell} ${styles.contentCol}`}>内容</div>
                    <div class={`${styles.headerCell} ${styles.actionCol}`}>操作</div>
                  </div>

                  {/* 表体 */}
                  <div class={styles.tableBody}>
                    {formState.contentList.map((item, index) => (
                      <div key={item.key} class={styles.tableRow}>
                        <div class={`${styles.tableCell} ${styles.typeCol}`}>
                          <Select
                            v-model:value={item.category}
                            placeholder="请选择"
                            class={styles.typeSelect}
                            options={IterationTypeOptions}
                          />
                        </div>
                        <div class={`${styles.tableCell} ${styles.contentCol}`}>
                          <Input
                            v-model:value={item.content}
                            placeholder="请输入内容"
                            class={styles.contentInput}
                          />
                        </div>
                        <div class={`${styles.tableCell} ${styles.actionCol}`}>
                          <span
                            class={styles.deleteBtn}
                            onClick={() => handleDeleteItem(index)}
                          >
                            删除
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 新增按钮 */}
                <button class={styles.addButton} onClick={handleAddItem}>
                  <span class={styles.addIcon}>+</span>
                  <span>新增</span>
                </button>
              </div>
            </Form>
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <div class={styles.footerActions}>
            <Button onClick={handleBack}>
              取消
            </Button>
            <Button
              type="primary"
              loading={loading.value}
              onClick={handleSave}
              style={{ marginLeft: '16px' }}
            >
              保存
            </Button>
          </div>
        )
      }

    }

    return (): JSX.Element => (
      <CubeLayout title="新增迭代" v-slots={layoutSlots} />
    )
  }
})