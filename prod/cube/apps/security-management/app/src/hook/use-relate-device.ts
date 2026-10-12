import { cubeDeviceCenter } from '@/api/service'
import { ref, type Ref } from 'vue'

interface Device {
  deviceName: string;
  id: string;
  deviceId: string;
}
interface UseRelateDevice {
  handleRelateDevice: (values: Device[], id: string) => Promise<void>;
  openDeviceModal: (id: string) => Promise<void>;
  deviceModalTableRef: Ref<{ openModal: () => void; } | undefined>;
  deviceList: Ref<{ name: string; id: string; }[]>;
}
export const useRelateDevice = (): UseRelateDevice => {

  const deviceModalTableRef = ref<{ openModal: () => void; }>()
  const deviceList = ref<{ name: string; id: string; }[]>([])
  const handleRelateDevice = async (values: Device[], id: string): Promise<void> => {
    try {
      const params = {
        id: id || '',
        deviceFilterParam: {
          matchedDeviceIds: values.map(e => e.id) || [],
        }
      }
      await cubeDeviceCenter.deviceGroupsRefDevice(params)
    } catch {
    }
  }
  const getGroupDevice = async (id: string): Promise<void>=>{
    const params = {
      pageSize: 1000,
      pageNumber: 1,
      id
    }
    const { records } = await cubeDeviceCenter.deviceGroupDevices(params)
    deviceList.value = records?.map(e => {
      return { name: e.name, id: e.id }
    })
  }
  const openDeviceModal = async (id: string): Promise<void> => {
    await getGroupDevice(id)
    deviceModalTableRef.value?.openModal()
  }

  return {
    handleRelateDevice,
    openDeviceModal,
    deviceList,
    deviceModalTableRef
  }
}
