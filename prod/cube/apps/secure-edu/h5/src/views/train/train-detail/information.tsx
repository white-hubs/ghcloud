import { defineComponent, type PropType } from 'vue'
import './train-detail.less'
import { CultivateMode, type TrainType } from '../type'
import dayjs from 'dayjs'
// import { useRouter } from 'vue-router'

/** 培训签到页面 */
export const Information = defineComponent({
  props: {
    detail: {
      type: Object as PropType<TrainType | undefined>,
      default: () => {}
    }
  },
  setup: (props) => {
    return (): JSX.Element =>
      <>
        <div class='info-tab'>
          <div class='info-tab-item'>
            <label>培训主题：</label>
            <span>{props.detail?.themeName}</span>
          </div>
          <div class='info-tab-item'>
            <label>培训类型：</label>
            <span>{props.detail?.cultivateTargetName}</span>
          </div>
          <div class='info-tab-item'>
            <label>截止时间：</label>
            <span>{dayjs(props.detail?.cultivateEndTime).format('YYYY-MM-DD HH:mm')}</span>
          </div>
          <div class='info-tab-item'>
            <label>培训时长：</label>
            <span>{(Number(props.detail?.cultivateEndTime) - Number(props.detail?.cultivateStartTime)) / 1000 / 60}分钟</span>
          </div>
          <div class='info-tab-item'>
            <label>培训形式：</label>
            <span>{CultivateMode.get(props.detail?.cultivateMode ?? '--')}</span>
          </div>
          <div class='info-tab-item'>
            <label>培训地点：</label>
            <span>{props.detail?.cultivateAddress || '--'}</span>
          </div>
          <div class='info-tab-item'>
            <label>负责人：</label>
            <span>{props.detail?.chargeUserName || '--'}</span>
          </div>
          <div class='info-tab-item'>
            <label>主讲人：</label>
            <span>{props.detail?.speaker || '--'}</span>
          </div>
          <div class='info-tab-item'>
            <label>培训人数：</label>
            <span>{props.detail?.cultivateUserNumber || '--'}</span>
          </div>
          <div class='info-tab-item'>
            <label style={{ minWidth: '80px' }}>培训内容：</label>
            <span>{props.detail?.cultivateContent || '--'}</span>
          </div>
        </div>
      </>
  }
})
