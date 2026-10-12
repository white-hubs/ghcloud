<template>
  <div class="app-model-select">
    <BimLoader ref="bim" @click="handleClickModel" @viewAdded="handleViewAdded" />
    <CoordinateMarker ref="marker" id="marker" :class="!coordinate ? 'hide' : ''" />
  </div>
</template>
<script>
import BimLoader from '@/components/common/Bim/BimLoader';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: {
    BimLoader,
    CoordinateMarker: {
      props: {
        img: {
          type: String,
          default: () => {
            return require('./images/marker_common.png');
          },
        },
      },
      render() {
        return (
          <div style={{ width: '46px', height: '50px', display: 'none' }}>
            <img src={this.img} style={{ width: '46px', height: '50px' }} />
          </div>
        );
      },
    },
  },

  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: Object,
    bimInfo: Object,
    disableCoordinate: Boolean,
  },
  data() {
    return {
      totalModel: null,
      modelFileObj: null,
      coordinate: null,
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
  },
  watch: {
    bimInfo: 'handleBimInfoChange',
    modelFileObj: 'handleModelFileChange',
  },
  async created() {
    this.totalModel = await this.$restful(`GET:/bim/bim-models/park`, {
      projectId: this.project.id,
    });
    if (!this.bimInfo) {
      // 如果没有bimInfo, 默认展示园区总览
      this.handleBimInfoChange();
    } else {
      // 数据回填
      this.handleBimInfoChange();
    }
  },
  methods: {
    async loadModelFileById(id) {
      const modelFileObj = await this.$restful(
        `GET:/bim/bim-models/file-id?fileId=${id}`,
      );
      this.modelFileObj = modelFileObj || this.totalModel;
    },
    async loadModelFileBySpecialty(specialty) {
      const { id: buildingId } = await this.$restful(
        `GET:/bim/buildings/one-by-name`,
        {
          name: specialty,
          projectId: this.project.id,
          // ?name=${specialty}&projectId=${this.project.id}
        },
      );
      const model = await this.$restful(
        `GET:/bim/bim-models/building?buildingId=${buildingId}`,
      );
      this.modelFileObj = model || this.totalModel;
    },
    async loadModelSpecialtyById() {
      // 加载专业
    },
    async loadModelSpecialty() {
      // 加载专业
      this.$refs.bim.hideComponents(
        [{ specialty: this.bimInfo.specialtyName }],
        // 'MakeOthersTranslucent',
      );
    },
    async loadModelLevelById() {
      // 加载楼层 getFloors
    },
    async loadModelLevel() {
      // 加载楼层 getFloors
      this.$refs.bim.hideComponents(
        [{ levelName: this.bimInfo.modelLevel }],
        // 'MakeOthersTranslucent',
      );
    },
    async loadModelElementById() {
      // 加载构件 object
    },
    async loadModelElementByCode() {
      // 加载构件 object
      const { objectId, levelName, specialty } = await this.$restful(
        `GET:/bim/elements/code?code=${this.bimInfo.ecode}`,
      );
      this.bimInfo.specialtyName = specialty;
      this.loadModelSpecialty();
      this.bimInfo.modelLevel = levelName;
      this.loadModelLevel();

      this.$refs.bim.zoomToComponents([objectId]);
    },
    loadBim() {
      // 加载BIM模型
      this.$refs.bim.reload(this.modelFileObj.loadPath);
    },
    // ========= 监听数据变化 ========
    handleBimInfoChange() {
      // 处理bimInfo变化
      // debugger;
      if (!this.bimInfo?.specialty) {
        this.$restful(`GET:/bim/bim-models/park`, {
          projectId: this.project.id,
        }).then((res) => {
          this.modelFileObj = res;
        });
      } else {
        if (this.bimInfo.modelFileId) {
          this.loadModelFileById(this.bimInfo.modelFileId);
        }
        if (this.bimInfo.specialty) {
          this.loadModelFileBySpecialty(this.bimInfo.specialty);
        }
        if (
          this.bimInfo.x &&
          this.bimInfo.y &&
          this.bimInfo.y &&
          !this.disableCoordinate
        ) {
          const { x, y, z } = this.bimInfo;
          this.coordinate = { x, y, z };
          // 自动标记坐标
          this.addMarker(this.coordinate, this.$refs.marker.$el);
        } else {
          this.coordinate = null;
        }
      }
    },
    handleModelFileChange() {
      // 处理模型文件变化
      if (this.modelFileObj.loadPath) {
        this.loadBim();
      }
    },
    // ==========  bim API ==========
    addMarker(position, dom) {
      dom.style.display = 'block';
      const { clientWidth: width, clientHeight: height } = dom;
      this.$refs.bim.addLabel({ position }, dom, -width / 2, -height / 2);
    },
    // ==========  bim 事件 处理 ==========
    handleClickModel(objectdata) {
      // objectdata, data, viewMeteData 单击
      const position = objectdata?.worldPosition;
      if (position && !this.disableCoordinate) {
        this.$emit('change', {
          ...this.bimInfo,
          ...position,
        });
        this.$emit('select-coordinate', { ...position });
        this.coordinate = position;
        this.addMarker(position, this.$refs.marker.$el);
      }
    },
    handleViewAdded() {
      // viewMeteData 模型加载完成
      // if(this.bimInfo?.ecode)
      if (this.bimInfo?.specialty) {
        // 自动选中专业
        this.loadModelSpecialtyById();
      }
      if (this.bimInfo?.modelLevel) {
        // 自动选中楼层
        this.loadModelLevel();
      }
      if (this.bimInfo?.ecode) {
        // 自动选中构件
        this.loadModelElementByCode(this.bimInfo.ecode);
      }
      if (this.coordinate) {
        // 自动标记坐标
        this.addMarker(this.coordinate, this.$refs.marker.$el);
      }
    },
  },
  // render() {
  //   return (
  //     <div class="app-model-select">
  //       <BimLoader
  //         ref="bim"
  //         onClick={this.handleClickModel}
  //         onViewAdded={this.handleViewAdded}
  //       />
  //       <CoordinateMarker
  //         ref="marker"
  //         id="marker"
  //         class={!this.coordinate ? 'hide' : ''}
  //       />
  //     </div>
  //   );
  // },
};
</script>

<style lang="less" scoped>
//
.app-model-select {
  height: 100%;
}
</style>
