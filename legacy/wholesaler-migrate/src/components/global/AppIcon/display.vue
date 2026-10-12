<template lang="pug">
//-  a-icon(theme="filled")<a-icon type="question" /> 默认空白
a-icon(v-if="!icon" type="question")
a-icon(v-else-if="!icon.src" :type="icon.name" :theme="icon.theme" v-bind="$attrs")
a-icon(v-else-if="icon.type === 'svg'" :component="SvgIcon()" :theme="icon.theme" v-bind="$attrs")
a-icon(v-else :component="PngIcon()")
  
</template>
<script>
import icons from './icons';

export default {
  components: {
    // SvgIcon: {
    //   props: {
    //     svgSrc: String,
    //   },
    //   render() {
    //     return (
    //       <svg>
    //         <use xlink:href="#xxx" />
    //       </svg>
    //     );
    //   },
    // },
    PngIcon: {
      props: {
        imgSrc: String,
      },
      render() {
        return (
          <img
            src={this.imgSrc}
            style={{ width: '1em', height: '1em', 'vertical-align': 'unset' }}
          />
        );
      },
    },
  },
  props: {
    type: String,
    name: String,
    src: String,
  },
  data() {
    return {
      icons: icons,
    };
  },
  computed: {
    icon() {
      const icon = this.icons[this.name];
      return icon;
    },
  },
  methods: {
    SvgIcon() {
      return {
        // render: () => {
        //   return <SvgIcon name={this.icon.name} />;
        // },
        template: `<svg><use xlink:href="#${this.icon.name}"/></svg>`,
      };
    },
    PngIcon() {
      return {
        render: () => {
          return <PngIcon imgSrc={this.icon.src} />;
        },
      };
    },
  },
};
</script>

<style lang="less" scoped></style>
