<template>
  <div class="work-permit-items">
    <div v-if="mode === 'DESIGN'" class="design-preview">
      <div class="task-row" v-for="index in 3" :key="index">
        <span class="task-index">{{ index }}</span>
        <el-checkbox disabled>逐项确认{{ index }}</el-checkbox>
      </div>
    </div>
    <div v-else>
      <div class="items-header">
        <div class="summary">{{ summaryText }}</div>
        <el-button size="small" type="primary" icon="el-icon-plus" @click="addManualItem">{{ manualPlaceholder }}</el-button>
      </div>
      <div v-loading="loading" class="task-list">
        <div v-if="displayItems.length === 0" class="empty-text">暂无任务项</div>
        <div
          v-for="(item, index) in displayItems"
          :key="itemKey(item)"
          class="task-row"
          :class="{ checked: isChecked(item), manual: item.custom }"
        >
          <template v-if="item.custom">
            <span class="task-index">{{ rowIndex(item, index) }}</span>
            <el-input
              class="manual-input"
              size="small"
              :value="item.itemName"
              :placeholder="manualInputPlaceholder"
              @input="(value) => updateManualItem(item, value)"
            />
            <el-button class="remove-btn" size="mini" type="text" icon="el-icon-delete" @click="removeManualItem(item)">移除</el-button>
          </template>
          <template v-else>
            <span class="task-index">{{ rowIndex(item, index) }}</span>
            <div class="task-name-line">
              <span class="task-name">{{ item.itemName }}</span>
              <span v-if="item.aiRecognitionEnabled" class="ai-badge">AI</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import componentMinxins from "../ComponentMinxins";
import { getWorkPermitAcceptanceItems, getWorkPermitRiskCheckItems } from "@/api/workPermit";

export default {
  mixins: [componentMinxins],
  name: "WorkPermitAssociatedItems",
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    formData: {
      type: Object,
      default: () => ({}),
    },
    params: {
      type: String,
      default: null,
    },
    params2: {
      type: String,
      default: null,
    },
    itemType: {
      type: String,
      default: "RISK_CHECK",
    },
    placeholder: {
      type: String,
      default: "请输入任务项内容",
    },
  },
  data() {
    return {
      loading: false,
      page: {
        pageNumber: 1,
        pageSize: 1000,
        total: 0,
      },
      records: [],
    };
  },
  computed: {
    selectedItems() {
      return Array.isArray(this.value) ? this.value : [];
    },
    effectiveSelectedItems() {
      return this.selectedItems.filter((item) => this.isEffectiveItem(item));
    },
    confirmedItems() {
      return this.effectiveSelectedItems.filter((item) => Boolean(item.confirmResult));
    },
    hasRemoteSnapshot() {
      return this.selectedItems.some((item) => !item.custom);
    },
    abnormalResultCount() {
      return this.confirmedItems.filter((item) => item.confirmResult === "ABNORMAL").length;
    },
    aiAbnormalCount() {
      return this.confirmedItems.filter((item) => item.confirmSource === "AI" && item.confirmResult === "ABNORMAL").length;
    },
    summaryText() {
      return `确认项 ${this.confirmedItems.length}；异常 ${this.abnormalResultCount}；AI异常项 ${this.aiAbnormalCount}`;
    },
    manualPlaceholder() {
      return "添加" + (this.itemType === "ACCEPTANCE" ? "验收项" : "检查项");
    },
    manualInputPlaceholder() {
      return "请输入" + (this.itemType === "ACCEPTANCE" ? "验收项" : "检查项") + "内容";
    },
    typeName() {
      return this.getRelatedTypeName();
    },
    workPermitLevel() {
      return this.getRelatedLevel();
    },
    displayItems() {
      const map = new Map();
      this.records.forEach((item) => map.set(this.itemKey(item), item));
      this.selectedItems.forEach((item) => {
        if (!map.has(this.itemKey(item))) {
          map.set(this.itemKey(item), item);
        }
      });
      return Array.from(map.values());
    },
  },
  watch: {
    typeName() {
      this.reload();
    },
    workPermitLevel() {
      this.reload();
    },
  },
  created() {
    if (this.mode !== "DESIGN") {
      this.fetchPage();
    }
  },
  methods: {
    validate(call) {
      this.$emit("input", this.effectiveSelectedItems);
      call(true);
    },
    getRelatedTypeName() {
      const value = this.params ? this.formData[this.params] : null;
      if (!value) {
        return null;
      }
      if (typeof value === "string") {
        return value;
      }
      return value.typeName || value.name || null;
    },
    getRelatedLevel() {
      const value = this.params2 ? this.formData[this.params2] : null;
      if (!value) {
        return null;
      }
      if (typeof value === "string") {
        return value;
      }
      return value.workPermitLevel || value.name || value.label || null;
    },
    async fetchPage(useRemoteSnapshot = true) {
      if (useRemoteSnapshot && this.hasRemoteSnapshot) {
        this.records = this.selectedItems.filter((item) => !item.custom);
        this.page.total = this.records.length;
        return;
      }
      this.loading = true;
      try {
        const api = this.itemType === "ACCEPTANCE" ? getWorkPermitAcceptanceItems : getWorkPermitRiskCheckItems;
        const res = await api({
          pageNumber: this.page.pageNumber,
          pageSize: this.page.pageSize,
          typeName: this.typeName,
          workPermitLevel: this.workPermitLevel,
        });
        this.records = this.getRecords(res);
        this.mergeLoadedRecordsToSelected(this.records);
        this.page.total = Number(res && res.total ? res.total : this.records.length);
      } finally {
        this.loading = false;
      }
    },
    getRecords(res) {
      if (!res) {
        return [];
      }
      if (Array.isArray(res.records)) {
        return res.records;
      }
      if (Array.isArray(res.list)) {
        return res.list;
      }
      if (Array.isArray(res.data)) {
        return res.data;
      }
      if (Array.isArray(res)) {
        return res;
      }
      return [];
    },
    reload() {
      this.page.pageNumber = 1;
      this.fetchPage(false);
    },
    itemKey(item) {
      return item.custom ? `custom-${item.id || item.itemName}` : `remote-${item.id}`;
    },
    rowIndex(item, index) {
      return index + 1;
    },
    isChecked(item) {
      if (item.custom && !this.isEffectiveItem(item)) {
        return false;
      }
      return this.selectedItems.some((selected) => this.itemKey(selected) === this.itemKey(item));
    },
    isEffectiveItem(item) {
      return !item.custom || Boolean((item.itemName || "").trim());
    },
    mergeLoadedRecordsToSelected(loadedRecords) {
      const selectedMap = new Map();
      this.selectedItems.forEach((item) => selectedMap.set(this.itemKey(item), item));
      const next = loadedRecords.map((item) => this.toValueItem({ ...item, ...(selectedMap.get(this.itemKey(item)) || {}) }));
      this.selectedItems.forEach((item) => {
        if (item.custom && !next.some((nextItem) => this.itemKey(nextItem) === this.itemKey(item))) {
          next.push(item);
        }
      });
      if (
        next.length !== this.selectedItems.length ||
        next.some((item, index) => this.itemKey(item) !== this.itemKey(this.selectedItems[index]))
      ) {
        this.$emit("input", next);
      }
    },
    toValueItem(item) {
      return {
        id: item.id,
        itemName: item.itemName,
        typeName: item.typeName,
        workPermitLevel: item.workPermitLevel,
        sortNo: item.sortNo,
        checked: true,
        custom: !!item.custom,
        aiRecognitionEnabled: item.aiRecognitionEnabled,
        confirmResult: item.confirmResult,
        description: item.description,
        attachments: item.attachments || [],
        confirmSource: item.confirmSource,
      };
    },
    addManualItem() {
      const item = {
        id: `manual-${Date.now()}`,
        itemName: "",
        typeName: this.typeName,
        workPermitLevel: this.workPermitLevel,
        checked: true,
        custom: true,
      };
      this.$emit("input", [...this.selectedItems, item]);
    },
    updateManualItem(item, itemName) {
      this.$emit(
        "input",
        this.selectedItems.map((selected) => (this.itemKey(selected) === this.itemKey(item) ? { ...selected, itemName } : selected)),
      );
    },
    removeManualItem(item) {
      this.$emit(
        "input",
        this.selectedItems.filter((selected) => this.itemKey(selected) !== this.itemKey(item)),
      );
    },
  },
};
</script>

<style scoped lang="less">
.work-permit-items {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  background: #fff;

  .items-header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-bottom: 8px;
  }

  .summary {
    flex: 1;
    min-width: 0;
    color: #606266;
    font-size: 12px;
  }

  .task-list {
    min-height: 64px;
  }

  .task-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    padding: 6px 8px;
    border-bottom: 1px solid #ebeef5;
    background: #fff;

    &.checked {
      background: #f4f9f0;
    }
  }

  .task-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #f2f3f5;
    color: #606266;
    font-size: 12px;
  }

  .task-name-line {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .task-name {
    color: #303133;
    word-break: break-all;
  }

  .ai-badge {
    flex: 0 0 auto;
    padding: 0 5px;
    border: 1px solid #91caff;
    border-radius: 3px;
    color: #409eff;
    font-size: 12px;
    line-height: 18px;
    background: #ecf5ff;
  }

  .task-row.manual {
    border: 1px dashed #bcd9ff;
    border-radius: 6px;
    background: #f8fbff;
  }

  .manual-input {
    flex: 1;
    min-width: 0;
  }

  .remove-btn {
    flex: 0 0 auto;
    color: #f56c6c;
  }

  .empty-text {
    color: #909399;
    text-align: center;
    padding: 18px 0;
  }
}
</style>
