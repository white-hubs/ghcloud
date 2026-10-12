<template lang="pug">
app-page-layout(fix-header)
  div.my3.px3.pb3.overflow-auto(style="height: 100%; overflow: hidden; display: flex; flex-direction: column;")
    div
      AppCard(:title="id ? '编辑空间' : '新增空间'")
    div.p3(style="flex: 1; overflow: auto;")
      
      CreateStore(ref="createStore" @on-save="handleCreateStore" :nosapce="true")
      //- app-modal(title="添加空间" v-model="visible" :width="500" @cancel="close")
      app-form(:model="model" :rules="rules" ref="form" oneline :labelWidth="105")
        a-row(:gutter="24" style="max-width: 1024px;")
          a-col(:sm="12")
            a-form-model-item(label="空间名称" prop="name")
              a-input(v-model="model.name" placeholder="请输入")
            //- a-form-model-item(label="空间面积" prop="acreage")
              a-input-number(v-model="model.acreage" :min="0" placeholder="请输入")
                
            a-form-model-item(label="占地面积" prop="coverArea")
              a-input-number(v-model="model.coverArea"  placeholder="请输入")
            a-form-model-item(label="消防面积" prop="fireArea")
              a-input-number(v-model="model.fireArea"  placeholder="请输入")
            a-form-model-item(label="清洁面积" prop="cleanArea")
              a-input-number(v-model="model.cleanArea"  placeholder="请输入")

            a-form-model-item(label="所属区域" prop="areaIds")
              app-area-select(v-model="model.areaIds" :name="model.areaNames" placeholder="请选择"
              api="/project-merchant/areas/all-graph"
              :params="params"
              @change="handleAreaChange"
              )
            a-form-model-item(label="管理部门" prop="deptId")
              app-tree-select(v-model="model.deptId"  placeholder="请选择"
              api="/sys/depts/all-graph"
              :params="params"
              :dataFormatter="(data) => {  data[0].selectable = false;  return data;  }"
              @change="handleDeptChange"
              )
            a-form-model-item(label="关联BIM模型" prop="bimInfo")
              app-remote-dialog-select(v-model="model.bimInfo.ecode" 
              placeholder="构件搜索选择"
              :width='1200'
              model-name="ModelElement"
              selectionMode="single"
              api="/bim/elements" 
              :params="params" 
              :getCheckboxProps='getDeviceCheckboxProps'
              :rowClassName='deviceRowClassName'
              :columns="['elementCode', 'name', 'levelName', 'groupName', 'hasBind']"
              :field="{ name: 'elementCode', label: 'elementCode' }"
              :dataFormatter="(res) => res.records"
              :labelFormatter="(item) => `${item.elementCode}(${item.name})`"
              :filterFieleds="filterFieleds"
              :filters="filters"
              allowClear
              @change="handleElementChange"
              :columnsCustomsize="columnsCustomsize"
              ref="ele"
              )
            a-form-model-item(label="备注" prop="remark")
              a-textarea(v-model="model.remark"  placeholder="请输入")

          a-col(:sm="12")
            a-form-model-item(label="空间属性" prop="attribute")
              //- a-input(v-model="model.level" )
              app-tree-select(v-model="model.attribute"  placeholder="请选择"
              api="/dictionary/getDataDictionaryByItem?itemCode=project-merchant-spaceAttr" 
              :field="{name: 'code', label: 'name'}")

            a-form-model-item(v-if="model.attribute === 'spaceAttr_booth'" label="档位类型" prop="type")
              app-remote-select(v-model="model.type"  placeholder="请选择"
              api="/dictionary/getDataDictionaryByItem?itemCode=project-merchant-storeType" 
              :field="{name: 'code', label: 'name'}"
              allowClear
              )
            a-form-model-item(label="经营类型" prop="tradeModel")
              app-tree-select(v-model="model.tradeModel"  placeholder="请选择"
              api="/dictionary/getDataDictionaryByItem?itemCode=project-merchant-spaceTradeModel" 
              :field="{name: 'code', label: 'name'}")
              
            a-form-model-item(v-if="model.attribute === 'spaceAttr_booth'" label="租赁面积" prop="leaseArea")
              a-input-number(v-model="model.leaseArea"  placeholder="请输入")
            a-form-model-item(v-if="model.attribute === 'spaceAttr_booth'" label="租赁实际面积" prop="leaseRealArea")
              a-input-number(v-model="model.leaseRealArea"  placeholder="请输入")
            a-form-model-item(v-if="model.attribute === 'spaceAttr_booth'" label="租赁公摊面积" prop="leasePublicArea")
              a-input-number(v-model="model.leasePublicArea"  placeholder="请输入")

            a-form-model-item(v-if="['spaceAttr_parking'].includes(model.attribute)" label="车位面积" prop="parkingArea")
              a-input-number(v-model="model.parkingArea"  placeholder="请输入")
              
            
            a-form-model-item(v-if="model.attribute === 'spaceAttr_booth' && model.tradeModel === 'spaceTradeModel_operation'" 
              label="所属人" prop="storeId")
              a-row(:gutter="16")
                a-col(:sm="16")
                  app-tree-select(v-model="model.storeId"  placeholder="请选择"
                  ref="storeSelect"
                  api="/project-merchant/companies/list" 
                  :params="params"
                  :field="{name: 'id', label: 'owner'}"
                  allowClear
                  )
                a-col(:sm="8")
                  a-button(block @click="$refs.createStore.show" :disabled="!!model.storeId") 新增商户
            
        a-row(:gutter="24" style="max-width: 1024px;")
          a-col(:sm="12")
            div(style="padding-left: 105px;")
              a-button(@click="handleCancel()") 取消
              a-button.ml2(:disabled="!!loading" type="primary" :loading="loading==='save'" @click="handleSubmit(false)")  确定
</template>
<script>
import CreateStore from '@/pages/XTGL/Merchants/Modal/CreateEdit';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: { CreateStore },
  data() {
    return {
      visible: false,
      loading: false,
      model: {
        name: null,
        acreage: null,
        type: null,
        attribute: null,
        tradeModel: null,
        areaIds: null,
        deptId: null,
        deptName: null,
        storeId: null,
        bimInfo: {
          ecode: null,
          ename: null,
          modelLevel: null,
          modelLevelName: null,
          modelFileId: null,
        },
        remark: null,
      },
      rules: {
        name: [
          { required: true, message: '必填项' },
          {
            required: true,
            trigger: 'blur',
            message: '名称只能包含中英文字符及数字',
            pattern: /^[\u4e00-\u9fa5\w\d]+$/,
          },
        ],
        acreage: [{ required: true, message: '必填项' }],
        coverArea: [{ required: true, message: '必填项' }],
        leaseArea: [{ required: true, message: '必填项' }],
        leaseRealArea: [{ required: true, message: '必填项' }],
        leasePublicArea: [{ required: true, message: '必填项' }],
        fireArea: [{ required: true, message: '必填项' }],
        cleanArea: [{ required: true, message: '必填项' }],
        parkingArea: [{ required: true, message: '必填项' }],

        type: [{ required: true, message: '必填项' }],
        attribute: [{ required: true, message: '必填项' }],
        tradeModel: [{ required: true, message: '必填项' }],
        areaIds: [{ required: true, message: '必填项' }],
      },
      parentlevel: 0,
      action: null,
      // 构件编码 弹窗高级搜索
      filterFieleds: [],
      filters: {
        search: null,
        specialty: null,
        levelName: null,
      },
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return {
        projectId: this.project.id,
      };
    },
    id() {
      return this.$route.params.id;
    },
  },
  created() {
    this.filterFieleds = [
      {
        name: 'specialty',
        placeholder: '请选择所属模型',
        width: '150px',
        component: 'app-remote-select',
        api: '/bim/building/list',
        params: { projectId: this.project.id },
        field: { name: 'name', label: 'name' },
        onChange: (select, option) => {
          this.filterFieleds[1].params.buildingName = select;
          this.filterFieleds = [...this.filterFieleds];
        },
      },
      {
        name: 'levelName',
        placeholder: '请选择所属楼层',
        width: '150px',
        component: 'app-remote-select',
        api: '/bim/level/list',
        params: { buildingName: null, projectId: this.project.id },
        field: { name: 'name', label: 'name' },
        onChange(select) {
        },
      },
    ];
    if (this.id) {
      this.loadModel();
    }
  },
  methods: {
    show(model, parentlevel, action) {
      this.model = { ...this.model, ...model };
      this.parentlevel = parentlevel || 0;
      this.action = action;
      this.visible = true;
    },
    async loadModel() {
      const model = await this.$restful('GET:/project-merchant/spaces/' + this.id);
      if (!model.bimInfo) {
        model.bimInfo = {};
      }
      this.model = { ...this.model, ...model };
    },
    handleParentChange(v, n, extra) {
      let parentlevel =
        extra?.triggerNode?.dataRef &&
        (extra?.triggerNode?.dataRef?.level || 1);
      this.parentlevel = parentlevel || 0;
    },
    async handleSubmit(proceed) {
      const valid = await this.$refs.form.validate();
      if (valid) {
        try {
          this.loading = proceed ? 'process' : 'save';
          await this.$restful(`save:/project-merchant/spaces`, {
            ...this.model,
            projectId: this.project.id,
          });
          this.$emit('on-save');
          this.$message.success('保存成功。');
          if (proceed) {
            this.resetFieldsForProceed();
          } else {
            this.close();
          }
        } finally {
          this.loading = false;
        }
      }
    },
    handleCancel() {
      this.close();
    },
    close() {
      this.visible = false;
      this.reset();

      this.$back();
    },
    reset() {
      this.$refs.form.resetFields();
    },
    resetFieldsForProceed() {
      this.$refs.form.resetFields();
    },
    handleCreateStore(id) {
      this.model.storeId = id;
      this.$refs.storeSelect.loadData();
    },
    // 区域改变, 联动构件筛选条件
    async handleAreaChange(select, area) {
      if (area.id) {
        const { bimInfo } = await this.$restful(`GET:/project-merchant/areas/${area.id}`);
        this.filters = {
          search: null,
          specialty: bimInfo.specialty,
          levelName: bimInfo.modelLevel,
        };
        this.filterFieleds[1].params.buildingName = bimInfo.specialty || null;
        this.filterFieleds = [...this.filterFieleds];
      }
    },
    handleDeptChange(select, dept) {
      this.model.deptName = dept[0];
    },
    handleElementChange(select, option) {
      // 构件改变
      // const data = option.data.attrs.data;
      // this.model.bimInfo = {
      //   ecode: data.elementCode,
      //   ename: data.name,
      //   modelLevel: data.levelId,
      //   modelLevelName: data.levelName,
      //   modelFileId: data.modelFileId,
      // };
      if (select) {
        const data = option;
        this.model.bimInfo = {
          ecode: data.elementCode,
          ename: data.name,
          modelLevel: data.levelName,
          modelLevelId: data.levelId,
          modelLevelName: data.levelName,
          // modelFileId: data.modelFileId,
          objectId: data.objectId,
          specialty: data.specialty,
        };
      } else {
        this.model.bimInfo = {};
      }
      // this.$restful(`GET:/bim/elements/code?code=${select}`).then((res) => {
      // });
    },
    getDeviceCheckboxProps(val) {
      return {
        props: {
          disabled: val.hasBind,
        },
      };
    },
    deviceRowClassName(record) {
      return record.hasBind ? 'disabled' : '';
    },
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'businessKey',
        dataIndex: 'businessKey',
        title: '操作',
        width: '8rem',
        render: (h, v, r) => {
          return (
            <app-link-btn onClick={() => this.unBind(r)} disabled={!v}>
              解除绑定
            </app-link-btn>
          );
        },
      });
      return columns;
    },
    async unBind(element) {
      const device = await this.$restful(
        `GET:/project-merchant/devices/${element.businessKey}`,
        {
          projectId: this.project.id,
        },
      );
      device.bimInfo = {};
      await this.$restful('save:/project-merchant/devices', {
        ...device,
        projectId: this.project.id,
      });
      this.$refs.ele.$refs.listDialog.$refs.table.reload();
    },
  },
};
</script>
<style lang="less" scoped>
.full-height {
  height: calc(100vh - 260px);
  overflow: auto;
}
</style>
