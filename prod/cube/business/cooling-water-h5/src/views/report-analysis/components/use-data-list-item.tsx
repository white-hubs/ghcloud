import { defineComponent } from 'vue'

export interface UseDataListItemProps {
  field: string;
  iconBackgroud: string;
  icon: string;
  text: string;
  value: string | number;
  /** 环比 */
  rateChain: number;
  /** 同比 */
  rateYear: number;
}

/** 冷冻水使用数据 项 */
export const UseDataListItem = defineComponent({
  props: ['iconBackgroud', 'icon', 'text', 'value', 'rateChain', 'rateYear', 'field'],
  setup: (props: UseDataListItemProps) => {
    return () =>
      <div class='use-data-list-item'>
        <div class='icon-container' style={{ background: props.iconBackgroud }}>
          <img src={props.icon} />
        </div>
        <div class='list-text'>{props.text}</div>
        <div class='list-value'>
          <span class='value'>{props.value}</span>
          <div class='rate'>
            <div class='rate-chain'>
              <span class='rate-text'>环比</span>
              <div class='rate-value'>
                {props.rateChain !== 0 && <img src={props.rateChain > 0 ? './img/down.png' : './img/up.png'} />}
                {props.rateChain === 0 && <div style={{ width: '10px', height: '100%' }} />}
                <span class={['rate-number', props.rateChain > 0 && 'rate-red', props.rateChain < 0 && 'rate-green']}>{Math.abs(props.rateChain)}%</span>
              </div>
            </div>
            <div class='rate-year'>
              <span class='rate-text'>同比</span>
              <div class='rate-value'>
                {props.rateYear !== 0 && <img src={props.rateYear > 0 ? './img/down.png' : './img/up.png'} />}
                {props.rateYear === 0 && <div style={{ width: '10px', height: '100%' }} />}
                <span class={['rate-number', props.rateYear > 0 && 'rate-red', props.rateYear < 0 && 'rate-green']}>{Math.abs(props.rateYear)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  }
})
