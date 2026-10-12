import { message } from "ant-design-vue";
import zhCN from "ant-design-vue/lib/locale/zh_CN";
import { defineComponent } from "vue";
import { ref, reactive, onMounted, computed } from "vue";

import curDate from "./components/curDate";
import curTime from "./components/curTime";
import genericText from "./components/genericText";
import phone from "./components/phone";
import plateNo from "./components/plateNo";
import {
  broadcastPlayText,
  broadcastPlayTextCirculate,
  broadcastPlayTextStop,
  broadcastTemplatePage,
} from "@/infrastructure/api/broadcast";

import styles from "./broadcastPlay.module.less";

export const BroadcastPlay = defineComponent({
  name: "BroadcastPlay",
  props: {
    deviceDetail: { type: null, required: true },
  },
  setup(props, ctx) {
    const search = reactive({
      id: "",
      content: "",
      templateParams: [],
      type: "number",
      number: 1,
      period: "",
    });
    const typeData = [
      {
        value: "number",
        label: "次数播放",
      },
      {
        value: "cycle",
        label: "循环播放",
      },
    ];
    const rules = {
      id: [{ required: true, message: "" }],
      type: [{ required: true, message: "请选择模板" }],
      period: [{ required: true, message: "请选择播放时间" }],
    };
    const templateContent = ref([]);
    // 将模板内容拆分
    const variableList = computed(() => {
      if (search.content) {
        let reg = /\${[^}]*}|[^${]+/g;
        let result = search.content.match(reg);
        return result || [];
      } else {
        return [];
      }
    });
    // 匹配组件
    const templateCom = computed(() => (item) => {
      const componentMap = {
        curDate,
        curTime,
        phone,
        plateNo,
        genericText,
      };
      if (item.includes("${")) {
        let reg = /\$\{(.+?)\}/g;
        let result = reg.exec(item)[1];
        // let result = 'curDate';
        return {
          component: componentMap[result],
          name: result,
        };
      } else {
        return {
          component: "span",
          name: "span",
        };
      }
    });
    const getBroadcastTemplatePage = async () => {
      const res = await broadcastTemplatePage({
        pageNumber: 1,
        pageSize: 999,
      });
      templateContent.value = res.records;
    };
    const changeTemplate = (e) => {
      search.content = templateContent.value.find((item) => item.id == e).content;
      search.templateParams = [];
      let list = variableList.value;
      list.forEach((element, index) => {
        let result = templateCom.value(element);
        if (result.name !== "span") {
          search.templateParams.push({
            name: result.name,
            value: null,
          });
        } else {
          search.templateParams.push(null);
        }
      });
    };
    const broadcastPlayStop = async () => {
      await broadcastPlayTextStop({ deviceId: props.deviceDetail.baseArchivesInfo.id });
      message.success("停止成功");
    };
    const immediatelyBroadcast = async () => {
      formRef.value
        .validate()
        .then(async () => {
          let newTemplateParams = JSON.parse(JSON.stringify(search.templateParams));
          newTemplateParams = newTemplateParams.filter((res) => res !== null);
          newTemplateParams = newTemplateParams.map((item) => {
            return {
              ...item,
              value: item.value || "",
            };
          });
          const params: any = {
            id: search.id,
            broadcastTemplateCidontentParam: newTemplateParams,
            broadcastPlayDevices: [
              {
                id: props.deviceDetail.baseArchivesInfo.id,
                code: props.deviceDetail.baseArchivesInfo.code,
                name: props.deviceDetail.baseArchivesInfo.name,
                thirdPartyCode: props.deviceDetail.baseArchivesInfo.thirdPartyId,
              },
            ],
          };

          if (search.type === "number") {
            params.broadcastPlayNum = search.number;
            await broadcastPlayText(params);
          } else {
            params.startTime = search.period[0];
            params.endTime = search.period[1];
            await broadcastPlayTextCirculate(params);
          }
          message.success("下发成功");
        })
        .catch((err) => {});
    };
    onMounted(() => {
      getBroadcastTemplatePage();
    });

    return (): JSX.Element => (
      <>
        <div class="play-box">
          <a-form ref="formRef" rules={rules} class="play-form" model={search}>
            <a-form-item label="模板名称" name="id">
              <a-select
                onChange={changeTemplate}
                style="width: 100px"
                value={search.id}
                onUpdate:value={(v) => {
                  search.id = v;
                }}
              >
                {templateContent.map((item) => (
                  <a-select-option value={item.id}> {item.name}</a-select-option>
                ))}
              </a-select>
            </a-form-item>
            {variableList.length && (
              <a-form-item label="广播内容">
                <div class="template-box">
                  {variableList.map((item, index) => (
                    <div class="template-item" key={index}>
                      {templateCom(item).name == "span" && <span class="item-span"> {item}</span>}
                      {templateCom(item).name === "address" || templateCom(item).name === "name" ? (
                        <a-input
                          maxlength={20}
                          style="width: 300px"
                          value={search.templateParams[index].value}
                          onUpdate:value={(v) => {
                            search.templateParams[index].value = v;
                          }}
                          placeholder={templateCom(item).name === "address" ? "请输入地址" : "请输入姓名"}
                        ></a-input>
                      ) : null}
                      <component
                        style="width: 300px"
                        is={templateCom(item).component}
                        value={search.templateParams[index].value}
                        onUpdate:value={(v) => {
                          search.templateParams[index].value = v;
                        }}
                      ></component>
                    </div>
                  ))}
                </div>
              </a-form-item>
            )}
            <a-form-item label="广播方式" name="type">
              <a-select
                onChange={changeTemplate}
                style="width: 100px"
                value={search.type}
                onUpdate:value={(v) => {
                  search.type = v;
                }}
              >
                {typeData.map((item) => (
                  <a-select-option value={item.value}> {item.label}</a-select-option>
                ))}
              </a-select>
            </a-form-item>
            {search.type === "number" && (
              <a-form-item label="广播次数">
                {" "}
                <a-input-number
                  value={search.number}
                  onUpdate:value={(v) => {
                    search.number = v;
                  }}
                  min={1}
                />
              </a-form-item>
            )}
            {search.type === "cycle" && (
              <a-form-item label="播放时间" name="period">
                {" "}
                <a-config-provider locale={zhCN}>
                  {" "}
                  <a-range-picker
                    value={search.period}
                    onUpdate:value={(v) => {
                      search.period = v;
                    }}
                    value-format="YYYY-MM-DD"
                  />
                </a-config-provider>
              </a-form-item>
            )}
          </a-form>
          <div class="play-but">
            <a-button type="primary" onClick={immediatelyBroadcast}>
              {" "}
              立即广播
            </a-button>
            <a-button style="margin-left: 10px;" onClick={broadcastPlayStop}>
              {" "}
              停止广播
            </a-button>
          </div>
        </div>
      </>
    );
  },
});

export default BroadcastPlay;
