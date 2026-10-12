import { Select, type FormInstance } from "ant-design-vue";
import type { RawValueType } from "ant-design-vue/es/vc-select/BaseSelect";
import type { DefaultOptionType, LabelInValueType } from "ant-design-vue/es/vc-select/Select";
import dayjs from "dayjs";
import { defineComponent, reactive, ref, onMounted } from "vue";

import type { Libraries } from "@ghcloud/cube-safety-management-service";
import { Input, Button, Table, Modal, Form, message, Page, PopOver, PopConfirm, FormItem, Textarea } from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { Layout } from "@ghcloud/generic-component";

import { cubeSafetyManagementAnalysisService } from "@/api/server";
import { useTableScroll } from "@/hook/use-table-scroll";

import styles from "./quota-base.module.less";

// 定义表单数据的接口
interface QuotaFormState {
  id?: string;
  name: string;
  rule: string;
}

export const QuotaBase = defineComponent({
  name: "QuotaBase",
  setup() {
    const { pageTitle } = usePageName();
    const tableData = ref<Libraries[]>([]);
    const loading = ref(false);
    const modalLoading = ref(false);
    const modalVisible = ref(false);
    const modalTitle = ref("新增指标");
    const formRef = ref<FormInstance>();
    const { scorllY } = useTableScroll();
    const selectOption = ref<{ value: string; label: string; computeType: string }[]>([]);
    const ruleList = ref<string[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      keyword: "",
    });
    const queryCache = useListQueryCache({
      defaults: {
        keyword: "",
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        keyword: pagination.value.keyword,
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
      }),
      setState: (next) => {
        pagination.value.keyword = (next.keyword as string) ?? "";
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
      },
    });
    const total = ref(0);
    const formState = reactive<QuotaFormState>({
      name: "",
      rule: "",
    });

    const rules = {
      name: [{ required: true, message: "请输入指标名称", trigger: "blur" }],
      rule: [{ required: true, message: "请输入计算规则", trigger: "blur" }],
    };
    /**
     * @description 获取表格数据
     */
    const getTableData = async (): Promise<void> => {
      loading.value = true;
      try {
        const res = await cubeSafetyManagementAnalysisService.getLibrariesList(pagination.value);
        tableData.value = res.records;
        total.value = res.total;
      } catch {
        message.error("获取失败");
      } finally {
        loading.value = false;
      }
    };
    // // 新增指标
    const addLibraries = async (params: {
      name: string;
      computeType: string;
      computeFormula: string;
      computeFormulaMetrics: string;
    }): Promise<void> => {
      modalLoading.value = true;
      try {
        await cubeSafetyManagementAnalysisService.postLibrariesList(params);
        message.success("新增成功");
      } catch {
        message.error("新增失败");
      } finally {
        modalLoading.value = false;
      }
    };
    // // 编辑指标
    const editLibraries = async (params: {
      id: string;
      name: string;
      computeType: string;
      computeFormula: string;
      computeFormulaMetrics: string;
    }): Promise<void> => {
      modalLoading.value = true;
      try {
        await cubeSafetyManagementAnalysisService.putLibrariesList(params);
        message.success("编辑成功");
      } catch {
        message.error("编辑失败");
      } finally {
        modalLoading.value = false;
      }
    };
    // // 删除指标
    const deleteLibraries = async (params: { id: string }): Promise<void> => {
      loading.value = true;
      try {
        await cubeSafetyManagementAnalysisService.deleteLibrariesList(params);
        message.success("删除成功");
      } catch {
        message.error("删除失败");
      } finally {
        loading.value = false;
      }
    };
    const getSelectData = async (): Promise<void> => {
      try {
        const res = await cubeSafetyManagementAnalysisService.getLibrariesAllList();
        selectOption.value = res.map((item: Libraries) => ({
          value: item.id,
          label: item.name,
          computeType: item.computeType,
        }));
      } catch {
        message.error("获取失败");
      } finally {
      }
    };
    // 初始化加载数据
    onMounted(async () => {
      await queryCache.hydrateAndQuery(getTableData);
      getSelectData();
    });

    /**
     * @description 处理搜索
     */
    const handleSearch = async (): Promise<void> => {
      pagination.value.pageNumber = 1;
      await getTableData();
      await queryCache.sync();
    };
    const reset = async (): Promise<void> => {
      await queryCache.reset();
      await getTableData();
    };
    /**
     * @description 打开新增模态框
     */
    const handleAdd = (): void => {
      modalTitle.value = "新增指标";
      ruleList.value = [];
      Object.assign(formState, { id: undefined, name: "", rule: "" });
      modalVisible.value = true;
    };

    /**
     * @description 打开编辑模态框
     * @param record 表格行数据
     */
    const handleEdit = (record: Libraries): void => {
      modalTitle.value = "编辑指标";
      Object.assign(formState, { id: record.id, name: record.name, rule: renderFormula(record.computeFormula) });
      textAreHandleChange(renderFormula(record.computeFormula));
      modalVisible.value = true;
    };

    /**
     * @description 处理删除
     * @param id 指标ID
     */
    const handleDelete = async (id: string): Promise<void> => {
      await deleteLibraries({ id });
      getTableData(); // 重新加载数据
    };

    const handleSelect = (value: string, option: DefaultOptionType): void => {
      formState.rule = formState.rule + `[${option.label}]`;
    };

    const textAreHandleChange = (value: string): void => {
      formState.rule = value;
      const matches = value.match(/\[(.*?)\]/g);
      if (matches) {
        ruleList.value = matches.map((match) => {
          const name = match.slice(1, -1);
          const option = selectOption.value.find((opt) => opt.label === name);
          return option ? option.value : name;
        });
      } else {
        ruleList.value = [];
      }
    };
    const handleDeselect = (value: string, option: DefaultOptionType): void => {
      formState.rule = formState.rule.replace(`[${option.label}]`, "");
    };

    const renderFormula = (name: string): string => {
      let formula = name;
      selectOption.value.forEach((item) => {
        const searchValue = `[${item.value}]`;
        const replaceValue = `[${item.label}]`;
        formula = formula.split(searchValue).join(replaceValue);
      });
      return formula;
    };

    /**
     * @description 模态框确认事件
     */
    const handleModalOk = async (): Promise<void> => {
      try {
        await formRef.value?.validate();
        const matches = formState.rule.match(/\[(.*?)\]/g);
        const validLabels = selectOption.value.map((opt) => `[${opt.label}]`);
        const errorItem = matches?.filter((match) => !validLabels.includes(match));
        if (errorItem && errorItem.length) {
          message.error(`${errorItem.join("、")}指标不存在`);
          return;
        }
        // let otherChars = formState.rule;
        // matches?.forEach(match => {
        //   otherChars = otherChars.replace(match, '');
        // });
        // const invalidChars = otherChars.replace(/[+\-*/()]/g, '');

        // if (invalidChars.length > 0) {
        //   message.error(`计算规则中包含非法字符: ${invalidChars}`);
        //   return;
        // }

        const labelToValueMap = new Map(selectOption.value.map((opt) => [opt.label, opt.value]));

        const result =
          matches
            ?.map((match) => {
              const label = match.slice(1, -1);
              return labelToValueMap.get(label) || "";
            })
            .filter(Boolean) || [];

        let computeFormula = formState.rule;

        labelToValueMap.forEach((value, label) => {
          // 使用 replaceAll 和模板字符串来安全地替换所有出现的 label
          const searchStr = `[${label}]`;
          const replacementStr = `[${value}]`;
          computeFormula = computeFormula.split(searchStr).join(replacementStr);
        });

        const params = {
          name: formState.name,
          computeFormulaMetrics: result.join(","),
          computeFormula,
          computeType: "COMBINATION_RESULT",
        };

        if (formState.id) {
          // 编辑逻辑
          let newParam = {
            ...params,
            id: formState.id,
          };
          await editLibraries(newParam);
        } else {
          // 新增逻辑
          await addLibraries(params);
        }
        modalVisible.value = false;
        getTableData(); // 重新加载数据
      } catch {
        // error handling
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData().then(() => queryCache.sync());
    };

    const columns = [
      {
        title: "指标名称",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "计算规则",
        dataIndex: "computeFormula",
        key: "computeFormula",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={renderFormula(text) || "--"}>{renderFormula(text) || "--"}</PopOver>;
        },
      },
      {
        title: "创建人",
        dataIndex: "createByName",
        key: "createByName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        key: "createTime",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return (
            <PopOver content={dayjs(text).format("YYYY-MM-DD HH:mm:ss") || "--"}>
              {dayjs(text).format("YYYY-MM-DD HH:mm:ss") || "--"}
            </PopOver>
          );
        },
      },
      {
        title: "操作",
        key: "action",
        width: 200,
        customRender: ({ record }: { record: Libraries }): JSX.Element => {
          return (
            <>
              {record.initialized ? (
                <>--</>
              ) : (
                <>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      handleEdit(record);
                    }}
                  >
                    编辑
                  </Button>
                  <PopConfirm title="确定要删除这条指标吗?" onConfirm={async () => handleDelete(record.id)}>
                    <Button type="link" size="small" danger>
                      删除
                    </Button>
                  </PopConfirm>
                </>
              )}
            </>
          );
        },
      },
    ];

    const layoutSlots = {
      "layout-header": (): JSX.Element => {
        return (
          <Button type="primary" onClick={handleAdd}>
            新增
          </Button>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <>
            <Form layout="inline" style={{ margin: "16px 0" }}>
              <FormItem class="search-item">
                <Input v-model:value={pagination.value.keyword} placeholder="请输入指标名称查询" showCount={false} />
              </FormItem>
              <FormItem class="search-item">
                <Button type="primary" onClick={handleSearch}>
                  查询
                </Button>
                <Button style={{ marginLeft: "10px" }} onClick={reset}>
                  重置
                </Button>
              </FormItem>
            </Form>
            <Table
              columns={columns}
              dataSource={tableData.value}
              loading={loading.value}
              rowKey="id"
              scrollY={scorllY.value - 8}
              pagination={false}
            />
          </>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={total.value}
            onPageChange={pageChange}
          />
        );
      },
    };

    return (): JSX.Element => (
      <div class={styles.quotaBaseContainer}>
        <Layout title={pageTitle ?? "指标库"} v-slots={layoutSlots}></Layout>
        <Modal
          title={modalTitle.value}
          visible={modalVisible.value}
          onOk={handleModalOk}
          buttonLoading={modalLoading.value}
          onCancel={() => (modalVisible.value = false)}
          destroyOnCloserules
        >
          <div>
            <Form ref={formRef} model={formState} labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} rules={rules}>
              <FormItem label="指标名称" name="name">
                <Input v-model:value={formState.name} />
              </FormItem>
              <FormItem label="计算规则" name="rule">
                <>
                  {/* <Button type="primary" onClick={handleAddVariable}>添加变量</Button>
                   */}
                  <div>
                    <Select
                      options={selectOption.value}
                      showSearch
                      placeholder={"请选择变量"}
                      v-model:value={ruleList.value}
                      style={{ marginBottom: "10px" }}
                      onSelect={(value: RawValueType | LabelInValueType, option: DefaultOptionType) =>
                        handleSelect(value as string, option)
                      }
                      mode="multiple"
                      maxTagCount={3}
                      onDeselect={(value: RawValueType | LabelInValueType, option: DefaultOptionType) =>
                        handleDeselect(value as string, option)
                      }
                      filterOption={(input: string, option: DefaultOptionType | undefined) =>
                        option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    ></Select>
                  </div>
                </>
                <Textarea v-model:value={formState.rule} rows={4} onChange={textAreHandleChange} />
                <div style={{ color: "red", marginTop: "20px" }}>
                  计算规则请使用“[]”包裹变量名称，如[变量名称],计算方式请使用“+，-，*，/，()”进行运算，如([变量名称1]+[变量名称2])*[变量名称3]”。
                </div>
              </FormItem>
              <span></span>
            </Form>
          </div>
        </Modal>
      </div>
    );
  },
});

export default QuotaBase;
