<template lang="pug">
div(:class='classNames')
  a-table.show-scroll(
    v-if='!$attrs.defaultExpandAllRows || (data && data.length)',
    :columns='columns',
    ref='table',
    :loading='loading',
    :rowKey='rowKey',
    :scroll='scroll',
    :pagination='pagination1',
    :customRow='customRow1',
    :dataSource='data',
    :rowSelection='rowSelection1',
    :rowClassName='rowClassName1',
    :expandedRowKeys='expandedRowKeys',
    @change='changeHandler',
    v-bind='$attrs',
    v-on='$listeners'
  )
    slot(name='footer', slot='footer')
    template(
      #expandedRowRender='record',
      v-if='$scopedSlots.expandedRowRender'
    )
      slot(name='expandedRowRender', :record='record')
  .toolbar(:class='{ pageable: !!pagination }')
    .flex-auto
      a-tooltip(title='导出', v-if='showExport')
        a-button.toolbar-btn(@click='exportCsvHandler')
          a-icon(type='export')
      slot(name='bottom-left') 
    .flex-none(v-if='pagination === false') 共{{ data.length }}条数据
</template>
<script>
import _ from 'lodash';
import {
  parseTableColumns,
  exportCsv,
  flattenTreeData,
  attachColumns,
} from './utils';
import { GETTER_DICT_MAP } from '@store/dict';
import { GETTER_DEVICE_SIZE } from '@store/common';
import { mapGetters } from 'vuex';
import * as ModelService from '@/services/ModelService';
import SortableMixin from './sortable-mixin';
import { exportToXlsx } from '@/plugins/exportToXlsx';
export default {
  mixins: [SortableMixin()],
  props: {
    // 模型名称
    modelName: {
      type: String,
      required: true,
    },
    // 用于保存配置的Key,不传入 使用modelName
    tableKey: {
      type: String,
    },
    visibles: {
      type: Array,
      required: true,
    },
    rowKey: {
      type: [String, Function],
      default: 'id',
    },
    showIndex: {
      // 显示index
      default: 'none',
      validator(value) {
        return ['none', 'page', 'total'].includes(value);
      },
    },
    url: [String, Function],
    pagination: {
      default: true,
      type: [Boolean, Object],
    },
    selectionMode: {
      default: 'multi',
      validator(value) {
        return [false, 'single', 'multi'].includes(value);
      },
    },
    fitHeight: {
      default: 0,
      type: [Number, Boolean],
    },
    minWidth: {
      type: [Number, String],
      default: 'max-content',
    },
    maxHeight: [Number, String],
    rowSelection: Object,
    getCheckboxProps: Function,
    customRow: Function,
    rowClassName: Function,
    expandedRowKeys: Array,
    columnsCustomsize: Function, // 处理列
    defaultSort: {
      type: [String, Array],
      default: 'createTime,desc',
    },
    params: [Object, Function],
    filter: [Object, Array],
    showExport: Boolean,
    pageSize: Number,
    maxCount: Number,
  },
  data() {
    return {
      loading: false,
      selectedRowKeys: [], // 多选模式下所有选中的行的key
      selectedKey: null, // 单选模式下当前选中的行的key
      pageParam: {
        page: 1,
        size: 10,
        sort: this.defaultSort,
      },
      total: 0,
      data: [],
      columns: [],
      tableConfig: null,
      list: [],
    };
  },
  computed: {
    ...mapGetters({
      dicts: GETTER_DICT_MAP,
    }),
    pagination1() {
      const pagination = {
        position: 'bottom',
        current: this.pageParam.page,
        pageSize: this.pageParam.size,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100', '500'],
        total: this.total,
        showTotal: (total) => `共${total}条数据`,
      };
      if (this.pagination === true) {
        return pagination;
      }

      if (_.isPlainObject(this.pagination)) {
        return {
          ...pagination,
          ...this.pagination,
        };
      }
      return false;
    },
    rowSelection1() {
      if (this.selectionMode === false) {
        return null;
      } else if (this.selectionMode === 'multi') {
        // return {
        //   onChange: this.selectChangeHandler,
        // };
        let rowSelection = {
          ...this.rowSelection,
        };
        rowSelection.selectedRowKeys = this.selectedRowKeys;
        rowSelection.onChange = this.selectChangeHandler;
        if (this.getCheckboxProps) {
          rowSelection.getCheckboxProps = this.getCheckboxProps;
        } else {
          delete rowSelection.getCheckboxProps;
        }
        return rowSelection;
      } else {
        let rowSelection = {
          ...this.rowSelection,
        };
        rowSelection.selectedRowKeys = [this.selectedKey];
        rowSelection.onChange = this.selectChangeHandler;
        rowSelection.type = 'radio';
        if (this.getCheckboxProps) {
          rowSelection.getCheckboxProps = this.getCheckboxProps;
        } else {
          delete rowSelection.getCheckboxProps;
        }
        return rowSelection;
      }
    },
    scroll() {
      let minWidth = this.minWidth;
      const configMinWidth = _.get(this.tableConfig, 'minWidth');
      if (configMinWidth && configMinWidth !== 'default') {
        minWidth = configMinWidth;
      }
      if (minWidth === 'auto') {
        minWidth = '0px';
      }
      if (this.fitHeight !== false) {
        return {
          x: minWidth,
          y: `calc(100vh - ${385 - this.fitHeight}px)`,
        };
      }

      return {
        x: minWidth,
        y: this.maxHeight,
      };
    },
    classNames() {
      return {
        'max-content': _.get(this.tableConfig, 'minWidth') === 'max-content',
      };
    },
  },
  watch: {
    params: 'refresh',
    filter: 'refresh',
  },
  created() {
    this.pageParam.size = this.pageSize || 10; // 接受pageSize控制
    this.buildColumns();
    this.loadData();
  },
  updated() {
    this.syncBodyAndHeaderWidth();
  },
  mounted() {
    this.syncBodyAndHeaderWidthHandler = _.throttle(
      this.syncBodyAndHeaderWidth,
      200,
    );
    window.addEventListener('resize', this.syncBodyAndHeaderWidthHandler);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.syncBodyAndHeaderWidthHandler);
  },
  destroyed() {
  },
  methods: {
    async buildColumns() {
      const tableConfig = await ModelService.buildTableColumns(
        this.modelName,
        this.visibles,
      );
      attachColumns(tableConfig, this.modelName);

      // 生存序号列
      const indexColumn = this.generateIndexColumn(
        _.isUndefined(tableConfig.showIndex) ||
          tableConfig.showIndex === 'default'
          ? this.showIndex
          : tableConfig.showIndex,
      );
      let columns = [...tableConfig.columns];

      // 自定义列
      if (this.columnsCustomsize) {
        columns = this.columnsCustomsize(columns, tableConfig);
      }

      if (indexColumn) {
        columns.unshift(indexColumn);
      }
      // 解析列，处理customRender和响应式列
      let tableColumns = parseTableColumns(
        this.$createElement,
        columns,
      );

      // 处理scopedSlosts
      tableColumns.forEach((item) => {
        const scopedSlot = this.$scopedSlots[item.uid];
        if (scopedSlot) {
          item.customRender = (text, record, index) => {
            return scopedSlot({ text, record, index });
          };
        }
      });
      tableColumns.forEach((col) => {
        const props = (record) => {
          return {
            attrs: {
              ...(col.nowrap
                ? {
                    nowrap: 'nowrap',
                    title: col.dataIndex && record[col.dataIndex],
                    ellipsis: col.ellipsis,
                  }
                : {}),
              'data-uid': col.uid,
            },
          };
        };
        // 由于fix-layout会导致一些未设置宽度的列宽度为0/ 或者错位问题, 通过设置默认值来解决
        col.width = col.width ? col.width : '200px';

        col.customCell = this.wrapCustom(col, 'customCell', props);
        col.customHeaderCell = this.wrapCustom(col, 'customHeaderCell', props);
      });
      this.columns = tableColumns;
      this.tableConfig = tableConfig;
    },
    wrapCustom(col, type, props) {
      const oldCustom = col[type];
      return (record, index) => {
        const cellProps = oldCustom ? oldCustom(record, index) : null;
        return _.extend(props(record, index), cellProps);
      };
    },
    rowClassName1(record, index) {
      const classNames = [];
      if (this.rowClassName) {
        classNames.push(this.rowClassName(record, index));
      }
      if (this.sortable && this.parentKey) {
        classNames.push(`parent_` + record[this.parentKey]);
      }
      if (
        this.selectionMode === 'single' &&
        this.getRowKey(record) === this.selectedKey
      ) {
        classNames.push('app-table-row-selected');
      }
      return classNames.join(' ');
    },
    generateIndexColumn(showIndex) {
      if (showIndex !== 'none') {
        const column = {
          orderNumber: -1,
          title: ' ',
          width: 60,
          defaultVisible: true,
          align: 'center',
          render(h, value, record, index) {
            return <span>{index + 1}</span>;
          },
        };
        if (showIndex === 'total') {
          column.render = (h, value, record, index) => {
            return (
              <span>
                {(this.pageParam.page - 1) * this.pageParam.size + index + 1}
              </span>
            );
          };
        }
        return column;
      }
      return null;
    },
    getRowKey(record) {
      if (_.isString(this.rowKey)) {
        return record[this.rowKey];
      }
      return this.rowKey(record);
    },
    selectChangeHandler(selectedRowKeys, selectedRows) {
      if (this.selectionMode === 'single') {
        this.selectedKey = selectedRowKeys[0] || null;
        this.$emit('selectChange', {
          selectedRowKeys: this.selectedKey ? [this.selectedKey] : null,
          selectedRows,
        });
      } else {
        if (this.maxCount && selectedRowKeys?.length > this.maxCount) {
          selectedRowKeys.reverse().splice(this.maxCount);
          selectedRowKeys.reverse();
          selectedRows.reverse().splice(this.maxCount);
          selectedRows.reverse();
        }
        this.selectedRowKeys = selectedRowKeys;
        this.$emit('selectChange', {
          selectedRowKeys,
          selectedRows,
        });
      }
    },
    rowClickhandler(record, e) {
      if (
        (this.getCheckboxProps &&
          this.getCheckboxProps(record)?.props?.disabled) ||
        this.hasParents(e.target, { 'data-uid': 'action' }) // 操作列不选中
      ) {
        return;
      }
      if (this.selectionMode !== false) {
        const single = this.selectionMode === 'single';
        const rowKey = this.getRowKey(record);
        if (single) {
          this.selectedKey = this.selectedKey === rowKey ? null : rowKey;
        } else {
          // if (e.ctrlKey) {
          //   this.selectedRowKeys = _.xor(this.selectedRowKeys, [rowKey]);
          // } else {
          //   this.selectedRowKeys = [rowKey];
          // }
          this.selectedRowKeys = _.xor(this.selectedRowKeys, [rowKey]);
          if (this.maxCount && this.selectedRowKeys?.length > this.maxCount) {
            this.selectedRowKeys.reverse().splice(this.maxCount);
            this.selectedRowKeys.reverse();
            // selectedRows.reverse().splice(this.maxCount);
            // selectedRows.reverse();
          }
        }
        // this.findParent(e.target, { 'data-uid': 'action' });
        // if (this.hasParents(e.target, { 'data-uid': 'action' })) {
        //   return;
        // }
        // 勿删 点击单行选择事件冒泡
        const selection = this.getSelection();
        this.$emit('select', {
          rowKey,
          record,
          rowKeys: this.selectedKey ? [this.selectedKey] : this.selectedRowKeys,
          selectedRowKeys: this.selectedKey
            ? [this.selectedKey]
            : this.selectedRowKeys,
          selectedRows:
            this.selectionMode === 'single' ? [selection] : selection,
        });
      }
    },
    hasParents(element, selector) {
      if (!element) {
        return false;
      }
      const keys = Object.keys(selector);
      let isMatchSelector = true;
      keys.forEach((k) => {
        isMatchSelector =
          element.attributes[k]?.value === selector[k]
            ? isMatchSelector
            : false;
      });
      if (isMatchSelector) {
        // return element;
        return isMatchSelector;
      }
      if (element.nodeName === 'BODY') {
        return false;
      } else {
        return this.hasParents(element.parentNode, selector);
      }
    },
    changeHandler(pagination, filters, sorter) {
      this.pageParam.page = pagination.current;
      this.pageParam.size = pagination.pageSize;
      if (sorter.field) {
        this.pageParam.sort =
          sorter.field + ',' + sorter.order?.replace('end', '');
      }
      this.loadData();
    },
    customRow1(record, index) {
      const cutomRowRet = this.customRow
        ? this.customRow.apply(this, record, index)
        : {};
      const oldClick = _.get(cutomRowRet.on, 'click');
      const onClick = (e) => {
        if (oldClick) {
          oldClick(e);
        }
        this.rowClickhandler(record, e);
      };
      if (cutomRowRet.on) {
        cutomRowRet.on.click = onClick;
      } else {
        cutomRowRet.on = {
          click: onClick,
        };
      }
      return cutomRowRet;
    },
    async loadData() {
      try {
        this.loading = true;
        let result = null;
        let params = {
          pageSize: this.pageParam?.size,
          pageNum: this.pageParam?.page,
          sort: ModelService.parseSort(this.modelName, this.pageParam.sort),
          get orderby() {
            return this.sort;
          },
          filter: this.filter,
        };

        if (_.isFunction(this.params)) {
          params = this.params(params);
        } else {
          params = {
            ...params,
            ...this.params,
          };
        }
        if (params.filter) {
          params.filter = encodeURIComponent(JSON.stringify(params.filter));
        }
        if (_.isString(this.url)) {
          // 改成节流的
          result = await this.$axios.concurrentRestful(this.url, params, {
            defferedTimeout: 100,
          });
          // result = await this.$axios.restful(this.url, params);
        } else {
          result = await this.url(params);
        }
        // alert('-----------', new Date());
        if (this.pagination === false) {
          this.data = [];
          this.data = result || result.records;
          this.list = this.list.concat(this.data);
        } else {
          this.data = [];
          this.total = result.total;
          this.data = result.records;
          this.list = this.list.concat(this.data);
        }
        this.selectedRowKeys = [];
        this.selectedKey = null;
        this.$nextTick(() => {
          this.$emit('loaded');
        });
      } finally {
        this.loading = false;
      }
    },
    async refresh() {
      this.pageParam.page = 1;
      await this.loadData();
    },
    reload() {
      this.refresh();
    },
    configSaveHandler() {
      this.buildColumns();
    },
    /**
     * 如果是单选，则返回一条数据
     * 如果是多选返回Array
     * 如果不支持选择返回null
     */
    getSelection() {
      // const flattenData = flattenTreeData(_.cloneDeep(this.list));
      const flattenData = flattenTreeData(_.cloneDeep(this.data));
      if (this.selectionMode === 'multi') {
        return this.selectedRowKeys
          .map((key) => {
            return flattenData.find((item) => {
              return this.getRowKey(item) === key;
            });
          })
          .filter((item) => !!item); // 过滤一下, 防止有空的
      }
      if (this.selectionMode === 'single') {
        return flattenData.find((a) => this.getRowKey(a) === this.selectedKey);
      }
      return null;
    },
    exportCsvHandler() {
      const table = this.$refs.table.$el;
      const rows = table.querySelectorAll('.ant-table-row');
      const data = [];
      rows.forEach((row) => {
        const tds = row.querySelectorAll('td');
        const rowData = [];
        tds.forEach((td) => {
          if (td.parentNode === row && td.dataset.uid !== 'action') {
            rowData.push(td.innerText);
          }
        });
        data.push(rowData);
      });

      const headerData = [];
      const headerRow = table.querySelector('.ant-table-thead>tr');
      const tds = headerRow.querySelectorAll('th');
      tds.forEach((td) => {
        if (
          td.parentNode === headerRow &&
          td.getAttribute('key') !== 'action'
        ) {
          headerData.push(td.innerText);
        }
      });
      exportCsv([headerData, ...data]);
    },
    async exportToXlsx({ filename = '数据导出', maxSize = 9999 }) {
      // 获取数据
      let result = null;
      let data = [];
      let params = {
        sort: ModelService.parseSort(this.modelName, this.pageParam.sort),
        get orderby() {
          return this.sort;
        },
        filter: this.filter,
      };

      if (_.isFunction(this.params)) {
        params = this.params(params);
      } else {
        params = {
          ...params,
          ...this.params,
        };
      }
      if (params.filter) {
        params.filter = encodeURIComponent(JSON.stringify(params.filter));
      }
      if (_.isString(this.url)) {
        result = await this.$restful(this.url, {
          ...params,
          pageNum: 1,
          pageSize: maxSize,
        });
      } else {
        result = await this.url(params);
      }
      if (this.pagination === false) {
        data = result?.records || result || [];
      } else {
        data = result?.records || [];
      }
      // 准备导出数据
      const columns = this.columns.filter((item) => item.uid !== 'action');
      const header = columns.map((item) => item.title);
      const rows = [];
      data.forEach((record, index) => {
        const row = []; // 行
        columns.forEach((col) => {
          let text = '';
          if (col.customRender) {
            text = col.customRender(record[col.dataIndex], record, index);
          } else {
            text = record[col.dataIndex];
          }

          if (typeof text === 'object') {
            // 处理导出报表中含有app-link-btn
            if (Array.isArray(text)) {
              if (
                text[0].componentOptions &&
                text[0].componentOptions.tag == 'app-link-btn'
              ) {
                text = text[0].componentOptions.propsData?.title || '';
              }
            }
            switch (text.componentOptions && text.componentOptions.tag) {
              case 'app-dict-display':
                text =
                  this.dicts[text.componentOptions.propsData?.value]?.name ||
                  text.componentOptions.propsData?.value ||
                  '';
                break;
            }
          }
          row.push(text);
        });
        rows.push(row);
      });
      exportToXlsx({ header, rows, filename });
    },
    syncBodyAndHeaderWidth() {
      const $header = this.$el.querySelector('.ant-table-header>table');
      const $body = this.$el.querySelector('.ant-table-body>table');
      if ($body && $header) {
        const width = $body.clientWidth;
        $header.style.setProperty('width', width + 'px');
      }
      this.redressMinWidthColumn();
    },
    // 整理minWidth配置，由于fix-layout会导致一些未设置宽度的列宽度为0。通过配置minWidth当发现宽度小于这个minWidth时会设置列的宽度未minWith
    // 只支持px和rem
    redressMinWidthColumn() {
      const columns = this.columns;
      const $body = this.$el.querySelector('.ant-table-body>table');
      const $header = this.$el.querySelector('.ant-table-header>table');
      const rootFontSize = parseFloat(
        document.documentElement.style.fontSize ||
          getComputedStyle(document.documentElement).fontSize,
      );
      columns.forEach((item) => {
        if (item.minWidth && /^\d+(px|rem)?$/.test(item.minWidth)) {
          let minWidthPx = parseFloat(item.minWidth); // 将最小宽度转换为像素
          if (item.minWidth.includes('rem')) {
            minWidthPx = minWidthPx * rootFontSize;
          }
          const $td = $body.querySelector(`[data-uid=${item.uid}]`);
          if ($td && $td.clientWidth < minWidthPx) {
            const cellIndex = $td.cellIndex;
            $header
              .querySelectorAll('col')
              [cellIndex].style.setProperty('width', minWidthPx + 'px');
            $body
              .querySelectorAll('col')
              [cellIndex].style.setProperty('width', minWidthPx + 'px');
          }
        }
      });
    },
  },
};
</script>
<style lang="less" scoped>
@import '~@/styles/variables';

.toolbar {
  display: flex;
  align-items: center;
  padding: 1rem 0;

  &.pageable {
    padding: 0;
    margin-top: -4rem;
  }

  .toolbar-btn {
    margin-right: 1rem;
  }
}

.nowrap {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@{deep} {
  table.ant-table-fixed {
    table-layout: fixed;

    td[nowrap],
    th[nowrap] {
      .nowrap;

      & > div {
        .nowrap;
      }
    }
  }
}

.max-content {
  @{deep} {
    .ant-table-body {
      table.ant-table-fixed {
        table-layout: auto;
      }
    }

    table.ant-table-fixed {
      td,
      th {
        white-space: nowrap;
      }
    }
  }
}

@{deep} {
  .ant-table-row {
    .drag-handler {
      cursor: move;
    }

    .drag-icon {
      display: none;
      margin-left: 1rem;
      color: @primary-color;
    }

    &:hover {
      .drag-icon {
        display: inline;
      }
    }
  }
}
</style>
