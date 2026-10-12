<template>
  <div id="printFrom">
    <!--催办申请-->
    <template v-if="businessType === 'OFFICIAL_URGENT_WORK'">
      <div class="box-outer box">
        <div class="head">事项处理详情</div>
        <table>
          <tr>
            <td width="200px">督办事项</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">督办依据</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">责任部门</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">第一责任人</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">第二责任人</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">工作要求</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">完成时限</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">行政中心意见</td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">行政分管领导意见</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">总经理</td>
            <td></td>
          </tr>
        </table>
        <table>
          <tr>
            <td width="200px">董事长</td>
            <td></td>
          </tr>
        </table>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import Printjs from "print-js";
import { nextTick } from "vue";
const businessType = "OFFICIAL_URGENT_WORK";

//打印相关
const print = () => {
  // showPrintNode.value = true;
  nextTick(() => {
    Printjs({
      printable: "printFrom", // 要打印内容的id
      type: "html",
      targetStyles: ["*"],
      style: style, // 打印的内容是没有css样式的，此处需要string类型的css样式
      // style: `@page{size:auto;margin: 0cm;}`, // 打印的内容是没有css样式的，此处需要string类型的css样式
      scanStyles: false,
      // onLoadingEnd() {
      // 	showPrintNode.value = false;
      // },
    });
  });
};

const style = `
@page{size:auto;margin: 0cm;}
.box {
		border: 1px solid black;
		box-sizing: border-box;
	}
	.box-outer {
		padding-bottom: 40px;
    width:90%;
    margin: 0 auto;
		min-height: 100px;
	}
	.head {
		font-size: 32px;
		font-weight: bold;
		text-align: center;
		margin: 40px auto;
	}

	table {
		margin: 10px auto;
		width: 90%;
		font-size: 14px;
	}
	table,
	td,
	th {
		text-align: center;
		border: 0.5px solid #000;
		border-collapse: collapse;
	}

	table td {
		padding: 10px 30px;
	}
`;

defineExpose({
  print,
});
</script>
<style scoped lang="less">
#printFrom {
  .box {
    border: 1px solid black;
    box-sizing: border-box;
    padding-bottom: 40px;
  }
  .box-outer {
    width: 100%;
    min-height: 100px;
  }
  .head {
    font-size: 32px;
    font-weight: bold;
    text-align: center;
    margin: 40px auto;
  }

  table {
    margin: 10px auto;
    width: 90%;
    font-size: 14px;
  }
  table,
  td,
  th {
    text-align: center;
    border: 1px solid #000;
    border-collapse: collapse;
  }

  table td {
    padding: 10px 30px;
  }
}
</style>
