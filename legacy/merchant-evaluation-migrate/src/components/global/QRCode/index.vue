<template lang="pug">
.qrcode(ref='qrcode')
</template>

<script>
import QRCode from 'qrcodejs2';
import Print from '@/plugins/print';
export default {
  props: {
    value: String,
  },
  data() {
    return {
      qrcode: null,
    };
  },
  watch: {
    value: 'refresh',
  },
  mounted() {
    const height = this.$refs.qrcode.clientHeight;
    const width = this.$refs.qrcode.clientWidth;
    this.qrcode = new this.QRCode(this.$refs.qrcode, {
      width,
      height, // 高度
      text: this.value, // 二维码内容
      render: 'canvas', // 设置渲染方式（有两种方式 table和canvas，默认是canvas）
      // background: '#f0f',
      // foreground: '#ff0'
    });
  },
  methods: {
    QRCode,
    Print,
    refresh() {
      this.qrcode.clear();
      if (this.value) {
        this.qrcode.makeCode(this.value);
      }
    },
    download() {
      const img = this.$refs.qrcode.getElementsByTagName('img')[0];
      // debugger;
      // 构建画布
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      // 构造url
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      // const blob = new Blob([url]);
      // link.setAttribute('href', window.URL.createObjectURL(blob));
      link.setAttribute('href', url);
      link.setAttribute('download', '二维码.png');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    print() {
      this.Print(this.$refs.qrcode);
    },
  },
};
</script>

<style lang="less">
.qrcode {
  width: 100%;
  height: 100%;
}
@media print {
  @page {
    size: auto A4 landscape;
    margin: 5mm 8mm;
  }
  div {
    margin: 0 auto;
  }
}
</style>
