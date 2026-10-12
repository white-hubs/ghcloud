
import { defineComponent, onMounted, ref, watch } from 'vue'
import type { AnalysisInfo } from './type'

const SAFETY_SUPERVISION_IMG = '/resource/v1/safety-supervision/img'
const monitorIcon = `${SAFETY_SUPERVISION_IMG}/monitor.png`
const electricityIcon = `${SAFETY_SUPERVISION_IMG}/electrical.png`
const fireFightingIcon = `${SAFETY_SUPERVISION_IMG}/fire-fighting.png`
const rotatinRingIcon = `${SAFETY_SUPERVISION_IMG}/rotating-ring.png`
const electricVehicle = `${SAFETY_SUPERVISION_IMG}/electric-vehicle.png`
const smallIcon = `${SAFETY_SUPERVISION_IMG}/smallIcon.png`
const inspectionIcon = `${SAFETY_SUPERVISION_IMG}/inspectionIcon.png`
const electricIcon = `${SAFETY_SUPERVISION_IMG}/electricIcon.png`
const hinddenIcon = `${SAFETY_SUPERVISION_IMG}/hinddenIcon.png`
const faultIcon = `${SAFETY_SUPERVISION_IMG}/faultIcon.png`
const toBeAnalyzedIcon = `${SAFETY_SUPERVISION_IMG}/to-be-analyzed.png`

import style from './analysis.module.less'
import { DownOutlined, RightOutlined } from '@ant-design/icons-vue'
import { cubeOuaaService } from '../../../../api/server'
import type { Application } from '@ghcloud/cube-ouaa-service'
import { AnalysisTextComponents } from './analysis-text-components'
const iconMap: Record<string, string> = {
  'SECURITY_MONITORING': monitorIcon,
  'ELECTRICMANAGE': electricityIcon,
  'FIRECONTROL': fireFightingIcon,
  // 'ELECTRlC_VEHICLE': rotatinRingIcon,
  'ROTATINGMANAGE': rotatinRingIcon,
  'ELECTRlC_VEHICLE': electricVehicle,
  'SMALLENFINEERING': smallIcon,
  'INSPECTION': inspectionIcon,
  'ELECTRONIC_PATROL': electricIcon,
  'HIDDENDANGER': hinddenIcon,
  'FAULT': faultIcon,
}
interface Props {
  data: AnalysisInfo[];
  currentKey: number;
  childrenKey: number;
  grandsonKey: number;
}

interface StatusProps {
  data: AnalysisInfo;
  father?: AnalysisInfo;
}

interface AiSuggestionItem {
  name: string;
  suggestion: string;
}

const collectAiSuggestions = (item: AnalysisInfo): AiSuggestionItem[] => {
  const suggestions: AiSuggestionItem[] = [];
  item.children?.forEach((children) => {
    children.children?.forEach((grandson) => {
      const suggestion = grandson.title?.trim();
      if (suggestion) {
        suggestions.push({
          name: grandson.name ?? "规则",
          suggestion,
        });
      }
    });
  });
  return suggestions;
};

const renderAppAiSuggestion = (suggestions: AiSuggestionItem[]): JSX.Element | null => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div class={style["analysis-app-ai-suggestion"]}>
      <div class={style["analysis-app-ai-suggestion-title"]}>
        <span>AI建议</span>
        <em>共{suggestions.length}条</em>
      </div>
      <div class={style["analysis-app-ai-suggestion-content"]}>
        {suggestions.map((item, index) => (
          <div key={`${item.name}-${index}`} class={style["analysis-app-ai-suggestion-item"]}>
            <span>{item.name}：</span>
            {item.suggestion}
          </div>
        ))}
      </div>
    </div>
  );
};

const hasAnalysisChildren = (item: AnalysisInfo | undefined): boolean => Boolean(item?.children?.length);

const StatusComponents = defineComponent({
  props: ['data'],

  setup (props: StatusProps) {


    return (): JSX.Element =>
      <>
        {props.data.analysisStatus === 'Analyzed' &&
          <div class={style['status']}>
            <span class={style['span']} style={{ color: props.data.fraction !== undefined && props.data.fraction < 80 ? 'red' : '#3fbe53' }}>{props.data.fraction} </span> 分
          </div>
        }
        {props.data.analysisStatus === 'Analyzing' &&
          <div class={style['status']}>
            分析中
            {/* <LoadingOutlined style={{ color: '#3FBE53', fontSize: '16px', marginLeft: '13px' }} /> */}
            <div class={style['animationLoading']}></div>
          </div>
        }
        {props.data.analysisStatus === 'ToBeAnalyzed' &&
        <div class={style['status']}>
          待分析
          <img src={toBeAnalyzedIcon} alt="" />
        </div>
        }
      </>
  }
})
const ChildrenStatusComponents = defineComponent({
  props: ['data'],
  setup (props: StatusProps) {

    return (): JSX.Element =>
      <>
        {props.data.analysisStatus === 'Analyzed' &&
          <div class={style['status']}>

            <span class={style['span']} style={{ color: props.data.fraction !== undefined && props.data.fraction < 80 ? 'red' : '#3fbe53' }}>{props.data.fraction} </span> 分
          </div>
        }
        {props.data.analysisStatus === 'Analyzing' &&
          <div class={style['status']}>
            分析中
            {/* <LoadingOutlined style={{ color: '#3FBE53', fontSize: '16px', marginLeft: '13px' }} /> */}
            <div class={style['animationLoading']}></div>
          </div>
        }
        {props.data.analysisStatus === 'ToBeAnalyzed' &&
        <div class={style['status']}>
          待分析
          <img src={toBeAnalyzedIcon} alt="" />
        </div>
        }
      </>
  }
})
const GrandsonStatusComponents = defineComponent({
  props: ['data'],
  setup (props: StatusProps) {

    const getColor = (): string =>{
      if (props.data.fraction !== undefined && props.data.fraction < 80){
        if (props.data.fraction < 60){
          return 'red'
        }
        return '#FAAD14'
      } else {
        return '#3fbe53'
      }
    }


    return (): JSX.Element =>
      <>
        {(props.data.analysisStatus === 'Analyzed' || props.data.analysisStatus === 'AIAnalyzing') &&
          <div class={style['status-analyzed']}>
            {/* 分析完成
            <img src={analyzedIcon} alt="" /> */}
            { <>

              <span class={style['span']} style={{ color: getColor() }}>{(props.data.fraction && props.data.fraction > 100) ? 100 : props.data.fraction} </span> 分
            </>}
          </div>
        }
        {props.data.analysisStatus === 'Analyzing' &&
          <div class={style['status']}>
            分析中
            <div class={style['animationLoading']}></div>
          </div>
        }
        {props.data.analysisStatus === 'ToBeAnalyzed' &&
          <div class={style['status']}>
            待分析
            <img src={toBeAnalyzedIcon} alt="" />
          </div>
        }
      </>
  }
})


export const AnalysisComponents = defineComponent({
  props: ['data', 'currentKey', 'childrenKey', 'grandsonKey'],
  emits: ['expandedChange:value'],

  setup (props: Props) {
    // const marketApp = window.location.pathname.includes('safety-manage-head') || window.location.pathname.includes('sn-cockpit')
    const application = ref()
    const getApplicationGroups = async (): Promise<void> => {
      const data = await cubeOuaaService.getApplicationGroups()
      if (data){
        application.value = data
        changeIcon()
      }
    }
    const changeIcon = (): void =>{
      application.value?.map((item: {
        id: string;
        name: string;
        applicationPageVOS: Application[];
      }) =>{
        item.applicationPageVOS.map((app: Application) =>{
          props.data?.map((analysis: AnalysisInfo) =>{
            if (app.code === analysis.code){
              analysis.img = app.icon
            }
          })
        })
      })
    }
    // const itemRefs = ref<HTMLElement[]>([]);
    watch(
      () => props.data,
      () => {
        changeIcon()
      }
    )


    onMounted(() => {
      getApplicationGroups()
    })
    return (): JSX.Element => (
      <div>
        {props.data?.map((item, index) => (
          <div key={index} class={style['analysis-item']}>
            <div class={style['analysis-item-header']}>
              <div class={style['iconAndName']}>
                <img src={iconMap[item.code ?? '']} alt="icon" />
                {item.name}
              </div>
              <div class={style['statusAndSelect']}>
                <StatusComponents data={item} />
                <div onClick={()=>{
                  item.expanded = !item.expanded
                }}>{item.expanded ? <DownOutlined style={{ color: '#979797' }} /> : <RightOutlined style={{ color: '#979797' }} />}</div>
              </div>
            </div>
            {item.expanded && hasAnalysisChildren(item) && (
              <>
                {item.children?.map((children, childrenIndex) =>(
                  <div key={childrenIndex} class={style['analysis-item-children']}>
                    <div class={style['analysis-item-children-header']}>
                      <div class={style['analysis-item-children-header-name']}>
                        {children.name}

                      </div>
                      <div class={style['statusAndSelect']}>
                        <ChildrenStatusComponents data={children} />
                        <div onClick={()=>{
                          children.expanded = !children.expanded
                        } }>{children.expanded ? <DownOutlined style={{ color: '#979797' }} /> : <RightOutlined style={{ color: '#979797' }} />}</div>
                      </div>
                    </div>
                    {
                      children.expanded &&
                      children.children?.map((grandson: AnalysisInfo, grandsonIndex) => (
                        <div key={grandsonIndex} class={style['analysis-item-grandson']}>
                          <div class={style['analysis-item-grandson-left']}>
                            <div class={style['analysis-item-grandson-name']}>
                              <AnalysisTextComponents data={item} childrenItem={children} grandson={grandson} />
                              {/* {marketApp ?  : <AnalysisTextComponents data={item} childrenItem={children} grandson={grandson} /> } */}
                            </div>

                            {(grandson.analysisStatus === 'AIAnalyzing') && <div class={style['analysis-item-grandson-ai']}>
                              {/* <Tooltip title={grandson.title} > */}
                              <div class={style['status']}>
                                诊断中
                                <div class={style['animationLoading']}></div>
                              </div>
                              {/* </Tooltip> */}
                            </div>}
                          </div>
                          <div class={style['analysis-item-grandson-right']}>
                            <GrandsonStatusComponents data={grandson} />
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ))}
                {renderAppAiSuggestion(collectAiSuggestions(item))}
              </>
            )}
          </div>
        ))}
      </div>
    );
  }
});
