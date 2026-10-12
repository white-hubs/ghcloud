<template lang="pug">
  div.my3.px3.pb3.overflow-auto(style="height: 100%; overflow: hidden; display: flex; flex-direction: column;")
    div
      AppCard(:title="id ? '编辑区域' : '新增区域'")
    div.p3(style="flex: 1; overflow: auto; display: flex;")
      div.full-height.pr2.pb3(style="flex: 1;")
        app-form(:model="model" :rules="rules" ref="form" oneline :labelWidth="90")
          a-form-model-item(label="区域类型" prop="type")
            //- a-input(v-model="model.type" )
            app-remote-select(v-model="model.type"  placeholder="请选择"
            @change="handleTypeChange"
            api="/dictionary/getCascadeDictionaryItem?itemCode=project-merchant-area" 
            :field="{name: 'id', label: 'name'}")
          a-form-model-item(label="区域级别" prop="level")
            //- a-input(v-model="model.level" )
            app-tree-select(:disabled="!model.type" v-model="model.level" 
            @change="handleLevelChange"
            api="/dictionary/getCascadeDictionaryItem?itemCode=project-merchant-area" 
            :params="levelParams" placeholder="请选择"
            childrenProp="nextList"
            :field="{name: 'code', label: 'name'}")
          a-form-model-item(label="所属楼栋" prop="pid" v-if="model.level === 'areaTypeBuildings_floor'")
            //- a-input(v-model="model.pid" )
            app-remote-select(v-model="model.pid" 
            api="/project-merchant/areas/list" 
            :params="{projectId: project.id, level: 'areaTypeBuildings_building'}" placeholder="请选择"
            @change="handlePidChange"
            )
          a-form-model-item(label="所属楼层" prop="pid" v-if="model.level === 'areaTypeBuildings_slice'")
            //- a-input(v-model="model.pid" )
            app-remote-select(v-model="model.pid" 
            api="/project-merchant/areas/list" 
            :params="{projectId: project.id, level: 'areaTypeBuildings_floor'}" placeholder="请选择"
            @change="handlePidChange"
            )

          a-form-model-item(label="所属一级" prop="pid" v-if="model.level === 'areaTypeOutdoor_second'")
            //- a-input(v-model="model.pid" )
            app-remote-select(v-model="model.pid" 
            api="/project-merchant/areas/list" 
            :params="{projectId: project.id, level: 'areaTypeOutdoor_first'}" placeholder="请选择"
            @change="handlePidChange"
            )
          a-form-model-item(label="所属二级" prop="pid" v-if="model.level === 'areaTypeOutdoor_third'")
            //- a-input(v-model="model.pid" )
            app-remote-select(v-model="model.pid" 
            api="/project-merchant/areas/list" 
            :params="{projectId: project.id, level: 'areaTypeOutdoor_second'}" placeholder="请选择"
            @change="handlePidChange"
            )

          a-form-model-item(v-if="['areaTypeBuildings_building','areaTypeOutdoor_first'].includes(model.level)" 
            label="建筑面积" prop="buildingArea")
            a-input-number(v-model="model.buildingArea"  placeholder="请输入")
          a-form-model-item(v-if="!['areaTypeBuildings_slice','areaTypeOutdoor_third'].includes(model.level)" 
            label="占地面积" prop="coverArea")
            a-input-number(v-model="model.coverArea"  placeholder="请输入")

          a-form-model-item(label="区域名称" prop="name")
            a-input(v-model="model.name" :max-length="20" placeholder="请输入")
          a-form-model-item(label="排序" prop="sort")
            a-input-number(v-model="model.sort" placeholder="请输入" :min="0")
          a-form-model-item(label="备注" prop="remark")
            a-textarea(v-model="model.remark" placeholder="请输入")
        div
          a-button(@click="handleCancel") 取消
          a-button.ml2(:disabled="!!loading" type="primary" :loading="loading==='save'" @click="handleSubmit")  确定           
</template>
<script>
import BimLoader from '@/components/common/Bim/BimLoader';
import MapMarker from '../Modal/Marker';

import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: {
    BimLoader,
    MapMarker
  },
  data() {
    return {
      visible: false,
      loading: false,
      loadModal: false,
      modelPath: null,
      mapData: [],
      model: {
        name: null,
        type: null,
        level: null,
        pid: null,
        buildingArea: null,
        coverArea: null,
        acreage: null,
        sort: 1,
        remark: null,
        bimInfo: {
          modelFileId: null, // 模型文件Id
          specialty: null, // 专业
          modelLevel: null, // 楼层
          ecode: null, // 构件 elementId
          // coordinate: {
          // 坐标
          x: null,
          y: null,
          z: null,
          // },
        },
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
        type: [{ required: true, message: '必填项' }],
        level: [{ required: true, message: '必填项' }],
        pid: [{ required: true, message: '必填项' }],
        buildingArea: [{ required: true, message: '必填项' }],
        coverArea: [{ required: true, message: '必填项' }],

        acreage: [{ required: true, message: '必填项' }],
        modelFileId: [{ required: true, message: '必填项' }],
        specialty: [{ required: true, message: '必填项' }],
        modelLevel: [{ required: true, message: '必填项' }],
        ecode: [{ required: true, message: '必填项' }],
        coordinate: [{ required: true, message: '必填项' }],
        sort: [{ required: true, message: '必填项' }],
      },
      markers: [btoa(Math.random() * 1000).substr(0, 8)],
      totalModel: null,
      buildingList: [],
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
      return { superiorsId: this.model.type };
    },
    id() {
      return this.$route.params.id;
    },
  },
  async created() {
    const model = await this.$restful(`GET:/project-merchant/areas/${this.id}`);
    this.model = {
      ...this.model,
      ...model,
    };
  },
  mounted() { },
  methods: {
    async loadModel() {
      if (this.model.bimInfo.modelLoadPath && this.model.bimInfo.z) {
        this.$refs.bim.reload(this.model.bimInfo.modelLoadPath);
        this.$refs.bim.handleViewAdded = () => {
          if (this.model.bimInfo.specialty) {
            this.$refs.bim.hideComponents(
              [{ specialty: this.model.bimInfo.specialty }],
              'MakeOthersTranslucent',
            );
          }
          if (this.model.bimInfo.modelLevel) {
            this.$refs.bim.hideComponents(
              [{ levelName: this.model.bimInfo.modelLevel }],
              'HideOthers',
            );
          }
          if (this.model.bimInfo.x) {
            this.$refs.bim.addLabel(
              {
                position: {
                  x: this.model.bimInfo.x,
                  y: this.model.bimInfo.y,
                  z: this.model.bimInfo.z,
                },
              },
              this.$refs.marker.$el,
              -40,
              -50,
            );
          }
        };
      } else {
        this.modelPath = this.totalModel?.loadPath;
        this.mapData = [
          {
            name: '',
            value: [this.model.bimInfo.x, this.model.bimInfo.y],
          },
        ];
      }
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

          this.close();
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
      // this.reset();
      this.$back();
    },
    reset() {
      // this.$refs.form.resetFields();
    },
    resetFieldsForProceed() {
      // this.$refs.form.resetFields();
    },
    handleTypeChange() {
      this.model.level = null;
      this.clearCoordinate();
    },
    handleLevelChange() {
      this.model.pid = null;
      const model = this.totalModel;
      if (model && this.model.bimInfo.z) {
        this.model.bimInfo.modelFileId = model.modelFileId;
        this.$refs.bim.reload(model.loadPath);
      }
      this.clearCoordinate();
    },
    async handlePidChange(select, option) {
      const data = option.data.attrs.data;
      if (
        [
          // 'areaTypeBuildings_building',
          'areaTypeBuildings_floor',
          'areaTypeBuildings_slice',
        ].includes(this.model.level)
      ) {
        const { bimInfo } = await this.$restful(`GET:/project-merchant/areas/${select}`);
        if (bimInfo) {
          this.model.bimInfo.specialty = bimInfo.specialty;
          this.model.bimInfo.modelLevel = bimInfo.modelLevel;
          const { id: buildingId } = await this.$restful(
            `GET:/bim/buildings/one-by-name`,
            {
              name: bimInfo.specialty,
              projectId: this.project.id,
            },
          );
          const model = await this.$restful(
            `GET:/bim/bim-models/building?buildingId=${buildingId}`,
          );
          if (model) {
            this.model.bimInfo.modelFileId = model.modelFileId;
            this.$refs.bim.reload(model.loadPath);
            if (bimInfo.modelLevel) {
              this.$refs.bim.handleViewAdded = () => {
                this.$refs.bim.hideComponents(
                  [{ levelName: this.model.bimInfo.modelLevel }],
                  'HideOthers',
                );
              };
            }
          }
        }
      } else {
        const model = this.totalModel;
        if (model) {
          this.$refs.bim.reload(model.loadPath);
        }
        const { bimInfo } = await this.$restful(`GET:/project-merchant/areas/${select}`);
        if (bimInfo) {
          this.model.bimInfo.specialty = bimInfo.specialty;
          this.model.bimInfo.modelLevel = bimInfo.modelLevel;
        }
      }
      this.clearCoordinate();
    },
    handleBimChange(select, option) {
      // bim模型文件改变,
      const modelData = option.data.attrs.data;
      this.$refs.bim.reload(modelData.loadPath);
      const building = this.buildingList.find(
        (item) => item.id === modelData.buildingId,
      );

      this.model.bimInfo.specialty = building
        ? building.name
        : modelData.modelFileName; // modelData.buildingId;
      this.model.bimInfo.specialtyName = building
        ? building.name
        : modelData.modelFileName;
      this.model.bimInfo.modelLevel = null;
      this.model.bimInfo.modelLevelName = null;
      this.clearCoordinate();
    },
    handleSpecChange(select, option) {
      // 专业, 楼栋 改变
      const data = option.data.attrs.data;
      this.model.name = data.name; // 手动设置区域名称
      this.model.bimInfo.specialty = data.name; // data.buildingId;
      this.model.bimInfo.specialtyName = data.name; // 手动设置楼栋名

      this.model.bimInfo.modelLevel = null;
      this.model.bimInfo.modelLevelName = null;
      this.clearCoordinate();
    },
    handleLevChange(select, option) {
      // 楼层, 级别改变
      const data = option.data.attrs.data;
      this.model.name = data.name; // 手动设置区域名称
      this.model.bimInfo.modelLevelName = data.name; // 手动设置楼层名
      this.model.bimInfo.modelLevelId = data.id; // 手动设置楼层ID
      this.$refs.bim.hideComponents(
        [{ levelName: data.name }],
        // 'MakeOthersTranslucent',
      );
      this.clearCoordinate();
    },
    handleClickMap(obj, value) {
      this.model.bimInfo.x = value[0];
      this.model.bimInfo.y = value[1];
      // this.mapData.push({
      //   name: obj.name,
      //   value: value,
      // });
    },
    handleClickModel(objectdata, data, viewMeteData) {
      // 点击模型, 打点
      if (['areaTypeBuildings_floor'].includes(this.model.level)) {
        return;
      }
      const position = objectdata.worldPosition;
      // const dom = document.getElementById('marker');
      if (position) {
        this.$refs.bim.addLabel({ position }, this.$refs.marker.$el, -40, -50);
        this.model.bimInfo.x = position.x;
        this.model.bimInfo.y = position.y;
        this.model.bimInfo.z = position.z;
      }
    },
    clearCoordinate() {
      this.model.bimInfo.x = null;
      this.model.bimInfo.y = null;
      this.model.bimInfo.z = null;
    },
    async loadViewModal() {
      if (this.id) {
        await this.loadModel();
      } else if (this.totalModel) {
        if (this.project.model === 'model_JM') {
          this.modelPath = this.totalModel.loadPath;
        } else {
          this.$refs.bim.reload(this.totalModel.loadPath);
        }
      }
    }
  },
};
</script>
<style lang="less" scoped>
.full-height {
  // height: calc(100vh - 260px);
  overflow: auto;
}
</style>
