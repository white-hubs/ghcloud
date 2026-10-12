<template lang="pug">
g-layout(:title="formTitle")
  template(#content-table)
    .detail-form
      a-form(ref="personFormRef" :model="personForm" :rules="rules" layout="inline")
        a-form-item(label="帐号" name="username")
          a-input(v-model:value="personForm.username" :placeholder="`请输入登录帐号`"  :maxlength="20")
        a-form-item(label="名称" name="name")
          a-input(v-model:value="personForm.name" :placeholder="`请输入${KEYWORD_ALIAS?.staff}名称`"  :maxlength="20")
        a-form-item(label="联系电话" name="mobile")
          a-input(v-model:value="personForm.mobile" placeholder="请输入联系电话"  :maxlength="11")
        a-form-item(label="邮箱" name="email")
          a-input(v-model:value="personForm.email" placeholder="请输入邮箱" type="email")
        a-form-item(label="密码" name="password" v-if="!route.query.id")
          a-input-password(v-model:value="personForm.password" placeholder="请输入密码"  :maxlength="20")
        //- a-form-item(label="登录账号" name="username")
          a-input(v-model:value="personForm.username" placeholder="6~20位字母或数字，区分大小写"  :maxlength="20")
        a-form-item(:label="dynamicFields.find(x=>x.key==='gender')?.alias||dynamicFields.find(x=>x.key==='gender')?.fieldName", name="gender" v-show="dynamicFields.find(x=>x.key==='gender')?.show")
          a-select(v-model:value="personForm.gender")
            a-select-option(v-for="item in sexs", :key="item.value") {{ item.name }}
        a-form-item(label="所属部门", name="organizationIds")
          a-cascader(
            v-model:value="personForm.organizationIds",
            :options="deptList",
            :fieldNames="defaultProps",
            changeOnSelect,
            @change="changeDept",
            placeholder="请选择所属部门"
            showSearch
          )
        a-form-item(:label="dynamicFields.find(x=>x.key==='managedOrganizationIds')?.alias||dynamicFields.find(x=>x.key==='managedOrganizationIds')?.fieldName", name="managedOrganizationIds" v-show="dynamicFields.find(x=>x.key==='managedOrganizationIds')?.show")
          a-tree-select(
            v-model:value="personForm.managedOrganizationIds",
            show-search,
            placeholder="请选择部门",
            allow-clear,
            :height="50"
            tree-default-expand-all,
            :fieldNames="treeDeptFieldNames",
            :tree-data="deptList"
            multiple
            tree-node-filter-prop="name"
          )
        a-form-item(:label="dynamicFields.find(x=>x.key==='positionIds')?.alias||dynamicFields.find(x=>x.key==='positionIds')?.fieldName", name="positionIds" v-show="dynamicFields.find(x=>x.key==='positionIds')?.show")
          a-select(
            show-search,
            mode="multiple",
            v-model:value="personForm.positionIds",
            placeholder="请选择职位"
            :options="postList"
            :filter-option="filterOption" 
          )
        a-form-item(:label="dynamicFields.find(x=>x.key==='appointmentIds')?.alias||dynamicFields.find(x=>x.key==='appointmentIds')?.fieldName", name="appointmentIds" v-show="dynamicFields.find(x=>x.key==='appointmentIds')?.show")
          a-select(
            show-search,
            v-model:value="personForm.appointmentIds",
            mode="multiple",
            placeholder="请选择岗位"
            :options="appointmentList"
            :filter-option="filterOption"
          )
        a-form-item(:label="dynamicFields.find(x=>x.key==='idCard')?.alias||dynamicFields.find(x=>x.key==='idCard')?.fieldName" name="idCard" v-show="dynamicFields.find(x=>x.key==='idCard')?.show")
            a-input(v-model:value="personForm.idCard" placeholder="请输入身份证号")
        a-form-item.a-form-item-100.staff-pics(:label="dynamicFields.find(x=>x.key==='pics')?.alias||dynamicFields.find(x=>x.key==='pics')?.fieldName" name="pics" v-show="dynamicFields.find(x=>x.key==='pics')?.show")
          g-upload(:file="personForm.pics" :max="10" @changeFileList="changeFile" businessKey="ouaa" :size='10' :multiple='true' :sceneCode="GLOBAL_SCENE_CODE.ouaaUser")
          <div>
            <p style='margin:0'>1、照片需要面部照一张(需要包括整个头部,勿过分美颜)，不能遮挡额头下巴(如有带帽子请取下帽子，立领的衣服请将衣领压低）</p>
            <p style='margin:0'>2、照片需要jpg格式</p>
            <p style='margin:0'>3、照片名称以人员名称命名</p>
            <p style='margin:0'>4、尺寸为160*160~1080*1080(px) </p>
          </div>
        a-form-item(label="账号状态")
          a-switch(
            checked-children="启用",
            un-checked-children="禁用",
            v-model:checked="personForm.enabled"
          )
        a-form-item.a-form-item-100.roleIds(label="角色信息", name="roleIds") 
          a-checkbox-group(v-model:value="personForm.roleIds")
            a-space(:size="16")
              a-checkbox(
                v-for="item in roleList",
                :key="item.id",
                :value="item.id"
              ) {{ item.name }}
  template(#footer-page)
    a-space(:size="16")
      a-button(type="default", @click="goBack()") 返回
      a-button(v-if="!route.query.id", type="primary", @click="onSubmit()" :loading='loading') 保存并新增
      a-button(type="primary", @click="onSubmit(true)" :loading='loading') 保存
</template>

<script lang="jsx">
import { sexList, types } from "@/utils/enumerate";
import { cubeDictionaryService } from '@/api/service'
import { ITEM_CODE } from '../field-config/field-config'
import { message } from "ant-design-vue";
import _ from "lodash";
import moment from "moment";
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import Crypto from "@/utils/crypto.js";
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { KEYWORD_ALIAS } from '@ghcloud/cube-business-alias-manage-plugin'
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const personFormRef = ref();
    const route = useRoute();
    const router = useRouter();
    const enables = ref(types);
    const sexs = ref(sexList);
    const deptList = ref([]);
    const postList = ref([]);
    const appointmentList = ref([]);
    const roleList = ref([]);
    const dynamicFields=ref([
      { key:'gender',fieldName:'性别', show:true, required:true,alias:'' },
      { key:'managedOrganizationIds',fieldName:'管理部门', show:true, required:false ,alias:''},
      { key:'positionIds',fieldName:'职位', show:true, required:true ,alias:''},
      { key:'appointmentIds',fieldName:'岗位', show:true, required:true ,alias:''},
      { key:'idCard',fieldName:'身份证号', show:false, required:false,alias:'' },
      { key:'pics',fieldName:'员工照片', show:true, required:false,alias:'' },
    ])
    const dynamicRules=ref([])
    const baseRules={
      username: [{ required: true, message: "请输入登录账号", trigger: "blur" }],
      name: [{ required: true, message: `请输入${KEYWORD_ALIAS.staff}名称`, trigger: "blur" }],
      password: [
        { required: false, message: "请输入密码", trigger: "blur" },
        {
          pattern: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{8,}$/,"g"),
          trigger: "blur",
          message: "密码必须包含字母大写、小写、数字、特殊字符且至少8位",
        },
      ],
      mobile: [
        {
          required: false,
          message: "请输入联系电话",
          trigger: ["blur", "change"],
        },
        {
          message: "手机号格式错误",
          pattern: new RegExp(/^[1][3,4,5,6,7,8,9][0-9]{9}$/, "g"),
        },
      ],
      email: [
        { required: false, message: '请输入邮箱', trigger: 'blur' },
        {
          pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
          message: '邮箱格式不正确',
          trigger: 'blur'
        },
      ],
      username: [
        { required: true, message: "请输入登录账号", trigger: "blur" },
        {
          min: 6,
          max: 20,
          message: "请输入6到20位数字或字母",
          trigger: "blur",
        },
      ],
      organizationIds: [{ required: true, message: "请选择部门" }],
      appointmentIds: [{ required: false, message: "请选择岗位" }],
      roleIds: [{ required: true, message: "请选择角色" }],
    };
    const rules = ref()

    const getInitPerson = () => {
      return {
        id: "",
        name: "",
        mobile: "",
        idCard:"",
        password: "",
        gender: "MALE",
        username: "",
        enabled: true,
        entryDate: "",
        organizationIds: [],
        positionIds: [],
        appointmentIds: [],
        roleIds: [],
        managedOrganizationIds: [],
      };
    };
    const state = reactive({
      formTitle: "",
      personForm: getInitPerson(),
      loading: false
    });

    onMounted(async () => {
      getConfigList()
      getDeptList();
      getPostList();
      getRoleList();
      getAppointmentList();
      if (route.query.id) {
        state.formTitle = `编辑${KEYWORD_ALIAS?.staff}`;
        const data = await proxy.$api.userId("get", { id: route.query.id });
        if (data) {
          if (data.organizations) {
            Object.assign(data, {
              organizationIds: data.organizations.map((item) => item.id),
              managedOrganizationIds: data.managedOrganizations.map(
                (item) => item.id
              ),
              positionIds: data.positions.map((item) => item.id),
              appointmentIds: data.appointmentIds.map((item) => item.id),
              roleIds: data.roles.map((item) => item.id),
            });
          } else {
            Object.assign(data, { organizationIds: [] });
          }
          state.personForm.roleIds = data.roles;
          if (data.entryDate && !moment.isMoment(data.entryDate)) {
            data.entryDate = moment(data.entryDate);
          }
          state.personForm = data;
          state.personForm.pics = data.photographList.map(e => {
            return {
              uid: e.id,
              name: e.name,
              status: 'done',
              url: e.path,
              response: { data: e }
            }
          });
          state.personForm.oldPhotographIdList = data.photographList.map(e => e.id)
          state.personForm.oldName = data.oldName ?? ''
        }
      } else {
        state.formTitle = `新增${KEYWORD_ALIAS?.staff}`;
        state.personForm.pics = [];
      }
    });
    // 获取字段
    const getConfigList=async()=>{
      const dictionaryItem = await cubeDictionaryService.getDictionaryItemByCode({ code: ITEM_CODE})
      if(dictionaryItem){
        const data = await cubeDictionaryService.getDictionaryByItem({itemCode:ITEM_CODE})
        if(data.find(x=>x.code==='employee')){
          dynamicFields.value=(data.find(x=>x.code==='employee')?.variable&&JSON.parse(data.find(x=>x.code==='employee')?.variable??''))?.fields??[]
        }
      }
      const dynamicRules=dynamicFields.value.filter(x=>x.show&&x.required)
      if(dynamicRules.length===0){
        rules.value=baseRules
      }else{
        dynamicRules.forEach(x=>{
        let obj={}
        obj[x.key]=[{
          required: true,
          message: `${x?.fieldName}不能为空`,
        },]
        rules.value=Object.assign(baseRules,obj)
      })
      }
      if (rules.value?.idCard) {
        rules.value.idCard.push({ validator: validateIdCard, trigger: "blur" });
      } else {
        rules.value.idCard = [{ validator: validateIdCard, trigger: "blur" }];
      }
    }
    // 身份证号码校验
    const validateIdCard = async (rule, value) => {
      // 空值处理：允许空值（由必填规则控制）
      if (!value || value.trim().length === 0) {
        return Promise.resolve();
      }

      const sId = value.trim();
      let iSum = 0;
      const aCity = {
        11: '北京', 12: '天津', 13: '河北', 14: '山西', 15: '内蒙',
        21: '辽宁', 22: '吉林', 23: '黑龙', 31: '上海', 32: '江苏',
        33: '浙江', 34: '安徽', 35: '福建', 36: '江西', 37: '山东',
        41: '河南', 42: '湖北', 43: '湖南', 44: '广东', 45: '广西',
        46: '海南', 50: '重庆', 51: '四川', 52: '贵州', 53: '云南',
        54: '西藏', 61: '陕西', 62: '甘肃', 63: '青海', 64: '宁夏',
        65: '新疆', 71: '台湾', 81: '香港', 82: '澳门', 83: '台湾', 91: '国外'
      };

      // 1. 基本格式校验（18位，前17位数字，最后一位允许数字/Xx）
      if (!/^[1-9]\d{16}(\d|X|x)$/.test(sId)) {
        return Promise.reject(new Error("请输入正确的身份证号"));
      }

      // 2. 地址码校验（前2位合法地区）
      const areaCode = parseInt(sId.substr(0, 2), 10);
      if (!aCity[areaCode]) {
        return Promise.reject(new Error("请输入正确的身份证号"));
      }

      // 3. 出生日期校验（格式与有效性）
      const year = sId.substr(6, 4);
      const month = sId.substr(10, 2);
      const day = sId.substr(12, 2);
      const sBirthday = `${year}-${month}-${day}`;
      const d = new Date(sBirthday.replace(/-/g, '/'));
      // 验证日期是否有效（避免2月30日等错误）
      if (
        d.getFullYear().toString() !== year ||
        (d.getMonth() + 1).toString().padStart(2, '0') !== month ||
        d.getDate().toString().padStart(2, '0') !== day
      ) {
        return Promise.reject(new Error("请输入正确的身份证号"));
      }

      // 4. 校验码校验（第18位算法验证）
      const normalizedId = sId.replace(/x$/i, 'a'); // 统一处理末尾x为a
      for (let i = 17; i >= 0; i--) {
        iSum += (Math.pow(2, i) % 11) * parseInt(normalizedId.charAt(17 - i), 11);
      }
      if (iSum % 11 !== 1) {
        return Promise.reject(new Error("请输入正确的身份证号"));
      }

      // 所有校验通过
      return Promise.resolve();
    };
    const addPerson = async (back) => {
      await personFormRef.value.validate().then(async () => {
        state.personForm.entryDate = null;
        const params = _.cloneDeep(state.personForm);
        params.password = params.password ? Crypto.encrypt(params.password) : '';
        if (typeof params.positionIds === "string") {
          params.positionIds = [params.positionIds];
        }
        params.photographIdList = params.pics.map(e => { return e.uid })
        await proxy.$api.user("post", params);
        message.success("操作成功");
        state.personForm = getInitPerson();
        state.personForm.pics = []
        personFormRef.value.resetFields();
        if (back) {
          goBack();
        }
      });
    };
    const editPerson = async (back) => {
      await personFormRef.value.validate().then(async () => {
        const params = _.cloneDeep(state.personForm);
        params.entryDate = null;
        if (typeof params.positionIds === "string") {
          params.positionIds = [params.positionIds];
        }
        params.photographIdList = params.pics.map(e => { return e.uid })
        await proxy.$api.userId("put", params);
        message.success("操作成功");
        if (back) {
          goBack();
        }
      });
    };
    const onSubmit = async (back) => {
      try {
        state.loading = true
        if (route.query.id) {
          await editPerson(back);
        } else {
          await addPerson(back);
        }
      } catch (error) {
      } finally {
        state.loading = false
      }
    };
    const goBack = () => {
      router.back();
    };
    const getDeptList = async () => {
      const data = await proxy.$api.organizations("get", {
        name: "",
        enabled: true,
      });
      if (data && data instanceof Array) {
        deptList.value = data;
      }
    };
    const getPostList = async () => {
      const data = await proxy.$api.positions("get", {
        name: "",
        enabled: true,
        pageNumber: 1,
        pageSize: 1000,
      });
      postList.value = data.records?.map(e => {
        return {
          label: e.name,
          value: e.id
        }
      });
    };

    const getAppointmentList = async () => {
      const data = await proxy.$api.getAppointment("get", {
        enable: true,
        pageNumber: 1,
        pageSize: 1000,
      });
      appointmentList.value = data.records?.map(e => {
        return {
          label: e.name,
          value: e.id
        }
      });
    };

    const getRoleList = async () => {
      const data = await proxy.$api.roles("get", {
        enabled: true,
        pageNumber: 1,
        pageSize: 1000,
      });
      roleList.value = data.records;
    };
    const changeDept = (value) => {
      // state.personForm.organizationId = value;
      state.personForm.organizationIds = value;
    };
    const changeManagedDept = (value) => {
      state.personForm.managedOrganizationIds = value;
    };
    const layout = {
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 12,
      },
    };
    const defaultProps = { label: "name", value: "id", children: "children" };
    /** TreeSelect 使用 title/key/value/children，与 Cascader 的 label 不同 */
    const treeDeptFieldNames = {
      children: "children",
      label: "name",
      key: "id",
      value: "id",
    };
    const changeFile = data => {
      state.personForm.pics = data.map(e => {
        return {
          uid: e.id,
          name: e.name,
          status: 'done',
          url: e.path,
          response: { data: e }
        }
      })
    };
    const filterOption = (input, option) => {
      return (option.label || '').toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
    return {
      ...toRefs(state),
      dynamicFields,
      rules,
      personFormRef,
      layout,
      route,
      onSubmit,
      goBack,
      enables,
      sexs,
      deptList,
      defaultProps,
      treeDeptFieldNames,
      changeDept,
      postList,
      appointmentList,
      roleList,
      changeManagedDept,
      changeFile,
      GLOBAL_SCENE_CODE,
      KEYWORD_ALIAS,
      filterOption,
      validateIdCard
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");

.roleIds {
  :deep(.ant-checkbox-group) {
    width: 100%;
  }

  .ant-space {
    display: flex;
    flex-wrap: wrap;
    margin-top: 5px;

    :deep(.ant-space-item) {
      width: 30%;
    }
  }
}
.detail-form {
  :deep(.ant-select-selector){
    max-width: 300px !important;
  }
}
</style>
<style>
.ant-select-tree-dropdown {
  max-height: 20vh !important;
}
</style>
