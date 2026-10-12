import { addClass } from "@/utils/common";
import { Waves } from "./waves";

export const wave = {
	mounted(el) {
		addClass(el, "waves-effect");
		Waves.init();
	},
};
export const waveLight = {
	mounted(el) {
		addClass(el, "waves-effect waves-light");
		Waves.init();
	},
};