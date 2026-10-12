import { computed, defineComponent } from 'vue'
interface Props {
  active?: boolean;
}

export const WorkbenchIcon = defineComponent({
  props: ['active'],
  setup (props: Props) {
    const color = computed(()=>{
      return props.active ? 'var(--cube-theme-var--primary-color)' : '#808AA0'
    })

    return (): JSX.Element => (
      <svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g id="AI助理" transform="translate(-426, -540)" stroke={color.value} stroke-width="1.4">
            <g id="编组-7" transform="translate(400, 180)">
              <g id="编组-2" transform="translate(0, 50)">
                <g id="编组-9备份-2" transform="translate(15, 309.2234)">
                  <g id="编组-19" transform="translate(11, 0)">
                    <rect id="矩形" x="1.7" y="12.4765752" width="6.6" height="6.6" rx="2"></rect>
                    <rect id="矩形备份-16" x="1.7" y="2.47657516" width="6.6" height="6.6" rx="2"></rect>
                    <path d="M17.2269271,2.40505338 C17.5859122,2.40505338 17.9109122,2.55056083 18.146166,2.78581456 C18.3814197,3.02106829 18.5269271,3.34606829 18.5269271,3.70505338 L18.5269271,7.93777936 C18.5269271,8.29676445 18.3814197,8.62176445 18.146166,8.85701817 C17.9109122,9.0922719 17.5859122,9.23777936 17.2269271,9.23777936 L12.9942012,9.23777936 C12.6352161,9.23777936 12.3102161,9.0922719 12.0749623,8.85701817 C11.8397086,8.62176445 11.6942012,8.29676445 11.6942012,7.93777936 L11.6942012,3.70505338 C11.6942012,3.34606829 11.8397086,3.02106829 12.0749623,2.78581456 C12.3102161,2.55056083 12.6352161,2.40505338 12.9942012,2.40505338 Z" id="矩形备份-17" transform="translate(15.1106, 5.8214) rotate(-315) translate(-15.1106, -5.8214)"></path>
                    <rect id="矩形备份-15" x="11.7" y="12.4765752" width="6.6" height="6.6" rx="2"></rect>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    )
  }
})