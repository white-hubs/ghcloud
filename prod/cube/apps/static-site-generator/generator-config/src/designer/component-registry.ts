import type { ComponentRegistryItem, ComponentSchema } from "./types";

// 显式导入所有 schema，避免从 ssg-components index.ts 导入导致 Vite 解析 .vue 文件失败
import { schema as AboutCompanyIntroSchema } from "@ghcloud/cube-static-site-generator-components/components/about-company-intro/schema";
import { schema as AboutContactSchema } from "@ghcloud/cube-static-site-generator-components/components/about-contact/schema";
import { schema as AboutHonorTabsSchema } from "@ghcloud/cube-static-site-generator-components/components/about-honor-tabs/schema";
import { schema as AboutTeamGallerySchema } from "@ghcloud/cube-static-site-generator-components/components/about-team-gallery/schema";
import { schema as AppDetailHeroSchema } from "@ghcloud/cube-static-site-generator-components/components/app-detail-hero/schema";
import { schema as AppRecommendationsSchema } from "@ghcloud/cube-static-site-generator-components/components/app-recommendations/schema";
import { schema as ApplicationSceneSchema } from "@ghcloud/cube-static-site-generator-components/components/application-scene/schema";
import { schema as ArticleDetailSchema } from "@ghcloud/cube-static-site-generator-components/components/article-detail/schema";
import { schema as AssetLibrarySchema } from "@ghcloud/cube-static-site-generator-components/components/asset-library/schema";
import { schema as BrandLogosSchema } from "@ghcloud/cube-static-site-generator-components/components/brand-logos/schema";
import { schema as BusinessIconMarqueeSchema } from "@ghcloud/cube-static-site-generator-components/components/business-icon-marquee/schema";
import { schema as CapabilityDetailsSchema } from "@ghcloud/cube-static-site-generator-components/components/capability-details/schema";
import { schema as CaseCardSchema } from "@ghcloud/cube-static-site-generator-components/components/case-card/schema";
import { schema as CaseDetailSchema } from "@ghcloud/cube-static-site-generator-components/components/case-detail/schema";
import { schema as CaseShowcaseSimpleSchema } from "@ghcloud/cube-static-site-generator-components/components/case-showcase-simple/schema";
import { schema as CaseShowcaseSchema } from "@ghcloud/cube-static-site-generator-components/components/case-showcase/schema";
import { schema as CaseSolutionSchema } from "@ghcloud/cube-static-site-generator-components/components/case-solution/schema";
import { schema as CaseVideoShowcaseSchema } from "@ghcloud/cube-static-site-generator-components/components/case-video-showcase/schema";
import { schema as CategoryTabsSchema } from "@ghcloud/cube-static-site-generator-components/components/category-tabs/schema";
import { schema as ConsultationFormSchema } from "@ghcloud/cube-static-site-generator-components/components/consultation-form/schema";
import { schema as CoreTechStackSchema } from "@ghcloud/cube-static-site-generator-components/components/core-tech-stack/schema";
import { schema as DerivativeProductGridSchema } from "@ghcloud/cube-static-site-generator-components/components/derivative-product-grid/schema";
import { schema as EngineCardsSchema } from "@ghcloud/cube-static-site-generator-components/components/engine-cards/schema";
import { schema as EngineFeaturesSchema } from "@ghcloud/cube-static-site-generator-components/components/engine-features/schema";
import { schema as FloatingSidebarSchema } from "@ghcloud/cube-static-site-generator-components/components/floating-sidebar/schema";
import { schema as HardwareProductsSchema } from "@ghcloud/cube-static-site-generator-components/components/hardware-products/schema";
import { schema as IndustryCasesSchema } from "@ghcloud/cube-static-site-generator-components/components/industry-cases/schema";
import { schema as IntelligentAnalysisSchema } from "@ghcloud/cube-static-site-generator-components/components/intelligent-analysis/schema";
import { schema as IntelligentHubSchema } from "@ghcloud/cube-static-site-generator-components/components/intelligent-hub/schema";
import { schema as ManagedAdvantagesSchema } from "@ghcloud/cube-static-site-generator-components/components/managed-advantages/schema";
import { schema as ModelTransformSchema } from "@ghcloud/cube-static-site-generator-components/components/model-transform/schema";
import { schema as ModelingAssetLibrarySchema } from "@ghcloud/cube-static-site-generator-components/components/modeling-asset-library/schema";
import { schema as ModelingBeautySchema } from "@ghcloud/cube-static-site-generator-components/components/modeling-beauty/schema";
import { schema as NavMenuSchema } from "@ghcloud/cube-static-site-generator-components/components/nav-menu/schema";
import { schema as NewsSectionSchema } from "@ghcloud/cube-static-site-generator-components/components/news-section/schema";
import { schema as PaginationSchema } from "@ghcloud/cube-static-site-generator-components/components/pagination/schema";
import { schema as PainPointsSchema } from "@ghcloud/cube-static-site-generator-components/components/pain-points/schema";
import { schema as ProcessFlowSchema } from "@ghcloud/cube-static-site-generator-components/components/process-flow/schema";
import { schema as ProductApplicationSchema } from "@ghcloud/cube-static-site-generator-components/components/product-application/schema";
import { schema as ProductDetailAnchorSchema } from "@ghcloud/cube-static-site-generator-components/components/product-detail-anchor/schema";
import { schema as ProductDetailHeroSchema } from "@ghcloud/cube-static-site-generator-components/components/product-detail-hero/schema";
import { schema as EvaluationStandardsSchema } from "@ghcloud/cube-static-site-generator-components/components/evaluation-standards/schema";
import { schema as SupportCardsSchema } from "@ghcloud/cube-static-site-generator-components/components/support-cards/schema";
import { schema as ProductMatrixSchema } from "@ghcloud/cube-static-site-generator-components/components/product-matrix/schema";
import { schema as ProductSearchHeroSchema } from "@ghcloud/cube-static-site-generator-components/components/product-search-hero/schema";
import { schema as ProtocolTagsSchema } from "@ghcloud/cube-static-site-generator-components/components/protocol-tags/schema";
import { schema as RichTextSchema } from "@ghcloud/cube-static-site-generator-components/components/rich-text/schema";
import { schema as ScenarioCarouselSchema } from "@ghcloud/cube-static-site-generator-components/components/scenario-carousel/schema";
import { schema as SceneCaseSchema } from "@ghcloud/cube-static-site-generator-components/components/scene-case/schema";
import { schema as ServiceAdvantagesSchema } from "@ghcloud/cube-static-site-generator-components/components/service-advantages/schema";
import { schema as ServiceOverviewSchema } from "@ghcloud/cube-static-site-generator-components/components/service-overview/schema";
import { schema as ServiceTeamSchema } from "@ghcloud/cube-static-site-generator-components/components/service-team/schema";
import { schema as SiteFooterSchema } from "@ghcloud/cube-static-site-generator-components/components/site-footer/schema";
import { schema as SolutionDesignSchema } from "@ghcloud/cube-static-site-generator-components/components/solution-design/schema";
import { schema as SupportingProductsSchema } from "@ghcloud/cube-static-site-generator-components/components/supporting-products/schema";
import { schema as SwiperCarouselSchema } from "@ghcloud/cube-static-site-generator-components/components/swiper-carousel/schema";
import { schema as ValuePropositionSchema } from "@ghcloud/cube-static-site-generator-components/components/value-proposition/schema";
import { schema as VideoPlayerSchema } from "@ghcloud/cube-static-site-generator-components/components/video-player/schema";

const SCHEMA_MAP: Record<string, ComponentSchema> = {
  AboutCompanyIntro: AboutCompanyIntroSchema as ComponentSchema,
  AboutContact: AboutContactSchema as ComponentSchema,
  AboutHonorTabs: AboutHonorTabsSchema as ComponentSchema,
  AboutTeamGallery: AboutTeamGallerySchema as ComponentSchema,
  AppDetailHero: AppDetailHeroSchema as ComponentSchema,
  AppRecommendations: AppRecommendationsSchema as ComponentSchema,
  ApplicationScene: ApplicationSceneSchema as ComponentSchema,
  ArticleDetail: ArticleDetailSchema as ComponentSchema,
  AssetLibrary: AssetLibrarySchema as ComponentSchema,
  BrandLogos: BrandLogosSchema as ComponentSchema,
  BusinessIconMarquee: BusinessIconMarqueeSchema as ComponentSchema,
  CapabilityDetails: CapabilityDetailsSchema as ComponentSchema,
  CaseCard: CaseCardSchema as ComponentSchema,
  CaseDetail: CaseDetailSchema as ComponentSchema,
  CaseShowcaseSimple: CaseShowcaseSimpleSchema as ComponentSchema,
  CaseShowcase: CaseShowcaseSchema as ComponentSchema,
  CaseSolution: CaseSolutionSchema as ComponentSchema,
  CaseVideoShowcase: CaseVideoShowcaseSchema as ComponentSchema,
  CategoryTabs: CategoryTabsSchema as ComponentSchema,
  ConsultationForm: ConsultationFormSchema as ComponentSchema,
  CoreTechStack: CoreTechStackSchema as ComponentSchema,
  DerivativeProductGrid: DerivativeProductGridSchema as ComponentSchema,
  EngineCards: EngineCardsSchema as ComponentSchema,
  EngineFeatures: EngineFeaturesSchema as ComponentSchema,
  FloatingSidebar: FloatingSidebarSchema as ComponentSchema,
  HardwareProducts: HardwareProductsSchema as ComponentSchema,
  IndustryCases: IndustryCasesSchema as ComponentSchema,
  IntelligentAnalysis: IntelligentAnalysisSchema as ComponentSchema,
  IntelligentHub: IntelligentHubSchema as ComponentSchema,
  ManagedAdvantages: ManagedAdvantagesSchema as ComponentSchema,
  ModelTransform: ModelTransformSchema as ComponentSchema,
  ModelingAssetLibrary: ModelingAssetLibrarySchema as ComponentSchema,
  ModelingBeauty: ModelingBeautySchema as ComponentSchema,
  NavMenu: NavMenuSchema as ComponentSchema,
  NewsSection: NewsSectionSchema as ComponentSchema,
  PainPoints: PainPointsSchema as ComponentSchema,
  Pagination: PaginationSchema as ComponentSchema,
  ProductApplication: ProductApplicationSchema as ComponentSchema,
  ProductDetailAnchor: ProductDetailAnchorSchema as ComponentSchema,
  ProductDetailHero: ProductDetailHeroSchema as ComponentSchema,
  ProductMatrix: ProductMatrixSchema as ComponentSchema,
  ProductSearchHero: ProductSearchHeroSchema as ComponentSchema,
  ProtocolTags: ProtocolTagsSchema as ComponentSchema,
  RichText: RichTextSchema as ComponentSchema,
  ScenarioCarousel: ScenarioCarouselSchema as ComponentSchema,
  SceneCase: SceneCaseSchema as ComponentSchema,
  ServiceAdvantages: ServiceAdvantagesSchema as ComponentSchema,
  ServiceOverview: ServiceOverviewSchema as ComponentSchema,
  ServiceTeam: ServiceTeamSchema as ComponentSchema,
  SiteFooter: SiteFooterSchema as ComponentSchema,
  ProcessFlow: ProcessFlowSchema as ComponentSchema,
  EvaluationStandards: EvaluationStandardsSchema as ComponentSchema,
  SupportCards: SupportCardsSchema as ComponentSchema,
  SolutionDesign: SolutionDesignSchema as ComponentSchema,
  SupportingProducts: SupportingProductsSchema as ComponentSchema,
  SwiperCarousel: SwiperCarouselSchema as ComponentSchema,
  ValueProposition: ValuePropositionSchema as ComponentSchema,
  VideoPlayer: VideoPlayerSchema as ComponentSchema,
};

/**
 * 组件分组映射
 */
const CATEGORY_MAP: Record<string, string> = {
  // 布局
  NavMenu: "布局",
  SiteFooter: "布局",
  FloatingSidebar: "布局",
  // Banner与头部
  SwiperCarousel: "Banner与头部",
  ProductSearchHero: "Banner与头部",
  AppDetailHero: "Banner与头部",
  ProductDetailHero: "Banner与头部",
  CaseVideoShowcase: "Banner与头部",
  EngineCards: "Banner与头部",
  ProductMatrix: "Banner与头部",
  // 能力与展示
  EngineFeatures: "能力与展示",
  CapabilityDetails: "能力与展示",
  ValueProposition: "能力与展示",
  CoreTechStack: "能力与展示",
  IntelligentHub: "能力与展示",
  IntelligentAnalysis: "能力与展示",
  ProtocolTags: "能力与展示",
  ModelTransform: "能力与展示",
  ProductApplication: "能力与展示",
  ApplicationScene: "能力与展示",
  ScenarioCarousel: "能力与展示",
  SolutionDesign: "能力与展示",
  // 产品与资源
  HardwareProducts: "产品与资源",
  CategoryTabs: "产品与资源",
  AppRecommendations: "产品与资源",
  DerivativeProductGrid: "产品与资源",
  SupportingProducts: "产品与资源",
  AssetLibrary: "产品与资源",
  ModelingAssetLibrary: "产品与资源",
  ManagedAdvantages: "产品与资源",
  // 案例与行业
  IndustryCases: "案例与行业",
  CaseCard: "案例与行业",
  CaseShowcase: "案例与行业",
  CaseShowcaseSimple: "案例与行业",
  CaseDetail: "案例与行业",
  CaseSolution: "案例与行业",
  PainPoints: "案例与行业",
  BrandLogos: "案例与行业",
  BusinessIconMarquee: "案例与行业",
  // 内容与关于
  RichText: "内容与关于",
  ArticleDetail: "内容与关于",
  VideoPlayer: "内容与关于",
  NewsSection: "内容与关于",
  SceneCase: "内容与关于",
  ModelingBeauty: "内容与关于",
  AboutCompanyIntro: "内容与关于",
  AboutContact: "内容与关于",
  AboutHonorTabs: "内容与关于",
  AboutTeamGallery: "内容与关于",
  ServiceAdvantages: "能力与展示",
  ServiceOverview: "能力与展示",
  ServiceTeam: "能力与展示",
  ProcessFlow: "能力与展示",
  EvaluationStandards: "能力与展示",
  SupportCards: "能力与展示",
  // 表单与交互
  ConsultationForm: "表单与交互",
  Pagination: "表单与交互",
  ProductDetailAnchor: "表单与交互",
};

/**
 * 布局专属组件名称列表
 * 布局模式下只显示这些组件 + __slot__
 */
export const LAYOUT_COMPONENT_NAMES = new Set<string>(["NavMenu", "SiteFooter", "FloatingSidebar", "__slot__"]);

/**
 * 判断组件是否为布局组件
 */
export function isLayoutComponent(name: string): boolean {
  return LAYOUT_COMPONENT_NAMES.has(name);
}

/**
 * 从 schema map 构建组件注册表
 */
function buildRegistry(): Map<string, ComponentRegistryItem> {
  const registry = new Map<string, ComponentRegistryItem>();

  for (const [name, schema] of Object.entries(SCHEMA_MAP)) {
    registry.set(name, {
      name,
      title: schema.title ?? name,
      description: schema.description ?? "",
      category: CATEGORY_MAP[name],
      interactive: schema.interactive ?? false,
      schema,
    });
  }

  return registry;
}

/** 全局组件注册表 */
const REGISTRY = buildRegistry();

/**
 * 获取所有可用组件（页面模式）
 */
export function getAllComponents(): ComponentRegistryItem[] {
  return Array.from(REGISTRY.values()).sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
}

/**
 * 获取布局模式可用组件
 */
export function getLayoutComponents(): ComponentRegistryItem[] {
  return getAllComponents().filter((item) => isLayoutComponent(item.name));
}

/**
 * 根据模式获取可用组件
 * - layout: 仅布局组件（NavMenu/SiteFooter/FloatingSidebar）+ __slot__
 * - page: 排除布局组件，仅内容组件
 */
export function getComponentsByMode(mode: "page" | "layout"): ComponentRegistryItem[] {
  if (mode === "layout") {
    return getLayoutComponents();
  }
  // page 模式排除布局组件，避免在页面内容中重复添加
  return getAllComponents().filter((item) => !isLayoutComponent(item.name));
}

/**
 * 根据组件名称获取注册项
 */
export function getComponentByName(name: string): ComponentRegistryItem | undefined {
  return REGISTRY.get(name);
}

/**
 * 判断组件是否已注册
 */
export function hasComponent(name: string): boolean {
  return REGISTRY.has(name);
}

/**
 * 获取 __slot__ 伪组件（用于布局占位）
 */
export function getSlotComponent(): ComponentRegistryItem {
  return {
    name: "__slot__",
    title: "内容插槽",
    description: "布局中的页面内容占位符",
    interactive: false,
    schema: {
      name: "__slot__",
      title: "内容插槽",
      description: "布局中的页面内容占位符",
      interactive: false,
      props: {
        slot: {
          type: "string",
          required: false,
          label: "插槽名称",
          defaultValue: "main",
        },
      },
    },
  };
}
