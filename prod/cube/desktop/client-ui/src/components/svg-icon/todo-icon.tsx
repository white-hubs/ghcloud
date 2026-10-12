import { computed, defineComponent } from 'vue'
interface Props {
  active?: boolean;
}

export const ToDoIcon = defineComponent({
  props: ['active'],
  setup (props: Props) {
    const color = computed(()=>{
      return props.active ? 'var(--cube-theme-var--primary-color)' : '#808AA0'
    })

    return (): JSX.Element => (
      <svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g id="AI助理" transform="translate(-426, -398)">
            <g id="编组-7" transform="translate(400, 180)">
              <g id="编组-2" transform="translate(0, 50)">
                <g id="编组-8" transform="translate(22, 168)">
                  <g id="编组-18" transform="translate(4, 0)">
                    <rect id="矩形" stroke={color.value} stroke-width="1.5" x="1.75" y="1.75" width="16.5" height="16.5" rx="4"></rect>
                    <path d="M6.5,11 C7.88071187,11 9,12.1192881 9,13.5 C9,14.8807119 7.88071187,16 6.5,16 C5.11928813,16 4,14.8807119 4,13.5 C4,12.1192881 5.11928813,11 6.5,11 Z M6.5,12.3 C5.8372583,12.3 5.3,12.8372583 5.3,13.5 C5.3,14.1627417 5.8372583,14.7 6.5,14.7 C7.1627417,14.7 7.7,14.1627417 7.7,13.5 C7.7,12.8372583 7.1627417,12.3 6.5,12.3 Z" id="椭圆形" fill={color.value} fill-rule="nonzero"></path>
                    <path d="M8.892429,5.19579219 L6.50359224,7.8544391 L5.10099567,6.4169149 C4.86889985,6.18371247 4.47280678,6.16345191 4.21322148,6.37150435 C3.95363618,6.57955679 3.92746303,6.9382553 4.15455889,7.1754651 L5.55652366,8.61298931 C5.79612154,8.86003422 6.14189948,9.00114232 6.50485584,9 C6.88464568,9.00117028 7.24445984,8.84594465 7.48288263,8.57806737 L9.8717194,5.91827548 C10.0772938,5.67246956 10.0310272,5.32327998 9.76708342,5.12855229 C9.50313966,4.9338246 9.11639629,4.96355587 8.892429,5.19579219 Z" id="路径" fill={color.value}></path>
                    <rect id="矩形" fill={color.value} x="11" y="5" width="5" height="1.3" rx="0.65"></rect>
                    <rect id="矩形备份-13" fill={color.value} x="11" y="14" width="5" height="1.3" rx="0.65"></rect>
                    <rect id="矩形备份-14" fill={color.value} x="11" y="9.5" width="5" height="1.3" rx="0.65"></rect>
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