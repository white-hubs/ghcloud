import { defineStore } from "pinia";

export const useForm = defineStore("form-store", {
  state: () => ({
    /**表单配置 */
    formConfig: {
      list: new Array<any>(),
      config: {
        labelWidth: 80,
        labelPosition: "left",
        size: "small",
        DBname: {
          tableName: "",
          tableId: 0,
          tableName_en: "",
        },
      },
    },
  }),
  getters: {
    formInfo(): any {
      return this.formConfig;
    },
  },
  actions: {
    /**更新表单配置 */
    updateFormConfig(form: any) {
      this.formConfig = form;
    },
  },
});
