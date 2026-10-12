import { defineComponent, ref, type PropType } from 'vue';
import { Button, Select } from '@ghcloud/cube-ui';
import { DeviceModalTable } from "@ghcloud/generic-component";

export default defineComponent({
    name: 'DeviceSelect',
    props: {
        value: {
            type: Array as PropType<string[]>,
            default: () => []
        },
        placeholder: {
            type: String,
            default: '请选择设备'
        }
    },
    emits: ['update:value'],
    setup(props, { emit }) {
        const deviceList = ref<{ deviceId: string; deviceName: string }[]>([]);
        const modalRef = ref();

        const openModal = () => {
            modalRef.value?.openModal();
        };

        const handleOk = (values: { deviceName: string; deviceId: string }[]) => {
            deviceList.value = values.map(e => ({ deviceName: e.deviceName, deviceId: e.deviceId }));
            const ids = values.map(e => e.deviceId);
            emit('update:value', ids);
        };

        const handleChange = (val: string[]) => {
             // val is the new list of IDs
             // Filter deviceList to keep only those present in val
             deviceList.value = deviceList.value.filter(d => val.includes(d.deviceId));
             emit('update:value', val);
        };

        return () => (
            <div style={{ display: 'flex'}}>
                <Select
                    style={{ minWidth: "120px", flex: 1 }}
                    open={false}
                    showArrow={true}
                    mode="multiple"
                    options={deviceList.value}
                    value={props.value}
                    placeholder={props.placeholder}
                    fieldNames={{ label: "deviceName", value: "deviceId" }}
                    maxTagCount={1}
                    onChange={handleChange}
                />
                <Button type="primary" onClick={openModal}>
                    选择设备
                </Button>
                <DeviceModalTable
                    ref={modalRef}
                    searchParams={{ applicationCode: __ENV__.applicationCode }}
                    title="选择设备"
                    onOk={handleOk}
                />
            </div>
        );
    }
});
