import { showToast } from "vant";
import { computed, onMounted, shallowRef } from "vue";

import { loadAssistantAgentOptions, loadAssistantSkillOptions } from "../assistant-assets-store";
import { fetchLibraryAgents, fetchMyAgents, installLibraryAgent, removeMyAgent } from "./agent-service";
import { deriveSkillCategories, fetchLibrarySkills, fetchMySkills, installLibrarySkill, removeMySkill } from "./skill-service";
import type { AiCenterAgent, AiCenterSkill } from "./types";

function includesKeyword(value: string, keyword: string): boolean {
  return value.toLowerCase().includes(keyword.toLowerCase());
}

export function useAiCenter() {
  const activeTab = shallowRef<"agents" | "skills" | "mine">("agents");
  const agentKeyword = shallowRef("");
  const skillKeyword = shallowRef("");
  const activeSkillCategoryId = shallowRef("");
  const agents = shallowRef<AiCenterAgent[]>([]);
  const myAgentList = shallowRef<AiCenterAgent[]>([]);
  const skills = shallowRef<AiCenterSkill[]>([]);
  const mySkillList = shallowRef<AiCenterSkill[]>([]);
  const loadingAgents = shallowRef(false);
  const loadingMyAgents = shallowRef(false);
  const loadingSkills = shallowRef(false);
  const loadingMySkills = shallowRef(false);
  const agentError = shallowRef("");
  const myAgentError = shallowRef("");
  const skillError = shallowRef("");
  const mySkillError = shallowRef("");

  const myAgentIdSet = computed(
    () => new Set(myAgentList.value.flatMap((agent) => [agent.id, agent.libraryRef].filter(Boolean) as string[])),
  );
  const mySkillIdSet = computed(
    () => new Set(mySkillList.value.flatMap((skill) => [skill.id, skill.libraryRef].filter(Boolean) as string[])),
  );

  const filteredAgents = computed(() => {
    const keyword = agentKeyword.value.trim();
    if (!keyword) {
      return agents.value;
    }
    return agents.value.filter((item) => includesKeyword(`${item.name} ${item.description} ${item.categoryName}`, keyword));
  });

  const groupedAgents = computed(() => {
    const groups = new Map<string, { id: string; name: string; agents: AiCenterAgent[] }>();
    for (const agent of filteredAgents.value) {
      const group = groups.get(agent.categoryId) ?? { id: agent.categoryId, name: agent.categoryName, agents: [] };
      group.agents.push(agent);
      groups.set(agent.categoryId, group);
    }
    return Array.from(groups.values());
  });

  const visibleSkills = computed(() => {
    const keyword = skillKeyword.value.trim();
    return skills.value.filter((item) => {
      const matchesCategory = item.categoryId === activeSkillCategoryId.value;
      if (!matchesCategory) {
        return false;
      }
      return !keyword || includesKeyword(`${item.name} ${item.description}`, keyword);
    });
  });

  const myAgents = computed(() => myAgentList.value);
  const mySkills = computed(() => mySkillList.value);
  const skillCategories = computed(() => deriveSkillCategories(skills.value));

  const skillCountsByCategory = computed(() => {
    const result = new Map<string, number>();
    for (const category of skillCategories.value) {
      result.set(category.id, skills.value.filter((item) => item.categoryId === category.id).length);
    }
    return result;
  });

  const loadAgents = async (): Promise<void> => {
    loadingAgents.value = true;
    agentError.value = "";
    try {
      agents.value = await fetchLibraryAgents();
    } catch (error) {
      agents.value = [];
      agentError.value = "智能体广场加载失败";
      showToast(error instanceof Error ? error.message : agentError.value);
    } finally {
      loadingAgents.value = false;
    }
  };

  const loadSkills = async (): Promise<void> => {
    loadingSkills.value = true;
    skillError.value = "";
    try {
      const loadedSkills = await fetchLibrarySkills();
      const installedIds = mySkillIdSet.value;
      skills.value = loadedSkills.map((skill) => ({
        ...skill,
        installed: installedIds.has(skill.libraryRef ?? skill.id),
      }));
      if (!activeSkillCategoryId.value || !skillCategories.value.some((category) => category.id === activeSkillCategoryId.value)) {
        activeSkillCategoryId.value = skillCategories.value[0]?.id ?? "";
      }
    } catch (error) {
      skills.value = [];
      skillError.value = "技能库加载失败";
      showToast(error instanceof Error ? error.message : skillError.value);
    } finally {
      loadingSkills.value = false;
    }
  };

  const loadMySkills = async (): Promise<void> => {
    loadingMySkills.value = true;
    mySkillError.value = "";
    try {
      mySkillList.value = await fetchMySkills();
      const installedIds = mySkillIdSet.value;
      skills.value = skills.value.map((skill) => ({
        ...skill,
        installed: installedIds.has(skill.libraryRef ?? skill.id),
      }));
    } catch (error) {
      mySkillList.value = [];
      mySkillError.value = "我的技能加载失败";
      showToast(error instanceof Error ? error.message : mySkillError.value);
    } finally {
      loadingMySkills.value = false;
    }
  };

  const loadMyAgents = async (): Promise<void> => {
    loadingMyAgents.value = true;
    myAgentError.value = "";
    try {
      myAgentList.value = await fetchMyAgents();
      const installedIds = myAgentIdSet.value;
      agents.value = agents.value.map((agent) => ({ ...agent, installed: installedIds.has(agent.libraryRef ?? agent.id) }));
    } catch (error) {
      myAgentList.value = [];
      myAgentError.value = "我的智能体加载失败";
      showToast(error instanceof Error ? error.message : myAgentError.value);
    } finally {
      loadingMyAgents.value = false;
    }
  };

  const addAgent = async (id: string): Promise<void> => {
    const target = agents.value.find((item) => item.id === id || item.libraryRef === id);
    const ref = target?.libraryRef ?? id;
    if (myAgentIdSet.value.has(ref)) {
      return;
    }
    await installLibraryAgent(ref);
    agents.value = agents.value.map((agent) => (agent.libraryRef === ref || agent.id === ref ? { ...agent, installed: true } : agent));
    await loadMyAgents();
    void loadAssistantAgentOptions();
  };

  const removeAgent = async (id: string): Promise<void> => {
    const target = myAgentList.value.find((agent) => agent.id === id);
    if (!target) {
      return;
    }
    await removeMyAgent(target);
    myAgentList.value = myAgentList.value.filter((agent) => agent.id !== id);
    const ref = target.libraryRef ?? target.id;
    agents.value = agents.value.map((agent) => (agent.libraryRef === ref || agent.id === ref ? { ...agent, installed: false } : agent));
    void loadAssistantAgentOptions();
  };

  const addSkill = async (id: string): Promise<void> => {
    const target = skills.value.find((item) => item.id === id || item.libraryRef === id);
    const ref = target?.libraryRef ?? id;
    if (mySkillIdSet.value.has(ref)) {
      return;
    }
    await installLibrarySkill(ref);
    skills.value = skills.value.map((skill) => (skill.libraryRef === ref || skill.id === ref ? { ...skill, installed: true } : skill));
    await loadMySkills();
    void loadAssistantSkillOptions().catch(() => undefined);
  };

  const removeSkill = async (id: string): Promise<void> => {
    const target = mySkillList.value.find((skill) => skill.id === id || skill.libraryRef === id);
    if (!target) {
      return;
    }
    await removeMySkill(target);
    mySkillList.value = mySkillList.value.filter((skill) => skill.id !== id);
    const ref = target.libraryRef ?? target.id;
    skills.value = skills.value.map((skill) => (skill.libraryRef === ref || skill.id === ref ? { ...skill, installed: false } : skill));
    void loadAssistantSkillOptions().catch(() => undefined);
  };

  const getSkillCategory = (skill: AiCenterSkill) => skillCategories.value.find((category) => category.id === skill.categoryId);

  onMounted(() => {
    void Promise.all([loadAgents(), loadMyAgents(), loadSkills(), loadMySkills()]);
  });

  return {
    activeTab,
    agentKeyword,
    skillKeyword,
    activeSkillCategoryId,
    agents,
    skills,
    skillCategories,
    groupedAgents,
    visibleSkills,
    myAgents,
    mySkills,
    myAgentIdSet,
    mySkillIdSet,
    skillCountsByCategory,
    loadingAgents,
    loadingMyAgents,
    loadingSkills,
    loadingMySkills,
    agentError,
    myAgentError,
    skillError,
    mySkillError,
    getSkillCategory,
    loadAgents,
    loadMyAgents,
    loadSkills,
    loadMySkills,
    addAgent,
    removeAgent,
    addSkill,
    removeSkill,
  };
}
