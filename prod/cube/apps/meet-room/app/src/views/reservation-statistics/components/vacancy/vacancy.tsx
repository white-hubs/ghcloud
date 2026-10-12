import { defineComponent, onMounted, ref, watch } from 'vue';
import { init, type ECharts } from 'echarts';
import { Card } from 'ant-design-vue';
import styles from './vacancy.module.less';
import { cubeMeetRoomService } from '@/api/service';
import type { AppointmentIdleVo } from '@ghcloud/cube-meet-room-service'

export const Vacancy = defineComponent({
  props: {
    period: {
      type: String,
      default: '',
    },
    timeFlag: {
      type: String,
      default: '',
    },
  },
  setup (props) {
    const chartDom = ref<HTMLDivElement | null>(null);
    const data = ref<AppointmentIdleVo[] | null>(null);
    let myChart: ECharts | null = null;

    const setOption = (drawData: AppointmentIdleVo[]): void => {
      const xAxisData = drawData.map((e) => e.conferenceName);
      const yAxisData = drawData.map((e) => e.idleRate);
      const options = {
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: 'rgba(50, 216, 205, 1)',
            },
          },
        },
        grid: {
          top: '4%',
          left: '1%',
          right: '1%',
          bottom: '5%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            interval: 0,
            rotate: 30,
            color: '#86909C',
            textStyle: {
              fontSize: 12,
            },
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#E5E6EB',
            },
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          axisLabel: {
            color: '#86909C',
            textStyle: {
              fontSize: 12,
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#F2F3F5',
              type: 'solid',
            },
          },
        },
        series: [
          {
            name: '空置率（%）',
            type: 'bar',
            barWidth: '16',
            itemStyle: {
              normal: {
                color: '#3662EC',
              },
            },
            data: yAxisData,
          },
        ],
      };
      if (myChart) {
        myChart.setOption(options);
      }
    };

    const query = async (): Promise<void> => {
      const params = {
        period: props.period,
        TimeFlag: props.timeFlag,
      };
      const res = await cubeMeetRoomService.getConferenceIdle(params);
      data.value = res;
      setOption(data.value);
    };

    watch(
      () => [props.period, props.timeFlag],
      () => {
        query();
      }
    );

    onMounted(() => {
      if (chartDom.value) {
        myChart = init(chartDom.value as HTMLElement);
        window.addEventListener('resize', () => {
          if (myChart) {
            myChart.resize();
          }
        });
      }
    });
    return (): JSX.Element => (
      <Card title="会议室空置情况" size="small" class={styles['meeting-room-vacancy-card']}>
        <div ref={chartDom} class={styles['chart-dom']}></div>
      </Card>
    );
  },
});