<template>
  <div class="group">
    <div class="overlap-group">
      <img class="vector" src="/resource/v1/ue5-sn-migrate/assets/img/vector-5.svg" />
      <img class="img" src="/resource/v1/ue5-sn-migrate/assets/img/vector-6.svg" />
      <div class="div">
        <div class="text-wrapper">{{ labelData && labelData.name }}海吉星</div>
        <div class="text-wrapper-2">燃气报警</div>
        <div class="text-wrapper-3">环比</div>
        <img class="vector-2" src="/resource/v1/ue5-sn-migrate/assets/img/vector.svg" />
        <div class="text-wrapper-4">3%</div>
        <div class="text-wrapper-5">易燃设备建档数</div>
        <div class="text-wrapper-6">燃气泄漏报警</div>
        <div class="text-wrapper-7">8</div>
        <div class="text-wrapper-8">78</div>
        <div class="text-wrapper-9">8</div>
      </div>
      <img class="line" src="/resource/v1/ue5-sn-migrate/assets/img/line-16.svg" />
      <img class="line-2" src="/resource/v1/ue5-sn-migrate/assets/img/line-17.svg" />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    labelData: {
      type: Object,
      default: () => {},
    },
  },
};
</script>
<style scoped>
.group {
  width: 285px;
  height: 152px;
  margin-left: -320px;
  margin-bottom: 100px;
}

.group .overlap-group {
  position: relative;
  width: 286px;
  height: 153px;
}

.group .vector {
  position: absolute;
  width: 276px;
  height: 144px;
  top: 4px;
  left: 5px;
}

.group .img {
  position: absolute;
  width: 286px;
  height: 153px;
  top: 0;
  left: 0;
}

.group .div {
  position: absolute;
  width: 261px;
  height: 117px;
  top: 16px;
  left: 22px;
}

.group .text-wrapper {
  top: 0;
  left: 0;
  font-weight: 700;
  font-style: italic;
  color: #ffffff;
  font-size: 14px;
  position: absolute;
  font-family: "Inter", Helvetica;
  letter-spacing: 0;
  line-height: normal;
}

.group .text-wrapper-2 {
  top: 32px;
  left: 0;
  font-weight: 700;
  font-style: italic;
  color: #ffffff;
  font-size: 14px;
  position: absolute;
  font-family: "Inter", Helvetica;
  letter-spacing: 0;
  line-height: normal;
}

.group .text-wrapper-3 {
  top: 96px;
  left: 25px;
  font-weight: 500;
  color: #a2aec1;
  font-size: 12px;
  position: absolute;
  font-family: "Inter", Helvetica;
  letter-spacing: 0;
  line-height: normal;
}

.group .vector-2 {
  position: absolute;
  width: 7px;
  height: 10px;
  top: 98px;
  left: 53px;
}

.group .text-wrapper-4 {
  position: absolute;
  top: 96px;
  left: 63px;
  font-family: "Inter", Helvetica;
  font-weight: 500;
  color: #ed4949;
  font-size: 12px;
  letter-spacing: 0;
  line-height: normal;
}

.group .text-wrapper-5 {
  top: 70px;
  left: 136px;
  font-weight: 500;
  color: #a2aec1;
  font-size: 12px;
  position: absolute;
  font-family: "Inter", Helvetica;
  letter-spacing: 0;
  line-height: normal;
}

.group .text-wrapper-6 {
  top: 70px;
  left: 0;
  font-weight: 500;
  color: #a2aec1;
  font-size: 12px;
  position: absolute;
  font-family: "Inter", Helvetica;
  letter-spacing: 0;
  line-height: normal;
}

.group .text-wrapper-7 {
  position: absolute;
  top: 88px;
  left: 136px;
  font-family: "Inter", Helvetica;
  font-weight: 700;
  color: #c9dcfc;
  font-size: 24px;
  letter-spacing: 0;
  line-height: normal;
}

.group .text-wrapper-8 {
  top: 23px;
  left: 213px;
  color: #a2aec1;
  position: absolute;
  font-family: "Inter", Helvetica;
  font-weight: 700;
  font-size: 24px;
  letter-spacing: 0;
  line-height: normal;
}

.group .text-wrapper-9 {
  top: 88px;
  left: 3px;
  color: #c9dcfc;
  position: absolute;
  font-family: "Inter", Helvetica;
  font-weight: 700;
  font-size: 24px;
  letter-spacing: 0;
  line-height: normal;
}

.group .line {
  position: absolute;
  width: 235px;
  height: 1px;
  top: 72px;
  left: 24px;
  object-fit: cover;
}

.group .line-2 {
  position: absolute;
  width: 1px;
  height: 40px;
  top: 90px;
  left: 142px;
}
</style>
