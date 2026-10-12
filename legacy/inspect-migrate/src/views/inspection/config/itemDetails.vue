<template>
  <g-layout :title="type === 'edit'
    ? '编辑巡检项'
    : type === 'detail'
      ? '巡检项详情'
      : '新增巡检项'
    ">
    <template #content-table>
      <div class="detail-form">
        <a-form ref="formRef" :model="model" layout="inline" :rules="type !== 'detail' ? rules : null" id="mainForm">
          <a-form-item label="巡检项名称" name="alias">
            <a-input :disabled="disabled" v-model:value="model.alias" />
          </a-form-item>
          <a-form-item label="适用对象" name="referType">
            <a-select :disabled="disabled" v-model:value="model.referType" placeholder="please select your zone">
              <a-select-option value="DEVICE">设备</a-select-option>
              <a-select-option value="STALL">档位</a-select-option>
              <a-select-option value="PROPERTY">资产</a-select-option>
              <a-select-option value="SITE_POINT">现场点</a-select-option>
              <a-select-option value="RISK_SOURCE">风险源</a-select-option>
              <a-select-option value="SMALL_ENGINEERING">小散工程</a-select-option>
            </a-select>
          </a-form-item>
          <div class="item-title">巡检项内容</div>
          <a-form-item class="a-form-item-100">
            <!-- <a-button :disabled="disabled" type="primary" style="text-align: right;" @click="addInspection">
              添加
            </a-button> -->
            <a-table :columns="columns" :dataSource="tableData" :pagination="false" :scroll="{ x: 900 }" :rowKey="'id'">
              <template #name="{ record }">
                <a-textarea :disabled="disabled" v-model:value="record.name" placeholder="巡检项内容" :rows="4" />
              </template>
              <template #resultId="{ record }">
                <a-select :disabled="disabled" ref="select" @change="(val) => selectResult(val, record)"
                  v-model:value="record.resultId" style="width: 120px">
                  <a-select-option :value="item.id" v-for="item in resultList" :key="item.id">{{ item.name
                    }}</a-select-option>
                </a-select>
              </template>
              <template #resultItemValue="{ record }">
                <a-popover title="存在异常点：" v-if="record.resultItemValueStatus === 'error'" placement="top">
                  <template #content>
                    <a-tag color="error" v-for="option in getErrorOptions(record.resultId)" :key="option.itemValue">
                      {{ option.itemName }}
                    </a-tag>
                  </template>
                  <a-select :disabled="disabled" ref="select" 
                    v-model:value="record.resultItemValue" 
                    :status="record.resultItemValueStatus"
                    @change="(val) => updateResultItemValueStatus(val, record)"
                    style="width: 120px">
                    <a-select-option :value="item.itemValue" v-for="item in record.resultDefaultList"
                      :key="item.itemValue">{{item.itemName}}</a-select-option>
                  </a-select>
                </a-popover>
                <a-select v-else :disabled="disabled" ref="select" 
                  v-model:value="record.resultItemValue" 
                  style="width: 120px">
                  <a-select-option :value="item.itemValue" v-for="item in record.resultDefaultList"
                    :key="item.itemValue">{{item.itemName}}</a-select-option>
                </a-select>
              </template>
              <template #imageResult="{ record }">
                <a-popover title="存在异常点：" v-if="record.imageResultStatus === 'error'" placement="top">
                  <template #content>
                    <a-tag color="error" v-for="option in getErrorOptions(record.resultId)" :key="option.itemValue">
                      {{ option.itemName }}
                    </a-tag>
                  </template>
                  <a-select mode="multiple" :disabled="disabled" ref="select" 
                    v-model:value="record.imageResult" 
                    :status="record.imageResultStatus"
                    @change="(val) => updateImageResultStatus(val, record)"
                    style="width: 120px">
                    <a-select-option :value="item.itemValue" v-for="item in record.resultDefaultList"
                      :key="item.itemValue">{{item.itemName}}</a-select-option>
                  </a-select>
                </a-popover>
                <a-select v-else mode="multiple" :disabled="disabled" ref="select" 
                  v-model:value="record.imageResult" 
                  style="width: 120px">
                  <a-select-option :value="item.itemValue" v-for="item in record.resultDefaultList"
                    :key="item.itemValue">{{item.itemName}}</a-select-option>
                </a-select>
              </template>
              <template #remarkResult="{ record }">
                <a-popover title="存在异常点：" v-if="record.remarkResultStatus === 'error'" placement="top">
                  <template #content>
                    <a-tag color="error" v-for="option in getErrorOptions(record.resultId)" :key="option.itemValue">
                      {{ option.itemName }}
                    </a-tag>
                  </template>
                  <a-select mode="multiple" :disabled="disabled" ref="select" 
                    v-model:value="record.remarkResult" 
                    :status="record.remarkResultStatus"
                    @change="(val) => updateRemarkResultStatus(val, record)"
                    style="width: 120px">
                    <a-select-option :value="item.itemValue" v-for="item in record.resultDefaultList"
                      :key="item.itemValue">{{item.itemName}}</a-select-option>
                  </a-select>
                </a-popover>
                <a-select v-else mode="multiple" :disabled="disabled" ref="select" 
                  v-model:value="record.remarkResult" 
                  style="width: 120px">
                  <a-select-option :value="item.itemValue" v-for="item in record.resultDefaultList"
                    :key="item.itemValue">{{item.itemName}}</a-select-option>
                </a-select>
              </template>
              <template #itemTag="{ record }">
                <a-select :disabled="disabled" ref="select" v-model:value="record.itemTag"
                  style="width: 120px">
                  <a-select-option :value="item.itemValue" v-for="item in tagDefaultList"
                    :key="item.value">{{
                    item.label
                    }}</a-select-option> </a-select>
              </template>
              <template #action="{ index }">
                <a-button :disabled="disabled" type="link" danger @click="deleteData(index)">
                  删除
                </a-button>
              </template>
            </a-table>
          </a-form-item>
        </a-form>
      </div>
    </template>
    <template #footer-page>
      <a-button @click="goBack">{{ type !== 'detail' ? '取消' : '返回' }}</a-button>
      <a-button type="primary" @click="submit" v-if="type !== 'detail'">保存
      </a-button>
    </template>
  </g-layout>
</template>

<script>
import {
  defineComponent,
  getCurrentInstance,
  reactive,
  toRefs,
  ref,
  onMounted
} from "vue";
import { useRouter, useRoute } from "vue-router";
import gLayout from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/gLayout'
import { debounce } from 'lodash-es'; // 防抖函数
export default defineComponent({
  components: {
    gLayout,
  },
  components: {},
  setup() {
    const { proxy } = getCurrentInstance();
    const formRef = ref();
    const route = useRoute();
    const router = useRouter();
    const tagDefaultList = ref(
      [
        {
          value:'CHARGE',
          label:'违规充电'
        },
        {
          value:'PARKING',
          label:'违规停放'
        },
      ]
    )
    const type = route.query.type;
    const id = route.query.id;
    const state = reactive({
      disabled: false,
      model: {
        alias: '',
        referType: 'DEVICE',
      },
      columns: [
        {
          dataIndex: "name",
          title: "内容描述",
          ellipsis: true,
          width: 600,
          slots: {
            customRender: "name",
          },
        },
        {
          dataIndex: "resultId",
          title: "巡检结果",
          ellipsis: true,
          slots: {
            customRender: "resultId",
          },
        },
        {
          dataIndex: "resultItemValue",
          title: "默认结果",
          ellipsis: true,
          slots: {
            customRender: "resultItemValue",
          },
        },
        {
          dataIndex: "imageResult",
          title: "以下巡检结果必须拍照",
          ellipsis: true,
          slots: {
            customRender: "imageResult",
          },
        },
        {
          dataIndex: "remarkResult",
          title: "以下巡检结果必须备注",
          ellipsis: true,
          slots: {
            customRender: "remarkResult",
          },
        },
        {
          dataIndex: "itemTag",
          title: "标签",
          ellipsis: false,
          slots: {
            customRender: "itemTag",
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          ellipsis: true,
          slots: {
            customRender: "action",
          },
        },
      ],
      tableData: [
        {
          name: '',
          resultId: '1',
          resultItemValue: '1',
          imageResult: '0',
          remarkResult: '0',
          itemTag: undefined,
          resultItemValueStatus: '',
          imageResultStatus: '',
          remarkResultStatus: ''
        }
      ],
      rules: {
        alias: [
          { required: true, message: '请输入巡检项名称', trigger: 'blur' },
        ],
        referType: [
          { required: true, message: '请选择适用对象', trigger: 'blur' },
        ],
      }
    })
    const resultList = ref()
    const goBack = () => {
      router.push('/inspectionItems')
      // history.go(-1);
    };
    const deleteData = (index) => {
      if (state.tableData.length > 1) {
        state.tableData.splice(index, 1)
      } else {
        proxy.$message.warn("巡检项至少保留一条");
      }
    }
    const submit = debounce(async () => {
      let arr = state.tableData.filter(item => {
        return item.name === ''
      })
      if (arr.length === 0) {
        formRef.value
          .validate()
          .then(() => {
            if (type === 'add') {
              let obj = Object.assign({ items: state.tableData }, state.model)
              obj.items.forEach((item) => {
                item.imageResult = item.imageResult.length > 1 ? item.imageResult?.join(',') : item.imageResult.toString()
                item.remarkResult = item.remarkResult.length > 1 ? item.remarkResult?.join(',') : item.remarkResult.toString()
                delete item.resultDefaultList
              })
              proxy.$api.inspectItemTemplateAdd(obj).then(() => {
                proxy.$message.success("新增成功");
              })
            } else {
              let obj = {
                alias: state.model.alias,
                referType: state.model.referType,
                name: state.tableData[0].name,
                resultId: state.tableData[0].resultId,
                itemTag: state.tableData[0].itemTag,
                resultItemValue: state.tableData[0].resultItemValue,
                imageResult: state.tableData[0].imageResult.length > 1 ? state.tableData[0].imageResult?.join(',') : state.tableData[0].imageResult ? state.tableData[0].imageResult.toString() : undefined,
                remarkResult: state.tableData[0].remarkResult.length > 1 ? state.tableData[0].remarkResult?.join(',') : state.tableData[0].remarkResult ? state.tableData[0].remarkResult.toString() : undefined,
              }
              proxy.$api.inspectItemTemplateModify(state.model.id, obj).then(() => {
                proxy.$message.success("修改成功");
              })
            }

            goBack()
          })
      } else {
        proxy.$message.warn("请填写巡检内容");
      }
    }, 500);
    const getResuleList = async () => {
      proxy.$api.inspectResultList().then((res) => {
        resultList.value = res
        const errValue = resultList.value[0].options.filter(x => x.errorFlag)?.map(x => x.itemValue)
        state.tableData[0].resultId = resultList.value[0].id
        state.tableData[0].resultItemValue = resultList.value[0].options[0].itemValue
        state.tableData[0].imageResult = errValue
        state.tableData[0].remarkResult = errValue
        state.tableData[0].resultDefaultList = resultList.value[0].options
        
        // 设置错误状态
        const defaultOption = resultList.value[0].options.find(x => x.itemValue === state.tableData[0].resultItemValue)
        state.tableData[0].resultItemValueStatus = defaultOption && defaultOption.errorFlag ? 'error' : ''
        state.tableData[0].imageResultStatus = errValue && errValue.length > 0 ? 'error' : ''
        state.tableData[0].remarkResultStatus = errValue && errValue.length > 0 ? 'error' : ''
      })
    }
    // 表格添加
    const addInspection = () => {
      let result = {
        name: '',
        resultId: '1',
        resultItemValue: '1',
        resultDefaultList: [],
        imageResult: '1',
        remarkResult: '1',
      }
      result.resultId = resultList.value[0].id
      result.resultItemValue = resultList.value[0].options[0].itemValue
      state.tableData.push(result)
    }
    const selectResult = (val, record) => {
      resultList.value.forEach(item => {
        if (item.id == val) {
          const errValue = item.options.filter(x => x.errorFlag)?.map(x => x.itemValue)
          record.resultDefaultList = item.options
          record.resultItemValue = item.options[0].itemValue
          record.imageResult = errValue
          record.remarkResult = errValue
          
          // 设置错误状态
          const defaultOption = item.options.find(x => x.itemValue === record.resultItemValue)
          record.resultItemValueStatus = defaultOption && defaultOption.errorFlag ? 'error' : ''
          record.imageResultStatus = errValue && errValue.length > 0 ? 'error' : ''
          record.remarkResultStatus = errValue && errValue.length > 0 ? 'error' : ''
        }
      });
    }

const updateResultItemValueStatus = (value, index) => {
  if (state.tableData[index].resultId) {
    const selectResult = resultList.value.find(r => r.id === state.tableData[index].resultId)
    if (selectResult) {
      const option = selectResult.options.find(x => x.itemValue === value)
      state.tableData[index].resultItemValueStatus = option && option.errorFlag ? 'error' : ''
    }
  }
}

const updateImageResultStatus = (value, index) => {
  if (state.tableData[index].resultId) {
    const selectResult = resultList.value.find(r => r.id === state.tableData[index].resultId)
    if (selectResult) {
      // 检查选中的值中是否包含errorFlag为true的选项
      const hasErrorOption = value && value.length > 0 && value.some(v => {
        const option = selectResult.options.find(x => x.itemValue === v)
        return option && option.errorFlag
      })
      state.tableData[index].imageResultStatus = hasErrorOption ? 'error' : ''
    }
  }
}

const updateRemarkResultStatus = (value, index) => {
  if (state.tableData[index].resultId) {
    const selectResult = resultList.value.find(r => r.id === state.tableData[index].resultId)
    if (selectResult) {
      // 检查选中的值中是否包含errorFlag为true的选项
      const hasErrorOption = value && value.length > 0 && value.some(v => {
        const option = selectResult.options.find(x => x.itemValue === v)
        return option && option.errorFlag
      })
      state.tableData[index].remarkResultStatus = hasErrorOption ? 'error' : ''
    }
  }
}
    const getErrorOptions = (resultId) => {
      if (!resultId || !resultList.value) return []
      const selectResult = resultList.value.find(r => r.id === resultId)
      if (!selectResult) return []
      return selectResult.options.filter(option => option.errorFlag)
    }
    // 详情回显
    const resuleDetails = () => {
      proxy.$api.inspectItemTemplateDetail(id).then((res) => {
        state.model.id = res.id
        state.model.alias = res.alias
        state.model.referType = res.referType
        state.tableData[0].name = res.name
        state.tableData[0].resultId = res.resultId
        state.tableData[0].itemTag = res.itemTag
        state.tableData[0].resultItemValue = res.resultItemValue
        state.tableData[0].imageResult = res.imageResult === '' ? undefined : res.imageResult.split(',')
        state.tableData[0].remarkResult = res.remarkResult === '' ? undefined : res.remarkResult.split(',')
        state.tableData[0].resultDefaultList = resultList.value.filter(item => item.id === res.resultVO.id)[0]?.options
        
        // 设置错误状态
        if (res.resultId) {
          const selectResult = resultList.value.find(r => r.id === res.resultId)
          if (selectResult) {
            // 设置resultItemValueStatus
            const option = selectResult.options.find(x => x.itemValue === res.resultItemValue)
            state.tableData[0].resultItemValueStatus = option && option.errorFlag ? 'error' : ''
            
            // 设置imageResultStatus
            const imageValues = res.imageResult === '' ? [] : res.imageResult.split(',')
            const hasImageErrorOption = imageValues.some(v => {
              const option = selectResult.options.find(x => x.itemValue === v)
              return option && option.errorFlag
            })
            state.tableData[0].imageResultStatus = hasImageErrorOption ? 'error' : ''
            
            // 设置remarkResultStatus
            const remarkValues = res.remarkResult === '' ? [] : res.remarkResult.split(',')
            const hasRemarkErrorOption = remarkValues.some(v => {
              const option = selectResult.options.find(x => x.itemValue === v)
              return option && option.errorFlag
            })
            state.tableData[0].remarkResultStatus = hasRemarkErrorOption ? 'error' : ''
          }
        }
      })
    }
    onMounted(() => {
      getResuleList()
      if (type != 'add') {
        resuleDetails()
      }
      if (type == 'detail') {
        state.disabled = true
      }
    })
    return {
      type,
      formRef,
      resultList,
      tagDefaultList,
      ...toRefs(state),
      goBack,
      submit,
      addInspection,
      selectResult,
      deleteData,
      updateResultItemValueStatus,
      updateImageResultStatus,
      updateRemarkResultStatus,
      getErrorOptions
    };
  },
});
</script>
<style lang="less" scoped>
.ant-select,:deep(.ant-select) {
  &[status="error"]{
    .ant-select-selector{
      border-color: #ff7875;
      cursor: pointer;
    }
  }
}
</style>