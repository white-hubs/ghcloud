<template>
  <div
    class="space_panel extra-common-panel"
    :class="{ top100: selectedMenu.label === '疫情防控' }"
    v-show="visible"
  >
    <div class="space_info" v-if="space">
      <img
        class="close-icon p1 m1"
        :src="closeIcon"
        alt="关闭"
        title="关闭"
        @click="hide('self')"
      />
      <div class="space_header">
        <div class="space_name">
          <img class="ml1 space_icon" :src="floorIcon" />
          <span class="ml2">{{ space.name }}</span>
        </div>
        <div class="space_tags">
          <div class="space_tag rented" v-if="store && store.id">
            已出租
          </div>
          <div class="space_tag unrented" v-else>未出租</div>
          <div class="space_tag ml1">档位</div>
          <div v-if="space.deptName" class="space_tag ml1">
            {{ space.deptName }}
          </div>
        </div>
      </div>
      <div class="space_body">
        <div class="space_acreage">{{ space.coverArea }}m²</div>
        <div class="space_acreage_label">空间面积</div>
      </div>
    </div>
    <div class="store_info" v-if="parseStore">
      <div class="divider"></div>
      <div class="store_header">
        <div class="store_base">
          <div class="store_base_item">{{ parseStore.name }}</div>
          <div class="store_base_item">{{ parseStore.owner }}</div>
        </div>
        <template v-if="selectedMenu.label === '空间总览'">
          <div class="store_base">
            <div class="store_base_item">
              <span
                :class="
                  parseStore.securityFileDTOS &&
                  parseStore.securityFileDTOS.length
                    ? 'success'
                    : 'danger'
                "
              >
                {{
                  parseStore.securityFileDTOS &&
                  parseStore.securityFileDTOS.length
                    ? '已签'
                    : '未签'
                }}
              </span>
              <a
                v-if="
                  parseStore.securityFileDTOS &&
                  parseStore.securityFileDTOS.length
                "
                :href="$filehost + parseStore.securityFileDTOS[0].path"
                target="_blank"
                class="ml2"
              >
                <img :src="getFileIcon()" alt="" />
                <span class="ml1">安全协议</span>
              </a>
              <span v-else class="ml2">安全协议</span>
            </div>
          </div>
          <div class="store_base" v-if="parseStore.introduction">
            {{ parseStore.introduction }}
          </div>
        </template>
      </div>
      <div class="store_body" v-if="selectedMenu.label === '空间总览'">
        <app-imgs-display :files="parseStore.photos" />
      </div>
    </div>
  </div>
</template>

<script>
import AppImgsDisplay from '../../../../components/global/display/AppImgsDisplay.vue';
export default {
  components: { AppImgsDisplay },
  props: {
    selectedMenu: Object,
    selectedArea: Object,
    selectedObject: Object,

    store: {
      type: Object,
      default: () => {
        return {};
      },
    },
    space: {
      type: Object,
      default: () => {
        return {};
      },
    },
    element: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      visible: false,
      closeIcon: require('../../images/monitor_close.png'),
      buildingIcon: require('../../images/park_title.png'),
      floorIcon: require('../../images/park_title.png'),
      upList: [],
      downList: [],
      title: '商户名称',
      parseSpace: null,
      parseStore: null,
      imgIcon: require('../../images/img.png'),
      pdfIcon: require('../../images/pdf.png'),
      wordIcon: require('../../images/word.png'),
    };
  },
  watch: {
    type: 'loadData',
    // space: 'loadData',
    store: 'loadStore',
  },
  created() {
    this.loadData();
    this.$sub('common', this.show);
    this.$sub('common-hide', this.hide);
  },
  methods: {
    show() {
      this.visible = true;
    },
    hide(trigger) {
      this.visible = false;
      if (trigger === 'self') {
        this.$pub('event-list-hide', this.hide);
      }
    },
    // 补全商户信息
    async loadStore() {
      if (this.store?.id) {
        const store = await this.$restful(
          'GET:/project-merchant/companies/' + this.store?.id,
        );
        this.parseStore = {
          ...this.store,
          ...store,
          photos: (store.trainingPhotoFileDTOS || []).concat(
            store.companyPhotoFileDTOS || [],
          ),
        };
      } else {
        this.parseStore = null;
      }
    },
    // 获取安全协议文件类型图标
    getFileIcon() {
      if (this.parseStore?.securityFileDTOS?.length) {
        const fileType = this.parseStore.securityFileDTOS[0].type;
        if (fileType.includes('doc')) {
          return this.wordIcon;
        } else if (fileType.includes('pdf')) {
          return this.pdfIcon;
        } else {
          return this.imgIcon;
        }
      }
    },
    async loadData() {
      switch (this.type) {
        case '空间总览':
          break;
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import '~@/styles/variables';
.space_panel {
  position: absolute;
  width: 410px;
  z-index: 200;
  top: 22px;
  right: 550px;
  background-color: rgba(16, 17, 26, 0.9);
  border: solid 1px #00ffff90;
  box-shadow: 0px 1px 4px 0px #00ffff90;
  color: #ffffff;

  &.top100 {
    top: 110px;
  }
  .close-icon {
    position: absolute;
    right: 0;
    height: 24px;
    cursor: pointer;
    &:hover {
      filter: blur(1px);
    }
  }
  .space_info {
    padding: 0 8px;

    .space_header {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 30px;
      .space_name {
        font-size: 16px;
        display: flex;
        align-items: center;
        img {
          height: 16px;
        }
      }
      .space_tags {
        display: flex;
        .space_tag {
          font-size: 14px;
          padding: 2px 6px;
          border-radius: 2px;
          border: 1px solid fadeout(@primary-color, 50%);
          background-color: fadeout(@primary-color, 80%);
        }
        .rented {
          border: 1px solid fadeout(#00ffff, 50%);
          background-color: fadeout(#00ffff, 80%);
        }
        .unrented {
          border: 1px solid fadeout(@success-color, 50%);
          background-color: fadeout(@success-color, 80%);
        }
      }
    }
    .space_body {
      .space_acreage {
        font-size: 36px;
        font-weight: 600;
        text-align: center;
      }
      .space_acreage_label {
        color: #ababab;
        text-align: center;
        padding-bottom: 12px;
      }
    }
  }
  .store_info {
    padding: 0 8px;
    .divider {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .store_header {
      // font-size: 16px;
      padding: 4px;
      .store_base {
        display: flex;
        padding: 4px;
        align-items: center;
        justify-content: space-between;
        .store_base_item {
          display: flex;
          align-items: center;
          a {
            display: flex;
            align-items: center;
          }
        }
        .success {
          color: @success-color;
        }
        .danger {
          color: @error-color;
        }
      }
    }
    .store_body {
      padding: 4px;
      margin-bottom: 4px;
      .store_photo {
        width: 100%;
      }
    }
  }
}
</style>
<style lang="less">
.space_panel .imgs-display .img-box {
  width: 30%;
  height: 120px;
  margin: 1.6%;
}
</style>
