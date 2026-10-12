import { defineComponent, onMounted, reactive, ref } from "vue";
import { usePageName } from '@ghcloud/cube-utils';
import { Button, Form, FormItem, Select, Input, Space, message } from '@ghcloud/cube-ui';
import { Layout } from '@/components/layout/layout';
import { UserSelect, DeptSelect, PostSelect } from '@ghcloud/cube-app-design';
import { MinusCircleOutlined } from "@ant-design/icons-vue";
import { cubeOutsourceService } from '../../api/service'
import type { RepairTrafficModel, RepairChannelModel } from '@ghcloud/cube-outsource-service'
import _ from "lodash";

// 定义状态接口
interface TrafficState {
  loading: boolean;
  selectOptions: { value: boolean; label: string; }[];
  trafficModel: RepairTrafficModel;
  options: {
    name: string;
    id: string;
    disabled: boolean;
  }[];
}

const OPTION_MANAGEMENT = 'MANAGEMENT';
const OPTION_DEPARTMENT = 'DEPARTMENT';
const OPTION_POST = 'POST';
const OPTION_PERSONNAL = 'PERSONNAL';

export const RepairTraffic = defineComponent({
  setup () {
    const { pageTitle } = usePageName();
    const trafficValidate = ref();
    const channelTypeData = ref<RepairChannelModel[]>([]);

    const state = reactive<TrafficState>({
      loading: false,
      selectOptions: [
        {
          value: false,
          label: "不启用"
        },
        {
          value: true,
          label: "启用"
        }
      ],
      trafficModel: {
        id: "",
        channelTypes: [],
        configs: [],
        deDuplicationConfig: {
          switchSetting: false,
          duration: null,
          deDuplicationPeriod: null
        }
      },
      options: [
        { name: "管理人员", id: OPTION_MANAGEMENT, disabled: false },
        { name: "指定部门", id: OPTION_DEPARTMENT, disabled: false },
        { name: "指定岗位职责", id: OPTION_POST, disabled: false },
        { name: "指定人员", id: OPTION_PERSONNAL, disabled: false },
      ],
    });

    const channelRules = {
      channelTypes: [{ required: true, message: "请选择通知方式" }],
    };

    // const configRules = {
    //   mgmtType: [{ required: true, message: "请选择管理人员类型" }],
    //   mgmtValues: [{ required: true, message: "请选择" }],
    // };

    const optionAdd = (): void => {
      if (state.trafficModel.configs.length) {
        const valueRes = state.trafficModel.configs.every(
          (item) =>
            (item.mgmtType && item.mgmtType === OPTION_MANAGEMENT) ||
            (item.mgmtType &&
              item.mgmtType !== OPTION_MANAGEMENT &&
              item.mgmtValues?.length)
        );
        if (valueRes) {
          // 排除
          const checkedType = state.trafficModel.configs.map(
            (item) => item.mgmtType
          );
          if (state.trafficModel.configs.length >= state.options.length) {
            message.warn("没有其他选项了");
            return;
          }
          state.trafficModel.configs.push({
            mgmtType: "",
            mgmtValues: [],
            options: _.cloneDeep(state.options).filter((item) => {
              if (checkedType.includes(item.id)) {
                item.disabled = true;
              } else {
                item.disabled = false;
              }
              return item;
            }),
          });
        } else {
          // 验证表单
          validateAllConfigs();
        }
      } else {
        state.trafficModel.configs.push({
          mgmtType: "",
          mgmtValues: [],
          options: _.cloneDeep(state.options),
        });
      }
    };

    const optionDelete = (index: number): void => {
      state.trafficModel.configs.splice(index, 1);
    };

    const changeSelect = (index: number): void => {
      state.trafficModel.configs[index].mgmtValues = [];
    };

    const validateAllConfigs = async (): Promise<boolean> => {
      try {
        await trafficValidate.value.validate(['channelTypes']);

        // 验证每个配置项
        const hasInvalidConfig = state.trafficModel.configs.some(item => {
          if (!item.mgmtType) {
            return true;
          }
          if (item.mgmtType !== OPTION_MANAGEMENT && (!item.mgmtValues || item.mgmtValues.length === 0)) {
            return true;
          }
          return false;
        });

        if (hasInvalidConfig) {
          message.error('请完善管理人员配置');
          return false;
        }

        return true;
      } catch {
        return false;
      }
    };

    const getRes = async (): Promise<boolean | undefined> => {
      return validateAllConfigs();
    };

    const save = async (): Promise<void> => {
      const res = await getRes();
      state.loading = true;
      if (res) {
        await cubeOutsourceService.repairCollocateConfirm(state.trafficModel);
        state.loading = false;
        message.success("操作成功");
        getConfig();
      } else {
        state.loading = false;
      }
    };

    const getConfig = async (): Promise<void> => {
      const response = await cubeOutsourceService.repairUserConfig();
      if (response) {
        state.trafficModel = response;
        state.trafficModel.configs = state.trafficModel.configs.filter(
          (item) => {
            Object.assign(item, { options: _.cloneDeep(state.options) });
            return item;
          }
        );
        state.trafficModel.deDuplicationConfig = state.trafficModel.deDuplicationConfig || {
          switchSetting: false,
          duration: null,
          deDuplicationPeriod: null
        };
      } else {
        state.trafficModel = {
          id: "",
          channelTypes: [],
          configs: [],
          deDuplicationConfig: {
            switchSetting: false,
            duration: null,
            deDuplicationPeriod: null
          }
        };
      }
    };

    const getChannelTypes = async (): Promise<void> => {
      const response = await cubeOutsourceService.repairNotifyChannels();
      channelTypeData.value = response;
    };

    onMounted(() => {
      getConfig();
      getChannelTypes();
    });

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div class="detail-form">
            <Form ref={trafficValidate} model={state.trafficModel} rules={channelRules}>
              <div class="item-title">委外维修管理人员配置</div>
              <FormItem label="通知方式" name="channelTypes">
                <Select
                  v-model:value={state.trafficModel.channelTypes}
                  options={channelTypeData}
                  style={{ width: '200px' }}
                  mode="multiple"
                  fieldNames={{
                    label: 'nodeModelName',
                    value: 'notModel',
                  }}
                ></Select>
              </FormItem>
              <FormItem label="管理人员">
                <Button type="primary" onClick={optionAdd} class="mb2">添加</Button>
                {state.trafficModel.configs.map((item, index) => (
                  <div key={index} class="config-item-container" style={{ display: 'flex', marginBottom: '10px', alignItems: 'center' }}>
                    <FormItem style={{ marginRight: '10px', marginBottom: '0' }}>
                      <Select
                        v-model:value={item.mgmtType}
                        options={item.options.map(opt => ({ label: opt.name, value: opt.id, disabled: opt.disabled }))}
                        style={{ width: '150px' }}
                        placeholder="请选择类型"
                        onChange={() => changeSelect(index)}
                      ></Select>
                    </FormItem>

                    {item.mgmtType === OPTION_DEPARTMENT && (
                      <FormItem style={{ flex: 1, marginBottom: '0' }}>
                        <DeptSelect
                          v-model:value={item.mgmtValues}
                          multiple={true}
                          showSearch={true}
                          style={{ width: '300px' }}
                        />
                      </FormItem>
                    )}

                    {item.mgmtType === OPTION_POST && (
                      <FormItem style={{ flex: 1, marginBottom: '0' }}>
                        <PostSelect
                          v-model:value={item.mgmtValues}
                          multiple={true}
                          showSearch={true}
                          style={{ width: '300px' }}
                        />
                      </FormItem>
                    )}

                    {item.mgmtType === OPTION_PERSONNAL && (
                      <FormItem style={{ flex: 1, marginBottom: '0' }}>
                        <UserSelect
                          v-model:value={item.mgmtValues}
                          multiple={true}
                          showSearch={true}
                          style={{ width: '300px' }}
                        />
                      </FormItem>
                    )}

                    <MinusCircleOutlined
                      style={{ marginLeft: '10px', cursor: 'pointer' }}
                      onClick={() => optionDelete(index)}
                    />
                  </div>
                ))}
              </FormItem>
              <div class="item-title" style={{ borderTop: 'none' }}>故障维修配置</div>
              <Space>
                <FormItem label="系统自动生成委外">
                  <Select
                    v-model:value={state.trafficModel.deDuplicationConfig.switchSetting}
                    options={state.selectOptions}
                  ></Select>
                </FormItem>
                {state.trafficModel.deDuplicationConfig.switchSetting && (
                  <FormItem label="故障持续时间">
                    <Input
                      addon-after="秒"
                      v-model:value={state.trafficModel.deDuplicationConfig.duration}
                      type="number"
                      placeholder="故障持续时间"
                    ></Input>
                  </FormItem>
                )}
                {state.trafficModel.deDuplicationConfig.switchSetting && (
                  <FormItem label="去重周期">
                    <Input
                      addon-after="小时"
                      v-model:value={state.trafficModel.deDuplicationConfig.deDuplicationPeriod}
                      type="number"
                      placeholder="去重周期"
                    ></Input>
                  </FormItem>
                )}
              </Space>
            </Form>
          </div>
        )
      },
      'layout-footer': (): JSX.Element => {
        return (
          <>
            <Button type='primary' loading={state.loading} onClick={() => {
              save()
            }}>保存</Button>
          </>
        )
      }
    }

    return (): JSX.Element => (
      <Layout v-slots={layoutSlots} title={pageTitle} />
    )
  }
})