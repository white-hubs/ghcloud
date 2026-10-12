import axios from 'axios';
import FormData from 'form-data';
import readlineHelper from './readline-helper.js';
const authInfo = {
  access_token: "",
  tenant: ''
}
const getBusinessInfo = async () => {
  // 1、登录
  const loginInput = {
    username: global.setting['username'],
    password: global.setting['password'],
  }
  if (!global.setting['username'] || !global.setting['password']) {
    loginInput.username = await readlineHelper.askQuestion('请输入登录用户:  ')
    loginInput.password = await readlineHelper.askQuestion('请输入登录密码:  ')
  }
  const loginUrl = `${global.setting['cloud-api']}/gw-bff/auth/token`
  try {
    const loginData = new FormData();
    loginData.append('grant_type', 'pwd');
    loginData.append('username', loginInput.username);
    loginData.append('password', loginInput.password);
    const { data: loginRes } = await axios({
      method: 'post',
      url: loginUrl,
      headers: {
        'terminal': 'bimops-manage-web',
      },
      data: loginData
    })
    if (loginRes.tenants.length === 0) {
      process.exit(1)
    }
    authInfo.access_token = loginRes.access_token
    authInfo.tenant = global.setting['tenant'] ? global.setting['tenant'] : loginRes.tenants[0]

    global.businessData.authToken = {
      userID: loginRes.id,
      accessToken: loginRes.access_token,
    }
    global.businessData.userData = {
      id: loginRes.id,
      name: loginRes.name,
    }
  } catch (error) {
    process.exit(1)
  }

  // 2、租户信息
  const tenantUrl = `${global.setting['cloud-api']}/api/ouaa/tenant-under-tenant/${authInfo.tenant}`
  try {
    const { data: tenantRes } = await axios({
      method: 'get',
      url: tenantUrl,
      headers: {
        'terminal': 'bimops-manage-web',
        'Authorization': `Bearer ${authInfo.access_token}`,
        'Tenant': authInfo.tenant
      }
    })
    global.businessData.authNowEnterprise = {
      code: authInfo.tenant,
      name: tenantRes.data.name,
    }
  } catch (error) {
    process.exit(1)
  }

  // 3、区域信息
  const areaUrl = `${global.setting['cloud-api']}/api/mdata/area/list`
  try {
    const { data: areaRes } = await axios({
      method: 'get',
      url: areaUrl,
      headers: {
        'terminal': 'bimops-manage-web',
        'Authorization': `Bearer ${authInfo.access_token}`,
        'Tenant': authInfo.tenant
      }
    })
    global.businessData.areaData = areaRes.data
  } catch (error) {
    process.exit(1)
  }

  // 4、监测规则
  const rulesUrl = `${global.setting['cloud-api']}/api/medical-cleanliness/rule/all`
  try {
    const { data: rulesRes } = await axios({
      method: 'get',
      url: rulesUrl,
      headers: {
        'terminal': 'bimops-manage-web',
        'Authorization': `Bearer ${authInfo.access_token}`,
        'Tenant': authInfo.tenant
      }
    })
    global.businessData.ruleAllData = rulesRes.data
  } catch (error) {
    process.exit(1)
  }

  // 5、导入的设备
  const securityDevicePagesUrl = `${global.setting['cloud-api']}/api/device-center/device/instance/page`
  try {
    const { data: firstQuery } = await axios({
      method: 'post',
      url: securityDevicePagesUrl,
      headers: {
        'terminal': 'bimops-manage-web',
        'Authorization': `Bearer ${authInfo.access_token}`,
        'Tenant': authInfo.tenant
      },
      data: {
        pageSize: 1000,
        pageNumber: 1,
        tagCodes: ["builtin.app::OPERATING_ROOM"]
      }
    })
    const deviceList = {
      1: firstQuery.data.records
    }
    const taskList = []
    if (firstQuery.data.pages > 1) {
      for (let pageNumber = 2; pageNumber <= firstQuery.pages; pageNumber++) {
        taskList.push(async () => {
          const { data: deviceRes } = await axios({
            method: 'post',
            url: securityDevicePagesUrl,
            headers: {
              'terminal': 'bimops-manage-web',
              'Authorization': `Bearer ${authInfo.access_token}`,
              'Tenant': authInfo.tenant
            },
            data: {
              pageSize: 1000,
              pageNumber: pageNumber,
              tagCodes: ["builtin.app::OPERATING_ROOM"]
            }
          })

          deviceList[pageNumber] = deviceRes.records
        })
      }
      await Promise.all(taskList)
    }
    const deviceArray = []
    for (const key in deviceList) {
      deviceArray.push(...deviceList[key])
    }
    global.businessData.devicePageData = {
      total: deviceArray.length,
      pages: 1,
      records: deviceArray.map(e => {
        const productCategory = e.productInfo?(e.productInfo?.productCategory ?? {}):{}
        return {
          "id": e.id,
          "deviceName": e.name,
          "deviceId": e.id,
          "applicationCode": "OPERATING_ROOM",
          "brandName": e.productInfo?e.productInfo.brandName:'',
          "brandCode": e.productInfo?e.productInfo.brandCode:'',
          "areaName": e.area?e.area.name:'',
          "areaId": e.area?e.area.id:'',
          "code": e.code,
          "lntAndLat": e.lntAndLat,
          "thirdPartyId": e.thirdPartyId,
          "deviceStatus": e.status?e.status.onlineState:false,
          "deviceProdCategoryCode": e.productInfo.code,
          "deviceProdCategoryCodeConcat": productCategory.pathCode,
          "deviceProdCategoryName": productCategory.name,
          "deviceProdId": e.productInfo?e.productInfo.id:'',
          "deviceProdName": e.productInfo?e.productInfo.name:'',
          "departmentId": e.department?e.department.id:"",
          "departmentName": e.department?e.department.name:"",
        }
      })
    }
  } catch (error) {
    process.exit(1)
  }

  // 6、产品信息
  const productListUrl = `${global.setting['cloud-api']}/api/device-center/things/product/list/all`
  let prodIds = []
  try {
    const { data: productListRes } = await axios({
      method: 'get',
      url: productListUrl,
      headers: {
        'terminal': 'bimops-manage-web',
        'Authorization': `Bearer ${authInfo.access_token}`,
        'Tenant': authInfo.tenant
      }
    })
    const allProduct = productListRes.data
    prodIds = allProduct.map(item => item.id ? item.id : '')
  } catch (error) {
    process.exit(1)
  }
  const productUrl = `${global.setting['cloud-api']}/api/iot/north/product/prod-list-detail`
  try {
    const { data: productRes } = await axios({
      method: 'get',
      url: productUrl,
      headers: {
        'terminal': 'bimops-manage-web',
        'Authorization': `Bearer ${authInfo.access_token}`,
        'Tenant': authInfo.tenant
      },
      params: {
        prodIds: prodIds.join(',')
      }
    })
    global.businessData.prodListDetailData = productRes.data
  } catch (error) {
    process.exit(1)
  }

  // 7、部门配置
  const departmentUrl = `${global.setting['cloud-api']}/api/ouaa/context/user?id=${global.businessData?.userData?.id}`
  try {
    const { data: departmentRes } = await axios({
      method: 'get',
      url: departmentUrl,
      headers: {
        'terminal': 'bimops-manage-web',
        'Authorization': `Bearer ${authInfo.access_token}`,
        'Tenant': authInfo.tenant
      }
    })
    global.businessData.departmentList = departmentRes.data?.organizations
  } catch (error) {
    process.exit(1)
  }

  // 8、修正指标
  const correctIndicatorUrl = `${global.setting['cloud-api']}/api/dictionary/getDataDictionaryByItem?itemCode=OPERATING_ROOM_ADMIN_CORRECT_NORM_SET`
  try {
    const { data: indicatorRes } = await axios({
        method: 'get',
        url: correctIndicatorUrl,
        headers: {
            'terminal': 'bimops-manage-web',
            'Authorization': `Bearer ${authInfo.access_token}`,
            'Tenant': authInfo.tenant
        }
    })
    global.businessData.correctNormSet = indicatorRes.data
  } catch (error) {
      process.exit(1)
  }

  // 9、特殊指标
  const specialIndicatorUrl = `${global.setting['cloud-api']}/api/dictionary/getDataDictionaryByItem?itemCode=OPERATING_ROOM_ADMIN_SPECIAL_NORM_SET`
  try {
    const { data: indicatorRes } = await axios({
        method: 'get',
        url: specialIndicatorUrl,
        headers: {
            'terminal': 'bimops-manage-web',
            'Authorization': `Bearer ${authInfo.access_token}`,
            'Tenant': authInfo.tenant
        }
    })
    global.businessData.specialNormSet = indicatorRes.data
  } catch (error) {
      process.exit(1)
  }
}

export default {
  getBusinessInfo
}