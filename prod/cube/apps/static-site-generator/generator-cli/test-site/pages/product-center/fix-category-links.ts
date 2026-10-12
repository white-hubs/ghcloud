import * as fs from 'fs';

// 应用名称到详情页的映射
const appDetailMap: Record<string, string> = {
  "安防监控": "/product-center/app-security-detail.html",
  "消防管理": "/product-center/app-fire-detail.html",
  "预案管理": "/product-center/app-plan-detail.html",
  "动环监控": "/product-center/app-env-detail.html",
  "电气管理": "/product-center/app-electric-detail.html",
  "广播中心": "/product-center/app-broadcast-detail.html",
  "入侵报警": "/product-center/app-intrusion-detail.html",
  "用气管理": "/product-center/app-gas-detail.html",
  "指挥调度": "/product-center/app-command-detail.html",
  "风险源管理": "/product-center/app-risk-detail.html",
  "安全教育": "/product-center/app-safety-edu-detail.html",
  "安全管理": "/product-center/app-safety-detail.html",
  "园区管理": "/product-center/app-park-detail.html",
  "人事管理": "/product-center/app-hr-detail.html",
  "行政管理": "/product-center/app-admin-detail.html",
  "会议室管理": "/product-center/app-meeting-detail.html",
  "资产管理": "/product-center/app-asset-detail.html",
  "考勤管理": "/product-center/app-attendance-detail.html",
  "小散工程": "/product-center/app-small-project-detail.html",
  "肉类交易": "/product-center/app-meat-detail.html",
  "商品采价": "/product-center/app-price-detail.html",
  "手术示教": "/product-center/app-surgery-detail.html",
  "医用气体": "/product-center/app-medical-gas-detail.html",
  "隐患整改": "/product-center/app-hidden-danger-detail.html",
  "故障报修": "/product-center/app-repair-detail.html",
  "日常巡检": "/product-center/app-daily-inspection-detail.html",
  "维保作业": "/product-center/app-maintenance-detail.html",
  "委外维修": "/product-center/app-outsourcing-detail.html",
  "更新改造": "/product-center/app-upgrade-detail.html",
  "停车管理": "/product-center/app-parking-detail.html",
  "电子巡更": "/product-center/app-patrol-detail.html",
  "物联中心": "/product-center/app-iot-detail.html",
  "空间管理": "/product-center/app-space-detail.html",
  "能碳管理": "/product-center/app-energy-detail.html",
  "门禁管理": "/product-center/app-access-detail.html",
  "空调管理": "/product-center/app-ac-detail.html",
  "智能照明": "/product-center/app-lighting-detail.html",
  "电梯管理": "/product-center/app-elevator-detail.html",
  "冷热源": "/product-center/app-hvac-detail.html",
  "电动车管理": "/product-center/app-ev-detail.html",
  "报警中心": "/product-center/app-alarm-detail.html"
};

const files = [
  'agriculture.json', 'attendance.json', 'base.json', 'electric.json', 
  'env.json', 'fire.json', 'hardware.json', 'hospital.json', 
  'integration.json', 'internal.json', 'meat-track.json', 'operation.json', 
  'patrol.json', 'safe.json', 'video.json'
];

let totalFixed = 0;

for (const file of files) {
  if (!fs.existsSync(file)) {
    continue;
  }
  
  const content = fs.readFileSync(file, 'utf-8');
  const data = JSON.parse(content);
  
  let fixed = 0;
  
  // 遍历所有组件的 props 中的 products
  for (const component of data.components) {
    if (component.props && component.props.products) {
      for (const product of component.props.products) {
        if (product.href === '#' && appDetailMap[product.name]) {
          product.href = appDetailMap[product.name];
          fixed++;
          totalFixed++;
        }
      }
    }
  }
  
  if (fixed > 0) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }
}

