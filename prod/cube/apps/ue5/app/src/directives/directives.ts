import { App } from "vue";

import { wave, waveLight } from "./modules/waves/wave";

export default (app: App<Element>) => {
  app.directive("waves", wave);
  app.directive("waves-light", waveLight);
};
