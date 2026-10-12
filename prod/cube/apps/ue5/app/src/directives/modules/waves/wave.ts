import { Waves } from "./waves";
import { addClass } from "@/infrastructure/utils/common";

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
