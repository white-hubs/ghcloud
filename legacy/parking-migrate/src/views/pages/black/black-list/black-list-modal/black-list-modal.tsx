import { defineComponent, reactive, ref } from 'vue'
import { Form, FormItem, Input, Textarea, message, Select, type FormExpose } from '@ghcloud/cube-ui'
import { useCubeModal } from '@ghcloud/cube-app-design'
import { cubeParkingLotService } from "@/api/service";
import type { IllegalParkingBlacklistVO, ParkingInfoVO, VehicleInfoVO } from "@ghcloud/cube-parking-lot-service/src/type";
import styles from './black-list-modal.module.less'
import debounce from 'lodash/debounce';

export const BlacklistModal = defineComponent({
  props: {
    title: {
      type: String,
      default: '黑名单'
    }
  },
  emits: ['enter', 'cancel'],
  setup (props, { emit, expose }) {
    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      id: string | number | undefined;
      parkingInfoCode: string | undefined;
      plateNumber: string | undefined;
      plateColor: string | undefined;
      owner: string | undefined;
      phone: string | undefined;
      reason: string | undefined;
    }>({
      id: undefined,
      parkingInfoCode: undefined,
      plateNumber: undefined,
      plateColor: undefined,
      owner: undefined,
      phone: undefined,
      reason: undefined
    })

    const parkingLotOptions = ref<{ label: string; value: string }[]>([])
    const parkingLotLoading = ref(false)

    const fetchParkingLotList = async () => {
      parkingLotLoading.value = true
      try {
        const res = await cubeParkingLotService.getParkingLotList({})
        parkingLotOptions.value = (res ?? []).map((item: ParkingInfoVO) => ({
          label: item.name ?? '',
          value: item.code ?? ''
        }))
      } catch (error) {
      } finally {
        parkingLotLoading.value = false
      }
    }

    const options = ref<{ label: string; value: string; record?: any }[]>([])
    const loading = ref(false)
    const pagination = reactive({
      pageNumber: 1,
      pageSize: 20,
      total: 0,
      keyword: ''
    })

    const fetchVehicle = async (keyword: string, isLoadMore = false) => {
      if (!keyword && !isLoadMore) {
        options.value = [];
        return;
      }
      
      if (!isLoadMore) {
        pagination.pageNumber = 1;
        pagination.keyword = keyword;
        options.value = [];
      }
    
      loading.value = true;
      try {
        const res = await cubeParkingLotService.getVehiclePageList({
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
          vehicleNo: pagination.keyword
        });
        
        let newOptions: { label: string; value: string; record?: Record<string, unknown> }[] = [];
        if (res && res.records) {
          pagination.total = res.total;
          newOptions = res.records.map((item: any) => ({
            label: `${item.vehicleNo} - ${item.customerName}`, 
            value: item.vehicleNo,
            record: item
          }));
        }

        if (!isLoadMore && keyword && !newOptions.some(opt => opt.value === keyword)) {
           newOptions.unshift({ label: keyword, value: keyword });
        }
          
        if (isLoadMore) {
          options.value = [...options.value, ...newOptions];
        } else {
          options.value = newOptions;
        }
      } catch (error) {
        if (!isLoadMore && keyword) {
             options.value = [{ label: keyword, value: keyword }];
        }
      } finally {
        loading.value = false;
      }
    };
    
    const debouncedFetch = debounce((val: string) => {
      fetchVehicle(val, false);
    }, 800);
    
    const handleSearch = (val: string) => {
      debouncedFetch(val);
    };
    
    const handlePopupScroll = (e) => {
      const { target } = e;
      if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 10) {
        if (options.value.length < pagination.total && !loading.value) {
          pagination.pageNumber++;
          fetchVehicle(pagination.keyword, true);
        }
      }
    };

    const handlePlateChange = (val: string | undefined, option: { record?: VehicleInfoVO; }) => {
      formState.plateNumber = option.record?.vehicleNo ?? val
      if (option && option.record) {
        formState.owner = option.record.customerName
        formState.phone = option.record.customerMobile
        formState.plateColor = option.record.vehicleNoColor
      }
    }

    const modalRules = {
      parkingInfoCode: [{ required: true, message: '请选择停车场' }],
      plateNumber: [
        { required: true, message: '请输入车牌号' },
      ],
      plateColor: [{ required: true, message: '请选择车牌颜色' }],
      owner: [{ required: true, message: '请输入车主姓名', trigger: 'blur' }],
      phone: [
        { required: true, message: '请输入联系方式' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
      ]
    }

    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        try {
          if (formState.id) return
          modalApi.setState({ confirmLoading: true })
          await formRenderRef.value?.validate()
          const params = {
            parkingLot: formState.parkingInfoCode ?? '',
            plateNumber: formState.plateNumber ?? '',
            plateColor: formState.plateColor ?? '',
            owner: formState.owner ?? '',
            phone: formState.phone ?? '',
            reason: formState.reason ?? ''
          }
          await cubeParkingLotService.createParkingBlack(params)
          message.success('操作成功')
          emit('enter')
          modalApi.close()
        } catch (error) {
          const errorFields = (error as { errorFields: unknown; })?.errorFields
          const showError = !errorFields && !(error instanceof Error && error.message.includes('校验失败'))
          showError && message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
        } finally {
          modalApi.setState({ confirmLoading: false })
        }
      },
      onCancel: () => {
        formRenderRef.value?.resetFields()
        emit('cancel')
        modalApi.close()
      }
    })
    const openModal = (record?: IllegalParkingBlacklistVO): void => {
      modalApi.open()
      if (!record) {
        fetchParkingLotList()
      }
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined
      }
      if (record) {
        modalApi.setState({ title: `${props.title}详情` })
        formState.id = record?.id
        formState.parkingInfoCode = (record as any)?.parkingInfoCode
        formState.plateNumber = record?.plateNumber
        formState.plateColor = record?.plateColor as string | undefined
        formState.owner = record?.owner
        formState.phone = record?.phone
        formState.reason = record?.reason
        if (record?.plateNumber) {
          options.value = [{ label: record.plateNumber, value: record.plateNumber }]
        }
      } else {
        modalApi.setState({ title: `新增${props.title}` })
        options.value = []
      }
    }

    expose({
      openModal
    })

    const plateColorOptions = [
      { label: '蓝牌', value: 'BLUE' },
      { label: '黄牌', value: 'YELLOW' },
      { label: '绿牌', value: 'GREEN' },
      { label: '黑牌', value: 'BLACK' },
      { label: '白牌', value: 'WHITE' },
      { label: '未知', value: 'UNKNOWN' },
    ]

    const modalSlots = {
      default: () => {
        return (
          <Form model={formState} ref={formRenderRef} rules={modalRules} labelCol={{ style: { width: '110px !important' } }}>
            <FormItem label='停车场' name='parkingInfoCode'>
              <Select
                v-model:value={formState.parkingInfoCode}
                placeholder='请选择停车场'
                options={parkingLotOptions.value}
                disabled={!!formState.id}
                allowClear
                showSearch
                filterOption={(input: string, option: { label: string; value: string }) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </FormItem>
            <FormItem label='车牌号' name='plateNumber'>
              <Select
                v-model:value={formState.plateNumber}
                placeholder='请输入车牌号'
                showSearch
                showArrow={false}
                filterOption={false}
                onSearch={handleSearch}
                onChange={handlePlateChange}
                onPopupScroll={handlePopupScroll}
                options={options.value}
                allowClear
                optionLabelProp="value"
              />
            </FormItem>
            <FormItem label='车牌颜色' name='plateColor'>
              <Select
                v-model:value={formState.plateColor}
                placeholder='请选择车牌颜色'
                options={plateColorOptions}
                allowClear
              />
            </FormItem>
            <FormItem label='车主姓名' name='owner'>
              <Input v-model:value={formState.owner} placeholder='请输入车主姓名' maxlength={20} />
            </FormItem>
            <FormItem label='联系方式' name='phone'>
              <Input v-model:value={formState.phone} placeholder='请输入联系方式' />
            </FormItem>
            <FormItem label='纳入黑名单原因' name='reason'>
              <Textarea v-model:value={formState.reason} placeholder='请输入纳入黑名单原因' maxlength={200} showCount class={styles.textarea} />
            </FormItem>
          </Form>
        )
      }
    }
    
    return () => <CubeModal v-slots={modalSlots} />
  }
})
