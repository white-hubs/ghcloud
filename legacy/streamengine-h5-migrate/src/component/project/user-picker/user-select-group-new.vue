<template>
  <div class="user-select-group">
    <VanNavBar title="人员选择" left-text="取消" right-text="确认" @click-left="cancel" @click-right="confirm" />
    <VanSearch v-model="searchValue.keyword" placeholder="根据人员姓名进行搜索" @search="onSearch" @clear="onSearch"/>
    <div class="form">
      <van-field v-model="searchValue.organization.name" is-link readonly name="datePicker" placeholder="选择部门"
        @click="showDeptPicker" />
      <van-field v-model="searchValue.workStatus.text" is-link readonly name="datePicker" placeholder="选择状态"
      @click="()=>{showStatusPicker=true}" />
    </div>
    <VanList class="select-group"
      :style="props.multiple&&userCells.length>0?'height: calc(100% - 200px)':'height: calc(100% - 150px)'"
      :loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
      <template v-for="userCell of userCells" :key="userCell.value.id">
        <VanCell clickable @click="cellClick(userCell)" v-show="!userCell.hidden">
          <template #title>
            <VanRow justify="space-between">
              <VanCol span="4">
                <div class="Fname">{{userCell.value.name.slice(0,1)[0] }}</div>
              </VanCol>
              <VanCol span="19">
                <div style="vertical-align: middle;max-width: 270px" class="ellipsis">
                  <span>{{userCell.value.name}}</span>
                  <van-tag v-if="userCell.value.workStatus"
                    :style="{height: '20px', borderRadius: '4px',marginLeft:'5px',fontSize: '14px'}"
                    :color="statusTypeColorBg.get(userCell.value.workStatus??'')??'rgba(153,153,153,1'"
                    :text-color="statusTypeColor.get(userCell.value.workStatus??'')??'rgba(153,153,153,1'">{{statusType.get(userCell.value.workStatus??'')}}
                  </van-tag>
                </div>
                <div style="color:#555555;font-size: 14px;display: flex;">
                  <div style=" max-width: 170px" class="ellipsis">{{
                    userCell.value.organizations&&userCell.value.organizations.length?userCell.value.organizations.map(e=>e.name).join('/'):'--'
                    }}</div>
                  <van-divider vertical />
                  <div>{{userCell.value.mobile}}</div>
                </div>
              </VanCol>
            </VanRow>
          </template>
          <template #right-icon>
            <VanCheckbox :model-value="userCell.checked" :disabled="userCell.disabled" @change="changeCheckBox"
              :shape="props.multiple ? 'square' : 'round'" />
          </template>
        </VanCell>
      </template>
    </VanList>
    <van-checkbox v-if="props.multiple&&userCells.length>0" class="all" label-position="left" shape="square"
      v-model="isCheckAll" :indeterminate="isIndeterminate" @change="checkAllChange">
      全选
    </van-checkbox>

    <div class="dept-picker">
      <DeptPicker v-model:model-value="organizationSelected" ref="deptPickerRef" :multiple="false"
        @update:model-value="handelOrganizationSelected" 
        @closePicker="cancelOrganizationSelected" />
    </div>
    <van-popup v-model:show="showStatusPicker" round position="bottom">
      <van-picker :columns="statusColumns" @cancel="cancelStatusSelected" @confirm="handelStatusSelected" />
    </van-popup>
    <van-toast v-model:show="showToast" style="padding: 0;height: 100px;">
      <template #message>加载中...</template>
    </van-toast>
  </div>
</template>

<script setup lang="ts">
import _ from "lodash";
import { OuaaUser } from '../../../domain/user'
import { reactive, ref, watch } from 'vue'
import DeptPicker from '../dept-picker/dept-picker.vue';
import { Dept } from '../../../domain/ouaa';
import { ouaaService } from '../../../service/ouaa/ouaa.'

interface CheckboxCell<T> {
  value: T;
  checked: boolean;
  disabled: boolean;
  hidden: boolean
}
const props = defineProps<{
  multiple: boolean;
  activeIds?: string[];
  activeUsers?: { id: string, name: string }[];
  disableIds?: string[];
  organizationId?: string;
  currentDep?: { id: string, name: string };
}>()
const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'confirm', selected: { id: string, name: string }[]): void;
}>()
let userCells = ref<CheckboxCell<OuaaUser>[]>([])
const users = ref<OuaaUser[]>([])
const loading = ref(false);
const finished = ref(false);
const isCheckAll=ref(false)
const isIndeterminate=ref(true)
const organizationSelected = ref<Dept[]>([])
const showToast=ref(false)
//搜索
const searchValue = ref({
  keyword: '',
  organization: {
    id: '', name: ''
  },
  workStatus: {
    value: '', text: ''
  },
})
//全选
const checkAllChange=(val:boolean)=>{
  activeUsers.value=val?userCells.value.map(x=>x.value):[]
  activeIds.value=val?activeUsers.value.map(x=>x.id):[]
  isIndeterminate.value = false
  val?userCells.value.forEach(e => e.checked = true):userCells.value.forEach(e => e.checked = false)
}
//单选
const changeCheckBox=(val:boolean)=>{
  if(val&&activeUsers.value.length===users.value.length){
    isIndeterminate.value=false
    isCheckAll.value=true
  }else{
    isIndeterminate.value=true
    isCheckAll.value=false
  }
}


const page = reactive({
  pageSize: 20,
  pageNumber: 0,
  pages: 0
})
const onLoad = async () => {
  try{
    organizationSelected.value.push(props.currentDep??{
      id: '', name: ''
    },)
    searchValue.value.organization=props.currentDep??{
      id: '', name: ''
    }
    if (loading.value) {
      return
    }
    if (page.pageNumber >= page.pages && page.pageNumber != 0) {
      return
    }
    page.pageNumber++
    loading.value = true
    finished.value = false
    const { records, pages } = await ouaaService.getUserList({
      pageSize: page.pageSize,
      pageNumber: page.pageNumber,
      keyword: searchValue.value.keyword || undefined,
      organizationId: props.organizationId || (searchValue.value.organization.id || undefined),
      workStatus:searchValue.value.workStatus.value|| undefined,
      enabled: true
    })
    page.pages = pages
    users.value = users.value.concat(records)
    loading.value = false
    if (records.length < page.pageSize) {
      finished.value = true
    }
  }catch(err){}

};
const activeIds = ref<string[]>(props.activeIds ?? [])
const activeUsers = ref<{ id: string, name: string }[]>(props.activeUsers ?? [])
const statusColumns=[
  { text: '休息', value: 'REST' },
  { text: '在岗', value: 'WORKING' },
  { text: '离岗', value: 'LEAVE_POST' },
  { text: '出差', value: 'AWAY_BUSINESS' },
  { text: '请假', value: 'ASK_LEAVE' },
]
const statusType=new Map([
  ['REST','休息'],
  ['WORKING','在岗'],
  ['LEAVE_POST','离岗'],
  ['AWAY_BUSINESS','出差'],
  ['ASK_LEAVE','请假'],
])
const statusTypeColor=new Map([
  ['REST','rgba(153,153,153,1)'],
  ['WORKING','rgba(106,181,57,1)'],
  ['LEAVE_POST','rgba(244,51,60,1)'],
  ['AWAY_BUSINESS','rgba(246,151,3,1)'],
  ['ASK_LEAVE','rgba(246,151,3,1)'],
])
const statusTypeColorBg=new Map([
  ['REST','rgba(153,153,153,.2)'],
  ['WORKING','rgba(106,181,57,.2)'],
  ['LEAVE_POST','rgba(244,51,60,.2)'],
  ['AWAY_BUSINESS','rgba(246,151,3,.2)'],
  ['ASK_LEAVE','rgba(246,151,3,.2)'],
])
watch(() => users.value.length, () => {
  userCells.value = users.value.map((d) => (
    {
      checked: props.multiple&&isCheckAll.value?true:activeIds.value.includes(d.id),
      value: d,
      disabled: props.disableIds ? props.disableIds?.includes(d.id) : false,
      hidden: false
    }
  )
  )
  if(props.multiple&&isCheckAll.value){
    activeUsers.value=_.cloneDeep(users.value)
    activeIds.value =activeUsers.value.map(x=>x.id)
  }

}, { immediate: true })

watch(() => props.activeIds, () => {
  activeIds.value = props.activeIds ?? []
  activeUsers.value = props.activeUsers ?? []
  searchValue.value.keyword = ''
  searchValue.value.workStatus={value:'',text:''}
  searchValue.value.organization = { id: '', name: '' }
  organizationSelected.value=[]
  filterData()
}, { deep: true })

const selected = ref<{ id: string, name: string }[]>([])



const deptPickerRef = ref()
const showStatusPicker=ref(false)
const showDeptPicker = () => {
  deptPickerRef.value?.pick()
}
const handelOrganizationSelected = (val: Dept[]) => {
  if (val.length) {
    organizationSelected.value = val
    searchValue.value.organization.id = val[0].id
    searchValue.value.organization.name = val[0].name
  }
  filterData()
}
const cancelOrganizationSelected=() => {
  if (searchValue.value.organization.name) {
    searchValue.value.organization.id = ''
    searchValue.value.organization.name = ''
    organizationSelected.value = []
  }
  filterData()
}
const handelStatusSelected=({ selectedOptions }:{ selectedOptions:{text:string,value:string}[] })=>{
  searchValue.value.workStatus.value = selectedOptions[0].value
    searchValue.value.workStatus.text = selectedOptions[0].text
    showStatusPicker.value=false
  filterData()
}
const cancelStatusSelected =()=>{
    searchValue.value.workStatus.text = ''
    searchValue.value.workStatus.value  = ''
    showStatusPicker.value=false
    filterData()
}
const onSearch = (val: string) => {
  filterData()
}
const onClickSearchButton = () => {
  filterData()
}

function filterData() {
  page.pageNumber = 0
  users.value = []
  onLoad()
}

function cellClick(userCell: CheckboxCell<OuaaUser>) {
  if (!props.multiple) {
    userCells.value.forEach(e => e.checked = false)
    activeIds.value=[]
    activeUsers.value=[]
  }
  if (userCell.disabled) {
    return
  }
  userCell.checked = !userCell.checked

  const findIndex = activeIds.value.findIndex(e => e === userCell.value.id)
  if (findIndex === -1 && userCell.checked) {
    activeIds.value.push(userCell.value.id)
    activeUsers.value.push(userCell.value)
  }
  if (findIndex !== -1 && !userCell.checked) {
    activeIds.value.splice(findIndex, 1)
    activeUsers.value.splice(findIndex, 1)
  }
}
function cancel() {
  userCells.value.forEach(cell => {
    cell.checked = !!selected.value.find(d => d.id === cell.value.id)
  })
  emit('cancel')
}
async function confirm() {
  try{
    if(isCheckAll.value){
    showToast.value=true
    const { records, pages } = await ouaaService.getUserList({
      pageSize: 100,
      pageNumber: 1,
      keyword: searchValue.value.keyword || undefined,
      organizationId: props.organizationId || (searchValue.value.organization.id || undefined),
      workStatus:searchValue.value.workStatus.value|| undefined,
      enabled: true
    })
    let userList:OuaaUser[]=[]
    userList = userList.concat(records)
    const task = []
    if(pages>1){
      for (let page = 2; page <= pages; page++) {
        task.push(
          new Promise<void>((resolve, reject) => {
            ouaaService.getUserList({
              keyword: searchValue.value.keyword || undefined,
              organizationId: props.organizationId || (searchValue.value.organization.id || undefined),
              workStatus:searchValue.value.workStatus.value|| undefined,
              enabled: true,
              pageNumber: page,
              pageSize: 100
            }).then(res => {
              userList = userList.concat(res.records)
              resolve()
            }).catch(err => {
              reject(err)
            })
          })
        )
      }
      await Promise.all(task)
    }
    activeUsers.value=userList
    showToast.value=false
  }
  }catch(err){}
  emit('confirm', activeUsers.value)
}
</script>

<style scoped lang="less">
.user-select-group {
  // background-color: #fff;
  height: 100vh;
  width: 100vw;
  overflow: hidden;



  .form {
    display: flex;
    height:50px !important;
    .department {
      :deep(.van-search__action) {
        display: none;
      }

      width: 50%;
    }

    .department {
      padding-left: 1vw;
    }
  }

  .select-group {
    overflow: auto;
    margin-bottom: 10px;

    .Fname {
      width: 40px;
      height: 40px;
      text-align: center;
      margin: 6px auto;
      line-height: 40px;
      border-radius: 5px;
      background-color: var(--van-primary-color);
      color: #ffffff
    }

    .ellipsis {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .dept-picker {
    :deep(.van-cell) {
      // display: none;

    }
  }
  .all {
    display: flex;
    height: 50px;
    padding: 0px 15px;
    justify-content: flex-end;
    box-shadow: 4px 0px 10px 3px rgba(0, 0, 0, 0.07);
  }

}
</style>
