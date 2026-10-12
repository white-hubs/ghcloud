<template>
  <SubPanelTemplate title="消费金额展示">
    <div class="appointment-statistics">
      <div class="statistics-item" v-for="item in reservationData" :key="item.title">
        <div class="statistics-box">
          <div class="monitorPanel-left">
            <div class="bg">
              <img :src="getAssetsImage('overView4.png')" alt="" />
              <img class="rotate aniamtion-electric-fan" :src="getAssetsImage('money1.png')" alt="" />
            </div>
          </div>
          <div class="monitorPanel-right">
            <div class="statistics-value">{{ item.value }}</div>
            <div class="statistics-title">{{ item.title }}</div>
          </div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import { getAssetsImage } from "@/utils/getImage";
import { canteenConsumptionAmount } from "@/api/onecard";
import moment from "moment";

const reservationData = ref<{ title: string; value: number }[]>([
  {
    title: "今日消费金额",
    value: 0,
  },
  {
    title: "本周消费金额",
    value: 0,
  },
  {
    title: "本月消费金额",
    value: 0,
  }
])

const fetchData = async () => {
  const dateFormat = "YYYY-MM-DD 23:59:59";

  const timeRanges = {
    "今日消费金额": {
      startTime: moment().format('YYYY-MM-DD 00:00:00'),
      endTime: moment().format(dateFormat)
    },
    "本周消费金额": {
      startTime: moment().startOf("week").add(1, 'days').format('YYYY-MM-DD 00:00:00'),
      endTime: moment().endOf("week").add(1, 'days').format(dateFormat)
    },
    "本月消费金额": {
      startTime: moment().startOf("month").format('YYYY-MM-DD 00:00:00'),
      endTime: moment().endOf("month").format(dateFormat)
    }
  };

  const promises = reservationData.value.map(async (item: { title: string; value: number }) => {
    const range = timeRanges[item.title as keyof typeof timeRanges];
    if (range) {
      try {
        const res = await canteenConsumptionAmount({
          period: `${range.startTime},${range.endTime}`,
        });
        if (typeof res === 'number') {
          item.value = res;
        } else if (res && typeof res?.amount === 'number') {
          item.value = res?.amount;
        } else if (res && typeof res?.data === 'number') {
          item.value = res?.data;
        }
      } catch (error) {
      }
    }
  });

  await Promise.all(promises);
}

onMounted(() => {
  fetchData();
})
</script>
<style lang="less" scoped>
.appointment-statistics {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 20px 0;
  .statistics-item {
    width: 108px;
    height: 224px;
    background: rgba(9, 25, 46, 0.03);
    border: 1px solid;
    border-image: linear-gradient(133deg, rgba(120, 179, 255, 0.10) 6%, rgba(70, 150, 255, 0.12) 14%, rgba(46, 113, 196, 0.31) 99%) 1 1;
    padding: 4px;

    .statistics-box {
      width: 100px;
      height: 216px;
      background: rgba(2, 2, 36, 0.20), radial-gradient(rgba(0, 0, 0, 0.00), rgba(0, 0, 0, 0.00) 64%, rgba(23, 57, 97, 0.30));
      border: 1px solid;
      border-image: linear-gradient(299deg, rgba(86, 143, 212, 0.10) 5%, rgba(255, 255, 255, 0.00) 52%, rgba(39, 109, 208, 0.30) 82%) 1 1;
      backdrop-filter: blur(1px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      .monitorPanel-left {
        .bg {
          position: relative;
          width: 100px;
          height: 80px;
          perspective: 200;

          img {
            width: 100%;
            height: 100%;
          }

          .rotate {
            position: absolute;
            width: 35px;
            height: 35px;
            left: 35px;
            top: 8px;
            transform: rotateY(45deg);
          }
        }
      }

      .monitorPanel-right {
        color:#fff;
        .statistics-value {
          font-size: 24px;
          font-weight: Regular;
          text-align: center;
        }

        .statistics-title {
          margin-top: 10px;
          font-size: 12px;
          text-align: center;
        }
      }
    }
  }
}
</style>