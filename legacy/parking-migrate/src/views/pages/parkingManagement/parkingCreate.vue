<template>
  <g-layout-no-footer :title=title>
    <template v-slot:content-table>
      <div class="page-container">
        <div class="section">
          <h3 class="section-title">基本信息</h3>
          <a-form :model="form" ref="formRef" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入名称' }]">
                  <a-input v-model:value="form.name" :disabled="detailMode" placeholder="请输入名称" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="总车位" name="totalNum" :rules="[{ required: true, message: '请输入总车位' }]">
                  <a-input-number v-model:value="form.totalNum" :disabled="detailMode" :min="0" placeholder="请输入总车位"  :step="1" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="模型区域编码" name="modelArea" :rules="[{ required: true, message: '请输入模型区域编码' }]">
                  <a-input v-model:value="form.modelArea" :disabled="detailMode" placeholder="请输入编码" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="所在区域" name="region" :rules="[{ required: true, message: '请选择所在区域' }]">
                 <a-tree-select
                  v-model:value="form.region"
                  :tree-data="areaTreeData"
                  :replace-fields="fieldNames"
                  placeholder="请选择所在区域"
                  allow-clear
                  tree-default-expand-all
                  :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" 
                  :disabled="detailMode"
                />
                </a-form-item>
              </a-col>

              

              <a-col :span="12">
                <a-form-item label="详细位置" name="location">
                  <a-input v-model:value="form.location" :disabled="detailMode" placeholder="去选择" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="备注" name="remark">
                  <a-textarea v-model:value="form.remark" :disabled="detailMode" :maxlength="200" show-count placeholder="请输入备注" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="车场图片" name="imageUrl" >
                  <g-upload
                    :file="upload.fileList"
                    list-type="picture-card"
                    :max="4"
                    businessKey="parking"
                    @changeFile="onUploadChange"
                    sceneCode="PARKING::INFO"
                    :disabled="detailMode"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>

        <div class="section">
          <h3 class="section-title">区域视角</h3>
          <a-button v-if="!detailMode&&viewAngles.length<1" type="primary" style="margin-bottom: 8px" @click="openViewAngleDrawer">添加</a-button>
          <a-table :columns="viewAngleColumns" :data-source="viewAngles" row-key="id" :pagination="false" size="small" />
        </div>

        <div class="footer-actions">
          <a-space>
            <a-button v-if="!detailMode" type="primary" v-model:loading="loading" @click="handleSubmit">保存</a-button>
            <a-button @click="goBack">返回</a-button>
          </a-space>
        </div>

        <!-- Add Device Modal -->
    
        <!-- View Angle Modal -->
         <a-modal
           v-model:visible="drawer.visible"
           :title="drawer.form.name ? '编辑视角' : '新增视角'"
           @ok="confirmViewAngle"
           @cancel="drawer.visible = false"
         >
           <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
            <a-form-item label="所在区域">
              <a-input :value="getRegionName(form.region) || '--'" disabled />
            </a-form-item>
             <a-form-item label="中心点位置">
               <a-textarea v-model:value="drawer.form.center" placeholder="请输入中心点位置" :auto-size="{ minRows: 2, maxRows: 4 }" />
            </a-form-item>
            <a-form-item label="视角参数" required>
               <a-textarea v-model:value="drawer.form.params" placeholder="请输入视角参数" :auto-size="{ minRows: 2, maxRows: 4 }" />
            </a-form-item>
             <a-form-item label="隐藏楼栋">
               <a-tree-select
                 v-model:value="drawer.form.hideLayers"
                 :tree-data="areaTreeData"
                 :replace-fields="fieldNames"
                 placeholder="请选择楼栋"
                 tree-checkable
                 allow-clear
                 show-search
                 tree-default-expand-all
                 :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                 style="width: 100%"
               />
            </a-form-item>
          </a-form>
        </a-modal>
      </div>
    </template>
  </g-layout-no-footer>
</template>

<script lang="jsx">
import { defineComponent, reactive, ref, onMounted, getCurrentInstance } from 'vue'
import { message } from 'ant-design-vue'
import gUpload from '../components/gUpload.vue'
import { cubeOuaaService } from '../../../api/service'
import { getDeviceList, getInstanceList } from '../../../api'

export default defineComponent({
  name: 'ParkingCreate',
  components: {
    gUpload,
  },
  setup () {
    const { proxy } = getCurrentInstance()
    const title = ref('车场-新增')
    const formRef = ref()
    const detailMode = ref(!!(proxy?.$route?.query?.mode === 'detail'))
    const form = reactive({ id: undefined, name: '', totalNum: undefined,modelArea:undefined, region: undefined, imageUrl: '', location: '', remark: '', fileIds: [] })
    const upload = reactive({ fileList: [] })
    const loading = ref(false)
    const regionOptions = ref([])
    const deviceFilter = reactive({ region: undefined, keyword: '', pageNum: 1, pageSize: 999 })
    const deviceList = ref([])
    const deviceSelectedKeys = ref([])
    const devicePagination = reactive({ current: 1, pageSize: 10, total: 0 })

    const viewAngles = ref([])
    const drawer = reactive({ visible: false, form: { name: '', center: '', params: '', hideLayers: '' } })

    const deviceColumns = [
      { title: '设备编号', dataIndex: 'code', key: 'code', customRender: ({ text }) => (<a-popover placement="topLeft" content={text || '--'}>{text || '--'}</a-popover>) },
      { title: '设备名称', dataIndex: 'name', key: 'name', customRender: ({ text }) => (<a-popover placement="topLeft" content={text || '--'}>{text || '--'}</a-popover>) },
      { title: '所属产品', dataIndex: 'product', key: 'product', customRender: ({ text }) => (<a-popover placement="topLeft" content={text || '--'}>{text || '--'}</a-popover>) },
      { title: '产品品类', dataIndex: 'category', key: 'category', customRender: ({ text }) => (<a-popover placement="topLeft" content={text || '--'}>{text || '--'}</a-popover>) },
      { title: '设备型号', dataIndex: 'model', key: 'model', customRender: ({ text }) => (<a-popover placement="topLeft" content={text || '--'}>{text || '--'}</a-popover>) },
      { title: '所在区域', dataIndex: 'region', key: 'region', customRender: ({ text }) => (<a-popover placement="topLeft" content={text || '--'}>{text || '--'}</a-popover>) },
      ...(detailMode.value ? [] : [{ title: '操作', key: 'action', customRender: ({ record }) => [<a-button type="link" onClick={() => moveDevice(record)}>移除</a-button>] }])
    ]
    const viewAngleColumns = [
      { title: '名称', dataIndex: 'name', key: 'name', customRender: ({ text }) => (<a-popover placement="topLeft" content={text || '--'}>{text || '--'}</a-popover>) },
      { title: '视角参数', dataIndex: 'params', key: 'params', customRender: ({ text }) => (<a-popover placement="topLeft" content={text || '--'}>{text || '--'}</a-popover>) },
      ...(detailMode.value ? [] : [{ title: '操作', key: 'action', customRender: ({ record }) => [
        <a-button type="link" onClick={() => editViewAngle(record)}>编辑</a-button>,
        <a-button type="link" danger onClick={() => removeViewAngle(record)}>删除</a-button>
      ] }])
    ]
    const rowSelection = { selectedRowKeys: deviceSelectedKeys.value, onChange: (keys) => { deviceSelectedKeys.value = keys } }

    // functions: 上传图片变更，写入表单
    function onUploadChange (ids, files) {
      upload.fileList = files
      form.fileIds = ids
      if (files.length > 0 && files[0].response && files[0].response.data) {
        form.imageUrl = files[0].response.data.path
      } else if (files.length === 0) {
        form.imageUrl = ''
      }
    }
    
    const areaTreeData = ref([])
    const fieldNames = { children: 'children', label: 'name', key: 'id', value: 'sequence' }

    // Add Device Modal State
    const addDeviceModal = reactive({
      visible: false,
      filter: { region: undefined, keyword: '' },
      list: [],
      selectedRowKeys: [],
      pagination: { current: 1, pageSize: 5, total: 0 }
    })

    const addDeviceColumns = [
      { title: '设备编号', dataIndex: 'code', key: 'code' },
      { title: '设备名称', dataIndex: 'name', key: 'name' },
      { title: '所属产品', dataIndex: 'product', key: 'product' },
      { title: '产品品类', dataIndex: 'category', key: 'category' },
      { title: '维护部门', dataIndex: 'dept', key: 'dept' },
      { title: '所在区域', dataIndex: 'region', key: 'region' }
    ]

    // Mock data
    const mockAddDeviceList = Array.from({ length: 20 }).map((_, i) => ({
      key: `dev_${i}`,
      code: `A01_10FM_${i}`,
      name: '1F休息区新风机组',
      product: '新风机组',
      category: '运维-楼控-新风机组',
      dept: '工程部',
      region: '1F消控室'
    }))

    function getRegionName (id) {
        if (!id) return ''
        const find = (nodes) => {
            for (const node of nodes) {
                if (node.sequence === id) return node.name
                if (node.children) {
                    const found = find(node.children)
                    if (found) return found
                }
            }
            return null
        }
        return find(areaTreeData.value) || id
    }

    function openAddDevice () {
      if (detailMode.value) return
      addDeviceModal.visible = true
      fetchAddDevices()
    }

    function fetchAddDevices () {
      // Mock fetch
      const start = (addDeviceModal.pagination.current - 1) * addDeviceModal.pagination.pageSize
      addDeviceModal.list = mockAddDeviceList.slice(start, start + addDeviceModal.pagination.pageSize)
      addDeviceModal.pagination.total = mockAddDeviceList.length
    }

    function resetAddDeviceFilter () {
        addDeviceModal.filter.region = undefined
        addDeviceModal.filter.keyword = ''
        addDeviceModal.pagination.current = 1
        fetchAddDevices()
    }

    function onAddDeviceTableChange (pag) {
      addDeviceModal.pagination.current = pag.current
      fetchAddDevices()
    }

    function confirmAddDevice () {
       const selectedItems = mockAddDeviceList.filter(item => addDeviceModal.selectedRowKeys.includes(item.key))
       const newItems = selectedItems.filter(item => !deviceList.value.some(d => d.code === item.code))
       deviceList.value.push(...newItems)
       addDeviceModal.visible = false
       addDeviceModal.selectedRowKeys = []
       message.success('已添加设备')
    }

    async function fetchAreaTree () {
      try {
        const res = await cubeOuaaService.getAreaTree()
        areaTreeData.value = res
      } catch (error) {
      }
    }

    // functions: 单条移除设备
    function moveDevice (record) { deviceList.value = deviceList.value.filter(d => d.code !== record.code); message.success('已移除设备') }

    // functions: 查询设备列表（编辑模式）
    async function fetchDevices () {
      const id = proxy?.$route?.query?.id
      if (!id) return
      try {
        const params = {
          id,
          regionId: deviceFilter.region,
          keyword: deviceFilter.keyword,
          pageNumber: deviceFilter.pageNum,
          pageSize: deviceFilter.pageSize
        }
        const res = await getDeviceList(params)
        deviceList.value = res.records || []
        devicePagination.total = res.total || 0
      } catch (error) {
      }
    }

    // functions: 重置设备筛选（编辑模式）
    function resetDeviceFilter () { if (detailMode.value) return; deviceFilter.region = undefined; deviceFilter.keyword = ''; deviceFilter.pageNum = 1; deviceFilter.pageSize = 10; fetchDevices() }

    // functions: 设备表格分页变更（编辑模式）
    function onDeviceTableChange (pagination) { if (detailMode.value) return; devicePagination.current = pagination.current; devicePagination.pageSize = pagination.pageSize; deviceFilter.pageNum = pagination.current; deviceFilter.pageSize = pagination.pageSize; fetchDevices() }

    /** 打开新增视角弹窗，区域绑定基本信息 */
    function openViewAngleDrawer () { 
      if (detailMode.value) return; 
      drawer.visible = true; 
      drawer.form = { id: undefined, name: '', center: '', params: '', hideLayers: [], region: form.region } 
    }

    /** 确认新增或更新视角，区域采用基本信息 */
    function confirmViewAngle () { 
      if (!drawer.form.params) { message.warning('请输入视角参数'); return } 
      const item = { 
        id: drawer.form.id || Date.now(), 
        name: drawer.form.name || '默认', 
        params: drawer.form.params, 
        center: drawer.form.center, 
        hideLayers: drawer.form.hideLayers,
        region: form.region
      }; 
      // if (drawer.form.id) {
      
      //   const index = viewAngles.value.findIndex(v => v.id === drawer.form.id)
      //   if (index > -1) {
      //     viewAngles.value.splice(index, 1, item)
      //   } else {
      //     viewAngles.value.push(item)
      //   }
      // } else {
      //   viewAngles.value.push(item); 
      // }
      viewAngles.value.splice(0, 1, item)
      drawer.visible = false 
    }

    /** 编辑视角并回显，区域展示基本信息 */
    function editViewAngle (record) { 
      if (detailMode.value) return; 
      drawer.visible = true; 
      let hideLayers = record.hideLayers;
      if (typeof hideLayers === 'string' && hideLayers) {
        hideLayers = hideLayers.split(',') // Assume comma separated if string
      } else if (!Array.isArray(hideLayers)) {
        hideLayers = []
      }
      drawer.form = { id: record.id, name: record.name, center: record.center, params: record.params, hideLayers: hideLayers, region: record.region || form.region } 
    }

    // functions: 删除视角（编辑模式）
    function removeViewAngle (record) { if (detailMode.value) return; viewAngles.value = viewAngles.value.filter(v => v.id !== record.id) }

    // functions: 保存表单（编辑模式）
    async function handleSubmit () {
      
      const valid = await formRef.value?.validate().catch(() => false);
       if (!valid) return; const payload = { ...form, devices: deviceList.value, viewAngles: viewAngles.value }; 
       const visual = payload.viewAngles.map((item) =>{
            return {
              centerAddress:item.center,
              visualConfig:item.params,
              hiddenBuilding:item.hideLayers?.join(','),
            }
          })
        const query = {
          id: payload.id,
          name:payload.name,
          totalNum: payload.totalNum,
          modelArea:payload.modelArea,
          areaId:payload.region,
          address:payload.location,
          remarks:payload.remark,
          files:payload.fileIds,
          source:'SELF_BUILT',
          visual:visual.length?visual[0]:null,
        }
        loading.value = true
        try{
          if(payload.id){
            query.refDevice = {
              deviceIds: deviceList.value?.map(d => d.id),
            }
            await proxy.$api.updateParkingList(query)
          }else{
            await proxy.$api.createParkingList(query)
          }
          loading.value = false
          message.success('保存成功') 
          goBack()
        }catch{
          loading.value = false
        }
    
      }
    // functions: 返回上一页
    function goBack () {proxy.$router.push({ path: '/parkingManagement'}) }


    // functions: 加载详情数据并回显（与创建页结构一致）
    async function loadDetail () {
      try {
        const id = proxy?.$route?.query?.id
        let res = null
        if (proxy.$api.getParkingDetail) {
          res = await proxy.$api.getParkingDetail({ id })
        } else if (proxy.$api.getParkingInformation) {
          res = await proxy.$api.getParkingInformation({ parkingInfoCode: id })
        }
        const data = res?.data || res || {}
        form.id = data.id ?? form.id
        form.name = data.name ?? form.name
        form.totalNum = data.totalNum ?? form.totalNum
        form.modelArea = data.modelArea ?? form.modelArea
        form.region = data.areaId ?? form.region
        form.imageUrl = data.imageUrl ?? form.imageUrl
        form.location = data.address ?? form.location
        form.remark = data.remarks ?? form.remark
        
        // 处理 files 数组回显
        if (Array.isArray(data.files) && data.files.length > 0) {
          form.fileIds = data.files.map(f => f.id)
          upload.fileList = data.files.map(f => ({
            uid: f.id,
            id: f.id, 
            name: f.name || '图片',
            status: 'done',
            url: f.endpointPath || f.path, // 优先使用完整路径 endpointPath
            response: { data: { id: f.id, path: f.path } }
          }))
          // 如果需要设置首张图为封面
          if (upload.fileList.length > 0) {
            form.imageUrl = upload.fileList[0].url
          }
        } else if (data.fileId) {
          // 兼容旧逻辑
          form.fileIds = [data.fileId]
          upload.fileList = [{
            uid: data.fileId,
            id: data.fileId,
            url: form.imageUrl,
            name: '图片',
            status: 'done',
            response: { data: { id: data.fileId, path: form.imageUrl } }
          }]
        } else {
          upload.fileList = []
        }

        deviceList.value = Array.isArray(data.devices) ? data.devices : deviceList.value
        viewAngles.value = Array.isArray(data.viewAngles) ? data.viewAngles : viewAngles.value
        loadDetailView()
      } catch {}
    }
    async function loadDetailView () {
      try {
        const id = proxy?.$route?.query?.id
        let res = null
        if (proxy.$api.getParkingViewDetail) {
          res = await proxy.$api.getParkingViewDetail({ id })
        }
        const data = res?.data || res || {}
        if(data.visualConfig){
          viewAngles.value = [{
            id: data.id,
            name: '默认',
            center: data.centerAddress,
            params: data.visualConfig,
            hideLayers: data.hiddenBuilding?data.hiddenBuilding.split(','):[],
            region: form.region
          }]
          
        }
      }catch{
 
      }
    }

    onMounted(() => {  
      fetchAreaTree();
      if(proxy?.$route?.query?.id){
        title.value = "车场-编辑"
       loadDetail() 
      //  loadDetailView()
      }
      fetchDevices()
      }) 

    return {
      formRef, detailMode, form, upload, regionOptions,
      deviceFilter, deviceList, deviceSelectedKeys, devicePagination,
      deviceColumns, rowSelection, viewAngles, viewAngleColumns, drawer,
      onUploadChange, fetchDevices, resetDeviceFilter, onDeviceTableChange,
      openViewAngleDrawer, confirmViewAngle, editViewAngle, removeViewAngle,
      moveDevice, handleSubmit, goBack, areaTreeData, fieldNames,
      openAddDevice,
      addDeviceModal,
      fetchAddDevices,
      resetAddDeviceFilter,
      onAddDeviceTableChange,
      addDeviceColumns,
      getRegionName,
      loading,
      title
    }
  }
})
</script>

<style lang="less" scoped>
.page-container { background: #fff; height: calc(100% - 38px); padding: 16px;overflow-y: auto; }
.section { margin-bottom: 16px; }
.section-title { padding: 0 12px; font-size: 14px; font-weight: 700; color: #333; border-left: 4px solid #1890ff; margin-bottom: 12px; }
.toolbar { margin-bottom: 8px; display: flex; align-items: center; }
.footer-actions { display: flex; justify-content: flex-end; margin-top: 16px; z-index: 100; position: fixed;bottom: 16px; right: 16px; }
</style>
