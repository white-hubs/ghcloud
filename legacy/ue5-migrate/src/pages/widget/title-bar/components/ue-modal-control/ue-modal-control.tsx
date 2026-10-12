import { defineComponent, onMounted, ref } from 'vue';
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import styles from "./ue-modal-control.module.less";
import { ueSdk } from "@/pages/model-sdk/ue-sdk";
import { useStateStore } from '@/pages/state/use-state-store'

/** 驾驶模式 */
export const UeModalControl =  defineComponent({
  setup() {
    const initStatus = ref(false);
    const { globalState } = useStateStore()

    onMounted(() => {
      
      setTimeout(() => {
        initStatus.value = true;
      }, 0);
    });

    const up = () =>{
      ueSdk.ueClient.send('floorUp')
    } 
    const down = () => {
      ueSdk.ueClient.send('floorDown')
    }

    return ()=>(
      <div 
        class={styles['ue-modal-control']}
      >
        <a-button
          class={styles['item']}
          onClick={up}
        >
          <UpOutlined />
        </a-button>
        <a-button
          class={styles['item']}
          onClick={down}
        >
          <DownOutlined />
        </a-button>
      </div>
    );
  }
});