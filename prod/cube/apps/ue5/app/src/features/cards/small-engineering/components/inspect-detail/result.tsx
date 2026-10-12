import { defineComponent } from "vue";
import { ref, watch, computed } from "vue";

import { kkFilePreview } from "@ghcloud/cube-utils";

import { isHttpUrl } from "@/infrastructure/utils/common";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import NoData from "@/shared-ui/panel/noData";

import styles from "./result.module.less";

export const Result = defineComponent({
  name: "Result",
  props: {
    dataSource: { type: null, required: true, default: null },
  },
  setup(props, ctx) {
    interface Props {
      dataSource: any;
    }
    const loadingDataSource = ref(false);
    const typeList = ["doc", "docx", "excel", "xlsx", "xls", "pdf", "ppt", "txt"];
    const imgs = ref();
    const files = ref();
    const standardList = computed(() => {
      return props.dataSource?.standardVOS || [];
    });
    const preview = (item): void => {
      if (typeList.includes(item.type ?? "")) {
        kkFilePreview(item);
      }
    };
    const httpImgUrl = (path) => {
      let url = "";
      const baseUrl = sessionStorage.getItem("market-baseUrl");
      if (!isHttpUrl(path)) {
        url = baseUrl + path;
      } else {
        url = path;
      }
      return url;
    };

    return (): JSX.Element => (
      <>
        <div class="record">
          <div style="margin-top: 15px; width: 96%; margin-left: 2%;">
            <a-spin spinning={loadingDataSource.value}>
              <div class="table_content">
                {standardList.length === 0 && (
                  <div class="no-content">
                    {" "}
                    <NoData />
                  </div>
                )}
                <div>
                  <div class="inspectResult">
                    {standardList.map((item) => (
                      <div key={item.id} class="mb-10">
                        <div class="title mb-10"> {item?.standardName || "--"}</div>
                        <div>
                          {item?.itemVOS.map((ele, index) => (
                            <div class="mb-10" key={ele.id}>
                              <div class="flex-start mb-5">
                                <div class="sortNum">{index + 1}、</div>
                                <span>{ele?.itemName || "--"}：</span>
                                <span class={[!ele?.errorValueFlag ? "NORMAL" : "ABNORMAL"]}> {ele?.itemResultName || "--"}</span>
                              </div>
                              <div class="flex-start mb-5">
                                <div class="sortNum"></div>
                                <span>
                                  描述信息：
                                  {ele?.errorDesc || "--"}
                                </span>
                              </div>
                              {ele?.fileVOS?.length > 0 && (
                                <div class="flex">
                                  <div class="sortNum"></div>
                                  {ele?.fileVOS.map((file) => (
                                    <div class="flex-start" key={file.id}>
                                      {!typeList.includes(file.type) && (
                                        <a-image src={file.path} style="width:60px; margin: 10px;"></a-image>
                                      )}
                                      <div onClick={preview(file)} style="margin-right: 10px;text-align: center;color: #e2e2e2;">
                                        <a-image height="30px" preview={false} src={getAssetsImage("sn/jl.png")}></a-image>
                                        <div class="file-name"> {file.name}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </a-spin>
          </div>
        </div>
      </>
    );
  },
});

export default Result;
