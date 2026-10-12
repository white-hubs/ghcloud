import { defineAsyncComponent } from "vue";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const ProjectListView = defineAsyncComponent(() => import("./views/project-list-view"));
const ProjectDetailView = defineAsyncComponent(() => import("./views/project-detail-view"));
const EditorView = defineAsyncComponent(() => import("./views/editor-view"));
const ViewerView = defineAsyncComponent(() => import("./views/viewer-view"));

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/projects",
  },
  {
    // Phase 1 legacy redirect: /pages -> /projects
    path: "/pages",
    redirect: "/projects",
  },
  {
    // Phase 1 legacy redirect: /pages/:pageId -> EditorView without project context
    path: "/pages/:pageId",
    redirect: (to) => `/projects/_/pages/${to.params.pageId}`,
  },
  {
    path: "/projects",
    component: ProjectListView,
  },
  {
    path: "/projects/:projectId",
    component: ProjectDetailView,
  },
  {
    path: "/projects/:projectId/pages/:pageId",
    component: EditorView,
  },
  {
    path: "/viewer",
    component: ViewerView,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/projects",
  },
];

export function createStudioRouter(base = "") {
  return createRouter({
    history: createWebHistory(base),
    routes,
  });
}

export default createStudioRouter();
