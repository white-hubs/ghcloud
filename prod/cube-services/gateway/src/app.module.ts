import { ConfigModule, LoggerModule, Module } from "@dangao/bun-server";

import { ProxyClient } from "./clients/proxy-client";
import { AccessControlController } from "./controllers/access-control/access-control.controller";
import { AuthController } from "./controllers/auth/auth.controller";
import { DeviceCenterController } from "./controllers/device-center/device-center.controller";
import { DictionaryController } from "./controllers/dictionary/dictionary.controller";
import { EmergencyDispatchController } from "./controllers/emergency-dispatch/emergency-dispatch.controller";
import { EmergencyPlanAiController } from "./controllers/emergency-plan-ai/emergency-plan-ai.controller";
import { EmergencySuppliesController } from "./controllers/emergency-supplies/emergency-supplies.controller";
import { FumigationOperationController } from "./controllers/fumigation-operation/fumigation-operation.controller";
import { HealthController } from "./controllers/health.controller";
import { InspectionAiController } from "./controllers/inspection-ai/inspection-ai.controller";
import { MdataController } from "./controllers/mdata/mdata.controller";
import { MetadataController } from "./controllers/metadata/metadata.controller";
import { OuaaController } from "./controllers/ouaa/ouaa.controller";
import { ProcessEngineController } from "./controllers/process-engine/process-engine.controller";
import { RiskGradedControlController } from "./controllers/risk-graded-control/risk-graded-control.controller";
import { SafetyPersonnelBusinessController } from "./controllers/safety-personnel/safety-personnel-business.controller";
import { SafetyPersonnelCertController } from "./controllers/safety-personnel/safety-personnel-cert.controller";
import { SecurityOpinionController } from "./controllers/security-opinion/security-opinion.controller";
import { VideoMonitorAiInspectionController } from "./controllers/video-monitor/video-monitor-ai-inspection.controller";
import { VideoMonitorAuthController } from "./controllers/video-monitor/video-monitor-auth.controller";
import { VideoMonitorDeviceController } from "./controllers/video-monitor/video-monitor-device.controller";
import { VisualizationController } from "./controllers/visualization/visualization.controller";
import { WarehouseSafetyController } from "./controllers/warehouse-safety/warehouse-safety.controller";
import { WorkPermitController } from "./controllers/work-permit/work-permit.controller";
import { InterceptorFilterExtension } from "./extensions/interceptor-filter.extension";
import { EmergencyPlanAiService } from "./services/business/emergency-plan-ai/emergency-plan-ai.service";
import { EmergencyPlanContentExtractorService } from "./services/business/emergency-plan-ai/emergency-plan-content-extractor.service";
import { EmergencyPlanFlowService } from "./services/business/emergency-plan-ai/emergency-plan-flow.service";
import { InspectionAiService } from "./services/business/inspection-ai/inspection-ai.service";
import { InspectionFlowService } from "./services/business/inspection-ai/inspection-flow.service";
import { WorkPermitAiFlowService } from "./services/business/work-permit/work-permit-ai-flow.service";
import { AccessControlProxyService } from "./services/proxy/access-control/access-control-proxy.service";
import { FlowProxyService } from "./services/proxy/ai-application/flow-proxy.service";
import { KnowledgeDocumentParserProxyService } from "./services/proxy/ai-application/knowledge-document-parser-proxy.service";
import { AuthProxyService } from "./services/proxy/auth/auth-proxy.service";
import { DailyInspectionProxyService } from "./services/proxy/daily-inspection/daily-inspection-proxy.service";
import { DeviceCenterProxyService } from "./services/proxy/device-center/device-center-proxy.service";
import { DictionaryProxyService } from "./services/proxy/dictionary/dictionary-proxy.service";
import { EmergencyDispatchProxyService } from "./services/proxy/emergency-dispatch/emergency-dispatch-proxy.service";
import { EmergencyPlanProxyService } from "./services/proxy/emergency-plan/emergency-plan-proxy.service";
import { EmergencySuppliesProxyService } from "./services/proxy/emergency-supplies/emergency-supplies-proxy.service";
import { FileProxyService } from "./services/proxy/file/file-proxy.service";
import { FumigationOperationProxyService } from "./services/proxy/fumigation-operation/fumigation-operation-proxy.service";
import { MdataProxyService } from "./services/proxy/mdata/mdata-proxy.service";
import { MetadataProxyService } from "./services/proxy/metadata/metadata-proxy.service";
import { OuaaProxyService } from "./services/proxy/ouaa/ouaa-proxy.service";
import { ProcessEngineProxyService } from "./services/proxy/process-engine/process-engine-proxy.service";
import { RiskGradedControlProxyService } from "./services/proxy/risk-graded-control/risk-graded-control-proxy.service";
import { SafetyPersonnelProxyService } from "./services/proxy/safety-personnel/safety-personnel-proxy.service";
import { SecurityOpinionProxyService } from "./services/proxy/security-opinion/security-opinion-proxy.service";
import { StaffProxyService } from "./services/proxy/staff/staff-proxy.service";
import { VideoMonitorProxyService } from "./services/proxy/video-monitor/video-monitor-proxy.service";
import { VisualizationProxyService } from "./services/proxy/visualization/visualization-proxy.service";
import { WarehouseSafetyProxyService } from "./services/proxy/warehouse-safety/warehouse-safety-proxy.service";
import { WorkPermitProxyService } from "./services/proxy/work-permit/work-permit-proxy.service";

/**
 * 应用主模块
 * 统一管理控制器、服务、拦截器、过滤器和日志
 */
@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot({
      enableRequestLogging: true,
      requestLoggingPrefix: "[Gateway]",
    }),
  ],
  controllers: [
    HealthController,
    VideoMonitorAuthController,
    VideoMonitorDeviceController,
    MetadataController,
    MdataController,
    VisualizationController,
    DeviceCenterController,
    OuaaController,
    DictionaryController,
    AuthController,
    SafetyPersonnelCertController,
    SafetyPersonnelBusinessController,
    AccessControlController,
    SecurityOpinionController,
    RiskGradedControlController,
    VideoMonitorAiInspectionController,
    InspectionAiController,
    EmergencyPlanAiController,
    WorkPermitController,
    ProcessEngineController,
    EmergencyDispatchController,
    EmergencySuppliesController,
    WarehouseSafetyController,
    FumigationOperationController,
  ],
  providers: [
    ProxyClient,
    VideoMonitorProxyService,
    DeviceCenterProxyService,
    MetadataProxyService,
    MdataProxyService,
    VisualizationProxyService,
    OuaaProxyService,
    DictionaryProxyService,
    AuthProxyService,
    SafetyPersonnelProxyService,
    AccessControlProxyService,
    SecurityOpinionProxyService,
    RiskGradedControlProxyService,
    InspectionAiService,
    InspectionFlowService,
    EmergencyPlanAiService,
    EmergencyPlanContentExtractorService,
    EmergencyPlanFlowService,
    WorkPermitAiFlowService,
    FileProxyService,
    DailyInspectionProxyService,
    FlowProxyService,
    KnowledgeDocumentParserProxyService,
    WorkPermitProxyService,
    ProcessEngineProxyService,
    EmergencyDispatchProxyService,
    EmergencySuppliesProxyService,
    EmergencyPlanProxyService,
    StaffProxyService,
    WarehouseSafetyProxyService,
    FumigationOperationProxyService,
  ],
  extensions: [new InterceptorFilterExtension()],
})
export class AppModule {}
