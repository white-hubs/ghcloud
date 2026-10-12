import { defineComponent, reactive, ref } from 'vue'
import { Button, Field, Form, Icon, showNotify, showLoadingToast, type FormInstance } from 'vant'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import styles from './add-blacklist.module.less'
import { useGlobalRouter } from '@/hook/use-global-router'
import { cubeParkingLotService, cubeOcrService } from '@/api/server'
import debounce from 'lodash/debounce';
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { GLOBAL_SCENE_CODE, type FileState } from '@ghcloud/cube-file-service'
import { OcrFileProvideType, VehicleOcrManufacture } from "@ghcloud/cube-ocr-service"


export const AddBlacklist = defineComponent({
  name: 'AddBlacklist',
  setup () {
    const { router } = useGlobalRouter()
    const formRef = ref<FormInstance>()
    const loading = ref(false)
    
    const formState = reactive({
      plateNumber: '',
      owner: '',
      phone: '',
      reason: ''
    })

    const options = ref<{ label: string; value: string; record?: any }[]>([])
    const showSuggestions = ref(false)
    const searchLoading = ref(false)
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

        searchLoading.value = true;
        try {
            const res = await cubeParkingLotService.getVehiclePageList({
                pageNumber: pagination.pageNumber,
                pageSize: pagination.pageSize,
                vehicleNo: pagination.keyword
            });

            let newOptions: { label: string; value: string; record?: any }[] = [];
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
            searchLoading.value = false;
        }
    };

    const debouncedFetch = debounce((val: string) => {
        fetchVehicle(val, false);
    }, 800);

    const onInput = (val: string) => {
        formState.plateNumber = val;
        showSuggestions.value = true;
        debouncedFetch(val);
    }

    const handleOcr = async (file: FileState) => {
        const toast = showLoadingToast({
            message: '识别中...',
            forbidClick: true,
            duration: 0,
        })
        try {
            const imgUrl = file.path?.startsWith('http') ? file.path : `${window.location.origin}${file.path || ''}`
            
            const res = await cubeOcrService.ocrVehicleNumber({
                vehicleOcrManufacture: VehicleOcrManufacture.ALI,
                ocrFileProvideType: OcrFileProvideType.URL,
                imgUrl: imgUrl,
                imgFileVO: file
            })
            if (res?.vehicleNumber) {
                onInput(res.vehicleNumber);
                showNotify({ type: 'success', message: '识别成功' })
            } else {
                showNotify({ type: 'warning', message: '未识别到车牌' })
            }
        } catch (error) {
            const errorMessage = (error as any)?.toJSON?.()?.errorMessage || (error as Error).message || '识别失败'
            showNotify({ type: 'warning', message: errorMessage })
        } finally {
            toast.close()
        }
    }

    const handleUpload = async () => {
        try {
            const result = await cubeAppService.uploadFile('1', {
                sceneCode: GLOBAL_SCENE_CODE.parkingVehicle
            })
            if (result && result.length > 0) {
                handleOcr(result[0])
            }
        } catch (error) {
             const errorMessage = (error as any)?.toJSON?.()?.errorMessage || (error as Error).message || '上传失败'
             showNotify({ type: 'danger', message: errorMessage })
        }
    }

    const onFocus = () => {
        if (formState.plateNumber) {
            showSuggestions.value = true;
            if (options.value.length === 0) {
                debouncedFetch(formState.plateNumber);
            }
        }
    }

    const onBlur = () => {
        setTimeout(() => {
            showSuggestions.value = false;
        }, 200);
    }

    const selectItem = (item: any) => {
        formState.plateNumber = item.value;
        formState.owner = item.record?.customerName || '';
        formState.phone = item.record?.customerMobile || item.record?.phone || item.record?.linkPhone || '';
        showSuggestions.value = false;
    }

    const onScroll = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
            if (options.value.length < pagination.total && !searchLoading.value) {
                pagination.pageNumber++;
                fetchVehicle(pagination.keyword, true);
            }
        }
    };

    const rules = {
      plateNumber: [
        { required: true, message: '请输入车牌号' },
      ],
      owner: [
        { required: true, message: '请输入车主' }
      ],
      phone: [
        { required: true, message: '请输入联系方式' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
      ]
    }

    const onSubmit = async () => {
      try {
        await formRef.value?.validate()
        loading.value = true
        const params = {
          plateNumber: formState.plateNumber,
          owner: formState.owner,
          phone: formState.phone,
          reason: formState.reason
        }
        await cubeParkingLotService.createParkingBlack(params)
        showNotify({ type: 'success', message: '添加成功' })
        setTimeout(() => {
            router.back()
        }, 1000)
    } catch (error) {
      const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
      showNotify({ type: 'danger', message: errorMessage || '请求失败' })
    } finally {
      setTimeout(() => {
        loading.value = false
      }, 800)
    }
    }

    return () => (
      <div class={styles.container}>
        <CubeNavBar title="新增黑名单" showBack />
        <div class={styles.content}>
            <Form ref={formRef} class={styles.form}>
                <div class={styles.plateNumberContainer}>
                    <Field
                        modelValue={formState.plateNumber}
                        onUpdate:modelValue={onInput}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        name="plateNumber"
                        label="车牌号"
                        placeholder="请输入或拍照识别录入车牌号"
                        required
                        rules={rules.plateNumber}
                        label-align="top"
                        right-icon="photograph"
                        onClickRightIcon={handleUpload}
                        clearable
                    />
                    {showSuggestions.value && options.value.length > 0 && (
                        <div class={styles.suggestionsList} onScroll={onScroll}>
                            {options.value.map((item, index) => (
                                <div
                                    key={item.value + index}
                                    class={styles.suggestionItem}
                                    onMousedown={(e) => { e.preventDefault(); selectItem(item); }}
                                >
                                    {item.label}
                                </div>
                            ))}
                            {searchLoading.value && <div class={styles.loadingItem}>加载中...</div>}
                        </div>
                    )}
                </div>
                <Field
                    v-model={formState.owner}
                    name="owner"
                    label="车主"
                    placeholder="请输入车主姓名"
                    required
                    rules={rules.owner}
                    clearable
                    label-align="top"
                />
                <Field
                    v-model={formState.phone}
                    name="phone"
                    label="联系方式"
                    placeholder="请输入联系方式"
                    required
                    rules={rules.phone}
                    label-align="top"
                    clearable
                />
                <Field
                    v-model={formState.reason}
                    name="reason"
                    label="加入黑名单原因"
                    label-align="top"
                >
                    {{
                        input: () => (
                            <textarea
                                v-model={formState.reason}
                                placeholder="请输入"
                                maxlength={200}
                            />
                        )
                    }}
                </Field>
            </Form>
        </div>
        <div class={styles.footer}>
            <Button type="primary" block loading={loading.value} onClick={onSubmit}>
                提交
            </Button>
        </div>
      </div>
    )
  }
})
