<template lang="pug">
div.ctr
  g-table(
    ref="tableRef"
    title="车道管理"
    :api="api"
    :columns="columns"
    :modal="modal"
    :scrollX="600"
    :btns="['add']"
    :search="search"
    @updateLeft="updateTree"
    :rules="rules")   
    template(v-slot:btn="{record}") 
      a-button(type="link" @click="downCode(record)") 下载车道码
    template(#content-left)
      a-spin(:spinning="loading")
        Tree(
          ref="treeRef" 
          :url="'laneTree'" 
          :placeholder="'请选择设备类型'" 
          :fieldNames="fieldNames" 
          :mode="false" 
          :treeSearch="false" 
          :isSelect="false" 
          :titleSlots="true" 
          :menuEvent="menuEvent" 
          @menuClick="menuClick" 
          :lastLevel="false"
          :keyword="'laneStatus'"
          :key="'deviceId'"
          :menuList="menuList"
          :menuSonList="menuSonList"
          )
  OldModalTable(
    v-model:value="visible"
    :columns="modalCol"
    :url="'equipTable'"
    :search="modalSearch"
    :searchLength="5"
    :width="1200"
    :selectType="'checkbox'"
    @modal-save="modalSave"
    :disabledKeys="disabledKeys")      
  div#qrcode(ref="qrcode")
</template>
<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  createVNode,
  onMounted,
  reactive,
  toRefs,
  watch,
  ref,
  nextTick,
} from "vue";
import _ from "lodash";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { millennial, timeFormat } from "@/utils/common";
import { onLine, simple } from "@/utils/enumerate";
import { useRoute, useRouter } from "vue-router";
import { Modal } from "ant-design-vue";
import { useStore } from "vuex";
import QRCode from "qrcodejs2-fix";
export default defineComponent({
  components: { ExclamationCircleOutlined },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const { proxy, ctx } = getCurrentInstance();
    const state = reactive({
      loading: false,
      model: {
        id: "",
        name: "",
      },
      fieldNames: {
        children: "children",
        label: "name",
        key: "id",
      },
      menuEvent: ["contextmenu"],
      menuList: [
        { name: "添加监控设备", key: "addEquip" },
        { name: "删除车道", key: "deleteLane" },
      ],
      menuSonList: [{ name: "删除设备", key: "deleteEquip" }],
      columns: [
        {
          dataIndex: "code",
          title: "车道编码",
          slots: {
            customRender: "code",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "name",
          title: "车道名称",
          slots: {
            customRender: "name",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "type",
          title: "车道模式",
          slots: {
            customRender: "type",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? (text === "EXIT" ? "出口" : "入口") : ""}
              >
                {text ? (text === "EXIT" ? "出口" : "入口") : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      api: {
        list: "lane",
        add: "laneAdd",
      },
      search: [
        {
          label: "车道模式",
          value: "type",
          placeholder: "车道模式",
          component: "gSelect",
          options: [
            { label: "全部", value: "" },
            { label: "出口", value: "EXIT" },
            { label: "入口", value: "ENTRANCE" },
          ],
        },
        { label: "", value: "keyword", placeholder: "车道名称" },
      ],
      TreeParams: {},
      modal: [
        {
          label: "区域",
          value: "areaIds",
          component: "gCascader",
          url: "getAreaList",
        },
        {
          label: "车道模式",
          value: "type",
          component: "gSelect",
          options: [
            { label: "出口", value: "EXIT" },
            { label: "入口", value: "ENTRANCE" },
          ],
        },
      ],
      rules: {
        areaIds: [{ required: true, message: "请选择区域" }],
        type: [{ required: true, message: "请选择车道模式" }],
      },
      modalSearch: [
        {
          label: "所属区域",
          value: "areaIds",
          component: "g-cascader",
          url: "getAreaList",
        },
        {
          label: "物联绑定",
          value: "iotBind",
          component: "g-select",
          options: simple,
          field: { name: "label", value: "value" },
          defaultValue: " ",
        },
        {
          label: "在线状态",
          value: "online",
          component: "g-select",
          options: onLine,
          field: { name: "label", value: "value" },
          defaultValue: " ",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "名称",
        },
      ],
      modalCol: [
        {
          dataIndex: "code",
          title: "设备编号",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "name",
          title: "设备名称",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "areaNames",
          title: "所属区域",
          slots: {
            customRender: "areaNames",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                content={text.length ? text.join("/") : ""}
                position="topLeft"
              >
                {text.length ? text.join("/") : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        },
        {
          dataIndex: "iotBind",
          title: "物联配置",
          slots: {
            customRender: "iotBind",
          },
          customRender: ({ text }) => {
            if (text) {
              return (
                <PopOver position="topLeft" content="是">
                  <span class="normalRow">是</span>
                </PopOver>
              );
            } else {
              return (
                <PopOver position="topLeft" content="否">
                  <span class="deleteRow">否</span>
                </PopOver>
              );
            }
          },
        },
        {
          dataIndex: "online",
          title: "在线状态",
          slots: {
            customRender: "online",
          },
          customRender: ({ text }) => {
            if (text) {
              return (
                <PopOver position="topLeft" content="在线">
                  <span class="normalRow">在线</span>
                </PopOver>
              );
            } else {
              return (
                <PopOver position="topLeft" content="离线">
                  <span class="deleteRow">离线</span>
                </PopOver>
              );
            }
          },
        },
      ],
      areaId: "",
      disabledKeys: [],
    });

    const qrcode = ref();
    const treeRef = ref();
    const tableRef = ref();
    const visible = ref(false);
    const treeSearch = ref("");

    const updateTree = async () => {
      state.loading = true;
      await treeRef.value.getData();
      state.loading = false;
    };

    const openModal = (key, record) => {
      visible.value = true;
    };

    const menuClick = async (key, record) => {
      if (key == "addEquip") {
        state.areaId = record.id;
        state.disabledKeys = await record.children?.map(
          (item) => item?.deviceId
        );
        visible.value = true;
      } else if (key === "deleteLane") {
        // 删除车道
        Modal.confirm({
          title: () => "删除确认",
          icon: () => createVNode(ExclamationCircleOutlined),
          content: () => "是否删除当前车道?",
          okText: () => "确认",
          okType: "danger",
          centered: true,
          cancelText: () => "取消",
          onOk() {
            // 删除设备
            proxy.$api.deleteLane(record.id,"delete" ).then(() => {
              proxy.$message.success("操作成功");
              updateTree();
              tableRef.value.getData();
            });
          },
        });
      } else {
        Modal.confirm({
          title: () => "删除确认",
          icon: () => createVNode(ExclamationCircleOutlined),
          content: () => "是否删除当前设备?",
          okText: () => "确认",
          okType: "danger",
          centered: true,
          cancelText: () => "取消",
          onOk() {
            // 删除设备
            proxy.$api.deletelaneEquip( record.id,"delete").then(() => {
              proxy.$message.success("操作成功");
              updateTree();
              tableRef.value.getData();
            });
          },
        });
      }
    };

    const modalSave = (selectedKeys) => {
      const params = {
        areaId: state.areaId,
        deviceIds: selectedKeys,
      };
      proxy.$api
        .equipAddBatch(params,"post" )
        .then(() => {
          proxy.$message.success("操作成功");
          updateTree();
        })
        .finally(() => {
          state.loading = false;
        });
    };

    const setQRCode = (record) => {
      new QRCode(qrcode.value, {
        width: 124,
        height: 124, // 高度
        text: `${
          record.type === "ENTRANCE"
            ? window.config.parkingEnterUrl
            : record.type === "EXIT"
            ? window.config.parkingOutUrl
            : ""
        }?laneCode=${record.code}`, // 二维${}码内容
        render: "canvas", // 设置渲染方式（有两种方式 table和canvas，默认是canvas）
        background: "#f0f", // 背景色
        foreground: "#ff0", // 前景色
      });
    };

    const clearQrcode = () => {
      // ctx.$refs?.qrcode.innerHTML = "";
      qrcode.value.innerHTML = "";
    };

    const downCode = (record) => {
      // 先生成二维码
      nextTick(async () => {
        // 先清除二维码
        clearQrcode();
        // 生成二维码
        await setQRCode(record);
        // 找到容器,以及图片
        let myCanvas = document
          .getElementById("qrcode")
          .getElementsByTagName("canvas");
        let img = document.getElementById("qrcode").getElementsByTagName("img");
        let a = document.createElement("a");
        // 设置a的href属性将canvas变成png格式
        let imgURL = myCanvas[0].toDataURL("image/jpg");
        let ua = navigator.userAgent;
        if (ua.indexOf("Trident") != -1 && ua.indexOf("Windows") != -1) {
          // IE内核 并且  windows系统 情况下 才执行;
          var bstr = atob(imgURL.split(",")[1]);
          var n = bstr.length;
          var u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          var blob = new Blob([u8arr]);
          window.navigator.msSaveOrOpenBlob(blob, `${record.name}.png`);
        } else if (ua.indexOf("Firefox") > -1) {
          //火狐兼容下载
          let blob = base64ToBlob(imgURL); //new Blob([content]);
          let evt = document.createEvent("HTMLEvents");
          evt.initEvent("click", true, true); //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
          a.download = " "; //下载图片名称，如果填内容识别不到，下载为未知文件，所以我这里就不填为空
          a.href = URL.createObjectURL(blob);
          a.dispatchEvent(
            new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
            })
          ); //兼容火狐
        } else {
          //谷歌兼容下载
          img.src = myCanvas[0].toDataURL("image/jpg");
          // a.href = myCanvas[0].toDataURL('image/png').replace('image/png', 'image/octet-stream')
          a.href = img.src;
          //设置下载文件的名字
          a.download = record.name;
          //点击
          a.click();
        }
      });
    };

    watch(
      () => visible.value,
      (n) => {
        if (n === false) {
          state.areaId = "";
        }
      }
    );

    return {
      qrcode,
      visible,
      treeRef,
      tableRef,
      treeSearch,
      ...toRefs(state),
      updateTree,
      openModal,
      menuClick,
      modalSave,
      downCode,
    };
  },
});
</script>
<style lang="less" scoped>
:deep(.content-left) {
  width: 220px;
  padding-right: 8px;
  text-align: left;
  border-right: 1px solid #f3f3f3;
  .ant-form-item {
    margin-bottom: 0;
  }
}
:deep(.content-right) {
  padding-left: 8px;
}
#qrcode {
  width: 300px;
  height: 300px;
  display: none;
  background-color: #ff0;
  position: fixed;
  top: 0;
  left: 0;
}
</style>
