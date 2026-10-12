import styles from './project-library-edit.module.less';
import { CubeLayout, FileUpload, UserSelectPage } from '@ghcloud/cube-app-design'
import { Button, Col, Form, FormItem, Input, Row, Spin, Textarea, type FormExpose } from '@ghcloud/cube-ui'
import { message, RangePicker, Select } from 'ant-design-vue'
import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { DMap } from './map'
import { createMapModal } from '@/components/map/map'
import { cubeOuaaService, cubeZhongdaHeshunService } from '@/api/service'
import type { PersonItem } from '@ghcloud/cube-ouaa-service'
import dayjs from 'dayjs'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import type { OSSFile } from '@ghcloud/generic-component'

interface ProjectAreaEditState {
  id?: number;
  projectName: string | null;
  projectTypeId: number | null;
  projectTypeName?: string;
  company?: string;
  projectPeriod: [dayjs.Dayjs, dayjs.Dayjs] | null;
  leaderId: number | null;
  disinfectionArea?: string;
  disinfectionLocationName?: string;
  disinfectionLocation?: string;
  disinfectionScope?: string;
  description?: string;
  files?: OSSFile[];
}
interface RequestProjectAreaEditState {
  id?: number;
  projectName: string | null;
  projectTypeId: number | null;
  projectTypeName?: string;
  company?: string;
  beginTime?: string;
  endTime?: string;
  leaderId: number | null;
  disinfectionArea?: string;
  disinfectionLocationName?: string;
  disinfectionLocation?: string;
  disinfectionScope?: string;
  description?: string;
  image?: string | null;
  projectImage?: OSSFile;
}
type DataList = {
  lng: number;
  lat: number;
  address: string;
}[]
/**
 * 项目库编辑/新增页面
 */
export const ProjectLibraryEdit = defineComponent({
  setup: () => {
    const formRef = ref<FormExpose>();
    const { id } = useRoute().query;
    const userOptions = ref<PersonItem[]>([]);
    const typeOptions = ref<{ id: string;dataName: string; }[]>([]);

    // 新增用户分页相关状态
    const userLoading = ref(false);
    const userKeyword = ref('');
    const selectUserId = ref<number | null>(null);
    const userPagination = reactive({
      pageNumber: 1,
      pageSize: 20,
      total: 0,
      hasMore: true
    });

    // 获取用户列表数据（分页）
    const fetchUserList = async (isReset = false): Promise<void> => {
      if (userLoading.value) return;

      try {
        userLoading.value = true;

        if (isReset) {
          userPagination.pageNumber = 1;
          userOptions.value = [];
        }

        const { records, total } = await cubeOuaaService.getStaffPage({
          pageNumber: userPagination.pageNumber,
          pageSize: userPagination.pageSize,
          keyword: userKeyword.value || undefined
        });

        if (isReset) {
          userOptions.value = records;
        } else {
          userOptions.value = [...userOptions.value, ...records];
        }

        userPagination.total = total;
        userPagination.hasMore = userOptions.value.length < total;
        userPagination.pageNumber++;
      } finally {
        userLoading.value = false;
      }
    };

    // 处理搜索关键字变化
    const handleUserSearch = (value: string): void => {
      userKeyword.value = value;
      fetchUserList(true);
    };

    // 处理滚动加载更多
    const handleUserPopupScroll = (e: Event): void => {
      const target = e.target as HTMLElement;
      if (
        !userLoading.value &&
        userPagination.hasMore &&
        target.scrollTop + target.clientHeight >= target.scrollHeight - 20
      ) {
        fetchUserList();
      }
    };
    onMounted(async () => {
      loading.value = true;
      // 初始加载第一页用户数据
      await fetchUserList();
      const type = await cubeZhongdaHeshunService.getTypeList({ pageNumber: 1, pageSize: 1000, dataType: 'PROJECT' });
      typeOptions.value = type.records as { id: string;dataName: string; }[];
      if (id) {
        getLibrayDetail(id as string);
      }
      loading.value = false;
    });
    const rules = {
      projectName: [
        { required: true, message: '请输入项目名称', trigger: 'blur' },
      ],
      projectTypeId: [
        { required: true, message: '请选择项目类型', trigger: 'blur' },
      ],
      projectPeriod: [
        { required: true, message: '请选择项目周期', trigger: 'blur' },
      ],
      disinfectionLocationName: [
        { required: true, message: '请输入项目所在地', trigger: 'blur' },
      ],
      leaderId: [
        { required: true, message: '请选择项目负责人', trigger: 'blur' },
      ],
      disinfectionScope: [
        { required: true, message: '请选择项目范围', trigger: 'blur' },
      ],
    }
    const buttonLoading = ref(false)
    const loading = ref(false)
    const formState = reactive<ProjectAreaEditState>({
      projectName: null,
      projectTypeId: null,
      projectPeriod: null,
      leaderId: null
    })
    const dMapData = reactive<{
      value: string;
      address: string;
    }>({
      // value: '104.05906925176734,30.589318900275615',
      // address: '四川省成都市武侯区桂溪街'
      value: '',
      address: ''
    })
    watch(()=>dMapData.value, ()=>{
      formState.disinfectionLocation = dMapData.value
      formState.disinfectionLocationName = dMapData.address
    })
    const aMapData = ref<DataList>()
    watch(()=>aMapData.value, ()=>{
      formState.disinfectionScope = aMapData.value?.map(item=>`${item.lng},${item.lat},${item.address}`).join(';') ?? ''
    })
    /**
   * @description 保存
   */
    const handleSave = async (): Promise<void> => {
      try {
        const values = await formRef.value?.validate();
        const params = { ...formState } as RequestProjectAreaEditState
        params.beginTime = formState.projectPeriod?.[0].startOf('day').format('YYYY-MM-DD HH:mm:ss') ?? ''
        params.endTime = formState.projectPeriod?.[1].endOf('day').format('YYYY-MM-DD HH:mm:ss') ?? ''
        params.image = formState.files?.map((item) => item.id).join(',') ?? null
        if (formState.id){
          editLibray(params)
        } else {
          addLibray(params)
        }
      // 在这里处理保存逻辑，例如调用API
      } catch (errorInfo) {
      }
    };
    const getLibrayDetail = async (id: string): Promise<void> => {
      loading.value = true
      try {
        const data = await cubeZhongdaHeshunService.getProjectPageDetail({ id }) as RequestProjectAreaEditState;
        Object.assign(formState, { ...data })
        selectUserId.value = data.leaderId
        if (data.projectImage)
          formState.files = [data.projectImage]
        dMapData.address = data.disinfectionLocationName ?? ''
        dMapData.value = data.disinfectionLocation ?? ''
        aMapData.value = data.disinfectionScope?.split(';').map(item=>{
          const [lng, lat, address] = item.split(',')
          return {
            lng: Number(lng),
            lat: Number(lat),
            address: address
          }
        })
        const beginTime = dayjs(data.beginTime) ?? ''
        const endTime = dayjs(data.endTime) ?? ''
        formState.projectPeriod = [beginTime, endTime]
      // 在这里处理保存逻辑，例如调用API
      } catch {
        message.error('获取数据失败')
      } finally {
        loading.value = false
      }
    };
    const addLibray = async (params: RequestProjectAreaEditState): Promise<void> => {
      buttonLoading.value = true
      try {
        await cubeZhongdaHeshunService.addProjectPageList(params);
        message.success('保存成功')
        handleCancel()
      // 在这里处理保存逻辑，例如调用API
      } catch {
        message.error('保存失败')
      } finally {
        buttonLoading.value = false
      }
    };
    const editLibray = async (params: RequestProjectAreaEditState): Promise<void> => {
      buttonLoading.value = true
      try {
        await cubeZhongdaHeshunService.editProjectPageList(params);
        message.success('保存成功')
        handleCancel()
      // 在这里处理保存逻辑，例如调用API
      } catch {
        message.error('保存失败')
      } finally {
        buttonLoading.value = false
      }
    };
    /**
   * @description 取消
   */
    const handleCancel = (): void => {
    // 在这里处理取消逻辑，例如返回上一页
      history.back();
    };
    const AMapClick = (): void =>{
      createMapModal(aMapData.value).then(res=>{
        aMapData.value = res
      })
    }

    const slots = {
      'layout-content': (): JSX.Element => {
        return (
          <Spin spinning={loading.value}>
            <Form ref={formRef} model={formState} layout="vertical" style={{ marginTop: '20px' }} rules={rules}>
              <Row >
                <Col span={12}>
                  <FormItem label="项目名称" name="projectName" >
                    <Input placeholder="请输入" v-model:value={formState.projectName} />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="项目类型" name="projectTypeId" >
                    <Select placeholder="选择类型" options={typeOptions.value} v-model:value={formState.projectTypeId} fieldNames={{ value: 'id', label: 'dataName' }}>
                    </Select>
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="业主单位" name="company">
                    <Input placeholder="请输入" v-model:value={formState.company} />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="项目周期" name="projectPeriod" >
                    <RangePicker style={{ width: '100%' }} format={'YYYY-MM-DD'} v-model:value={formState.projectPeriod} />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="项目所在地" name="disinfectionLocationName" >
                    {/* <Input placeholder="请输入" /> */}
                    <DMap address={dMapData.address} value={dMapData.value}
                      onUpdate:value={(val: string) => {
                        dMapData.value = val
                      } }
                      onAddressName={(val: string) => {
                        dMapData.address = val
                      } }
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="项目范围" name="disinfectionScope" >
                    <Button onClick={AMapClick} type='primary'>选择区域</Button>
                    <span style={{ color: '#888', marginLeft: '10px' }}>点击选择，弹出GPS地图弹窗，支持用户选择多个定位点，用于划定项目范围</span>
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="项目面积" name="disinfectionArea">
                    <Input placeholder="请输入" v-model:value={formState.disinfectionArea} />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="项目负责人" name="leaderId" >
                    {/* <Select
                      placeholder="请选择或输入名称搜索"
                      showSearch
                      v-model:value={formState.leaderId}
                      options={userOptions.value}
                      fieldNames={{ label: 'name', value: 'id' }}
                      filterOption={false}
                      onSearch={handleUserSearch}
                      onPopupScroll={handleUserPopupScroll}
                      loading={userLoading.value}
                      notFoundContent={userLoading.value ? <Spin size="small" /> : null}
                    /> */}
                    <UserSelectPage selectedValue={selectUserId.value?.toString() ?? ''} v-model:value={formState.leaderId}/>
                    
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="项目说明" name="projectDescription">
                    <Textarea placeholder="请输入" v-model:value={formState.description} />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label='文件' name='files'>
                    <FileUpload
                      sceneCode={GLOBAL_SCENE_CODE.disinfectiondatatype}
                      v-model:value={formState.files}
                      showText={true}
                      maxCount={1}
                      type='picture-card'
                      size={100}
                      customText='支持jpg,png,svg格式,单个附件最大支持100MB'
                      typeList={['.jpg', '.png', '.svg']}
                    />
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </Spin>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <div class={styles['footerButtons']}>
            <Button onClick={handleCancel} style={{ marginRight: '20px' }}>取消</Button>
            <Button type="primary" onClick={handleSave} loading={buttonLoading.value}>保存</Button>
          </div>
        )
      },
    }
    return (): JSX.Element => (
      <CubeLayout title={`${id ? '编辑' : '新增'}项目`} v-slots={slots} >
      </CubeLayout>
    )
  }
})
