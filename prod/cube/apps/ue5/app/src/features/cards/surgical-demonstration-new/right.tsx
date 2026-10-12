import { defineComponent } from "vue";

import PopularVideos from "./cards/popular-videos";
import TeachingLiveSessions from "./cards/teaching-live-sessions";
import TeachingOverview from "./cards/teaching-overview";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    return (): JSX.Element => (
      <div>
        <TeachingOverview />
        <TeachingLiveSessions />
        <PopularVideos />
      </div>
    );
  },
});

export default Right;
