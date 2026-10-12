import { Button, Empty, Tag, showToast } from "vant";
import { computed, defineComponent, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { SafetyCreditChecklistVO, SafetyCreditId } from "@ghcloud/cube-safety-credit-service";

import { checkExecutionPageSize, checklistItemTotal, executionTitle, uniqueChecklists } from "./shared";
import { cubeSafetyCreditService } from "@/api/server";
import {
  EXECUTABLE_CHECKLIST_STATUS,
  checkExecutionListClass,
  checkExecutionStatusLabel,
  checkExecutionStatusTone,
  checklistStatusLabel,
  isCheckExecutionReadonlyStatus,
} from "@/constants/safety-credit-enums";
import { getCurrentUserId } from "@/utils/current-user";
import { displayText, trimText } from "@/utils/format";
import { readQueryText } from "@/utils/route-query";

import "./check-execution.less";

export const CheckExecutionList = defineComponent({
  name: "CheckExecutionList",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const merchantId = shallowRef<SafetyCreditId>();
    const listLoading = shallowRef(false);
    const checklists = ref<SafetyCreditChecklistVO[]>([]);

    const merchantNameText = computed(() =>
      displayText(
        checklists.value.find((item) => trimText(item.merchantName) !== undefined)?.merchantName ??
          readQueryText(route.query.merchantName, "merchantName") ??
          merchantId.value,
      ),
    );

    function checklistTargetName(record: SafetyCreditChecklistVO): "CheckExecutionDetail" | "CheckExecutionEdit" {
      return isCheckExecutionReadonlyStatus(record.executionStatus) ? "CheckExecutionDetail" : "CheckExecutionEdit";
    }

    function openChecklist(record: SafetyCreditChecklistVO, replace = false): void {
      const readonlyRecord = isCheckExecutionReadonlyStatus(record.executionStatus);
      const target = {
        name: checklistTargetName(record),
        query: {
          checklistId: String(record.id),
          ...(readonlyRecord && record.executionId !== undefined ? { executionId: String(record.executionId) } : {}),
          merchantName: trimText(record.merchantName ?? record.merchantCode ?? merchantId.value),
        },
      };
      void (replace ? router.replace(target) : router.push(target));
    }

    async function loadList(): Promise<void> {
      checklists.value = [];
      listLoading.value = true;
      try {
        const queryChecklistId = readQueryText(route.query.checklistId, "checklistId");
        const queryExecutionId = readQueryText(route.query.executionId, "executionId");
        if (queryChecklistId === undefined && queryExecutionId !== undefined) {
          void router.replace({
            name: "CheckExecutionDetail",
            query: {
              executionId: queryExecutionId,
              merchantName: readQueryText(route.query.merchantName, "merchantName"),
            },
          });
          return;
        }
        const currentUserId = await getCurrentUserId();
        merchantId.value = currentUserId;
        if (currentUserId === undefined) {
          return;
        }
        const pageResult = await cubeSafetyCreditService.pageChecklists({
          merchantId: currentUserId,
          status: EXECUTABLE_CHECKLIST_STATUS,
          pageNumber: 1,
          pageSize: checkExecutionPageSize,
        });
        checklists.value = uniqueChecklists(pageResult.records ?? []);
        if (queryChecklistId !== undefined) {
          const matched = checklists.value.find((item) => String(item.id) === queryChecklistId);
          if (matched !== undefined) {
            openChecklist(matched, true);
          }
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "自查清单加载失败");
      } finally {
        listLoading.value = false;
      }
    }

    function renderListCard(record: SafetyCreditChecklistVO): JSX.Element {
      const readonlyRecord = isCheckExecutionReadonlyStatus(record.executionStatus);
      const total = checklistItemTotal(record);
      return (
        <article class={["check-list-card", checkExecutionListClass(record.executionStatus)]} key={String(record.id)}>
          <div class="check-list-card-head">
            <div class="check-list-title">
              <strong>{executionTitle(record)}</strong>
              <Tag type={checkExecutionStatusTone(record.executionStatus)}>{checkExecutionStatusLabel(record.executionStatus)}</Tag>
            </div>
            <p>
              {displayText(record.merchantName ?? record.merchantCode ?? merchantId.value)} · {checklistStatusLabel(record.status)}
            </p>
          </div>
          <div class="check-list-footer">
            <span>{readonlyRecord ? "已结束" : `共 ${total} 项检查内容`}</span>
            <Button size="small" type="primary" onClick={() => openChecklist(record)}>
              {readonlyRecord ? "查看详情" : "进入自查"}
            </Button>
          </div>
        </article>
      );
    }

    watch(
      () => [route.query.checklistId, route.query.executionId, route.query.merchantName],
      () => {
        void loadList();
      },
      { immediate: true },
    );

    return (): JSX.Element => (
      <main class="check-execution-page">
        <CubeNavBar showBack title="安全自查" />
        <header class="check-list-header">
          <strong>{merchantNameText.value}</strong>
          <span>{checklists.value.length === 0 ? "暂无自查清单" : `共 ${checklists.value.length} 份自查清单`}</span>
        </header>
        {merchantId.value === undefined && !listLoading.value ? (
          <section class="check-empty">
            <Empty description="未获取到当前用户" />
          </section>
        ) : null}
        {listLoading.value ? <section class="check-empty">正在加载...</section> : null}
        {merchantId.value !== undefined && !listLoading.value && checklists.value.length === 0 ? (
          <section class="check-empty">
            <Empty description="暂无自查清单" />
          </section>
        ) : null}
        {checklists.value.length > 0 ? <section class="check-list">{checklists.value.map(renderListCard)}</section> : null}
      </main>
    );
  },
});
