import { Button, Calendar, Cell, CellGroup, Empty, Tabs, Tab, Tag, showConfirmDialog, showToast } from "vant";
import { computed, defineComponent, onMounted, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { EmployeeCertVO, PersonProfileVO, ResumeDayGroupVO, ResumeItemVO } from "@ghcloud/cube-service-interface/safety-personnel";
import {
  deletePerson,
  getPersonCertificates,
  getPersonProfile,
  getPersonResumeByType,
  getPersonResumeTimeline,
} from "@ghcloud/cube-services-client/safety-personnel.client";

import { Bar } from "@/components/bar/bar";
import { PERSON_TYPE_LABEL, RESUME_TYPE_OPTIONS, type PersonnelTypeCode } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { maskPhone, pickFirstText } from "@/utils";
import { formatDate, formatDateTime } from "@/utils/format-datetime";

import styles from "./personnel.module.less";

export const PersonnelDetailPage = defineComponent({
  name: "PersonnelDetailPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const id = String(route.query.id ?? "");
    const validId = id.trim().length > 0;
    const profile = ref<PersonProfileVO | null>(null);
    const certs = ref<EmployeeCertVO[]>([]);
    const timeline = ref<ResumeDayGroupVO[]>([]);
    const typedRecords = ref<ResumeItemVO[]>([]);
    const activeResumeType = ref("timeline");
    const resumeCalendarVisible = ref(false);
    const resumeRange = ref<[Date, Date] | null>(null);

    const loadTimeline = async (): Promise<void> => {
      if (!validId) return;
      const query = resumeRange.value
        ? {
            startDate: formatDate(resumeRange.value[0]),
            endDate: formatDate(resumeRange.value[1]),
          }
        : undefined;
      timeline.value = (await useAuthRequest(() => getPersonResumeTimeline(id, query))) ?? [];
    };

    const loadDetail = async (): Promise<void> => {
      if (!validId) return;
      const [profileResult, certResult] = await Promise.all([
        useAuthRequest(() => getPersonProfile(id)),
        useAuthRequest(() => getPersonCertificates(id)),
      ]);
      profile.value = profileResult;
      certs.value = certResult ?? [];
      await loadTimeline();
    };

    const loadResumeByType = async (type: string): Promise<void> => {
      activeResumeType.value = type;
      if (type === "timeline") {
        await loadTimeline();
        return;
      }
      typedRecords.value = await useAuthRequest(() => getPersonResumeByType(id, type));
    };

    const removePerson = async (): Promise<void> => {
      if (!validId) {
        showToast("安全人员参数无效");
        return;
      }
      await showConfirmDialog({
        title: "移除人员",
        message: `确认移除 ${profile.value?.userName ?? "该人员"}？`,
      });
      await useAuthRequest(() => deletePerson(id));
      showToast("已移除");
      router.back();
    };

    const parseTime = (value?: string | number | Date | null): number => {
      if (value == null || value === "") return Number.NaN;
      const normalizedValue = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
      const time = new Date(normalizedValue).getTime();
      return Number.isFinite(time) ? time : Number.NaN;
    };

    const inResumeRange = (record: ResumeItemVO): boolean => {
      if (!resumeRange.value) return true;
      const time = parseTime(record.recordTime);
      if (!Number.isFinite(time)) return false;
      const [start, end] = resumeRange.value;
      const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
      const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).getTime();
      return time >= startTime && time <= endTime;
    };

    const filteredTimeline = computed(() =>
      timeline.value
        .map((group) => ({
          ...group,
          records: (group.records ?? []).filter(inResumeRange),
        }))
        .filter((group) => group.records.length > 0),
    );

    const filteredTypedRecords = computed(() => typedRecords.value.filter(inResumeRange));

    const resumeRangeText = computed(() => {
      if (!resumeRange.value) return "全部时间";
      const [start, end] = resumeRange.value;
      return `${formatDate(start)} 至 ${formatDate(end)}`;
    });

    const refreshCurrentResume = async (): Promise<void> => {
      if (activeResumeType.value === "timeline") {
        await loadTimeline();
        return;
      }
      await loadResumeByType(activeResumeType.value);
    };

    const confirmResumeRange = (value: Date | Date[]): void => {
      const dates = Array.isArray(value) ? value : [value, value];
      if (dates[0] && dates[1]) {
        resumeRange.value = [dates[0], dates[1]];
      }
      resumeCalendarVisible.value = false;
      void refreshCurrentResume();
    };

    onMounted(() => {
      if (!validId) {
        showToast("安全人员参数无效");
        router.back();
        return;
      }
      void loadDetail();
    });

    const renderBasic = (): VNode => (
      <div class={styles.detailSection}>
        <CellGroup inset>
          <Cell title="姓名" value={pickFirstText(profile.value?.userName)} />
          <Cell title="手机号" value={maskPhone(profile.value?.phone)} />
          <Cell title="单位" value={pickFirstText(profile.value?.companyName)} />
          <Cell title="部门" value={pickFirstText(profile.value?.deptName)} />
          <Cell title="岗位" value={pickFirstText(profile.value?.postName)} />
          <Cell
            title="人员类型"
            value={(profile.value?.typeCodes ?? []).map((code) => PERSON_TYPE_LABEL[code as PersonnelTypeCode] ?? code).join("、") || "-"}
          />
        </CellGroup>
      </div>
    );

    const renderCerts = (): VNode => (
      <div class={styles.detailSection}>
        {certs.value.length ? (
          certs.value.map((cert) => (
            <div class={styles.certCard} key={cert.id}>
              <div class={styles.cardHeader}>
                <div class={styles.name}>{cert.certName || cert.typeName || "-"}</div>
                {cert.expireStatus ? <Tag type={cert.expireStatus === "EXPIRED" ? "danger" : "primary"}>{cert.expireStatus}</Tag> : null}
              </div>
              <div class={styles.metaGrid}>
                <span>证书编号：{pickFirstText(cert.certNo)}</span>
                <span>发证机构：{pickFirstText(cert.issueOrg)}</span>
                <span>
                  有效期：{formatDate(cert.validStart)} 至 {formatDate(cert.validEnd)}
                </span>
                <span>复审：{pickFirstText(cert.reviewStatus)}</span>
              </div>
            </div>
          ))
        ) : (
          <Empty description="暂无证书" />
        )}
      </div>
    );

    const renderTimeline = (): VNode => (
      <div class={styles.detailSection}>
        <div class={styles.resumeFilter}>
          <button
            type="button"
            class={styles.filterTrigger}
            onClick={() => {
              resumeCalendarVisible.value = true;
            }}
          >
            时间：{resumeRangeText.value}
          </button>
          {resumeRange.value ? (
            <button
              type="button"
              class={styles.filterClear}
              onClick={() => {
                resumeRange.value = null;
                void refreshCurrentResume();
              }}
            >
              重置
            </button>
          ) : null}
        </div>
        <div class={styles.chips}>
          {RESUME_TYPE_OPTIONS.map((item) => (
            <span
              key={item.value}
              class={[styles.chip, activeResumeType.value === item.value ? styles.chipActive : ""].join(" ")}
              onClick={() => void loadResumeByType(item.value)}
            >
              {item.label}
            </span>
          ))}
        </div>
        {activeResumeType.value === "timeline" ? (
          filteredTimeline.value.length ? (
            <div class={styles.timeline}>
              {filteredTimeline.value.map((group) => (
                <div class={styles.timelineGroup} key={group.date}>
                  <div class={styles.timelineDate}>{formatDate(group.date)}</div>
                  {(group.records ?? []).map((record) => (
                    <div class={styles.resumeItem} key={record.id}>
                      <div>{record.name || record.typeName || "-"}</div>
                      <span>{formatDateTime(record.recordTime)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <Empty description="暂无履历" />
          )
        ) : filteredTypedRecords.value.length ? (
          filteredTypedRecords.value.map((record) => (
            <div class={styles.resumeItem} key={record.id}>
              <div>{record.name || record.typeName || "-"}</div>
              <span>{formatDateTime(record.recordTime)}</span>
            </div>
          ))
        ) : (
          <Empty description="暂无记录" />
        )}
      </div>
    );

    return (): VNode => (
      <div class={["page", styles.detailPage].join(" ")}>
        <Bar name="安全人员详情" />
        <div class={styles.detailHeader}>
          <div>
            <div class={styles.name}>{pickFirstText(profile.value?.userName)}</div>
            <div class={styles.phone}>{maskPhone(profile.value?.phone)}</div>
          </div>
        </div>
        <Tabs sticky>
          <Tab title="基础信息">{renderBasic()}</Tab>
          <Tab title="证书">{renderCerts()}</Tab>
          <Tab title="安全履历">{renderTimeline()}</Tab>
        </Tabs>
        <Calendar v-model:show={resumeCalendarVisible.value} type="range" onConfirm={confirmResumeRange} />
        <div class={styles.detailBottomActions}>
          <Button block type="danger" disabled={!validId} onClick={() => void removePerson()}>
            移除
          </Button>
        </div>
      </div>
    );
  },
});
