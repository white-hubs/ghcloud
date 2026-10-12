import { defineComponent, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import MerchantList from "@/features/cards/merchant-manage/components/merchant-list";
import MerchantListModal from "@/features/cards/merchant-manage/components/merchant-list-modal";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";

import "./merchant-v2-shared.module.less";

import styles from "./merchant-list-card.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card merchant-v2-panel merchant-list-card-v2-panel";

export const MerchantListCard = defineComponent({
  name: "MerchantListCard",
  setup() {
    const showMoreModal = ref(false);

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["merchant-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <MerchantList zoom={isZoom} />
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="merchant-v2-root">
          <SubPanelTemplate
            title="商户清单"
            class={PANEL_CLASS}
            zoomable
            zoom-title="商户清单详情"
            zoom-width={920}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="merchant-list" />,
              extra: () => (
                <div class={styles.moreWrap} data-no-zoom>
                  <button type="button" class={styles.moreBtn} onClick={() => (showMoreModal.value = true)} aria-label="查看更多商户">
                    查看更多{">>"}
                  </button>
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <MerchantListModal
          showModal={showMoreModal.value}
          onClose={() => {
            showMoreModal.value = false;
          }}
        />
      </>
    );
  },
});

export default MerchantListCard;
