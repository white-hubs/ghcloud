import styles from "./equipmentInfo.module.less";
import { defineComponent } from "vue";
import { getAssetsImage } from '@/infrastructure/utils/getImage';

export const EquipmentInfo = defineComponent({
  name: "EquipmentInfo",
  props: {

    equipmentInfo: { type: Object, required: true }
  },
  setup(props, ctx) {

    interface info {
        id: string,
        name: string,
        modelName: string,
        areaName: string,
        deviceStatus: string,
        communicationStatus: string,
        images: string[]
    }
    interface Props {
        equipmentInfo: info,
    }
    const statusList = {
        'ALARM': '#F14545',
        'TROUBLE': '#FFC700',
        'OFFLINE': '#74AEE7',
        'ONLINE': '#00F27B',
        'NORMAL': '#00F27B',
    }
    const attributeData = []
    return (): JSX.Element => (
      <>
<div class="Box">
        <div class="equipmentStatus">
          <div class="statusBar">
            <span>              设备状态</span>
            <span>              {equipmentInfo.communicationStatus}</span>
          </div>
        </div>
        {props.equipmentInfo.images.length > 0 && (
          <img style="width: 332px;height: 142px;" src={props.equipmentInfo.images[0]}></img>
        )}
        <img style="width: 160px;height: 142px;margin-left: 90px;" src={getAssetsImage('noData.png')}></img>
        <div style="color: #D0DEEE;text-align: center;">          暂无图片</div>
        <div class="equipmentInfoRow">
          <span>            设备名称：</span>
          <span>            {props.equipmentInfo.name}</span>
        </div>
        <div class="equipmentInfoRow">
          <span>            设备型号：</span>
          <span>            {props.equipmentInfo.modelName}</span>
        </div>
        <div class="equipmentInfoRow">
          <span>            所属区域：</span>
          <span>            {props.equipmentInfo.areaName}</span>
        </div>
      </div>
      </>
    );
  },
});

export default EquipmentInfo;
