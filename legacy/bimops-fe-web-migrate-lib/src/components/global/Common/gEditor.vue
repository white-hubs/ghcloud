<template>
  <div>
    <div :id="`editor${id}`"></div>
  </div>
</template>
<script>
import { defineComponent, nextTick, onMounted, watch, ref, computed } from "vue";
import { useStore } from "vuex";
import E from "wangeditor";

import { getToken } from "../../../services/AccountService";
export default defineComponent({
  name: "gEdit",
  props: {
    id: {
      type: String,
      default: "id",
    },
    height: {
      type: Number,
      default: 350,
    },
    zIndex: {
      type: Number,
      default: 2,
    },
    text: {
      type: String,
    },
    max: {
      type: Number,
      default: 1,
    },
    businessKey: {
      type: String,
      default: "ouaa",
    },
  },
  emits: ["get-html"],
  setup(props, { emit }) {
    const store = useStore();
    const editorRef = ref();
    let editor;

    const getHtml = () => {
      const text = editor.txt.html();
      emit("get-html", text);
    };

    onMounted(async () => {
      const token = await getToken();
      nextTick(() => {
        editor = new E(document.getElementById(`editor${props.id}`));
        editor.config.height = props.height;
        editor.config.zIndex = props.zIndex;
        editor.config.menus = [
          "head", // 标题
          "bold", // 粗体
          "fontSize", // 字号
          "fontName", // 字体
          "italic", // 斜体
          "underline", // 下划线
          "strikeThrough", // 删除线
          "foreColor", // 文字颜色
          "backColor", // 背景颜色
          "link", // 插入链接
          "list", // 列表
          "justify", // 对齐方式
          "quote", // 引用
          "emoticon", // 表情
          "image", // 插入图片
          "table", // 表格
          "code", // 插入代码
          "undo", // 撤销
          "redo", // 重复
          "indent", //分割线
          "lineHeight", //行高
          "splitLine", //全屏
        ];
        // 图片上传地址
        editor.config.uploadImgServer = "/api/file/file";
        // 图片类型--如果不希望限制类型，可将其设为空数组
        editor.config.uploadImgAccept = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
        // 限制一次最多能传几张图片
        editor.config.uploadImgMaxLength = props.max;
        editor.config.uploadFileName = "file";
        editor.config.uploadImgParams = {
          tenant: JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code,
          businessKey: props.businessKey,
        };
        editor.config.uploadImgHeaders = {
          Authorization: `Bearer ${token?.access_token}`,
          tenant: JSON.parse(sessionStorage.getItem("GH-NowEnterprise")).code,
          terminal: window.config.terminal,
        };

        editor.config.uploadImgHooks = {
          // 上传图片超时
          timeout: function (xhr) {},
          // 图片上传并返回了结果，想要自己把图片插入到编辑器中
          // 例如服务器端返回的不是 { errno: 0, data: [...] } 这种格式，可使用 customInsert
          customInsert: function (insertImgFn, result) {
            // result 即服务端返回的结果
            // insertImgFn 可把图片插入到编辑器，传入图片 src ，执行函数即可
            insertImgFn(result.data.path);
          },
        };
        editor.create();
        // 设置内容
        editor.txt.html(props.text);
        // 自定义 header
      });
    });

    watch(
      () => props.text,
      (n) => {
        editor?.txt.html(props.text);
      },
    );

    return {
      editorRef,
      getHtml,
    };
  },
});
</script>
