<template lang="pug">
div.ctr(ref="ctr")
  g-layout(title="进场收费设置")
    template(#content-search)
      //-  layout="inline"
      a-form(ref="ruleForm" :model="ruleModel" :rules="rules" :labelCol="labelCol")
        a-form-item(label="规则分组" name="chargeCategoryCode")
          a-select(v-model:value="ruleModel.chargeCategoryCode" placeholder="请选择规则分组" :style="{width:'218px'}"  disabled)
            a-select-option(v-for="item in rulesList" :value="item.categoryCode") {{item.categoryName}}
        a-form-item(label="区域名称" name="areaId" v-if="ruleModel.chargeCategoryCode === 'AREA_CARMODEL' || ruleModel.chargeCategoryCode === 'AREA_WEIGHT'")
          g-cascader(v-model:value="ruleModel.areaId" :url="'getAreaList'" :style="{width:'218px'}")
        a-form-item(label="车型名称" name="carTypeId"  v-if="ruleModel.chargeCategoryCode === 'AREA_CARMODEL' || ruleModel.chargeCategoryCode === 'CARMODEL_CATEGORY'")
          Select(v-model:value="ruleModel.carTypeId" :placeholder="'请选择车型'" :dataMethod="'carTypeConfig'" :style="{width:'218px'}" :field="{label:'carTypeName',value:'id'}")    
        a-form-item(label="计量单位" name="measureUnit" v-if="ruleModel.chargeCategoryCode === 'CATEGORY_WEIGHT' || ruleModel.chargeCategoryCode === 'AREA_WEIGHT'") 
          a-radio-group(v-model:value="ruleModel.measureUnit") 
            a-radio(:value="'KG'") kg
            a-radio(:value="'T'") T
        a-form-item(label="重量取值" name="weightType" v-if="ruleModel.chargeCategoryCode === 'CATEGORY_WEIGHT' || ruleModel.chargeCategoryCode === 'AREA_WEIGHT'") 
          a-radio-group(v-model:value="ruleModel.weightType") 
            a-radio(:value="'WEIGH_VALUE'") 按毛重
            a-radio(:value="'NET_WEIGHT'") 按净重
    template(#content-table)
      a-table(
        :columns="columns" 
        size="middle"
        :data-source="data"
        :loading="loading"
        :row-key="(record)=>record.goodsCode"
        :pagination="pagination"
        :scroll="{x:600}"
        )
        //- 通用进场费用
        template(
          v-for="col in ['enterChargeValue','specialChargeValue']" 
          #[col]="{ text, record }" 
          :key="col")
          a-form(layout="inline" :model="record" :rules="tableRules")
            a-form-item.mb2(label="" :name="col")
              a-input(
                v-model:value="record[col]"
                size="default")
        template(#action="{record}")
          a-space
            a-popconfirm(
              v-if="pageType!=='edit'"
              title="是否移除当前规则？"
              @confirm="removeRule(record)"
              key="remove")
              a.deleteRow(@click.stop="") 移除 
            a(v-else disabled) 移除
        template(#title)
          div.flex.justify-between
            PopOver(:content="['1.通用进场费用适用于市场所有商家','2.指定进场费用适用于指定商家']" :position="'topLeft'")
              g-vertical-line(title="收费规则设置")
            a-button(type="primary" @click="add" v-if="pageType !== 'edit'") 添加 
      div
        a-form(ref="ruleForm2" :model="modelSe" :rules="rulesSe" :labelCol="labelCol")    
          a-form-item.formTable.pt2(label="指定商家" :style="{width:'100%',textAlign:'left'}") 
            Select(v-model:value="modelSe.merchantIds" :dataMethod="'getAuthentication'" :field="{label:'name',value:'id'}" :mode="'multiple'" :params="{status:'CERTIFIED'}")  
          a-form-item(label="状态" name="status")
            a-switch(
              v-model:checked="modelSe.status"
              checked-children="启用" 
              un-checked-children="禁用")           
    template(#footer-page)
      a-button(type="default" @click="goBack") 返回
      a-button(type="primary" @click="submit" :loading="saveLoading") 保存 
  a-modal(v-model:visible="visible" title="编辑当前规则" @ok="saveCheckedCategory" @cancel="cancel" centered :width="800" :getContainer="()=> $refs.ctr")
    a-spin(:spinning="spinning")
      a-table(
        v-if="formTable?.length"
        :columns="formColumns"
        :data-source="formTable"
        :loading="formLoading"
        :row-selection="rowSelection"
        :expandedRowKeys="expandedRowKeys"
        :pagination="false"
        :rowKey="(record)=>record.id"
        @expand="onExpand")
  a-modal(v-model:visible="confirmValue" title="重复的收费规则" @ok="confirmSubmit" @cancel="cancelConfirm" okText="强制覆盖" centered :width="800" :getContainer="()=> $refs.ctr")      
    a-table(
      v-if="confirmTableData?.length"
      :columns="confirmColumns"
      :data-source="confirmTableData"
      :pagination="false"
      :rowKey="(record)=>record.id")            
</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  ref,
  onMounted,
  onBeforeUnmount,
  toRefs,
  watch,
  computed,
  unref,
  getCurrentInstance,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  millennial,
  deleteNullChild,
  getParentKey,
  flattenTree,
} from "@/utils/common";
import _ from "lodash";
export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();

    const ctr = ref();
    const ruleForm = ref();
    const ruleForm2 = ref();

    const tableSates = reactive({
      columnList: [
        "goodsName",
        "enterChargeValue",
        "specialChargeValue",
        "action",
      ],
      columns: [
        {
          mark: "goodsName",
          dataIndex: "goodsName",
          key: "goodsName",
          title: "品类名称",
          slots: {
            customRender: "goodsName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "enterChargeValue",
          dataIndex: "enterChargeValue",
          key: "enterChargeValue",
          title: "通用进场费用",
          slots: {
            customRender: "enterChargeValue",
          },
          ellipsis: true,
        }, {
          mark: "specialChargeValue",
          dataIndex: "specialChargeValue",
          key: "specialChargeValue",
          title: "指定商家进场费用",
          slots: {
            customRender: "specialChargeValue",
          },
          ellipsis: true,
        }, {
          mark: "action",
          dataIndex: "action",
          key: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          ellipsis: true,
          width: 180,
          fixed: "right",
        },
      ],
      data: [],
      loading: false,
      pagination: {
        total: 0,
        defaultPageSize: 5,
        size: "small",
        showTotal: () => `共${tableSates.data?.length}条数据`,
      },
      isEditFee: false,
      saveLoading: false,
    });
    const editRecordFee = reactive({});

    const visible = ref(false);
    const confirmValue = ref(false);
    const confirmTable = reactive({
      confirmTableData: null,
      columnList: ["goodsName", "enterChargeValue", "specialChargeValue"],
      confirmColumns: [
        {
          mark: "goodsName",
          dataIndex: "goodsName",
          key: "goodsName",
          title: "品类名称",
          slots: {
            customRender: "goodsName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "enterChargeValue",
          dataIndex: "enterChargeValue",
          key: "enterChargeValue",
          title: "通用进场费用",
          slots: {
            customRender: "enterChargeValue",
          },
          ellipsis: true,
        }, {
          mark: "specialChargeValue",
          dataIndex: "specialChargeValue",
          key: "specialChargeValue",
          title: "指定商家进场费用",
          slots: {
            customRender: "specialChargeValue",
          },
          ellipsis: true,
        }
      ],
    });

    const modalTable = reactive({
      formColumnList: ["name"],
      formColumns: [
        {
          mark: "name",
          dataIndex: "name",
          key: "name",
          title: "品类名称",
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
        }
      ],
      formTable: null,
      formLoading: false,
      selectedRowKeys: [],
      expandedRowKeys: [],
      spinning: false,
      checkedTableItem: null,
      finallyCheckedItem: null,
    });

    const ruleModel = reactive({
      id: null,
      chargeCategoryCode: null, // 所属分组
      areaId: [], // 所属地区数组
      carTypeId: null, // 车型id
      measureUnit: "", // 单位
      weightType: "", // 重量取值
      forceUpdate: false,
      merchantIds: [],
    });

    const modelSe = reactive({
      status: true,
      merchantIds: [],
    });

    const rulesSe = {
      status: [
        {
          required: true,
          message: "请正确输入",
        },
      ],
    };

    const carTypeList = ref([]);

    const modelList = reactive({
      rulesList: null,
    });

    const rules = {
      chargeCategoryCode: [
        {
          required: true,
          message: "请正确输入",
        },
      ],
      carTypeId: [
        {
          required: true,
          message: "请正确输入",
        },
      ],
      areaId: [
        {
          required: true,
          message: "请正确输入",
        },
      ],
      measureUnit: [
        {
          required: true,
          message: "请正确输入",
        },
      ],
      weightType: [
        {
          required: true,
          message: "请正确输入",
        },
      ],
    };

    const tableRules = {
      enterChargeValue: [
        {
          required: true,
          message: "请输入",
        },
        {
          pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
          message: "请输入正确的费用(最多两位小数)",
        },
      ],
      specialChargeValue: [
        {
          required: false,
          message: "请输入",
        },
        {
          pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
          message: "请输入正确的费用(最多两位小数)",
        },
      ],
    };

    const id = route.query.id;
    const detailModel = route.query.model;
    const pageType = route.query.type;

    // 获取当前有id的数据
    const getData = async () => {
      const data = await proxy.$api.chargeRuleDetail(id, "get");
      ruleModel.id = data.id;
      ruleModel.chargeCategoryCode = data.chargeCategoryCode.toUpperCase();
      modelSe.status = data.status;
      ruleModel.areaId = data.areaId.split(",");
      ruleModel.carTypeId = data.carTypeId;
      ruleModel.measureUnit = data.measureUnit;
      ruleModel.weightType = data.weightType;
      tableSates.data = data.goods;
      modelSe.merchantIds = data.merchantIds;
    };

    // 车辆类型
    const getCarTypeList = async () => {
      const data = await proxy.$api.carTypeConfig(null, "get");
      if (data && data.records) {
        for (let i of data.records) {
          carTypeList.value.push({
            id: i.id,
            name: i.carTypeName,
          });
        }
      }
    };

    // 弹窗表格选中
    const rowSelection = computed(() => {
      return {
        type: "checkbox",
        selectedRowKeys: unref(modalTable.selectedRowKeys),
        onSelect: async (record, selected, selectedRows) => {
          if (record.parentId) {
            // 获取祖先数据
            const ancestor = [];
            await getAncestorData(
              modalTable.formTable, //表格数据
              record.parentId, //查询数据
              "id", //查询属性
              "parentId",
              ancestor
            );

            const ancestorIds = ancestor.map((item) => item.id);

            let childItem;
            // 获取子数据
            if (record.children?.length) {
              childItem = flattenTree(record.children).map((item) => item.id);
            } else {
              childItem = [];
            }
            // 选中
            if (selected) {
              // --选中当前选中的祖先节点
              modalTable.selectedRowKeys = modalTable.selectedRowKeys.concat(
                ...ancestorIds
              );
              // --选中当前选的所有后代选项
              modalTable.selectedRowKeys = modalTable.selectedRowKeys.concat(
                ...childItem
              );
              modalTable.selectedRowKeys.push(record.id);
            }
            // 未选中
            else {
              const index = modalTable.selectedRowKeys.findIndex(
                (item) => item == record.id
              );
              if (index !== -1) {
                childItem.push(record.id);
                const check = childItem;
                // 查询当前取消选中是否有子选项--取消选中当前选的所有后代选项
                modalTable.selectedRowKeys = _.difference(
                  modalTable.selectedRowKeys,
                  check
                );
              }
              // 获取兄弟数据
              const broData = await getBroData(
                modalTable.formTable,
                record.parentId,
                record.id
              );
              // 兄弟数据的id合集
              const broIds = broData.map((item) => item.id);
              // 判断兄弟节点是否选中
              const result = broIds.some((item) =>
                modalTable.selectedRowKeys.includes(item)
              );

              // 兄弟数据没选中
              if (!result) {
                // 获取父数据级数据
                const parentData = await flattenTree(
                  modalTable.formTable
                ).filter((item) => item.id === record.parentId);
                const parentBro = await getBroData(
                  modalTable.formTable,
                  parentData[0].parentId,
                  parentData[0].id
                );
                // 父级数据有兄弟数据
                if (parentBro) {
                  // 查询父级数据兄弟数据是否被选中
                  const parentBroChecked = parentBro.some((item) =>
                    modalTable.selectedRowKeys.includes(item.id)
                  );
                  // 父级数据兄弟数据选中
                  if (parentBroChecked) {
                    // 移除父级数据
                    modalTable.selectedRowKeys = _.difference(
                      modalTable.selectedRowKeys,
                      [record.parentId]
                    );
                  } else {
                    // 祖先节点全部移除
                    modalTable.selectedRowKeys = _.difference(
                      modalTable.selectedRowKeys,
                      ancestorIds
                    );
                  }
                }
                // 父级数据没有兄弟
                else {
                  // 祖先节点全部移除
                  modalTable.selectedRowKeys = _.difference(
                    modalTable.selectedRowKeys,
                    ancestorIds
                  );
                }
                // 祖先节点全部移除
                // modalTable.selectedRowKeys = _.difference(
                //   modalTable.selectedRowKeys,
                //   ancestor
                // );
              }
            }
          } else {
            const flatSelectData = record.children?.length
              ? flattenTree(record.children)
              : [];
            const flatSelectDataIds = flatSelectData.map((item) => item.id);
            flatSelectDataIds.push(record.id);
            if (selected) {
              modalTable.selectedRowKeys = modalTable.selectedRowKeys.concat(
                ...flatSelectDataIds
              );
            } else {
              modalTable.selectedRowKeys = _.difference(
                modalTable.selectedRowKeys,
                flatSelectDataIds
              );
            }
          }
          // 当前选中的表格数据
          modalTable.checkedTableItem = modalTable.selectedRowKeys;
        },
        // 全选
        onSelectAll: (selected, selectedRows) => {
          if (selected) {
            modalTable.selectedRowKeys = selectedRows.map((item) => item.id);
          } else {
            modalTable.selectedRowKeys = [];
          }
          // 当前选中的表格数据
          modalTable.checkedTableItem = modalTable.selectedRowKeys;
        },
      };
    });

    /**
    //  查询祖先节点方法
     * data 原始数据
     * value 查询的值
     * key 查询的属性名
     * ctr 存储容器
     */
    const getAncestorData = (
      data,
      value,
      key = "id",
      keyword = "parentId",
      ctr = []
    ) => {
      const flatData = flattenTree(data);
      // 父级只有一个,查询父级后查询父级的父级
      const result = flatData.filter((item) => item[key] === value);
      if (result?.length) {
        ctr.push(result[0]);
        getAncestorData(data, result[0][keyword], "id", keyword, ctr);
      }
    };

    /**
     * 获取兄弟数据
     * data 表格数据
     * value 查询数据
     * exclude 排除本身
     */
    const getBroData = async (data, value, exclude) => {
      const flatData = flattenTree(data);
      const childrenArr = await flatData.filter(
        (item) => item.parentId === value && item.id !== exclude
      );
      return childrenArr;
    };

    // 弹窗表格展开
    const onExpand = (expanded, record) => {
      if (expanded) {
        modalTable.expandedRowKeys.push(record.id);
      } else {
        const index = modalTable.expandedRowKeys.findIndex(
          (item) => item == record.id
        );
        if (index !== -1) {
          modalTable.expandedRowKeys.splice(index, 1);
        }
      }
    };

    const add = async () => {
      visible.value = true;
      modalTable.spinning = true;
      // 获取商品品类
      const data = await proxy.$api.getGoodsTypeList(null, "get");
      if (data && data.records) {
        modalTable.formTable = deleteNullChild(data.records);
        // 默认展开所有
        modalTable.expandedRowKeys = getParentKey(data.records, []);
      } else {
        modalTable.formTable = deleteNullChild(data);
        modalTable.expandedRowKeys = getParentKey(data, []);
      }
      modalTable.spinning = false;
    };

    const saveCheckedCategory = async () => {
      // 确认当前选中,并关闭弹框
      modalTable.finallyCheckedItem = await _.cloneDeep(
        modalTable.checkedTableItem
      );

      // 拍平选中的数据
      let flattenData = await flattenTree(modalTable.formTable).filter(
        (item) =>
          modalTable.checkedTableItem.includes(item.id) &&
          !item?.children?.length
      );

      // 去除表格中取消选中的--当前选中的数据的id合集
      const flattenDataIds = await flattenData.map((item) => item.id);

      // 去除当前表格中被取消选中的数据去除;
      tableSates.data = await tableSates.data.filter((item) => {
        if (flattenDataIds.includes(item.goodsCode)) return item;
      });

      // 去除取消选中后的表格codes数组
      const nowTabel = tableSates.data.map((item) => item.goodsCode);

      // 选中数据去除当前表格中已有的数据
      flattenData = await flattenData.filter((item) => {
        if (!nowTabel.includes(item.id)) {
          return item;
        }
      });

      if (flattenData.length) {
        // 循环往表格中添加当前的数据
        for (let i of flattenData) {
          const data = {
            goodsName: i.name,
            goodsCode: i.id,
            parentId: i.parentId,
            // weightUnit: {
            //   weightType: null,
            //   measureUnit: null,
            // },
            // weightType: null,
            // measureUnit: null,
            enterChargeValue: null,
            specialChargeValue: null,
          };
          tableSates.data.push(data);
        }
      }

      // 操作结束后
      visible.value = false;
    };

    const cancel = () => {
      modalTable.selectedRowKeys = modalTable.finallyCheckedItem;
      visible.value = false;
    };

    const submit = async () => {
      if (!tableSates.data.length) {
        proxy.$message.warn("请添加规则后再保存");
        return;
      }
      ruleForm.value.validate().then(async () => {
        ruleForm2.value.validate().then(async () => {
          const reg = /^\d+(\.\d{0,2})?$/;
          const result = tableSates.data.every(
            (item) => item.enterChargeValue || item.enterChargeValue === 0
          );
          // 指定商家费用是否填写完整?
          // 指定商家费用是否在有指定商家时必填?--是(放开注释569-574)
          // let specialResult = ruleModel.merchantIds?.length
          //   ? tableSates.data.every(
          //       (item) =>
          //         item.specialChargeValue || item.specialChargeValue === 0
          //     )
          //   : true;
          if (!result) {
            proxy.$message.warn("请将表格中的通用进场费用填写完整");
            return;
          } else {
            const suitRule = tableSates.data.every((item) =>
              reg.test(item.enterChargeValue)
            );
            if (!suitRule) {
              return;
            }
          }

          // 指定商家费用是否在有指定商家时必填?--是(放开注释586-596)
          // if (!specialResult) {
          //   proxy.$message.warn("请将表格中的指定商家进场费用填写完整");
          //   return;
          // } else {
          //   const specialSuitRule = ruleModel.merchantIds?.length
          //     ? tableSates.data.every((item) =>
          //         reg.test(item.specialChargeValue)
          //       )
          //     : true;
          //   if (!specialSuitRule) {
          //     return;
          //   }
          // }

          // if (ruleModel.areaId.length) {
          //   ruleModel.areaId = ruleModel.areaId?.reverse()[0] || "";
          // }

          // 构造数据
          await Object.assign(ruleModel, { ruleList: tableSates.data });
          if (pageType === "edit") {
            tableSates.saveLoading = true;
            await proxy.$api.EditRules({ ...ruleModel, ...modelSe }, "put");
            proxy.$message.success("操作成功");
            tableSates.saveLoading = false;
            goBack();
          } else {
            // 调取保存接口获取结果
            tableSates.saveLoading = true;
            const saveResult = await proxy.$api.addRules({
              ...ruleModel,
              ...modelSe,
            }, "post");
            if (saveResult?.errCode === 409) {
              // 弹出弹框
              confirmValue.value = true;
              confirmTable.confirmTableData = saveResult.data;
            } else {
              proxy.$message.success("操作成功");
              tableSates.saveLoading = false;
              goBack();
            }
          }
        });
      });
    };

    const confirmSubmit = async () => {
      ruleModel.forceUpdate = true;
      // 调取保存接口获取结果
      const saveResult = await proxy.$api.addRules(ruleModel, "post");
      if (saveResult?.errCode === 409) {
        // 弹出弹框
        confirmValue.value = true;
        confirmTable.confirmTableData = saveResult.data;
      } else {
        proxy.$message.success("操作成功");
        confirmValue.value = false;
        goBack();
      }
    };

    const removeRule = async (record) => {
      // 表单表格删除移除项
      const index = tableSates.data.findIndex(
        (item) => item.goodsCode === record.goodsCode
      );
      tableSates.data.splice(index, 1);
      if (record.parentId) {
        // debugger
        // 找祖先节点
        const ancestor = [];
        await getAncestorData(
          modalTable.formTable,
          record.parentId,
          "id",
          "parentId",
          ancestor
        );
        const ancestorIds = ancestor.map((item) => item.id);
        // 当前项的兄弟数据
        const broData = await getBroData(
          modalTable.formTable,
          record.parentId,
          record.goodsCode
        );
        const broDataIds = broData?.map((item) => item.id);
        // 查询父级数据
        const parentData = ancestor.filter(
          (item) => item.id === record.parentId
        );
        // 父级数据的兄弟数据
        const parentBroData = await getBroData(
          modalTable.formTable,
          parentData[0].parentId,
          parentData[0].id
        );
        const parentBroDataIds = parentBroData.map((item) => item.id);
        // 判断当前数据的兄弟数据是否在选中中
        // 没有兄弟数据--移除本身和父级并判断父级兄弟是否被选中
        if (!broDataIds.length) {
          // 判断父级有无兄弟
          // 父级有兄弟
          if (parentBroDataIds.length) {
            // 父级兄弟是否被选中
            const parentBroChecked = parentBroDataIds.some((item) =>
              modalTable.selectedRowKeys.includes(item)
            );
            // 父级兄弟数据未被选中
            if (!parentBroChecked) {
              // 移除祖先和本身
              modalTable.selectedRowKeys = modalTable.finallyCheckedItem =
                _.difference(modalTable.selectedRowKeys, [
                  ...ancestorIds,
                  record.goodsCode,
                ]);
            }
            // 父级兄弟被选中
            else {
              // 移除父级和本身
              modalTable.selectedRowKeys = modalTable.finallyCheckedItem =
                _.difference(modalTable.selectedRowKeys, [
                  record.goodsCode,
                  parentData[0].id,
                ]);
            }
          }
          // 父级无兄弟
          else {
            // 移除祖先和本身
            modalTable.selectedRowKeys = modalTable.finallyCheckedItem =
              _.difference(modalTable.selectedRowKeys, [
                ...ancestorIds,
                record.goodsCode,
              ]);
          }
        }
        // 有兄弟数据
        else {
          // 判断兄弟数据是否被选中
          const broChecked = broDataIds.some((item) =>
            modalTable.selectedRowKeys.includes(item)
          );
          // 未选中
          if (!broChecked) {
            // 判断父级有无兄弟
            // 父级有兄弟
            if (parentBroDataIds.length) {
              // 父级兄弟是否被选中
              const parentBroChecked = parentBroDataIds.some((item) =>
                modalTable.selectedRowKeys.includes(item)
              );
              // 父级兄弟数据未被选中
              if (!parentBroChecked) {
                // 移除祖先和本身
                modalTable.selectedRowKeys = modalTable.finallyCheckedItem =
                  _.difference(modalTable.selectedRowKeys, [
                    ...ancestorIds,
                    record.goodsCode,
                  ]);
              }
              // 父级兄弟被选中
              else {
                // 移除父级和本身
                modalTable.selectedRowKeys = modalTable.finallyCheckedItem =
                  _.difference(modalTable.selectedRowKeys, [
                    record.goodsCode,
                    parentData[0].id,
                  ]);
              }
            }
            // 父级无兄弟
            else {
              // 移除祖先和本身
              modalTable.selectedRowKeys = modalTable.finallyCheckedItem =
                _.difference(modalTable.selectedRowKeys, [
                  ...ancestorIds,
                  record.goodsCode,
                ]);
            }
          }
          // 选中
          else {
            // 移除本身
            modalTable.selectedRowKeys = modalTable.finallyCheckedItem =
              _.difference(modalTable.selectedRowKeys, [record.goodsCode]);
          }
        }
      }
    };

    const getFeeDetaiModel = async () => {
      const data = await proxy.$api.ruleCategory;
      if (data.records) {
        modelList.rulesList = data.records;
      } else {
        modelList.rulesList = data;
      }
    };

    const goBack = () => {
      history.back()
    };

    onMounted(() => {
      if (id) {
        getData();
      }

      // 带过来的参数--暂时没有
      ruleModel.chargeCategoryCode = detailModel;
      sessionStorage.setItem("chargeCategoryCode", detailModel);

      getCarTypeList();
      getFeeDetaiModel();

      // tableSates.columns = tableColumns(
      //   "feeDetails",
      //   tableSates.columnList,
      //   180
      // );
      // confirmTable.confirmColumns = tableColumns(
      //   "feeDetails",
      //   confirmTable.columnList,
      //   180
      // );
      // modalTable.formColumns = tableColumns(
      //   "feeDetails",
      //   modalTable.formColumnList,
      //   180
      // );
    });

    return {
      labelCol: {
        style: {
          width: "98px",
          lineHeight: "32px",
        },
      },
      id,
      ctr,
      ruleForm,
      ruleForm2,
      ruleModel,
      carTypeList,
      visible,
      confirmValue,
      rules,
      tableRules,
      editRecordFee,
      pageType,
      modelSe,
      rulesSe,
      ...toRefs(tableSates),
      ...toRefs(confirmTable),
      ...toRefs(modalTable),
      ...toRefs(modelList),
      // 方法
      add,
      saveCheckedCategory,
      cancel,
      submit,
      confirmSubmit,
      removeRule,
      goBack,
      onExpand,
      rowSelection,
      // 公共方法
      millennial,
    };
  },
  beforeRouteLeave(to, from, next) {
    if (to.fullPath !== "/feeDetail") {
      sessionStorage.removeItem("chargeCategoryCode");
    }
    next();
  },
});
</script>
<style lang="less" scoped>
:deep(.ant-table) {
  .ant-table-title {
    border: none;
    text-align: left;
  }

  .ant-table-tbody tr td .flex>span,
  .ant-table-tbody tr td a {
    display: inline-block;
    height: 32px;
    line-height: 32px;
  }
}

:deep(.ant-modal) {
  text-align: center;

  .ant-modal-content .ant-modal-body {
    max-height: 600px !important;
    overflow-y: auto;
  }
}

:deep(.ant-form) {
  width: 100%;
  text-align: left;
  // .ant-form-item-control-input-content {
  //   text-align: left !important;
  // }
}

:deep(.verticalLine) {
  cursor: default;
}
</style>
