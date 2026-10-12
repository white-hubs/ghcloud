import { defineComponent, ref, onMounted, watch } from 'vue';
import { init, type ECharts } from 'echarts';
import { Card } from '@ghcloud/cube-ui';
import styles from './period-analysis.module.less';
import { cubeMeetRoomService } from '@/api/service';
import type { ConferenceNameList } from '@ghcloud/cube-meet-room-service';

export const PeriodAnalysis = defineComponent({
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
    let myChart: ECharts | null = null;

    const setOption = (names: string[], timeIntervals: string[], seriesArr: number[][]): void => {
      const options = {
        title: {
          text: '',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: 'rgba(50, 216, 205, 1)',
            },
          },
        },
        legend: {
          data: names,
          x: 'center',
          y: 'bottom',
          padding: [0, 0, 0, 0],
          type: 'scroll',
        },
        smooth: true,
        grid: {
          top: '15px',
          right: '10px',
          left: '10px',
          bottom: '20px',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: timeIntervals,
          axisLine: {
            show: true,
            lineStyle: {
              color: '#86909C',
            },
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: [
          {
            type: 'value',
            minInterval: 1,
            name: '',
            padding: 5,
            splitLine: {
              show: true,
              lineStyle: {
                color: '#F2F3F5',
                type: 'solid',
              },
            },
            axisLabel: {
              color: '#86909C',
              textStyle: {
                fontSize: 12,
              },
            },
            axisTick: {
              show: false,
            },
          },
        ],
        series: seriesArr.map((e, i) => ({
          name: names[i],
          type: 'line',
          data: e,
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
            color: '#1890ff',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0.1,
                  color: 'rgba(26, 117, 234, 0.0)',
                },
                {
                  offset: 1,
                  color: 'rgba(26, 117, 234, 0.30)',
                },
              ],
              global: false,
            },
          },
        })),
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
      const res = await cubeMeetRoomService.getTimeIntervalLog(params);

      const reqs = res.filter(e => e.conferenceName);

      reqs.forEach((e) => {
        const arr: { index: number; time: number; }[] = [];
        e?.conferenceNameLists?.forEach((ele, i: number) => {
          const timeValue = ele?.timeInterval?.split('-')[0]?.replaceAll(':', '') ?? '';
          arr.push({
            index: i,
            time: parseInt(timeValue, 10),
          });
        });
        const arr2: ConferenceNameList[] = [];
        arr.sort((a, b) => a.time - b.time).forEach((element) => {
          if (e?.conferenceNameLists?.[element.index]) {
            arr2.push(e?.conferenceNameLists?.[element.index]);
          }
        });
        e.conferenceNameLists = arr2;
      });

      reqs.sort((a, b) => {
        const aLength = a?.conferenceNameLists?.length ?? 0;
        const bLength = b?.conferenceNameLists?.length ?? 0;
        return aLength - bLength;
      });

      const timeIntervals = (reqs[reqs.length - 1]?.conferenceNameLists ?? []).map(e => e.timeInterval ?? '');
      const names = reqs.map(e => e.conferenceName ?? '');
      const seriesArr = reqs.map(e =>
        (e?.conferenceNameLists?.map(ele => ele.intervalLogCount) ?? []).filter(val => val !== undefined));

      setOption(names, timeIntervals, seriesArr as number[][]);
    };

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

    watch(
      () => [props.period, props.timeFlag],
      () => {
        query();
      }
    );

    return (): JSX.Element => (
      <Card title="会议预约时段分析" size="small" class={styles['period-analysis-card']}>
        <div ref={chartDom} class={styles['chart-dom']}></div>
      </Card>
    );
  },
});