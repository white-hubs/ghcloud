import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from "vue";

import { CubeMeattradeService, type ArrangeLastInfoVo, type PorkReport, type SpotCheckStat } from "@ghcloud/cube-slide-rail-service";

import { authStore } from "@/application/auth/auth-store";

import styles from "./tally-data.module.less";

/** 报备数据 */
interface Props {
  info?: ArrangeLastInfoVo;
}
/** 理货数量信息 */
export const TallyData = defineComponent({
  props: ["info", "porkReport"],
  setup: (props: Props) => {
    const porkReportFiles = ref([]);
    // 报备数据
    const porkReport = computed(() => {
      const data = Object.assign(props.info?.porkReport ?? {}, spotCheckInfo.value);
      return data as PorkReport & SpotCheckStat;
    });
    const isEmpty = (value: unknown): boolean => {
      return value === undefined || value === null || (typeof value === "string" && !value.trim());
    };
    const getPorkReportValue = (key: keyof PorkReport | keyof SpotCheckStat, e: { unit?: string } | any): unknown => {
      const value = porkReport.value?.[key];
      return isEmpty(value) ? "--" : `${value}${e?.unit || ""}`;
    };
    // const porkReportFiles = computed(() => {
    //   return porkReport.value?.files?.map(item => {
    //     let url = item?.path
    //     if (!item?.path?.includes('http')) {
    //       url = window.location.origin + item?.path
    //     }
    //     return url
    //   })
    // })
    // 商户ID
    const supplierId = computed(() => {
      return props.info?.supplierInfo?.id ?? "";
    });

    const spotCheckInfo = ref<SpotCheckStat>();
    const getSpotCheckData = async (): Promise<void> => {
      try {
        const cubeMeattradeService = new CubeMeattradeService(authStore);
        try {
          spotCheckInfo.value = await cubeMeattradeService.getSpotCheckStat(supplierId.value);
        } catch (error) {}
      } catch (error) {}
    };
    const getFileData = async () => {
      try {
        const cubeMeattradeService = new CubeMeattradeService(authStore);
        const res = await cubeMeattradeService.pratiqueRegisterFiles(props.info?.porkReport.id);
        const blobData = [];
        res.forEach((element) => {
          blobData.push(cubeMeattradeService.previewFile(element.fileUrl));
        });
        const fileData = await Promise.all(blobData);
        porkReportFiles.value = fileData.map((e) => {
          const imgUrl = URL.createObjectURL(e);
          return imgUrl;
        });
      } catch (error) {}
    };
    watch(
      () => props.info,
      () => {
        getSpotCheckData();
        getFileData();
      },
      { deep: true },
    );
    const refreshTime = 10;
    let timer: string | number | NodeJS.Timeout | null | undefined = null;
    onMounted(() => {
      // getSpotCheckData()
      timer = setInterval(() => {
        getSpotCheckData();
      }, refreshTime * 1000);
    });
    onUnmounted(() => {
      timer && clearInterval(timer);
    });
    const dataList = ref([
      {
        title: "报备数据",
        content: [
          { label: "报备单号：", key: "code", value: "", type: "text", color: "#ffffff" },
          { label: "报备片数：", key: "reportSlices", unit: "片", value: "", type: "text", color: "#ffffff" },
          { label: "报备重量：", key: "reportWeight", unit: "kg", value: "", type: "text", color: "#ffffff" },
          { label: "来货车辆：", key: "vehiclePlate", value: "", type: "text", color: "#ffffff" },
          { label: "屠宰场：", key: "abattoirName", value: "", type: "text", color: "#ffffff" },
          {
            label: "检疫证明：",
            value: [],
            key: "files",
            type: "img",
          },
        ],
      },
      {
        title: "食安数据",
        content: [
          { label: "抽检总次数：", key: "totalQty", unit: "次", value: "", type: "text", color: "#ffffff" },
          { label: "抽检总合格数：", key: "passQty", unit: "次", value: "", type: "text", color: "#ffffff" },
          { label: "检测合格率：", key: "passRate", unit: "%", value: "", type: "text", color: "#58FAB6" },
        ],
      },
    ]);
    return () => (
      <>
        {dataList.value.map((item) => (
          <div key={item.title}>
            <div class={styles.title}>{item.title}</div>
            <div class={styles.content}>
              {item.content.map((x) => (
                <div key={x.label} class={styles.item}>
                  <label>{x.label}</label>
                  {x.type === "text" ? (
                    <span style={{ color: ` ${x.color ?? "#ffffff"} ` }}>
                      {getPorkReportValue(x.key as keyof PorkReport | keyof SpotCheckStat, x)}
                    </span>
                  ) : porkReportFiles.value && porkReportFiles.value?.length === 0 ? (
                    <span>--</span>
                  ) : (
                    <div class={styles.imgs}>
                      <a-image-preview-group>
                        {porkReportFiles.value?.map((item, index) => {
                          return <a-image src={item} key={`${item}-${index}`} />;
                        })}
                      </a-image-preview-group>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div />
      </>
    );
  },
});
