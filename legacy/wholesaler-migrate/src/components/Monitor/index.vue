<template>
  <div :class="$style.container">
    <div :class="$style.side">
      <a-list :data-source="data" :class="$style.list">
        <a-list-item
          :class="$style.listItem"
          @click="loadBim(item.filePath)"
          slot="renderItem"
          slot-scope="item"
        >
          {{ item.name }}
        </a-list-item>
      </a-list>
    </div>
    <div :class="$style.main">
      <BimLoader ref="bim" />
    </div>
  </div>
</template>

<script>
// import AppFrame from '@/components/common/Frame';
import BimLoader from '@/components/common/Bim/BimLoader';
export default {
  components: {
    BimLoader,
  },
  data() {
    return {
      data: [],
    };
  },
  mounted() {
    this.getModels();
    this.$refs.bim.initBim('/Bim/bas/viewToken.json');
    // this.$refs.bim.initBim('/unZipFile/all_air/viewToken.json');
  },
  methods: {
    async getModels() {
      const params = {
        search: '',
        type: '',
        areaId: '',
        pageNum: 1,
        pageSize: 20,
        sortColumn: '',
        sortType: '',
      };
      const res = await this.$axios.get('/iot/models/page', {
        params,
      });
      this.data = res.records;
    },
    loadBim(path) {
      this.$refs.bim.initBim('/bim/' + path); // 在前面加上/bim方便代理
    },
  },
};
</script>

<style lang="less" module>
.container {
  height: 100%;
  background-color: #000;
  background-image: url('/resource/v1/wholesaler-migrate/images/background.jpg');
  display: flex;
  justify-content: stretch;
  .side {
    width: 200px;
    height: 100%;
    padding: 12px;
    .list {
      width: 176px;
      overflow: hidden;
    }
    .listItem {
      color: #ffffff;
      // text-align: center;
      padding: 12px;
      cursor: pointer;
      border-bottom: 1px solid #ffffff20;
      margin-top: 2px;
      &:hover {
        background-color: #1890ff20;
      }
    }
  }
  .main {
    flex: 1;
    padding: 12px;
    // height: 100%;
  }
}
</style>
