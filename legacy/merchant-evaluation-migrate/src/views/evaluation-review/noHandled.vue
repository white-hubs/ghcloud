<template lang="pug">
.worksheet
  .worksheet-main
    app-table-page-layout
      template(#toolbar-left)
        app-search(
          v-model='filters',
          :fields='filterFieleds',
          @search='handleQuickSearch',
          keywordPlaceholder='请输入关键字'
        ) 

        a-button.ml2(@click='$refs.table.reload()') 刷新
      //- template(#toolbar-right)
      //-   a-button(type="primary" icon="plus" @click="handleCreate") 新建
      //-   CreateConfig(ref="createAndConfig" @modal-success="$refs.table.refresh()")
      app-table(
        ref='table',
        model-name='noHandledTable',
        url='/project-merchant/stall-evaluation-records/store/page',
        :params='params',
        :visibles='columns',
        :columns-customsize='columnsCustomsize',
        :fitHeight='-50'
      )
        template(#code='{ text, record }')
          app-link-btn(
            :to='"./evaluation-review-detail/" + record.id + "/" + "noHandled"'
          ) {{ text }}
        template(#showPic='{ text, record }')
          .showPic
            img(url=`"/fileresource/"+${text}`)
        template(#action='{ record }')
          app-action-column
            app-link-btn(
              :to='"./evaluation-review-detail/" + record.id + "/" + "noHandled"'
            ) 详情
            app-link-btn(@click='handledModal(record)') 处理
      a-modal(
        :visible='visible',
        @cancel='closeImg',
        :width='800',
        title='处理评价',
        @ok='save'
      )
        app-form(
          :model='model',
          :rules='rules',
          ref='form',
          :labelWidth='90',
          oneline
        )
          a-form-model-item(label='评价人', prop='nickname')
            a-input.border(v-model='model.nickname', disabled)
          a-form-model-item(label='评价时间', prop='nickname')
            a-input.border(v-model='model.createTime', disabled)
          a-form-model-item(label='评价内容', prop='descr')
            a-input.border(v-model='model.descr', disabled)
            .picBox(v-if='model.fileDTOS.length > 0')
              //- img(:url='baseUrL+item.path' v-for='item in model.fileDTOS' :key='item.id')
              app-imgs-display(:files='model.fileDTOS')
          a-form-model-item(label='结果', prop='examineStatus')
            a-select.handledSelect(v-model='model.examineStatus')
              a-select-option(
                :value='item.value',
                v-for='item in selectArr',
                :key='item.value'
              ) {{ item.lable }}
          a-form-model-item(label='备注', prop='examineRemark')
            a-input(
              v-model='model.examineRemark',
              type='textarea',
              :maxLength='150'
            )
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import moment from 'moment';
import CreateConfig from './Modal/CreateConfig';
export default {
  // name: 'KeepAliveXxxx',
  components: { CreateConfig },
  data() {
    return {
      columns: ['code', 'createTime', 'nickname', 'descr', 'fileDTOS', ''],
      baseUrL: '/fileresource/',
      // 筛选
      filters: {
        search: '',
        timeRange: '',
        beginTime: '',
        endTime: '',
        handled: false, //未处理
      },
      selectArr: [
        { value: '1', lable: '通过' },
        { value: '2', lable: '不通过' },
      ],
      filterFieleds: [],
      visible: false,
      model: {
        name: null,
        fileDTOS: [],
        examineStatus: '1',
        examineRemark: '', //备注
      },
      rules: {
        examineStatus: [{ required: true, message: '必填项' }],
      },
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return {
        ...this.filters,
        projectId: this.project?.id,
        // search: this.filters?.search,
      };
    },
  },
  async created() {
    this.filterFieleds = [
      {
        name: 'timeRange',
        placeholder: '请选择时间范围',
        width: '500px',
        component: 'AppTimeRangeSelect',
        options: [{ code: 'custom', name: '自定义时间范围' }],
        field: { name: 'code', label: 'name' },
        extraProp: {
          onlyCustom: true,
          // onlyDate: true,
          // showTime: true,
        },
        onChange: (e) => {
          if (Array.isArray(e)) {
            this.filters.timeRange = 'custom';
            this.filters.beginTime = e[0] || null;
            this.filters.endTime = e[1] || null;
          } else {
            this.filters.beginTime = null;
            this.filters.endTime = null;
          }
        },
      },
    ];
  },
  methods: {
    moment,
    reload() {
      this.$refs.table.reload();
    },
    handleQuickSearch(keyword) {
      this.search = keyword;
    },
    //新增
    handleCreate() {
      this.$refs.createAndConfig.show();
    },
    // 编辑
    handleEdit(record) {
      this.$refs.createAndConfig.show(record);
    },
    // 删除
    async handleDelete(record, cb) {
      await this.$restful(`delete:/project-merchant/stall-evaluation-tag/${record.id}`);
      cb();
      this.$message.success('删除成功!');
      this.$refs.table.reload();
    },
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '操作',
        width: '15rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
    //关闭图片模态框
    closeImg() {
      this.visible = false;
    },
    //打开处理模态框
    handledModal(data) {
      this.visible = true;
      this.model = { ...data, examineStatus: '1' };
    },
    //点击确定,发送处理结果
    async save() {
      const valid = await this.$refs.form.validate();

      if (valid) {
        this.$restful(`POST:/project-merchant/stall-evaluation-records/examine`, {
          ...this.model,
        }).then((res) => {
          this.$message.success('处理成功');
          this.$refs.table.reload();
          this.visible = false;
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.worksheet {
  display: flex;
  height: 100%;
  overflow: hidden;
  flex-direction: column;
  .btn-tabs {
    flex: none;
    // padding: var(--space-3);
    // padding-bottom: 0;
    .category-btn {
      margin-right: 1rem;
    }
  }
  .worksheet-main {
    flex: auto;
    overflow: hidden;
    position: relative;
  }
}
.border {
  border: 0;
  background-color: white;
}
.picBox {
  height: 100px;
  display: flex;
  > img {
    height: 100px;
    width: 100px;
    margin-right: 20px;
  }
}
.handledSelect {
  width: 200px;
}
</style>
