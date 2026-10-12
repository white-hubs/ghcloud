-- ========================================================
-- 页面管理模块建表语句
-- 表前缀：ghy_site_
-- 数据库：MySQL 8.0+
-- ========================================================

-- ----------------------------
-- 页面表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `ghy_site_page` (
  `id`                  BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `page_name`           VARCHAR(128)        NOT NULL COMMENT '页面名称',
  `page_route`          VARCHAR(256)        NOT NULL COMMENT '页面路由，如 /about、/information.html',
  `page_title`          VARCHAR(256)        DEFAULT NULL COMMENT '页面标题',
  `layout_id`           BIGINT UNSIGNED     NOT NULL COMMENT '绑定布局ID',
  `meta_title`          VARCHAR(256)        DEFAULT NULL COMMENT 'SEO标题',
  `meta_description`    VARCHAR(512)        DEFAULT NULL COMMENT 'SEO描述',
  `meta_keywords`       VARCHAR(512)        DEFAULT NULL COMMENT 'SEO关键词',
  `meta_nav_style`      VARCHAR(16)         DEFAULT NULL COMMENT '导航样式：light/dark',
  `components`          LONGTEXT            NOT NULL COMMENT '组件配置JSON（ComponentInstance[]）',
  `is_builtin`          TINYINT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '是否内置页面：0-否 1-是，内置页面不可删除',
  `created_time`        DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time`        DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by`          BIGINT UNSIGNED     DEFAULT NULL COMMENT '创建人ID',
  `updated_by`          BIGINT UNSIGNED     DEFAULT NULL COMMENT '更新人ID',
  `deleted`             TINYINT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '软删除标志：0-未删除 1-已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_page_route` (`page_route`, `deleted`),
  KEY `idx_layout_id` (`layout_id`),
  KEY `idx_is_builtin` (`is_builtin`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='页面表';


-- ----------------------------
-- 布局表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `ghy_site_layout` (
  `id`              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `layout_name`     VARCHAR(128)        NOT NULL COMMENT '布局名称',
  `config`          LONGTEXT            NOT NULL COMMENT '布局配置JSON（组件列表）',
  `created_time`    DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time`    DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by`      BIGINT UNSIGNED     DEFAULT NULL COMMENT '创建人ID',
  `updated_by`      BIGINT UNSIGNED     DEFAULT NULL COMMENT '更新人ID',
  `deleted`         TINYINT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '软删除标志：0-未删除 1-已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_layout_name` (`layout_name`, `deleted`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='布局表';


-- ----------------------------
-- 内置页面初始化数据
-- ----------------------------
INSERT INTO `ghy_site_page` (`page_name`, `page_route`, `page_title`, `layout_id`, `meta_title`, `meta_description`, `meta_keywords`, `meta_nav_style`, `components`, `is_builtin`, `created_time`, `updated_time`)
VALUES
  ('文章列表页', '/information.html', '文章列表页', 1, '资讯中心 - 古河云科技', '了解最新行业动态与公司资讯', '行业动态,产品资讯,公司新闻', 'light', '[]', 1, NOW(), NOW()),
  ('文章详情模板', '/information/detail-{id}.html', '文章详情', 1, '文章详情 - 古河云科技', NULL, NULL, 'light', '[]', 1, NOW(), NOW()),
  ('咨询页面', '/consultation.html', '立即咨询', 1, '立即咨询 - 古河云科技', '留下您的联系方式，我们将尽快与您取得联系', '咨询,联系', 'light', '[]', 1, NOW(), NOW());
