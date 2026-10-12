import { defineComponent, onMounted, ref, type VNode } from "vue";

import { Button, CheckboxGroup, FormItem, InputNumber, MinusCircleOutlined, TabPane, Tabs, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { addnewmessage, getnewmessage } from "@/api/message";
import { cubeMessageCenterService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { logger } from "@/logger";

interface NoticeOption {
  value: string;
  label: string;
}

interface MessageConfig {
  value: number;
  noticeWays: string[];
  label: string;
  sceneCode: string;
  noticeOptions: NoticeOption[];
}

interface HolidayExpireConfig extends MessageConfig {
  id: number;
}

interface MessageConfigResult {
  value: number;
  noticeWays: {
    noticeWay: string;
  }[];
}

export const Message = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const activeKey = ref("START_CLOCK");
    const startClock = ref<MessageConfig>({
      value: 0,
      noticeWays: [],
      label: "START_CLOCK",
      sceneCode: "START_CLOCK",
      noticeOptions: [],
    });
    const endClock = ref<MessageConfig>({
      value: 0,
      noticeWays: [],
      label: "END_CLOCK",
      sceneCode: "END_CLOCK",
      noticeOptions: [],
    });
    const holidayExpire = ref<HolidayExpireConfig[]>([
      {
        id: 1,
        value: 0,
        noticeWays: [],
        label: "假期到期提醒",
        sceneCode: "HOLIDAY_BALANCE_EXPIRE",
        noticeOptions: [],
      },
    ]);
    const tabchange = (value: string): void => {
      activeKey.value = value;
    };
    const addHolidayExpire = (): void => {
      holidayExpire.value.push({
        id: Math.random(),
        value: 0,
        noticeWays: [],
        label: "假期到期提醒",
        sceneCode: "HOLIDAY_BALANCE_EXPIRE",
        noticeOptions: holidayExpire.value[0]?.noticeOptions ?? [],
      });
    };
    const deleteHolidayExpire = (index: number): void => {
      holidayExpire.value.splice(index, 1);
    };
    const layoutSlots = {
      "layout-content": (): VNode => {
        return (
          <>
            <Tabs activeKey={activeKey.value} onTabChange={tabchange} type="card">
              <TabPane tab="上班打卡提醒" key="START_CLOCK">
                <FormItem label="通知条件:">
                  距离上班还有 <InputNumber style="width:200px!important" max={999} min={1} v-model:value={startClock.value.value} />{" "}
                  分钟提醒
                </FormItem>
                <FormItem label="通知方式:">
                  <div style="display: flex; flex-direction: row; flex-wrap: wrap;">
                    {startClock.value.noticeOptions.length && (
                      <CheckboxGroup class="ml-15px" v-model:value={startClock.value.noticeWays} options={startClock.value.noticeOptions} />
                    )}
                    {!startClock.value.noticeOptions.length && <span>当前场景未配置可使用的通知方式</span>}
                  </div>
                </FormItem>
                <FormItem label="通知内容:">您有一个安保早班09:00-17:00即将开始，请记得打卡</FormItem>
              </TabPane>
              <TabPane tab="下班打卡提醒" key="END_CLOCK">
                <FormItem label="通知条件:">
                  距离下班已有 <InputNumber style="width:200px!important" max={999} min={1} v-model:value={endClock.value.value} /> 分钟提醒
                </FormItem>
                <FormItem label="通知方式:">
                  <div style="display: flex; flex-direction: row; flex-wrap: wrap;">
                    {endClock.value.noticeOptions.length && (
                      <CheckboxGroup class="ml-15px" v-model:value={endClock.value.noticeWays} options={endClock.value.noticeOptions} />
                    )}
                    {!endClock.value.noticeOptions.length && <span>当前场景未配置可使用的通知方式</span>}
                  </div>
                </FormItem>
                <FormItem label="通知示例:">您有一个安保早班09:00-17:00已经结束，请记得打卡</FormItem>
              </TabPane>
              <TabPane tab="假期到期提醒" key="HOLIDAY_BALANCE_EXPIRE">
                <Button style="margin: 16px 0 0 30px;" onClick={addHolidayExpire}>
                  添加
                </Button>
                <div style="padding: 0 30px; overflow: auto; max-height: 600px;">
                  {holidayExpire.value.map((item, index): VNode => {
                    return (
                      <div key={item.id} style="width: 70%; padding: 5px; margin-top: 10px; border: 1px dotted #ccc; position: relative;">
                        {index !== 0 && (
                          <MinusCircleOutlined
                            style="position: absolute; right: 5px; top: 5px; color: red; cursor: pointer;"
                            onClick={() => {
                              deleteHolidayExpire(index);
                            }}
                          />
                        )}
                        <div>
                          通知条件：距离假期到期
                          <InputNumber style="width:200px!important; margin: 0 6px;" max={999} min={0} v-model:value={item.value} />
                          天时提醒
                        </div>
                        <div style="margin-top: 15px;">
                          通知方式：
                          {item.noticeOptions.length && (
                            <CheckboxGroup class="ml-15px" v-model:value={item.noticeWays} options={item.noticeOptions} />
                          )}
                          {!item.noticeOptions.length && <span>当前场景未配置可使用的通知方式</span>}
                        </div>
                        <div style="margin-top: 15px;">通知示例：您的年假，即将在2026-10-01日到期，请您及时关注</div>
                      </div>
                    );
                  })}
                </div>
              </TabPane>
            </Tabs>
          </>
        );
      },
      "footer-page": (): VNode => {
        return (
          <>
            <Button
              type="primary"
              loading={loading.value}
              onClick={() => {
                save();
              }}
            >
              保存
            </Button>
          </>
        );
      },
    };

    const loading = ref(false);
    const save = async (): Promise<void> => {
      loading.value = true;
      logger.info("save", startClock.value);
      const startway = startClock.value.noticeWays.map((item) => {
        return {
          noticeWay: item,
        };
      });
      const endway = endClock.value.noticeWays.map((item) => {
        return {
          noticeWay: item,
        };
      });
      const holidayExpireConfig = holidayExpire.value.map((item) => {
        return {
          label: item.label,
          sceneCode: item.sceneCode,
          value: item.value,
          noticeWays: item.noticeWays.map((noticeWay) => {
            return {
              noticeWay,
            };
          }),
        };
      });
      await addnewmessage({
        businessType: "ATTENDANCE_MANAGEMENT",
        sceneConfigDTOS: [
          {
            ...startClock.value,
            noticeWays: startway,
          },
          {
            ...endClock.value,
            noticeWays: endway,
          },
          ...holidayExpireConfig,
        ],
      });
      setTimeout(() => {
        loading.value = false;
      }, 1000);
      getData();
      message.success("保存成功");
    };

    const getStart = async (): Promise<void> => {
      const noticeOptions = await getNoticeOption("START_CLOCK");
      const { data } = await getnewmessage({
        businessType: "ATTENDANCE_MANAGEMENT",
        label: "START_CLOCK",
      });
      if (data.length === 0) {
        startClock.value.noticeOptions = noticeOptions;
        return;
      }
      startClock.value = {
        ...data.map((item: MessageConfigResult) => ({
          ...item,
          noticeWays: item.noticeWays.map((e) => e.noticeWay),
        }))[0],
        noticeOptions,
      };
      logger.info(data);
    };
    const getEnd = async (): Promise<void> => {
      const noticeOptions = await getNoticeOption("END_CLOCK");
      const { data } = await getnewmessage({
        businessType: "ATTENDANCE_MANAGEMENT",
        label: "END_CLOCK",
      });
      if (data.length === 0) {
        endClock.value.noticeOptions = noticeOptions;
        return;
      }
      endClock.value = {
        ...data.map((item: MessageConfigResult) => ({
          ...item,
          noticeWays: item.noticeWays.map((e) => e.noticeWay),
        }))[0],
        noticeOptions,
      };
      logger.info(data);
    };
    const getHolidayExpire = async (): Promise<void> => {
      const noticeOptions = await getNoticeOption("HOLIDAY_BALANCE_EXPIRE");
      const { data } = await getnewmessage({
        businessType: "ATTENDANCE_MANAGEMENT",
        label: "假期到期提醒",
      });
      if (data.length === 0) {
        holidayExpire.value = holidayExpire.value.map((item) => ({ ...item, noticeOptions }));
        return;
      }
      holidayExpire.value = data.map((item: MessageConfigResult) => ({
        id: Math.random(),
        value: item.value,
        noticeWays: item.noticeWays.map((e) => e.noticeWay),
        label: "假期到期提醒",
        sceneCode: "HOLIDAY_BALANCE_EXPIRE",
        noticeOptions,
      }));
    };
    const getNoticeOption = async (sceneCode: string): Promise<NoticeOption[]> => {
      return (await cubeMessageCenterService.sceneNotificationMethod(sceneCode)) as NoticeOption[];
    };
    const getData = async (): Promise<void> => {
      getStart();
      getEnd();
      getHolidayExpire();
    };

    onMounted(() => {
      getData();
    });
    return (): VNode => (
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </>
    );
  },
});
