-- ========================================================
-- 素材管理模块建表语句
-- 表前缀：ghy_site_
-- 数据库：MySQL 8.0+
-- ========================================================

-- ----------------------------
-- 素材目录表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `ghy_site_material_folder` (
  `id`              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `path_id`       BIGINT UNSIGNED     DEFAULT NULL COMMENT '父目录ID，NULL表示根目录',
  `name`            VARCHAR(128)        NOT NULL COMMENT '目录名称',
  `sort`            INT                 NOT NULL DEFAULT 0 COMMENT '排序，默认0',
  `created_time`    DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time`    DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by`      BIGINT UNSIGNED     DEFAULT NULL COMMENT '创建人ID',
  `updated_by`      BIGINT UNSIGNED     DEFAULT NULL COMMENT '更新人ID',
  `deleted`         TINYINT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '软删除标志：0-未删除 1-已删除',
  PRIMARY KEY (`id`),
  KEY `idx_path_id` (`path_id`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='素材目录表';


-- ----------------------------
-- 素材表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `ghy_site_material` (
  `id`              BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `folder_id`       BIGINT UNSIGNED     DEFAULT NULL COMMENT '所在目录ID',
  `name`            VARCHAR(256)        NOT NULL COMMENT '素材名称（不含后缀）',
  `ext`             VARCHAR(16)         DEFAULT NULL COMMENT '文件扩展名，如 png, jpg, mp4',
  `mime_type`       VARCHAR(64)         DEFAULT NULL COMMENT 'MIME类型',
  `size`            BIGINT UNSIGNED     DEFAULT NULL COMMENT '文件大小（字节）',
  `storage_key`     VARCHAR(512)        NOT NULL COMMENT '对象存储Key（如MinIO的object key）',
  `created_time`    DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time`    DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by`      BIGINT UNSIGNED     DEFAULT NULL COMMENT '创建人ID',
  `updated_by`      BIGINT UNSIGNED     DEFAULT NULL COMMENT '更新人ID',
  `deleted`         TINYINT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '软删除标志：0-未删除 1-已删除',
  PRIMARY KEY (`id`),
  KEY `idx_folder_id` (`folder_id`),
  KEY `idx_name` (`name`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='素材表';
