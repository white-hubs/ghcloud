import { addIcon } from "@iconify/vue";
import icons from "../material-icons.json";

for (const [name, data] of Object.entries(icons)) {
  addIcon(name, data);
}
