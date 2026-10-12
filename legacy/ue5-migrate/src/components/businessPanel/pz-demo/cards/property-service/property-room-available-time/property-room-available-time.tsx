import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts';
import { calcFontSize } from '@/utils/common'
import { PZService } from '../../../card-service/service'

export const PropertyRoomAvailableTime = defineComponent({
  setup () {
    const chartRef = ref<HTMLDivElement>();

    onMounted(async () => {
      const res: {
        id: number;
        name: string;
        startTime: string;
        endTime: string;
      }[] = await PZService.property.getPropertyMeetingRoomAvailableTime();
      const seriesData = res.map(item=>{
        // 计算startTime 距离00:00分钟数
        const startTimeInMinutes = (new Date(`1970-01-01 ${item.startTime}`).getHours() * 60) + new Date(`1970-01-01 ${item.startTime}`).getMinutes();
        const endTimeInMinutes = (new Date(`1970-01-01 ${item.endTime}`).getHours() * 60) + new Date(`1970-01-01 ${item.endTime}`).getMinutes();
        // 计算endTime 距离23:59分钟数
        const endTimeInMinutes2 = (new Date(`1970-01-01 ${item.endTime}`).getHours() * 60) + new Date(`1970-01-01 ${item.endTime}`).getMinutes();
        return {
          start: startTimeInMinutes,
          canUse: endTimeInMinutes - startTimeInMinutes,
          end: endTimeInMinutes2
        }
      })
      const seriesRes = [
        {
          name: '不可用时间',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: 'rgba(255, 255, 255, 0)'
          },
          data: seriesData.map(e=>e.start)
        }, {
          name: '可用时间',
          type: 'bar',
          stack: 'total',
          barWidth: calcFontSize(30),
          itemStyle: {
            color: 'rgba(0, 128, 0, 0.6)'
          },
          data: seriesData.map(e=>e.canUse)
        },
        {
          name: '不可用时间',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: 'rgba(255, 255, 255, 0)'
          },
          data: seriesData.map(e=>e.end)
        }
      ]


      if (!chartRef.value) return;
      const chart = echarts.init(chartRef.value);
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          textStyle: {
            fontSize: calcFontSize(12),
          },
          formatter: (params): string=> {
            if (params.length === 0){
              return '暂无数据';
            }
            const meetRoom = params[0].axisValue;
            const findData = res.find(item=>item.name === meetRoom)
            if (!findData){
              return '暂无数据';
            }
            return `可用时间段：\n${findData.startTime}-${findData.endTime}`;
          }
        },
        grid: {
          left: calcFontSize(0),
          right: calcFontSize(0),
          top: calcFontSize(0),
          bottom: calcFontSize(0),
          containLabel: true
        },
        xAxis: {
          max: 24 * 60,
          type: 'value',
          boundaryGap: [0, 0.01],
          axisLabel: {
            formatter: (value: number): string=> {
              const hours = Math.floor(value / 60);
              const minutes = value % 60;
              return `${hours}:${minutes.toString().padStart(2, '0')}`;
            },
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        yAxis: {
          type: 'category',
          data: res.map(item=>item.name),
          axisLabel: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
        },
        series: seriesRes,
        dataZoom: [
          {
            type: 'slider',
            start: 0,
            end: 33
          },
        ]
      };

      chart.setOption(option);
    });

    return (): JSX.Element => (
      <SubPanelTemplate>
        <div class='card-container-3' ref={chartRef} style={{ width: '100%' }}></div>
      </SubPanelTemplate>
    )
  }
})
