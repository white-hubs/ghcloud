import { defineComponent, ref, watch, onMounted } from 'vue';
import { init, type ECharts } from 'echarts';
import { Card } from '@ghcloud/cube-ui';
import styles from './usage.module.less';
import { cubeMeetRoomService } from '@/api/service';
import type { AppointmentUsageVo } from '@ghcloud/cube-meet-room-service';

export const Usage = defineComponent({
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
    const data = ref<AppointmentUsageVo[] | null>(null);
    const count = ref<number | null>(null);
    let myChart: ECharts | null = null;

    const setOption = (drawData: AppointmentUsageVo[]): void => {
      const xAxisData = drawData.map((item) => item.name);
      const yAxisData = drawData.map((item) => item.num);
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
            name: '会议使用次数',
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
      const usageRes = await cubeMeetRoomService.getConferenceUsage(params);
      data.value = usageRes;
      setOption(data.value);

      const countRes = await cubeMeetRoomService.getConferenceCount(params);
      if (typeof countRes.num === 'number') {
        count.value = countRes.num;
      } else if (countRes.num === null || countRes.num === undefined) {
        count.value = null;
      } else {
        count.value = parseInt(countRes.num as string, 10) || null;
      }
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
      <Card title="会议室使用情况" size="small" >
        <div class={styles['meeting-room-usage-card']}>

          {count.value && (
            <div class={styles['top-bar']}>
              <span class={styles['title']}>会议室使用总数</span>
              <span class={styles['value']}>{String(count.value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
          )}
          <div ref={chartDom} class={styles['chart-dom']}></div>
        </div>
      </Card>
    );
  },
});