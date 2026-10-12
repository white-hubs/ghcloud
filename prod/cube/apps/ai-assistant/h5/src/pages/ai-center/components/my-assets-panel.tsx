import { Icon, Popup, showToast } from "vant";
import { defineComponent, shallowRef, type PropType, type VNode } from "vue";

import type { AiCenterAgent, AiCenterSkill, AiCenterSkillCategory } from "../types";
import { ActionPill } from "./action-pill";

import styles from "../ai-center.module.less";

const PERMISSION_OPTIONS = [
  { value: "private", icon: "🔒", title: "仅自己可见", description: "只有你自己可以使用" },
  { value: "department", icon: "🏢", title: "部门可见", description: "同部门成员可以使用" },
  { value: "company", icon: "🌐", title: "全公司可见", description: "所有人都可以使用" },
] as const;

type PermissionValue = (typeof PERMISSION_OPTIONS)[number]["value"];

export const MyAssetsPanel = defineComponent({
  name: "MyAssetsPanel",
  props: {
    agents: {
      type: Array as PropType<AiCenterAgent[]>,
      required: true,
    },
    skills: {
      type: Array as PropType<AiCenterSkill[]>,
      required: true,
    },
    getSkillCategory: {
      type: Function as PropType<(skill: AiCenterSkill) => AiCenterSkillCategory | undefined>,
      required: true,
    },
    loadingAgents: {
      type: Boolean,
      default: false,
    },
    agentError: {
      type: String,
      default: "",
    },
    loadingSkills: {
      type: Boolean,
      default: false,
    },
    skillError: {
      type: String,
      default: "",
    },
    onRemoveAgent: {
      type: Function as PropType<(id: string) => void | Promise<void>>,
      required: true,
    },
    onViewAgent: {
      type: Function as PropType<(id: string) => void>,
      required: true,
    },
    onRemoveSkill: {
      type: Function as PropType<(id: string) => void | Promise<void>>,
      required: true,
    },
  },
  setup: (props): (() => VNode) => {
    const permissionAgent = shallowRef<AiCenterAgent | null>(null);
    const permissionValue = shallowRef<PermissionValue>("private");
    const permissionOverrides = shallowRef<Record<string, string>>({});

    const openPermissionDialog = (agent: AiCenterAgent): void => {
      permissionAgent.value = agent;
      const current = permissionOverrides.value[agent.id] ?? agent.visibility ?? "仅自己可见";
      permissionValue.value = PERMISSION_OPTIONS.find((item) => item.title === current)?.value ?? "private";
    };

    const closePermissionDialog = (): void => {
      permissionAgent.value = null;
    };

    const confirmPermission = (): void => {
      const agent = permissionAgent.value;
      if (!agent) {
        return;
      }
      const option = PERMISSION_OPTIONS.find((item) => item.value === permissionValue.value) ?? PERMISSION_OPTIONS[0];
      permissionOverrides.value = {
        ...permissionOverrides.value,
        [agent.id]: option.title,
      };
      closePermissionDialog();
      showToast("权限已修改");
    };

    const readVisibility = (agent: AiCenterAgent): string | undefined => permissionOverrides.value[agent.id] ?? agent.visibility;

    return (): VNode => (
      <section class={[styles.panel, styles.myPanel]}>
        <div class={styles.panelScroll}>
          <section class={styles.mySection}>
            <h2>
              我的技能 <small>{props.skills.length}个</small>
            </h2>
            <div class={styles.mySkillList}>
              {props.loadingSkills ? <div class={styles.emptyState}>我的技能加载中...</div> : null}
              {!props.loadingSkills && props.skillError ? <div class={styles.emptyState}>{props.skillError}</div> : null}
              {!props.loadingSkills && !props.skillError
                ? props.skills.map((skill) => {
                    const category = props.getSkillCategory(skill);
                    return (
                      <article key={skill.id} class={styles.mySkillCard}>
                        <div class={styles.mySkillMain}>
                          <span class={styles.mySkillIcon}>{skill.icon}</span>
                          <div>
                            <strong>{skill.name}</strong>
                            <p>{skill.description}</p>
                          </div>
                        </div>
                        <span class={styles.typeTag}>{category?.name ?? "其他"}</span>
                        <ActionPill
                          added={false}
                          remove
                          onPress={() => {
                            props.onRemoveSkill(skill.id);
                          }}
                        />
                      </article>
                    );
                  })
                : null}
              {!props.loadingSkills && !props.skillError && props.skills.length === 0 ? (
                <div class={styles.emptyState}>暂无我的技能</div>
              ) : null}
            </div>
          </section>
          <section class={styles.mySection}>
            <h2>
              我的智能体 <small>{props.agents.length}个</small>
            </h2>
            <div class={styles.myAgentList}>
              {props.loadingAgents ? <div class={styles.emptyState}>我的智能体加载中...</div> : null}
              {!props.loadingAgents && props.agentError ? <div class={styles.emptyState}>{props.agentError}</div> : null}
              {!props.loadingAgents && !props.agentError
                ? props.agents.map((agent) => (
                    <article key={agent.id} class={styles.myAgentCard}>
                      <div class={styles.myAgentTop}>
                        <div class={styles.agentIcon}>{agent.icon}</div>
                        <div class={styles.agentInfo}>
                          <h3>{agent.name}</h3>
                          <p>{agent.description}</p>
                        </div>
                      </div>
                      <div class={styles.myAgentActions}>
                        <button
                          type="button"
                          onClick={() => {
                            props.onViewAgent(agent.id);
                          }}
                        >
                          查看详情
                        </button>
                        <ActionPill
                          added={false}
                          remove
                          onPress={() => {
                            props.onRemoveAgent(agent.id);
                          }}
                        />
                      </div>
                    </article>
                  ))
                : null}
              {!props.loadingAgents && !props.agentError && props.agents.length === 0 ? (
                <div class={styles.emptyState}>暂无我的智能体</div>
              ) : null}
            </div>
          </section>
        </div>
        <Popup
          show={permissionAgent.value != null}
          position="bottom"
          round
          class={styles.permissionPopup}
          onClickOverlay={closePermissionDialog}
        >
          <div class={styles.permissionPanel}>
            <div class={styles.permissionHeader}>
              <div>
                <h3>修改权限</h3>
                <p>设置「{permissionAgent.value?.name ?? ""}」的可见范围</p>
              </div>
              <button type="button" aria-label="关闭" onClick={closePermissionDialog}>
                <Icon name="cross" size="18" />
              </button>
            </div>
            <div class={styles.permissionOptions}>
              {PERMISSION_OPTIONS.map((item) => {
                const checked = permissionValue.value === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    class={[styles.permissionOption, checked ? styles.permissionOptionActive : ""]}
                    onClick={() => {
                      permissionValue.value = item.value;
                    }}
                  >
                    <span class={styles.permissionIcon}>{item.icon}</span>
                    <span class={styles.permissionText}>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>
                    <span class={[styles.permissionRadio, checked ? styles.permissionRadioActive : ""]} />
                  </button>
                );
              })}
            </div>
            <div class={styles.permissionActions}>
              <button type="button" onClick={closePermissionDialog}>
                取消
              </button>
              <button type="button" onClick={confirmPermission}>
                确定
              </button>
            </div>
          </div>
        </Popup>
      </section>
    );
  },
});
