import { defineComponent, ref, type VNode } from 'vue'
import { useRoute } from 'vue-router'
import './stall-detail.less'

export const StallDetail = defineComponent({
  setup: () => {
    const route = useRoute()
    const details = ref()
    details.value = JSON.parse(route.query.stallDetail as string)
    document.title = '档位详情'
    return (): VNode =>
      <div style={{ minHeight: '100vh', background: '#f3f7fa' }}>
        <div class='content'>
          <div class='card-item'><span>档位名称：</span><span>{details.value.name}</span></div>
          <div class='card-item'><span>档位编码：</span><span>{details.value.code}</span></div>
          <div class='card-item'><span>档主名称：</span><span>{details.value.masterName}</span></div>
          <div class='card-item'><span>档主联系方式：</span><span>{details.value.masterPhone}</span></div>
          <div class='card-item'><span>档位类型：</span><span>{details.value.typeName}</span></div>
          <div class='card-item'><span>所属部门：</span><span>{details.value.deptNames.length > 0 ? (details.value.deptNames as []).join('/') : '--'}</span></div>
          <div class='card-item'><span>所属区域：</span><span>{details.value.areaNames.length > 0 ? (details.value.areaNames as []).join('/') : '--'}</span></div>
          <div class='card-item'><span>具体地址：</span><span>{details.value.location}</span></div>
          <div class='card-item'><span>建筑面积：</span><span>{details.value.builtUpArea}㎡</span></div>
          <div class='card-item'><span>实用面积：</span><span>{details.value.practicalArea}㎡</span></div>
          <div class='file'>附件：</div>
          {details.value.files.length > 0
            ? (details.value.files as never[]).map((item: { id: string | number | symbol ;path: string; }) =>
              <img src={item.path} alt='' key={item.id} width={150} height={120} style='margin:5px 5px 0px 0px' />)
            : null}
        </div>
      </div>
  }
})
