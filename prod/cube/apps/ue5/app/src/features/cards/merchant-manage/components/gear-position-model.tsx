import { defineComponent, type PropType } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import NoData from "@/shared-ui/panel/noData";

import "../cards/merchant-v2-shared.module.less";

interface MerchantSpace {
  id?: string | number;
  bimId?: string;
  code?: string;
  name?: string;
  [key: string]: unknown;
}

export const GearPositionModel = defineComponent({
  name: "GearPositionModel",
  props: {
    showModal: { type: Boolean, required: false, default: false },
    dataSource: { type: Array as PropType<MerchantSpace[]>, required: false, default: () => [] },
  },
  emits: ["close", "select"],
  setup(props, { emit }) {
    const close = () => {
      emit("close");
    };

    return (): JSX.Element => (
      <Modal title="档位选择" show={props.showModal} width="720px" wrapClassName="modal-table-device" destroyOnClose onClose={close}>
        <div class="merchant-v2-list merchant-v2-surface">
          <div class="merchant-v2-list-head">
            <span>档位名称</span>
            <span>档位编码</span>
            <span>操作</span>
          </div>
          {props.dataSource.length > 0 ? (
            <div class="merchant-v2-list-scroll">
              {props.dataSource.map((item, index) => {
                const name = String(item?.name || `档位${index + 1}`);
                const code = String(item?.bimId || item?.code || "--");
                return (
                  <div class="merchant-v2-list-row" key={`${item?.id || code || index}`}>
                    <span class="merchant-v2-list-cell" title={name}>
                      {name}
                    </span>
                    <span class="merchant-v2-list-cell" title={code}>
                      {code}
                    </span>
                    <button
                      type="button"
                      class="merchant-v2-link"
                      onClick={() => {
                        emit("select", item);
                      }}
                    >
                      查看
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div class="merchant-v2-empty">
              <NoData />
            </div>
          )}
        </div>
      </Modal>
    );
  },
});

export default GearPositionModel;
