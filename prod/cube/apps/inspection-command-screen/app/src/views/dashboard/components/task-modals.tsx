import { defineComponent, nextTick, onBeforeUnmount, ref, watch } from "vue";

import { Input, Modal } from "@ghcloud/cube-ui";

import type { TaskItem, TransferUser } from "@/types/dashboard";

import "./task-modals.less";

export const TaskModals = defineComponent({
  name: "TaskModals",
  props: {
    transferTask: { type: Object as () => TaskItem | null, required: false, default: null },
    transferVisible: { type: Boolean, required: true },
    transferKeyword: { type: String, required: true },
    transferSelected: { type: String, required: true },
    transferUsers: { type: Array as () => TransferUser[], required: true },
    transferUserTotal: { type: Number, required: true },
    transferUserLoading: { type: Boolean, required: true },
    transferUserFinished: { type: Boolean, required: true },
    terminateTask: { type: Object as () => TaskItem | null, required: false, default: null },
    terminateVisible: { type: Boolean, required: true },
    onCloseTransfer: { type: Function as unknown as () => () => void, required: true },
    onCloseTerminate: { type: Function as unknown as () => () => void, required: true },
    onConfirmTransfer: { type: Function as unknown as () => () => void, required: true },
    onConfirmTerminate: { type: Function as unknown as () => () => void, required: true },
    onLoadMoreTransferUsers: { type: Function as unknown as () => () => void, required: true },
    onUpdateTransferKeyword: { type: Function as unknown as () => (v: string) => void, required: true },
    onUpdateTransferSelected: { type: Function as unknown as () => (v: string) => void, required: true },
  },
  setup(props) {
    const transferListRef = ref<HTMLDivElement | null>(null);
    const transferLoadSentinelRef = ref<HTMLDivElement | null>(null);
    let transferObserver: IntersectionObserver | null = null;

    const syncTransferObserver = (): void => {
      nextTick(() => {
        transferObserver?.disconnect();
        transferObserver = null;
        if (!props.transferVisible || !transferListRef.value || !transferLoadSentinelRef.value) {
          return;
        }
        transferObserver = new IntersectionObserver(
          ([entry]) => {
            if (entry?.isIntersecting) {
              props.onLoadMoreTransferUsers();
            }
          },
          {
            root: transferListRef.value,
            rootMargin: "0px 0px 24px 0px",
            threshold: 0.1,
          },
        );
        transferObserver.observe(transferLoadSentinelRef.value);
      }).catch(() => undefined);
    };

    watch(
      () => [props.transferVisible, props.transferUsers.length, props.transferUserLoading, props.transferUserFinished],
      syncTransferObserver,
    );

    onBeforeUnmount(() => {
      transferObserver?.disconnect();
      transferObserver = null;
    });

    return () => (
      <>
        <Modal
          open={props.transferVisible}
          title="任务移交"
          width={560}
          wrapClassName="screen-modal-wrap draggable-modal-wrap"
          class="screen-modal"
          onCancel={props.onCloseTransfer}
          onOk={props.onConfirmTransfer}
          okButtonProps={{ disabled: !props.transferSelected }}
          okText="确认移交"
          cancelText="取消"
        >
          <p class="transfer-task-info">
            当前任务：<strong>{props.transferTask?.name}</strong> | 当前负责人：<strong>{props.transferTask?.owner}</strong>
          </p>
          <Input
            class="transfer-search"
            placeholder="搜索人员姓名..."
            value={props.transferKeyword}
            onUpdate:value={props.onUpdateTransferKeyword}
          />
          <div class="transfer-user-summary">可移交人员：{props.transferUserTotal}人</div>
          <div class="candidate-list" ref={transferListRef}>
            {props.transferUsers.map((user) => (
              <div
                class={["candidate-item", props.transferSelected === user.id ? "active" : ""]}
                onClick={() => props.onUpdateTransferSelected(props.transferSelected === user.id ? "" : user.id)}
              >
                <div class="person-avatar">{user.name.slice(-1)}</div>
                <div class="person-info">
                  <div class="p-name">{user.name}</div>
                  <div class="p-detail">{user.detail}</div>
                </div>
                <div class="person-check">✓</div>
              </div>
            ))}
            {!props.transferUserLoading && props.transferUsers.length === 0 && <div class="transfer-load-status">暂无可移交人员</div>}
            {props.transferUserLoading && <div class="transfer-load-status">加载中...</div>}
            {props.transferUsers.length > 0 && props.transferUserFinished && !props.transferUserLoading && (
              <div class="transfer-load-status">已加载全部</div>
            )}
            {props.transferUsers.length > 0 && !props.transferUserFinished && (
              <div ref={transferLoadSentinelRef} class="transfer-load-sentinel" />
            )}
          </div>
        </Modal>

        <Modal
          open={props.terminateVisible}
          title="确认终止巡检"
          width={460}
          wrapClassName="screen-modal-wrap draggable-modal-wrap"
          class="screen-modal"
          onCancel={props.onCloseTerminate}
          onOk={props.onConfirmTerminate}
          okText="确认终止"
          okButtonProps={{ danger: true }}
          cancelText="取消"
        >
          <p>确定要终止任务 {props.terminateTask?.name} 吗？</p>
          <p>终止后该任务将标记为“已终止”状态，巡检进度将被冻结。</p>
        </Modal>
      </>
    );
  },
});
