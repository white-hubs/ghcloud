var L = Object.defineProperty;
var E = (o, e, t) => (e in o ? L(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (o[e] = t));
var m = (o, e, t) => (E(o, typeof e != "symbol" ? e + "" : e, t), t);
var C = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function S(o) {
  return o && o.__esModule && Object.prototype.hasOwnProperty.call(o, "default") ? o.default : o;
}
var b = { exports: {} };
(function (o, e) {
  (function (t, n) {
    o.exports = n();
  })(C, function () {
    function t(a) {
      var f = [];
      return (a.AMapUI && f.push(n(a.AMapUI)), a.Loca && f.push(u(a.Loca)), Promise.all(f));
    }
    function n(a) {
      return new Promise(function (f, i) {
        var d = [];
        if (a.plugins) for (var c = 0; c < a.plugins.length; c += 1) s.AMapUI.plugins.indexOf(a.plugins[c]) == -1 && d.push(a.plugins[c]);
        if (l.AMapUI === r.failed) i("前次请求 AMapUI 失败");
        else if (l.AMapUI === r.notload) {
          ((l.AMapUI = r.loading), (s.AMapUI.version = a.version || s.AMapUI.version), (c = s.AMapUI.version));
          var w = document.body || document.head,
            y = document.createElement("script");
          ((y.type = "text/javascript"),
            (y.src = "https://webapi.amap.com/ui/" + c + "/main.js"),
            (y.onerror = function (p) {
              ((l.AMapUI = r.failed), i("请求 AMapUI 失败"));
            }),
            (y.onload = function () {
              if (((l.AMapUI = r.loaded), d.length))
                window.AMapUI.loadUI(d, function () {
                  for (var p = 0, M = d.length; p < M; p++) {
                    var A = d[p].split("/").slice(-1)[0];
                    window.AMapUI[A] = arguments[p];
                  }
                  for (f(); g.AMapUI.length; ) g.AMapUI.splice(0, 1)[0]();
                });
              else for (f(); g.AMapUI.length; ) g.AMapUI.splice(0, 1)[0]();
            }),
            w.appendChild(y));
        } else
          l.AMapUI === r.loaded
            ? a.version && a.version !== s.AMapUI.version
              ? i("不允许多个版本 AMapUI 混用")
              : d.length
                ? window.AMapUI.loadUI(d, function () {
                    for (var p = 0, M = d.length; p < M; p++) {
                      var A = d[p].split("/").slice(-1)[0];
                      window.AMapUI[A] = arguments[p];
                    }
                    f();
                  })
                : f()
            : a.version && a.version !== s.AMapUI.version
              ? i("不允许多个版本 AMapUI 混用")
              : g.AMapUI.push(function (p) {
                  p
                    ? i(p)
                    : d.length
                      ? window.AMapUI.loadUI(d, function () {
                          for (var M = 0, A = d.length; M < A; M++) {
                            var D = d[M].split("/").slice(-1)[0];
                            window.AMapUI[D] = arguments[M];
                          }
                          f();
                        })
                      : f();
                });
      });
    }
    function u(a) {
      return new Promise(function (f, i) {
        if (l.Loca === r.failed) i("前次请求 Loca 失败");
        else if (l.Loca === r.notload) {
          ((l.Loca = r.loading), (s.Loca.version = a.version || s.Loca.version));
          var d = s.Loca.version,
            c = s.AMap.version.startsWith("2"),
            w = d.startsWith("2");
          if ((c && !w) || (!c && w)) i("JSAPI 与 Loca 版本不对应！！");
          else {
            ((c = s.key), (w = document.body || document.head));
            var y = document.createElement("script");
            ((y.type = "text/javascript"),
              (y.src = "https://webapi.amap.com/loca?v=" + d + "&key=" + c),
              (y.onerror = function (p) {
                ((l.Loca = r.failed), i("请求 AMapUI 失败"));
              }),
              (y.onload = function () {
                for (l.Loca = r.loaded, f(); g.Loca.length; ) g.Loca.splice(0, 1)[0]();
              }),
              w.appendChild(y));
          }
        } else
          l.Loca === r.loaded
            ? a.version && a.version !== s.Loca.version
              ? i("不允许多个版本 Loca 混用")
              : f()
            : a.version && a.version !== s.Loca.version
              ? i("不允许多个版本 Loca 混用")
              : g.Loca.push(function (p) {
                  p ? i(p) : i();
                });
      });
    }
    if (!window) throw Error("AMap JSAPI can only be used in Browser.");
    var r;
    (function (a) {
      ((a.notload = "notload"), (a.loading = "loading"), (a.loaded = "loaded"), (a.failed = "failed"));
    })(r || (r = {}));
    var s = { key: "", AMap: { version: "1.4.15", plugins: [] }, AMapUI: { version: "1.1", plugins: [] }, Loca: { version: "1.3.2" } },
      l = { AMap: r.notload, AMapUI: r.notload, Loca: r.notload },
      g = { AMap: [], AMapUI: [], Loca: [] },
      I = [],
      U = function (a) {
        typeof a == "function" && (l.AMap === r.loaded ? a(window.AMap) : I.push(a));
      };
    return {
      load: function (a) {
        return new Promise(function (f, i) {
          if (l.AMap == r.failed) i("");
          else if (l.AMap == r.notload) {
            var d = a.key,
              c = a.version,
              w = a.plugins;
            d
              ? (window.AMap && location.host !== "lbs.amap.com" && i("禁止多种API加载方式混用"),
                (s.key = d),
                (s.AMap.version = c || s.AMap.version),
                (s.AMap.plugins = w || s.AMap.plugins),
                (l.AMap = r.loading),
                (c = document.body || document.head),
                (window.___onAPILoaded = function (p) {
                  if ((delete window.___onAPILoaded, p)) ((l.AMap = r.failed), i(p));
                  else
                    for (
                      l.AMap = r.loaded,
                        t(a)
                          .then(function () {
                            f(window.AMap);
                          })
                          .catch(i);
                      I.length;
                    )
                      I.splice(0, 1)[0]();
                }),
                (w = document.createElement("script")),
                (w.type = "text/javascript"),
                (w.src =
                  "https://webapi.amap.com/maps?callback=___onAPILoaded&v=" +
                  s.AMap.version +
                  "&key=" +
                  d +
                  "&plugin=" +
                  s.AMap.plugins.join(",")),
                (w.onerror = function (p) {
                  ((l.AMap = r.failed), i(p));
                }),
                c.appendChild(w))
              : i("请填写key");
          } else if (l.AMap == r.loaded)
            if (a.key && a.key !== s.key) i("多个不一致的 key");
            else if (a.version && a.version !== s.AMap.version) i("不允许多个版本 JSAPI 混用");
            else {
              if (((d = []), a.plugins))
                for (c = 0; c < a.plugins.length; c += 1) s.AMap.plugins.indexOf(a.plugins[c]) == -1 && d.push(a.plugins[c]);
              d.length
                ? window.AMap.plugin(d, function () {
                    t(a)
                      .then(function () {
                        f(window.AMap);
                      })
                      .catch(i);
                  })
                : t(a)
                    .then(function () {
                      f(window.AMap);
                    })
                    .catch(i);
            }
          else if (a.key && a.key !== s.key) i("多个不一致的 key");
          else if (a.version && a.version !== s.AMap.version) i("不允许多个版本 JSAPI 混用");
          else {
            var y = [];
            if (a.plugins) for (c = 0; c < a.plugins.length; c += 1) s.AMap.plugins.indexOf(a.plugins[c]) == -1 && y.push(a.plugins[c]);
            U(function () {
              y.length
                ? window.AMap.plugin(y, function () {
                    t(a)
                      .then(function () {
                        f(window.AMap);
                      })
                      .catch(i);
                  })
                : t(a)
                    .then(function () {
                      f(window.AMap);
                    })
                    .catch(i);
            });
          }
        });
      },
      reset: function () {
        (delete window.AMap,
          delete window.AMapUI,
          delete window.Loca,
          (s = { key: "", AMap: { version: "1.4.15", plugins: [] }, AMapUI: { version: "1.1", plugins: [] }, Loca: { version: "1.3.2" } }),
          (l = {
            AMap: r.notload,
            AMapUI: r.notload,
            Loca: r.notload,
          }),
          (g = { AMap: [], AMapUI: [], Loca: [] }));
      },
    };
  });
})(b);
var $ = b.exports;
const P = /* @__PURE__ */ S($),
  T = 299;
function k(o) {
  return o <= T;
}
class B {
  static create(e, t) {
    const { errorCode: n, errorMessage: u, errorDetail: r, errorDescription: s } = t;
    switch (e) {
      case 400:
        return new _(n, u, r, s);
      case 404:
        return new x(n, u, r);
      case 401:
        return new j(n, u, r);
      default:
        return new q(n, u, r);
    }
  }
}
class v extends Error {
  constructor(e, t, n, u) {
    (super(), (this.errorCode = e), (this.errorMessage = t), (this.errorDetail = n), (this.errorDescription = u));
  }
  toJSON() {
    return {
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
      errorDetail: this.errorDetail,
      errorDescription: this.errorDescription,
    };
  }
}
class _ extends v {}
class j extends v {}
class x extends v {}
class q extends v {}
function O(o) {
  return !!o.code;
}
function R(o) {
  return !!o.error_description;
}
class J {
  constructor(e) {
    m(this, "authHeaders", new Headers());
    e && this.updateAuth(e);
  }
  async delete(e) {
    await this.request({
      url: this.makeURLParams(e.url, e.payload ?? {}),
      method: "DELETE",
    });
  }
  async get(e) {
    const t = this.makeURLParams(e.url, e.payload ?? {});
    return await (
      await this.request({
        url: t,
        method: "GET",
      })
    ).json();
  }
  async getText(e) {
    const t = this.makeURLParams(e.url, e.payload ?? {});
    return (
      await this.request({
        url: t,
        method: "GET",
      })
    ).text();
  }
  async list(e) {
    const t = this.makeURLParams(e.url, e.payload ?? {});
    return await (
      await this.request({
        url: t,
        method: "GET",
      })
    ).json();
  }
  async create(e) {
    return await (
      await this.request({
        ...e,
        method: "POST",
      })
    ).json();
  }
  async update(e) {
    return await (
      await this.request({
        ...e,
        method: "PUT",
      })
    ).json();
  }
  async custom(e) {
    let t = this.makeURLParams(e.url, (e == null ? void 0 : e.query) ?? {});
    return (
      ["GET", "DELETE"].includes(e.method) && !e.query && (t = this.makeURLParams(e.url, (e == null ? void 0 : e.payload) ?? {})),
      await (
        await this.request({
          ...e,
          url: t,
        })
      ).json()
    );
  }
  async customBlob(e) {
    return (
      await this.request({
        ...e,
      })
    ).blob();
  }
  updateAuth(e) {
    const { tenant: t, terminal: n, token: u } = e,
      r = this.authHeaders;
    (t + "" == "0" && r.set("tenant", "0"),
      t && r.set("tenant", t),
      u && r.set("Authorization", `Bearer ${u}`),
      n && r.set("terminal", n),
      r.set("Content-Type", "application/json;charset=utf-8"));
  }
  async request(e) {
    const t = this.makeHeaders(e),
      n = this.makeBody(e),
      u = await fetch(e.url, {
        method: e.method,
        headers: t,
        body: n,
      });
    if (k(u.status)) return u;
    const r = await u.json();
    let s = r;
    throw (
      O(r) &&
        (s = {
          errorCode: `${r.code}`,
          errorMessage: r.message,
          errorDetail: typeof r.data == "string" ? `${r.data}` : JSON.stringify(r.data),
        }),
      R(r) && (s.errorDescription = `${r.error_description}`),
      B.create(u.status, s)
    );
  }
  makeBody(e) {
    if (!["GET", "DELETE"].includes(e.method)) return this.payloadIsMetadata(e.payload) ? e.payload : JSON.stringify(e.payload);
  }
  makeHeaders(e) {
    const t = new Headers(this.authHeaders);
    return (
      this.payloadIsMetadata(e.payload) && t.delete("Content-Type"),
      e.headers &&
        Object.entries(e.headers).forEach(([n, u]) => {
          t.set(n, u);
        }),
      t
    );
  }
  payloadIsMetadata(e) {
    return e instanceof FormData || e instanceof Blob || typeof e == "string";
  }
  makeURLParams(e, t) {
    const n = Object.entries(t)
      .filter((u) => typeof u[1] < "u")
      .map(([u, r]) => `${u}=${encodeURIComponent(`${r}`)}`)
      .join("&");
    return n ? (e.includes("?") ? `${e}&${n}` : `${e}?${n}`) : e;
  }
}
const G = "/api",
  h = `${G}/dictionary`;
class H {
  constructor(e) {
    m(this, "gateway");
    this.gateway = new J(e);
  }
  /** 根据字典项编码查询字典值 */
  async getDictionaryByItem(e) {
    const t = `${h}/getDataDictionaryByItem`,
      n = e.tenant ? { headers: { tenant: e.tenant } } : {};
    return await this.gateway.custom({
      url: t,
      query: e,
      method: "GET",
      ...n,
    });
  }
  /** 根据字典项编码查询字典值 (admin) 不限制租户 */
  async getAdminDictionaryByItem(e) {
    const t = `${h}/admin/getDataDictionaryByItem`;
    return await this.gateway.custom({
      url: t,
      query: e,
      method: "GET",
    });
  }
  async getDictionaryItemByCode(e) {
    const t = `${h}/getDictionaryItemByCode/${e.code}`;
    return await this.gateway.get({ url: t });
  }
  /** 根据字典项编码查询字典树 */
  async getDictionaryTree(e) {
    const t = `${h}/getCascadeDictionaryItem`;
    return await this.gateway.get({ url: t, payload: e });
  }
  /**
   * 根据id查询字典详情
   */
  async getDataDictionaryById(e) {
    const t = h + `/getDataDictionaryById/${e.id}`;
    return await this.gateway.get({ url: t, payload: e });
  }
  /** 添加字典项 */
  async addDataDictionaryItem(e) {
    const t = `${h}/addDictionaryItem`;
    return await this.gateway.create({ url: t, payload: e });
  }
  /** 添加字典 */
  async addDataDictionary(e) {
    const t = `${h}/addDataDictionary`,
      n = e.tenant ? { headers: { tenant: e.tenant } } : {};
    return await this.gateway.custom({
      url: t,
      payload: e,
      method: "POST",
      ...n,
    });
  }
  /** 修改字典 */
  async updateDataDictionary(e) {
    const t = `${h}/updateDataDictionary`,
      n = e.tenant ? { headers: { tenant: e.tenant } } : {};
    return await this.gateway.custom({
      url: t,
      payload: e,
      method: "PUT",
      ...n,
    });
  }
  /** 删除字典 */
  async deleteDataDictionary(e) {
    const t = `${h}/deleteDataDictionary/${e.id}`,
      n = e.tenant ? { headers: { tenant: e.tenant } } : {};
    await this.gateway.custom({
      url: t,
      method: "DELETE",
      ...n,
    });
  }
  /** 新增用户字典 */
  async addUserDictionary(e) {
    const t = `${h}/user-dictionary/add`;
    return await this.gateway.create({
      url: t,
      payload: e,
    });
  }
  /** 修改用户字典 */
  async updateUserDictionary(e) {
    const t = `${h}/user-dictionary/update`;
    await this.gateway.update({
      url: t,
      payload: e,
    });
  }
  /** 删除用户字典 */
  async deleteUserDictionary(e) {
    const t = `${h}/user-dictionary/delete/${e}`;
    await this.gateway.delete({ url: t });
  }
  /** 根据字典项编码查询字典值 用户 */
  async getUserDictionaryList(e) {
    const t = `${h}/user-dictionary/list`;
    return await this.gateway.get({
      url: t,
      payload: e,
    });
  }
  /** 批量新增字典 */
  async batchUserDictionaryAddOrUpdate(e) {
    const t = `${h}/user-dictionary/add/or/update/batch`;
    return await this.gateway.create({ url: t, payload: e });
  }
  /** 根据字典项编码查询字典值 */
  async getSysDictionaryByItem(e) {
    const t = `${h}/getSysDictionaryByItem`;
    return await this.gateway.get({
      url: t,
      payload: e,
    });
  }
}
class F {
  constructor(e, t) {
    m(this, "options");
    m(this, "auth");
    ((this.auth = e), (this.options = t), (this.options.aMapKey = t.aMapKey ?? "11ce1f353a30f9fa2b125c842780a4cf"));
  }
  /** 获取高德地图实例 */
  async getAMapInstance() {
    const e = await this.getMapConfig("gdMap");
    console.log(e, "eeeeeee");
    return (
      e.securityJsCode &&
        (window._AMapSecurityConfig = {
          securityJsCode: e.securityJsCode,
        }),
      await P.load({
        key: e.webKey,
        // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0",
        // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [
          "AMap.Geocoder",
          "AMap.MouseTool",
          "AMap.ControlBar",
          "AMap.Walking",
          "AMap.Geolocation",
          "AMap.IndexCluster",
          "AMap.MarkerCluster",
        ],
      })
    );
  }
  /**
   * 获取地图配置信息
   * @param code 地图字典code
   * @returns  地图配置信息
   */
  async getMapConfig(e) {
    const n = await new H(this.auth).getDictionaryByItem({ itemCode: "THIRD_SERVICE", code: e });
    if (!(n != null && n[0])) throw new Error("未获取到地图配置");
    return JSON.parse(n[0].variable);
  }
}
export { F as CubeMapPlugins };
