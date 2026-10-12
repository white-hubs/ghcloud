<template>
  <div id="printFrom">
    <table cellspacing="1" cellpadding="0">
      <tr>
        <td colspan="4" class="table_title">维修工单</td>
      </tr>
      <tr>
        <td colspan="4" class="table_content">
          工单编号：{{ faultInfo.code }} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 派单时间：{{
          processInputForm[0]?.createTime }}
        </td>
      </tr>
      <tr>
        <td class="table_name">报修档位</td>
        <td class="table_content td_content">{{ faultInfo.objName }}</td>
        <td class="table_name">报修类别</td>
        <td class="table_content td_content">{{ faultInfo.faultTypeName }}</td>
      </tr>
      <tr>
        <td class="table_name">完成时限</td>
        <td class="table_content">3天</td>
        <td class="table_name">预计完成时间</td>
        <td class="table_content">{{ completionTime }} </td>
      </tr>
      <tr>
        <td class="table_name">客户姓名</td>
        <td class="table_content">{{ faultInfo.submitter }}</td>
        <td class="table_name">联系电话</td>
        <td class="table_content">{{ faultInfo.submitterPhone }}</td>
      </tr>
      <tr class="describe">
        <td class="table_name">客户需求描述</td>
        <td colspan="3" class="table_content">{{ faultInfo.remark }}</td>
      </tr>
      <tr class="describe">
        <td class="table_name">处理结果描述</td>
        <td colspan="3" class="table_content"></td>
      </tr>
      <tr class="info">
        <td class="table_name">处理人签字</td>
        <td class="table_content"></td>
        <td class="table_name">处理完毕时间</td>
        <td class="table_content">{{ processInputForm[2]?.createTime }}</td>
      </tr>
      <tr class="info">
        <td class="table_name">客户满意度</td>
        <td class="table_content"></td>
        <td class="table_name">客户签字</td>
        <td class="table_content"></td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="jsx">
import { ref, reactive, onMounted, getCurrentInstance, nextTick } from 'vue'
import { useRoute } from "vue-router";
import Printjs from "print-js";
import moment from "moment"

const style = `
@page{size:auto; 
  margin: 0;
  margin-top: 1cm;
}
table {
    width: 90%;
    font-size: 14px;
    margin: auto;
    border-collapse: collapse;

    .table_title {
      font-size: 24px;
    }

    .flex {
      display: flex;
      align-items: center;
    }
  }

  table,
  td,
  th {
    text-align: center;
    border: 1px solid #000;
  }

  table td {
    padding: 10px;
  }

  .table_name {
    width: 230px;
  }

  .table_content {
    text-align: left;
  }

  .describe {
    height: 200px;
  }

  .info {
    height: 100px;
  }
  .td_content{
    width: 300px;
  }
`;
const route = useRoute();
const { proxy } = getCurrentInstance();
const faultInfo = ref({})
const processInputForm = ref([])
const completionTime = ref('')
const getData = () => {
  proxy.$api.faultDetailId(route.query.id, "get").then((res) => {
    faultInfo.value = res;

    const params = {
      businessType: "FAULT",
      businessKey: res?.faultTicketVO?.id,
    };
    proxy.$api.process(params, "get").then((form) => {
      processInputForm.value = form;
      processInputForm.value[0]?.createTime ?
        completionTime.value = moment(processInputForm.value[0]?.createTime).add(3, 'days').format('YYYY-MM-DD HH:mm:ss') : ''
    });
  });

}
//打印相关
const print = () => {
  nextTick(() => {
    Printjs({
      printable: "printFrom", // 要打印内容的id
      type: "html",
      targetStyles: ["*"],
      style: style, // 打印的内容是没有css样式的，此处需要string类型的css样式
      scanStyles: false,
      // onLoadingEnd() {
      // 	showPrintNode.value = false;
      // },
    });
  });
};
defineExpose({
  print,
});
onMounted(() => {
  getData()
})
</script>
<style lang="less" scoped>
#printFrom {
  table {
    width: 90%;
    font-size: 14px;
    margin: auto;
    border-collapse: collapse;

    .table_title {
      font-size: 24px;
    }

    .flex {
      display: flex;
      align-items: center;
    }
  }

  table,
  td,
  th {
    text-align: center;
    border: 1px solid #000;
  }

  table td {
    padding: 10px 30px;
  }

  .table_name {
    width: 230px;
  }

  .table_content {
    text-align: left;
  }

  .describe {
    height: 200px;
  }

  .info {
    height: 100px;
  }

  .td_content {
    width: 300px;
  }
}
</style>