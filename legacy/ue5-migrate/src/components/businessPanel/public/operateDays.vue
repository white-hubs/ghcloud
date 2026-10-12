<template>
	<div class="operateDays" @click="handelClickDeviceNum">
		<div class="top">
			<div class="tit">{{ title }}</div>
			<div class="statstics flex-end">
				<count-to :startVal="0" :endVal="value" :duration="4000" :decimals="decimals" class="scroll-number"></count-to>
				<span class="unit">{{ unit }}</span>
				<slot />
			</div>
		</div>
	</div>
	<modal-alarm-table v-if="alarmModalShow" :show-modal="alarmModalShow" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>
	<modal-equipment-table v-if="deviceModalShow" :show-modal="deviceModalShow" @close="closeModal"
    :parameter="deviceParameter"></modal-equipment-table>
</template>
<script lang="ts" setup>
import { ref, withDefaults } from "vue";
import { CountTo } from "vue3-count-to"
import modalAlarmTable from "@/components/modal-table/modal-alarm-tableNew.vue";
import modalEquipmentTable from "@/components/modal-table/modal-equipment-table.vue";
interface Props {
	value: number;
	title: string;
	unit?: string;
	decimals: number
}
const props = withDefaults(defineProps<Props>(), {
	title: "xx数量",
	value: 0,
	decimals: 0
});
const deviceParameter = ref<Record<string, any>>({
  status: "",
});
const deviceModalShow = ref<boolean>(false);
const alarmModalShow = ref<boolean>(false);
  const alarmParameter = ref<Record<string, any>>({});
const handelClickDeviceNum = (item) => {
	if (props.title === "报警总数"||props.title === "报警数") {
		alarmModalShow.value = true
	}else if(props.title === "设备总数"||props.title === "设备数"){
		deviceModalShow.value = true
	}
}
const closeModal = () => {
  alarmModalShow.value = false;
  deviceModalShow.value = false;
};
</script>
<style lang="less">
.operateDays {
	cursor: pointer;
	.top {
		height: 50px;
		line-height: 50px;
		display: flex;
		justify-content: space-between;
		padding: 0 16px 0 12px;
		background-image: url("/resource/v1/ue5-migrate/assets/images/dutybg.png");
		background-size: 100% 100%;
		background-repeat: no-repeat;

		.tit {
			color: #d0deee;
			font-size: 16px;
		}

		.statstics {
			font-size: 22px;
			font-family: Source Han Sans CN-Medium, Source Han Sans CN;
			font-weight: bold;
			color: #eff6ff;
			text-shadow: 0px 0px 6px rgba(54, 132, 228, 0.8);
			align-items: flex-end;

			.unit {
				font-family: Source Han Sans CN-Regula;
				font-weight: normal;
				color: #BAD9FF;
				font-size: 12px;
				margin-left: 4px;
			}
		}
	}
}

.downtriangle {
	width: 0;
	height: 0;
	border-left: 8px solid transparent;
	border-right: 8px solid transparent;
	border-bottom: 8px solid #D2FFF3;
	margin-right: 3px;
	transform: rotate(180deg);
}

.uptriangle {
	border-bottom: 8px solid #FFCECE;
	transform: rotate(0deg);
}
</style>
