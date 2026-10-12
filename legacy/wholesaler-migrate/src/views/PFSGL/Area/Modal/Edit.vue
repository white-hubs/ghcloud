<template lang="pug">
app-modal(title="添加区域" v-model="visible" :width="500" @cancel="close")
  app-form(:model="model" :rules="rules" ref="form" oneline :labelWidth="90")
    a-form-model-item(label="区域名称" prop="name")
      a-input(v-model="model.name" :max-length="20")
    a-form-model-item(label="区域类型" prop="type")
      //- a-input(v-model="model.type" )
      app-remote-select(v-model="model.type" 
      @change="handleTypeChange"
      api="/dictionary/getDataDictionaryByItem?itemCode=project-merchant-areaType" 
      :field="{name: 'code', label: 'name'}")
    a-form-model-item(label="区域级别" prop="level")
      //- a-input(v-model="model.level" )
      app-tree-select(:disabled="!model.type" v-model="model.level" 
      @change="handleLevelChange"
      api="/sys/dict-datas/graph" 
      :params="levelParams"
      :field="{name: 'code', label: 'name'}")
    a-form-model-item(label="所属楼栋" prop="pid" v-if="model.level === 'areaTypeBuildings_floor'")
      //- a-input(v-model="model.pid" )
      app-remote-select(v-model="model.pid" 
      api="/project-merchant/areas/list" 
      :params="{projectId: project.id, level: 'areaTypeBuildings_building'}"
      )
    a-form-model-item(label="所属楼层" prop="pid" v-if="model.level === 'areaTypeBuildings_slice'")
      //- a-input(v-model="model.pid" )
      app-remote-select(v-model="model.pid" 
      api="/project-merchant/areas/list" 
      :params="{projectId: project.id, level: 'areaTypeBuildings_floor'}"
      )

    a-form-model-item(label="所属一级" prop="pid" v-if="model.level === 'areaTypeOutdoor_second'")
      //- a-input(v-model="model.pid" )
      app-remote-select(v-model="model.pid" 
      api="/project-merchant/areas/list" 
      :params="{projectId: project.id, level: 'areaTypeOutdoor_first'}"
      )
    a-form-model-item(label="所属二级" prop="pid" v-if="model.level === 'areaTypeOutdoor_third'")
      //- a-input(v-model="model.pid" )
      app-remote-select(v-model="model.pid" 
      api="/project-merchant/areas/list" 
      :params="{projectId: project.id, level: 'areaTypeOutdoor_second'}"
      )
      
    a-form-model-item(label="占地面积" prop="acreage")
      a-input-number(v-model="model.acreage" )
    a-form-model-item(label="关联BIM模型" prop="bimId" v-if="['areaTypeBuildings_building', 'areaTypeBuildings_floor'].includes(model.level)")
      a-input(v-model="model.bimId" )
    a-form-model-item()
      div(style="width: 100%; height: 400px;")
        BimLoader(ref="bim" @click="handleClickModel")
    a-form-model-item(label="备注" prop="remark")
      a-textarea(v-model="model.remark" )
  template(#footer)
    a-button(@click="handleCancel()") 取消
    a-button.ml2(:disabled="!!loading" type="primary" :loading="loading==='save'" @click="handleSubmit(false)")  确定
</template>
<script>
import BimLoader from '@/components/common/Bim/BimLoader';

import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: { BimLoader },
  data() {
    return {
      visible: false,
      loading: false,
      model: {
        name: null,
        type: null,
        level: null,
        pid: null,
        acreage: null,
        bim: null,
        sort: 1,
        remark: null,
      },
      rules: {
        name: [{ required: true, message: '必填项' }],
        type: [{ required: true, message: '必填项' }],
        level: [{ required: true, message: '必填项' }],
        pid: [{ required: true, message: '必填项' }],
        acreage: [{ required: true, message: '必填项' }],
      },
      parentlevel: 0,
      action: null,
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
    levelParams() {
      return { typeCode: this.model.type };
    },
  },
  methods: {
    show(model, parentlevel, action) {
      this.model = { ...this.model, ...model };
      this.parentlevel = parentlevel || 0;
      this.action = action;
      this.visible = true;
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
          await this.$restful(`save:/project-merchant/areas`, {
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
      this.model = {
        name: null,
        type: null,
        level: null,
        pid: null,
        acreage: null,
        bim: null,
        sort: 1,
        remark: null,
      };
    },
    reset() {
      this.$refs.form.resetFields();
    },
    resetFieldsForProceed() {
      this.$refs.form.resetFields();
    },
    handleTypeChange() {
      this.model.level = null;
    },
    handleLevelChange() {
      this.model.pid = null;
    },
    handleClickModel(objectdata, data, viewMeteData) {
      this.bim.add;
    },
  },
};
</script>
