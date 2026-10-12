<template>
  <gLayout :title="'功能权限-'+roleName">
    <template #header-btn>
      <a-button type="link" @click="state.roleUserVisible=true">
        <UserOutlined /> 查看角色下成员
      </a-button>
    </template>
    <template #content-table>
      <div class="permission-container">
        <div class="permission-header">
          <span>应用</span>
          <span>权限</span>
          <span>全选</span>
        </div>
        <div class="permission-content">
          <div v-if="roleAppsData.length">
            <div class="application-item" v-for="item in roleAppsData" :key="item.id">
              <span class="application-name">{{item.name}}</span>
              <div class="feature-list">
                <div class="feature-group-item" v-for="group in item.children" v-show="group.gruopShow">
                  <span class="feature-group-name">* {{ group.groupName}}</span>
                  <div class="feature-container">
                    <a-checkbox v-for="feature in group.features" v-show="feature.show"
                      @change="(e)=>handleChangeChecked(e,item)" v-model:checked="feature.enabled">
                      {{feature.featureName}}
                    </a-checkbox>
                  </div>
                </div>
              </div>
              <span><a-checkbox v-model:checked="item.enabled"
                  @change="(e)=>{onCheckAllChange(e,item)}"></a-checkbox></span>
            </div>
          </div>
          <div v-else>
            <a-empty description="暂无可配置权限的应用" />
          </div>

        </div>
      </div>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button type="primary" style="margin-left: 10px;" @click="saveFunPermissions">保存</a-button>
    </template>
    <role-user v-model:value="state.roleUserVisible" :roleId="roleId" />
  </gLayout>
</template>
<script setup>
import { computed, onMounted, reactive, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';
import { UserOutlined } from '@ant-design/icons-vue'
import { cubeOuaaService } from '@/api/service'
import { authStore } from '@/api/auth-store'
import { FUNCTION_PERMISSION_CODES } from '@ghcloud/cube-permission-codes'
import roleUser from './components/role-user/index.vue'
const { proxy } = getCurrentInstance();
const { id: roleId, name: roleName } = useRoute().query;
const state = reactive({
  roleControlApps: [],
  roleUserVisible: false
})
const roles = computed(() => {
  return sessionStorage.getItem('user-function-roles') ? JSON.parse(sessionStorage.getItem('user-function-roles')) : []
})

/** 全选操作 */
const onCheckAllChange = (e, applicationItem) => {
  const checked = e.target.checked
  const index = state.roleControlApps.findIndex((item) => item.code === applicationItem.code)
  if (index !== -1) {
    state.roleControlApps[index].children.forEach(group => {
      group.features.forEach(element => { element.enabled = checked });
    });
  }
}
const getAppFeatureCode = (applicationCode) => {
  const currentApp = FUNCTION_PERMISSION_CODES.find((item) => item.applicationCode === applicationCode)
  const currentAppFeatureCodes = currentApp.children.map(item => item.features.map(item => item.featureCode))
  return currentAppFeatureCodes.flat()
}
const saveFunPermissions = async () => {
  let codes = []
  state.roleControlApps.forEach(appItem => {
    appItem.children.forEach(groupItem => {
      groupItem.features.forEach(featureItem => {
        if (featureItem.enabled) {
          codes.push({
            code: featureItem.featureCode
          })
        }
      })
    })
  })
  const res = await cubeOuaaService.saveUserFunRole({
    roleId: roleId,
    codes: codes
  })
  proxy.$message.success('保存成功')
  goBack()
}
const getAppList = async () => {
  try {
    const applicationList = await cubeOuaaService.productApplications(authStore.tenant)
    const rolePermissions = await cubeOuaaService.getRolePermissions({ id: roleId })
    const featureAppCodes = FUNCTION_PERMISSION_CODES.map(item => item.applicationCode)
    let roleControlApps = applicationList.filter(item => featureAppCodes.includes(item.code))
    roleControlApps = roleControlApps.map(item => {
      return {
        name: item.name,
        code: item.code,
        enabled: checkedAllChecked(rolePermissions, item.code),
        children: FUNCTION_PERMISSION_CODES.find(featureApp => featureApp.applicationCode === item.code).children.map(group => {
          const gruopsFeatureCodes = group.features.map(featureItem => featureItem.featureCode)
          const roleCodes = roles.value.map(rolePermission => rolePermission.code)
          const intersect = gruopsFeatureCodes.filter(groupsFeatureItem => roleCodes.includes(groupsFeatureItem))
          return {
            ...group,
            gruopShow: !!intersect.length,
            features: group.features.map(featureItem => {
              return {
                ...featureItem,
                enabled: rolePermissions.map(item => item.code).includes(featureItem.featureCode),
                show: roles.value.map(item => item.code).includes(featureItem.featureCode)
              }
            })
          }
        })
      }
    })
    state.roleControlApps = roleControlApps
  } catch (err) {
    const error = err.toJSON()
    proxy.$message.error(error.errorMessage)
  }

}
const roleAppsData = computed(() => {
  return state.roleControlApps.map(item => {
    return {
      ...item,
      appShow: !!item.children.some(group => group.gruopShow)
    }
  }).filter(item => item.appShow)
})

const handleChangeChecked = (e, item) => {
  const notAllPermissions = item.children.every(group => {
    return group.features.every(feature => feature.enabled)
  })
  item.enabled = notAllPermissions
}
//判断是否圈选
const checkedAllChecked = (rolePermissions, applicationCode) => {
  const appAllFeatureCodes = getAppFeatureCode(applicationCode)
  const roleCodes = rolePermissions.map(item => item.code)
  const intersect = appAllFeatureCodes.filter(item => roleCodes.includes(item))
  return intersect.length === appAllFeatureCodes.length
}
onMounted(() => {
  getAppList()
})

/** 返回上一页 */
const goBack = () => {
  window.history.back()
}
</script>
<style scoped lang="less">
:deep(.content-search) {
  display: none;
}

.permission-container {
  text-align: left;
  position: relative;
  height: 100%;

  .permission-header {
    display: flex;
    box-sizing: border-box;
    padding: 15px 0;
    border-bottom: 1px solid rgba(195, 195, 195, 0.52);
    height: 50px;
    position: sticky;

    span {
      display: block;
      font-size: 14px;
      font-weight: bold;
      box-sizing: border-box;
      padding-left: 5px;
    }

    span:nth-child(1) {
      width: 15%;
    }

    span:nth-child(2) {
      width: 75%;
    }

    span:nth-child(3) {
      width: 10%;
    }
  }

  .permission-content {
    margin-top: 10px;
    height: calc(100% - 60px);
    overflow-y: auto;

    .application-item {
      box-sizing: border-box;
      padding-top: 10px;
      padding-bottom: 20px;
      display: flex;
      align-items: flex-start;
      min-height: 50px;
      border-bottom: 1px solid rgba(195, 195, 195, 0.52);

      .application-name {
        width: 15%;
      }

      .feature-list {
        width: 75%;

        .feature-group-item {
          display: flex;
          align-items: baseline;

          .feature-group-name {
            flex-shrink: 0;
            margin-right: 20px;
          }

          .feature-container {
            :deep(.ant-checkbox-wrapper) {
              width: 180px;
              margin: 0;
            }
          }
        }

        :deep(.ant-empty) {
          width: 284px;
        }
      }
    }
  }
}
</style>