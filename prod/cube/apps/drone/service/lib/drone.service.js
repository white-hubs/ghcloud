var p = Object.defineProperty;
var w = (s, e, t) => e in s ? p(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var g = (s, e, t) => (w(s, typeof e != "symbol" ? e + "" : e, t), t);
function $(s) {
  return s <= 299;
}
class m {
  static create(e, t) {
    const r = t.errorCode || t.code || t.status || "", a = t.errorMessage || t.message || "", n = t.errorDetail || t.details || "", o = t.errorDescription || "";
    switch (e) {
      case 400:
        return new f(r, a, n, o);
      case 404:
        return new D(r, a, n, o);
      case 401:
        return new T(r, a, n, o);
      default:
        return new E(r, a, n, o);
    }
  }
}
class d extends Error {
  constructor(e, t, r, a) {
    super(), this.errorCode = e, this.errorMessage = t, this.errorDetail = r, this.errorDescription = a;
  }
  toJSON() {
    return {
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
      errorDetail: this.errorDetail,
      errorDescription: this.errorDescription
    };
  }
}
class f extends d {
}
class T extends d {
}
class D extends d {
}
class E extends d {
}
const y = "/api";
var l = /* @__PURE__ */ ((s) => (s.TERMINAL = "terminal", s.AUTHORIZATION = "Authorization", s.TENANT = "tenant", s))(l || {});
const i = (s, e) => {
  const t = Object.entries(e).filter((r) => typeof r[1] < "u").map(([r, a]) => `${r}=${encodeURIComponent(`${a}`)}`).join("&");
  return t ? s.includes("?") ? `${s}&${t}` : `${s}?${t}` : s;
}, R = (s, e) => {
  const t = new Headers(e);
  return t.set("Content-Type", "application/json;charset=utf-8"), h(s.payload) && t.delete("Content-Type"), s.headers && Object.entries(s.headers).forEach(([r, a]) => {
    t.set(r, a);
  }), t;
}, b = (s) => {
  if (s.method !== "GET" && !(s.method === "DELETE" && s.query === void 0))
    return h(s.payload) ? s.payload : JSON.stringify(s.payload);
}, A = async (s, e) => {
  if (e !== "void")
    return e === "blob" ? s.blob() : e === "string" ? s.text() : e === "number" || e === "boolean" ? s.json() : e === "bigint" ? BigInt(await s.text()) : s.json();
};
function h(s) {
  return s instanceof FormData || s instanceof Blob || typeof s == "string";
}
function S(s) {
  return !!s.code;
}
function v(s) {
  return !!s.error_description;
}
class C {
  constructor(e) {
    g(this, "authHeaders", new Headers());
    e && this.updateAuth(e);
  }
  async delete(e) {
    await this.request({
      url: i(e.url, e.payload ?? {}),
      method: "DELETE"
    });
  }
  async get(e) {
    const t = i(e.url, e.payload ?? {}), r = await this.request({
      url: t,
      method: "GET"
    });
    return this.parseResponse(r, e.responseType ?? "object");
  }
  async getText(e) {
    const t = i(e.url, e.payload ?? {});
    return (await this.request({
      url: t,
      method: "GET"
    })).text();
  }
  async list(e) {
    const t = i(e.url, e.payload ?? {});
    return await (await this.request({
      url: t,
      method: "GET"
    })).json();
  }
  async create(e) {
    const t = await this.request({
      ...e,
      method: "POST"
    });
    return this.parseResponse(t, e.responseType ?? "object");
  }
  async update(e) {
    const t = await this.request({
      ...e,
      method: "PUT"
    });
    return this.parseResponse(t, e.responseType ?? "object");
  }
  async custom(e) {
    let t = i(e.url, (e == null ? void 0 : e.query) ?? {});
    ["GET", "DELETE"].includes(e.method) && !e.query && (t = i(e.url, (e == null ? void 0 : e.payload) ?? {}));
    const r = await this.request({
      ...e,
      url: t
    });
    return this.parseResponse(r, e.responseType ?? "object");
  }
  async customBlob(e) {
    let t = i(e.url, (e == null ? void 0 : e.query) ?? {});
    return ["GET"].includes(e.method) && !e.query && (t = i(e.url, (e == null ? void 0 : e.payload) ?? {})), (await this.request({
      ...e,
      url: t
    })).blob();
  }
  updateAuth(e) {
    const { tenant: t, terminal: r, token: a } = e, n = this.authHeaders;
    t + "" == "0" && n.set(l.TENANT, "0"), t && n.set(l.TENANT, t), a && n.set(l.AUTHORIZATION, `Bearer ${a}`), r && n.set(l.TERMINAL, r), n.set("Content-Type", "application/json;charset=utf-8");
  }
  async parseResponse(e, t) {
    if (t !== "object")
      return A(e, t);
    const r = await e.text();
    return r.includes("{") || r.includes("[") ? JSON.parse(r) : r || {};
  }
  async request(e) {
    const t = R(e, this.authHeaders), r = b(e), a = await fetch(e.url, {
      method: e.method,
      headers: t,
      body: r
    });
    if ($(a.status))
      return a;
    const n = await a.json();
    let o = n;
    throw S(n) && (o = {
      errorCode: `${n.code}`,
      errorMessage: n.message,
      errorDetail: typeof n.data == "string" ? `${n.data}` : JSON.stringify(n.data)
    }), v(n) && (o.errorDescription = `${n.error_description}`), m.create(a.status, o);
  }
}
const c = `${y}/changsha-xialing`, u = `${y}/maintain`;
class q {
  constructor(e) {
    g(this, "gateway");
    this.gateway = new C(e);
  }
  /** 分页查询航迹列表 */
  async getTrackListPage(e) {
    const t = `${c}/drone/routes/page`;
    return await this.gateway.create({ url: t, payload: e });
  }
  /** 分页查询系统内无人机航线配置 */
  async getDroneRoutePage(e) {
    const t = `${u}/inspect/drone/routes/page`;
    return await this.gateway.get({ url: t, payload: e });
  }
  /** 分页查询当前应用关联的设备台账 */
  async getSecurityDevicePage(e) {
    const t = `${y}/securitymanagement/getSecurityDevicePage/${e.applicationCode}`, r = await this.gateway.get({
      url: t,
      payload: e
    });
    return r.data || r;
  }
  /** 查询系统内无人机航线详情，包含航点行 */
  async getDroneRoute(e) {
    const t = `${u}/inspect/drone/routes/${e}`;
    return await this.gateway.get({ url: t });
  }
  /** 创建系统内无人机航线头信息与航点行 */
  async createDroneRoute(e) {
    const t = `${u}/inspect/drone/routes`;
    return await this.gateway.create({ url: t, payload: e });
  }
  /** 修改系统内无人机航线头信息与航点行 */
  async updateDroneRoute(e, t) {
    const r = `${u}/inspect/drone/routes/${e}`;
    await this.gateway.update({ url: r, payload: t });
  }
  /** 启用或禁用系统内无人机航线 */
  async changeDroneRouteStatus(e, t) {
    const r = `${u}/inspect/drone/routes/${e}/status`;
    await this.gateway.update({ url: r, payload: t });
  }
  /** 删除系统内无人机航线 */
  async deleteDroneRoute(e) {
    const t = `${u}/inspect/drone/routes/${e}`;
    await this.gateway.delete({ url: t });
  }
  /**
   * 分页查询任务列表
   * 接口：POST /drone/tasks/page
   * 返回：
   * - total: 总条数
   * - pages: 总页数
   * - records: 任务列表，字段见 FlightTaskListModel
   */
  async getFlightTaskListPage(e) {
    const t = `${c}/drone/tasks/page`;
    return await this.gateway.create({ url: t, payload: e });
  }
  /** 分页查询任务成果列表 */
  async getTaskAchievementListPage(e) {
    const t = `${c}/drone/results/page`;
    return await this.gateway.create({ url: t, payload: e });
  }
  /** 下载任务成果文件 */
  async downloadTaskAchievement(e) {
    const t = `${c}/drone/results/download`;
    return await this.gateway.customBlob({ url: t, method: "GET", query: { fileKey: e } });
  }
  /** 查询机巢状态 */
  async getNestDetail(e) {
    const t = `${c}/nest/getDetail/${e}`;
    return await this.gateway.get({ url: t });
  }
  /** 查询飞机实时状态 */
  async getDroneDetail(e) {
    const t = `${c}/drone/getDetail/${e}`;
    return await this.gateway.get({ url: t });
  }
  /** 查询机巢绑定飞机实时状态 */
  async getDroneDetailByNest(e) {
    const t = `${c}/drone/getDetailByNest/${e}`;
    return await this.gateway.get({ url: t });
  }
  /** 查询飞行轨迹详情 */
  async getTrackDetail(e) {
    const t = `${c}/track/getOne/${e}`;
    return await this.gateway.get({ url: t });
  }
  /** 查询任务日志详情 */
  async getTaskLogDetail(e) {
    const t = `${c}/taskLog/getOne/${e}`;
    return await this.gateway.get({ url: t });
  }
  /** 申请设备控制权限 */
  async applyControl(e, t) {
    const r = `${c}/system/control/apply${e}`;
    return await this.gateway.get({ url: r, payload: { sn: t } });
  }
  /** 释放设备控制权限 */
  async releaseControl(e, t) {
    const r = `${c}/system/control/release`;
    return await this.gateway.get({ url: r, payload: { sn: e, deviceType: t } });
  }
  /** 飞行方向控制 */
  async flyAction(e, t) {
    const r = `${c}/nest/cmd/flyAction/${e}/${t}`;
    return await this.gateway.get({ url: r });
  }
  /** 悬停 */
  async hover(e) {
    const t = `${c}/drone/cmd/boot/hover/${e}`;
    return await this.gateway.get({ url: t });
  }
  /** 精准返航 */
  async precisionReturn(e) {
    const t = `${c}/drone/cmd/boot/precision/${e}`;
    return await this.gateway.get({ url: t });
  }
  /** 指点飞行 */
  async giveDirectionsFlight(e) {
    const t = `${c}/drone/cmd/boot/giveDirectionsMore/flight`;
    return await this.gateway.create({ url: t, payload: e });
  }
  /** 云台/相机控制 */
  async cameraControl(e, t, r, a) {
    const n = `${c}/drone/cmd/camera/${e}/${t}/${r}/${a}`;
    return await this.gateway.get({ url: n });
  }
  /** 相机模式切换 */
  async setCameraModel(e, t, r) {
    const a = `${c}/drone/cmd/boot/camera/model/set/${e}/${t}/${r}`;
    return await this.gateway.get({ url: a });
  }
  /** 变倍控制 */
  async cloudZoom(e, t, r, a) {
    const n = `${c}/drone/cmd/cloudZoom/${e}/${t}/${r}/${a}`;
    return await this.gateway.get({ url: n });
  }
  /** 机巢舱门控制 */
  async hatchControl(e, t) {
    const r = `${c}/nest/cmd/hatch/${e}/${t}`;
    return await this.gateway.get({ url: r });
  }
  /** 机巢充电控制 */
  async chargeControl(e, t) {
    const r = `${c}/nest/cmd/charge/${e}/${t}`;
    return await this.gateway.get({ url: r });
  }
  /** 机巢归中控制 */
  async putterControl(e, t) {
    const r = `${c}/nest/cmd/putter/${e}/${t}`;
    return await this.gateway.get({ url: r });
  }
  /** 喊话器属性设置 */
  async setShouterProperty(e) {
    const t = `${c}/drone/cmd/shouter/set/property`;
    return await this.gateway.create({ url: t, payload: e });
  }
  /** 喊话器文本传输 */
  async transferShouterText(e) {
    const t = `${c}/drone/cmd/shouter/set/transfer`;
    return await this.gateway.create({ url: t, payload: e });
  }
  /** 获取视频流记录 */
  async getMp4RecordFile(e) {
    const t = `${c}/index/api/getMp4RecordFile`;
    return await this.gateway.get({ url: t, payload: e });
  }
}
export {
  q as CubeDroneService
};
