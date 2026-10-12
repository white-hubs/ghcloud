import { defineStore } from "pinia";

import type { ProjectPageVO } from "@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto";

interface ProjectState {
  currentProject: ProjectPageVO | null;
  projects: ProjectPageVO[];
}

export const projectStore = defineStore("project", {
  state: (): ProjectState => {
    return {
      currentProject: null,
      projects: [],
    };
  },
  getters: {},
  actions: {
    updateCurrentProject(project: ProjectPageVO) {
      this.currentProject = project;
    },
    updateAllProjects(projects: ProjectPageVO[]) {
      this.projects = projects;
    },
    clearCurrentProject() {
      this.currentProject = null;
    },
  },
});
