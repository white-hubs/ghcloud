# 素材管理接口设计

---

## 目录相关

### 1. 获取子目录列表

```
GET /material/folder/list?pathId={pathId}
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pathId | string | N | 父目录ID，不传或传空表示获取根目录列表 |

**响应 data：**

```json
[
  {
    "id": "1",
    "pathId": null,
    "name": "图片",
    "sort": 0,
    "createdTime": "2024-01-15 10:00:00",
    "updatedTime": "2024-03-20 14:30:00"
  },
  {
    "id": "2",
    "pathId": null,
    "name": "视频",
    "sort": 1,
    "createdTime": "2024-01-15 10:00:00",
    "updatedTime": "2024-03-20 14:30:00"
  }
]
```

---

### 2. 新建目录

```
POST /material/folder/add
```

**请求体：**

```json
{
  "pathId": "1",
  "name": "产品图"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pathId | string | N | 父目录ID，null为根目录 |
| name | string | Y | 目录名称，同层级下不可重复 |

**约束：** 同层级下目录名称不可重复，重复返回 400。

---

### 3. 重命名目录

```
PUT /material/folder/update
```

**请求体：**

```json
{
  "id": "2",
  "name": "产品图片"
}
```

**约束：** 同层级下目录名称不可重复。

---

### 4. 删除目录

```
DELETE /material/folder/delete?id={id}
```

**约束：** 目录下存在子目录或素材时，不允许删除，返回 400。

---

### 5. 获取目录路径（面包屑）

```
GET /material/folder/path?id={id}
```

**响应 data：**

```json
[
  { "id": "root", "name": "全部素材" },
  { "id": "1", "name": "图片" },
  { "id": "3", "name": "产品图" }
]
```

---

## 素材相关

### 6. 获取素材列表

```
GET /material/list?pathId={pathId}&keyword={keyword}&type={type}&pageNumber={pageNumber}&pageSize={pageSize}
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pathId | string | N | 目录ID，不传查全部 |
| keyword | string | N | 搜索关键词（匹配素材名称） |
| type | string | N | 类型筛选：image/video/font/other |
| pageNumber | int | N | 页码，默认1 |
| pageSize | int | N | 页大小，默认20 |

**响应 data：**

```json
{
  "records": [
    {
      "id": "1",
      "pathId": "3",
      "name": "banner",
      "ext": "png",
      "mimeType": "image/png",
      "size": 102400,
      "url": "https://cdn.xxx.com/banner.png?token=xxx",
      "createdTime": "2024-01-15 10:00:00"
    }
  ],
  "total": 100,
  "pages": 5
}
```

**说明：** `url` 为服务端实时签名生成的临时访问地址。

---

### 7. 上传素材

```
POST /material/upload
```

**请求体：** `multipart/form-data`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pathId | string | N | 目标目录ID |
| files | File[] | Y | 素材文件，支持批量上传 |

**响应 data：**

```json
[
  {
    "id": "1",
    "name": "banner",
    "ext": "png",
    "url": "https://cdn.xxx.com/banner.png?token=xxx",
    "size": 102400
  }
]
```

**约束：** 上传同名文件时，提示是否覆盖（由前端二次确认后带 `overwrite=true` 参数重试）。

---

### 8. 重命名素材

```
PUT /material/rename
```

**请求体：**

```json
{
  "id": "1",
  "name": "new-banner"
}
```

**说明：** 只改名称，不改扩展名。

---

### 9. 移动素材到目录

```
PUT /material/move
```

**请求体：**

```json
{
  "ids": ["1", "2", "3"],
  "pathId": "4"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ids | string[] | Y | 素材ID列表，支持批量移动 |
| pathId | string | N | 目标目录ID，null为移动到根目录 |

---

### 10. 删除素材

```
DELETE /material/delete?id={id}
```

**说明：** 物理删除对象存储文件 + 逻辑删除数据库记录。

---

### 11. 获取素材详情

```
GET /material/detail?id={id}
```

**响应 data：**

```json
{
  "id": "1",
  "pathId": "3",
  "name": "banner",
  "ext": "png",
  "mimeType": "image/png",
  "size": 102400,
  "storageKey": "site/images/banner.png",
  "url": "https://cdn.xxx.com/site/images/banner.png?token=xxx",
  "createdTime": "2024-01-15 10:00:00",
  "updatedTime": "2024-03-20 14:30:00"
}
```

**说明：** `url` 为服务端实时签名生成的临时访问地址，有过期时间。

---

## 数据模型

```typescript
interface MaterialFolder {
  id: string;
  pathId: string | null;
  name: string;
  sort: number;
  createdTime: string;
  updatedTime: string;
}

interface Material {
  id: string;
  pathId: string | null;
  name: string;
  ext: string;
  mimeType: string;
  size: number;
  storageKey: string;
  url: string;
  createdTime: string;
  updatedTime: string;
}
```
