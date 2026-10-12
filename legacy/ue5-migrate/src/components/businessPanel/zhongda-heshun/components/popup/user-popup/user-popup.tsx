import { computed, defineComponent, onMounted, ref } from 'vue'
import styles from './user-popup.module.less'
import type { FileVO, UserInfo } from '@ghcloud/cube-ouaa-service'
import { Avatar, message, Image } from 'ant-design-vue'
import { CallMediaType } from '@ghcloud/cube-rtc/src/data/call-define'
import { cubeCommunicateService } from '@/api/service'
import { CallManager } from '@ghcloud/cube-rtc'
import { createCallInterface } from '@/pages/utils/communication'
import { getAddress } from './address-map'
import { EyeOutlined } from '@ant-design/icons-vue'

interface UserPopupProps {
  userInfo: UserInfo;
  position?: {
    lng: number;
    lat: number;
  };
}
type UserInfoVo = UserInfo & {
  position: string;
  photo?: FileVO[];
}
function toDMS (coord, isLatitude): string {
  const absCoord = Math.abs(coord);
  const degrees = Math.floor(absCoord);
  const minutesFloat = (absCoord - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;

  // 确定方向（N/S/E/W）
  const direction = isLatitude
    ? (coord >= 0 ? '北纬' : '南纬')
    : (coord >= 0 ? '东经' : '西经');

  return `${direction} ${degrees}°${minutes}′${seconds.toFixed(2)}″`;
}

/** 人员弹层 */
export const UserPopup = defineComponent({
  emits: ['close'],
  props: {
    userInfo: {
      type: Object as () => UserInfo,
      required: true
    },
    position: {
      type: Object as () => {
        lng: number;
        lat: number;
      },
      default: () => ({
        lng: 0,
        lat: 0
      })
    },
    address: {
      type: String,
      default: ''
    }
  },
  setup (props: UserPopupProps, { emit }) {
    const AudioIcon = (): JSX.Element=>{
      return <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g id="中大合顺-总览" transform="translate(-1816, -823)" fill="#fff" fill-rule="nonzero">
            <g id="园区介绍备份-6" transform="translate(1540, 580)">
              <g id="编组-2备份-6" transform="translate(10, 216)">
                <g id="编组-3" transform="translate(260, 21)">
                  <g id="编组-20" transform="translate(6, 6)">
                    <path d="M8,10.88 L8,10.88 C9.85274909,10.88 11.3686347,9.35 11.3686347,7.48 L11.3686347,3.4 C11.3686347,1.53 9.85274909,4.50306459e-13 8,4.50306459e-13 L8,4.50306459e-13 C6.14725091,4.50306459e-13 4.6313653,1.53 4.6313653,3.4 L4.6313653,7.48 C4.6313653,9.35 6.14725091,10.88 8,10.88 Z M13.991959,8.4235 C14.0488047,8.051625 13.7982625,7.70525 13.4298181,7.647875 C13.0613736,7.592625 12.718194,7.8455 12.6613483,8.21525 C12.3076416,10.51025 10.3054094,12.24 8,12.24 C5.69459062,12.24 3.69025298,10.508125 3.33865173,8.213125 C3.28180602,7.84125 2.93652096,7.588375 2.57018194,7.64575 C2.20173752,7.703125 1.95119531,8.0495 2.00804102,8.421375 C2.43333115,11.1945 4.61873292,13.262125 7.32627306,13.559625 L7.32627306,14.64 L5.30509224,14.64 C4.93243702,14.64 4.6313653,14.943875 4.6313653,15.32 C4.6313653,15.696125 4.93243702,16 5.30509224,16 L10.6949078,16 C11.067563,16 11.3686347,15.696125 11.3686347,15.32 C11.3686347,14.943875 11.067563,14.64 10.6949078,14.64 L8.67372694,14.64 L8.67372694,13.559625 C11.3791617,13.262125 13.5666688,11.196625 13.991959,8.4235 Z" id="形状"></path>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    }

    const VideoIcon = (): JSX.Element=>{
      return <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g id="中大合顺-总览" transform="translate(-1852, -737)" fill="#fff" fill-rule="nonzero">
            <g id="园区介绍备份-6" transform="translate(1540, 580)">
              <g id="编组-2备份-3" transform="translate(10, 130)">
                <g id="编组-5" transform="translate(296, 21)">
                  <g id="编组" transform="translate(6, 6)">
                    <path d="M11.3056604,6.10294118 C11.3056604,6.15196078 11.2528302,6.2377451 11.1471698,6.36029412 C11.0415094,6.48284314 10.9283019,6.62745098 10.8075472,6.79411765 C10.6867925,6.96078431 10.5735849,7.14215686 10.4679245,7.33823529 C10.3622642,7.53431373 10.309434,7.73529412 10.309434,7.94117647 C10.309434,8.14705882 10.3622642,8.34558824 10.4679245,8.53676471 C10.5735849,8.72794118 10.6867925,8.90196078 10.8075472,9.05882353 C10.9283019,9.21568627 11.0415094,9.34558824 11.1471698,9.44852941 C11.2528302,9.55147059 11.3056604,9.61764706 11.3056604,9.64705882 L11.3056604,11.1911765 C11.3056604,11.3578431 11.2427673,11.5465686 11.1169811,11.7573529 C10.991195,11.9681373 10.8352201,12.1666667 10.6490566,12.3529412 C10.4628931,12.5392157 10.2566038,12.6936275 10.0301887,12.8161765 C9.80377358,12.9387255 9.58993711,13 9.38867925,13 L1.88679245,13 C1.61509434,13 1.36603774,12.9534314 1.13962264,12.8602941 C0.913207547,12.7671569 0.714465409,12.6372549 0.543396226,12.4705882 C0.372327044,12.3039216 0.238993711,12.1078431 0.143396226,11.8823529 C0.0477987421,11.6568627 0,11.4117647 0,11.1470588 L0,4.80882353 C0,4.6127451 0.0452830189,4.40931373 0.135849057,4.19852941 C0.226415094,3.9877451 0.354716981,3.79411765 0.520754717,3.61764706 C0.686792453,3.44117647 0.883018868,3.29411765 1.10943396,3.17647059 C1.33584906,3.05882353 1.58490566,3 1.85660377,3 L9.35849057,3 C9.63018868,3 9.88427673,3.04656863 10.1207547,3.13970588 C10.3572327,3.23284314 10.563522,3.36029412 10.7396226,3.52205882 C10.9157233,3.68382353 11.0540881,3.87745098 11.154717,4.10294118 C11.2553459,4.32843137 11.3056604,4.56862745 11.3056604,4.82352941 L11.3056604,6.10294118 L11.3056604,6.10294118 Z M16,4.72058824 L16,11.4411765 C16,11.6568627 15.9421384,11.8480392 15.8264151,12.0147059 C15.7106918,12.1813725 15.5371069,12.2647059 15.3056604,12.2647059 C15.2251572,12.2647059 15.1220126,12.2352941 14.9962264,12.1764706 C14.8704403,12.1176471 14.7446541,12.0490196 14.6188679,11.9705882 C14.4930818,11.8921569 14.3748428,11.8137255 14.2641509,11.7352941 C14.1534591,11.6568627 14.072956,11.5931373 14.0226415,11.5441176 C13.8918239,11.4362745 13.6930818,11.25 13.4264151,10.9852941 C13.1597484,10.7205882 12.890566,10.4215686 12.6188679,10.0882353 C12.3471698,9.75490196 12.1081761,9.41176471 11.9018868,9.05882353 C11.6955975,8.70588235 11.5924528,8.38235294 11.5924528,8.08823529 C11.5924528,7.79411765 11.7031447,7.45833333 11.9245283,7.08088235 C12.1459119,6.70343137 12.4125786,6.33333333 12.7245283,5.97058824 C13.036478,5.60784314 13.363522,5.27205882 13.7056604,4.96323529 C14.0477987,4.65441176 14.3345912,4.42156863 14.5660377,4.26470588 C14.6566038,4.20588235 14.7798742,4.13480392 14.9358491,4.05147059 C15.0918239,3.96813725 15.2301887,3.92647059 15.3509434,3.92647059 C15.6226415,3.92647059 15.7987421,4 15.8792453,4.14705882 C15.9597484,4.29411765 16,4.4754902 16,4.69117647 L16,4.72058824 Z" id="形状"></path>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    }

    const address = ref('')

    const latAndLngText = computed(()=>{
      if (!props.position){
        return '--'
      }
      return `${toDMS(props.position.lng, false)}, ${toDMS(props.position.lat, true)}`
    })


    onMounted(async ()=>{
      if (props.position){
        address.value = await getAddress(props.position.lng, props.position.lat)
      }
    })
    return (): JSX.Element => {
      const handleClick = (): void => {
        emit('close')
      }
      const clickCommunicationButton = async ({ type, userInfo }: { type: CallMediaType; userInfo: UserInfo; }): Promise<void> =>{
        message.loading('正在呼叫')
        const userId = userInfo?.id || (userInfo as unknown as { userId: string; })?.userId
        const onlineList = await cubeCommunicateService.queryOnlineList()
        if (!onlineList.find((item)=>item.id === userId)){
          message.destroy()
          message.warning('用户不在线')
          return
        }
        const callManager = CallManager.getInstance()
        if (type === CallMediaType.audio){
          await callManager.singleCallAudio(userId)
        } else {
          await callManager.singleCallVideo(userId)
        }
        message.destroy()
        createCallInterface(userInfo)
      }
      return <>
        <div class={styles['user-popup']}>
          <div class={styles['avatar']}>
            {
              props.userInfo.fileVO
                ? <Image src={props.userInfo.fileVO.path} alt={props.userInfo.fileVO.name} onError={()=>{
                  props.userInfo.fileVO = null
                }} previewMask={() => <><EyeOutlined />预览</>} />
                : 
                (props.userInfo as UserInfoVo)?.photo?.length > 0
                  ? <Image src={(props.userInfo as UserInfoVo).photo[0].path} alt={(props.userInfo as UserInfoVo).photo[0].name} onError={()=>{
                    (props.userInfo as UserInfoVo).photo = null
                  }} previewMask={() => <><EyeOutlined />预览</>} />
                  : <Avatar shape="square" size={'large'}>{props.userInfo.name}</Avatar>
            }
          </div>
          <div class={styles['info']}>
            <div class={styles['title']}>
              <div class={styles['name']}>
                {props.userInfo.name}
                <div class={styles['organization']}>
                  {(props.userInfo as UserInfoVo).position ? (props.userInfo as UserInfoVo).position : (props.userInfo.organization) ? props.userInfo.organization.name : ''}
                </div>
              </div>
              <div class={styles['media']}>
                <div class={styles['item']} onClick={async (e)=>{
                  e.stopPropagation()
                  clickCommunicationButton({ type: CallMediaType.audio, userInfo: props.userInfo })
                }}>
                  <AudioIcon />
                </div>
                <div class={styles['item']} onClick={async (e)=>{
                  e.stopPropagation()
                  clickCommunicationButton({ type: CallMediaType.video, userInfo: props.userInfo })
                }}>
                  <VideoIcon />
                </div>
              </div>
            </div>
            <div class={styles['row-text']}>
              <span class={styles['label']}>当前位置：</span>
              <span class={styles['value']}>{address.value || "--"}</span>
            </div>
            <div class={styles['row-text']}>
              <span class={styles['label']}>经纬度：</span>
              <span class={styles['value']}>{latAndLngText.value}</span>
            </div>
          </div>
          <div class={styles['close-button']} onClick={handleClick}></div>
        </div>
      </>
    }
  }
})