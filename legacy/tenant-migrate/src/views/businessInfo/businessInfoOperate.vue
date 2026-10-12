<template lang="pug">
g-layout(:title="pageTitle")
  template(#content-table)
    .detail-form.g-detail-form-wrap
      a-form(layout="inline" :model="model" :rules="rules" ref="form")
        template(v-if="pageType==='edit'")
          a-form-item(:label="`${KEYWORD_ALIAS.company}名称`" name="name")
            a-input(v-model:value.trim="model.name" allowClear :maxLength="20" placeholder="请输入商户名称" disabled)
          a-form-item(:label="`${KEYWORD_ALIAS.company}编号`" name="code")
            a-input(v-model:value.trim="model.code" allowClear :maxLength="5" :placeholder="`请输入${KEYWORD_ALIAS.company}编号`" disabled)
          a-form-item(label="总建筑面积(m²)" name="floorArea")
            a-input(v-model:value.trim="model.floorArea" allowClear type='number' :maxLength="5" placeholder="请输入总建筑面积" )
          a-form-item(label="占地面积(亩)" name="areaCovered")
            a-input(v-model:value.trim="model.areaCovered" allowClear type='number' :maxLength="5" placeholder="请输入占地面积" )
          a-form-item(label="服务热线" name="serviceHotLine")
            a-input(v-model:value.trim="model.serviceHotLine" allowClear type='number' :maxLength="20" placeholder="请输入服务热线" )
          a-form-item(label="投诉电话" name="complaintHotLine")
            a-input(v-model:value.trim="model.complaintHotLine" allowClear type='number' :maxLength="20" placeholder="请输入投诉电话" )
          a-form-item.updatePic(:label="`${KEYWORD_ALIAS.company}LOGO`")
            g-upload(:file="model.logo" :max="1" @changeFile="changeFile" businessKey="ouaa" size='10' :sceneCode="GLOBAL_SCENE_CODE.ouaaTenant")
          a-form-item.updatePic(:label="`${KEYWORD_ALIAS.company}宣传图/视频`")
            g-upload(
              :file="model.files"
              :max="1"
              @changeFile="changeFileFileIds"
              businessKey="ouaa"
              size="1024"
              accept=".jpg,.jpeg,.png,.svg,.mp4,.webm,.mov,.avi,.mkv,.m4v"
              :sceneCode="GLOBAL_SCENE_CODE.ouaaTenant"
            )
          a-form-item(label="区域")
            a-cascader(v-model:value="model.locations" allowClear placeholder="请选择" :options="cityData")
          a-form-item(label="详细地址")
            a-input-search(v-model:value.trim="model.address" readonly allowClear :maxLength="20" placeholder="点击选择并输入" enter-button="点击选点" @search="openMapModal")
          a-form-item.form-item-area-scope(label="区域范围")
            .area-scope-control
              a-button(@click="openAreaMapModal" type='primary') 选择区域
              span.area-scope-control__hint 点击选择，弹出GPS地图弹窗，支持用户选择多个定位点，用于划定区域范围
          a-form-item(label="区域范围名称" name="lntAndLatScopeName")
            a-input(v-model:value.trim="model.lntAndLatScopeName" allowClear :maxLength="50" placeholder="请输入区域范围名称")
          a-form-item.remark(:label="`${KEYWORD_ALIAS.company}简介`" name="remark"  )
            a-textarea(v-model:value="model.remark" showCount :maxlength="800" allowClear :auto-size="{ minRows: 2, maxRows: 18 }" placeholder="请输入")
        template(v-else)  
          a-form-item(:label="`${KEYWORD_ALIAS.company}名称`" name="name")
            span {{model.name? model.name:'--'}}
          a-form-item(:label="`${KEYWORD_ALIAS.company}编号`" name="code")
            span {{model.code? model.code:'--'}}
          a-form-item(label="总建筑面积(m²)" name="floorArea")
            span {{model.floorArea? model.floorArea:'--'}}
          a-form-item(label="占地面积(亩)" name="floorArea")
            span {{model.areaCovered? model.areaCovered:'--'}}
          a-form-item(label="服务热线" name="floorArea")
            span {{model.serviceHotLine? model.serviceHotLine:'--'}}
          a-form-item(label="投诉电话" name="floorArea")
            span {{model.complaintHotLine? model.complaintHotLine:'--'}}
          a-form-item.updatePic(:label="`${KEYWORD_ALIAS.company}LOGO`" )
            a-image(:src="imageUrl" :width="50" :height="50" v-if="imageUrl")
            span(v-else) --
          a-form-item.updatePic(:label="`${KEYWORD_ALIAS.company}宣传图/视频`" )
            video.promotion-video(v-if="imageUrlFileIds && promotionIsVideo" :src="imageUrlFileIds" controls)
            a-image(:src="imageUrlFileIds" :width="120" v-else-if="imageUrlFileIds")
            span(v-else) --
          a-form-item.updatePic(label="区域" )
            a-cascader(:value="model.locations" disabled :options="cityData" v-if='model.locations.length>0')
            span(v-else) --
          a-form-item.updatePic(label="详细地址" )
            span {{model.address? model.address:'--'}}
          a-form-item.updatePic(label="区域范围" )
            a-button(v-if="model.lntAndLatScope" type='link' @click="openAreaMapModal") 点击查看
            span(v-else) --
          a-form-item.updatePic(label="区域范围名称")
            span {{model.lntAndLatScopeName? model.lntAndLatScopeName:'--'}}
          a-form-item.remark(:label="`${KEYWORD_ALIAS.company}简介`" name="remark")
            span {{model?.remark? model.remark:'--'}}
  template(#footer-page)
    template(v-if="pageType==='edit'")
      a-space(:size="16")
        a-button(@click="cancel") 取消
        a-button(type="primary" @click="onSubmit('')") 保存
    template(v-else)  
      a-button(type="primary" @click="edit") 编辑
</template>
<script lang="jsx">
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons-vue";
import { replaceObjectKeys } from "@pansy/utils";
import { getCurrentInstance, defineComponent, onMounted, reactive, toRefs, watch, toRaw, ref, onBeforeUnmount, createApp } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

import { KEYWORD_ALIAS } from "@ghcloud/cube-business-alias-manage-plugin";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { usePageName } from "@ghcloud/cube-utils";
import { useMapModal } from "@ghcloud/generic-component/src/map-modal/cube-map-modal";

import cityData from "./city";
import { getToken, getEnterpriseCode } from "@/services/AccountService";

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}

const PROMOTION_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"];

function isPromotionVideo(url = "", suffix = "") {
  const lowerUrl = String(url).toLowerCase();
  const lowerSuffix = suffix ? String(suffix).toLowerCase().replace(/^\./, "") : "";
  return PROMOTION_VIDEO_EXTENSIONS.some((ext) => {
    const extName = ext.slice(1);
    return lowerUrl.includes(ext) || lowerSuffix === extName;
  });
}
export default defineComponent({
  components: {
    PlusOutlined,
    LoadingOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const { pageTitle } = usePageName();
    const formState = reactive({
      data: {},
      model: {
        locations: [],
        fileIds: [],
        lntAndLatScope: "",
        lntAndLatScopeName: "",
      },
      headers: null,
      pageType: "detalis",
    });

    const status = ref("");
    const form = ref();

    const rules = {
      name: [
        {
          required: true,
          message: "请输入",
        },
      ],
      code: [
        {
          required: true,
          message: "请输入正确格式(整数)",
          pattern: new RegExp(/^[+]{0,1}(\d+)$/, "g"),
        },
      ],
      userAdminId: [
        {
          required: true,
          message: "请输入",
        },
      ],
      enabled: [
        {
          required: true,
          message: "请输入",
        },
      ],
    };

    const imageUrl = ref("");
    const imageUrlFileIds = ref("");
    const promotionIsVideo = ref(false);
    const showMap = ref(false);
    const chooseAddressText = ref("");
    const chooselntAndLat = ref("");
    const areaMapData = ref([]);
    /*点击地图*/
    const clickMap = (map) => {
      if (map.lat) {
        // 根据经纬度获取地址信息
        AMap.plugin("AMap.Geocoder", function () {
          var geocoder = new AMap.Geocoder({});
          geocoder.getAddress(map, function (status, result) {
            if (status === "complete" && result.info === "OK") {
              chooseAddressText.value = result.regeocode.formattedAddress;
              chooselntAndLat.value = `${map.lat},${map.lng}`;
            }
          });
        });
      }
    };
    const handleMapOk = () => {
      if (chooseAddressText.value) {
        formState.model.address = chooseAddressText.value;
        formState.model.lntAndLat = chooselntAndLat.value;
      }
      showMap.value = false;
    };

    const onSubmit = (data) => {
      formState.model.location = formState.model.locations.join("-");
      form.value.validate().then(() => {
        proxy.$api.tenantInfo("put", toRaw(formState.model)).then((res) => {
          proxy.$message.success("操作成功");
          formState.pageType = "details";
          getData();
        });
      });
    };

    const cancel = () => {
      form.value.resetFields();
      formState.pageType = "details";
    };

    const edit = () => {
      formState.pageType = "edit";
    };

    const getData = () => {
      const tenantCode = JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code;
      if (tenantCode !== null || tenantCode !== undefined) {
        proxy.$api.tenantId("get", { code: tenantCode }).then((res) => {
          formState.model = res;
          if (res.logo && res.logo instanceof Array) {
            // imageUrl.value = `/filesource/${res.logo.path}`;
            formState.model.logo = replaceObjectKeys(res.logo, {
              path: "url",
              id: "id",
              businessKey: "businessKey",
              name: "name",
              refCount: "refCount",
              size: "size",
              suffix: "suffix",
              type: "type",
            });
          } else if (res.logo && res.logo instanceof Object) {
            imageUrl.value = res.logo.path;
            formState.model.logo = replaceObjectKeys([res.logo], {
              path: "url",
              id: "id",
              businessKey: "businessKey",
              name: "name",
              refCount: "refCount",
              size: "size",
              suffix: "suffix",
              type: "type",
            });
          } else {
            formState.model.logo = [];
          }
          formState.model.fileId = res.logoId;
          if (res.files && res.files.length) {
            formState.model.fileIds = res.files.map((e) => e.id);
            formState.model.files = res.files.map((e) => {
              return {
                uid: e.id,
                name: e.name,
                status: "done",
                url: e.path,
                suffix: e.suffix,
              };
            });
            const firstFile = formState.model.files[0];
            imageUrlFileIds.value = firstFile.url;
            promotionIsVideo.value = isPromotionVideo(firstFile.url, res.files[0].suffix);
          } else {
            imageUrlFileIds.value = "";
            promotionIsVideo.value = false;
          }
          // 解析区域范围数据
          if (res.lntAndLatScope) {
            formState.model.lntAndLatScope = res.lntAndLatScope;
            areaMapData.value = res.lntAndLatScope.split(";").map((item) => {
              const [lng, lat, address] = item.split(",");
              return {
                lng: Number(lng),
                lat: Number(lat),
                address: address || "",
              };
            });
          } else {
            formState.model.lntAndLatScope = "";
            areaMapData.value = [];
          }
        });
      } else {
        formState.model = {
          name: "",
          code: "",
          userAdminId: "",
          enabled: true,
          remark: "",
        };
      }
    };
    const changeFile = (data) => {
      if (data[0]) {
        formState.model.fileId = data[0];
      } else {
        formState.model.fileId = null;
        imageUrl.value = null;
        formState.model.logo = [];
      }
    };
    const changeFileFileIds = (data) => {
      if (data[0]) {
        formState.model.fileIds = data;
      } else {
        formState.model.fileIds = [];
      }
    };

    onMounted(async () => {
      const token = await getToken();
      const code = await getEnterpriseCode();
      formState.headers = {
        Authorization: "Bearer " + token.access_token,
        terminal: "kh-tenant-web",
        tenant: code,
      };
      getData();
    });

    const { showMapModal } = useMapModal();

    function openMapModal() {
      const centerArr = formState.model.lntAndLat ? formState.model.lntAndLat.split(",").reverse() : ["114.057939", "22.543527"];
      showMapModal({
        address: formState.model.address,
        center: {
          lng: centerArr[0],
          lat: centerArr[1],
        },
        modalConfirm: (data) => {
          formState.model.address = data.address;
          formState.model.lntAndLat = `${data.lat},${data.lng}`;
        },
      });
    }

    // 监听区域范围数据变化，转换为字符串格式存储
    watch(
      () => areaMapData.value,
      () => {
        if (areaMapData.value && areaMapData.value.length > 0) {
          formState.model.lntAndLatScope = areaMapData.value.map((item) => `${item.lng},${item.lat},${item.address}`).join(";");
        } else {
          formState.model.lntAndLatScope = "";
        }
      },
    );

    async function openAreaMapModal() {
      // 如果已有数据，先解析
      if (formState.model.lntAndLatScope) {
        areaMapData.value = formState.model.lntAndLatScope.split(";").map((item) => {
          const [lng, lat, address] = item.split(",");
          return {
            lng: Number(lng),
            lat: Number(lat),
            address: address || "",
          };
        });
      } else {
        areaMapData.value = [];
      }

      // 获取初始中心位置：优先使用第一个点位，其次使用详细地址的定位，最后使用默认位置
      let initialCenter = { lng: 114.057939, lat: 22.543527 }; // 默认位置
      if (areaMapData.value && areaMapData.value.length > 0) {
        // 如果有已选择的点位，使用第一个点位的坐标
        initialCenter = {
          lng: areaMapData.value[0].lng,
          lat: areaMapData.value[0].lat,
        };
      } else if (formState.model.lntAndLat) {
        // 如果没有点位，使用详细地址的定位
        const centerArr = formState.model.lntAndLat.split(",");
        if (centerArr.length === 2) {
          // lntAndLat 格式是 "lat,lng"，需要转换为 "lng,lat"
          initialCenter = {
            lng: Number(centerArr[1]),
            lat: Number(centerArr[0]),
          };
        }
      }

      // 动态导入地图相关模块
      const {
        defineComponent: defineComponentModal,
        ref: refModal,
        onMounted: onMountedModal,
        onBeforeUnmount: onBeforeUnmountModal,
      } = await import("vue");
      const { Modal, Button, Input, Row, Col, Space, Spin, Empty, message } = await import("ant-design-vue");
      const { CubeMapLeaflet } = await import("@ghcloud/cube-map-plugins");
      const { authStore } = await import("@/api/auth-store");

      const root = document.createElement("div");
      document.body.appendChild(root);

      const AreaMapModal = defineComponentModal({
        setup() {
          const visible = refModal(true);
          const mapLoading = refModal(true);
          const btnLoading = refModal(false);
          const address = refModal("");
          const dataList = refModal(
            areaMapData.value.map((item) => ({
              ...item,
              id: `${Date.now()}_${Math.random()}`,
              marker: null,
            })),
          );

          let cubeMap = null;
          let polyline = null;
          let mapLoadStatus = false;

          const handleCancel = () => {
            visible.value = false;
            setTimeout(() => {
              app.unmount();
              if (root.parentNode) {
                document.body.removeChild(root);
              }
            }, 300);
          };

          const handleOk = () => {
            if (dataList.value.length < 3) {
              message.warning("请选择至少3个位置");
              return;
            }
            areaMapData.value = dataList.value.map((e) => ({
              lng: e.lng,
              lat: e.lat,
              address: e.address,
            }));
            handleCancel();
          };

          const handleLocation = async () => {
            if (!address.value) {
              message.warning("请输入位置信息");
              return;
            }
            if (cubeMap) {
              try {
                btnLoading.value = true;
                const res = await cubeMap.getLntLatByAddress(address.value);
                cubeMap.setCenter(res.lng, res.lat);
              } catch {
                message.error("定位失败");
              } finally {
                btnLoading.value = false;
              }
            }
          };

          const updatePolyline = () => {
            if (polyline) {
              polyline.remove();
              polyline = null;
            }
            if (dataList.value.length > 2 && cubeMap) {
              const points = dataList.value.map((e) => ({
                lng: e.lng,
                lat: e.lat,
              }));
              points.push({
                lng: dataList.value[0].lng,
                lat: dataList.value[0].lat,
              });
              polyline = cubeMap.createPolyline(points);
            }
          };

          const removeMarker = async (index) => {
            const item = dataList.value[index];
            if (item.marker) {
              item.marker.remove();
            }
            dataList.value.splice(index, 1);
            updatePolyline();
          };

          const batchAddMarkers = async () => {
            if (!cubeMap || !mapLoadStatus) return;
            cubeMap.clearMarkers();
            for (const item of dataList.value) {
              if (!item.marker) {
                const marker = await cubeMap.addMarker({
                  iconSize: [19, 31.5],
                  position: {
                    lng: item.lng,
                    lat: item.lat,
                  },
                });
                item.marker = marker;
              }
            }
            updatePolyline();
          };

          onMountedModal(async () => {
            cubeMap = new CubeMapLeaflet(authStore);
            try {
              await cubeMap.renderMap("areaMapContainer");
              mapLoadStatus = true;
              cubeMap.registerMapClickEvent();
              cubeMap.setCenter(initialCenter.lng, initialCenter.lat);

              cubeMap.onMapClick = async (event) => {
                try {
                  const marker = await cubeMap.addMarker({
                    iconSize: [19, 31.5],
                    position: {
                      lng: event.lng,
                      lat: event.lat,
                    },
                  });

                  const addressText = await cubeMap
                    .getAddressByLntLat(event.lng, event.lat)
                    .then((res) => res?.address || "地址解析中...")
                    .catch(() => "地址解析失败");

                  dataList.value.push({
                    lng: event.lng,
                    lat: event.lat,
                    address: addressText,
                    id: `${Date.now()}_${Math.random()}`,
                    marker,
                  });

                  updatePolyline();
                } catch (error) {
                  message.error("添加标记失败");
                }
              };

              await batchAddMarkers();
              mapLoading.value = false;
            } catch (error) {
              message.error("地图渲染失败，请刷新页面重试");
              mapLoading.value = false;
            }
          });

          onBeforeUnmountModal(() => {
            if (cubeMap) {
              cubeMap.destroy();
            }
          });

          return () => (
            <Modal
              visible={visible.value}
              title="区域范围选择"
              width="1400px"
              onOk={handleOk}
              onCancel={handleCancel}
              okText="确定"
              cancelText="取消"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <Input v-model:value={address.value} maxlength={999} placeholder="请输入位置信息" style={{ width: "400px" }} />
                <Button type="primary" onClick={handleLocation} loading={btnLoading.value}>
                  定位
                </Button>
              </div>
              <Spin size="large" tip="地图渲染中" spinning={mapLoading.value}>
                <Row gutter={10}>
                  <Col span={18}>
                    <div id="areaMapContainer" style={{ width: "100%", height: "500px", cursor: "unset !important" }} />
                  </Col>
                  <Col span={6}>
                    <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                      {dataList.value.map((e, i) => (
                        <div key={e.id} style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                          <div style={{ marginBottom: "5px" }}>
                            {i + 1}. {e.address}
                          </div>
                          <Space>
                            <Button
                              type="link"
                              onClick={() => {
                                cubeMap?.setCenter(e.lng, e.lat);
                              }}
                            >
                              定位到中心
                            </Button>
                            <Button type="link" danger onClick={() => removeMarker(i)}>
                              移除
                            </Button>
                          </Space>
                        </div>
                      ))}
                      {dataList.value.length === 0 && <Empty description="请点击左侧地图区域添加位置" />}
                    </div>
                  </Col>
                </Row>
              </Spin>
            </Modal>
          );
        },
      });

      const app = createApp(AreaMapModal);
      app.mount(root);
    }

    return {
      form,
      rules,
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 14,
      },
      ...toRefs(formState),
      changeFile,
      changeFileFileIds,
      onSubmit,
      cancel,
      status,
      imageUrl,
      imageUrlFileIds,
      promotionIsVideo,
      getData,
      edit,
      cityData,
      showMap,
      pageTitle,
      clickMap,
      GLOBAL_SCENE_CODE,
      handleMapOk,
      openMapModal,
      openAreaMapModal,
      areaMapData,
      KEYWORD_ALIAS,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");

.promotion-video {
  display: block;
  max-width: 300px;
  max-height: 200px;
}
</style>
