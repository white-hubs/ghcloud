<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-select
        v-if="!expanding"
        class="max-fill"
        size="medium"
        v-model="_value"
        disabled
        :placeholder="placeholder"
      />
      <el-radio-group v-else v-model="_value">
        <el-radio
          v-for="(op, index) in options"
          :key="index"
          :label="op"
          disabled
        >
          {{ op }}
        </el-radio>
      </el-radio-group>
    </div>
    <div v-else>
      <el-select
        v-if="!expanding"
        class="max-fill"
        v-model="_value"
        size="medium"
        clearable
        :placeholder="placeholder"
      >
        <el-option
          v-for="(op, index) in options"
          :key="index"
          :value="op"
          :label="op"
        />
      </el-select>
      <el-radio-group v-else v-model="_value">
        <el-radio
          v-for="(op, index) in options"
          :key="index"
          :label="op"
        >
          {{ op }}
        </el-radio>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
import componentMinxins from '../ComponentMinxins'

export default {
  mixins: [componentMinxins],
  name: 'ParkingLotSelect',
  components: {},
  props: {
    value: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: '请选择停车场',
    },
    expanding: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {}
  },
  methods: {},
}
</script>

<style scoped>
</style>

