var ds = Object.defineProperty;
var fs = (p, u, s) => u in p ? ds(p, u, { enumerable: !0, configurable: !0, writable: !0, value: s }) : p[u] = s;
var ct = (p, u, s) => (fs(p, typeof u != "symbol" ? u + "" : u, s), s);
function _s(p) {
  return p <= 299;
}
class ms {
  static create(u, s) {
    const c = s.errorCode || s.code || s.status || "", y = s.errorMessage || s.message || "", o = s.errorDetail || s.details || "", a = s.errorDescription || "";
    switch (u) {
      case 400:
        return new ps(c, y, o, a);
      case 404:
        return new vs(c, y, o, a);
      case 401:
        return new gs(c, y, o, a);
      default:
        return new ys(c, y, o, a);
    }
  }
}
class ze extends Error {
  constructor(u, s, c, y) {
    super(), this.errorCode = u, this.errorMessage = s, this.errorDetail = c, this.errorDescription = y;
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
class ps extends ze {
}
class gs extends ze {
}
class vs extends ze {
}
class ys extends ze {
}
function Ls(p) {
  return !!p.code;
}
function ws(p) {
  return !!p.error_description;
}
class Ps {
  constructor(u) {
    ct(this, "authHeaders", new Headers());
    u && this.updateAuth(u);
  }
  async delete(u) {
    await this.request({
      url: this.makeURLParams(u.url, u.payload ?? {}),
      method: "DELETE"
    });
  }
  async get(u) {
    const s = this.makeURLParams(u.url, u.payload ?? {}), c = await this.request({
      url: s,
      method: "GET"
    });
    return this.parseResponse(c, u.responseType ?? "object");
  }
  async getText(u) {
    const s = this.makeURLParams(u.url, u.payload ?? {});
    return (await this.request({
      url: s,
      method: "GET"
    })).text();
  }
  async list(u) {
    const s = this.makeURLParams(u.url, u.payload ?? {});
    return await (await this.request({
      url: s,
      method: "GET"
    })).json();
  }
  async create(u) {
    const s = await this.request({
      ...u,
      method: "POST"
    });
    return this.parseResponse(s, u.responseType ?? "object");
  }
  async update(u) {
    const s = await this.request({
      ...u,
      method: "PUT"
    });
    return this.parseResponse(s, u.responseType ?? "object");
  }
  async custom(u) {
    let s = this.makeURLParams(u.url, (u == null ? void 0 : u.query) ?? {});
    ["GET", "DELETE"].includes(u.method) && !u.query && (s = this.makeURLParams(u.url, (u == null ? void 0 : u.payload) ?? {}));
    const c = await this.request({
      ...u,
      url: s
    });
    return this.parseResponse(c, u.responseType ?? "object");
  }
  async customBlob(u) {
    let s = this.makeURLParams(u.url, (u == null ? void 0 : u.query) ?? {});
    return ["GET"].includes(u.method) && !u.query && (s = this.makeURLParams(u.url, (u == null ? void 0 : u.payload) ?? {})), (await this.request({
      ...u,
      url: s
    })).blob();
  }
  updateAuth(u) {
    const { tenant: s, terminal: c, token: y } = u, o = this.authHeaders;
    s + "" == "0" && o.set("tenant", "0"), s && o.set("tenant", s), y && o.set("Authorization", `Bearer ${y}`), c && o.set("terminal", c), o.set("Content-Type", "application/json;charset=utf-8");
  }
  async parseResponse(u, s) {
    if (s === "void")
      return;
    if (s === "blob")
      return u.blob();
    if (s === "string")
      return u.text();
    if (s === "number" || s === "boolean")
      return u.json();
    if (s === "bigint")
      return BigInt(await u.text());
    const c = await u.text();
    return c.includes("{") || c.includes("[") ? JSON.parse(c) : c || {};
  }
  async request(u) {
    const s = this.makeHeaders(u), c = this.makeBody(u), y = await fetch(u.url, {
      method: u.method,
      headers: s,
      body: c
    });
    if (_s(y.status))
      return y;
    const o = await y.json();
    let a = o;
    throw Ls(o) && (a = {
      errorCode: `${o.code}`,
      errorMessage: o.message,
      errorDetail: typeof o.data == "string" ? `${o.data}` : JSON.stringify(o.data)
    }), ws(o) && (a.errorDescription = `${o.error_description}`), ms.create(y.status, a);
  }
  makeBody(u) {
    if (!["GET", "DELETE"].includes(u.method))
      return this.payloadIsMetadata(u.payload) ? u.payload : JSON.stringify(u.payload);
  }
  makeHeaders(u) {
    const s = new Headers(this.authHeaders);
    return this.payloadIsMetadata(u.payload) && s.delete("Content-Type"), u.headers && Object.entries(u.headers).forEach(([c, y]) => {
      s.set(c, y);
    }), s;
  }
  payloadIsMetadata(u) {
    return u instanceof FormData || u instanceof Blob || typeof u == "string";
  }
  makeURLParams(u, s) {
    const c = Object.entries(s).filter((y) => typeof y[1] < "u").map(([y, o]) => `${y}=${encodeURIComponent(`${o}`)}`).join("&");
    return c ? u.includes("?") ? `${u}&${c}` : `${u}?${c}` : u;
  }
}
const xs = "/api", nt = `${xs}/dictionary`;
class Ms {
  constructor(u) {
    ct(this, "gateway");
    this.gateway = new Ps(u);
  }
  /** 根据字典项编码查询字典值 */
  async getDictionaryByItem(u) {
    const s = `${nt}/getDataDictionaryByItem`, c = u.tenant ? { headers: { tenant: u.tenant } } : {}, y = await this.gateway.custom({
      url: s,
      query: u,
      method: "GET",
      ...c
    });
    return y.data || y;
  }
  /** 根据字典项编码查询字典值 (admin) 不限制租户 */
  async getAdminDictionaryByItem(u) {
    const s = `${nt}/admin/getDataDictionaryByItem`, c = await this.gateway.custom({
      url: s,
      query: u,
      method: "GET"
    });
    return c.data || c;
  }
  async getDictionaryItemByCode(u) {
    const s = `${nt}/getDictionaryItemByCode/${u.code}`, c = await this.gateway.get({ url: s });
    return c.data || c;
  }
  /** 根据字典项编码查询字典树 */
  async getDictionaryTree(u) {
    const s = `${nt}/getCascadeDictionaryItem`, c = await this.gateway.get({ url: s, payload: u });
    return c.data || c;
  }
  /**
  * 根据id查询字典详情
  */
  async getDataDictionaryById(u) {
    const s = nt + `/getDataDictionaryById/${u.id}`, c = await this.gateway.get({ url: s, payload: u });
    return c.data || c;
  }
  /** 添加字典项 */
  async addDataDictionaryItem(u) {
    const s = `${nt}/addDictionaryItem`, c = await this.gateway.create({ url: s, payload: u });
    return c.data || c;
  }
  /** 添加字典 */
  async addDataDictionary(u) {
    const s = `${nt}/addDataDictionary`, c = u.tenant ? { headers: { tenant: u.tenant } } : {}, y = await this.gateway.custom({
      url: s,
      payload: u,
      method: "POST",
      ...c
    });
    return y.data || y;
  }
  /** 修改字典 */
  async updateDataDictionary(u) {
    const s = `${nt}/updateDataDictionary`, c = u.tenant ? { headers: { tenant: u.tenant } } : {}, y = await this.gateway.custom({
      url: s,
      payload: u,
      method: "PUT",
      ...c
    });
    return y.data || y;
  }
  /** 删除字典 */
  async deleteDataDictionary(u) {
    const s = `${nt}/deleteDataDictionary/${u.id}`, c = u.tenant ? { headers: { tenant: u.tenant } } : {};
    await this.gateway.custom({
      url: s,
      method: "DELETE",
      ...c
    });
  }
  /** 新增用户字典 */
  async addUserDictionary(u) {
    const s = `${nt}/user-dictionary/add`, c = await this.gateway.create({
      url: s,
      payload: u
    });
    return c.data || c;
  }
  /** 修改用户字典 */
  async updateUserDictionary(u) {
    const s = `${nt}/user-dictionary/update`;
    await this.gateway.update({
      url: s,
      payload: u
    });
  }
  /** 删除用户字典 */
  async deleteUserDictionary(u) {
    const s = `${nt}/user-dictionary/delete/${u}`;
    await this.gateway.delete({ url: s });
  }
  /** 根据字典项编码查询字典值 用户 */
  async getUserDictionaryList(u) {
    const s = `${nt}/user-dictionary/list`;
    return await this.gateway.get({
      url: s,
      payload: u
    });
  }
  /** 批量新增字典 */
  async batchUserDictionaryAddOrUpdate(u) {
    const s = `${nt}/user-dictionary/add/or/update/batch`, c = await this.gateway.create({ url: s, payload: u });
    return c.data || c;
  }
  /** 根据字典项编码查询字典值 */
  async getSysDictionaryByItem(u) {
    const s = `${nt}/getSysDictionaryByItem`;
    return await this.gateway.get({
      url: s,
      payload: u
    });
  }
  async getSysDictionaryByCodeAndItemCode(u) {
    const s = `${nt}/getSysDictionaryByCodeAndItemCode`, c = await this.gateway.get({
      url: s,
      payload: u
    });
    return c.data || c;
  }
}
var Ae = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Dn(p) {
  return p && p.__esModule && Object.prototype.hasOwnProperty.call(p, "default") ? p.default : p;
}
var it = {};
(function(p) {
  Object.defineProperty(p, "__esModule", { value: !0 }), p.outOfChina = p.transformWGS84ToBD09 = p.transformBD09ToWGS84 = p.transformGCJ02ToWGS84 = p.transformWGS84ToGCJ02 = p.transformBD09ToGCJ02 = void 0;
  const u = 3.141592653589793 * 3e3 / 180, s = 3.141592653589793, c = 6378245, y = 0.006693421622965943, o = (f, v) => {
    let C = f - 65e-4, T = v - 6e-3, k = Math.sqrt(C * C + T * T) - 2e-5 * Math.sin(T * u), I = Math.atan2(T, C) - 3e-6 * Math.cos(C * u), U = k * Math.cos(I), H = k * Math.sin(I);
    return [U, H];
  };
  p.transformBD09ToGCJ02 = o;
  let a = (f, v) => {
    let C = Math.sqrt(f * f + v * v) + 2e-5 * Math.sin(v * u), T = Math.atan2(v, f) + 3e-6 * Math.cos(f * u), k = C * Math.cos(T) + 65e-4, I = C * Math.sin(T) + 6e-3;
    return [k, I];
  };
  const l = (f, v) => {
    if ((0, p.outOfChina)(f, v))
      return [f, v];
    {
      let C = m(f - 105, v - 35), T = b(f - 105, v - 35), k = v / 180 * s, I = Math.sin(k);
      I = 1 - y * I * I;
      let U = Math.sqrt(I);
      C = C * 180 / (c * (1 - y) / (I * U) * s), T = T * 180 / (c / U * Math.cos(k) * s);
      let H = v + C;
      return [f + T, H];
    }
  };
  p.transformWGS84ToGCJ02 = l;
  const d = (f, v) => {
    if ((0, p.outOfChina)(f, v))
      return [f, v];
    {
      let C = m(f - 105, v - 35), T = b(f - 105, v - 35), k = v / 180 * s, I = Math.sin(k);
      I = 1 - y * I * I;
      let U = Math.sqrt(I);
      C = C * 180 / (c * (1 - y) / (I * U) * s), T = T * 180 / (c / U * Math.cos(k) * s);
      let H = v + C, st = f + T;
      return [f * 2 - st, v * 2 - H];
    }
  };
  p.transformGCJ02ToWGS84 = d;
  const w = (f, v) => {
    let C = (0, p.transformBD09ToGCJ02)(f, v);
    return (0, p.transformGCJ02ToWGS84)(C[0], C[1]);
  };
  p.transformBD09ToWGS84 = w;
  const M = (f, v) => {
    let C = (0, p.transformWGS84ToGCJ02)(f, v);
    return a(C[0], C[1]);
  };
  p.transformWGS84ToBD09 = M;
  const m = (f, v) => {
    let C = -100 + 2 * f + 3 * v + 0.2 * v * v + 0.1 * f * v + 0.2 * Math.sqrt(Math.abs(f));
    return C += (20 * Math.sin(6 * f * s) + 20 * Math.sin(2 * f * s)) * 2 / 3, C += (20 * Math.sin(v * s) + 40 * Math.sin(v / 3 * s)) * 2 / 3, C += (160 * Math.sin(v / 12 * s) + 320 * Math.sin(v * s / 30)) * 2 / 3, C;
  }, b = (f, v) => {
    let C = 300 + f + 2 * v + 0.1 * f * f + 0.1 * f * v + 0.1 * Math.sqrt(Math.abs(f));
    return C += (20 * Math.sin(6 * f * s) + 20 * Math.sin(2 * f * s)) * 2 / 3, C += (20 * Math.sin(f * s) + 40 * Math.sin(f / 3 * s)) * 2 / 3, C += (150 * Math.sin(f / 12 * s) + 300 * Math.sin(f / 30 * s)) * 2 / 3, C;
  }, g = (f, v) => f < 72.004 || f > 137.8347 || v < 0.8293 || v > 55.8271 || !1;
  p.outOfChina = g;
})(it);
var Rn = { exports: {} };
(function(p, u) {
  (function(s, c) {
    p.exports = c();
  })(Ae, function() {
    function s(m) {
      var b = [];
      return m.AMapUI && b.push(c(m.AMapUI)), m.Loca && b.push(y(m.Loca)), Promise.all(b);
    }
    function c(m) {
      return new Promise(function(b, g) {
        var f = [];
        if (m.plugins)
          for (var v = 0; v < m.plugins.length; v += 1)
            a.AMapUI.plugins.indexOf(m.plugins[v]) == -1 && f.push(m.plugins[v]);
        if (l.AMapUI === o.failed)
          g("前次请求 AMapUI 失败");
        else if (l.AMapUI === o.notload) {
          l.AMapUI = o.loading, a.AMapUI.version = m.version || a.AMapUI.version, v = a.AMapUI.version;
          var C = document.body || document.head, T = document.createElement("script");
          T.type = "text/javascript", T.src = "https://webapi.amap.com/ui/" + v + "/main.js", T.onerror = function(k) {
            l.AMapUI = o.failed, g("请求 AMapUI 失败");
          }, T.onload = function() {
            if (l.AMapUI = o.loaded, f.length)
              window.AMapUI.loadUI(f, function() {
                for (var k = 0, I = f.length; k < I; k++) {
                  var U = f[k].split("/").slice(-1)[0];
                  window.AMapUI[U] = arguments[k];
                }
                for (b(); d.AMapUI.length; )
                  d.AMapUI.splice(0, 1)[0]();
              });
            else
              for (b(); d.AMapUI.length; )
                d.AMapUI.splice(0, 1)[0]();
          }, C.appendChild(T);
        } else
          l.AMapUI === o.loaded ? m.version && m.version !== a.AMapUI.version ? g("不允许多个版本 AMapUI 混用") : f.length ? window.AMapUI.loadUI(f, function() {
            for (var k = 0, I = f.length; k < I; k++) {
              var U = f[k].split("/").slice(-1)[0];
              window.AMapUI[U] = arguments[k];
            }
            b();
          }) : b() : m.version && m.version !== a.AMapUI.version ? g("不允许多个版本 AMapUI 混用") : d.AMapUI.push(function(k) {
            k ? g(k) : f.length ? window.AMapUI.loadUI(f, function() {
              for (var I = 0, U = f.length; I < U; I++) {
                var H = f[I].split("/").slice(-1)[0];
                window.AMapUI[H] = arguments[I];
              }
              b();
            }) : b();
          });
      });
    }
    function y(m) {
      return new Promise(function(b, g) {
        if (l.Loca === o.failed)
          g("前次请求 Loca 失败");
        else if (l.Loca === o.notload) {
          l.Loca = o.loading, a.Loca.version = m.version || a.Loca.version;
          var f = a.Loca.version, v = a.AMap.version.startsWith("2"), C = f.startsWith("2");
          if (v && !C || !v && C)
            g("JSAPI 与 Loca 版本不对应！！");
          else {
            v = a.key, C = document.body || document.head;
            var T = document.createElement("script");
            T.type = "text/javascript", T.src = "https://webapi.amap.com/loca?v=" + f + "&key=" + v, T.onerror = function(k) {
              l.Loca = o.failed, g("请求 AMapUI 失败");
            }, T.onload = function() {
              for (l.Loca = o.loaded, b(); d.Loca.length; )
                d.Loca.splice(0, 1)[0]();
            }, C.appendChild(T);
          }
        } else
          l.Loca === o.loaded ? m.version && m.version !== a.Loca.version ? g("不允许多个版本 Loca 混用") : b() : m.version && m.version !== a.Loca.version ? g("不允许多个版本 Loca 混用") : d.Loca.push(function(k) {
            k ? g(k) : g();
          });
      });
    }
    if (!window)
      throw Error("AMap JSAPI can only be used in Browser.");
    var o;
    (function(m) {
      m.notload = "notload", m.loading = "loading", m.loaded = "loaded", m.failed = "failed";
    })(o || (o = {}));
    var a = { key: "", AMap: { version: "1.4.15", plugins: [] }, AMapUI: { version: "1.1", plugins: [] }, Loca: { version: "1.3.2" } }, l = { AMap: o.notload, AMapUI: o.notload, Loca: o.notload }, d = { AMap: [], AMapUI: [], Loca: [] }, w = [], M = function(m) {
      typeof m == "function" && (l.AMap === o.loaded ? m(window.AMap) : w.push(m));
    };
    return { load: function(m) {
      return new Promise(function(b, g) {
        if (l.AMap == o.failed)
          g("");
        else if (l.AMap == o.notload) {
          var f = m.key, v = m.version, C = m.plugins;
          f ? (window.AMap && location.host !== "lbs.amap.com" && g("禁止多种API加载方式混用"), a.key = f, a.AMap.version = v || a.AMap.version, a.AMap.plugins = C || a.AMap.plugins, l.AMap = o.loading, v = document.body || document.head, window.___onAPILoaded = function(k) {
            if (delete window.___onAPILoaded, k)
              l.AMap = o.failed, g(k);
            else
              for (l.AMap = o.loaded, s(m).then(function() {
                b(window.AMap);
              }).catch(g); w.length; )
                w.splice(0, 1)[0]();
          }, C = document.createElement("script"), C.type = "text/javascript", C.src = "https://webapi.amap.com/maps?callback=___onAPILoaded&v=" + a.AMap.version + "&key=" + f + "&plugin=" + a.AMap.plugins.join(","), C.onerror = function(k) {
            l.AMap = o.failed, g(k);
          }, v.appendChild(C)) : g("请填写key");
        } else if (l.AMap == o.loaded)
          if (m.key && m.key !== a.key)
            g("多个不一致的 key");
          else if (m.version && m.version !== a.AMap.version)
            g("不允许多个版本 JSAPI 混用");
          else {
            if (f = [], m.plugins)
              for (v = 0; v < m.plugins.length; v += 1)
                a.AMap.plugins.indexOf(m.plugins[v]) == -1 && f.push(m.plugins[v]);
            f.length ? window.AMap.plugin(f, function() {
              s(m).then(function() {
                b(window.AMap);
              }).catch(g);
            }) : s(m).then(function() {
              b(window.AMap);
            }).catch(g);
          }
        else if (m.key && m.key !== a.key)
          g("多个不一致的 key");
        else if (m.version && m.version !== a.AMap.version)
          g("不允许多个版本 JSAPI 混用");
        else {
          var T = [];
          if (m.plugins)
            for (v = 0; v < m.plugins.length; v += 1)
              a.AMap.plugins.indexOf(m.plugins[v]) == -1 && T.push(m.plugins[v]);
          M(function() {
            T.length ? window.AMap.plugin(T, function() {
              s(m).then(function() {
                b(window.AMap);
              }).catch(g);
            }) : s(m).then(function() {
              b(window.AMap);
            }).catch(g);
          });
        }
      });
    }, reset: function() {
      delete window.AMap, delete window.AMapUI, delete window.Loca, a = { key: "", AMap: { version: "1.4.15", plugins: [] }, AMapUI: { version: "1.1", plugins: [] }, Loca: { version: "1.3.2" } }, l = {
        AMap: o.notload,
        AMapUI: o.notload,
        Loca: o.notload
      }, d = { AMap: [], AMapUI: [], Loca: [] };
    } };
  });
})(Rn);
var bs = Rn.exports;
const Cs = /* @__PURE__ */ Dn(bs);
class Ts {
  constructor(u) {
    ct(this, "onMapClick", null);
    ct(this, "mapType", "gdMap");
    ct(this, "mapInstance", null);
    ct(this, "mapLoaded", !1);
    ct(this, "mapConfig", null);
    ct(this, "auth");
    this.auth = u;
  }
  async getAddressByLntLat(u, s) {
    if (await this.mapLoader(), this.mapType === "gdMap") {
      const c = new window.AMap.Geocoder({ city: "全国" });
      return new Promise((y, o) => {
        c.getAddress([u, s], function(a, l) {
          if (a === "complete" && l.regeocode) {
            const d = l.regeocode.formattedAddress;
            y({ address: d });
          } else
            o(new Error("高德获取地址失败"));
        });
      });
    } else
      return new Promise((c, y) => {
        var a;
        const o = document.createElement("script");
        o.src = "https://api.tianditu.gov.cn/apiserver/ajaxproxy?proxyReqUrl=" + encodeURIComponent(`http://api.tianditu.gov.cn/geocoder?postStr={"lon":"${u}","lat":"${s}"}&type=geocode&tk=${(a = this.mapConfig) == null ? void 0 : a.webKey}`), o.onload = () => {
          var l;
          document.body.removeChild(o);
          try {
            c({ address: (l = window.tdt_loadResult) == null ? void 0 : l.result.formatted_address });
          } catch {
            y(new Error("获取地址失败"));
          }
        }, document.body.appendChild(o);
      });
  }
  async getLntLatByAddress(u) {
    if (await this.mapLoader(), this.mapType === "gdMap") {
      const s = new window.AMap.Geocoder({ city: "全国" });
      return new Promise((c, y) => {
        s.getLocation(u, function(o, a) {
          if (o === "complete" && a.info === "OK") {
            const l = {
              lng: a.geocodes[0].location.lng,
              lat: a.geocodes[0].location.lat
            };
            c(l);
          } else
            y(new Error("获取地址失败"));
        });
      });
    } else
      return new Promise((s, c) => {
        var o;
        const y = document.createElement("script");
        y.src = "https://api.tianditu.gov.cn/apiserver/ajaxproxy?proxyReqUrl=" + encodeURIComponent(`http://api.tianditu.gov.cn/geocoder?ds={"keyWord":"${u}"}&type=geocode&tk=${(o = this.mapConfig) == null ? void 0 : o.webKey}`), y.onload = () => {
          var a;
          document.body.removeChild(y);
          try {
            const l = (a = window.tdt_loadResult) == null ? void 0 : a.location, d = it.transformWGS84ToGCJ02(Number(l.lon), Number(l.lat));
            s({
              lng: d[0],
              lat: d[1]
            });
          } catch {
            c(new Error("获取地址失败"));
          }
        }, document.body.appendChild(y);
      });
  }
  /** 通过浏览器获取经纬度 */
  async getLntLatFromBrowser() {
    return new Promise((u, s) => {
      navigator.geolocation.getCurrentPosition(
        (c) => {
          const { latitude: y, longitude: o, accuracy: a } = c.coords;
          u({
            lng: o,
            lat: y,
            accuracy: a
          });
        },
        (c) => {
          switch (c.code) {
            case 0:
              s(new Error("位置信息获取失败"));
              break;
            case 1:
              s(new Error("用户拒绝请求地理定位"));
              break;
            case 2:
              s(new Error("浏览器哦无法获取当前位置"));
              break;
            case 3:
              s(new Error("请求超时，请重试"));
              break;
          }
        },
        {
          timeout: 3e4,
          enableHighAccuracy: !0,
          maximumAge: 0
        }
      );
    });
  }
  /** 获取地图配置 */
  async getMapConfig() {
    var c, y;
    if (this.mapConfig)
      return this.mapConfig;
    const u = new Ms(this.auth), s = await u.getDictionaryByItem({ itemCode: "THIRD_SERVICE", code: "TD_MAP" });
    if (s.length > 0 && ((c = s == null ? void 0 : s[0]) != null && c.variable))
      this.mapType = "TD_MAP", this.mapConfig = JSON.parse(s[0].variable);
    else {
      this.mapType = "gdMap";
      const o = await u.getDictionaryByItem({ itemCode: "THIRD_SERVICE", code: "gdMap" });
      if (o.length === 0 || !((y = o == null ? void 0 : o[0]) != null && y.variable))
        throw new Error("未获取到地图配置");
      this.mapConfig = JSON.parse(o[0].variable);
    }
    return this.mapConfig;
  }
  async mapLoader() {
    if (this.mapLoaded)
      return;
    const u = await this.getMapConfig();
    if (this.mapType === "gdMap") {
      if (window.AMap)
        return;
      u.securityJsCode && (window._AMapSecurityConfig = {
        securityJsCode: u.securityJsCode
      }), window.AMap = await Cs.load({
        key: u.webKey,
        // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0",
        // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ["AMap.Geocoder", "AMap.MouseTool", "AMap.ControlBar", "AMap.Walking", "AMap.Geolocation", "AMap.IndexCluster", "AMap.MarkerCluster"]
      });
    } else {
      if (window.T)
        return;
      await new Promise((s) => {
        const c = document.createElement("script");
        c.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${u.webKey}`, c.onload = () => {
          s();
        }, document.body.appendChild(c);
      });
    }
    this.mapLoaded = !0;
  }
  getMapType() {
    return this.mapType;
  }
  getMapInfo() {
    this.ensureMapInstance();
    const u = this.mapInstance.getCenter();
    if (this.mapType === "TD_MAP") {
      const s = it.transformWGS84ToGCJ02(u.lng, u.lat);
      u.lng = s[0], u.lat = s[1];
    }
    return {
      center: {
        lng: u.lng,
        lat: u.lat
      },
      zoom: this.mapInstance.getZoom(),
      rotation: this.mapInstance.getBearing()
    };
  }
  /** 检查地图实例是否存在，否则抛出异常 */
  ensureMapInstance() {
    if (!this.mapInstance)
      throw new Error("地图实例不存在");
  }
}
var ke = { exports: {} };
/* @preserve
 * Leaflet 1.9.4, a JS library for interactive maps. https://leafletjs.com
 * (c) 2010-2023 Vladimir Agafonkin, (c) 2010-2011 CloudMade
 */
var Tn;
function Nn() {
  return Tn || (Tn = 1, function(p, u) {
    (function(s, c) {
      c(u);
    })(Ae, function(s) {
      var c = "1.9.4";
      function y(t) {
        var e, i, n, r;
        for (i = 1, n = arguments.length; i < n; i++) {
          r = arguments[i];
          for (e in r)
            t[e] = r[e];
        }
        return t;
      }
      var o = Object.create || function() {
        function t() {
        }
        return function(e) {
          return t.prototype = e, new t();
        };
      }();
      function a(t, e) {
        var i = Array.prototype.slice;
        if (t.bind)
          return t.bind.apply(t, i.call(arguments, 1));
        var n = i.call(arguments, 2);
        return function() {
          return t.apply(e, n.length ? n.concat(i.call(arguments)) : arguments);
        };
      }
      var l = 0;
      function d(t) {
        return "_leaflet_id" in t || (t._leaflet_id = ++l), t._leaflet_id;
      }
      function w(t, e, i) {
        var n, r, h, _;
        return _ = function() {
          n = !1, r && (h.apply(i, r), r = !1);
        }, h = function() {
          n ? r = arguments : (t.apply(i, arguments), setTimeout(_, e), n = !0);
        }, h;
      }
      function M(t, e, i) {
        var n = e[1], r = e[0], h = n - r;
        return t === n && i ? t : ((t - r) % h + h) % h + r;
      }
      function m() {
        return !1;
      }
      function b(t, e) {
        if (e === !1)
          return t;
        var i = Math.pow(10, e === void 0 ? 6 : e);
        return Math.round(t * i) / i;
      }
      function g(t) {
        return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, "");
      }
      function f(t) {
        return g(t).split(/\s+/);
      }
      function v(t, e) {
        Object.prototype.hasOwnProperty.call(t, "options") || (t.options = t.options ? o(t.options) : {});
        for (var i in e)
          t.options[i] = e[i];
        return t.options;
      }
      function C(t, e, i) {
        var n = [];
        for (var r in t)
          n.push(encodeURIComponent(i ? r.toUpperCase() : r) + "=" + encodeURIComponent(t[r]));
        return (!e || e.indexOf("?") === -1 ? "?" : "&") + n.join("&");
      }
      var T = /\{ *([\w_ -]+) *\}/g;
      function k(t, e) {
        return t.replace(T, function(i, n) {
          var r = e[n];
          if (r === void 0)
            throw new Error("No value provided for variable " + i);
          return typeof r == "function" && (r = r(e)), r;
        });
      }
      var I = Array.isArray || function(t) {
        return Object.prototype.toString.call(t) === "[object Array]";
      };
      function U(t, e) {
        for (var i = 0; i < t.length; i++)
          if (t[i] === e)
            return i;
        return -1;
      }
      var H = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
      function st(t) {
        return window["webkit" + t] || window["moz" + t] || window["ms" + t];
      }
      var Pt = 0;
      function At(t) {
        var e = +/* @__PURE__ */ new Date(), i = Math.max(0, 16 - (e - Pt));
        return Pt = e + i, window.setTimeout(t, i);
      }
      var Ot = window.requestAnimationFrame || st("RequestAnimationFrame") || At, Nt = window.cancelAnimationFrame || st("CancelAnimationFrame") || st("CancelRequestAnimationFrame") || function(t) {
        window.clearTimeout(t);
      };
      function j(t, e, i) {
        if (i && Ot === At)
          t.call(e);
        else
          return Ot.call(window, a(t, e));
      }
      function rt(t) {
        t && Nt.call(window, t);
      }
      var Oe = {
        __proto__: null,
        extend: y,
        create: o,
        bind: a,
        get lastId() {
          return l;
        },
        stamp: d,
        throttle: w,
        wrapNum: M,
        falseFn: m,
        formatNum: b,
        trim: g,
        splitWords: f,
        setOptions: v,
        getParamString: C,
        template: k,
        isArray: I,
        indexOf: U,
        emptyImageUrl: H,
        requestFn: Ot,
        cancelFn: Nt,
        requestAnimFrame: j,
        cancelAnimFrame: rt
      };
      function xt() {
      }
      xt.extend = function(t) {
        var e = function() {
          v(this), this.initialize && this.initialize.apply(this, arguments), this.callInitHooks();
        }, i = e.__super__ = this.prototype, n = o(i);
        n.constructor = e, e.prototype = n;
        for (var r in this)
          Object.prototype.hasOwnProperty.call(this, r) && r !== "prototype" && r !== "__super__" && (e[r] = this[r]);
        return t.statics && y(e, t.statics), t.includes && (Gn(t.includes), y.apply(null, [n].concat(t.includes))), y(n, t), delete n.statics, delete n.includes, n.options && (n.options = i.options ? o(i.options) : {}, y(n.options, t.options)), n._initHooks = [], n.callInitHooks = function() {
          if (!this._initHooksCalled) {
            i.callInitHooks && i.callInitHooks.call(this), this._initHooksCalled = !0;
            for (var h = 0, _ = n._initHooks.length; h < _; h++)
              n._initHooks[h].call(this);
          }
        }, e;
      }, xt.include = function(t) {
        var e = this.prototype.options;
        return y(this.prototype, t), t.options && (this.prototype.options = e, this.mergeOptions(t.options)), this;
      }, xt.mergeOptions = function(t) {
        return y(this.prototype.options, t), this;
      }, xt.addInitHook = function(t) {
        var e = Array.prototype.slice.call(arguments, 1), i = typeof t == "function" ? t : function() {
          this[t].apply(this, e);
        };
        return this.prototype._initHooks = this.prototype._initHooks || [], this.prototype._initHooks.push(i), this;
      };
      function Gn(t) {
        if (!(typeof L > "u" || !L || !L.Mixin)) {
          t = I(t) ? t : [t];
          for (var e = 0; e < t.length; e++)
            t[e] === L.Mixin.Events && void 0;
        }
      }
      var dt = {
        /* @method on(type: String, fn: Function, context?: Object): this
         * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
         *
         * @alternative
         * @method on(eventMap: Object): this
         * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
         */
        on: function(t, e, i) {
          if (typeof t == "object")
            for (var n in t)
              this._on(n, t[n], e);
          else {
            t = f(t);
            for (var r = 0, h = t.length; r < h; r++)
              this._on(t[r], e, i);
          }
          return this;
        },
        /* @method off(type: String, fn?: Function, context?: Object): this
         * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
         *
         * @alternative
         * @method off(eventMap: Object): this
         * Removes a set of type/listener pairs.
         *
         * @alternative
         * @method off: this
         * Removes all listeners to all events on the object. This includes implicitly attached events.
         */
        off: function(t, e, i) {
          if (!arguments.length)
            delete this._events;
          else if (typeof t == "object")
            for (var n in t)
              this._off(n, t[n], e);
          else {
            t = f(t);
            for (var r = arguments.length === 1, h = 0, _ = t.length; h < _; h++)
              r ? this._off(t[h]) : this._off(t[h], e, i);
          }
          return this;
        },
        // attach listener (without syntactic sugar now)
        _on: function(t, e, i, n) {
          if (typeof e != "function") {
            return;
          }
          if (this._listens(t, e, i) === !1) {
            i === this && (i = void 0);
            var r = { fn: e, ctx: i };
            n && (r.once = !0), this._events = this._events || {}, this._events[t] = this._events[t] || [], this._events[t].push(r);
          }
        },
        _off: function(t, e, i) {
          var n, r, h;
          if (this._events && (n = this._events[t], !!n)) {
            if (arguments.length === 1) {
              if (this._firingCount)
                for (r = 0, h = n.length; r < h; r++)
                  n[r].fn = m;
              delete this._events[t];
              return;
            }
            if (typeof e != "function") {
              return;
            }
            var _ = this._listens(t, e, i);
            if (_ !== !1) {
              var P = n[_];
              this._firingCount && (P.fn = m, this._events[t] = n = n.slice()), n.splice(_, 1);
            }
          }
        },
        // @method fire(type: String, data?: Object, propagate?: Boolean): this
        // Fires an event of the specified type. You can optionally provide a data
        // object — the first argument of the listener function will contain its
        // properties. The event can optionally be propagated to event parents.
        fire: function(t, e, i) {
          if (!this.listens(t, i))
            return this;
          var n = y({}, e, {
            type: t,
            target: this,
            sourceTarget: e && e.sourceTarget || this
          });
          if (this._events) {
            var r = this._events[t];
            if (r) {
              this._firingCount = this._firingCount + 1 || 1;
              for (var h = 0, _ = r.length; h < _; h++) {
                var P = r[h], x = P.fn;
                P.once && this.off(t, x, P.ctx), x.call(P.ctx || this, n);
              }
              this._firingCount--;
            }
          }
          return i && this._propagateEvent(n), this;
        },
        // @method listens(type: String, propagate?: Boolean): Boolean
        // @method listens(type: String, fn: Function, context?: Object, propagate?: Boolean): Boolean
        // Returns `true` if a particular event type has any listeners attached to it.
        // The verification can optionally be propagated, it will return `true` if parents have the listener attached to it.
        listens: function(t, e, i, n) {
          typeof t != "string" && void 0;
          var r = e;
          typeof e != "function" && (n = !!e, r = void 0, i = void 0);
          var h = this._events && this._events[t];
          if (h && h.length && this._listens(t, r, i) !== !1)
            return !0;
          if (n) {
            for (var _ in this._eventParents)
              if (this._eventParents[_].listens(t, e, i, n))
                return !0;
          }
          return !1;
        },
        // returns the index (number) or false
        _listens: function(t, e, i) {
          if (!this._events)
            return !1;
          var n = this._events[t] || [];
          if (!e)
            return !!n.length;
          i === this && (i = void 0);
          for (var r = 0, h = n.length; r < h; r++)
            if (n[r].fn === e && n[r].ctx === i)
              return r;
          return !1;
        },
        // @method once(…): this
        // Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
        once: function(t, e, i) {
          if (typeof t == "object")
            for (var n in t)
              this._on(n, t[n], e, !0);
          else {
            t = f(t);
            for (var r = 0, h = t.length; r < h; r++)
              this._on(t[r], e, i, !0);
          }
          return this;
        },
        // @method addEventParent(obj: Evented): this
        // Adds an event parent - an `Evented` that will receive propagated events
        addEventParent: function(t) {
          return this._eventParents = this._eventParents || {}, this._eventParents[d(t)] = t, this;
        },
        // @method removeEventParent(obj: Evented): this
        // Removes an event parent, so it will stop receiving propagated events
        removeEventParent: function(t) {
          return this._eventParents && delete this._eventParents[d(t)], this;
        },
        _propagateEvent: function(t) {
          for (var e in this._eventParents)
            this._eventParents[e].fire(t.type, y({
              layer: t.target,
              propagatedFrom: t.target
            }, t), !0);
        }
      };
      dt.addEventListener = dt.on, dt.removeEventListener = dt.clearAllEventListeners = dt.off, dt.addOneTimeEventListener = dt.once, dt.fireEvent = dt.fire, dt.hasEventListeners = dt.listens;
      var Kt = xt.extend(dt);
      function B(t, e, i) {
        this.x = i ? Math.round(t) : t, this.y = i ? Math.round(e) : e;
      }
      var mi = Math.trunc || function(t) {
        return t > 0 ? Math.floor(t) : Math.ceil(t);
      };
      B.prototype = {
        // @method clone(): Point
        // Returns a copy of the current point.
        clone: function() {
          return new B(this.x, this.y);
        },
        // @method add(otherPoint: Point): Point
        // Returns the result of addition of the current and the given points.
        add: function(t) {
          return this.clone()._add(E(t));
        },
        _add: function(t) {
          return this.x += t.x, this.y += t.y, this;
        },
        // @method subtract(otherPoint: Point): Point
        // Returns the result of subtraction of the given point from the current.
        subtract: function(t) {
          return this.clone()._subtract(E(t));
        },
        _subtract: function(t) {
          return this.x -= t.x, this.y -= t.y, this;
        },
        // @method divideBy(num: Number): Point
        // Returns the result of division of the current point by the given number.
        divideBy: function(t) {
          return this.clone()._divideBy(t);
        },
        _divideBy: function(t) {
          return this.x /= t, this.y /= t, this;
        },
        // @method multiplyBy(num: Number): Point
        // Returns the result of multiplication of the current point by the given number.
        multiplyBy: function(t) {
          return this.clone()._multiplyBy(t);
        },
        _multiplyBy: function(t) {
          return this.x *= t, this.y *= t, this;
        },
        // @method scaleBy(scale: Point): Point
        // Multiply each coordinate of the current point by each coordinate of
        // `scale`. In linear algebra terms, multiply the point by the
        // [scaling matrix](https://en.wikipedia.org/wiki/Scaling_%28geometry%29#Matrix_representation)
        // defined by `scale`.
        scaleBy: function(t) {
          return new B(this.x * t.x, this.y * t.y);
        },
        // @method unscaleBy(scale: Point): Point
        // Inverse of `scaleBy`. Divide each coordinate of the current point by
        // each coordinate of `scale`.
        unscaleBy: function(t) {
          return new B(this.x / t.x, this.y / t.y);
        },
        // @method round(): Point
        // Returns a copy of the current point with rounded coordinates.
        round: function() {
          return this.clone()._round();
        },
        _round: function() {
          return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
        },
        // @method floor(): Point
        // Returns a copy of the current point with floored coordinates (rounded down).
        floor: function() {
          return this.clone()._floor();
        },
        _floor: function() {
          return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
        },
        // @method ceil(): Point
        // Returns a copy of the current point with ceiled coordinates (rounded up).
        ceil: function() {
          return this.clone()._ceil();
        },
        _ceil: function() {
          return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
        },
        // @method trunc(): Point
        // Returns a copy of the current point with truncated coordinates (rounded towards zero).
        trunc: function() {
          return this.clone()._trunc();
        },
        _trunc: function() {
          return this.x = mi(this.x), this.y = mi(this.y), this;
        },
        // @method distanceTo(otherPoint: Point): Number
        // Returns the cartesian distance between the current and the given points.
        distanceTo: function(t) {
          t = E(t);
          var e = t.x - this.x, i = t.y - this.y;
          return Math.sqrt(e * e + i * i);
        },
        // @method equals(otherPoint: Point): Boolean
        // Returns `true` if the given point has the same coordinates.
        equals: function(t) {
          return t = E(t), t.x === this.x && t.y === this.y;
        },
        // @method contains(otherPoint: Point): Boolean
        // Returns `true` if both coordinates of the given point are less than the corresponding current point coordinates (in absolute values).
        contains: function(t) {
          return t = E(t), Math.abs(t.x) <= Math.abs(this.x) && Math.abs(t.y) <= Math.abs(this.y);
        },
        // @method toString(): String
        // Returns a string representation of the point for debugging purposes.
        toString: function() {
          return "Point(" + b(this.x) + ", " + b(this.y) + ")";
        }
      };
      function E(t, e, i) {
        return t instanceof B ? t : I(t) ? new B(t[0], t[1]) : t == null ? t : typeof t == "object" && "x" in t && "y" in t ? new B(t.x, t.y) : new B(t, e, i);
      }
      function V(t, e) {
        if (t)
          for (var i = e ? [t, e] : t, n = 0, r = i.length; n < r; n++)
            this.extend(i[n]);
      }
      V.prototype = {
        // @method extend(point: Point): this
        // Extends the bounds to contain the given point.
        // @alternative
        // @method extend(otherBounds: Bounds): this
        // Extend the bounds to contain the given bounds
        extend: function(t) {
          var e, i;
          if (!t)
            return this;
          if (t instanceof B || typeof t[0] == "number" || "x" in t)
            e = i = E(t);
          else if (t = ht(t), e = t.min, i = t.max, !e || !i)
            return this;
          return !this.min && !this.max ? (this.min = e.clone(), this.max = i.clone()) : (this.min.x = Math.min(e.x, this.min.x), this.max.x = Math.max(i.x, this.max.x), this.min.y = Math.min(e.y, this.min.y), this.max.y = Math.max(i.y, this.max.y)), this;
        },
        // @method getCenter(round?: Boolean): Point
        // Returns the center point of the bounds.
        getCenter: function(t) {
          return E(
            (this.min.x + this.max.x) / 2,
            (this.min.y + this.max.y) / 2,
            t
          );
        },
        // @method getBottomLeft(): Point
        // Returns the bottom-left point of the bounds.
        getBottomLeft: function() {
          return E(this.min.x, this.max.y);
        },
        // @method getTopRight(): Point
        // Returns the top-right point of the bounds.
        getTopRight: function() {
          return E(this.max.x, this.min.y);
        },
        // @method getTopLeft(): Point
        // Returns the top-left point of the bounds (i.e. [`this.min`](#bounds-min)).
        getTopLeft: function() {
          return this.min;
        },
        // @method getBottomRight(): Point
        // Returns the bottom-right point of the bounds (i.e. [`this.max`](#bounds-max)).
        getBottomRight: function() {
          return this.max;
        },
        // @method getSize(): Point
        // Returns the size of the given bounds
        getSize: function() {
          return this.max.subtract(this.min);
        },
        // @method contains(otherBounds: Bounds): Boolean
        // Returns `true` if the rectangle contains the given one.
        // @alternative
        // @method contains(point: Point): Boolean
        // Returns `true` if the rectangle contains the given point.
        contains: function(t) {
          var e, i;
          return typeof t[0] == "number" || t instanceof B ? t = E(t) : t = ht(t), t instanceof V ? (e = t.min, i = t.max) : e = i = t, e.x >= this.min.x && i.x <= this.max.x && e.y >= this.min.y && i.y <= this.max.y;
        },
        // @method intersects(otherBounds: Bounds): Boolean
        // Returns `true` if the rectangle intersects the given bounds. Two bounds
        // intersect if they have at least one point in common.
        intersects: function(t) {
          t = ht(t);
          var e = this.min, i = this.max, n = t.min, r = t.max, h = r.x >= e.x && n.x <= i.x, _ = r.y >= e.y && n.y <= i.y;
          return h && _;
        },
        // @method overlaps(otherBounds: Bounds): Boolean
        // Returns `true` if the rectangle overlaps the given bounds. Two bounds
        // overlap if their intersection is an area.
        overlaps: function(t) {
          t = ht(t);
          var e = this.min, i = this.max, n = t.min, r = t.max, h = r.x > e.x && n.x < i.x, _ = r.y > e.y && n.y < i.y;
          return h && _;
        },
        // @method isValid(): Boolean
        // Returns `true` if the bounds are properly initialized.
        isValid: function() {
          return !!(this.min && this.max);
        },
        // @method pad(bufferRatio: Number): Bounds
        // Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
        // For example, a ratio of 0.5 extends the bounds by 50% in each direction.
        // Negative values will retract the bounds.
        pad: function(t) {
          var e = this.min, i = this.max, n = Math.abs(e.x - i.x) * t, r = Math.abs(e.y - i.y) * t;
          return ht(
            E(e.x - n, e.y - r),
            E(i.x + n, i.y + r)
          );
        },
        // @method equals(otherBounds: Bounds): Boolean
        // Returns `true` if the rectangle is equivalent to the given bounds.
        equals: function(t) {
          return t ? (t = ht(t), this.min.equals(t.getTopLeft()) && this.max.equals(t.getBottomRight())) : !1;
        }
      };
      function ht(t, e) {
        return !t || t instanceof V ? t : new V(t, e);
      }
      function ut(t, e) {
        if (t)
          for (var i = e ? [t, e] : t, n = 0, r = i.length; n < r; n++)
            this.extend(i[n]);
      }
      ut.prototype = {
        // @method extend(latlng: LatLng): this
        // Extend the bounds to contain the given point
        // @alternative
        // @method extend(otherBounds: LatLngBounds): this
        // Extend the bounds to contain the given bounds
        extend: function(t) {
          var e = this._southWest, i = this._northEast, n, r;
          if (t instanceof W)
            n = t, r = t;
          else if (t instanceof ut) {
            if (n = t._southWest, r = t._northEast, !n || !r)
              return this;
          } else
            return t ? this.extend(N(t) || X(t)) : this;
          return !e && !i ? (this._southWest = new W(n.lat, n.lng), this._northEast = new W(r.lat, r.lng)) : (e.lat = Math.min(n.lat, e.lat), e.lng = Math.min(n.lng, e.lng), i.lat = Math.max(r.lat, i.lat), i.lng = Math.max(r.lng, i.lng)), this;
        },
        // @method pad(bufferRatio: Number): LatLngBounds
        // Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
        // For example, a ratio of 0.5 extends the bounds by 50% in each direction.
        // Negative values will retract the bounds.
        pad: function(t) {
          var e = this._southWest, i = this._northEast, n = Math.abs(e.lat - i.lat) * t, r = Math.abs(e.lng - i.lng) * t;
          return new ut(
            new W(e.lat - n, e.lng - r),
            new W(i.lat + n, i.lng + r)
          );
        },
        // @method getCenter(): LatLng
        // Returns the center point of the bounds.
        getCenter: function() {
          return new W(
            (this._southWest.lat + this._northEast.lat) / 2,
            (this._southWest.lng + this._northEast.lng) / 2
          );
        },
        // @method getSouthWest(): LatLng
        // Returns the south-west point of the bounds.
        getSouthWest: function() {
          return this._southWest;
        },
        // @method getNorthEast(): LatLng
        // Returns the north-east point of the bounds.
        getNorthEast: function() {
          return this._northEast;
        },
        // @method getNorthWest(): LatLng
        // Returns the north-west point of the bounds.
        getNorthWest: function() {
          return new W(this.getNorth(), this.getWest());
        },
        // @method getSouthEast(): LatLng
        // Returns the south-east point of the bounds.
        getSouthEast: function() {
          return new W(this.getSouth(), this.getEast());
        },
        // @method getWest(): Number
        // Returns the west longitude of the bounds
        getWest: function() {
          return this._southWest.lng;
        },
        // @method getSouth(): Number
        // Returns the south latitude of the bounds
        getSouth: function() {
          return this._southWest.lat;
        },
        // @method getEast(): Number
        // Returns the east longitude of the bounds
        getEast: function() {
          return this._northEast.lng;
        },
        // @method getNorth(): Number
        // Returns the north latitude of the bounds
        getNorth: function() {
          return this._northEast.lat;
        },
        // @method contains(otherBounds: LatLngBounds): Boolean
        // Returns `true` if the rectangle contains the given one.
        // @alternative
        // @method contains (latlng: LatLng): Boolean
        // Returns `true` if the rectangle contains the given point.
        contains: function(t) {
          typeof t[0] == "number" || t instanceof W || "lat" in t ? t = N(t) : t = X(t);
          var e = this._southWest, i = this._northEast, n, r;
          return t instanceof ut ? (n = t.getSouthWest(), r = t.getNorthEast()) : n = r = t, n.lat >= e.lat && r.lat <= i.lat && n.lng >= e.lng && r.lng <= i.lng;
        },
        // @method intersects(otherBounds: LatLngBounds): Boolean
        // Returns `true` if the rectangle intersects the given bounds. Two bounds intersect if they have at least one point in common.
        intersects: function(t) {
          t = X(t);
          var e = this._southWest, i = this._northEast, n = t.getSouthWest(), r = t.getNorthEast(), h = r.lat >= e.lat && n.lat <= i.lat, _ = r.lng >= e.lng && n.lng <= i.lng;
          return h && _;
        },
        // @method overlaps(otherBounds: LatLngBounds): Boolean
        // Returns `true` if the rectangle overlaps the given bounds. Two bounds overlap if their intersection is an area.
        overlaps: function(t) {
          t = X(t);
          var e = this._southWest, i = this._northEast, n = t.getSouthWest(), r = t.getNorthEast(), h = r.lat > e.lat && n.lat < i.lat, _ = r.lng > e.lng && n.lng < i.lng;
          return h && _;
        },
        // @method toBBoxString(): String
        // Returns a string with bounding box coordinates in a 'southwest_lng,southwest_lat,northeast_lng,northeast_lat' format. Useful for sending requests to web services that return geo data.
        toBBoxString: function() {
          return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(",");
        },
        // @method equals(otherBounds: LatLngBounds, maxMargin?: Number): Boolean
        // Returns `true` if the rectangle is equivalent (within a small margin of error) to the given bounds. The margin of error can be overridden by setting `maxMargin` to a small number.
        equals: function(t, e) {
          return t ? (t = X(t), this._southWest.equals(t.getSouthWest(), e) && this._northEast.equals(t.getNorthEast(), e)) : !1;
        },
        // @method isValid(): Boolean
        // Returns `true` if the bounds are properly initialized.
        isValid: function() {
          return !!(this._southWest && this._northEast);
        }
      };
      function X(t, e) {
        return t instanceof ut ? t : new ut(t, e);
      }
      function W(t, e, i) {
        if (isNaN(t) || isNaN(e))
          throw new Error("Invalid LatLng object: (" + t + ", " + e + ")");
        this.lat = +t, this.lng = +e, i !== void 0 && (this.alt = +i);
      }
      W.prototype = {
        // @method equals(otherLatLng: LatLng, maxMargin?: Number): Boolean
        // Returns `true` if the given `LatLng` point is at the same position (within a small margin of error). The margin of error can be overridden by setting `maxMargin` to a small number.
        equals: function(t, e) {
          if (!t)
            return !1;
          t = N(t);
          var i = Math.max(
            Math.abs(this.lat - t.lat),
            Math.abs(this.lng - t.lng)
          );
          return i <= (e === void 0 ? 1e-9 : e);
        },
        // @method toString(): String
        // Returns a string representation of the point (for debugging purposes).
        toString: function(t) {
          return "LatLng(" + b(this.lat, t) + ", " + b(this.lng, t) + ")";
        },
        // @method distanceTo(otherLatLng: LatLng): Number
        // Returns the distance (in meters) to the given `LatLng` calculated using the [Spherical Law of Cosines](https://en.wikipedia.org/wiki/Spherical_law_of_cosines).
        distanceTo: function(t) {
          return kt.distance(this, N(t));
        },
        // @method wrap(): LatLng
        // Returns a new `LatLng` object with the longitude wrapped so it's always between -180 and +180 degrees.
        wrap: function() {
          return kt.wrapLatLng(this);
        },
        // @method toBounds(sizeInMeters: Number): LatLngBounds
        // Returns a new `LatLngBounds` object in which each boundary is `sizeInMeters/2` meters apart from the `LatLng`.
        toBounds: function(t) {
          var e = 180 * t / 40075017, i = e / Math.cos(Math.PI / 180 * this.lat);
          return X(
            [this.lat - e, this.lng - i],
            [this.lat + e, this.lng + i]
          );
        },
        clone: function() {
          return new W(this.lat, this.lng, this.alt);
        }
      };
      function N(t, e, i) {
        return t instanceof W ? t : I(t) && typeof t[0] != "object" ? t.length === 3 ? new W(t[0], t[1], t[2]) : t.length === 2 ? new W(t[0], t[1]) : null : t == null ? t : typeof t == "object" && "lat" in t ? new W(t.lat, "lng" in t ? t.lng : t.lon, t.alt) : e === void 0 ? null : new W(t, e, i);
      }
      var Mt = {
        // @method latLngToPoint(latlng: LatLng, zoom: Number): Point
        // Projects geographical coordinates into pixel coordinates for a given zoom.
        latLngToPoint: function(t, e) {
          var i = this.projection.project(t), n = this.scale(e);
          return this.transformation._transform(i, n);
        },
        // @method pointToLatLng(point: Point, zoom: Number): LatLng
        // The inverse of `latLngToPoint`. Projects pixel coordinates on a given
        // zoom into geographical coordinates.
        pointToLatLng: function(t, e) {
          var i = this.scale(e), n = this.transformation.untransform(t, i);
          return this.projection.unproject(n);
        },
        // @method project(latlng: LatLng): Point
        // Projects geographical coordinates into coordinates in units accepted for
        // this CRS (e.g. meters for EPSG:3857, for passing it to WMS services).
        project: function(t) {
          return this.projection.project(t);
        },
        // @method unproject(point: Point): LatLng
        // Given a projected coordinate returns the corresponding LatLng.
        // The inverse of `project`.
        unproject: function(t) {
          return this.projection.unproject(t);
        },
        // @method scale(zoom: Number): Number
        // Returns the scale used when transforming projected coordinates into
        // pixel coordinates for a particular zoom. For example, it returns
        // `256 * 2^zoom` for Mercator-based CRS.
        scale: function(t) {
          return 256 * Math.pow(2, t);
        },
        // @method zoom(scale: Number): Number
        // Inverse of `scale()`, returns the zoom level corresponding to a scale
        // factor of `scale`.
        zoom: function(t) {
          return Math.log(t / 256) / Math.LN2;
        },
        // @method getProjectedBounds(zoom: Number): Bounds
        // Returns the projection's bounds scaled and transformed for the provided `zoom`.
        getProjectedBounds: function(t) {
          if (this.infinite)
            return null;
          var e = this.projection.bounds, i = this.scale(t), n = this.transformation.transform(e.min, i), r = this.transformation.transform(e.max, i);
          return new V(n, r);
        },
        // @method distance(latlng1: LatLng, latlng2: LatLng): Number
        // Returns the distance between two geographical coordinates.
        // @property code: String
        // Standard code name of the CRS passed into WMS services (e.g. `'EPSG:3857'`)
        //
        // @property wrapLng: Number[]
        // An array of two numbers defining whether the longitude (horizontal) coordinate
        // axis wraps around a given range and how. Defaults to `[-180, 180]` in most
        // geographical CRSs. If `undefined`, the longitude axis does not wrap around.
        //
        // @property wrapLat: Number[]
        // Like `wrapLng`, but for the latitude (vertical) axis.
        // wrapLng: [min, max],
        // wrapLat: [min, max],
        // @property infinite: Boolean
        // If true, the coordinate space will be unbounded (infinite in both axes)
        infinite: !1,
        // @method wrapLatLng(latlng: LatLng): LatLng
        // Returns a `LatLng` where lat and lng has been wrapped according to the
        // CRS's `wrapLat` and `wrapLng` properties, if they are outside the CRS's bounds.
        wrapLatLng: function(t) {
          var e = this.wrapLng ? M(t.lng, this.wrapLng, !0) : t.lng, i = this.wrapLat ? M(t.lat, this.wrapLat, !0) : t.lat, n = t.alt;
          return new W(i, e, n);
        },
        // @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
        // Returns a `LatLngBounds` with the same size as the given one, ensuring
        // that its center is within the CRS's bounds.
        // Only accepts actual `L.LatLngBounds` instances, not arrays.
        wrapLatLngBounds: function(t) {
          var e = t.getCenter(), i = this.wrapLatLng(e), n = e.lat - i.lat, r = e.lng - i.lng;
          if (n === 0 && r === 0)
            return t;
          var h = t.getSouthWest(), _ = t.getNorthEast(), P = new W(h.lat - n, h.lng - r), x = new W(_.lat - n, _.lng - r);
          return new ut(P, x);
        }
      }, kt = y({}, Mt, {
        wrapLng: [-180, 180],
        // Mean Earth Radius, as recommended for use by
        // the International Union of Geodesy and Geophysics,
        // see https://rosettacode.org/wiki/Haversine_formula
        R: 6371e3,
        // distance between two geographical points using spherical law of cosines approximation
        distance: function(t, e) {
          var i = Math.PI / 180, n = t.lat * i, r = e.lat * i, h = Math.sin((e.lat - t.lat) * i / 2), _ = Math.sin((e.lng - t.lng) * i / 2), P = h * h + Math.cos(n) * Math.cos(r) * _ * _, x = 2 * Math.atan2(Math.sqrt(P), Math.sqrt(1 - P));
          return this.R * x;
        }
      }), pi = 6378137, Ee = {
        R: pi,
        MAX_LATITUDE: 85.0511287798,
        project: function(t) {
          var e = Math.PI / 180, i = this.MAX_LATITUDE, n = Math.max(Math.min(i, t.lat), -i), r = Math.sin(n * e);
          return new B(
            this.R * t.lng * e,
            this.R * Math.log((1 + r) / (1 - r)) / 2
          );
        },
        unproject: function(t) {
          var e = 180 / Math.PI;
          return new W(
            (2 * Math.atan(Math.exp(t.y / this.R)) - Math.PI / 2) * e,
            t.x * e / this.R
          );
        },
        bounds: function() {
          var t = pi * Math.PI;
          return new V([-t, -t], [t, t]);
        }()
      };
      function Be(t, e, i, n) {
        if (I(t)) {
          this._a = t[0], this._b = t[1], this._c = t[2], this._d = t[3];
          return;
        }
        this._a = t, this._b = e, this._c = i, this._d = n;
      }
      Be.prototype = {
        // @method transform(point: Point, scale?: Number): Point
        // Returns a transformed point, optionally multiplied by the given scale.
        // Only accepts actual `L.Point` instances, not arrays.
        transform: function(t, e) {
          return this._transform(t.clone(), e);
        },
        // destructive transform (faster)
        _transform: function(t, e) {
          return e = e || 1, t.x = e * (this._a * t.x + this._b), t.y = e * (this._c * t.y + this._d), t;
        },
        // @method untransform(point: Point, scale?: Number): Point
        // Returns the reverse transformation of the given point, optionally divided
        // by the given scale. Only accepts actual `L.Point` instances, not arrays.
        untransform: function(t, e) {
          return e = e || 1, new B(
            (t.x / e - this._b) / this._a,
            (t.y / e - this._d) / this._c
          );
        }
      };
      function Yt(t, e, i, n) {
        return new Be(t, e, i, n);
      }
      var Ze = y({}, kt, {
        code: "EPSG:3857",
        projection: Ee,
        transformation: function() {
          var t = 0.5 / (Math.PI * Ee.R);
          return Yt(t, 0.5, -t, 0.5);
        }()
      }), Un = y({}, Ze, {
        code: "EPSG:900913"
      });
      function gi(t) {
        return document.createElementNS("http://www.w3.org/2000/svg", t);
      }
      function vi(t, e) {
        var i = "", n, r, h, _, P, x;
        for (n = 0, h = t.length; n < h; n++) {
          for (P = t[n], r = 0, _ = P.length; r < _; r++)
            x = P[r], i += (r ? "L" : "M") + x.x + " " + x.y;
          i += e ? A.svg ? "z" : "x" : "";
        }
        return i || "M0 0";
      }
      var De = document.documentElement.style, le = "ActiveXObject" in window, Hn = le && !document.addEventListener, yi = "msLaunchUri" in navigator && !("documentMode" in document), Re = vt("webkit"), Li = vt("android"), wi = vt("android 2") || vt("android 3"), Fn = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1], 10), Wn = Li && vt("Google") && Fn < 537 && !("AudioNode" in window), Ne = !!window.opera, Pi = !yi && vt("chrome"), xi = vt("gecko") && !Re && !Ne && !le, qn = !Pi && vt("safari"), Mi = vt("phantom"), bi = "OTransition" in De, jn = navigator.platform.indexOf("Win") === 0, Ci = le && "transition" in De, Ge = "WebKitCSSMatrix" in window && "m11" in new window.WebKitCSSMatrix() && !wi, Ti = "MozPerspective" in De, Vn = !window.L_DISABLE_3D && (Ci || Ge || Ti) && !bi && !Mi, Xt = typeof orientation < "u" || vt("mobile"), Jn = Xt && Re, Kn = Xt && Ge, Si = !window.PointerEvent && window.MSPointerEvent, ki = !!(window.PointerEvent || Si), Ii = "ontouchstart" in window || !!window.TouchEvent, Yn = !window.L_NO_TOUCH && (Ii || ki), Xn = Xt && Ne, $n = Xt && xi, Qn = (window.devicePixelRatio || window.screen.deviceXDPI / window.screen.logicalXDPI) > 1, to = function() {
        var t = !1;
        try {
          var e = Object.defineProperty({}, "passive", {
            get: function() {
              t = !0;
            }
          });
          window.addEventListener("testPassiveEventSupport", m, e), window.removeEventListener("testPassiveEventSupport", m, e);
        } catch {
        }
        return t;
      }(), eo = function() {
        return !!document.createElement("canvas").getContext;
      }(), Ue = !!(document.createElementNS && gi("svg").createSVGRect), io = !!Ue && function() {
        var t = document.createElement("div");
        return t.innerHTML = "<svg/>", (t.firstChild && t.firstChild.namespaceURI) === "http://www.w3.org/2000/svg";
      }(), no = !Ue && function() {
        try {
          var t = document.createElement("div");
          t.innerHTML = '<v:shape adj="1"/>';
          var e = t.firstChild;
          return e.style.behavior = "url(#default#VML)", e && typeof e.adj == "object";
        } catch {
          return !1;
        }
      }(), oo = navigator.platform.indexOf("Mac") === 0, so = navigator.platform.indexOf("Linux") === 0;
      function vt(t) {
        return navigator.userAgent.toLowerCase().indexOf(t) >= 0;
      }
      var A = {
        ie: le,
        ielt9: Hn,
        edge: yi,
        webkit: Re,
        android: Li,
        android23: wi,
        androidStock: Wn,
        opera: Ne,
        chrome: Pi,
        gecko: xi,
        safari: qn,
        phantom: Mi,
        opera12: bi,
        win: jn,
        ie3d: Ci,
        webkit3d: Ge,
        gecko3d: Ti,
        any3d: Vn,
        mobile: Xt,
        mobileWebkit: Jn,
        mobileWebkit3d: Kn,
        msPointer: Si,
        pointer: ki,
        touch: Yn,
        touchNative: Ii,
        mobileOpera: Xn,
        mobileGecko: $n,
        retina: Qn,
        passiveEvents: to,
        canvas: eo,
        svg: Ue,
        vml: no,
        inlineSvg: io,
        mac: oo,
        linux: so
      }, zi = A.msPointer ? "MSPointerDown" : "pointerdown", Ai = A.msPointer ? "MSPointerMove" : "pointermove", Oi = A.msPointer ? "MSPointerUp" : "pointerup", Ei = A.msPointer ? "MSPointerCancel" : "pointercancel", He = {
        touchstart: zi,
        touchmove: Ai,
        touchend: Oi,
        touchcancel: Ei
      }, Bi = {
        touchstart: co,
        touchmove: ce,
        touchend: ce,
        touchcancel: ce
      }, Gt = {}, Zi = !1;
      function ro(t, e, i) {
        return e === "touchstart" && lo(), Bi[e] ? (i = Bi[e].bind(this, i), t.addEventListener(He[e], i, !1), i) : (void 0, m);
      }
      function ao(t, e, i) {
        if (!He[e]) {
          return;
        }
        t.removeEventListener(He[e], i, !1);
      }
      function ho(t) {
        Gt[t.pointerId] = t;
      }
      function uo(t) {
        Gt[t.pointerId] && (Gt[t.pointerId] = t);
      }
      function Di(t) {
        delete Gt[t.pointerId];
      }
      function lo() {
        Zi || (document.addEventListener(zi, ho, !0), document.addEventListener(Ai, uo, !0), document.addEventListener(Oi, Di, !0), document.addEventListener(Ei, Di, !0), Zi = !0);
      }
      function ce(t, e) {
        if (e.pointerType !== (e.MSPOINTER_TYPE_MOUSE || "mouse")) {
          e.touches = [];
          for (var i in Gt)
            e.touches.push(Gt[i]);
          e.changedTouches = [e], t(e);
        }
      }
      function co(t, e) {
        e.MSPOINTER_TYPE_TOUCH && e.pointerType === e.MSPOINTER_TYPE_TOUCH && et(e), ce(t, e);
      }
      function fo(t) {
        var e = {}, i, n;
        for (n in t)
          i = t[n], e[n] = i && i.bind ? i.bind(t) : i;
        return t = e, e.type = "dblclick", e.detail = 2, e.isTrusted = !1, e._simulated = !0, e;
      }
      var _o = 200;
      function mo(t, e) {
        t.addEventListener("dblclick", e);
        var i = 0, n;
        function r(h) {
          if (h.detail !== 1) {
            n = h.detail;
            return;
          }
          if (!(h.pointerType === "mouse" || h.sourceCapabilities && !h.sourceCapabilities.firesTouchEvents)) {
            var _ = Hi(h);
            if (!(_.some(function(x) {
              return x instanceof HTMLLabelElement && x.attributes.for;
            }) && !_.some(function(x) {
              return x instanceof HTMLInputElement || x instanceof HTMLSelectElement;
            }))) {
              var P = Date.now();
              P - i <= _o ? (n++, n === 2 && e(fo(h))) : n = 1, i = P;
            }
          }
        }
        return t.addEventListener("click", r), {
          dblclick: e,
          simDblclick: r
        };
      }
      function po(t, e) {
        t.removeEventListener("dblclick", e.dblclick), t.removeEventListener("click", e.simDblclick);
      }
      var Fe = _e(
        ["transform", "webkitTransform", "OTransform", "MozTransform", "msTransform"]
      ), $t = _e(
        ["webkitTransition", "transition", "OTransition", "MozTransition", "msTransition"]
      ), Ri = $t === "webkitTransition" || $t === "OTransition" ? $t + "End" : "transitionend";
      function Ni(t) {
        return typeof t == "string" ? document.getElementById(t) : t;
      }
      function Qt(t, e) {
        var i = t.style[e] || t.currentStyle && t.currentStyle[e];
        if ((!i || i === "auto") && document.defaultView) {
          var n = document.defaultView.getComputedStyle(t, null);
          i = n ? n[e] : null;
        }
        return i === "auto" ? null : i;
      }
      function F(t, e, i) {
        var n = document.createElement(t);
        return n.className = e || "", i && i.appendChild(n), n;
      }
      function J(t) {
        var e = t.parentNode;
        e && e.removeChild(t);
      }
      function de(t) {
        for (; t.firstChild; )
          t.removeChild(t.firstChild);
      }
      function Ut(t) {
        var e = t.parentNode;
        e && e.lastChild !== t && e.appendChild(t);
      }
      function Ht(t) {
        var e = t.parentNode;
        e && e.firstChild !== t && e.insertBefore(t, e.firstChild);
      }
      function We(t, e) {
        if (t.classList !== void 0)
          return t.classList.contains(e);
        var i = fe(t);
        return i.length > 0 && new RegExp("(^|\\s)" + e + "(\\s|$)").test(i);
      }
      function D(t, e) {
        if (t.classList !== void 0)
          for (var i = f(e), n = 0, r = i.length; n < r; n++)
            t.classList.add(i[n]);
        else if (!We(t, e)) {
          var h = fe(t);
          qe(t, (h ? h + " " : "") + e);
        }
      }
      function Y(t, e) {
        t.classList !== void 0 ? t.classList.remove(e) : qe(t, g((" " + fe(t) + " ").replace(" " + e + " ", " ")));
      }
      function qe(t, e) {
        t.className.baseVal === void 0 ? t.className = e : t.className.baseVal = e;
      }
      function fe(t) {
        return t.correspondingElement && (t = t.correspondingElement), t.className.baseVal === void 0 ? t.className : t.className.baseVal;
      }
      function ft(t, e) {
        "opacity" in t.style ? t.style.opacity = e : "filter" in t.style && go(t, e);
      }
      function go(t, e) {
        var i = !1, n = "DXImageTransform.Microsoft.Alpha";
        try {
          i = t.filters.item(n);
        } catch {
          if (e === 1)
            return;
        }
        e = Math.round(e * 100), i ? (i.Enabled = e !== 100, i.Opacity = e) : t.style.filter += " progid:" + n + "(opacity=" + e + ")";
      }
      function _e(t) {
        for (var e = document.documentElement.style, i = 0; i < t.length; i++)
          if (t[i] in e)
            return t[i];
        return !1;
      }
      function Et(t, e, i) {
        var n = e || new B(0, 0);
        t.style[Fe] = (A.ie3d ? "translate(" + n.x + "px," + n.y + "px)" : "translate3d(" + n.x + "px," + n.y + "px,0)") + (i ? " scale(" + i + ")" : "");
      }
      function $(t, e) {
        t._leaflet_pos = e, A.any3d ? Et(t, e) : (t.style.left = e.x + "px", t.style.top = e.y + "px");
      }
      function Bt(t) {
        return t._leaflet_pos || new B(0, 0);
      }
      var te, ee, je;
      if ("onselectstart" in document)
        te = function() {
          Z(window, "selectstart", et);
        }, ee = function() {
          q(window, "selectstart", et);
        };
      else {
        var ie = _e(
          ["userSelect", "WebkitUserSelect", "OUserSelect", "MozUserSelect", "msUserSelect"]
        );
        te = function() {
          if (ie) {
            var t = document.documentElement.style;
            je = t[ie], t[ie] = "none";
          }
        }, ee = function() {
          ie && (document.documentElement.style[ie] = je, je = void 0);
        };
      }
      function Ve() {
        Z(window, "dragstart", et);
      }
      function Je() {
        q(window, "dragstart", et);
      }
      var me, Ke;
      function Ye(t) {
        for (; t.tabIndex === -1; )
          t = t.parentNode;
        t.style && (pe(), me = t, Ke = t.style.outlineStyle, t.style.outlineStyle = "none", Z(window, "keydown", pe));
      }
      function pe() {
        me && (me.style.outlineStyle = Ke, me = void 0, Ke = void 0, q(window, "keydown", pe));
      }
      function Gi(t) {
        do
          t = t.parentNode;
        while ((!t.offsetWidth || !t.offsetHeight) && t !== document.body);
        return t;
      }
      function Xe(t) {
        var e = t.getBoundingClientRect();
        return {
          x: e.width / t.offsetWidth || 1,
          y: e.height / t.offsetHeight || 1,
          boundingClientRect: e
        };
      }
      var vo = {
        __proto__: null,
        TRANSFORM: Fe,
        TRANSITION: $t,
        TRANSITION_END: Ri,
        get: Ni,
        getStyle: Qt,
        create: F,
        remove: J,
        empty: de,
        toFront: Ut,
        toBack: Ht,
        hasClass: We,
        addClass: D,
        removeClass: Y,
        setClass: qe,
        getClass: fe,
        setOpacity: ft,
        testProp: _e,
        setTransform: Et,
        setPosition: $,
        getPosition: Bt,
        get disableTextSelection() {
          return te;
        },
        get enableTextSelection() {
          return ee;
        },
        disableImageDrag: Ve,
        enableImageDrag: Je,
        preventOutline: Ye,
        restoreOutline: pe,
        getSizedParentNode: Gi,
        getScale: Xe
      };
      function Z(t, e, i, n) {
        if (e && typeof e == "object")
          for (var r in e)
            Qe(t, r, e[r], i);
        else {
          e = f(e);
          for (var h = 0, _ = e.length; h < _; h++)
            Qe(t, e[h], i, n);
        }
        return this;
      }
      var yt = "_leaflet_events";
      function q(t, e, i, n) {
        if (arguments.length === 1)
          Ui(t), delete t[yt];
        else if (e && typeof e == "object")
          for (var r in e)
            ti(t, r, e[r], i);
        else if (e = f(e), arguments.length === 2)
          Ui(t, function(P) {
            return U(e, P) !== -1;
          });
        else
          for (var h = 0, _ = e.length; h < _; h++)
            ti(t, e[h], i, n);
        return this;
      }
      function Ui(t, e) {
        for (var i in t[yt]) {
          var n = i.split(/\d/)[0];
          (!e || e(n)) && ti(t, n, null, null, i);
        }
      }
      var $e = {
        mouseenter: "mouseover",
        mouseleave: "mouseout",
        wheel: !("onwheel" in window) && "mousewheel"
      };
      function Qe(t, e, i, n) {
        var r = e + d(i) + (n ? "_" + d(n) : "");
        if (t[yt] && t[yt][r])
          return this;
        var h = function(P) {
          return i.call(n || t, P || window.event);
        }, _ = h;
        !A.touchNative && A.pointer && e.indexOf("touch") === 0 ? h = ro(t, e, h) : A.touch && e === "dblclick" ? h = mo(t, h) : "addEventListener" in t ? e === "touchstart" || e === "touchmove" || e === "wheel" || e === "mousewheel" ? t.addEventListener($e[e] || e, h, A.passiveEvents ? { passive: !1 } : !1) : e === "mouseenter" || e === "mouseleave" ? (h = function(P) {
          P = P || window.event, ii(t, P) && _(P);
        }, t.addEventListener($e[e], h, !1)) : t.addEventListener(e, _, !1) : t.attachEvent("on" + e, h), t[yt] = t[yt] || {}, t[yt][r] = h;
      }
      function ti(t, e, i, n, r) {
        r = r || e + d(i) + (n ? "_" + d(n) : "");
        var h = t[yt] && t[yt][r];
        if (!h)
          return this;
        !A.touchNative && A.pointer && e.indexOf("touch") === 0 ? ao(t, e, h) : A.touch && e === "dblclick" ? po(t, h) : "removeEventListener" in t ? t.removeEventListener($e[e] || e, h, !1) : t.detachEvent("on" + e, h), t[yt][r] = null;
      }
      function Zt(t) {
        return t.stopPropagation ? t.stopPropagation() : t.originalEvent ? t.originalEvent._stopped = !0 : t.cancelBubble = !0, this;
      }
      function ei(t) {
        return Qe(t, "wheel", Zt), this;
      }
      function ne(t) {
        return Z(t, "mousedown touchstart dblclick contextmenu", Zt), t._leaflet_disable_click = !0, this;
      }
      function et(t) {
        return t.preventDefault ? t.preventDefault() : t.returnValue = !1, this;
      }
      function Dt(t) {
        return et(t), Zt(t), this;
      }
      function Hi(t) {
        if (t.composedPath)
          return t.composedPath();
        for (var e = [], i = t.target; i; )
          e.push(i), i = i.parentNode;
        return e;
      }
      function Fi(t, e) {
        if (!e)
          return new B(t.clientX, t.clientY);
        var i = Xe(e), n = i.boundingClientRect;
        return new B(
          // offset.left/top values are in page scale (like clientX/Y),
          // whereas clientLeft/Top (border width) values are the original values (before CSS scale applies).
          (t.clientX - n.left) / i.x - e.clientLeft,
          (t.clientY - n.top) / i.y - e.clientTop
        );
      }
      var yo = A.linux && A.chrome ? window.devicePixelRatio : A.mac ? window.devicePixelRatio * 3 : window.devicePixelRatio > 0 ? 2 * window.devicePixelRatio : 1;
      function Wi(t) {
        return A.edge ? t.wheelDeltaY / 2 : (
          // Don't trust window-geometry-based delta
          t.deltaY && t.deltaMode === 0 ? -t.deltaY / yo : (
            // Pixels
            t.deltaY && t.deltaMode === 1 ? -t.deltaY * 20 : (
              // Lines
              t.deltaY && t.deltaMode === 2 ? -t.deltaY * 60 : (
                // Pages
                t.deltaX || t.deltaZ ? 0 : (
                  // Skip horizontal/depth wheel events
                  t.wheelDelta ? (t.wheelDeltaY || t.wheelDelta) / 2 : (
                    // Legacy IE pixels
                    t.detail && Math.abs(t.detail) < 32765 ? -t.detail * 20 : (
                      // Legacy Moz lines
                      t.detail ? t.detail / -32765 * 60 : (
                        // Legacy Moz pages
                        0
                      )
                    )
                  )
                )
              )
            )
          )
        );
      }
      function ii(t, e) {
        var i = e.relatedTarget;
        if (!i)
          return !0;
        try {
          for (; i && i !== t; )
            i = i.parentNode;
        } catch {
          return !1;
        }
        return i !== t;
      }
      var Lo = {
        __proto__: null,
        on: Z,
        off: q,
        stopPropagation: Zt,
        disableScrollPropagation: ei,
        disableClickPropagation: ne,
        preventDefault: et,
        stop: Dt,
        getPropagationPath: Hi,
        getMousePosition: Fi,
        getWheelDelta: Wi,
        isExternalTarget: ii,
        addListener: Z,
        removeListener: q
      }, qi = Kt.extend({
        // @method run(el: HTMLElement, newPos: Point, duration?: Number, easeLinearity?: Number)
        // Run an animation of a given element to a new position, optionally setting
        // duration in seconds (`0.25` by default) and easing linearity factor (3rd
        // argument of the [cubic bezier curve](https://cubic-bezier.com/#0,0,.5,1),
        // `0.5` by default).
        run: function(t, e, i, n) {
          this.stop(), this._el = t, this._inProgress = !0, this._duration = i || 0.25, this._easeOutPower = 1 / Math.max(n || 0.5, 0.2), this._startPos = Bt(t), this._offset = e.subtract(this._startPos), this._startTime = +/* @__PURE__ */ new Date(), this.fire("start"), this._animate();
        },
        // @method stop()
        // Stops the animation (if currently running).
        stop: function() {
          this._inProgress && (this._step(!0), this._complete());
        },
        _animate: function() {
          this._animId = j(this._animate, this), this._step();
        },
        _step: function(t) {
          var e = +/* @__PURE__ */ new Date() - this._startTime, i = this._duration * 1e3;
          e < i ? this._runFrame(this._easeOut(e / i), t) : (this._runFrame(1), this._complete());
        },
        _runFrame: function(t, e) {
          var i = this._startPos.add(this._offset.multiplyBy(t));
          e && i._round(), $(this._el, i), this.fire("step");
        },
        _complete: function() {
          rt(this._animId), this._inProgress = !1, this.fire("end");
        },
        _easeOut: function(t) {
          return 1 - Math.pow(1 - t, this._easeOutPower);
        }
      }), G = Kt.extend({
        options: {
          // @section Map State Options
          // @option crs: CRS = L.CRS.EPSG3857
          // The [Coordinate Reference System](#crs) to use. Don't change this if you're not
          // sure what it means.
          crs: Ze,
          // @option center: LatLng = undefined
          // Initial geographic center of the map
          center: void 0,
          // @option zoom: Number = undefined
          // Initial map zoom level
          zoom: void 0,
          // @option minZoom: Number = *
          // Minimum zoom level of the map.
          // If not specified and at least one `GridLayer` or `TileLayer` is in the map,
          // the lowest of their `minZoom` options will be used instead.
          minZoom: void 0,
          // @option maxZoom: Number = *
          // Maximum zoom level of the map.
          // If not specified and at least one `GridLayer` or `TileLayer` is in the map,
          // the highest of their `maxZoom` options will be used instead.
          maxZoom: void 0,
          // @option layers: Layer[] = []
          // Array of layers that will be added to the map initially
          layers: [],
          // @option maxBounds: LatLngBounds = null
          // When this option is set, the map restricts the view to the given
          // geographical bounds, bouncing the user back if the user tries to pan
          // outside the view. To set the restriction dynamically, use
          // [`setMaxBounds`](#map-setmaxbounds) method.
          maxBounds: void 0,
          // @option renderer: Renderer = *
          // The default method for drawing vector layers on the map. `L.SVG`
          // or `L.Canvas` by default depending on browser support.
          renderer: void 0,
          // @section Animation Options
          // @option zoomAnimation: Boolean = true
          // Whether the map zoom animation is enabled. By default it's enabled
          // in all browsers that support CSS3 Transitions except Android.
          zoomAnimation: !0,
          // @option zoomAnimationThreshold: Number = 4
          // Won't animate zoom if the zoom difference exceeds this value.
          zoomAnimationThreshold: 4,
          // @option fadeAnimation: Boolean = true
          // Whether the tile fade animation is enabled. By default it's enabled
          // in all browsers that support CSS3 Transitions except Android.
          fadeAnimation: !0,
          // @option markerZoomAnimation: Boolean = true
          // Whether markers animate their zoom with the zoom animation, if disabled
          // they will disappear for the length of the animation. By default it's
          // enabled in all browsers that support CSS3 Transitions except Android.
          markerZoomAnimation: !0,
          // @option transform3DLimit: Number = 2^23
          // Defines the maximum size of a CSS translation transform. The default
          // value should not be changed unless a web browser positions layers in
          // the wrong place after doing a large `panBy`.
          transform3DLimit: 8388608,
          // Precision limit of a 32-bit float
          // @section Interaction Options
          // @option zoomSnap: Number = 1
          // Forces the map's zoom level to always be a multiple of this, particularly
          // right after a [`fitBounds()`](#map-fitbounds) or a pinch-zoom.
          // By default, the zoom level snaps to the nearest integer; lower values
          // (e.g. `0.5` or `0.1`) allow for greater granularity. A value of `0`
          // means the zoom level will not be snapped after `fitBounds` or a pinch-zoom.
          zoomSnap: 1,
          // @option zoomDelta: Number = 1
          // Controls how much the map's zoom level will change after a
          // [`zoomIn()`](#map-zoomin), [`zoomOut()`](#map-zoomout), pressing `+`
          // or `-` on the keyboard, or using the [zoom controls](#control-zoom).
          // Values smaller than `1` (e.g. `0.5`) allow for greater granularity.
          zoomDelta: 1,
          // @option trackResize: Boolean = true
          // Whether the map automatically handles browser window resize to update itself.
          trackResize: !0
        },
        initialize: function(t, e) {
          e = v(this, e), this._handlers = [], this._layers = {}, this._zoomBoundLayers = {}, this._sizeChanged = !0, this._initContainer(t), this._initLayout(), this._onResize = a(this._onResize, this), this._initEvents(), e.maxBounds && this.setMaxBounds(e.maxBounds), e.zoom !== void 0 && (this._zoom = this._limitZoom(e.zoom)), e.center && e.zoom !== void 0 && this.setView(N(e.center), e.zoom, { reset: !0 }), this.callInitHooks(), this._zoomAnimated = $t && A.any3d && !A.mobileOpera && this.options.zoomAnimation, this._zoomAnimated && (this._createAnimProxy(), Z(this._proxy, Ri, this._catchTransitionEnd, this)), this._addLayers(this.options.layers);
        },
        // @section Methods for modifying map state
        // @method setView(center: LatLng, zoom: Number, options?: Zoom/pan options): this
        // Sets the view of the map (geographical center and zoom) with the given
        // animation options.
        setView: function(t, e, i) {
          if (e = e === void 0 ? this._zoom : this._limitZoom(e), t = this._limitCenter(N(t), e, this.options.maxBounds), i = i || {}, this._stop(), this._loaded && !i.reset && i !== !0) {
            i.animate !== void 0 && (i.zoom = y({ animate: i.animate }, i.zoom), i.pan = y({ animate: i.animate, duration: i.duration }, i.pan));
            var n = this._zoom !== e ? this._tryAnimatedZoom && this._tryAnimatedZoom(t, e, i.zoom) : this._tryAnimatedPan(t, i.pan);
            if (n)
              return clearTimeout(this._sizeTimer), this;
          }
          return this._resetView(t, e, i.pan && i.pan.noMoveStart), this;
        },
        // @method setZoom(zoom: Number, options?: Zoom/pan options): this
        // Sets the zoom of the map.
        setZoom: function(t, e) {
          return this._loaded ? this.setView(this.getCenter(), t, { zoom: e }) : (this._zoom = t, this);
        },
        // @method zoomIn(delta?: Number, options?: Zoom options): this
        // Increases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
        zoomIn: function(t, e) {
          return t = t || (A.any3d ? this.options.zoomDelta : 1), this.setZoom(this._zoom + t, e);
        },
        // @method zoomOut(delta?: Number, options?: Zoom options): this
        // Decreases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
        zoomOut: function(t, e) {
          return t = t || (A.any3d ? this.options.zoomDelta : 1), this.setZoom(this._zoom - t, e);
        },
        // @method setZoomAround(latlng: LatLng, zoom: Number, options: Zoom options): this
        // Zooms the map while keeping a specified geographical point on the map
        // stationary (e.g. used internally for scroll zoom and double-click zoom).
        // @alternative
        // @method setZoomAround(offset: Point, zoom: Number, options: Zoom options): this
        // Zooms the map while keeping a specified pixel on the map (relative to the top-left corner) stationary.
        setZoomAround: function(t, e, i) {
          var n = this.getZoomScale(e), r = this.getSize().divideBy(2), h = t instanceof B ? t : this.latLngToContainerPoint(t), _ = h.subtract(r).multiplyBy(1 - 1 / n), P = this.containerPointToLatLng(r.add(_));
          return this.setView(P, e, { zoom: i });
        },
        _getBoundsCenterZoom: function(t, e) {
          e = e || {}, t = t.getBounds ? t.getBounds() : X(t);
          var i = E(e.paddingTopLeft || e.padding || [0, 0]), n = E(e.paddingBottomRight || e.padding || [0, 0]), r = this.getBoundsZoom(t, !1, i.add(n));
          if (r = typeof e.maxZoom == "number" ? Math.min(e.maxZoom, r) : r, r === 1 / 0)
            return {
              center: t.getCenter(),
              zoom: r
            };
          var h = n.subtract(i).divideBy(2), _ = this.project(t.getSouthWest(), r), P = this.project(t.getNorthEast(), r), x = this.unproject(_.add(P).divideBy(2).add(h), r);
          return {
            center: x,
            zoom: r
          };
        },
        // @method fitBounds(bounds: LatLngBounds, options?: fitBounds options): this
        // Sets a map view that contains the given geographical bounds with the
        // maximum zoom level possible.
        fitBounds: function(t, e) {
          if (t = X(t), !t.isValid())
            throw new Error("Bounds are not valid.");
          var i = this._getBoundsCenterZoom(t, e);
          return this.setView(i.center, i.zoom, e);
        },
        // @method fitWorld(options?: fitBounds options): this
        // Sets a map view that mostly contains the whole world with the maximum
        // zoom level possible.
        fitWorld: function(t) {
          return this.fitBounds([[-90, -180], [90, 180]], t);
        },
        // @method panTo(latlng: LatLng, options?: Pan options): this
        // Pans the map to a given center.
        panTo: function(t, e) {
          return this.setView(t, this._zoom, { pan: e });
        },
        // @method panBy(offset: Point, options?: Pan options): this
        // Pans the map by a given number of pixels (animated).
        panBy: function(t, e) {
          if (t = E(t).round(), e = e || {}, !t.x && !t.y)
            return this.fire("moveend");
          if (e.animate !== !0 && !this.getSize().contains(t))
            return this._resetView(this.unproject(this.project(this.getCenter()).add(t)), this.getZoom()), this;
          if (this._panAnim || (this._panAnim = new qi(), this._panAnim.on({
            step: this._onPanTransitionStep,
            end: this._onPanTransitionEnd
          }, this)), e.noMoveStart || this.fire("movestart"), e.animate !== !1) {
            D(this._mapPane, "leaflet-pan-anim");
            var i = this._getMapPanePos().subtract(t).round();
            this._panAnim.run(this._mapPane, i, e.duration || 0.25, e.easeLinearity);
          } else
            this._rawPanBy(t), this.fire("move").fire("moveend");
          return this;
        },
        // @method flyTo(latlng: LatLng, zoom?: Number, options?: Zoom/pan options): this
        // Sets the view of the map (geographical center and zoom) performing a smooth
        // pan-zoom animation.
        flyTo: function(t, e, i) {
          if (i = i || {}, i.animate === !1 || !A.any3d)
            return this.setView(t, e, i);
          this._stop();
          var n = this.project(this.getCenter()), r = this.project(t), h = this.getSize(), _ = this._zoom;
          t = N(t), e = e === void 0 ? _ : e;
          var P = Math.max(h.x, h.y), x = P * this.getZoomScale(_, e), S = r.distanceTo(n) || 1, z = 1.42, O = z * z;
          function R(Q) {
            var Se = Q ? -1 : 1, hs = Q ? x : P, us = x * x - P * P + Se * O * O * S * S, ls = 2 * hs * O * S, fi = us / ls, Cn = Math.sqrt(fi * fi + 1) - fi, cs = Cn < 1e-9 ? -18 : Math.log(Cn);
            return cs;
          }
          function at(Q) {
            return (Math.exp(Q) - Math.exp(-Q)) / 2;
          }
          function tt(Q) {
            return (Math.exp(Q) + Math.exp(-Q)) / 2;
          }
          function mt(Q) {
            return at(Q) / tt(Q);
          }
          var lt = R(0);
          function Jt(Q) {
            return P * (tt(lt) / tt(lt + z * Q));
          }
          function os(Q) {
            return P * (tt(lt) * mt(lt + z * Q) - at(lt)) / O;
          }
          function ss(Q) {
            return 1 - Math.pow(1 - Q, 1.5);
          }
          var rs = Date.now(), Mn = (R(1) - lt) / z, as = i.duration ? 1e3 * i.duration : 1e3 * Mn * 0.8;
          function bn() {
            var Q = (Date.now() - rs) / as, Se = ss(Q) * Mn;
            Q <= 1 ? (this._flyToFrame = j(bn, this), this._move(
              this.unproject(n.add(r.subtract(n).multiplyBy(os(Se) / S)), _),
              this.getScaleZoom(P / Jt(Se), _),
              { flyTo: !0 }
            )) : this._move(t, e)._moveEnd(!0);
          }
          return this._moveStart(!0, i.noMoveStart), bn.call(this), this;
        },
        // @method flyToBounds(bounds: LatLngBounds, options?: fitBounds options): this
        // Sets the view of the map with a smooth animation like [`flyTo`](#map-flyto),
        // but takes a bounds parameter like [`fitBounds`](#map-fitbounds).
        flyToBounds: function(t, e) {
          var i = this._getBoundsCenterZoom(t, e);
          return this.flyTo(i.center, i.zoom, e);
        },
        // @method setMaxBounds(bounds: LatLngBounds): this
        // Restricts the map view to the given bounds (see the [maxBounds](#map-maxbounds) option).
        setMaxBounds: function(t) {
          return t = X(t), this.listens("moveend", this._panInsideMaxBounds) && this.off("moveend", this._panInsideMaxBounds), t.isValid() ? (this.options.maxBounds = t, this._loaded && this._panInsideMaxBounds(), this.on("moveend", this._panInsideMaxBounds)) : (this.options.maxBounds = null, this);
        },
        // @method setMinZoom(zoom: Number): this
        // Sets the lower limit for the available zoom levels (see the [minZoom](#map-minzoom) option).
        setMinZoom: function(t) {
          var e = this.options.minZoom;
          return this.options.minZoom = t, this._loaded && e !== t && (this.fire("zoomlevelschange"), this.getZoom() < this.options.minZoom) ? this.setZoom(t) : this;
        },
        // @method setMaxZoom(zoom: Number): this
        // Sets the upper limit for the available zoom levels (see the [maxZoom](#map-maxzoom) option).
        setMaxZoom: function(t) {
          var e = this.options.maxZoom;
          return this.options.maxZoom = t, this._loaded && e !== t && (this.fire("zoomlevelschange"), this.getZoom() > this.options.maxZoom) ? this.setZoom(t) : this;
        },
        // @method panInsideBounds(bounds: LatLngBounds, options?: Pan options): this
        // Pans the map to the closest view that would lie inside the given bounds (if it's not already), controlling the animation using the options specific, if any.
        panInsideBounds: function(t, e) {
          this._enforcingBounds = !0;
          var i = this.getCenter(), n = this._limitCenter(i, this._zoom, X(t));
          return i.equals(n) || this.panTo(n, e), this._enforcingBounds = !1, this;
        },
        // @method panInside(latlng: LatLng, options?: padding options): this
        // Pans the map the minimum amount to make the `latlng` visible. Use
        // padding options to fit the display to more restricted bounds.
        // If `latlng` is already within the (optionally padded) display bounds,
        // the map will not be panned.
        panInside: function(t, e) {
          e = e || {};
          var i = E(e.paddingTopLeft || e.padding || [0, 0]), n = E(e.paddingBottomRight || e.padding || [0, 0]), r = this.project(this.getCenter()), h = this.project(t), _ = this.getPixelBounds(), P = ht([_.min.add(i), _.max.subtract(n)]), x = P.getSize();
          if (!P.contains(h)) {
            this._enforcingBounds = !0;
            var S = h.subtract(P.getCenter()), z = P.extend(h).getSize().subtract(x);
            r.x += S.x < 0 ? -z.x : z.x, r.y += S.y < 0 ? -z.y : z.y, this.panTo(this.unproject(r), e), this._enforcingBounds = !1;
          }
          return this;
        },
        // @method invalidateSize(options: Zoom/pan options): this
        // Checks if the map container size changed and updates the map if so —
        // call it after you've changed the map size dynamically, also animating
        // pan by default. If `options.pan` is `false`, panning will not occur.
        // If `options.debounceMoveend` is `true`, it will delay `moveend` event so
        // that it doesn't happen often even if the method is called many
        // times in a row.
        // @alternative
        // @method invalidateSize(animate: Boolean): this
        // Checks if the map container size changed and updates the map if so —
        // call it after you've changed the map size dynamically, also animating
        // pan by default.
        invalidateSize: function(t) {
          if (!this._loaded)
            return this;
          t = y({
            animate: !1,
            pan: !0
          }, t === !0 ? { animate: !0 } : t);
          var e = this.getSize();
          this._sizeChanged = !0, this._lastCenter = null;
          var i = this.getSize(), n = e.divideBy(2).round(), r = i.divideBy(2).round(), h = n.subtract(r);
          return !h.x && !h.y ? this : (t.animate && t.pan ? this.panBy(h) : (t.pan && this._rawPanBy(h), this.fire("move"), t.debounceMoveend ? (clearTimeout(this._sizeTimer), this._sizeTimer = setTimeout(a(this.fire, this, "moveend"), 200)) : this.fire("moveend")), this.fire("resize", {
            oldSize: e,
            newSize: i
          }));
        },
        // @section Methods for modifying map state
        // @method stop(): this
        // Stops the currently running `panTo` or `flyTo` animation, if any.
        stop: function() {
          return this.setZoom(this._limitZoom(this._zoom)), this.options.zoomSnap || this.fire("viewreset"), this._stop();
        },
        // @section Geolocation methods
        // @method locate(options?: Locate options): this
        // Tries to locate the user using the Geolocation API, firing a [`locationfound`](#map-locationfound)
        // event with location data on success or a [`locationerror`](#map-locationerror) event on failure,
        // and optionally sets the map view to the user's location with respect to
        // detection accuracy (or to the world view if geolocation failed).
        // Note that, if your page doesn't use HTTPS, this method will fail in
        // modern browsers ([Chrome 50 and newer](https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-powerful-features-on-insecure-origins))
        // See `Locate options` for more details.
        locate: function(t) {
          if (t = this._locateOptions = y({
            timeout: 1e4,
            watch: !1
            // setView: false
            // maxZoom: <Number>
            // maximumAge: 0
            // enableHighAccuracy: false
          }, t), !("geolocation" in navigator))
            return this._handleGeolocationError({
              code: 0,
              message: "Geolocation not supported."
            }), this;
          var e = a(this._handleGeolocationResponse, this), i = a(this._handleGeolocationError, this);
          return t.watch ? this._locationWatchId = navigator.geolocation.watchPosition(e, i, t) : navigator.geolocation.getCurrentPosition(e, i, t), this;
        },
        // @method stopLocate(): this
        // Stops watching location previously initiated by `map.locate({watch: true})`
        // and aborts resetting the map view if map.locate was called with
        // `{setView: true}`.
        stopLocate: function() {
          return navigator.geolocation && navigator.geolocation.clearWatch && navigator.geolocation.clearWatch(this._locationWatchId), this._locateOptions && (this._locateOptions.setView = !1), this;
        },
        _handleGeolocationError: function(t) {
          if (this._container._leaflet_id) {
            var e = t.code, i = t.message || (e === 1 ? "permission denied" : e === 2 ? "position unavailable" : "timeout");
            this._locateOptions.setView && !this._loaded && this.fitWorld(), this.fire("locationerror", {
              code: e,
              message: "Geolocation error: " + i + "."
            });
          }
        },
        _handleGeolocationResponse: function(t) {
          if (this._container._leaflet_id) {
            var e = t.coords.latitude, i = t.coords.longitude, n = new W(e, i), r = n.toBounds(t.coords.accuracy * 2), h = this._locateOptions;
            if (h.setView) {
              var _ = this.getBoundsZoom(r);
              this.setView(n, h.maxZoom ? Math.min(_, h.maxZoom) : _);
            }
            var P = {
              latlng: n,
              bounds: r,
              timestamp: t.timestamp
            };
            for (var x in t.coords)
              typeof t.coords[x] == "number" && (P[x] = t.coords[x]);
            this.fire("locationfound", P);
          }
        },
        // TODO Appropriate docs section?
        // @section Other Methods
        // @method addHandler(name: String, HandlerClass: Function): this
        // Adds a new `Handler` to the map, given its name and constructor function.
        addHandler: function(t, e) {
          if (!e)
            return this;
          var i = this[t] = new e(this);
          return this._handlers.push(i), this.options[t] && i.enable(), this;
        },
        // @method remove(): this
        // Destroys the map and clears all related event listeners.
        remove: function() {
          if (this._initEvents(!0), this.options.maxBounds && this.off("moveend", this._panInsideMaxBounds), this._containerId !== this._container._leaflet_id)
            throw new Error("Map container is being reused by another instance");
          try {
            delete this._container._leaflet_id, delete this._containerId;
          } catch {
            this._container._leaflet_id = void 0, this._containerId = void 0;
          }
          this._locationWatchId !== void 0 && this.stopLocate(), this._stop(), J(this._mapPane), this._clearControlPos && this._clearControlPos(), this._resizeRequest && (rt(this._resizeRequest), this._resizeRequest = null), this._clearHandlers(), this._loaded && this.fire("unload");
          var t;
          for (t in this._layers)
            this._layers[t].remove();
          for (t in this._panes)
            J(this._panes[t]);
          return this._layers = [], this._panes = [], delete this._mapPane, delete this._renderer, this;
        },
        // @section Other Methods
        // @method createPane(name: String, container?: HTMLElement): HTMLElement
        // Creates a new [map pane](#map-pane) with the given name if it doesn't exist already,
        // then returns it. The pane is created as a child of `container`, or
        // as a child of the main map pane if not set.
        createPane: function(t, e) {
          var i = "leaflet-pane" + (t ? " leaflet-" + t.replace("Pane", "") + "-pane" : ""), n = F("div", i, e || this._mapPane);
          return t && (this._panes[t] = n), n;
        },
        // @section Methods for Getting Map State
        // @method getCenter(): LatLng
        // Returns the geographical center of the map view
        getCenter: function() {
          return this._checkIfLoaded(), this._lastCenter && !this._moved() ? this._lastCenter.clone() : this.layerPointToLatLng(this._getCenterLayerPoint());
        },
        // @method getZoom(): Number
        // Returns the current zoom level of the map view
        getZoom: function() {
          return this._zoom;
        },
        // @method getBounds(): LatLngBounds
        // Returns the geographical bounds visible in the current map view
        getBounds: function() {
          var t = this.getPixelBounds(), e = this.unproject(t.getBottomLeft()), i = this.unproject(t.getTopRight());
          return new ut(e, i);
        },
        // @method getMinZoom(): Number
        // Returns the minimum zoom level of the map (if set in the `minZoom` option of the map or of any layers), or `0` by default.
        getMinZoom: function() {
          return this.options.minZoom === void 0 ? this._layersMinZoom || 0 : this.options.minZoom;
        },
        // @method getMaxZoom(): Number
        // Returns the maximum zoom level of the map (if set in the `maxZoom` option of the map or of any layers).
        getMaxZoom: function() {
          return this.options.maxZoom === void 0 ? this._layersMaxZoom === void 0 ? 1 / 0 : this._layersMaxZoom : this.options.maxZoom;
        },
        // @method getBoundsZoom(bounds: LatLngBounds, inside?: Boolean, padding?: Point): Number
        // Returns the maximum zoom level on which the given bounds fit to the map
        // view in its entirety. If `inside` (optional) is set to `true`, the method
        // instead returns the minimum zoom level on which the map view fits into
        // the given bounds in its entirety.
        getBoundsZoom: function(t, e, i) {
          t = X(t), i = E(i || [0, 0]);
          var n = this.getZoom() || 0, r = this.getMinZoom(), h = this.getMaxZoom(), _ = t.getNorthWest(), P = t.getSouthEast(), x = this.getSize().subtract(i), S = ht(this.project(P, n), this.project(_, n)).getSize(), z = A.any3d ? this.options.zoomSnap : 1, O = x.x / S.x, R = x.y / S.y, at = e ? Math.max(O, R) : Math.min(O, R);
          return n = this.getScaleZoom(at, n), z && (n = Math.round(n / (z / 100)) * (z / 100), n = e ? Math.ceil(n / z) * z : Math.floor(n / z) * z), Math.max(r, Math.min(h, n));
        },
        // @method getSize(): Point
        // Returns the current size of the map container (in pixels).
        getSize: function() {
          return (!this._size || this._sizeChanged) && (this._size = new B(
            this._container.clientWidth || 0,
            this._container.clientHeight || 0
          ), this._sizeChanged = !1), this._size.clone();
        },
        // @method getPixelBounds(): Bounds
        // Returns the bounds of the current map view in projected pixel
        // coordinates (sometimes useful in layer and overlay implementations).
        getPixelBounds: function(t, e) {
          var i = this._getTopLeftPoint(t, e);
          return new V(i, i.add(this.getSize()));
        },
        // TODO: Check semantics - isn't the pixel origin the 0,0 coord relative to
        // the map pane? "left point of the map layer" can be confusing, specially
        // since there can be negative offsets.
        // @method getPixelOrigin(): Point
        // Returns the projected pixel coordinates of the top left point of
        // the map layer (useful in custom layer and overlay implementations).
        getPixelOrigin: function() {
          return this._checkIfLoaded(), this._pixelOrigin;
        },
        // @method getPixelWorldBounds(zoom?: Number): Bounds
        // Returns the world's bounds in pixel coordinates for zoom level `zoom`.
        // If `zoom` is omitted, the map's current zoom level is used.
        getPixelWorldBounds: function(t) {
          return this.options.crs.getProjectedBounds(t === void 0 ? this.getZoom() : t);
        },
        // @section Other Methods
        // @method getPane(pane: String|HTMLElement): HTMLElement
        // Returns a [map pane](#map-pane), given its name or its HTML element (its identity).
        getPane: function(t) {
          return typeof t == "string" ? this._panes[t] : t;
        },
        // @method getPanes(): Object
        // Returns a plain object containing the names of all [panes](#map-pane) as keys and
        // the panes as values.
        getPanes: function() {
          return this._panes;
        },
        // @method getContainer: HTMLElement
        // Returns the HTML element that contains the map.
        getContainer: function() {
          return this._container;
        },
        // @section Conversion Methods
        // @method getZoomScale(toZoom: Number, fromZoom: Number): Number
        // Returns the scale factor to be applied to a map transition from zoom level
        // `fromZoom` to `toZoom`. Used internally to help with zoom animations.
        getZoomScale: function(t, e) {
          var i = this.options.crs;
          return e = e === void 0 ? this._zoom : e, i.scale(t) / i.scale(e);
        },
        // @method getScaleZoom(scale: Number, fromZoom: Number): Number
        // Returns the zoom level that the map would end up at, if it is at `fromZoom`
        // level and everything is scaled by a factor of `scale`. Inverse of
        // [`getZoomScale`](#map-getZoomScale).
        getScaleZoom: function(t, e) {
          var i = this.options.crs;
          e = e === void 0 ? this._zoom : e;
          var n = i.zoom(t * i.scale(e));
          return isNaN(n) ? 1 / 0 : n;
        },
        // @method project(latlng: LatLng, zoom: Number): Point
        // Projects a geographical coordinate `LatLng` according to the projection
        // of the map's CRS, then scales it according to `zoom` and the CRS's
        // `Transformation`. The result is pixel coordinate relative to
        // the CRS origin.
        project: function(t, e) {
          return e = e === void 0 ? this._zoom : e, this.options.crs.latLngToPoint(N(t), e);
        },
        // @method unproject(point: Point, zoom: Number): LatLng
        // Inverse of [`project`](#map-project).
        unproject: function(t, e) {
          return e = e === void 0 ? this._zoom : e, this.options.crs.pointToLatLng(E(t), e);
        },
        // @method layerPointToLatLng(point: Point): LatLng
        // Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
        // returns the corresponding geographical coordinate (for the current zoom level).
        layerPointToLatLng: function(t) {
          var e = E(t).add(this.getPixelOrigin());
          return this.unproject(e);
        },
        // @method latLngToLayerPoint(latlng: LatLng): Point
        // Given a geographical coordinate, returns the corresponding pixel coordinate
        // relative to the [origin pixel](#map-getpixelorigin).
        latLngToLayerPoint: function(t) {
          var e = this.project(N(t))._round();
          return e._subtract(this.getPixelOrigin());
        },
        // @method wrapLatLng(latlng: LatLng): LatLng
        // Returns a `LatLng` where `lat` and `lng` has been wrapped according to the
        // map's CRS's `wrapLat` and `wrapLng` properties, if they are outside the
        // CRS's bounds.
        // By default this means longitude is wrapped around the dateline so its
        // value is between -180 and +180 degrees.
        wrapLatLng: function(t) {
          return this.options.crs.wrapLatLng(N(t));
        },
        // @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
        // Returns a `LatLngBounds` with the same size as the given one, ensuring that
        // its center is within the CRS's bounds.
        // By default this means the center longitude is wrapped around the dateline so its
        // value is between -180 and +180 degrees, and the majority of the bounds
        // overlaps the CRS's bounds.
        wrapLatLngBounds: function(t) {
          return this.options.crs.wrapLatLngBounds(X(t));
        },
        // @method distance(latlng1: LatLng, latlng2: LatLng): Number
        // Returns the distance between two geographical coordinates according to
        // the map's CRS. By default this measures distance in meters.
        distance: function(t, e) {
          return this.options.crs.distance(N(t), N(e));
        },
        // @method containerPointToLayerPoint(point: Point): Point
        // Given a pixel coordinate relative to the map container, returns the corresponding
        // pixel coordinate relative to the [origin pixel](#map-getpixelorigin).
        containerPointToLayerPoint: function(t) {
          return E(t).subtract(this._getMapPanePos());
        },
        // @method layerPointToContainerPoint(point: Point): Point
        // Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
        // returns the corresponding pixel coordinate relative to the map container.
        layerPointToContainerPoint: function(t) {
          return E(t).add(this._getMapPanePos());
        },
        // @method containerPointToLatLng(point: Point): LatLng
        // Given a pixel coordinate relative to the map container, returns
        // the corresponding geographical coordinate (for the current zoom level).
        containerPointToLatLng: function(t) {
          var e = this.containerPointToLayerPoint(E(t));
          return this.layerPointToLatLng(e);
        },
        // @method latLngToContainerPoint(latlng: LatLng): Point
        // Given a geographical coordinate, returns the corresponding pixel coordinate
        // relative to the map container.
        latLngToContainerPoint: function(t) {
          return this.layerPointToContainerPoint(this.latLngToLayerPoint(N(t)));
        },
        // @method mouseEventToContainerPoint(ev: MouseEvent): Point
        // Given a MouseEvent object, returns the pixel coordinate relative to the
        // map container where the event took place.
        mouseEventToContainerPoint: function(t) {
          return Fi(t, this._container);
        },
        // @method mouseEventToLayerPoint(ev: MouseEvent): Point
        // Given a MouseEvent object, returns the pixel coordinate relative to
        // the [origin pixel](#map-getpixelorigin) where the event took place.
        mouseEventToLayerPoint: function(t) {
          return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(t));
        },
        // @method mouseEventToLatLng(ev: MouseEvent): LatLng
        // Given a MouseEvent object, returns geographical coordinate where the
        // event took place.
        mouseEventToLatLng: function(t) {
          return this.layerPointToLatLng(this.mouseEventToLayerPoint(t));
        },
        // map initialization methods
        _initContainer: function(t) {
          var e = this._container = Ni(t);
          if (e) {
            if (e._leaflet_id)
              throw new Error("Map container is already initialized.");
          } else
            throw new Error("Map container not found.");
          Z(e, "scroll", this._onScroll, this), this._containerId = d(e);
        },
        _initLayout: function() {
          var t = this._container;
          this._fadeAnimated = this.options.fadeAnimation && A.any3d, D(t, "leaflet-container" + (A.touch ? " leaflet-touch" : "") + (A.retina ? " leaflet-retina" : "") + (A.ielt9 ? " leaflet-oldie" : "") + (A.safari ? " leaflet-safari" : "") + (this._fadeAnimated ? " leaflet-fade-anim" : ""));
          var e = Qt(t, "position");
          e !== "absolute" && e !== "relative" && e !== "fixed" && e !== "sticky" && (t.style.position = "relative"), this._initPanes(), this._initControlPos && this._initControlPos();
        },
        _initPanes: function() {
          var t = this._panes = {};
          this._paneRenderers = {}, this._mapPane = this.createPane("mapPane", this._container), $(this._mapPane, new B(0, 0)), this.createPane("tilePane"), this.createPane("overlayPane"), this.createPane("shadowPane"), this.createPane("markerPane"), this.createPane("tooltipPane"), this.createPane("popupPane"), this.options.markerZoomAnimation || (D(t.markerPane, "leaflet-zoom-hide"), D(t.shadowPane, "leaflet-zoom-hide"));
        },
        // private methods that modify map state
        // @section Map state change events
        _resetView: function(t, e, i) {
          $(this._mapPane, new B(0, 0));
          var n = !this._loaded;
          this._loaded = !0, e = this._limitZoom(e), this.fire("viewprereset");
          var r = this._zoom !== e;
          this._moveStart(r, i)._move(t, e)._moveEnd(r), this.fire("viewreset"), n && this.fire("load");
        },
        _moveStart: function(t, e) {
          return t && this.fire("zoomstart"), e || this.fire("movestart"), this;
        },
        _move: function(t, e, i, n) {
          e === void 0 && (e = this._zoom);
          var r = this._zoom !== e;
          return this._zoom = e, this._lastCenter = t, this._pixelOrigin = this._getNewPixelOrigin(t), n ? i && i.pinch && this.fire("zoom", i) : ((r || i && i.pinch) && this.fire("zoom", i), this.fire("move", i)), this;
        },
        _moveEnd: function(t) {
          return t && this.fire("zoomend"), this.fire("moveend");
        },
        _stop: function() {
          return rt(this._flyToFrame), this._panAnim && this._panAnim.stop(), this;
        },
        _rawPanBy: function(t) {
          $(this._mapPane, this._getMapPanePos().subtract(t));
        },
        _getZoomSpan: function() {
          return this.getMaxZoom() - this.getMinZoom();
        },
        _panInsideMaxBounds: function() {
          this._enforcingBounds || this.panInsideBounds(this.options.maxBounds);
        },
        _checkIfLoaded: function() {
          if (!this._loaded)
            throw new Error("Set map center and zoom first.");
        },
        // DOM event handling
        // @section Interaction events
        _initEvents: function(t) {
          this._targets = {}, this._targets[d(this._container)] = this;
          var e = t ? q : Z;
          e(this._container, "click dblclick mousedown mouseup mouseover mouseout mousemove contextmenu keypress keydown keyup", this._handleDOMEvent, this), this.options.trackResize && e(window, "resize", this._onResize, this), A.any3d && this.options.transform3DLimit && (t ? this.off : this.on).call(this, "moveend", this._onMoveEnd);
        },
        _onResize: function() {
          rt(this._resizeRequest), this._resizeRequest = j(
            function() {
              this.invalidateSize({ debounceMoveend: !0 });
            },
            this
          );
        },
        _onScroll: function() {
          this._container.scrollTop = 0, this._container.scrollLeft = 0;
        },
        _onMoveEnd: function() {
          var t = this._getMapPanePos();
          Math.max(Math.abs(t.x), Math.abs(t.y)) >= this.options.transform3DLimit && this._resetView(this.getCenter(), this.getZoom());
        },
        _findEventTargets: function(t, e) {
          for (var i = [], n, r = e === "mouseout" || e === "mouseover", h = t.target || t.srcElement, _ = !1; h; ) {
            if (n = this._targets[d(h)], n && (e === "click" || e === "preclick") && this._draggableMoved(n)) {
              _ = !0;
              break;
            }
            if (n && n.listens(e, !0) && (r && !ii(h, t) || (i.push(n), r)) || h === this._container)
              break;
            h = h.parentNode;
          }
          return !i.length && !_ && !r && this.listens(e, !0) && (i = [this]), i;
        },
        _isClickDisabled: function(t) {
          for (; t && t !== this._container; ) {
            if (t._leaflet_disable_click)
              return !0;
            t = t.parentNode;
          }
        },
        _handleDOMEvent: function(t) {
          var e = t.target || t.srcElement;
          if (!(!this._loaded || e._leaflet_disable_events || t.type === "click" && this._isClickDisabled(e))) {
            var i = t.type;
            i === "mousedown" && Ye(e), this._fireDOMEvent(t, i);
          }
        },
        _mouseEvents: ["click", "dblclick", "mouseover", "mouseout", "contextmenu"],
        _fireDOMEvent: function(t, e, i) {
          if (t.type === "click") {
            var n = y({}, t);
            n.type = "preclick", this._fireDOMEvent(n, n.type, i);
          }
          var r = this._findEventTargets(t, e);
          if (i) {
            for (var h = [], _ = 0; _ < i.length; _++)
              i[_].listens(e, !0) && h.push(i[_]);
            r = h.concat(r);
          }
          if (r.length) {
            e === "contextmenu" && et(t);
            var P = r[0], x = {
              originalEvent: t
            };
            if (t.type !== "keypress" && t.type !== "keydown" && t.type !== "keyup") {
              var S = P.getLatLng && (!P._radius || P._radius <= 10);
              x.containerPoint = S ? this.latLngToContainerPoint(P.getLatLng()) : this.mouseEventToContainerPoint(t), x.layerPoint = this.containerPointToLayerPoint(x.containerPoint), x.latlng = S ? P.getLatLng() : this.layerPointToLatLng(x.layerPoint);
            }
            for (_ = 0; _ < r.length; _++)
              if (r[_].fire(e, x, !0), x.originalEvent._stopped || r[_].options.bubblingMouseEvents === !1 && U(this._mouseEvents, e) !== -1)
                return;
          }
        },
        _draggableMoved: function(t) {
          return t = t.dragging && t.dragging.enabled() ? t : this, t.dragging && t.dragging.moved() || this.boxZoom && this.boxZoom.moved();
        },
        _clearHandlers: function() {
          for (var t = 0, e = this._handlers.length; t < e; t++)
            this._handlers[t].disable();
        },
        // @section Other Methods
        // @method whenReady(fn: Function, context?: Object): this
        // Runs the given function `fn` when the map gets initialized with
        // a view (center and zoom) and at least one layer, or immediately
        // if it's already initialized, optionally passing a function context.
        whenReady: function(t, e) {
          return this._loaded ? t.call(e || this, { target: this }) : this.on("load", t, e), this;
        },
        // private methods for getting map state
        _getMapPanePos: function() {
          return Bt(this._mapPane) || new B(0, 0);
        },
        _moved: function() {
          var t = this._getMapPanePos();
          return t && !t.equals([0, 0]);
        },
        _getTopLeftPoint: function(t, e) {
          var i = t && e !== void 0 ? this._getNewPixelOrigin(t, e) : this.getPixelOrigin();
          return i.subtract(this._getMapPanePos());
        },
        _getNewPixelOrigin: function(t, e) {
          var i = this.getSize()._divideBy(2);
          return this.project(t, e)._subtract(i)._add(this._getMapPanePos())._round();
        },
        _latLngToNewLayerPoint: function(t, e, i) {
          var n = this._getNewPixelOrigin(i, e);
          return this.project(t, e)._subtract(n);
        },
        _latLngBoundsToNewLayerBounds: function(t, e, i) {
          var n = this._getNewPixelOrigin(i, e);
          return ht([
            this.project(t.getSouthWest(), e)._subtract(n),
            this.project(t.getNorthWest(), e)._subtract(n),
            this.project(t.getSouthEast(), e)._subtract(n),
            this.project(t.getNorthEast(), e)._subtract(n)
          ]);
        },
        // layer point of the current center
        _getCenterLayerPoint: function() {
          return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
        },
        // offset of the specified place to the current center in pixels
        _getCenterOffset: function(t) {
          return this.latLngToLayerPoint(t).subtract(this._getCenterLayerPoint());
        },
        // adjust center for view to get inside bounds
        _limitCenter: function(t, e, i) {
          if (!i)
            return t;
          var n = this.project(t, e), r = this.getSize().divideBy(2), h = new V(n.subtract(r), n.add(r)), _ = this._getBoundsOffset(h, i, e);
          return Math.abs(_.x) <= 1 && Math.abs(_.y) <= 1 ? t : this.unproject(n.add(_), e);
        },
        // adjust offset for view to get inside bounds
        _limitOffset: function(t, e) {
          if (!e)
            return t;
          var i = this.getPixelBounds(), n = new V(i.min.add(t), i.max.add(t));
          return t.add(this._getBoundsOffset(n, e));
        },
        // returns offset needed for pxBounds to get inside maxBounds at a specified zoom
        _getBoundsOffset: function(t, e, i) {
          var n = ht(
            this.project(e.getNorthEast(), i),
            this.project(e.getSouthWest(), i)
          ), r = n.min.subtract(t.min), h = n.max.subtract(t.max), _ = this._rebound(r.x, -h.x), P = this._rebound(r.y, -h.y);
          return new B(_, P);
        },
        _rebound: function(t, e) {
          return t + e > 0 ? Math.round(t - e) / 2 : Math.max(0, Math.ceil(t)) - Math.max(0, Math.floor(e));
        },
        _limitZoom: function(t) {
          var e = this.getMinZoom(), i = this.getMaxZoom(), n = A.any3d ? this.options.zoomSnap : 1;
          return n && (t = Math.round(t / n) * n), Math.max(e, Math.min(i, t));
        },
        _onPanTransitionStep: function() {
          this.fire("move");
        },
        _onPanTransitionEnd: function() {
          Y(this._mapPane, "leaflet-pan-anim"), this.fire("moveend");
        },
        _tryAnimatedPan: function(t, e) {
          var i = this._getCenterOffset(t)._trunc();
          return (e && e.animate) !== !0 && !this.getSize().contains(i) ? !1 : (this.panBy(i, e), !0);
        },
        _createAnimProxy: function() {
          var t = this._proxy = F("div", "leaflet-proxy leaflet-zoom-animated");
          this._panes.mapPane.appendChild(t), this.on("zoomanim", function(e) {
            var i = Fe, n = this._proxy.style[i];
            Et(this._proxy, this.project(e.center, e.zoom), this.getZoomScale(e.zoom, 1)), n === this._proxy.style[i] && this._animatingZoom && this._onZoomTransitionEnd();
          }, this), this.on("load moveend", this._animMoveEnd, this), this._on("unload", this._destroyAnimProxy, this);
        },
        _destroyAnimProxy: function() {
          J(this._proxy), this.off("load moveend", this._animMoveEnd, this), delete this._proxy;
        },
        _animMoveEnd: function() {
          var t = this.getCenter(), e = this.getZoom();
          Et(this._proxy, this.project(t, e), this.getZoomScale(e, 1));
        },
        _catchTransitionEnd: function(t) {
          this._animatingZoom && t.propertyName.indexOf("transform") >= 0 && this._onZoomTransitionEnd();
        },
        _nothingToAnimate: function() {
          return !this._container.getElementsByClassName("leaflet-zoom-animated").length;
        },
        _tryAnimatedZoom: function(t, e, i) {
          if (this._animatingZoom)
            return !0;
          if (i = i || {}, !this._zoomAnimated || i.animate === !1 || this._nothingToAnimate() || Math.abs(e - this._zoom) > this.options.zoomAnimationThreshold)
            return !1;
          var n = this.getZoomScale(e), r = this._getCenterOffset(t)._divideBy(1 - 1 / n);
          return i.animate !== !0 && !this.getSize().contains(r) ? !1 : (j(function() {
            this._moveStart(!0, i.noMoveStart || !1)._animateZoom(t, e, !0);
          }, this), !0);
        },
        _animateZoom: function(t, e, i, n) {
          this._mapPane && (i && (this._animatingZoom = !0, this._animateToCenter = t, this._animateToZoom = e, D(this._mapPane, "leaflet-zoom-anim")), this.fire("zoomanim", {
            center: t,
            zoom: e,
            noUpdate: n
          }), this._tempFireZoomEvent || (this._tempFireZoomEvent = this._zoom !== this._animateToZoom), this._move(this._animateToCenter, this._animateToZoom, void 0, !0), setTimeout(a(this._onZoomTransitionEnd, this), 250));
        },
        _onZoomTransitionEnd: function() {
          this._animatingZoom && (this._mapPane && Y(this._mapPane, "leaflet-zoom-anim"), this._animatingZoom = !1, this._move(this._animateToCenter, this._animateToZoom, void 0, !0), this._tempFireZoomEvent && this.fire("zoom"), delete this._tempFireZoomEvent, this.fire("move"), this._moveEnd(!0));
        }
      });
      function wo(t, e) {
        return new G(t, e);
      }
      var pt = xt.extend({
        // @section
        // @aka Control Options
        options: {
          // @option position: String = 'topright'
          // The position of the control (one of the map corners). Possible values are `'topleft'`,
          // `'topright'`, `'bottomleft'` or `'bottomright'`
          position: "topright"
        },
        initialize: function(t) {
          v(this, t);
        },
        /* @section
         * Classes extending L.Control will inherit the following methods:
         *
         * @method getPosition: string
         * Returns the position of the control.
         */
        getPosition: function() {
          return this.options.position;
        },
        // @method setPosition(position: string): this
        // Sets the position of the control.
        setPosition: function(t) {
          var e = this._map;
          return e && e.removeControl(this), this.options.position = t, e && e.addControl(this), this;
        },
        // @method getContainer: HTMLElement
        // Returns the HTMLElement that contains the control.
        getContainer: function() {
          return this._container;
        },
        // @method addTo(map: Map): this
        // Adds the control to the given map.
        addTo: function(t) {
          this.remove(), this._map = t;
          var e = this._container = this.onAdd(t), i = this.getPosition(), n = t._controlCorners[i];
          return D(e, "leaflet-control"), i.indexOf("bottom") !== -1 ? n.insertBefore(e, n.firstChild) : n.appendChild(e), this._map.on("unload", this.remove, this), this;
        },
        // @method remove: this
        // Removes the control from the map it is currently active on.
        remove: function() {
          return this._map ? (J(this._container), this.onRemove && this.onRemove(this._map), this._map.off("unload", this.remove, this), this._map = null, this) : this;
        },
        _refocusOnMap: function(t) {
          this._map && t && t.screenX > 0 && t.screenY > 0 && this._map.getContainer().focus();
        }
      }), oe = function(t) {
        return new pt(t);
      };
      G.include({
        // @method addControl(control: Control): this
        // Adds the given control to the map
        addControl: function(t) {
          return t.addTo(this), this;
        },
        // @method removeControl(control: Control): this
        // Removes the given control from the map
        removeControl: function(t) {
          return t.remove(), this;
        },
        _initControlPos: function() {
          var t = this._controlCorners = {}, e = "leaflet-", i = this._controlContainer = F("div", e + "control-container", this._container);
          function n(r, h) {
            var _ = e + r + " " + e + h;
            t[r + h] = F("div", _, i);
          }
          n("top", "left"), n("top", "right"), n("bottom", "left"), n("bottom", "right");
        },
        _clearControlPos: function() {
          for (var t in this._controlCorners)
            J(this._controlCorners[t]);
          J(this._controlContainer), delete this._controlCorners, delete this._controlContainer;
        }
      });
      var ji = pt.extend({
        // @section
        // @aka Control.Layers options
        options: {
          // @option collapsed: Boolean = true
          // If `true`, the control will be collapsed into an icon and expanded on mouse hover, touch, or keyboard activation.
          collapsed: !0,
          position: "topright",
          // @option autoZIndex: Boolean = true
          // If `true`, the control will assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off.
          autoZIndex: !0,
          // @option hideSingleBase: Boolean = false
          // If `true`, the base layers in the control will be hidden when there is only one.
          hideSingleBase: !1,
          // @option sortLayers: Boolean = false
          // Whether to sort the layers. When `false`, layers will keep the order
          // in which they were added to the control.
          sortLayers: !1,
          // @option sortFunction: Function = *
          // A [compare function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
          // that will be used for sorting the layers, when `sortLayers` is `true`.
          // The function receives both the `L.Layer` instances and their names, as in
          // `sortFunction(layerA, layerB, nameA, nameB)`.
          // By default, it sorts layers alphabetically by their name.
          sortFunction: function(t, e, i, n) {
            return i < n ? -1 : n < i ? 1 : 0;
          }
        },
        initialize: function(t, e, i) {
          v(this, i), this._layerControlInputs = [], this._layers = [], this._lastZIndex = 0, this._handlingClick = !1, this._preventClick = !1;
          for (var n in t)
            this._addLayer(t[n], n);
          for (n in e)
            this._addLayer(e[n], n, !0);
        },
        onAdd: function(t) {
          this._initLayout(), this._update(), this._map = t, t.on("zoomend", this._checkDisabledLayers, this);
          for (var e = 0; e < this._layers.length; e++)
            this._layers[e].layer.on("add remove", this._onLayerChange, this);
          return this._container;
        },
        addTo: function(t) {
          return pt.prototype.addTo.call(this, t), this._expandIfNotCollapsed();
        },
        onRemove: function() {
          this._map.off("zoomend", this._checkDisabledLayers, this);
          for (var t = 0; t < this._layers.length; t++)
            this._layers[t].layer.off("add remove", this._onLayerChange, this);
        },
        // @method addBaseLayer(layer: Layer, name: String): this
        // Adds a base layer (radio button entry) with the given name to the control.
        addBaseLayer: function(t, e) {
          return this._addLayer(t, e), this._map ? this._update() : this;
        },
        // @method addOverlay(layer: Layer, name: String): this
        // Adds an overlay (checkbox entry) with the given name to the control.
        addOverlay: function(t, e) {
          return this._addLayer(t, e, !0), this._map ? this._update() : this;
        },
        // @method removeLayer(layer: Layer): this
        // Remove the given layer from the control.
        removeLayer: function(t) {
          t.off("add remove", this._onLayerChange, this);
          var e = this._getLayer(d(t));
          return e && this._layers.splice(this._layers.indexOf(e), 1), this._map ? this._update() : this;
        },
        // @method expand(): this
        // Expand the control container if collapsed.
        expand: function() {
          D(this._container, "leaflet-control-layers-expanded"), this._section.style.height = null;
          var t = this._map.getSize().y - (this._container.offsetTop + 50);
          return t < this._section.clientHeight ? (D(this._section, "leaflet-control-layers-scrollbar"), this._section.style.height = t + "px") : Y(this._section, "leaflet-control-layers-scrollbar"), this._checkDisabledLayers(), this;
        },
        // @method collapse(): this
        // Collapse the control container if expanded.
        collapse: function() {
          return Y(this._container, "leaflet-control-layers-expanded"), this;
        },
        _initLayout: function() {
          var t = "leaflet-control-layers", e = this._container = F("div", t), i = this.options.collapsed;
          e.setAttribute("aria-haspopup", !0), ne(e), ei(e);
          var n = this._section = F("section", t + "-list");
          i && (this._map.on("click", this.collapse, this), Z(e, {
            mouseenter: this._expandSafely,
            mouseleave: this.collapse
          }, this));
          var r = this._layersLink = F("a", t + "-toggle", e);
          r.href = "#", r.title = "Layers", r.setAttribute("role", "button"), Z(r, {
            keydown: function(h) {
              h.keyCode === 13 && this._expandSafely();
            },
            // Certain screen readers intercept the key event and instead send a click event
            click: function(h) {
              et(h), this._expandSafely();
            }
          }, this), i || this.expand(), this._baseLayersList = F("div", t + "-base", n), this._separator = F("div", t + "-separator", n), this._overlaysList = F("div", t + "-overlays", n), e.appendChild(n);
        },
        _getLayer: function(t) {
          for (var e = 0; e < this._layers.length; e++)
            if (this._layers[e] && d(this._layers[e].layer) === t)
              return this._layers[e];
        },
        _addLayer: function(t, e, i) {
          this._map && t.on("add remove", this._onLayerChange, this), this._layers.push({
            layer: t,
            name: e,
            overlay: i
          }), this.options.sortLayers && this._layers.sort(a(function(n, r) {
            return this.options.sortFunction(n.layer, r.layer, n.name, r.name);
          }, this)), this.options.autoZIndex && t.setZIndex && (this._lastZIndex++, t.setZIndex(this._lastZIndex)), this._expandIfNotCollapsed();
        },
        _update: function() {
          if (!this._container)
            return this;
          de(this._baseLayersList), de(this._overlaysList), this._layerControlInputs = [];
          var t, e, i, n, r = 0;
          for (i = 0; i < this._layers.length; i++)
            n = this._layers[i], this._addItem(n), e = e || n.overlay, t = t || !n.overlay, r += n.overlay ? 0 : 1;
          return this.options.hideSingleBase && (t = t && r > 1, this._baseLayersList.style.display = t ? "" : "none"), this._separator.style.display = e && t ? "" : "none", this;
        },
        _onLayerChange: function(t) {
          this._handlingClick || this._update();
          var e = this._getLayer(d(t.target)), i = e.overlay ? t.type === "add" ? "overlayadd" : "overlayremove" : t.type === "add" ? "baselayerchange" : null;
          i && this._map.fire(i, e);
        },
        // IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see https://stackoverflow.com/a/119079)
        _createRadioElement: function(t, e) {
          var i = '<input type="radio" class="leaflet-control-layers-selector" name="' + t + '"' + (e ? ' checked="checked"' : "") + "/>", n = document.createElement("div");
          return n.innerHTML = i, n.firstChild;
        },
        _addItem: function(t) {
          var e = document.createElement("label"), i = this._map.hasLayer(t.layer), n;
          t.overlay ? (n = document.createElement("input"), n.type = "checkbox", n.className = "leaflet-control-layers-selector", n.defaultChecked = i) : n = this._createRadioElement("leaflet-base-layers_" + d(this), i), this._layerControlInputs.push(n), n.layerId = d(t.layer), Z(n, "click", this._onInputClick, this);
          var r = document.createElement("span");
          r.innerHTML = " " + t.name;
          var h = document.createElement("span");
          e.appendChild(h), h.appendChild(n), h.appendChild(r);
          var _ = t.overlay ? this._overlaysList : this._baseLayersList;
          return _.appendChild(e), this._checkDisabledLayers(), e;
        },
        _onInputClick: function() {
          if (!this._preventClick) {
            var t = this._layerControlInputs, e, i, n = [], r = [];
            this._handlingClick = !0;
            for (var h = t.length - 1; h >= 0; h--)
              e = t[h], i = this._getLayer(e.layerId).layer, e.checked ? n.push(i) : e.checked || r.push(i);
            for (h = 0; h < r.length; h++)
              this._map.hasLayer(r[h]) && this._map.removeLayer(r[h]);
            for (h = 0; h < n.length; h++)
              this._map.hasLayer(n[h]) || this._map.addLayer(n[h]);
            this._handlingClick = !1, this._refocusOnMap();
          }
        },
        _checkDisabledLayers: function() {
          for (var t = this._layerControlInputs, e, i, n = this._map.getZoom(), r = t.length - 1; r >= 0; r--)
            e = t[r], i = this._getLayer(e.layerId).layer, e.disabled = i.options.minZoom !== void 0 && n < i.options.minZoom || i.options.maxZoom !== void 0 && n > i.options.maxZoom;
        },
        _expandIfNotCollapsed: function() {
          return this._map && !this.options.collapsed && this.expand(), this;
        },
        _expandSafely: function() {
          var t = this._section;
          this._preventClick = !0, Z(t, "click", et), this.expand();
          var e = this;
          setTimeout(function() {
            q(t, "click", et), e._preventClick = !1;
          });
        }
      }), Po = function(t, e, i) {
        return new ji(t, e, i);
      }, ni = pt.extend({
        // @section
        // @aka Control.Zoom options
        options: {
          position: "topleft",
          // @option zoomInText: String = '<span aria-hidden="true">+</span>'
          // The text set on the 'zoom in' button.
          zoomInText: '<span aria-hidden="true">+</span>',
          // @option zoomInTitle: String = 'Zoom in'
          // The title set on the 'zoom in' button.
          zoomInTitle: "Zoom in",
          // @option zoomOutText: String = '<span aria-hidden="true">&#x2212;</span>'
          // The text set on the 'zoom out' button.
          zoomOutText: '<span aria-hidden="true">&#x2212;</span>',
          // @option zoomOutTitle: String = 'Zoom out'
          // The title set on the 'zoom out' button.
          zoomOutTitle: "Zoom out"
        },
        onAdd: function(t) {
          var e = "leaflet-control-zoom", i = F("div", e + " leaflet-bar"), n = this.options;
          return this._zoomInButton = this._createButton(
            n.zoomInText,
            n.zoomInTitle,
            e + "-in",
            i,
            this._zoomIn
          ), this._zoomOutButton = this._createButton(
            n.zoomOutText,
            n.zoomOutTitle,
            e + "-out",
            i,
            this._zoomOut
          ), this._updateDisabled(), t.on("zoomend zoomlevelschange", this._updateDisabled, this), i;
        },
        onRemove: function(t) {
          t.off("zoomend zoomlevelschange", this._updateDisabled, this);
        },
        disable: function() {
          return this._disabled = !0, this._updateDisabled(), this;
        },
        enable: function() {
          return this._disabled = !1, this._updateDisabled(), this;
        },
        _zoomIn: function(t) {
          !this._disabled && this._map._zoom < this._map.getMaxZoom() && this._map.zoomIn(this._map.options.zoomDelta * (t.shiftKey ? 3 : 1));
        },
        _zoomOut: function(t) {
          !this._disabled && this._map._zoom > this._map.getMinZoom() && this._map.zoomOut(this._map.options.zoomDelta * (t.shiftKey ? 3 : 1));
        },
        _createButton: function(t, e, i, n, r) {
          var h = F("a", i, n);
          return h.innerHTML = t, h.href = "#", h.title = e, h.setAttribute("role", "button"), h.setAttribute("aria-label", e), ne(h), Z(h, "click", Dt), Z(h, "click", r, this), Z(h, "click", this._refocusOnMap, this), h;
        },
        _updateDisabled: function() {
          var t = this._map, e = "leaflet-disabled";
          Y(this._zoomInButton, e), Y(this._zoomOutButton, e), this._zoomInButton.setAttribute("aria-disabled", "false"), this._zoomOutButton.setAttribute("aria-disabled", "false"), (this._disabled || t._zoom === t.getMinZoom()) && (D(this._zoomOutButton, e), this._zoomOutButton.setAttribute("aria-disabled", "true")), (this._disabled || t._zoom === t.getMaxZoom()) && (D(this._zoomInButton, e), this._zoomInButton.setAttribute("aria-disabled", "true"));
        }
      });
      G.mergeOptions({
        zoomControl: !0
      }), G.addInitHook(function() {
        this.options.zoomControl && (this.zoomControl = new ni(), this.addControl(this.zoomControl));
      });
      var xo = function(t) {
        return new ni(t);
      }, Vi = pt.extend({
        // @section
        // @aka Control.Scale options
        options: {
          position: "bottomleft",
          // @option maxWidth: Number = 100
          // Maximum width of the control in pixels. The width is set dynamically to show round values (e.g. 100, 200, 500).
          maxWidth: 100,
          // @option metric: Boolean = True
          // Whether to show the metric scale line (m/km).
          metric: !0,
          // @option imperial: Boolean = True
          // Whether to show the imperial scale line (mi/ft).
          imperial: !0
          // @option updateWhenIdle: Boolean = false
          // If `true`, the control is updated on [`moveend`](#map-moveend), otherwise it's always up-to-date (updated on [`move`](#map-move)).
        },
        onAdd: function(t) {
          var e = "leaflet-control-scale", i = F("div", e), n = this.options;
          return this._addScales(n, e + "-line", i), t.on(n.updateWhenIdle ? "moveend" : "move", this._update, this), t.whenReady(this._update, this), i;
        },
        onRemove: function(t) {
          t.off(this.options.updateWhenIdle ? "moveend" : "move", this._update, this);
        },
        _addScales: function(t, e, i) {
          t.metric && (this._mScale = F("div", e, i)), t.imperial && (this._iScale = F("div", e, i));
        },
        _update: function() {
          var t = this._map, e = t.getSize().y / 2, i = t.distance(
            t.containerPointToLatLng([0, e]),
            t.containerPointToLatLng([this.options.maxWidth, e])
          );
          this._updateScales(i);
        },
        _updateScales: function(t) {
          this.options.metric && t && this._updateMetric(t), this.options.imperial && t && this._updateImperial(t);
        },
        _updateMetric: function(t) {
          var e = this._getRoundNum(t), i = e < 1e3 ? e + " m" : e / 1e3 + " km";
          this._updateScale(this._mScale, i, e / t);
        },
        _updateImperial: function(t) {
          var e = t * 3.2808399, i, n, r;
          e > 5280 ? (i = e / 5280, n = this._getRoundNum(i), this._updateScale(this._iScale, n + " mi", n / i)) : (r = this._getRoundNum(e), this._updateScale(this._iScale, r + " ft", r / e));
        },
        _updateScale: function(t, e, i) {
          t.style.width = Math.round(this.options.maxWidth * i) + "px", t.innerHTML = e;
        },
        _getRoundNum: function(t) {
          var e = Math.pow(10, (Math.floor(t) + "").length - 1), i = t / e;
          return i = i >= 10 ? 10 : i >= 5 ? 5 : i >= 3 ? 3 : i >= 2 ? 2 : 1, e * i;
        }
      }), Mo = function(t) {
        return new Vi(t);
      }, bo = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag"><path fill="#4C7BE1" d="M0 0h12v4H0z"/><path fill="#FFD500" d="M0 4h12v3H0z"/><path fill="#E0BC00" d="M0 7h12v1H0z"/></svg>', oi = pt.extend({
        // @section
        // @aka Control.Attribution options
        options: {
          position: "bottomright",
          // @option prefix: String|false = 'Leaflet'
          // The HTML text shown before the attributions. Pass `false` to disable.
          prefix: '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">' + (A.inlineSvg ? bo + " " : "") + "Leaflet</a>"
        },
        initialize: function(t) {
          v(this, t), this._attributions = {};
        },
        onAdd: function(t) {
          t.attributionControl = this, this._container = F("div", "leaflet-control-attribution"), ne(this._container);
          for (var e in t._layers)
            t._layers[e].getAttribution && this.addAttribution(t._layers[e].getAttribution());
          return this._update(), t.on("layeradd", this._addAttribution, this), this._container;
        },
        onRemove: function(t) {
          t.off("layeradd", this._addAttribution, this);
        },
        _addAttribution: function(t) {
          t.layer.getAttribution && (this.addAttribution(t.layer.getAttribution()), t.layer.once("remove", function() {
            this.removeAttribution(t.layer.getAttribution());
          }, this));
        },
        // @method setPrefix(prefix: String|false): this
        // The HTML text shown before the attributions. Pass `false` to disable.
        setPrefix: function(t) {
          return this.options.prefix = t, this._update(), this;
        },
        // @method addAttribution(text: String): this
        // Adds an attribution text (e.g. `'&copy; OpenStreetMap contributors'`).
        addAttribution: function(t) {
          return t ? (this._attributions[t] || (this._attributions[t] = 0), this._attributions[t]++, this._update(), this) : this;
        },
        // @method removeAttribution(text: String): this
        // Removes an attribution text.
        removeAttribution: function(t) {
          return t ? (this._attributions[t] && (this._attributions[t]--, this._update()), this) : this;
        },
        _update: function() {
          if (this._map) {
            var t = [];
            for (var e in this._attributions)
              this._attributions[e] && t.push(e);
            var i = [];
            this.options.prefix && i.push(this.options.prefix), t.length && i.push(t.join(", ")), this._container.innerHTML = i.join(' <span aria-hidden="true">|</span> ');
          }
        }
      });
      G.mergeOptions({
        attributionControl: !0
      }), G.addInitHook(function() {
        this.options.attributionControl && new oi().addTo(this);
      });
      var Co = function(t) {
        return new oi(t);
      };
      pt.Layers = ji, pt.Zoom = ni, pt.Scale = Vi, pt.Attribution = oi, oe.layers = Po, oe.zoom = xo, oe.scale = Mo, oe.attribution = Co;
      var Lt = xt.extend({
        initialize: function(t) {
          this._map = t;
        },
        // @method enable(): this
        // Enables the handler
        enable: function() {
          return this._enabled ? this : (this._enabled = !0, this.addHooks(), this);
        },
        // @method disable(): this
        // Disables the handler
        disable: function() {
          return this._enabled ? (this._enabled = !1, this.removeHooks(), this) : this;
        },
        // @method enabled(): Boolean
        // Returns `true` if the handler is enabled
        enabled: function() {
          return !!this._enabled;
        }
        // @section Extension methods
        // Classes inheriting from `Handler` must implement the two following methods:
        // @method addHooks()
        // Called when the handler is enabled, should add event hooks.
        // @method removeHooks()
        // Called when the handler is disabled, should remove the event hooks added previously.
      });
      Lt.addTo = function(t, e) {
        return t.addHandler(e, this), this;
      };
      var To = { Events: dt }, Ji = A.touch ? "touchstart mousedown" : "mousedown", It = Kt.extend({
        options: {
          // @section
          // @aka Draggable options
          // @option clickTolerance: Number = 3
          // The max number of pixels a user can shift the mouse pointer during a click
          // for it to be considered a valid click (as opposed to a mouse drag).
          clickTolerance: 3
        },
        // @constructor L.Draggable(el: HTMLElement, dragHandle?: HTMLElement, preventOutline?: Boolean, options?: Draggable options)
        // Creates a `Draggable` object for moving `el` when you start dragging the `dragHandle` element (equals `el` itself by default).
        initialize: function(t, e, i, n) {
          v(this, n), this._element = t, this._dragStartTarget = e || t, this._preventOutline = i;
        },
        // @method enable()
        // Enables the dragging ability
        enable: function() {
          this._enabled || (Z(this._dragStartTarget, Ji, this._onDown, this), this._enabled = !0);
        },
        // @method disable()
        // Disables the dragging ability
        disable: function() {
          this._enabled && (It._dragging === this && this.finishDrag(!0), q(this._dragStartTarget, Ji, this._onDown, this), this._enabled = !1, this._moved = !1);
        },
        _onDown: function(t) {
          if (this._enabled && (this._moved = !1, !We(this._element, "leaflet-zoom-anim"))) {
            if (t.touches && t.touches.length !== 1) {
              It._dragging === this && this.finishDrag();
              return;
            }
            if (!(It._dragging || t.shiftKey || t.which !== 1 && t.button !== 1 && !t.touches) && (It._dragging = this, this._preventOutline && Ye(this._element), Ve(), te(), !this._moving)) {
              this.fire("down");
              var e = t.touches ? t.touches[0] : t, i = Gi(this._element);
              this._startPoint = new B(e.clientX, e.clientY), this._startPos = Bt(this._element), this._parentScale = Xe(i);
              var n = t.type === "mousedown";
              Z(document, n ? "mousemove" : "touchmove", this._onMove, this), Z(document, n ? "mouseup" : "touchend touchcancel", this._onUp, this);
            }
          }
        },
        _onMove: function(t) {
          if (this._enabled) {
            if (t.touches && t.touches.length > 1) {
              this._moved = !0;
              return;
            }
            var e = t.touches && t.touches.length === 1 ? t.touches[0] : t, i = new B(e.clientX, e.clientY)._subtract(this._startPoint);
            !i.x && !i.y || Math.abs(i.x) + Math.abs(i.y) < this.options.clickTolerance || (i.x /= this._parentScale.x, i.y /= this._parentScale.y, et(t), this._moved || (this.fire("dragstart"), this._moved = !0, D(document.body, "leaflet-dragging"), this._lastTarget = t.target || t.srcElement, window.SVGElementInstance && this._lastTarget instanceof window.SVGElementInstance && (this._lastTarget = this._lastTarget.correspondingUseElement), D(this._lastTarget, "leaflet-drag-target")), this._newPos = this._startPos.add(i), this._moving = !0, this._lastEvent = t, this._updatePosition());
          }
        },
        _updatePosition: function() {
          var t = { originalEvent: this._lastEvent };
          this.fire("predrag", t), $(this._element, this._newPos), this.fire("drag", t);
        },
        _onUp: function() {
          this._enabled && this.finishDrag();
        },
        finishDrag: function(t) {
          Y(document.body, "leaflet-dragging"), this._lastTarget && (Y(this._lastTarget, "leaflet-drag-target"), this._lastTarget = null), q(document, "mousemove touchmove", this._onMove, this), q(document, "mouseup touchend touchcancel", this._onUp, this), Je(), ee();
          var e = this._moved && this._moving;
          this._moving = !1, It._dragging = !1, e && this.fire("dragend", {
            noInertia: t,
            distance: this._newPos.distanceTo(this._startPos)
          });
        }
      });
      function Ki(t, e, i) {
        var n, r = [1, 4, 2, 8], h, _, P, x, S, z, O, R;
        for (h = 0, z = t.length; h < z; h++)
          t[h]._code = Rt(t[h], e);
        for (P = 0; P < 4; P++) {
          for (O = r[P], n = [], h = 0, z = t.length, _ = z - 1; h < z; _ = h++)
            x = t[h], S = t[_], x._code & O ? S._code & O || (R = ge(S, x, O, e, i), R._code = Rt(R, e), n.push(R)) : (S._code & O && (R = ge(S, x, O, e, i), R._code = Rt(R, e), n.push(R)), n.push(x));
          t = n;
        }
        return t;
      }
      function Yi(t, e) {
        var i, n, r, h, _, P, x, S, z;
        if (!t || t.length === 0)
          throw new Error("latlngs not passed");
        _t(t) || (void 0, t = t[0]);
        var O = N([0, 0]), R = X(t), at = R.getNorthWest().distanceTo(R.getSouthWest()) * R.getNorthEast().distanceTo(R.getNorthWest());
        at < 1700 && (O = si(t));
        var tt = t.length, mt = [];
        for (i = 0; i < tt; i++) {
          var lt = N(t[i]);
          mt.push(e.project(N([lt.lat - O.lat, lt.lng - O.lng])));
        }
        for (P = x = S = 0, i = 0, n = tt - 1; i < tt; n = i++)
          r = mt[i], h = mt[n], _ = r.y * h.x - h.y * r.x, x += (r.x + h.x) * _, S += (r.y + h.y) * _, P += _ * 3;
        P === 0 ? z = mt[0] : z = [x / P, S / P];
        var Jt = e.unproject(E(z));
        return N([Jt.lat + O.lat, Jt.lng + O.lng]);
      }
      function si(t) {
        for (var e = 0, i = 0, n = 0, r = 0; r < t.length; r++) {
          var h = N(t[r]);
          e += h.lat, i += h.lng, n++;
        }
        return N([e / n, i / n]);
      }
      var So = {
        __proto__: null,
        clipPolygon: Ki,
        polygonCenter: Yi,
        centroid: si
      };
      function Xi(t, e) {
        if (!e || !t.length)
          return t.slice();
        var i = e * e;
        return t = zo(t, i), t = Io(t, i), t;
      }
      function $i(t, e, i) {
        return Math.sqrt(se(t, e, i, !0));
      }
      function ko(t, e, i) {
        return se(t, e, i);
      }
      function Io(t, e) {
        var i = t.length, n = typeof Uint8Array != void 0 + "" ? Uint8Array : Array, r = new n(i);
        r[0] = r[i - 1] = 1, ri(t, r, e, 0, i - 1);
        var h, _ = [];
        for (h = 0; h < i; h++)
          r[h] && _.push(t[h]);
        return _;
      }
      function ri(t, e, i, n, r) {
        var h = 0, _, P, x;
        for (P = n + 1; P <= r - 1; P++)
          x = se(t[P], t[n], t[r], !0), x > h && (_ = P, h = x);
        h > i && (e[_] = 1, ri(t, e, i, n, _), ri(t, e, i, _, r));
      }
      function zo(t, e) {
        for (var i = [t[0]], n = 1, r = 0, h = t.length; n < h; n++)
          Ao(t[n], t[r]) > e && (i.push(t[n]), r = n);
        return r < h - 1 && i.push(t[h - 1]), i;
      }
      var Qi;
      function tn(t, e, i, n, r) {
        var h = n ? Qi : Rt(t, i), _ = Rt(e, i), P, x, S;
        for (Qi = _; ; ) {
          if (!(h | _))
            return [t, e];
          if (h & _)
            return !1;
          P = h || _, x = ge(t, e, P, i, r), S = Rt(x, i), P === h ? (t = x, h = S) : (e = x, _ = S);
        }
      }
      function ge(t, e, i, n, r) {
        var h = e.x - t.x, _ = e.y - t.y, P = n.min, x = n.max, S, z;
        return i & 8 ? (S = t.x + h * (x.y - t.y) / _, z = x.y) : i & 4 ? (S = t.x + h * (P.y - t.y) / _, z = P.y) : i & 2 ? (S = x.x, z = t.y + _ * (x.x - t.x) / h) : i & 1 && (S = P.x, z = t.y + _ * (P.x - t.x) / h), new B(S, z, r);
      }
      function Rt(t, e) {
        var i = 0;
        return t.x < e.min.x ? i |= 1 : t.x > e.max.x && (i |= 2), t.y < e.min.y ? i |= 4 : t.y > e.max.y && (i |= 8), i;
      }
      function Ao(t, e) {
        var i = e.x - t.x, n = e.y - t.y;
        return i * i + n * n;
      }
      function se(t, e, i, n) {
        var r = e.x, h = e.y, _ = i.x - r, P = i.y - h, x = _ * _ + P * P, S;
        return x > 0 && (S = ((t.x - r) * _ + (t.y - h) * P) / x, S > 1 ? (r = i.x, h = i.y) : S > 0 && (r += _ * S, h += P * S)), _ = t.x - r, P = t.y - h, n ? _ * _ + P * P : new B(r, h);
      }
      function _t(t) {
        return !I(t[0]) || typeof t[0][0] != "object" && typeof t[0][0] < "u";
      }
      function en(t) {
        return void 0, _t(t);
      }
      function nn(t, e) {
        var i, n, r, h, _, P, x, S;
        if (!t || t.length === 0)
          throw new Error("latlngs not passed");
        _t(t) || (void 0, t = t[0]);
        var z = N([0, 0]), O = X(t), R = O.getNorthWest().distanceTo(O.getSouthWest()) * O.getNorthEast().distanceTo(O.getNorthWest());
        R < 1700 && (z = si(t));
        var at = t.length, tt = [];
        for (i = 0; i < at; i++) {
          var mt = N(t[i]);
          tt.push(e.project(N([mt.lat - z.lat, mt.lng - z.lng])));
        }
        for (i = 0, n = 0; i < at - 1; i++)
          n += tt[i].distanceTo(tt[i + 1]) / 2;
        if (n === 0)
          S = tt[0];
        else
          for (i = 0, h = 0; i < at - 1; i++)
            if (_ = tt[i], P = tt[i + 1], r = _.distanceTo(P), h += r, h > n) {
              x = (h - n) / r, S = [
                P.x - x * (P.x - _.x),
                P.y - x * (P.y - _.y)
              ];
              break;
            }
        var lt = e.unproject(E(S));
        return N([lt.lat + z.lat, lt.lng + z.lng]);
      }
      var Oo = {
        __proto__: null,
        simplify: Xi,
        pointToSegmentDistance: $i,
        closestPointOnSegment: ko,
        clipSegment: tn,
        _getEdgeIntersection: ge,
        _getBitCode: Rt,
        _sqClosestPointOnSegment: se,
        isFlat: _t,
        _flat: en,
        polylineCenter: nn
      }, ai = {
        project: function(t) {
          return new B(t.lng, t.lat);
        },
        unproject: function(t) {
          return new W(t.y, t.x);
        },
        bounds: new V([-180, -90], [180, 90])
      }, hi = {
        R: 6378137,
        R_MINOR: 6356752314245179e-9,
        bounds: new V([-2003750834279e-5, -1549657073972e-5], [2003750834279e-5, 1876465623138e-5]),
        project: function(t) {
          var e = Math.PI / 180, i = this.R, n = t.lat * e, r = this.R_MINOR / i, h = Math.sqrt(1 - r * r), _ = h * Math.sin(n), P = Math.tan(Math.PI / 4 - n / 2) / Math.pow((1 - _) / (1 + _), h / 2);
          return n = -i * Math.log(Math.max(P, 1e-10)), new B(t.lng * e * i, n);
        },
        unproject: function(t) {
          for (var e = 180 / Math.PI, i = this.R, n = this.R_MINOR / i, r = Math.sqrt(1 - n * n), h = Math.exp(-t.y / i), _ = Math.PI / 2 - 2 * Math.atan(h), P = 0, x = 0.1, S; P < 15 && Math.abs(x) > 1e-7; P++)
            S = r * Math.sin(_), S = Math.pow((1 - S) / (1 + S), r / 2), x = Math.PI / 2 - 2 * Math.atan(h * S) - _, _ += x;
          return new W(_ * e, t.x * e / i);
        }
      }, Eo = {
        __proto__: null,
        LonLat: ai,
        Mercator: hi,
        SphericalMercator: Ee
      }, Bo = y({}, kt, {
        code: "EPSG:3395",
        projection: hi,
        transformation: function() {
          var t = 0.5 / (Math.PI * hi.R);
          return Yt(t, 0.5, -t, 0.5);
        }()
      }), on = y({}, kt, {
        code: "EPSG:4326",
        projection: ai,
        transformation: Yt(1 / 180, 1, -1 / 180, 0.5)
      }), Zo = y({}, Mt, {
        projection: ai,
        transformation: Yt(1, 0, -1, 0),
        scale: function(t) {
          return Math.pow(2, t);
        },
        zoom: function(t) {
          return Math.log(t) / Math.LN2;
        },
        distance: function(t, e) {
          var i = e.lng - t.lng, n = e.lat - t.lat;
          return Math.sqrt(i * i + n * n);
        },
        infinite: !0
      });
      Mt.Earth = kt, Mt.EPSG3395 = Bo, Mt.EPSG3857 = Ze, Mt.EPSG900913 = Un, Mt.EPSG4326 = on, Mt.Simple = Zo;
      var gt = Kt.extend({
        // Classes extending `L.Layer` will inherit the following options:
        options: {
          // @option pane: String = 'overlayPane'
          // By default the layer will be added to the map's [overlay pane](#map-overlaypane). Overriding this option will cause the layer to be placed on another pane by default.
          pane: "overlayPane",
          // @option attribution: String = null
          // String to be shown in the attribution control, e.g. "© OpenStreetMap contributors". It describes the layer data and is often a legal obligation towards copyright holders and tile providers.
          attribution: null,
          bubblingMouseEvents: !0
        },
        /* @section
         * Classes extending `L.Layer` will inherit the following methods:
         *
         * @method addTo(map: Map|LayerGroup): this
         * Adds the layer to the given map or layer group.
         */
        addTo: function(t) {
          return t.addLayer(this), this;
        },
        // @method remove: this
        // Removes the layer from the map it is currently active on.
        remove: function() {
          return this.removeFrom(this._map || this._mapToAdd);
        },
        // @method removeFrom(map: Map): this
        // Removes the layer from the given map
        //
        // @alternative
        // @method removeFrom(group: LayerGroup): this
        // Removes the layer from the given `LayerGroup`
        removeFrom: function(t) {
          return t && t.removeLayer(this), this;
        },
        // @method getPane(name? : String): HTMLElement
        // Returns the `HTMLElement` representing the named pane on the map. If `name` is omitted, returns the pane for this layer.
        getPane: function(t) {
          return this._map.getPane(t ? this.options[t] || t : this.options.pane);
        },
        addInteractiveTarget: function(t) {
          return this._map._targets[d(t)] = this, this;
        },
        removeInteractiveTarget: function(t) {
          return delete this._map._targets[d(t)], this;
        },
        // @method getAttribution: String
        // Used by the `attribution control`, returns the [attribution option](#gridlayer-attribution).
        getAttribution: function() {
          return this.options.attribution;
        },
        _layerAdd: function(t) {
          var e = t.target;
          if (e.hasLayer(this)) {
            if (this._map = e, this._zoomAnimated = e._zoomAnimated, this.getEvents) {
              var i = this.getEvents();
              e.on(i, this), this.once("remove", function() {
                e.off(i, this);
              }, this);
            }
            this.onAdd(e), this.fire("add"), e.fire("layeradd", { layer: this });
          }
        }
      });
      G.include({
        // @method addLayer(layer: Layer): this
        // Adds the given layer to the map
        addLayer: function(t) {
          if (!t._layerAdd)
            throw new Error("The provided object is not a Layer.");
          var e = d(t);
          return this._layers[e] ? this : (this._layers[e] = t, t._mapToAdd = this, t.beforeAdd && t.beforeAdd(this), this.whenReady(t._layerAdd, t), this);
        },
        // @method removeLayer(layer: Layer): this
        // Removes the given layer from the map.
        removeLayer: function(t) {
          var e = d(t);
          return this._layers[e] ? (this._loaded && t.onRemove(this), delete this._layers[e], this._loaded && (this.fire("layerremove", { layer: t }), t.fire("remove")), t._map = t._mapToAdd = null, this) : this;
        },
        // @method hasLayer(layer: Layer): Boolean
        // Returns `true` if the given layer is currently added to the map
        hasLayer: function(t) {
          return d(t) in this._layers;
        },
        /* @method eachLayer(fn: Function, context?: Object): this
         * Iterates over the layers of the map, optionally specifying context of the iterator function.
         * ```
         * map.eachLayer(function(layer){
         *     layer.bindPopup('Hello');
         * });
         * ```
         */
        eachLayer: function(t, e) {
          for (var i in this._layers)
            t.call(e, this._layers[i]);
          return this;
        },
        _addLayers: function(t) {
          t = t ? I(t) ? t : [t] : [];
          for (var e = 0, i = t.length; e < i; e++)
            this.addLayer(t[e]);
        },
        _addZoomLimit: function(t) {
          (!isNaN(t.options.maxZoom) || !isNaN(t.options.minZoom)) && (this._zoomBoundLayers[d(t)] = t, this._updateZoomLevels());
        },
        _removeZoomLimit: function(t) {
          var e = d(t);
          this._zoomBoundLayers[e] && (delete this._zoomBoundLayers[e], this._updateZoomLevels());
        },
        _updateZoomLevels: function() {
          var t = 1 / 0, e = -1 / 0, i = this._getZoomSpan();
          for (var n in this._zoomBoundLayers) {
            var r = this._zoomBoundLayers[n].options;
            t = r.minZoom === void 0 ? t : Math.min(t, r.minZoom), e = r.maxZoom === void 0 ? e : Math.max(e, r.maxZoom);
          }
          this._layersMaxZoom = e === -1 / 0 ? void 0 : e, this._layersMinZoom = t === 1 / 0 ? void 0 : t, i !== this._getZoomSpan() && this.fire("zoomlevelschange"), this.options.maxZoom === void 0 && this._layersMaxZoom && this.getZoom() > this._layersMaxZoom && this.setZoom(this._layersMaxZoom), this.options.minZoom === void 0 && this._layersMinZoom && this.getZoom() < this._layersMinZoom && this.setZoom(this._layersMinZoom);
        }
      });
      var Ft = gt.extend({
        initialize: function(t, e) {
          v(this, e), this._layers = {};
          var i, n;
          if (t)
            for (i = 0, n = t.length; i < n; i++)
              this.addLayer(t[i]);
        },
        // @method addLayer(layer: Layer): this
        // Adds the given layer to the group.
        addLayer: function(t) {
          var e = this.getLayerId(t);
          return this._layers[e] = t, this._map && this._map.addLayer(t), this;
        },
        // @method removeLayer(layer: Layer): this
        // Removes the given layer from the group.
        // @alternative
        // @method removeLayer(id: Number): this
        // Removes the layer with the given internal ID from the group.
        removeLayer: function(t) {
          var e = t in this._layers ? t : this.getLayerId(t);
          return this._map && this._layers[e] && this._map.removeLayer(this._layers[e]), delete this._layers[e], this;
        },
        // @method hasLayer(layer: Layer): Boolean
        // Returns `true` if the given layer is currently added to the group.
        // @alternative
        // @method hasLayer(id: Number): Boolean
        // Returns `true` if the given internal ID is currently added to the group.
        hasLayer: function(t) {
          var e = typeof t == "number" ? t : this.getLayerId(t);
          return e in this._layers;
        },
        // @method clearLayers(): this
        // Removes all the layers from the group.
        clearLayers: function() {
          return this.eachLayer(this.removeLayer, this);
        },
        // @method invoke(methodName: String, …): this
        // Calls `methodName` on every layer contained in this group, passing any
        // additional parameters. Has no effect if the layers contained do not
        // implement `methodName`.
        invoke: function(t) {
          var e = Array.prototype.slice.call(arguments, 1), i, n;
          for (i in this._layers)
            n = this._layers[i], n[t] && n[t].apply(n, e);
          return this;
        },
        onAdd: function(t) {
          this.eachLayer(t.addLayer, t);
        },
        onRemove: function(t) {
          this.eachLayer(t.removeLayer, t);
        },
        // @method eachLayer(fn: Function, context?: Object): this
        // Iterates over the layers of the group, optionally specifying context of the iterator function.
        // ```js
        // group.eachLayer(function (layer) {
        // 	layer.bindPopup('Hello');
        // });
        // ```
        eachLayer: function(t, e) {
          for (var i in this._layers)
            t.call(e, this._layers[i]);
          return this;
        },
        // @method getLayer(id: Number): Layer
        // Returns the layer with the given internal ID.
        getLayer: function(t) {
          return this._layers[t];
        },
        // @method getLayers(): Layer[]
        // Returns an array of all the layers added to the group.
        getLayers: function() {
          var t = [];
          return this.eachLayer(t.push, t), t;
        },
        // @method setZIndex(zIndex: Number): this
        // Calls `setZIndex` on every layer contained in this group, passing the z-index.
        setZIndex: function(t) {
          return this.invoke("setZIndex", t);
        },
        // @method getLayerId(layer: Layer): Number
        // Returns the internal ID for a layer
        getLayerId: function(t) {
          return d(t);
        }
      }), Do = function(t, e) {
        return new Ft(t, e);
      }, bt = Ft.extend({
        addLayer: function(t) {
          return this.hasLayer(t) ? this : (t.addEventParent(this), Ft.prototype.addLayer.call(this, t), this.fire("layeradd", { layer: t }));
        },
        removeLayer: function(t) {
          return this.hasLayer(t) ? (t in this._layers && (t = this._layers[t]), t.removeEventParent(this), Ft.prototype.removeLayer.call(this, t), this.fire("layerremove", { layer: t })) : this;
        },
        // @method setStyle(style: Path options): this
        // Sets the given path options to each layer of the group that has a `setStyle` method.
        setStyle: function(t) {
          return this.invoke("setStyle", t);
        },
        // @method bringToFront(): this
        // Brings the layer group to the top of all other layers
        bringToFront: function() {
          return this.invoke("bringToFront");
        },
        // @method bringToBack(): this
        // Brings the layer group to the back of all other layers
        bringToBack: function() {
          return this.invoke("bringToBack");
        },
        // @method getBounds(): LatLngBounds
        // Returns the LatLngBounds of the Feature Group (created from bounds and coordinates of its children).
        getBounds: function() {
          var t = new ut();
          for (var e in this._layers) {
            var i = this._layers[e];
            t.extend(i.getBounds ? i.getBounds() : i.getLatLng());
          }
          return t;
        }
      }), Ro = function(t, e) {
        return new bt(t, e);
      }, Wt = xt.extend({
        /* @section
         * @aka Icon options
         *
         * @option iconUrl: String = null
         * **(required)** The URL to the icon image (absolute or relative to your script path).
         *
         * @option iconRetinaUrl: String = null
         * The URL to a retina sized version of the icon image (absolute or relative to your
         * script path). Used for Retina screen devices.
         *
         * @option iconSize: Point = null
         * Size of the icon image in pixels.
         *
         * @option iconAnchor: Point = null
         * The coordinates of the "tip" of the icon (relative to its top left corner). The icon
         * will be aligned so that this point is at the marker's geographical location. Centered
         * by default if size is specified, also can be set in CSS with negative margins.
         *
         * @option popupAnchor: Point = [0, 0]
         * The coordinates of the point from which popups will "open", relative to the icon anchor.
         *
         * @option tooltipAnchor: Point = [0, 0]
         * The coordinates of the point from which tooltips will "open", relative to the icon anchor.
         *
         * @option shadowUrl: String = null
         * The URL to the icon shadow image. If not specified, no shadow image will be created.
         *
         * @option shadowRetinaUrl: String = null
         *
         * @option shadowSize: Point = null
         * Size of the shadow image in pixels.
         *
         * @option shadowAnchor: Point = null
         * The coordinates of the "tip" of the shadow (relative to its top left corner) (the same
         * as iconAnchor if not specified).
         *
         * @option className: String = ''
         * A custom class name to assign to both icon and shadow images. Empty by default.
         */
        options: {
          popupAnchor: [0, 0],
          tooltipAnchor: [0, 0],
          // @option crossOrigin: Boolean|String = false
          // Whether the crossOrigin attribute will be added to the tiles.
          // If a String is provided, all tiles will have their crossOrigin attribute set to the String provided. This is needed if you want to access tile pixel data.
          // Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
          crossOrigin: !1
        },
        initialize: function(t) {
          v(this, t);
        },
        // @method createIcon(oldIcon?: HTMLElement): HTMLElement
        // Called internally when the icon has to be shown, returns a `<img>` HTML element
        // styled according to the options.
        createIcon: function(t) {
          return this._createIcon("icon", t);
        },
        // @method createShadow(oldIcon?: HTMLElement): HTMLElement
        // As `createIcon`, but for the shadow beneath it.
        createShadow: function(t) {
          return this._createIcon("shadow", t);
        },
        _createIcon: function(t, e) {
          var i = this._getIconUrl(t);
          if (!i) {
            if (t === "icon")
              throw new Error("iconUrl not set in Icon options (see the docs).");
            return null;
          }
          var n = this._createImg(i, e && e.tagName === "IMG" ? e : null);
          return this._setIconStyles(n, t), (this.options.crossOrigin || this.options.crossOrigin === "") && (n.crossOrigin = this.options.crossOrigin === !0 ? "" : this.options.crossOrigin), n;
        },
        _setIconStyles: function(t, e) {
          var i = this.options, n = i[e + "Size"];
          typeof n == "number" && (n = [n, n]);
          var r = E(n), h = E(e === "shadow" && i.shadowAnchor || i.iconAnchor || r && r.divideBy(2, !0));
          t.className = "leaflet-marker-" + e + " " + (i.className || ""), h && (t.style.marginLeft = -h.x + "px", t.style.marginTop = -h.y + "px"), r && (t.style.width = r.x + "px", t.style.height = r.y + "px");
        },
        _createImg: function(t, e) {
          return e = e || document.createElement("img"), e.src = t, e;
        },
        _getIconUrl: function(t) {
          return A.retina && this.options[t + "RetinaUrl"] || this.options[t + "Url"];
        }
      });
      function No(t) {
        return new Wt(t);
      }
      var re = Wt.extend({
        options: {
          iconUrl: "marker-icon.png",
          iconRetinaUrl: "marker-icon-2x.png",
          shadowUrl: "marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          tooltipAnchor: [16, -28],
          shadowSize: [41, 41]
        },
        _getIconUrl: function(t) {
          return typeof re.imagePath != "string" && (re.imagePath = this._detectIconPath()), (this.options.imagePath || re.imagePath) + Wt.prototype._getIconUrl.call(this, t);
        },
        _stripUrl: function(t) {
          var e = function(i, n, r) {
            var h = n.exec(i);
            return h && h[r];
          };
          return t = e(t, /^url\((['"])?(.+)\1\)$/, 2), t && e(t, /^(.*)marker-icon\.png$/, 1);
        },
        _detectIconPath: function() {
          var t = F("div", "leaflet-default-icon-path", document.body), e = Qt(t, "background-image") || Qt(t, "backgroundImage");
          if (document.body.removeChild(t), e = this._stripUrl(e), e)
            return e;
          var i = document.querySelector('link[href$="leaflet.css"]');
          return i ? i.href.substring(0, i.href.length - 11 - 1) : "";
        }
      }), sn = Lt.extend({
        initialize: function(t) {
          this._marker = t;
        },
        addHooks: function() {
          var t = this._marker._icon;
          this._draggable || (this._draggable = new It(t, t, !0)), this._draggable.on({
            dragstart: this._onDragStart,
            predrag: this._onPreDrag,
            drag: this._onDrag,
            dragend: this._onDragEnd
          }, this).enable(), D(t, "leaflet-marker-draggable");
        },
        removeHooks: function() {
          this._draggable.off({
            dragstart: this._onDragStart,
            predrag: this._onPreDrag,
            drag: this._onDrag,
            dragend: this._onDragEnd
          }, this).disable(), this._marker._icon && Y(this._marker._icon, "leaflet-marker-draggable");
        },
        moved: function() {
          return this._draggable && this._draggable._moved;
        },
        _adjustPan: function(t) {
          var e = this._marker, i = e._map, n = this._marker.options.autoPanSpeed, r = this._marker.options.autoPanPadding, h = Bt(e._icon), _ = i.getPixelBounds(), P = i.getPixelOrigin(), x = ht(
            _.min._subtract(P).add(r),
            _.max._subtract(P).subtract(r)
          );
          if (!x.contains(h)) {
            var S = E(
              (Math.max(x.max.x, h.x) - x.max.x) / (_.max.x - x.max.x) - (Math.min(x.min.x, h.x) - x.min.x) / (_.min.x - x.min.x),
              (Math.max(x.max.y, h.y) - x.max.y) / (_.max.y - x.max.y) - (Math.min(x.min.y, h.y) - x.min.y) / (_.min.y - x.min.y)
            ).multiplyBy(n);
            i.panBy(S, { animate: !1 }), this._draggable._newPos._add(S), this._draggable._startPos._add(S), $(e._icon, this._draggable._newPos), this._onDrag(t), this._panRequest = j(this._adjustPan.bind(this, t));
          }
        },
        _onDragStart: function() {
          this._oldLatLng = this._marker.getLatLng(), this._marker.closePopup && this._marker.closePopup(), this._marker.fire("movestart").fire("dragstart");
        },
        _onPreDrag: function(t) {
          this._marker.options.autoPan && (rt(this._panRequest), this._panRequest = j(this._adjustPan.bind(this, t)));
        },
        _onDrag: function(t) {
          var e = this._marker, i = e._shadow, n = Bt(e._icon), r = e._map.layerPointToLatLng(n);
          i && $(i, n), e._latlng = r, t.latlng = r, t.oldLatLng = this._oldLatLng, e.fire("move", t).fire("drag", t);
        },
        _onDragEnd: function(t) {
          rt(this._panRequest), delete this._oldLatLng, this._marker.fire("moveend").fire("dragend", t);
        }
      }), ve = gt.extend({
        // @section
        // @aka Marker options
        options: {
          // @option icon: Icon = *
          // Icon instance to use for rendering the marker.
          // See [Icon documentation](#L.Icon) for details on how to customize the marker icon.
          // If not specified, a common instance of `L.Icon.Default` is used.
          icon: new re(),
          // Option inherited from "Interactive layer" abstract class
          interactive: !0,
          // @option keyboard: Boolean = true
          // Whether the marker can be tabbed to with a keyboard and clicked by pressing enter.
          keyboard: !0,
          // @option title: String = ''
          // Text for the browser tooltip that appear on marker hover (no tooltip by default).
          // [Useful for accessibility](https://leafletjs.com/examples/accessibility/#markers-must-be-labelled).
          title: "",
          // @option alt: String = 'Marker'
          // Text for the `alt` attribute of the icon image.
          // [Useful for accessibility](https://leafletjs.com/examples/accessibility/#markers-must-be-labelled).
          alt: "Marker",
          // @option zIndexOffset: Number = 0
          // By default, marker images zIndex is set automatically based on its latitude. Use this option if you want to put the marker on top of all others (or below), specifying a high value like `1000` (or high negative value, respectively).
          zIndexOffset: 0,
          // @option opacity: Number = 1.0
          // The opacity of the marker.
          opacity: 1,
          // @option riseOnHover: Boolean = false
          // If `true`, the marker will get on top of others when you hover the mouse over it.
          riseOnHover: !1,
          // @option riseOffset: Number = 250
          // The z-index offset used for the `riseOnHover` feature.
          riseOffset: 250,
          // @option pane: String = 'markerPane'
          // `Map pane` where the markers icon will be added.
          pane: "markerPane",
          // @option shadowPane: String = 'shadowPane'
          // `Map pane` where the markers shadow will be added.
          shadowPane: "shadowPane",
          // @option bubblingMouseEvents: Boolean = false
          // When `true`, a mouse event on this marker will trigger the same event on the map
          // (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
          bubblingMouseEvents: !1,
          // @option autoPanOnFocus: Boolean = true
          // When `true`, the map will pan whenever the marker is focused (via
          // e.g. pressing `tab` on the keyboard) to ensure the marker is
          // visible within the map's bounds
          autoPanOnFocus: !0,
          // @section Draggable marker options
          // @option draggable: Boolean = false
          // Whether the marker is draggable with mouse/touch or not.
          draggable: !1,
          // @option autoPan: Boolean = false
          // Whether to pan the map when dragging this marker near its edge or not.
          autoPan: !1,
          // @option autoPanPadding: Point = Point(50, 50)
          // Distance (in pixels to the left/right and to the top/bottom) of the
          // map edge to start panning the map.
          autoPanPadding: [50, 50],
          // @option autoPanSpeed: Number = 10
          // Number of pixels the map should pan by.
          autoPanSpeed: 10
        },
        /* @section
         *
         * In addition to [shared layer methods](#Layer) like `addTo()` and `remove()` and [popup methods](#Popup) like bindPopup() you can also use the following methods:
         */
        initialize: function(t, e) {
          v(this, e), this._latlng = N(t);
        },
        onAdd: function(t) {
          this._zoomAnimated = this._zoomAnimated && t.options.markerZoomAnimation, this._zoomAnimated && t.on("zoomanim", this._animateZoom, this), this._initIcon(), this.update();
        },
        onRemove: function(t) {
          this.dragging && this.dragging.enabled() && (this.options.draggable = !0, this.dragging.removeHooks()), delete this.dragging, this._zoomAnimated && t.off("zoomanim", this._animateZoom, this), this._removeIcon(), this._removeShadow();
        },
        getEvents: function() {
          return {
            zoom: this.update,
            viewreset: this.update
          };
        },
        // @method getLatLng: LatLng
        // Returns the current geographical position of the marker.
        getLatLng: function() {
          return this._latlng;
        },
        // @method setLatLng(latlng: LatLng): this
        // Changes the marker position to the given point.
        setLatLng: function(t) {
          var e = this._latlng;
          return this._latlng = N(t), this.update(), this.fire("move", { oldLatLng: e, latlng: this._latlng });
        },
        // @method setZIndexOffset(offset: Number): this
        // Changes the [zIndex offset](#marker-zindexoffset) of the marker.
        setZIndexOffset: function(t) {
          return this.options.zIndexOffset = t, this.update();
        },
        // @method getIcon: Icon
        // Returns the current icon used by the marker
        getIcon: function() {
          return this.options.icon;
        },
        // @method setIcon(icon: Icon): this
        // Changes the marker icon.
        setIcon: function(t) {
          return this.options.icon = t, this._map && (this._initIcon(), this.update()), this._popup && this.bindPopup(this._popup, this._popup.options), this;
        },
        getElement: function() {
          return this._icon;
        },
        update: function() {
          if (this._icon && this._map) {
            var t = this._map.latLngToLayerPoint(this._latlng).round();
            this._setPos(t);
          }
          return this;
        },
        _initIcon: function() {
          var t = this.options, e = "leaflet-zoom-" + (this._zoomAnimated ? "animated" : "hide"), i = t.icon.createIcon(this._icon), n = !1;
          i !== this._icon && (this._icon && this._removeIcon(), n = !0, t.title && (i.title = t.title), i.tagName === "IMG" && (i.alt = t.alt || "")), D(i, e), t.keyboard && (i.tabIndex = "0", i.setAttribute("role", "button")), this._icon = i, t.riseOnHover && this.on({
            mouseover: this._bringToFront,
            mouseout: this._resetZIndex
          }), this.options.autoPanOnFocus && Z(i, "focus", this._panOnFocus, this);
          var r = t.icon.createShadow(this._shadow), h = !1;
          r !== this._shadow && (this._removeShadow(), h = !0), r && (D(r, e), r.alt = ""), this._shadow = r, t.opacity < 1 && this._updateOpacity(), n && this.getPane().appendChild(this._icon), this._initInteraction(), r && h && this.getPane(t.shadowPane).appendChild(this._shadow);
        },
        _removeIcon: function() {
          this.options.riseOnHover && this.off({
            mouseover: this._bringToFront,
            mouseout: this._resetZIndex
          }), this.options.autoPanOnFocus && q(this._icon, "focus", this._panOnFocus, this), J(this._icon), this.removeInteractiveTarget(this._icon), this._icon = null;
        },
        _removeShadow: function() {
          this._shadow && J(this._shadow), this._shadow = null;
        },
        _setPos: function(t) {
          this._icon && $(this._icon, t), this._shadow && $(this._shadow, t), this._zIndex = t.y + this.options.zIndexOffset, this._resetZIndex();
        },
        _updateZIndex: function(t) {
          this._icon && (this._icon.style.zIndex = this._zIndex + t);
        },
        _animateZoom: function(t) {
          var e = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center).round();
          this._setPos(e);
        },
        _initInteraction: function() {
          if (this.options.interactive && (D(this._icon, "leaflet-interactive"), this.addInteractiveTarget(this._icon), sn)) {
            var t = this.options.draggable;
            this.dragging && (t = this.dragging.enabled(), this.dragging.disable()), this.dragging = new sn(this), t && this.dragging.enable();
          }
        },
        // @method setOpacity(opacity: Number): this
        // Changes the opacity of the marker.
        setOpacity: function(t) {
          return this.options.opacity = t, this._map && this._updateOpacity(), this;
        },
        _updateOpacity: function() {
          var t = this.options.opacity;
          this._icon && ft(this._icon, t), this._shadow && ft(this._shadow, t);
        },
        _bringToFront: function() {
          this._updateZIndex(this.options.riseOffset);
        },
        _resetZIndex: function() {
          this._updateZIndex(0);
        },
        _panOnFocus: function() {
          var t = this._map;
          if (t) {
            var e = this.options.icon.options, i = e.iconSize ? E(e.iconSize) : E(0, 0), n = e.iconAnchor ? E(e.iconAnchor) : E(0, 0);
            t.panInside(this._latlng, {
              paddingTopLeft: n,
              paddingBottomRight: i.subtract(n)
            });
          }
        },
        _getPopupAnchor: function() {
          return this.options.icon.options.popupAnchor;
        },
        _getTooltipAnchor: function() {
          return this.options.icon.options.tooltipAnchor;
        }
      });
      function Go(t, e) {
        return new ve(t, e);
      }
      var zt = gt.extend({
        // @section
        // @aka Path options
        options: {
          // @option stroke: Boolean = true
          // Whether to draw stroke along the path. Set it to `false` to disable borders on polygons or circles.
          stroke: !0,
          // @option color: String = '#3388ff'
          // Stroke color
          color: "#3388ff",
          // @option weight: Number = 3
          // Stroke width in pixels
          weight: 3,
          // @option opacity: Number = 1.0
          // Stroke opacity
          opacity: 1,
          // @option lineCap: String= 'round'
          // A string that defines [shape to be used at the end](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linecap) of the stroke.
          lineCap: "round",
          // @option lineJoin: String = 'round'
          // A string that defines [shape to be used at the corners](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linejoin) of the stroke.
          lineJoin: "round",
          // @option dashArray: String = null
          // A string that defines the stroke [dash pattern](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dasharray). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
          dashArray: null,
          // @option dashOffset: String = null
          // A string that defines the [distance into the dash pattern to start the dash](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dashoffset). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
          dashOffset: null,
          // @option fill: Boolean = depends
          // Whether to fill the path with color. Set it to `false` to disable filling on polygons or circles.
          fill: !1,
          // @option fillColor: String = *
          // Fill color. Defaults to the value of the [`color`](#path-color) option
          fillColor: null,
          // @option fillOpacity: Number = 0.2
          // Fill opacity.
          fillOpacity: 0.2,
          // @option fillRule: String = 'evenodd'
          // A string that defines [how the inside of a shape](https://developer.mozilla.org/docs/Web/SVG/Attribute/fill-rule) is determined.
          fillRule: "evenodd",
          // className: '',
          // Option inherited from "Interactive layer" abstract class
          interactive: !0,
          // @option bubblingMouseEvents: Boolean = true
          // When `true`, a mouse event on this path will trigger the same event on the map
          // (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
          bubblingMouseEvents: !0
        },
        beforeAdd: function(t) {
          this._renderer = t.getRenderer(this);
        },
        onAdd: function() {
          this._renderer._initPath(this), this._reset(), this._renderer._addPath(this);
        },
        onRemove: function() {
          this._renderer._removePath(this);
        },
        // @method redraw(): this
        // Redraws the layer. Sometimes useful after you changed the coordinates that the path uses.
        redraw: function() {
          return this._map && this._renderer._updatePath(this), this;
        },
        // @method setStyle(style: Path options): this
        // Changes the appearance of a Path based on the options in the `Path options` object.
        setStyle: function(t) {
          return v(this, t), this._renderer && (this._renderer._updateStyle(this), this.options.stroke && t && Object.prototype.hasOwnProperty.call(t, "weight") && this._updateBounds()), this;
        },
        // @method bringToFront(): this
        // Brings the layer to the top of all path layers.
        bringToFront: function() {
          return this._renderer && this._renderer._bringToFront(this), this;
        },
        // @method bringToBack(): this
        // Brings the layer to the bottom of all path layers.
        bringToBack: function() {
          return this._renderer && this._renderer._bringToBack(this), this;
        },
        getElement: function() {
          return this._path;
        },
        _reset: function() {
          this._project(), this._update();
        },
        _clickTolerance: function() {
          return (this.options.stroke ? this.options.weight / 2 : 0) + (this._renderer.options.tolerance || 0);
        }
      }), ye = zt.extend({
        // @section
        // @aka CircleMarker options
        options: {
          fill: !0,
          // @option radius: Number = 10
          // Radius of the circle marker, in pixels
          radius: 10
        },
        initialize: function(t, e) {
          v(this, e), this._latlng = N(t), this._radius = this.options.radius;
        },
        // @method setLatLng(latLng: LatLng): this
        // Sets the position of a circle marker to a new location.
        setLatLng: function(t) {
          var e = this._latlng;
          return this._latlng = N(t), this.redraw(), this.fire("move", { oldLatLng: e, latlng: this._latlng });
        },
        // @method getLatLng(): LatLng
        // Returns the current geographical position of the circle marker
        getLatLng: function() {
          return this._latlng;
        },
        // @method setRadius(radius: Number): this
        // Sets the radius of a circle marker. Units are in pixels.
        setRadius: function(t) {
          return this.options.radius = this._radius = t, this.redraw();
        },
        // @method getRadius(): Number
        // Returns the current radius of the circle
        getRadius: function() {
          return this._radius;
        },
        setStyle: function(t) {
          var e = t && t.radius || this._radius;
          return zt.prototype.setStyle.call(this, t), this.setRadius(e), this;
        },
        _project: function() {
          this._point = this._map.latLngToLayerPoint(this._latlng), this._updateBounds();
        },
        _updateBounds: function() {
          var t = this._radius, e = this._radiusY || t, i = this._clickTolerance(), n = [t + i, e + i];
          this._pxBounds = new V(this._point.subtract(n), this._point.add(n));
        },
        _update: function() {
          this._map && this._updatePath();
        },
        _updatePath: function() {
          this._renderer._updateCircle(this);
        },
        _empty: function() {
          return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
        },
        // Needed by the `Canvas` renderer for interactivity
        _containsPoint: function(t) {
          return t.distanceTo(this._point) <= this._radius + this._clickTolerance();
        }
      });
      function Uo(t, e) {
        return new ye(t, e);
      }
      var ui = ye.extend({
        initialize: function(t, e, i) {
          if (typeof e == "number" && (e = y({}, i, { radius: e })), v(this, e), this._latlng = N(t), isNaN(this.options.radius))
            throw new Error("Circle radius cannot be NaN");
          this._mRadius = this.options.radius;
        },
        // @method setRadius(radius: Number): this
        // Sets the radius of a circle. Units are in meters.
        setRadius: function(t) {
          return this._mRadius = t, this.redraw();
        },
        // @method getRadius(): Number
        // Returns the current radius of a circle. Units are in meters.
        getRadius: function() {
          return this._mRadius;
        },
        // @method getBounds(): LatLngBounds
        // Returns the `LatLngBounds` of the path.
        getBounds: function() {
          var t = [this._radius, this._radiusY || this._radius];
          return new ut(
            this._map.layerPointToLatLng(this._point.subtract(t)),
            this._map.layerPointToLatLng(this._point.add(t))
          );
        },
        setStyle: zt.prototype.setStyle,
        _project: function() {
          var t = this._latlng.lng, e = this._latlng.lat, i = this._map, n = i.options.crs;
          if (n.distance === kt.distance) {
            var r = Math.PI / 180, h = this._mRadius / kt.R / r, _ = i.project([e + h, t]), P = i.project([e - h, t]), x = _.add(P).divideBy(2), S = i.unproject(x).lat, z = Math.acos((Math.cos(h * r) - Math.sin(e * r) * Math.sin(S * r)) / (Math.cos(e * r) * Math.cos(S * r))) / r;
            (isNaN(z) || z === 0) && (z = h / Math.cos(Math.PI / 180 * e)), this._point = x.subtract(i.getPixelOrigin()), this._radius = isNaN(z) ? 0 : x.x - i.project([S, t - z]).x, this._radiusY = x.y - _.y;
          } else {
            var O = n.unproject(n.project(this._latlng).subtract([this._mRadius, 0]));
            this._point = i.latLngToLayerPoint(this._latlng), this._radius = this._point.x - i.latLngToLayerPoint(O).x;
          }
          this._updateBounds();
        }
      });
      function Ho(t, e, i) {
        return new ui(t, e, i);
      }
      var Ct = zt.extend({
        // @section
        // @aka Polyline options
        options: {
          // @option smoothFactor: Number = 1.0
          // How much to simplify the polyline on each zoom level. More means
          // better performance and smoother look, and less means more accurate representation.
          smoothFactor: 1,
          // @option noClip: Boolean = false
          // Disable polyline clipping.
          noClip: !1
        },
        initialize: function(t, e) {
          v(this, e), this._setLatLngs(t);
        },
        // @method getLatLngs(): LatLng[]
        // Returns an array of the points in the path, or nested arrays of points in case of multi-polyline.
        getLatLngs: function() {
          return this._latlngs;
        },
        // @method setLatLngs(latlngs: LatLng[]): this
        // Replaces all the points in the polyline with the given array of geographical points.
        setLatLngs: function(t) {
          return this._setLatLngs(t), this.redraw();
        },
        // @method isEmpty(): Boolean
        // Returns `true` if the Polyline has no LatLngs.
        isEmpty: function() {
          return !this._latlngs.length;
        },
        // @method closestLayerPoint(p: Point): Point
        // Returns the point closest to `p` on the Polyline.
        closestLayerPoint: function(t) {
          for (var e = 1 / 0, i = null, n = se, r, h, _ = 0, P = this._parts.length; _ < P; _++)
            for (var x = this._parts[_], S = 1, z = x.length; S < z; S++) {
              r = x[S - 1], h = x[S];
              var O = n(t, r, h, !0);
              O < e && (e = O, i = n(t, r, h));
            }
          return i && (i.distance = Math.sqrt(e)), i;
        },
        // @method getCenter(): LatLng
        // Returns the center ([centroid](https://en.wikipedia.org/wiki/Centroid)) of the polyline.
        getCenter: function() {
          if (!this._map)
            throw new Error("Must add layer to map before using getCenter()");
          return nn(this._defaultShape(), this._map.options.crs);
        },
        // @method getBounds(): LatLngBounds
        // Returns the `LatLngBounds` of the path.
        getBounds: function() {
          return this._bounds;
        },
        // @method addLatLng(latlng: LatLng, latlngs?: LatLng[]): this
        // Adds a given point to the polyline. By default, adds to the first ring of
        // the polyline in case of a multi-polyline, but can be overridden by passing
        // a specific ring as a LatLng array (that you can earlier access with [`getLatLngs`](#polyline-getlatlngs)).
        addLatLng: function(t, e) {
          return e = e || this._defaultShape(), t = N(t), e.push(t), this._bounds.extend(t), this.redraw();
        },
        _setLatLngs: function(t) {
          this._bounds = new ut(), this._latlngs = this._convertLatLngs(t);
        },
        _defaultShape: function() {
          return _t(this._latlngs) ? this._latlngs : this._latlngs[0];
        },
        // recursively convert latlngs input into actual LatLng instances; calculate bounds along the way
        _convertLatLngs: function(t) {
          for (var e = [], i = _t(t), n = 0, r = t.length; n < r; n++)
            i ? (e[n] = N(t[n]), this._bounds.extend(e[n])) : e[n] = this._convertLatLngs(t[n]);
          return e;
        },
        _project: function() {
          var t = new V();
          this._rings = [], this._projectLatlngs(this._latlngs, this._rings, t), this._bounds.isValid() && t.isValid() && (this._rawPxBounds = t, this._updateBounds());
        },
        _updateBounds: function() {
          var t = this._clickTolerance(), e = new B(t, t);
          this._rawPxBounds && (this._pxBounds = new V([
            this._rawPxBounds.min.subtract(e),
            this._rawPxBounds.max.add(e)
          ]));
        },
        // recursively turns latlngs into a set of rings with projected coordinates
        _projectLatlngs: function(t, e, i) {
          var n = t[0] instanceof W, r = t.length, h, _;
          if (n) {
            for (_ = [], h = 0; h < r; h++)
              _[h] = this._map.latLngToLayerPoint(t[h]), i.extend(_[h]);
            e.push(_);
          } else
            for (h = 0; h < r; h++)
              this._projectLatlngs(t[h], e, i);
        },
        // clip polyline by renderer bounds so that we have less to render for performance
        _clipPoints: function() {
          var t = this._renderer._bounds;
          if (this._parts = [], !(!this._pxBounds || !this._pxBounds.intersects(t))) {
            if (this.options.noClip) {
              this._parts = this._rings;
              return;
            }
            var e = this._parts, i, n, r, h, _, P, x;
            for (i = 0, r = 0, h = this._rings.length; i < h; i++)
              for (x = this._rings[i], n = 0, _ = x.length; n < _ - 1; n++)
                P = tn(x[n], x[n + 1], t, n, !0), P && (e[r] = e[r] || [], e[r].push(P[0]), (P[1] !== x[n + 1] || n === _ - 2) && (e[r].push(P[1]), r++));
          }
        },
        // simplify each clipped part of the polyline for performance
        _simplifyPoints: function() {
          for (var t = this._parts, e = this.options.smoothFactor, i = 0, n = t.length; i < n; i++)
            t[i] = Xi(t[i], e);
        },
        _update: function() {
          this._map && (this._clipPoints(), this._simplifyPoints(), this._updatePath());
        },
        _updatePath: function() {
          this._renderer._updatePoly(this);
        },
        // Needed by the `Canvas` renderer for interactivity
        _containsPoint: function(t, e) {
          var i, n, r, h, _, P, x = this._clickTolerance();
          if (!this._pxBounds || !this._pxBounds.contains(t))
            return !1;
          for (i = 0, h = this._parts.length; i < h; i++)
            for (P = this._parts[i], n = 0, _ = P.length, r = _ - 1; n < _; r = n++)
              if (!(!e && n === 0) && $i(t, P[r], P[n]) <= x)
                return !0;
          return !1;
        }
      });
      function Fo(t, e) {
        return new Ct(t, e);
      }
      Ct._flat = en;
      var qt = Ct.extend({
        options: {
          fill: !0
        },
        isEmpty: function() {
          return !this._latlngs.length || !this._latlngs[0].length;
        },
        // @method getCenter(): LatLng
        // Returns the center ([centroid](http://en.wikipedia.org/wiki/Centroid)) of the Polygon.
        getCenter: function() {
          if (!this._map)
            throw new Error("Must add layer to map before using getCenter()");
          return Yi(this._defaultShape(), this._map.options.crs);
        },
        _convertLatLngs: function(t) {
          var e = Ct.prototype._convertLatLngs.call(this, t), i = e.length;
          return i >= 2 && e[0] instanceof W && e[0].equals(e[i - 1]) && e.pop(), e;
        },
        _setLatLngs: function(t) {
          Ct.prototype._setLatLngs.call(this, t), _t(this._latlngs) && (this._latlngs = [this._latlngs]);
        },
        _defaultShape: function() {
          return _t(this._latlngs[0]) ? this._latlngs[0] : this._latlngs[0][0];
        },
        _clipPoints: function() {
          var t = this._renderer._bounds, e = this.options.weight, i = new B(e, e);
          if (t = new V(t.min.subtract(i), t.max.add(i)), this._parts = [], !(!this._pxBounds || !this._pxBounds.intersects(t))) {
            if (this.options.noClip) {
              this._parts = this._rings;
              return;
            }
            for (var n = 0, r = this._rings.length, h; n < r; n++)
              h = Ki(this._rings[n], t, !0), h.length && this._parts.push(h);
          }
        },
        _updatePath: function() {
          this._renderer._updatePoly(this, !0);
        },
        // Needed by the `Canvas` renderer for interactivity
        _containsPoint: function(t) {
          var e = !1, i, n, r, h, _, P, x, S;
          if (!this._pxBounds || !this._pxBounds.contains(t))
            return !1;
          for (h = 0, x = this._parts.length; h < x; h++)
            for (i = this._parts[h], _ = 0, S = i.length, P = S - 1; _ < S; P = _++)
              n = i[_], r = i[P], n.y > t.y != r.y > t.y && t.x < (r.x - n.x) * (t.y - n.y) / (r.y - n.y) + n.x && (e = !e);
          return e || Ct.prototype._containsPoint.call(this, t, !0);
        }
      });
      function Wo(t, e) {
        return new qt(t, e);
      }
      var Tt = bt.extend({
        /* @section
         * @aka GeoJSON options
         *
         * @option pointToLayer: Function = *
         * A `Function` defining how GeoJSON points spawn Leaflet layers. It is internally
         * called when data is added, passing the GeoJSON point feature and its `LatLng`.
         * The default is to spawn a default `Marker`:
         * ```js
         * function(geoJsonPoint, latlng) {
         * 	return L.marker(latlng);
         * }
         * ```
         *
         * @option style: Function = *
         * A `Function` defining the `Path options` for styling GeoJSON lines and polygons,
         * called internally when data is added.
         * The default value is to not override any defaults:
         * ```js
         * function (geoJsonFeature) {
         * 	return {}
         * }
         * ```
         *
         * @option onEachFeature: Function = *
         * A `Function` that will be called once for each created `Feature`, after it has
         * been created and styled. Useful for attaching events and popups to features.
         * The default is to do nothing with the newly created layers:
         * ```js
         * function (feature, layer) {}
         * ```
         *
         * @option filter: Function = *
         * A `Function` that will be used to decide whether to include a feature or not.
         * The default is to include all features:
         * ```js
         * function (geoJsonFeature) {
         * 	return true;
         * }
         * ```
         * Note: dynamically changing the `filter` option will have effect only on newly
         * added data. It will _not_ re-evaluate already included features.
         *
         * @option coordsToLatLng: Function = *
         * A `Function` that will be used for converting GeoJSON coordinates to `LatLng`s.
         * The default is the `coordsToLatLng` static method.
         *
         * @option markersInheritOptions: Boolean = false
         * Whether default Markers for "Point" type Features inherit from group options.
         */
        initialize: function(t, e) {
          v(this, e), this._layers = {}, t && this.addData(t);
        },
        // @method addData( <GeoJSON> data ): this
        // Adds a GeoJSON object to the layer.
        addData: function(t) {
          var e = I(t) ? t : t.features, i, n, r;
          if (e) {
            for (i = 0, n = e.length; i < n; i++)
              r = e[i], (r.geometries || r.geometry || r.features || r.coordinates) && this.addData(r);
            return this;
          }
          var h = this.options;
          if (h.filter && !h.filter(t))
            return this;
          var _ = Le(t, h);
          return _ ? (_.feature = xe(t), _.defaultOptions = _.options, this.resetStyle(_), h.onEachFeature && h.onEachFeature(t, _), this.addLayer(_)) : this;
        },
        // @method resetStyle( <Path> layer? ): this
        // Resets the given vector layer's style to the original GeoJSON style, useful for resetting style after hover events.
        // If `layer` is omitted, the style of all features in the current layer is reset.
        resetStyle: function(t) {
          return t === void 0 ? this.eachLayer(this.resetStyle, this) : (t.options = y({}, t.defaultOptions), this._setLayerStyle(t, this.options.style), this);
        },
        // @method setStyle( <Function> style ): this
        // Changes styles of GeoJSON vector layers with the given style function.
        setStyle: function(t) {
          return this.eachLayer(function(e) {
            this._setLayerStyle(e, t);
          }, this);
        },
        _setLayerStyle: function(t, e) {
          t.setStyle && (typeof e == "function" && (e = e(t.feature)), t.setStyle(e));
        }
      });
      function Le(t, e) {
        var i = t.type === "Feature" ? t.geometry : t, n = i ? i.coordinates : null, r = [], h = e && e.pointToLayer, _ = e && e.coordsToLatLng || li, P, x, S, z;
        if (!n && !i)
          return null;
        switch (i.type) {
          case "Point":
            return P = _(n), rn(h, t, P, e);
          case "MultiPoint":
            for (S = 0, z = n.length; S < z; S++)
              P = _(n[S]), r.push(rn(h, t, P, e));
            return new bt(r);
          case "LineString":
          case "MultiLineString":
            return x = we(n, i.type === "LineString" ? 0 : 1, _), new Ct(x, e);
          case "Polygon":
          case "MultiPolygon":
            return x = we(n, i.type === "Polygon" ? 1 : 2, _), new qt(x, e);
          case "GeometryCollection":
            for (S = 0, z = i.geometries.length; S < z; S++) {
              var O = Le({
                geometry: i.geometries[S],
                type: "Feature",
                properties: t.properties
              }, e);
              O && r.push(O);
            }
            return new bt(r);
          case "FeatureCollection":
            for (S = 0, z = i.features.length; S < z; S++) {
              var R = Le(i.features[S], e);
              R && r.push(R);
            }
            return new bt(r);
          default:
            throw new Error("Invalid GeoJSON object.");
        }
      }
      function rn(t, e, i, n) {
        return t ? t(e, i) : new ve(i, n && n.markersInheritOptions && n);
      }
      function li(t) {
        return new W(t[1], t[0], t[2]);
      }
      function we(t, e, i) {
        for (var n = [], r = 0, h = t.length, _; r < h; r++)
          _ = e ? we(t[r], e - 1, i) : (i || li)(t[r]), n.push(_);
        return n;
      }
      function ci(t, e) {
        return t = N(t), t.alt !== void 0 ? [b(t.lng, e), b(t.lat, e), b(t.alt, e)] : [b(t.lng, e), b(t.lat, e)];
      }
      function Pe(t, e, i, n) {
        for (var r = [], h = 0, _ = t.length; h < _; h++)
          r.push(e ? Pe(t[h], _t(t[h]) ? 0 : e - 1, i, n) : ci(t[h], n));
        return !e && i && r.length > 0 && r.push(r[0].slice()), r;
      }
      function jt(t, e) {
        return t.feature ? y({}, t.feature, { geometry: e }) : xe(e);
      }
      function xe(t) {
        return t.type === "Feature" || t.type === "FeatureCollection" ? t : {
          type: "Feature",
          properties: {},
          geometry: t
        };
      }
      var di = {
        toGeoJSON: function(t) {
          return jt(this, {
            type: "Point",
            coordinates: ci(this.getLatLng(), t)
          });
        }
      };
      ve.include(di), ui.include(di), ye.include(di), Ct.include({
        toGeoJSON: function(t) {
          var e = !_t(this._latlngs), i = Pe(this._latlngs, e ? 1 : 0, !1, t);
          return jt(this, {
            type: (e ? "Multi" : "") + "LineString",
            coordinates: i
          });
        }
      }), qt.include({
        toGeoJSON: function(t) {
          var e = !_t(this._latlngs), i = e && !_t(this._latlngs[0]), n = Pe(this._latlngs, i ? 2 : e ? 1 : 0, !0, t);
          return e || (n = [n]), jt(this, {
            type: (i ? "Multi" : "") + "Polygon",
            coordinates: n
          });
        }
      }), Ft.include({
        toMultiPoint: function(t) {
          var e = [];
          return this.eachLayer(function(i) {
            e.push(i.toGeoJSON(t).geometry.coordinates);
          }), jt(this, {
            type: "MultiPoint",
            coordinates: e
          });
        },
        // @method toGeoJSON(precision?: Number|false): Object
        // Coordinates values are rounded with [`formatNum`](#util-formatnum) function with given `precision`.
        // Returns a [`GeoJSON`](https://en.wikipedia.org/wiki/GeoJSON) representation of the layer group (as a GeoJSON `FeatureCollection`, `GeometryCollection`, or `MultiPoint`).
        toGeoJSON: function(t) {
          var e = this.feature && this.feature.geometry && this.feature.geometry.type;
          if (e === "MultiPoint")
            return this.toMultiPoint(t);
          var i = e === "GeometryCollection", n = [];
          return this.eachLayer(function(r) {
            if (r.toGeoJSON) {
              var h = r.toGeoJSON(t);
              if (i)
                n.push(h.geometry);
              else {
                var _ = xe(h);
                _.type === "FeatureCollection" ? n.push.apply(n, _.features) : n.push(_);
              }
            }
          }), i ? jt(this, {
            geometries: n,
            type: "GeometryCollection"
          }) : {
            type: "FeatureCollection",
            features: n
          };
        }
      });
      function an(t, e) {
        return new Tt(t, e);
      }
      var qo = an, Me = gt.extend({
        // @section
        // @aka ImageOverlay options
        options: {
          // @option opacity: Number = 1.0
          // The opacity of the image overlay.
          opacity: 1,
          // @option alt: String = ''
          // Text for the `alt` attribute of the image (useful for accessibility).
          alt: "",
          // @option interactive: Boolean = false
          // If `true`, the image overlay will emit [mouse events](#interactive-layer) when clicked or hovered.
          interactive: !1,
          // @option crossOrigin: Boolean|String = false
          // Whether the crossOrigin attribute will be added to the image.
          // If a String is provided, the image will have its crossOrigin attribute set to the String provided. This is needed if you want to access image pixel data.
          // Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
          crossOrigin: !1,
          // @option errorOverlayUrl: String = ''
          // URL to the overlay image to show in place of the overlay that failed to load.
          errorOverlayUrl: "",
          // @option zIndex: Number = 1
          // The explicit [zIndex](https://developer.mozilla.org/docs/Web/CSS/CSS_Positioning/Understanding_z_index) of the overlay layer.
          zIndex: 1,
          // @option className: String = ''
          // A custom class name to assign to the image. Empty by default.
          className: ""
        },
        initialize: function(t, e, i) {
          this._url = t, this._bounds = X(e), v(this, i);
        },
        onAdd: function() {
          this._image || (this._initImage(), this.options.opacity < 1 && this._updateOpacity()), this.options.interactive && (D(this._image, "leaflet-interactive"), this.addInteractiveTarget(this._image)), this.getPane().appendChild(this._image), this._reset();
        },
        onRemove: function() {
          J(this._image), this.options.interactive && this.removeInteractiveTarget(this._image);
        },
        // @method setOpacity(opacity: Number): this
        // Sets the opacity of the overlay.
        setOpacity: function(t) {
          return this.options.opacity = t, this._image && this._updateOpacity(), this;
        },
        setStyle: function(t) {
          return t.opacity && this.setOpacity(t.opacity), this;
        },
        // @method bringToFront(): this
        // Brings the layer to the top of all overlays.
        bringToFront: function() {
          return this._map && Ut(this._image), this;
        },
        // @method bringToBack(): this
        // Brings the layer to the bottom of all overlays.
        bringToBack: function() {
          return this._map && Ht(this._image), this;
        },
        // @method setUrl(url: String): this
        // Changes the URL of the image.
        setUrl: function(t) {
          return this._url = t, this._image && (this._image.src = t), this;
        },
        // @method setBounds(bounds: LatLngBounds): this
        // Update the bounds that this ImageOverlay covers
        setBounds: function(t) {
          return this._bounds = X(t), this._map && this._reset(), this;
        },
        getEvents: function() {
          var t = {
            zoom: this._reset,
            viewreset: this._reset
          };
          return this._zoomAnimated && (t.zoomanim = this._animateZoom), t;
        },
        // @method setZIndex(value: Number): this
        // Changes the [zIndex](#imageoverlay-zindex) of the image overlay.
        setZIndex: function(t) {
          return this.options.zIndex = t, this._updateZIndex(), this;
        },
        // @method getBounds(): LatLngBounds
        // Get the bounds that this ImageOverlay covers
        getBounds: function() {
          return this._bounds;
        },
        // @method getElement(): HTMLElement
        // Returns the instance of [`HTMLImageElement`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement)
        // used by this overlay.
        getElement: function() {
          return this._image;
        },
        _initImage: function() {
          var t = this._url.tagName === "IMG", e = this._image = t ? this._url : F("img");
          if (D(e, "leaflet-image-layer"), this._zoomAnimated && D(e, "leaflet-zoom-animated"), this.options.className && D(e, this.options.className), e.onselectstart = m, e.onmousemove = m, e.onload = a(this.fire, this, "load"), e.onerror = a(this._overlayOnError, this, "error"), (this.options.crossOrigin || this.options.crossOrigin === "") && (e.crossOrigin = this.options.crossOrigin === !0 ? "" : this.options.crossOrigin), this.options.zIndex && this._updateZIndex(), t) {
            this._url = e.src;
            return;
          }
          e.src = this._url, e.alt = this.options.alt;
        },
        _animateZoom: function(t) {
          var e = this._map.getZoomScale(t.zoom), i = this._map._latLngBoundsToNewLayerBounds(this._bounds, t.zoom, t.center).min;
          Et(this._image, i, e);
        },
        _reset: function() {
          var t = this._image, e = new V(
            this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
            this._map.latLngToLayerPoint(this._bounds.getSouthEast())
          ), i = e.getSize();
          $(t, e.min), t.style.width = i.x + "px", t.style.height = i.y + "px";
        },
        _updateOpacity: function() {
          ft(this._image, this.options.opacity);
        },
        _updateZIndex: function() {
          this._image && this.options.zIndex !== void 0 && this.options.zIndex !== null && (this._image.style.zIndex = this.options.zIndex);
        },
        _overlayOnError: function() {
          this.fire("error");
          var t = this.options.errorOverlayUrl;
          t && this._url !== t && (this._url = t, this._image.src = t);
        },
        // @method getCenter(): LatLng
        // Returns the center of the ImageOverlay.
        getCenter: function() {
          return this._bounds.getCenter();
        }
      }), jo = function(t, e, i) {
        return new Me(t, e, i);
      }, hn = Me.extend({
        // @section
        // @aka VideoOverlay options
        options: {
          // @option autoplay: Boolean = true
          // Whether the video starts playing automatically when loaded.
          // On some browsers autoplay will only work with `muted: true`
          autoplay: !0,
          // @option loop: Boolean = true
          // Whether the video will loop back to the beginning when played.
          loop: !0,
          // @option keepAspectRatio: Boolean = true
          // Whether the video will save aspect ratio after the projection.
          // Relevant for supported browsers. See [browser compatibility](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit)
          keepAspectRatio: !0,
          // @option muted: Boolean = false
          // Whether the video starts on mute when loaded.
          muted: !1,
          // @option playsInline: Boolean = true
          // Mobile browsers will play the video right where it is instead of open it up in fullscreen mode.
          playsInline: !0
        },
        _initImage: function() {
          var t = this._url.tagName === "VIDEO", e = this._image = t ? this._url : F("video");
          if (D(e, "leaflet-image-layer"), this._zoomAnimated && D(e, "leaflet-zoom-animated"), this.options.className && D(e, this.options.className), e.onselectstart = m, e.onmousemove = m, e.onloadeddata = a(this.fire, this, "load"), t) {
            for (var i = e.getElementsByTagName("source"), n = [], r = 0; r < i.length; r++)
              n.push(i[r].src);
            this._url = i.length > 0 ? n : [e.src];
            return;
          }
          I(this._url) || (this._url = [this._url]), !this.options.keepAspectRatio && Object.prototype.hasOwnProperty.call(e.style, "objectFit") && (e.style.objectFit = "fill"), e.autoplay = !!this.options.autoplay, e.loop = !!this.options.loop, e.muted = !!this.options.muted, e.playsInline = !!this.options.playsInline;
          for (var h = 0; h < this._url.length; h++) {
            var _ = F("source");
            _.src = this._url[h], e.appendChild(_);
          }
        }
        // @method getElement(): HTMLVideoElement
        // Returns the instance of [`HTMLVideoElement`](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement)
        // used by this overlay.
      });
      function Vo(t, e, i) {
        return new hn(t, e, i);
      }
      var un = Me.extend({
        _initImage: function() {
          var t = this._image = this._url;
          D(t, "leaflet-image-layer"), this._zoomAnimated && D(t, "leaflet-zoom-animated"), this.options.className && D(t, this.options.className), t.onselectstart = m, t.onmousemove = m;
        }
        // @method getElement(): SVGElement
        // Returns the instance of [`SVGElement`](https://developer.mozilla.org/docs/Web/API/SVGElement)
        // used by this overlay.
      });
      function Jo(t, e, i) {
        return new un(t, e, i);
      }
      var wt = gt.extend({
        // @section
        // @aka DivOverlay options
        options: {
          // @option interactive: Boolean = false
          // If true, the popup/tooltip will listen to the mouse events.
          interactive: !1,
          // @option offset: Point = Point(0, 0)
          // The offset of the overlay position.
          offset: [0, 0],
          // @option className: String = ''
          // A custom CSS class name to assign to the overlay.
          className: "",
          // @option pane: String = undefined
          // `Map pane` where the overlay will be added.
          pane: void 0,
          // @option content: String|HTMLElement|Function = ''
          // Sets the HTML content of the overlay while initializing. If a function is passed the source layer will be
          // passed to the function. The function should return a `String` or `HTMLElement` to be used in the overlay.
          content: ""
        },
        initialize: function(t, e) {
          t && (t instanceof W || I(t)) ? (this._latlng = N(t), v(this, e)) : (v(this, t), this._source = e), this.options.content && (this._content = this.options.content);
        },
        // @method openOn(map: Map): this
        // Adds the overlay to the map.
        // Alternative to `map.openPopup(popup)`/`.openTooltip(tooltip)`.
        openOn: function(t) {
          return t = arguments.length ? t : this._source._map, t.hasLayer(this) || t.addLayer(this), this;
        },
        // @method close(): this
        // Closes the overlay.
        // Alternative to `map.closePopup(popup)`/`.closeTooltip(tooltip)`
        // and `layer.closePopup()`/`.closeTooltip()`.
        close: function() {
          return this._map && this._map.removeLayer(this), this;
        },
        // @method toggle(layer?: Layer): this
        // Opens or closes the overlay bound to layer depending on its current state.
        // Argument may be omitted only for overlay bound to layer.
        // Alternative to `layer.togglePopup()`/`.toggleTooltip()`.
        toggle: function(t) {
          return this._map ? this.close() : (arguments.length ? this._source = t : t = this._source, this._prepareOpen(), this.openOn(t._map)), this;
        },
        onAdd: function(t) {
          this._zoomAnimated = t._zoomAnimated, this._container || this._initLayout(), t._fadeAnimated && ft(this._container, 0), clearTimeout(this._removeTimeout), this.getPane().appendChild(this._container), this.update(), t._fadeAnimated && ft(this._container, 1), this.bringToFront(), this.options.interactive && (D(this._container, "leaflet-interactive"), this.addInteractiveTarget(this._container));
        },
        onRemove: function(t) {
          t._fadeAnimated ? (ft(this._container, 0), this._removeTimeout = setTimeout(a(J, void 0, this._container), 200)) : J(this._container), this.options.interactive && (Y(this._container, "leaflet-interactive"), this.removeInteractiveTarget(this._container));
        },
        // @namespace DivOverlay
        // @method getLatLng: LatLng
        // Returns the geographical point of the overlay.
        getLatLng: function() {
          return this._latlng;
        },
        // @method setLatLng(latlng: LatLng): this
        // Sets the geographical point where the overlay will open.
        setLatLng: function(t) {
          return this._latlng = N(t), this._map && (this._updatePosition(), this._adjustPan()), this;
        },
        // @method getContent: String|HTMLElement
        // Returns the content of the overlay.
        getContent: function() {
          return this._content;
        },
        // @method setContent(htmlContent: String|HTMLElement|Function): this
        // Sets the HTML content of the overlay. If a function is passed the source layer will be passed to the function.
        // The function should return a `String` or `HTMLElement` to be used in the overlay.
        setContent: function(t) {
          return this._content = t, this.update(), this;
        },
        // @method getElement: String|HTMLElement
        // Returns the HTML container of the overlay.
        getElement: function() {
          return this._container;
        },
        // @method update: null
        // Updates the overlay content, layout and position. Useful for updating the overlay after something inside changed, e.g. image loaded.
        update: function() {
          this._map && (this._container.style.visibility = "hidden", this._updateContent(), this._updateLayout(), this._updatePosition(), this._container.style.visibility = "", this._adjustPan());
        },
        getEvents: function() {
          var t = {
            zoom: this._updatePosition,
            viewreset: this._updatePosition
          };
          return this._zoomAnimated && (t.zoomanim = this._animateZoom), t;
        },
        // @method isOpen: Boolean
        // Returns `true` when the overlay is visible on the map.
        isOpen: function() {
          return !!this._map && this._map.hasLayer(this);
        },
        // @method bringToFront: this
        // Brings this overlay in front of other overlays (in the same map pane).
        bringToFront: function() {
          return this._map && Ut(this._container), this;
        },
        // @method bringToBack: this
        // Brings this overlay to the back of other overlays (in the same map pane).
        bringToBack: function() {
          return this._map && Ht(this._container), this;
        },
        // prepare bound overlay to open: update latlng pos / content source (for FeatureGroup)
        _prepareOpen: function(t) {
          var e = this._source;
          if (!e._map)
            return !1;
          if (e instanceof bt) {
            e = null;
            var i = this._source._layers;
            for (var n in i)
              if (i[n]._map) {
                e = i[n];
                break;
              }
            if (!e)
              return !1;
            this._source = e;
          }
          if (!t)
            if (e.getCenter)
              t = e.getCenter();
            else if (e.getLatLng)
              t = e.getLatLng();
            else if (e.getBounds)
              t = e.getBounds().getCenter();
            else
              throw new Error("Unable to get source layer LatLng.");
          return this.setLatLng(t), this._map && this.update(), !0;
        },
        _updateContent: function() {
          if (this._content) {
            var t = this._contentNode, e = typeof this._content == "function" ? this._content(this._source || this) : this._content;
            if (typeof e == "string")
              t.innerHTML = e;
            else {
              for (; t.hasChildNodes(); )
                t.removeChild(t.firstChild);
              t.appendChild(e);
            }
            this.fire("contentupdate");
          }
        },
        _updatePosition: function() {
          if (this._map) {
            var t = this._map.latLngToLayerPoint(this._latlng), e = E(this.options.offset), i = this._getAnchor();
            this._zoomAnimated ? $(this._container, t.add(i)) : e = e.add(t).add(i);
            var n = this._containerBottom = -e.y, r = this._containerLeft = -Math.round(this._containerWidth / 2) + e.x;
            this._container.style.bottom = n + "px", this._container.style.left = r + "px";
          }
        },
        _getAnchor: function() {
          return [0, 0];
        }
      });
      G.include({
        _initOverlay: function(t, e, i, n) {
          var r = e;
          return r instanceof t || (r = new t(n).setContent(e)), i && r.setLatLng(i), r;
        }
      }), gt.include({
        _initOverlay: function(t, e, i, n) {
          var r = i;
          return r instanceof t ? (v(r, n), r._source = this) : (r = e && !n ? e : new t(n, this), r.setContent(i)), r;
        }
      });
      var be = wt.extend({
        // @section
        // @aka Popup options
        options: {
          // @option pane: String = 'popupPane'
          // `Map pane` where the popup will be added.
          pane: "popupPane",
          // @option offset: Point = Point(0, 7)
          // The offset of the popup position.
          offset: [0, 7],
          // @option maxWidth: Number = 300
          // Max width of the popup, in pixels.
          maxWidth: 300,
          // @option minWidth: Number = 50
          // Min width of the popup, in pixels.
          minWidth: 50,
          // @option maxHeight: Number = null
          // If set, creates a scrollable container of the given height
          // inside a popup if its content exceeds it.
          // The scrollable container can be styled using the
          // `leaflet-popup-scrolled` CSS class selector.
          maxHeight: null,
          // @option autoPan: Boolean = true
          // Set it to `false` if you don't want the map to do panning animation
          // to fit the opened popup.
          autoPan: !0,
          // @option autoPanPaddingTopLeft: Point = null
          // The margin between the popup and the top left corner of the map
          // view after autopanning was performed.
          autoPanPaddingTopLeft: null,
          // @option autoPanPaddingBottomRight: Point = null
          // The margin between the popup and the bottom right corner of the map
          // view after autopanning was performed.
          autoPanPaddingBottomRight: null,
          // @option autoPanPadding: Point = Point(5, 5)
          // Equivalent of setting both top left and bottom right autopan padding to the same value.
          autoPanPadding: [5, 5],
          // @option keepInView: Boolean = false
          // Set it to `true` if you want to prevent users from panning the popup
          // off of the screen while it is open.
          keepInView: !1,
          // @option closeButton: Boolean = true
          // Controls the presence of a close button in the popup.
          closeButton: !0,
          // @option autoClose: Boolean = true
          // Set it to `false` if you want to override the default behavior of
          // the popup closing when another popup is opened.
          autoClose: !0,
          // @option closeOnEscapeKey: Boolean = true
          // Set it to `false` if you want to override the default behavior of
          // the ESC key for closing of the popup.
          closeOnEscapeKey: !0,
          // @option closeOnClick: Boolean = *
          // Set it if you want to override the default behavior of the popup closing when user clicks
          // on the map. Defaults to the map's [`closePopupOnClick`](#map-closepopuponclick) option.
          // @option className: String = ''
          // A custom CSS class name to assign to the popup.
          className: ""
        },
        // @namespace Popup
        // @method openOn(map: Map): this
        // Alternative to `map.openPopup(popup)`.
        // Adds the popup to the map and closes the previous one.
        openOn: function(t) {
          return t = arguments.length ? t : this._source._map, !t.hasLayer(this) && t._popup && t._popup.options.autoClose && t.removeLayer(t._popup), t._popup = this, wt.prototype.openOn.call(this, t);
        },
        onAdd: function(t) {
          wt.prototype.onAdd.call(this, t), t.fire("popupopen", { popup: this }), this._source && (this._source.fire("popupopen", { popup: this }, !0), this._source instanceof zt || this._source.on("preclick", Zt));
        },
        onRemove: function(t) {
          wt.prototype.onRemove.call(this, t), t.fire("popupclose", { popup: this }), this._source && (this._source.fire("popupclose", { popup: this }, !0), this._source instanceof zt || this._source.off("preclick", Zt));
        },
        getEvents: function() {
          var t = wt.prototype.getEvents.call(this);
          return (this.options.closeOnClick !== void 0 ? this.options.closeOnClick : this._map.options.closePopupOnClick) && (t.preclick = this.close), this.options.keepInView && (t.moveend = this._adjustPan), t;
        },
        _initLayout: function() {
          var t = "leaflet-popup", e = this._container = F(
            "div",
            t + " " + (this.options.className || "") + " leaflet-zoom-animated"
          ), i = this._wrapper = F("div", t + "-content-wrapper", e);
          if (this._contentNode = F("div", t + "-content", i), ne(e), ei(this._contentNode), Z(e, "contextmenu", Zt), this._tipContainer = F("div", t + "-tip-container", e), this._tip = F("div", t + "-tip", this._tipContainer), this.options.closeButton) {
            var n = this._closeButton = F("a", t + "-close-button", e);
            n.setAttribute("role", "button"), n.setAttribute("aria-label", "Close popup"), n.href = "#close", n.innerHTML = '<span aria-hidden="true">&#215;</span>', Z(n, "click", function(r) {
              et(r), this.close();
            }, this);
          }
        },
        _updateLayout: function() {
          var t = this._contentNode, e = t.style;
          e.width = "", e.whiteSpace = "nowrap";
          var i = t.offsetWidth;
          i = Math.min(i, this.options.maxWidth), i = Math.max(i, this.options.minWidth), e.width = i + 1 + "px", e.whiteSpace = "", e.height = "";
          var n = t.offsetHeight, r = this.options.maxHeight, h = "leaflet-popup-scrolled";
          r && n > r ? (e.height = r + "px", D(t, h)) : Y(t, h), this._containerWidth = this._container.offsetWidth;
        },
        _animateZoom: function(t) {
          var e = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center), i = this._getAnchor();
          $(this._container, e.add(i));
        },
        _adjustPan: function() {
          if (this.options.autoPan) {
            if (this._map._panAnim && this._map._panAnim.stop(), this._autopanning) {
              this._autopanning = !1;
              return;
            }
            var t = this._map, e = parseInt(Qt(this._container, "marginBottom"), 10) || 0, i = this._container.offsetHeight + e, n = this._containerWidth, r = new B(this._containerLeft, -i - this._containerBottom);
            r._add(Bt(this._container));
            var h = t.layerPointToContainerPoint(r), _ = E(this.options.autoPanPadding), P = E(this.options.autoPanPaddingTopLeft || _), x = E(this.options.autoPanPaddingBottomRight || _), S = t.getSize(), z = 0, O = 0;
            h.x + n + x.x > S.x && (z = h.x + n - S.x + x.x), h.x - z - P.x < 0 && (z = h.x - P.x), h.y + i + x.y > S.y && (O = h.y + i - S.y + x.y), h.y - O - P.y < 0 && (O = h.y - P.y), (z || O) && (this.options.keepInView && (this._autopanning = !0), t.fire("autopanstart").panBy([z, O]));
          }
        },
        _getAnchor: function() {
          return E(this._source && this._source._getPopupAnchor ? this._source._getPopupAnchor() : [0, 0]);
        }
      }), Ko = function(t, e) {
        return new be(t, e);
      };
      G.mergeOptions({
        closePopupOnClick: !0
      }), G.include({
        // @method openPopup(popup: Popup): this
        // Opens the specified popup while closing the previously opened (to make sure only one is opened at one time for usability).
        // @alternative
        // @method openPopup(content: String|HTMLElement, latlng: LatLng, options?: Popup options): this
        // Creates a popup with the specified content and options and opens it in the given point on a map.
        openPopup: function(t, e, i) {
          return this._initOverlay(be, t, e, i).openOn(this), this;
        },
        // @method closePopup(popup?: Popup): this
        // Closes the popup previously opened with [openPopup](#map-openpopup) (or the given one).
        closePopup: function(t) {
          return t = arguments.length ? t : this._popup, t && t.close(), this;
        }
      }), gt.include({
        // @method bindPopup(content: String|HTMLElement|Function|Popup, options?: Popup options): this
        // Binds a popup to the layer with the passed `content` and sets up the
        // necessary event listeners. If a `Function` is passed it will receive
        // the layer as the first argument and should return a `String` or `HTMLElement`.
        bindPopup: function(t, e) {
          return this._popup = this._initOverlay(be, this._popup, t, e), this._popupHandlersAdded || (this.on({
            click: this._openPopup,
            keypress: this._onKeyPress,
            remove: this.closePopup,
            move: this._movePopup
          }), this._popupHandlersAdded = !0), this;
        },
        // @method unbindPopup(): this
        // Removes the popup previously bound with `bindPopup`.
        unbindPopup: function() {
          return this._popup && (this.off({
            click: this._openPopup,
            keypress: this._onKeyPress,
            remove: this.closePopup,
            move: this._movePopup
          }), this._popupHandlersAdded = !1, this._popup = null), this;
        },
        // @method openPopup(latlng?: LatLng): this
        // Opens the bound popup at the specified `latlng` or at the default popup anchor if no `latlng` is passed.
        openPopup: function(t) {
          return this._popup && (this instanceof bt || (this._popup._source = this), this._popup._prepareOpen(t || this._latlng) && this._popup.openOn(this._map)), this;
        },
        // @method closePopup(): this
        // Closes the popup bound to this layer if it is open.
        closePopup: function() {
          return this._popup && this._popup.close(), this;
        },
        // @method togglePopup(): this
        // Opens or closes the popup bound to this layer depending on its current state.
        togglePopup: function() {
          return this._popup && this._popup.toggle(this), this;
        },
        // @method isPopupOpen(): boolean
        // Returns `true` if the popup bound to this layer is currently open.
        isPopupOpen: function() {
          return this._popup ? this._popup.isOpen() : !1;
        },
        // @method setPopupContent(content: String|HTMLElement|Popup): this
        // Sets the content of the popup bound to this layer.
        setPopupContent: function(t) {
          return this._popup && this._popup.setContent(t), this;
        },
        // @method getPopup(): Popup
        // Returns the popup bound to this layer.
        getPopup: function() {
          return this._popup;
        },
        _openPopup: function(t) {
          if (!(!this._popup || !this._map)) {
            Dt(t);
            var e = t.layer || t.target;
            if (this._popup._source === e && !(e instanceof zt)) {
              this._map.hasLayer(this._popup) ? this.closePopup() : this.openPopup(t.latlng);
              return;
            }
            this._popup._source = e, this.openPopup(t.latlng);
          }
        },
        _movePopup: function(t) {
          this._popup.setLatLng(t.latlng);
        },
        _onKeyPress: function(t) {
          t.originalEvent.keyCode === 13 && this._openPopup(t);
        }
      });
      var Ce = wt.extend({
        // @section
        // @aka Tooltip options
        options: {
          // @option pane: String = 'tooltipPane'
          // `Map pane` where the tooltip will be added.
          pane: "tooltipPane",
          // @option offset: Point = Point(0, 0)
          // Optional offset of the tooltip position.
          offset: [0, 0],
          // @option direction: String = 'auto'
          // Direction where to open the tooltip. Possible values are: `right`, `left`,
          // `top`, `bottom`, `center`, `auto`.
          // `auto` will dynamically switch between `right` and `left` according to the tooltip
          // position on the map.
          direction: "auto",
          // @option permanent: Boolean = false
          // Whether to open the tooltip permanently or only on mouseover.
          permanent: !1,
          // @option sticky: Boolean = false
          // If true, the tooltip will follow the mouse instead of being fixed at the feature center.
          sticky: !1,
          // @option opacity: Number = 0.9
          // Tooltip container opacity.
          opacity: 0.9
        },
        onAdd: function(t) {
          wt.prototype.onAdd.call(this, t), this.setOpacity(this.options.opacity), t.fire("tooltipopen", { tooltip: this }), this._source && (this.addEventParent(this._source), this._source.fire("tooltipopen", { tooltip: this }, !0));
        },
        onRemove: function(t) {
          wt.prototype.onRemove.call(this, t), t.fire("tooltipclose", { tooltip: this }), this._source && (this.removeEventParent(this._source), this._source.fire("tooltipclose", { tooltip: this }, !0));
        },
        getEvents: function() {
          var t = wt.prototype.getEvents.call(this);
          return this.options.permanent || (t.preclick = this.close), t;
        },
        _initLayout: function() {
          var t = "leaflet-tooltip", e = t + " " + (this.options.className || "") + " leaflet-zoom-" + (this._zoomAnimated ? "animated" : "hide");
          this._contentNode = this._container = F("div", e), this._container.setAttribute("role", "tooltip"), this._container.setAttribute("id", "leaflet-tooltip-" + d(this));
        },
        _updateLayout: function() {
        },
        _adjustPan: function() {
        },
        _setPosition: function(t) {
          var e, i, n = this._map, r = this._container, h = n.latLngToContainerPoint(n.getCenter()), _ = n.layerPointToContainerPoint(t), P = this.options.direction, x = r.offsetWidth, S = r.offsetHeight, z = E(this.options.offset), O = this._getAnchor();
          P === "top" ? (e = x / 2, i = S) : P === "bottom" ? (e = x / 2, i = 0) : P === "center" ? (e = x / 2, i = S / 2) : P === "right" ? (e = 0, i = S / 2) : P === "left" ? (e = x, i = S / 2) : _.x < h.x ? (P = "right", e = 0, i = S / 2) : (P = "left", e = x + (z.x + O.x) * 2, i = S / 2), t = t.subtract(E(e, i, !0)).add(z).add(O), Y(r, "leaflet-tooltip-right"), Y(r, "leaflet-tooltip-left"), Y(r, "leaflet-tooltip-top"), Y(r, "leaflet-tooltip-bottom"), D(r, "leaflet-tooltip-" + P), $(r, t);
        },
        _updatePosition: function() {
          var t = this._map.latLngToLayerPoint(this._latlng);
          this._setPosition(t);
        },
        setOpacity: function(t) {
          this.options.opacity = t, this._container && ft(this._container, t);
        },
        _animateZoom: function(t) {
          var e = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center);
          this._setPosition(e);
        },
        _getAnchor: function() {
          return E(this._source && this._source._getTooltipAnchor && !this.options.sticky ? this._source._getTooltipAnchor() : [0, 0]);
        }
      }), Yo = function(t, e) {
        return new Ce(t, e);
      };
      G.include({
        // @method openTooltip(tooltip: Tooltip): this
        // Opens the specified tooltip.
        // @alternative
        // @method openTooltip(content: String|HTMLElement, latlng: LatLng, options?: Tooltip options): this
        // Creates a tooltip with the specified content and options and open it.
        openTooltip: function(t, e, i) {
          return this._initOverlay(Ce, t, e, i).openOn(this), this;
        },
        // @method closeTooltip(tooltip: Tooltip): this
        // Closes the tooltip given as parameter.
        closeTooltip: function(t) {
          return t.close(), this;
        }
      }), gt.include({
        // @method bindTooltip(content: String|HTMLElement|Function|Tooltip, options?: Tooltip options): this
        // Binds a tooltip to the layer with the passed `content` and sets up the
        // necessary event listeners. If a `Function` is passed it will receive
        // the layer as the first argument and should return a `String` or `HTMLElement`.
        bindTooltip: function(t, e) {
          return this._tooltip && this.isTooltipOpen() && this.unbindTooltip(), this._tooltip = this._initOverlay(Ce, this._tooltip, t, e), this._initTooltipInteractions(), this._tooltip.options.permanent && this._map && this._map.hasLayer(this) && this.openTooltip(), this;
        },
        // @method unbindTooltip(): this
        // Removes the tooltip previously bound with `bindTooltip`.
        unbindTooltip: function() {
          return this._tooltip && (this._initTooltipInteractions(!0), this.closeTooltip(), this._tooltip = null), this;
        },
        _initTooltipInteractions: function(t) {
          if (!(!t && this._tooltipHandlersAdded)) {
            var e = t ? "off" : "on", i = {
              remove: this.closeTooltip,
              move: this._moveTooltip
            };
            this._tooltip.options.permanent ? i.add = this._openTooltip : (i.mouseover = this._openTooltip, i.mouseout = this.closeTooltip, i.click = this._openTooltip, this._map ? this._addFocusListeners() : i.add = this._addFocusListeners), this._tooltip.options.sticky && (i.mousemove = this._moveTooltip), this[e](i), this._tooltipHandlersAdded = !t;
          }
        },
        // @method openTooltip(latlng?: LatLng): this
        // Opens the bound tooltip at the specified `latlng` or at the default tooltip anchor if no `latlng` is passed.
        openTooltip: function(t) {
          return this._tooltip && (this instanceof bt || (this._tooltip._source = this), this._tooltip._prepareOpen(t) && (this._tooltip.openOn(this._map), this.getElement ? this._setAriaDescribedByOnLayer(this) : this.eachLayer && this.eachLayer(this._setAriaDescribedByOnLayer, this))), this;
        },
        // @method closeTooltip(): this
        // Closes the tooltip bound to this layer if it is open.
        closeTooltip: function() {
          if (this._tooltip)
            return this._tooltip.close();
        },
        // @method toggleTooltip(): this
        // Opens or closes the tooltip bound to this layer depending on its current state.
        toggleTooltip: function() {
          return this._tooltip && this._tooltip.toggle(this), this;
        },
        // @method isTooltipOpen(): boolean
        // Returns `true` if the tooltip bound to this layer is currently open.
        isTooltipOpen: function() {
          return this._tooltip.isOpen();
        },
        // @method setTooltipContent(content: String|HTMLElement|Tooltip): this
        // Sets the content of the tooltip bound to this layer.
        setTooltipContent: function(t) {
          return this._tooltip && this._tooltip.setContent(t), this;
        },
        // @method getTooltip(): Tooltip
        // Returns the tooltip bound to this layer.
        getTooltip: function() {
          return this._tooltip;
        },
        _addFocusListeners: function() {
          this.getElement ? this._addFocusListenersOnLayer(this) : this.eachLayer && this.eachLayer(this._addFocusListenersOnLayer, this);
        },
        _addFocusListenersOnLayer: function(t) {
          var e = typeof t.getElement == "function" && t.getElement();
          e && (Z(e, "focus", function() {
            this._tooltip._source = t, this.openTooltip();
          }, this), Z(e, "blur", this.closeTooltip, this));
        },
        _setAriaDescribedByOnLayer: function(t) {
          var e = typeof t.getElement == "function" && t.getElement();
          e && e.setAttribute("aria-describedby", this._tooltip._container.id);
        },
        _openTooltip: function(t) {
          if (!(!this._tooltip || !this._map)) {
            if (this._map.dragging && this._map.dragging.moving() && !this._openOnceFlag) {
              this._openOnceFlag = !0;
              var e = this;
              this._map.once("moveend", function() {
                e._openOnceFlag = !1, e._openTooltip(t);
              });
              return;
            }
            this._tooltip._source = t.layer || t.target, this.openTooltip(this._tooltip.options.sticky ? t.latlng : void 0);
          }
        },
        _moveTooltip: function(t) {
          var e = t.latlng, i, n;
          this._tooltip.options.sticky && t.originalEvent && (i = this._map.mouseEventToContainerPoint(t.originalEvent), n = this._map.containerPointToLayerPoint(i), e = this._map.layerPointToLatLng(n)), this._tooltip.setLatLng(e);
        }
      });
      var ln = Wt.extend({
        options: {
          // @section
          // @aka DivIcon options
          iconSize: [12, 12],
          // also can be set through CSS
          // iconAnchor: (Point),
          // popupAnchor: (Point),
          // @option html: String|HTMLElement = ''
          // Custom HTML code to put inside the div element, empty by default. Alternatively,
          // an instance of `HTMLElement`.
          html: !1,
          // @option bgPos: Point = [0, 0]
          // Optional relative position of the background, in pixels
          bgPos: null,
          className: "leaflet-div-icon"
        },
        createIcon: function(t) {
          var e = t && t.tagName === "DIV" ? t : document.createElement("div"), i = this.options;
          if (i.html instanceof Element ? (de(e), e.appendChild(i.html)) : e.innerHTML = i.html !== !1 ? i.html : "", i.bgPos) {
            var n = E(i.bgPos);
            e.style.backgroundPosition = -n.x + "px " + -n.y + "px";
          }
          return this._setIconStyles(e, "icon"), e;
        },
        createShadow: function() {
          return null;
        }
      });
      function Xo(t) {
        return new ln(t);
      }
      Wt.Default = re;
      var ae = gt.extend({
        // @section
        // @aka GridLayer options
        options: {
          // @option tileSize: Number|Point = 256
          // Width and height of tiles in the grid. Use a number if width and height are equal, or `L.point(width, height)` otherwise.
          tileSize: 256,
          // @option opacity: Number = 1.0
          // Opacity of the tiles. Can be used in the `createTile()` function.
          opacity: 1,
          // @option updateWhenIdle: Boolean = (depends)
          // Load new tiles only when panning ends.
          // `true` by default on mobile browsers, in order to avoid too many requests and keep smooth navigation.
          // `false` otherwise in order to display new tiles _during_ panning, since it is easy to pan outside the
          // [`keepBuffer`](#gridlayer-keepbuffer) option in desktop browsers.
          updateWhenIdle: A.mobile,
          // @option updateWhenZooming: Boolean = true
          // By default, a smooth zoom animation (during a [touch zoom](#map-touchzoom) or a [`flyTo()`](#map-flyto)) will update grid layers every integer zoom level. Setting this option to `false` will update the grid layer only when the smooth animation ends.
          updateWhenZooming: !0,
          // @option updateInterval: Number = 200
          // Tiles will not update more than once every `updateInterval` milliseconds when panning.
          updateInterval: 200,
          // @option zIndex: Number = 1
          // The explicit zIndex of the tile layer.
          zIndex: 1,
          // @option bounds: LatLngBounds = undefined
          // If set, tiles will only be loaded inside the set `LatLngBounds`.
          bounds: null,
          // @option minZoom: Number = 0
          // The minimum zoom level down to which this layer will be displayed (inclusive).
          minZoom: 0,
          // @option maxZoom: Number = undefined
          // The maximum zoom level up to which this layer will be displayed (inclusive).
          maxZoom: void 0,
          // @option maxNativeZoom: Number = undefined
          // Maximum zoom number the tile source has available. If it is specified,
          // the tiles on all zoom levels higher than `maxNativeZoom` will be loaded
          // from `maxNativeZoom` level and auto-scaled.
          maxNativeZoom: void 0,
          // @option minNativeZoom: Number = undefined
          // Minimum zoom number the tile source has available. If it is specified,
          // the tiles on all zoom levels lower than `minNativeZoom` will be loaded
          // from `minNativeZoom` level and auto-scaled.
          minNativeZoom: void 0,
          // @option noWrap: Boolean = false
          // Whether the layer is wrapped around the antimeridian. If `true`, the
          // GridLayer will only be displayed once at low zoom levels. Has no
          // effect when the [map CRS](#map-crs) doesn't wrap around. Can be used
          // in combination with [`bounds`](#gridlayer-bounds) to prevent requesting
          // tiles outside the CRS limits.
          noWrap: !1,
          // @option pane: String = 'tilePane'
          // `Map pane` where the grid layer will be added.
          pane: "tilePane",
          // @option className: String = ''
          // A custom class name to assign to the tile layer. Empty by default.
          className: "",
          // @option keepBuffer: Number = 2
          // When panning the map, keep this many rows and columns of tiles before unloading them.
          keepBuffer: 2
        },
        initialize: function(t) {
          v(this, t);
        },
        onAdd: function() {
          this._initContainer(), this._levels = {}, this._tiles = {}, this._resetView();
        },
        beforeAdd: function(t) {
          t._addZoomLimit(this);
        },
        onRemove: function(t) {
          this._removeAllTiles(), J(this._container), t._removeZoomLimit(this), this._container = null, this._tileZoom = void 0;
        },
        // @method bringToFront: this
        // Brings the tile layer to the top of all tile layers.
        bringToFront: function() {
          return this._map && (Ut(this._container), this._setAutoZIndex(Math.max)), this;
        },
        // @method bringToBack: this
        // Brings the tile layer to the bottom of all tile layers.
        bringToBack: function() {
          return this._map && (Ht(this._container), this._setAutoZIndex(Math.min)), this;
        },
        // @method getContainer: HTMLElement
        // Returns the HTML element that contains the tiles for this layer.
        getContainer: function() {
          return this._container;
        },
        // @method setOpacity(opacity: Number): this
        // Changes the [opacity](#gridlayer-opacity) of the grid layer.
        setOpacity: function(t) {
          return this.options.opacity = t, this._updateOpacity(), this;
        },
        // @method setZIndex(zIndex: Number): this
        // Changes the [zIndex](#gridlayer-zindex) of the grid layer.
        setZIndex: function(t) {
          return this.options.zIndex = t, this._updateZIndex(), this;
        },
        // @method isLoading: Boolean
        // Returns `true` if any tile in the grid layer has not finished loading.
        isLoading: function() {
          return this._loading;
        },
        // @method redraw: this
        // Causes the layer to clear all the tiles and request them again.
        redraw: function() {
          if (this._map) {
            this._removeAllTiles();
            var t = this._clampZoom(this._map.getZoom());
            t !== this._tileZoom && (this._tileZoom = t, this._updateLevels()), this._update();
          }
          return this;
        },
        getEvents: function() {
          var t = {
            viewprereset: this._invalidateAll,
            viewreset: this._resetView,
            zoom: this._resetView,
            moveend: this._onMoveEnd
          };
          return this.options.updateWhenIdle || (this._onMove || (this._onMove = w(this._onMoveEnd, this.options.updateInterval, this)), t.move = this._onMove), this._zoomAnimated && (t.zoomanim = this._animateZoom), t;
        },
        // @section Extension methods
        // Layers extending `GridLayer` shall reimplement the following method.
        // @method createTile(coords: Object, done?: Function): HTMLElement
        // Called only internally, must be overridden by classes extending `GridLayer`.
        // Returns the `HTMLElement` corresponding to the given `coords`. If the `done` callback
        // is specified, it must be called when the tile has finished loading and drawing.
        createTile: function() {
          return document.createElement("div");
        },
        // @section
        // @method getTileSize: Point
        // Normalizes the [tileSize option](#gridlayer-tilesize) into a point. Used by the `createTile()` method.
        getTileSize: function() {
          var t = this.options.tileSize;
          return t instanceof B ? t : new B(t, t);
        },
        _updateZIndex: function() {
          this._container && this.options.zIndex !== void 0 && this.options.zIndex !== null && (this._container.style.zIndex = this.options.zIndex);
        },
        _setAutoZIndex: function(t) {
          for (var e = this.getPane().children, i = -t(-1 / 0, 1 / 0), n = 0, r = e.length, h; n < r; n++)
            h = e[n].style.zIndex, e[n] !== this._container && h && (i = t(i, +h));
          isFinite(i) && (this.options.zIndex = i + t(-1, 1), this._updateZIndex());
        },
        _updateOpacity: function() {
          if (this._map && !A.ielt9) {
            ft(this._container, this.options.opacity);
            var t = +/* @__PURE__ */ new Date(), e = !1, i = !1;
            for (var n in this._tiles) {
              var r = this._tiles[n];
              if (!(!r.current || !r.loaded)) {
                var h = Math.min(1, (t - r.loaded) / 200);
                ft(r.el, h), h < 1 ? e = !0 : (r.active ? i = !0 : this._onOpaqueTile(r), r.active = !0);
              }
            }
            i && !this._noPrune && this._pruneTiles(), e && (rt(this._fadeFrame), this._fadeFrame = j(this._updateOpacity, this));
          }
        },
        _onOpaqueTile: m,
        _initContainer: function() {
          this._container || (this._container = F("div", "leaflet-layer " + (this.options.className || "")), this._updateZIndex(), this.options.opacity < 1 && this._updateOpacity(), this.getPane().appendChild(this._container));
        },
        _updateLevels: function() {
          var t = this._tileZoom, e = this.options.maxZoom;
          if (t !== void 0) {
            for (var i in this._levels)
              i = Number(i), this._levels[i].el.children.length || i === t ? (this._levels[i].el.style.zIndex = e - Math.abs(t - i), this._onUpdateLevel(i)) : (J(this._levels[i].el), this._removeTilesAtZoom(i), this._onRemoveLevel(i), delete this._levels[i]);
            var n = this._levels[t], r = this._map;
            return n || (n = this._levels[t] = {}, n.el = F("div", "leaflet-tile-container leaflet-zoom-animated", this._container), n.el.style.zIndex = e, n.origin = r.project(r.unproject(r.getPixelOrigin()), t).round(), n.zoom = t, this._setZoomTransform(n, r.getCenter(), r.getZoom()), m(n.el.offsetWidth), this._onCreateLevel(n)), this._level = n, n;
          }
        },
        _onUpdateLevel: m,
        _onRemoveLevel: m,
        _onCreateLevel: m,
        _pruneTiles: function() {
          if (this._map) {
            var t, e, i = this._map.getZoom();
            if (i > this.options.maxZoom || i < this.options.minZoom) {
              this._removeAllTiles();
              return;
            }
            for (t in this._tiles)
              e = this._tiles[t], e.retain = e.current;
            for (t in this._tiles)
              if (e = this._tiles[t], e.current && !e.active) {
                var n = e.coords;
                this._retainParent(n.x, n.y, n.z, n.z - 5) || this._retainChildren(n.x, n.y, n.z, n.z + 2);
              }
            for (t in this._tiles)
              this._tiles[t].retain || this._removeTile(t);
          }
        },
        _removeTilesAtZoom: function(t) {
          for (var e in this._tiles)
            this._tiles[e].coords.z === t && this._removeTile(e);
        },
        _removeAllTiles: function() {
          for (var t in this._tiles)
            this._removeTile(t);
        },
        _invalidateAll: function() {
          for (var t in this._levels)
            J(this._levels[t].el), this._onRemoveLevel(Number(t)), delete this._levels[t];
          this._removeAllTiles(), this._tileZoom = void 0;
        },
        _retainParent: function(t, e, i, n) {
          var r = Math.floor(t / 2), h = Math.floor(e / 2), _ = i - 1, P = new B(+r, +h);
          P.z = +_;
          var x = this._tileCoordsToKey(P), S = this._tiles[x];
          return S && S.active ? (S.retain = !0, !0) : (S && S.loaded && (S.retain = !0), _ > n ? this._retainParent(r, h, _, n) : !1);
        },
        _retainChildren: function(t, e, i, n) {
          for (var r = 2 * t; r < 2 * t + 2; r++)
            for (var h = 2 * e; h < 2 * e + 2; h++) {
              var _ = new B(r, h);
              _.z = i + 1;
              var P = this._tileCoordsToKey(_), x = this._tiles[P];
              if (x && x.active) {
                x.retain = !0;
                continue;
              } else
                x && x.loaded && (x.retain = !0);
              i + 1 < n && this._retainChildren(r, h, i + 1, n);
            }
        },
        _resetView: function(t) {
          var e = t && (t.pinch || t.flyTo);
          this._setView(this._map.getCenter(), this._map.getZoom(), e, e);
        },
        _animateZoom: function(t) {
          this._setView(t.center, t.zoom, !0, t.noUpdate);
        },
        _clampZoom: function(t) {
          var e = this.options;
          return e.minNativeZoom !== void 0 && t < e.minNativeZoom ? e.minNativeZoom : e.maxNativeZoom !== void 0 && e.maxNativeZoom < t ? e.maxNativeZoom : t;
        },
        _setView: function(t, e, i, n) {
          var r = Math.round(e);
          this.options.maxZoom !== void 0 && r > this.options.maxZoom || this.options.minZoom !== void 0 && r < this.options.minZoom ? r = void 0 : r = this._clampZoom(r);
          var h = this.options.updateWhenZooming && r !== this._tileZoom;
          (!n || h) && (this._tileZoom = r, this._abortLoading && this._abortLoading(), this._updateLevels(), this._resetGrid(), r !== void 0 && this._update(t), i || this._pruneTiles(), this._noPrune = !!i), this._setZoomTransforms(t, e);
        },
        _setZoomTransforms: function(t, e) {
          for (var i in this._levels)
            this._setZoomTransform(this._levels[i], t, e);
        },
        _setZoomTransform: function(t, e, i) {
          var n = this._map.getZoomScale(i, t.zoom), r = t.origin.multiplyBy(n).subtract(this._map._getNewPixelOrigin(e, i)).round();
          A.any3d ? Et(t.el, r, n) : $(t.el, r);
        },
        _resetGrid: function() {
          var t = this._map, e = t.options.crs, i = this._tileSize = this.getTileSize(), n = this._tileZoom, r = this._map.getPixelWorldBounds(this._tileZoom);
          r && (this._globalTileRange = this._pxBoundsToTileRange(r)), this._wrapX = e.wrapLng && !this.options.noWrap && [
            Math.floor(t.project([0, e.wrapLng[0]], n).x / i.x),
            Math.ceil(t.project([0, e.wrapLng[1]], n).x / i.y)
          ], this._wrapY = e.wrapLat && !this.options.noWrap && [
            Math.floor(t.project([e.wrapLat[0], 0], n).y / i.x),
            Math.ceil(t.project([e.wrapLat[1], 0], n).y / i.y)
          ];
        },
        _onMoveEnd: function() {
          !this._map || this._map._animatingZoom || this._update();
        },
        _getTiledPixelBounds: function(t) {
          var e = this._map, i = e._animatingZoom ? Math.max(e._animateToZoom, e.getZoom()) : e.getZoom(), n = e.getZoomScale(i, this._tileZoom), r = e.project(t, this._tileZoom).floor(), h = e.getSize().divideBy(n * 2);
          return new V(r.subtract(h), r.add(h));
        },
        // Private method to load tiles in the grid's active zoom level according to map bounds
        _update: function(t) {
          var e = this._map;
          if (e) {
            var i = this._clampZoom(e.getZoom());
            if (t === void 0 && (t = e.getCenter()), this._tileZoom !== void 0) {
              var n = this._getTiledPixelBounds(t), r = this._pxBoundsToTileRange(n), h = r.getCenter(), _ = [], P = this.options.keepBuffer, x = new V(
                r.getBottomLeft().subtract([P, -P]),
                r.getTopRight().add([P, -P])
              );
              if (!(isFinite(r.min.x) && isFinite(r.min.y) && isFinite(r.max.x) && isFinite(r.max.y)))
                throw new Error("Attempted to load an infinite number of tiles");
              for (var S in this._tiles) {
                var z = this._tiles[S].coords;
                (z.z !== this._tileZoom || !x.contains(new B(z.x, z.y))) && (this._tiles[S].current = !1);
              }
              if (Math.abs(i - this._tileZoom) > 1) {
                this._setView(t, i);
                return;
              }
              for (var O = r.min.y; O <= r.max.y; O++)
                for (var R = r.min.x; R <= r.max.x; R++) {
                  var at = new B(R, O);
                  if (at.z = this._tileZoom, !!this._isValidTile(at)) {
                    var tt = this._tiles[this._tileCoordsToKey(at)];
                    tt ? tt.current = !0 : _.push(at);
                  }
                }
              if (_.sort(function(lt, Jt) {
                return lt.distanceTo(h) - Jt.distanceTo(h);
              }), _.length !== 0) {
                this._loading || (this._loading = !0, this.fire("loading"));
                var mt = document.createDocumentFragment();
                for (R = 0; R < _.length; R++)
                  this._addTile(_[R], mt);
                this._level.el.appendChild(mt);
              }
            }
          }
        },
        _isValidTile: function(t) {
          var e = this._map.options.crs;
          if (!e.infinite) {
            var i = this._globalTileRange;
            if (!e.wrapLng && (t.x < i.min.x || t.x > i.max.x) || !e.wrapLat && (t.y < i.min.y || t.y > i.max.y))
              return !1;
          }
          if (!this.options.bounds)
            return !0;
          var n = this._tileCoordsToBounds(t);
          return X(this.options.bounds).overlaps(n);
        },
        _keyToBounds: function(t) {
          return this._tileCoordsToBounds(this._keyToTileCoords(t));
        },
        _tileCoordsToNwSe: function(t) {
          var e = this._map, i = this.getTileSize(), n = t.scaleBy(i), r = n.add(i), h = e.unproject(n, t.z), _ = e.unproject(r, t.z);
          return [h, _];
        },
        // converts tile coordinates to its geographical bounds
        _tileCoordsToBounds: function(t) {
          var e = this._tileCoordsToNwSe(t), i = new ut(e[0], e[1]);
          return this.options.noWrap || (i = this._map.wrapLatLngBounds(i)), i;
        },
        // converts tile coordinates to key for the tile cache
        _tileCoordsToKey: function(t) {
          return t.x + ":" + t.y + ":" + t.z;
        },
        // converts tile cache key to coordinates
        _keyToTileCoords: function(t) {
          var e = t.split(":"), i = new B(+e[0], +e[1]);
          return i.z = +e[2], i;
        },
        _removeTile: function(t) {
          var e = this._tiles[t];
          e && (J(e.el), delete this._tiles[t], this.fire("tileunload", {
            tile: e.el,
            coords: this._keyToTileCoords(t)
          }));
        },
        _initTile: function(t) {
          D(t, "leaflet-tile");
          var e = this.getTileSize();
          t.style.width = e.x + "px", t.style.height = e.y + "px", t.onselectstart = m, t.onmousemove = m, A.ielt9 && this.options.opacity < 1 && ft(t, this.options.opacity);
        },
        _addTile: function(t, e) {
          var i = this._getTilePos(t), n = this._tileCoordsToKey(t), r = this.createTile(this._wrapCoords(t), a(this._tileReady, this, t));
          this._initTile(r), this.createTile.length < 2 && j(a(this._tileReady, this, t, null, r)), $(r, i), this._tiles[n] = {
            el: r,
            coords: t,
            current: !0
          }, e.appendChild(r), this.fire("tileloadstart", {
            tile: r,
            coords: t
          });
        },
        _tileReady: function(t, e, i) {
          e && this.fire("tileerror", {
            error: e,
            tile: i,
            coords: t
          });
          var n = this._tileCoordsToKey(t);
          i = this._tiles[n], i && (i.loaded = +/* @__PURE__ */ new Date(), this._map._fadeAnimated ? (ft(i.el, 0), rt(this._fadeFrame), this._fadeFrame = j(this._updateOpacity, this)) : (i.active = !0, this._pruneTiles()), e || (D(i.el, "leaflet-tile-loaded"), this.fire("tileload", {
            tile: i.el,
            coords: t
          })), this._noTilesToLoad() && (this._loading = !1, this.fire("load"), A.ielt9 || !this._map._fadeAnimated ? j(this._pruneTiles, this) : setTimeout(a(this._pruneTiles, this), 250)));
        },
        _getTilePos: function(t) {
          return t.scaleBy(this.getTileSize()).subtract(this._level.origin);
        },
        _wrapCoords: function(t) {
          var e = new B(
            this._wrapX ? M(t.x, this._wrapX) : t.x,
            this._wrapY ? M(t.y, this._wrapY) : t.y
          );
          return e.z = t.z, e;
        },
        _pxBoundsToTileRange: function(t) {
          var e = this.getTileSize();
          return new V(
            t.min.unscaleBy(e).floor(),
            t.max.unscaleBy(e).ceil().subtract([1, 1])
          );
        },
        _noTilesToLoad: function() {
          for (var t in this._tiles)
            if (!this._tiles[t].loaded)
              return !1;
          return !0;
        }
      });
      function $o(t) {
        return new ae(t);
      }
      var Vt = ae.extend({
        // @section
        // @aka TileLayer options
        options: {
          // @option minZoom: Number = 0
          // The minimum zoom level down to which this layer will be displayed (inclusive).
          minZoom: 0,
          // @option maxZoom: Number = 18
          // The maximum zoom level up to which this layer will be displayed (inclusive).
          maxZoom: 18,
          // @option subdomains: String|String[] = 'abc'
          // Subdomains of the tile service. Can be passed in the form of one string (where each letter is a subdomain name) or an array of strings.
          subdomains: "abc",
          // @option errorTileUrl: String = ''
          // URL to the tile image to show in place of the tile that failed to load.
          errorTileUrl: "",
          // @option zoomOffset: Number = 0
          // The zoom number used in tile URLs will be offset with this value.
          zoomOffset: 0,
          // @option tms: Boolean = false
          // If `true`, inverses Y axis numbering for tiles (turn this on for [TMS](https://en.wikipedia.org/wiki/Tile_Map_Service) services).
          tms: !1,
          // @option zoomReverse: Boolean = false
          // If set to true, the zoom number used in tile URLs will be reversed (`maxZoom - zoom` instead of `zoom`)
          zoomReverse: !1,
          // @option detectRetina: Boolean = false
          // If `true` and user is on a retina display, it will request four tiles of half the specified size and a bigger zoom level in place of one to utilize the high resolution.
          detectRetina: !1,
          // @option crossOrigin: Boolean|String = false
          // Whether the crossOrigin attribute will be added to the tiles.
          // If a String is provided, all tiles will have their crossOrigin attribute set to the String provided. This is needed if you want to access tile pixel data.
          // Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
          crossOrigin: !1,
          // @option referrerPolicy: Boolean|String = false
          // Whether the referrerPolicy attribute will be added to the tiles.
          // If a String is provided, all tiles will have their referrerPolicy attribute set to the String provided.
          // This may be needed if your map's rendering context has a strict default but your tile provider expects a valid referrer
          // (e.g. to validate an API token).
          // Refer to [HTMLImageElement.referrerPolicy](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/referrerPolicy) for valid String values.
          referrerPolicy: !1
        },
        initialize: function(t, e) {
          this._url = t, e = v(this, e), e.detectRetina && A.retina && e.maxZoom > 0 ? (e.tileSize = Math.floor(e.tileSize / 2), e.zoomReverse ? (e.zoomOffset--, e.minZoom = Math.min(e.maxZoom, e.minZoom + 1)) : (e.zoomOffset++, e.maxZoom = Math.max(e.minZoom, e.maxZoom - 1)), e.minZoom = Math.max(0, e.minZoom)) : e.zoomReverse ? e.minZoom = Math.min(e.maxZoom, e.minZoom) : e.maxZoom = Math.max(e.minZoom, e.maxZoom), typeof e.subdomains == "string" && (e.subdomains = e.subdomains.split("")), this.on("tileunload", this._onTileRemove);
        },
        // @method setUrl(url: String, noRedraw?: Boolean): this
        // Updates the layer's URL template and redraws it (unless `noRedraw` is set to `true`).
        // If the URL does not change, the layer will not be redrawn unless
        // the noRedraw parameter is set to false.
        setUrl: function(t, e) {
          return this._url === t && e === void 0 && (e = !0), this._url = t, e || this.redraw(), this;
        },
        // @method createTile(coords: Object, done?: Function): HTMLElement
        // Called only internally, overrides GridLayer's [`createTile()`](#gridlayer-createtile)
        // to return an `<img>` HTML element with the appropriate image URL given `coords`. The `done`
        // callback is called when the tile has been loaded.
        createTile: function(t, e) {
          var i = document.createElement("img");
          return Z(i, "load", a(this._tileOnLoad, this, e, i)), Z(i, "error", a(this._tileOnError, this, e, i)), (this.options.crossOrigin || this.options.crossOrigin === "") && (i.crossOrigin = this.options.crossOrigin === !0 ? "" : this.options.crossOrigin), typeof this.options.referrerPolicy == "string" && (i.referrerPolicy = this.options.referrerPolicy), i.alt = "", i.src = this.getTileUrl(t), i;
        },
        // @section Extension methods
        // @uninheritable
        // Layers extending `TileLayer` might reimplement the following method.
        // @method getTileUrl(coords: Object): String
        // Called only internally, returns the URL for a tile given its coordinates.
        // Classes extending `TileLayer` can override this function to provide custom tile URL naming schemes.
        getTileUrl: function(t) {
          var e = {
            r: A.retina ? "@2x" : "",
            s: this._getSubdomain(t),
            x: t.x,
            y: t.y,
            z: this._getZoomForUrl()
          };
          if (this._map && !this._map.options.crs.infinite) {
            var i = this._globalTileRange.max.y - t.y;
            this.options.tms && (e.y = i), e["-y"] = i;
          }
          return k(this._url, y(e, this.options));
        },
        _tileOnLoad: function(t, e) {
          A.ielt9 ? setTimeout(a(t, this, null, e), 0) : t(null, e);
        },
        _tileOnError: function(t, e, i) {
          var n = this.options.errorTileUrl;
          n && e.getAttribute("src") !== n && (e.src = n), t(i, e);
        },
        _onTileRemove: function(t) {
          t.tile.onload = null;
        },
        _getZoomForUrl: function() {
          var t = this._tileZoom, e = this.options.maxZoom, i = this.options.zoomReverse, n = this.options.zoomOffset;
          return i && (t = e - t), t + n;
        },
        _getSubdomain: function(t) {
          var e = Math.abs(t.x + t.y) % this.options.subdomains.length;
          return this.options.subdomains[e];
        },
        // stops loading all tiles in the background layer
        _abortLoading: function() {
          var t, e;
          for (t in this._tiles)
            if (this._tiles[t].coords.z !== this._tileZoom && (e = this._tiles[t].el, e.onload = m, e.onerror = m, !e.complete)) {
              e.src = H;
              var i = this._tiles[t].coords;
              J(e), delete this._tiles[t], this.fire("tileabort", {
                tile: e,
                coords: i
              });
            }
        },
        _removeTile: function(t) {
          var e = this._tiles[t];
          if (e)
            return e.el.setAttribute("src", H), ae.prototype._removeTile.call(this, t);
        },
        _tileReady: function(t, e, i) {
          if (!(!this._map || i && i.getAttribute("src") === H))
            return ae.prototype._tileReady.call(this, t, e, i);
        }
      });
      function cn(t, e) {
        return new Vt(t, e);
      }
      var dn = Vt.extend({
        // @section
        // @aka TileLayer.WMS options
        // If any custom options not documented here are used, they will be sent to the
        // WMS server as extra parameters in each request URL. This can be useful for
        // [non-standard vendor WMS parameters](https://docs.geoserver.org/stable/en/user/services/wms/vendor.html).
        defaultWmsParams: {
          service: "WMS",
          request: "GetMap",
          // @option layers: String = ''
          // **(required)** Comma-separated list of WMS layers to show.
          layers: "",
          // @option styles: String = ''
          // Comma-separated list of WMS styles.
          styles: "",
          // @option format: String = 'image/jpeg'
          // WMS image format (use `'image/png'` for layers with transparency).
          format: "image/jpeg",
          // @option transparent: Boolean = false
          // If `true`, the WMS service will return images with transparency.
          transparent: !1,
          // @option version: String = '1.1.1'
          // Version of the WMS service to use
          version: "1.1.1"
        },
        options: {
          // @option crs: CRS = null
          // Coordinate Reference System to use for the WMS requests, defaults to
          // map CRS. Don't change this if you're not sure what it means.
          crs: null,
          // @option uppercase: Boolean = false
          // If `true`, WMS request parameter keys will be uppercase.
          uppercase: !1
        },
        initialize: function(t, e) {
          this._url = t;
          var i = y({}, this.defaultWmsParams);
          for (var n in e)
            n in this.options || (i[n] = e[n]);
          e = v(this, e);
          var r = e.detectRetina && A.retina ? 2 : 1, h = this.getTileSize();
          i.width = h.x * r, i.height = h.y * r, this.wmsParams = i;
        },
        onAdd: function(t) {
          this._crs = this.options.crs || t.options.crs, this._wmsVersion = parseFloat(this.wmsParams.version);
          var e = this._wmsVersion >= 1.3 ? "crs" : "srs";
          this.wmsParams[e] = this._crs.code, Vt.prototype.onAdd.call(this, t);
        },
        getTileUrl: function(t) {
          var e = this._tileCoordsToNwSe(t), i = this._crs, n = ht(i.project(e[0]), i.project(e[1])), r = n.min, h = n.max, _ = (this._wmsVersion >= 1.3 && this._crs === on ? [r.y, r.x, h.y, h.x] : [r.x, r.y, h.x, h.y]).join(","), P = Vt.prototype.getTileUrl.call(this, t);
          return P + C(this.wmsParams, P, this.options.uppercase) + (this.options.uppercase ? "&BBOX=" : "&bbox=") + _;
        },
        // @method setParams(params: Object, noRedraw?: Boolean): this
        // Merges an object with the new parameters and re-requests tiles on the current screen (unless `noRedraw` was set to true).
        setParams: function(t, e) {
          return y(this.wmsParams, t), e || this.redraw(), this;
        }
      });
      function Qo(t, e) {
        return new dn(t, e);
      }
      Vt.WMS = dn, cn.wms = Qo;
      var St = gt.extend({
        // @section
        // @aka Renderer options
        options: {
          // @option padding: Number = 0.1
          // How much to extend the clip area around the map view (relative to its size)
          // e.g. 0.1 would be 10% of map view in each direction
          padding: 0.1
        },
        initialize: function(t) {
          v(this, t), d(this), this._layers = this._layers || {};
        },
        onAdd: function() {
          this._container || (this._initContainer(), D(this._container, "leaflet-zoom-animated")), this.getPane().appendChild(this._container), this._update(), this.on("update", this._updatePaths, this);
        },
        onRemove: function() {
          this.off("update", this._updatePaths, this), this._destroyContainer();
        },
        getEvents: function() {
          var t = {
            viewreset: this._reset,
            zoom: this._onZoom,
            moveend: this._update,
            zoomend: this._onZoomEnd
          };
          return this._zoomAnimated && (t.zoomanim = this._onAnimZoom), t;
        },
        _onAnimZoom: function(t) {
          this._updateTransform(t.center, t.zoom);
        },
        _onZoom: function() {
          this._updateTransform(this._map.getCenter(), this._map.getZoom());
        },
        _updateTransform: function(t, e) {
          var i = this._map.getZoomScale(e, this._zoom), n = this._map.getSize().multiplyBy(0.5 + this.options.padding), r = this._map.project(this._center, e), h = n.multiplyBy(-i).add(r).subtract(this._map._getNewPixelOrigin(t, e));
          A.any3d ? Et(this._container, h, i) : $(this._container, h);
        },
        _reset: function() {
          this._update(), this._updateTransform(this._center, this._zoom);
          for (var t in this._layers)
            this._layers[t]._reset();
        },
        _onZoomEnd: function() {
          for (var t in this._layers)
            this._layers[t]._project();
        },
        _updatePaths: function() {
          for (var t in this._layers)
            this._layers[t]._update();
        },
        _update: function() {
          var t = this.options.padding, e = this._map.getSize(), i = this._map.containerPointToLayerPoint(e.multiplyBy(-t)).round();
          this._bounds = new V(i, i.add(e.multiplyBy(1 + t * 2)).round()), this._center = this._map.getCenter(), this._zoom = this._map.getZoom();
        }
      }), fn = St.extend({
        // @section
        // @aka Canvas options
        options: {
          // @option tolerance: Number = 0
          // How much to extend the click tolerance around a path/object on the map.
          tolerance: 0
        },
        getEvents: function() {
          var t = St.prototype.getEvents.call(this);
          return t.viewprereset = this._onViewPreReset, t;
        },
        _onViewPreReset: function() {
          this._postponeUpdatePaths = !0;
        },
        onAdd: function() {
          St.prototype.onAdd.call(this), this._draw();
        },
        _initContainer: function() {
          var t = this._container = document.createElement("canvas");
          Z(t, "mousemove", this._onMouseMove, this), Z(t, "click dblclick mousedown mouseup contextmenu", this._onClick, this), Z(t, "mouseout", this._handleMouseOut, this), t._leaflet_disable_events = !0, this._ctx = t.getContext("2d");
        },
        _destroyContainer: function() {
          rt(this._redrawRequest), delete this._ctx, J(this._container), q(this._container), delete this._container;
        },
        _updatePaths: function() {
          if (!this._postponeUpdatePaths) {
            var t;
            this._redrawBounds = null;
            for (var e in this._layers)
              t = this._layers[e], t._update();
            this._redraw();
          }
        },
        _update: function() {
          if (!(this._map._animatingZoom && this._bounds)) {
            St.prototype._update.call(this);
            var t = this._bounds, e = this._container, i = t.getSize(), n = A.retina ? 2 : 1;
            $(e, t.min), e.width = n * i.x, e.height = n * i.y, e.style.width = i.x + "px", e.style.height = i.y + "px", A.retina && this._ctx.scale(2, 2), this._ctx.translate(-t.min.x, -t.min.y), this.fire("update");
          }
        },
        _reset: function() {
          St.prototype._reset.call(this), this._postponeUpdatePaths && (this._postponeUpdatePaths = !1, this._updatePaths());
        },
        _initPath: function(t) {
          this._updateDashArray(t), this._layers[d(t)] = t;
          var e = t._order = {
            layer: t,
            prev: this._drawLast,
            next: null
          };
          this._drawLast && (this._drawLast.next = e), this._drawLast = e, this._drawFirst = this._drawFirst || this._drawLast;
        },
        _addPath: function(t) {
          this._requestRedraw(t);
        },
        _removePath: function(t) {
          var e = t._order, i = e.next, n = e.prev;
          i ? i.prev = n : this._drawLast = n, n ? n.next = i : this._drawFirst = i, delete t._order, delete this._layers[d(t)], this._requestRedraw(t);
        },
        _updatePath: function(t) {
          this._extendRedrawBounds(t), t._project(), t._update(), this._requestRedraw(t);
        },
        _updateStyle: function(t) {
          this._updateDashArray(t), this._requestRedraw(t);
        },
        _updateDashArray: function(t) {
          if (typeof t.options.dashArray == "string") {
            var e = t.options.dashArray.split(/[, ]+/), i = [], n, r;
            for (r = 0; r < e.length; r++) {
              if (n = Number(e[r]), isNaN(n))
                return;
              i.push(n);
            }
            t.options._dashArray = i;
          } else
            t.options._dashArray = t.options.dashArray;
        },
        _requestRedraw: function(t) {
          this._map && (this._extendRedrawBounds(t), this._redrawRequest = this._redrawRequest || j(this._redraw, this));
        },
        _extendRedrawBounds: function(t) {
          if (t._pxBounds) {
            var e = (t.options.weight || 0) + 1;
            this._redrawBounds = this._redrawBounds || new V(), this._redrawBounds.extend(t._pxBounds.min.subtract([e, e])), this._redrawBounds.extend(t._pxBounds.max.add([e, e]));
          }
        },
        _redraw: function() {
          this._redrawRequest = null, this._redrawBounds && (this._redrawBounds.min._floor(), this._redrawBounds.max._ceil()), this._clear(), this._draw(), this._redrawBounds = null;
        },
        _clear: function() {
          var t = this._redrawBounds;
          if (t) {
            var e = t.getSize();
            this._ctx.clearRect(t.min.x, t.min.y, e.x, e.y);
          } else
            this._ctx.save(), this._ctx.setTransform(1, 0, 0, 1, 0, 0), this._ctx.clearRect(0, 0, this._container.width, this._container.height), this._ctx.restore();
        },
        _draw: function() {
          var t, e = this._redrawBounds;
          if (this._ctx.save(), e) {
            var i = e.getSize();
            this._ctx.beginPath(), this._ctx.rect(e.min.x, e.min.y, i.x, i.y), this._ctx.clip();
          }
          this._drawing = !0;
          for (var n = this._drawFirst; n; n = n.next)
            t = n.layer, (!e || t._pxBounds && t._pxBounds.intersects(e)) && t._updatePath();
          this._drawing = !1, this._ctx.restore();
        },
        _updatePoly: function(t, e) {
          if (this._drawing) {
            var i, n, r, h, _ = t._parts, P = _.length, x = this._ctx;
            if (P) {
              for (x.beginPath(), i = 0; i < P; i++) {
                for (n = 0, r = _[i].length; n < r; n++)
                  h = _[i][n], x[n ? "lineTo" : "moveTo"](h.x, h.y);
                e && x.closePath();
              }
              this._fillStroke(x, t);
            }
          }
        },
        _updateCircle: function(t) {
          if (!(!this._drawing || t._empty())) {
            var e = t._point, i = this._ctx, n = Math.max(Math.round(t._radius), 1), r = (Math.max(Math.round(t._radiusY), 1) || n) / n;
            r !== 1 && (i.save(), i.scale(1, r)), i.beginPath(), i.arc(e.x, e.y / r, n, 0, Math.PI * 2, !1), r !== 1 && i.restore(), this._fillStroke(i, t);
          }
        },
        _fillStroke: function(t, e) {
          var i = e.options;
          i.fill && (t.globalAlpha = i.fillOpacity, t.fillStyle = i.fillColor || i.color, t.fill(i.fillRule || "evenodd")), i.stroke && i.weight !== 0 && (t.setLineDash && t.setLineDash(e.options && e.options._dashArray || []), t.globalAlpha = i.opacity, t.lineWidth = i.weight, t.strokeStyle = i.color, t.lineCap = i.lineCap, t.lineJoin = i.lineJoin, t.stroke());
        },
        // Canvas obviously doesn't have mouse events for individual drawn objects,
        // so we emulate that by calculating what's under the mouse on mousemove/click manually
        _onClick: function(t) {
          for (var e = this._map.mouseEventToLayerPoint(t), i, n, r = this._drawFirst; r; r = r.next)
            i = r.layer, i.options.interactive && i._containsPoint(e) && (!(t.type === "click" || t.type === "preclick") || !this._map._draggableMoved(i)) && (n = i);
          this._fireEvent(n ? [n] : !1, t);
        },
        _onMouseMove: function(t) {
          if (!(!this._map || this._map.dragging.moving() || this._map._animatingZoom)) {
            var e = this._map.mouseEventToLayerPoint(t);
            this._handleMouseHover(t, e);
          }
        },
        _handleMouseOut: function(t) {
          var e = this._hoveredLayer;
          e && (Y(this._container, "leaflet-interactive"), this._fireEvent([e], t, "mouseout"), this._hoveredLayer = null, this._mouseHoverThrottled = !1);
        },
        _handleMouseHover: function(t, e) {
          if (!this._mouseHoverThrottled) {
            for (var i, n, r = this._drawFirst; r; r = r.next)
              i = r.layer, i.options.interactive && i._containsPoint(e) && (n = i);
            n !== this._hoveredLayer && (this._handleMouseOut(t), n && (D(this._container, "leaflet-interactive"), this._fireEvent([n], t, "mouseover"), this._hoveredLayer = n)), this._fireEvent(this._hoveredLayer ? [this._hoveredLayer] : !1, t), this._mouseHoverThrottled = !0, setTimeout(a(function() {
              this._mouseHoverThrottled = !1;
            }, this), 32);
          }
        },
        _fireEvent: function(t, e, i) {
          this._map._fireDOMEvent(e, i || e.type, t);
        },
        _bringToFront: function(t) {
          var e = t._order;
          if (e) {
            var i = e.next, n = e.prev;
            if (i)
              i.prev = n;
            else
              return;
            n ? n.next = i : i && (this._drawFirst = i), e.prev = this._drawLast, this._drawLast.next = e, e.next = null, this._drawLast = e, this._requestRedraw(t);
          }
        },
        _bringToBack: function(t) {
          var e = t._order;
          if (e) {
            var i = e.next, n = e.prev;
            if (n)
              n.next = i;
            else
              return;
            i ? i.prev = n : n && (this._drawLast = n), e.prev = null, e.next = this._drawFirst, this._drawFirst.prev = e, this._drawFirst = e, this._requestRedraw(t);
          }
        }
      });
      function _n(t) {
        return A.canvas ? new fn(t) : null;
      }
      var he = function() {
        try {
          return document.namespaces.add("lvml", "urn:schemas-microsoft-com:vml"), function(t) {
            return document.createElement("<lvml:" + t + ' class="lvml">');
          };
        } catch {
        }
        return function(t) {
          return document.createElement("<" + t + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
        };
      }(), ts = {
        _initContainer: function() {
          this._container = F("div", "leaflet-vml-container");
        },
        _update: function() {
          this._map._animatingZoom || (St.prototype._update.call(this), this.fire("update"));
        },
        _initPath: function(t) {
          var e = t._container = he("shape");
          D(e, "leaflet-vml-shape " + (this.options.className || "")), e.coordsize = "1 1", t._path = he("path"), e.appendChild(t._path), this._updateStyle(t), this._layers[d(t)] = t;
        },
        _addPath: function(t) {
          var e = t._container;
          this._container.appendChild(e), t.options.interactive && t.addInteractiveTarget(e);
        },
        _removePath: function(t) {
          var e = t._container;
          J(e), t.removeInteractiveTarget(e), delete this._layers[d(t)];
        },
        _updateStyle: function(t) {
          var e = t._stroke, i = t._fill, n = t.options, r = t._container;
          r.stroked = !!n.stroke, r.filled = !!n.fill, n.stroke ? (e || (e = t._stroke = he("stroke")), r.appendChild(e), e.weight = n.weight + "px", e.color = n.color, e.opacity = n.opacity, n.dashArray ? e.dashStyle = I(n.dashArray) ? n.dashArray.join(" ") : n.dashArray.replace(/( *, *)/g, " ") : e.dashStyle = "", e.endcap = n.lineCap.replace("butt", "flat"), e.joinstyle = n.lineJoin) : e && (r.removeChild(e), t._stroke = null), n.fill ? (i || (i = t._fill = he("fill")), r.appendChild(i), i.color = n.fillColor || n.color, i.opacity = n.fillOpacity) : i && (r.removeChild(i), t._fill = null);
        },
        _updateCircle: function(t) {
          var e = t._point.round(), i = Math.round(t._radius), n = Math.round(t._radiusY || i);
          this._setPath(t, t._empty() ? "M0 0" : "AL " + e.x + "," + e.y + " " + i + "," + n + " 0," + 65535 * 360);
        },
        _setPath: function(t, e) {
          t._path.v = e;
        },
        _bringToFront: function(t) {
          Ut(t._container);
        },
        _bringToBack: function(t) {
          Ht(t._container);
        }
      }, Te = A.vml ? he : gi, ue = St.extend({
        _initContainer: function() {
          this._container = Te("svg"), this._container.setAttribute("pointer-events", "none"), this._rootGroup = Te("g"), this._container.appendChild(this._rootGroup);
        },
        _destroyContainer: function() {
          J(this._container), q(this._container), delete this._container, delete this._rootGroup, delete this._svgSize;
        },
        _update: function() {
          if (!(this._map._animatingZoom && this._bounds)) {
            St.prototype._update.call(this);
            var t = this._bounds, e = t.getSize(), i = this._container;
            (!this._svgSize || !this._svgSize.equals(e)) && (this._svgSize = e, i.setAttribute("width", e.x), i.setAttribute("height", e.y)), $(i, t.min), i.setAttribute("viewBox", [t.min.x, t.min.y, e.x, e.y].join(" ")), this.fire("update");
          }
        },
        // methods below are called by vector layers implementations
        _initPath: function(t) {
          var e = t._path = Te("path");
          t.options.className && D(e, t.options.className), t.options.interactive && D(e, "leaflet-interactive"), this._updateStyle(t), this._layers[d(t)] = t;
        },
        _addPath: function(t) {
          this._rootGroup || this._initContainer(), this._rootGroup.appendChild(t._path), t.addInteractiveTarget(t._path);
        },
        _removePath: function(t) {
          J(t._path), t.removeInteractiveTarget(t._path), delete this._layers[d(t)];
        },
        _updatePath: function(t) {
          t._project(), t._update();
        },
        _updateStyle: function(t) {
          var e = t._path, i = t.options;
          e && (i.stroke ? (e.setAttribute("stroke", i.color), e.setAttribute("stroke-opacity", i.opacity), e.setAttribute("stroke-width", i.weight), e.setAttribute("stroke-linecap", i.lineCap), e.setAttribute("stroke-linejoin", i.lineJoin), i.dashArray ? e.setAttribute("stroke-dasharray", i.dashArray) : e.removeAttribute("stroke-dasharray"), i.dashOffset ? e.setAttribute("stroke-dashoffset", i.dashOffset) : e.removeAttribute("stroke-dashoffset")) : e.setAttribute("stroke", "none"), i.fill ? (e.setAttribute("fill", i.fillColor || i.color), e.setAttribute("fill-opacity", i.fillOpacity), e.setAttribute("fill-rule", i.fillRule || "evenodd")) : e.setAttribute("fill", "none"));
        },
        _updatePoly: function(t, e) {
          this._setPath(t, vi(t._parts, e));
        },
        _updateCircle: function(t) {
          var e = t._point, i = Math.max(Math.round(t._radius), 1), n = Math.max(Math.round(t._radiusY), 1) || i, r = "a" + i + "," + n + " 0 1,0 ", h = t._empty() ? "M0 0" : "M" + (e.x - i) + "," + e.y + r + i * 2 + ",0 " + r + -i * 2 + ",0 ";
          this._setPath(t, h);
        },
        _setPath: function(t, e) {
          t._path.setAttribute("d", e);
        },
        // SVG does not have the concept of zIndex so we resort to changing the DOM order of elements
        _bringToFront: function(t) {
          Ut(t._path);
        },
        _bringToBack: function(t) {
          Ht(t._path);
        }
      });
      A.vml && ue.include(ts);
      function mn(t) {
        return A.svg || A.vml ? new ue(t) : null;
      }
      G.include({
        // @namespace Map; @method getRenderer(layer: Path): Renderer
        // Returns the instance of `Renderer` that should be used to render the given
        // `Path`. It will ensure that the `renderer` options of the map and paths
        // are respected, and that the renderers do exist on the map.
        getRenderer: function(t) {
          var e = t.options.renderer || this._getPaneRenderer(t.options.pane) || this.options.renderer || this._renderer;
          return e || (e = this._renderer = this._createRenderer()), this.hasLayer(e) || this.addLayer(e), e;
        },
        _getPaneRenderer: function(t) {
          if (t === "overlayPane" || t === void 0)
            return !1;
          var e = this._paneRenderers[t];
          return e === void 0 && (e = this._createRenderer({ pane: t }), this._paneRenderers[t] = e), e;
        },
        _createRenderer: function(t) {
          return this.options.preferCanvas && _n(t) || mn(t);
        }
      });
      var pn = qt.extend({
        initialize: function(t, e) {
          qt.prototype.initialize.call(this, this._boundsToLatLngs(t), e);
        },
        // @method setBounds(latLngBounds: LatLngBounds): this
        // Redraws the rectangle with the passed bounds.
        setBounds: function(t) {
          return this.setLatLngs(this._boundsToLatLngs(t));
        },
        _boundsToLatLngs: function(t) {
          return t = X(t), [
            t.getSouthWest(),
            t.getNorthWest(),
            t.getNorthEast(),
            t.getSouthEast()
          ];
        }
      });
      function es(t, e) {
        return new pn(t, e);
      }
      ue.create = Te, ue.pointsToPath = vi, Tt.geometryToLayer = Le, Tt.coordsToLatLng = li, Tt.coordsToLatLngs = we, Tt.latLngToCoords = ci, Tt.latLngsToCoords = Pe, Tt.getFeature = jt, Tt.asFeature = xe, G.mergeOptions({
        // @option boxZoom: Boolean = true
        // Whether the map can be zoomed to a rectangular area specified by
        // dragging the mouse while pressing the shift key.
        boxZoom: !0
      });
      var gn = Lt.extend({
        initialize: function(t) {
          this._map = t, this._container = t._container, this._pane = t._panes.overlayPane, this._resetStateTimeout = 0, t.on("unload", this._destroy, this);
        },
        addHooks: function() {
          Z(this._container, "mousedown", this._onMouseDown, this);
        },
        removeHooks: function() {
          q(this._container, "mousedown", this._onMouseDown, this);
        },
        moved: function() {
          return this._moved;
        },
        _destroy: function() {
          J(this._pane), delete this._pane;
        },
        _resetState: function() {
          this._resetStateTimeout = 0, this._moved = !1;
        },
        _clearDeferredResetState: function() {
          this._resetStateTimeout !== 0 && (clearTimeout(this._resetStateTimeout), this._resetStateTimeout = 0);
        },
        _onMouseDown: function(t) {
          if (!t.shiftKey || t.which !== 1 && t.button !== 1)
            return !1;
          this._clearDeferredResetState(), this._resetState(), te(), Ve(), this._startPoint = this._map.mouseEventToContainerPoint(t), Z(document, {
            contextmenu: Dt,
            mousemove: this._onMouseMove,
            mouseup: this._onMouseUp,
            keydown: this._onKeyDown
          }, this);
        },
        _onMouseMove: function(t) {
          this._moved || (this._moved = !0, this._box = F("div", "leaflet-zoom-box", this._container), D(this._container, "leaflet-crosshair"), this._map.fire("boxzoomstart")), this._point = this._map.mouseEventToContainerPoint(t);
          var e = new V(this._point, this._startPoint), i = e.getSize();
          $(this._box, e.min), this._box.style.width = i.x + "px", this._box.style.height = i.y + "px";
        },
        _finish: function() {
          this._moved && (J(this._box), Y(this._container, "leaflet-crosshair")), ee(), Je(), q(document, {
            contextmenu: Dt,
            mousemove: this._onMouseMove,
            mouseup: this._onMouseUp,
            keydown: this._onKeyDown
          }, this);
        },
        _onMouseUp: function(t) {
          if (!(t.which !== 1 && t.button !== 1) && (this._finish(), !!this._moved)) {
            this._clearDeferredResetState(), this._resetStateTimeout = setTimeout(a(this._resetState, this), 0);
            var e = new ut(
              this._map.containerPointToLatLng(this._startPoint),
              this._map.containerPointToLatLng(this._point)
            );
            this._map.fitBounds(e).fire("boxzoomend", { boxZoomBounds: e });
          }
        },
        _onKeyDown: function(t) {
          t.keyCode === 27 && (this._finish(), this._clearDeferredResetState(), this._resetState());
        }
      });
      G.addInitHook("addHandler", "boxZoom", gn), G.mergeOptions({
        // @option doubleClickZoom: Boolean|String = true
        // Whether the map can be zoomed in by double clicking on it and
        // zoomed out by double clicking while holding shift. If passed
        // `'center'`, double-click zoom will zoom to the center of the
        //  view regardless of where the mouse was.
        doubleClickZoom: !0
      });
      var vn = Lt.extend({
        addHooks: function() {
          this._map.on("dblclick", this._onDoubleClick, this);
        },
        removeHooks: function() {
          this._map.off("dblclick", this._onDoubleClick, this);
        },
        _onDoubleClick: function(t) {
          var e = this._map, i = e.getZoom(), n = e.options.zoomDelta, r = t.originalEvent.shiftKey ? i - n : i + n;
          e.options.doubleClickZoom === "center" ? e.setZoom(r) : e.setZoomAround(t.containerPoint, r);
        }
      });
      G.addInitHook("addHandler", "doubleClickZoom", vn), G.mergeOptions({
        // @option dragging: Boolean = true
        // Whether the map is draggable with mouse/touch or not.
        dragging: !0,
        // @section Panning Inertia Options
        // @option inertia: Boolean = *
        // If enabled, panning of the map will have an inertia effect where
        // the map builds momentum while dragging and continues moving in
        // the same direction for some time. Feels especially nice on touch
        // devices. Enabled by default.
        inertia: !0,
        // @option inertiaDeceleration: Number = 3000
        // The rate with which the inertial movement slows down, in pixels/second².
        inertiaDeceleration: 3400,
        // px/s^2
        // @option inertiaMaxSpeed: Number = Infinity
        // Max speed of the inertial movement, in pixels/second.
        inertiaMaxSpeed: 1 / 0,
        // px/s
        // @option easeLinearity: Number = 0.2
        easeLinearity: 0.2,
        // TODO refactor, move to CRS
        // @option worldCopyJump: Boolean = false
        // With this option enabled, the map tracks when you pan to another "copy"
        // of the world and seamlessly jumps to the original one so that all overlays
        // like markers and vector layers are still visible.
        worldCopyJump: !1,
        // @option maxBoundsViscosity: Number = 0.0
        // If `maxBounds` is set, this option will control how solid the bounds
        // are when dragging the map around. The default value of `0.0` allows the
        // user to drag outside the bounds at normal speed, higher values will
        // slow down map dragging outside bounds, and `1.0` makes the bounds fully
        // solid, preventing the user from dragging outside the bounds.
        maxBoundsViscosity: 0
      });
      var yn = Lt.extend({
        addHooks: function() {
          if (!this._draggable) {
            var t = this._map;
            this._draggable = new It(t._mapPane, t._container), this._draggable.on({
              dragstart: this._onDragStart,
              drag: this._onDrag,
              dragend: this._onDragEnd
            }, this), this._draggable.on("predrag", this._onPreDragLimit, this), t.options.worldCopyJump && (this._draggable.on("predrag", this._onPreDragWrap, this), t.on("zoomend", this._onZoomEnd, this), t.whenReady(this._onZoomEnd, this));
          }
          D(this._map._container, "leaflet-grab leaflet-touch-drag"), this._draggable.enable(), this._positions = [], this._times = [];
        },
        removeHooks: function() {
          Y(this._map._container, "leaflet-grab"), Y(this._map._container, "leaflet-touch-drag"), this._draggable.disable();
        },
        moved: function() {
          return this._draggable && this._draggable._moved;
        },
        moving: function() {
          return this._draggable && this._draggable._moving;
        },
        _onDragStart: function() {
          var t = this._map;
          if (t._stop(), this._map.options.maxBounds && this._map.options.maxBoundsViscosity) {
            var e = X(this._map.options.maxBounds);
            this._offsetLimit = ht(
              this._map.latLngToContainerPoint(e.getNorthWest()).multiplyBy(-1),
              this._map.latLngToContainerPoint(e.getSouthEast()).multiplyBy(-1).add(this._map.getSize())
            ), this._viscosity = Math.min(1, Math.max(0, this._map.options.maxBoundsViscosity));
          } else
            this._offsetLimit = null;
          t.fire("movestart").fire("dragstart"), t.options.inertia && (this._positions = [], this._times = []);
        },
        _onDrag: function(t) {
          if (this._map.options.inertia) {
            var e = this._lastTime = +/* @__PURE__ */ new Date(), i = this._lastPos = this._draggable._absPos || this._draggable._newPos;
            this._positions.push(i), this._times.push(e), this._prunePositions(e);
          }
          this._map.fire("move", t).fire("drag", t);
        },
        _prunePositions: function(t) {
          for (; this._positions.length > 1 && t - this._times[0] > 50; )
            this._positions.shift(), this._times.shift();
        },
        _onZoomEnd: function() {
          var t = this._map.getSize().divideBy(2), e = this._map.latLngToLayerPoint([0, 0]);
          this._initialWorldOffset = e.subtract(t).x, this._worldWidth = this._map.getPixelWorldBounds().getSize().x;
        },
        _viscousLimit: function(t, e) {
          return t - (t - e) * this._viscosity;
        },
        _onPreDragLimit: function() {
          if (!(!this._viscosity || !this._offsetLimit)) {
            var t = this._draggable._newPos.subtract(this._draggable._startPos), e = this._offsetLimit;
            t.x < e.min.x && (t.x = this._viscousLimit(t.x, e.min.x)), t.y < e.min.y && (t.y = this._viscousLimit(t.y, e.min.y)), t.x > e.max.x && (t.x = this._viscousLimit(t.x, e.max.x)), t.y > e.max.y && (t.y = this._viscousLimit(t.y, e.max.y)), this._draggable._newPos = this._draggable._startPos.add(t);
          }
        },
        _onPreDragWrap: function() {
          var t = this._worldWidth, e = Math.round(t / 2), i = this._initialWorldOffset, n = this._draggable._newPos.x, r = (n - e + i) % t + e - i, h = (n + e + i) % t - e - i, _ = Math.abs(r + i) < Math.abs(h + i) ? r : h;
          this._draggable._absPos = this._draggable._newPos.clone(), this._draggable._newPos.x = _;
        },
        _onDragEnd: function(t) {
          var e = this._map, i = e.options, n = !i.inertia || t.noInertia || this._times.length < 2;
          if (e.fire("dragend", t), n)
            e.fire("moveend");
          else {
            this._prunePositions(+/* @__PURE__ */ new Date());
            var r = this._lastPos.subtract(this._positions[0]), h = (this._lastTime - this._times[0]) / 1e3, _ = i.easeLinearity, P = r.multiplyBy(_ / h), x = P.distanceTo([0, 0]), S = Math.min(i.inertiaMaxSpeed, x), z = P.multiplyBy(S / x), O = S / (i.inertiaDeceleration * _), R = z.multiplyBy(-O / 2).round();
            !R.x && !R.y ? e.fire("moveend") : (R = e._limitOffset(R, e.options.maxBounds), j(function() {
              e.panBy(R, {
                duration: O,
                easeLinearity: _,
                noMoveStart: !0,
                animate: !0
              });
            }));
          }
        }
      });
      G.addInitHook("addHandler", "dragging", yn), G.mergeOptions({
        // @option keyboard: Boolean = true
        // Makes the map focusable and allows users to navigate the map with keyboard
        // arrows and `+`/`-` keys.
        keyboard: !0,
        // @option keyboardPanDelta: Number = 80
        // Amount of pixels to pan when pressing an arrow key.
        keyboardPanDelta: 80
      });
      var Ln = Lt.extend({
        keyCodes: {
          left: [37],
          right: [39],
          down: [40],
          up: [38],
          zoomIn: [187, 107, 61, 171],
          zoomOut: [189, 109, 54, 173]
        },
        initialize: function(t) {
          this._map = t, this._setPanDelta(t.options.keyboardPanDelta), this._setZoomDelta(t.options.zoomDelta);
        },
        addHooks: function() {
          var t = this._map._container;
          t.tabIndex <= 0 && (t.tabIndex = "0"), Z(t, {
            focus: this._onFocus,
            blur: this._onBlur,
            mousedown: this._onMouseDown
          }, this), this._map.on({
            focus: this._addHooks,
            blur: this._removeHooks
          }, this);
        },
        removeHooks: function() {
          this._removeHooks(), q(this._map._container, {
            focus: this._onFocus,
            blur: this._onBlur,
            mousedown: this._onMouseDown
          }, this), this._map.off({
            focus: this._addHooks,
            blur: this._removeHooks
          }, this);
        },
        _onMouseDown: function() {
          if (!this._focused) {
            var t = document.body, e = document.documentElement, i = t.scrollTop || e.scrollTop, n = t.scrollLeft || e.scrollLeft;
            this._map._container.focus(), window.scrollTo(n, i);
          }
        },
        _onFocus: function() {
          this._focused = !0, this._map.fire("focus");
        },
        _onBlur: function() {
          this._focused = !1, this._map.fire("blur");
        },
        _setPanDelta: function(t) {
          var e = this._panKeys = {}, i = this.keyCodes, n, r;
          for (n = 0, r = i.left.length; n < r; n++)
            e[i.left[n]] = [-1 * t, 0];
          for (n = 0, r = i.right.length; n < r; n++)
            e[i.right[n]] = [t, 0];
          for (n = 0, r = i.down.length; n < r; n++)
            e[i.down[n]] = [0, t];
          for (n = 0, r = i.up.length; n < r; n++)
            e[i.up[n]] = [0, -1 * t];
        },
        _setZoomDelta: function(t) {
          var e = this._zoomKeys = {}, i = this.keyCodes, n, r;
          for (n = 0, r = i.zoomIn.length; n < r; n++)
            e[i.zoomIn[n]] = t;
          for (n = 0, r = i.zoomOut.length; n < r; n++)
            e[i.zoomOut[n]] = -t;
        },
        _addHooks: function() {
          Z(document, "keydown", this._onKeyDown, this);
        },
        _removeHooks: function() {
          q(document, "keydown", this._onKeyDown, this);
        },
        _onKeyDown: function(t) {
          if (!(t.altKey || t.ctrlKey || t.metaKey)) {
            var e = t.keyCode, i = this._map, n;
            if (e in this._panKeys) {
              if (!i._panAnim || !i._panAnim._inProgress)
                if (n = this._panKeys[e], t.shiftKey && (n = E(n).multiplyBy(3)), i.options.maxBounds && (n = i._limitOffset(E(n), i.options.maxBounds)), i.options.worldCopyJump) {
                  var r = i.wrapLatLng(i.unproject(i.project(i.getCenter()).add(n)));
                  i.panTo(r);
                } else
                  i.panBy(n);
            } else if (e in this._zoomKeys)
              i.setZoom(i.getZoom() + (t.shiftKey ? 3 : 1) * this._zoomKeys[e]);
            else if (e === 27 && i._popup && i._popup.options.closeOnEscapeKey)
              i.closePopup();
            else
              return;
            Dt(t);
          }
        }
      });
      G.addInitHook("addHandler", "keyboard", Ln), G.mergeOptions({
        // @section Mouse wheel options
        // @option scrollWheelZoom: Boolean|String = true
        // Whether the map can be zoomed by using the mouse wheel. If passed `'center'`,
        // it will zoom to the center of the view regardless of where the mouse was.
        scrollWheelZoom: !0,
        // @option wheelDebounceTime: Number = 40
        // Limits the rate at which a wheel can fire (in milliseconds). By default
        // user can't zoom via wheel more often than once per 40 ms.
        wheelDebounceTime: 40,
        // @option wheelPxPerZoomLevel: Number = 60
        // How many scroll pixels (as reported by [L.DomEvent.getWheelDelta](#domevent-getwheeldelta))
        // mean a change of one full zoom level. Smaller values will make wheel-zooming
        // faster (and vice versa).
        wheelPxPerZoomLevel: 60
      });
      var wn = Lt.extend({
        addHooks: function() {
          Z(this._map._container, "wheel", this._onWheelScroll, this), this._delta = 0;
        },
        removeHooks: function() {
          q(this._map._container, "wheel", this._onWheelScroll, this);
        },
        _onWheelScroll: function(t) {
          var e = Wi(t), i = this._map.options.wheelDebounceTime;
          this._delta += e, this._lastMousePos = this._map.mouseEventToContainerPoint(t), this._startTime || (this._startTime = +/* @__PURE__ */ new Date());
          var n = Math.max(i - (+/* @__PURE__ */ new Date() - this._startTime), 0);
          clearTimeout(this._timer), this._timer = setTimeout(a(this._performZoom, this), n), Dt(t);
        },
        _performZoom: function() {
          var t = this._map, e = t.getZoom(), i = this._map.options.zoomSnap || 0;
          t._stop();
          var n = this._delta / (this._map.options.wheelPxPerZoomLevel * 4), r = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(n)))) / Math.LN2, h = i ? Math.ceil(r / i) * i : r, _ = t._limitZoom(e + (this._delta > 0 ? h : -h)) - e;
          this._delta = 0, this._startTime = null, _ && (t.options.scrollWheelZoom === "center" ? t.setZoom(e + _) : t.setZoomAround(this._lastMousePos, e + _));
        }
      });
      G.addInitHook("addHandler", "scrollWheelZoom", wn);
      var is = 600;
      G.mergeOptions({
        // @section Touch interaction options
        // @option tapHold: Boolean
        // Enables simulation of `contextmenu` event, default is `true` for mobile Safari.
        tapHold: A.touchNative && A.safari && A.mobile,
        // @option tapTolerance: Number = 15
        // The max number of pixels a user can shift his finger during touch
        // for it to be considered a valid tap.
        tapTolerance: 15
      });
      var Pn = Lt.extend({
        addHooks: function() {
          Z(this._map._container, "touchstart", this._onDown, this);
        },
        removeHooks: function() {
          q(this._map._container, "touchstart", this._onDown, this);
        },
        _onDown: function(t) {
          if (clearTimeout(this._holdTimeout), t.touches.length === 1) {
            var e = t.touches[0];
            this._startPos = this._newPos = new B(e.clientX, e.clientY), this._holdTimeout = setTimeout(a(function() {
              this._cancel(), this._isTapValid() && (Z(document, "touchend", et), Z(document, "touchend touchcancel", this._cancelClickPrevent), this._simulateEvent("contextmenu", e));
            }, this), is), Z(document, "touchend touchcancel contextmenu", this._cancel, this), Z(document, "touchmove", this._onMove, this);
          }
        },
        _cancelClickPrevent: function t() {
          q(document, "touchend", et), q(document, "touchend touchcancel", t);
        },
        _cancel: function() {
          clearTimeout(this._holdTimeout), q(document, "touchend touchcancel contextmenu", this._cancel, this), q(document, "touchmove", this._onMove, this);
        },
        _onMove: function(t) {
          var e = t.touches[0];
          this._newPos = new B(e.clientX, e.clientY);
        },
        _isTapValid: function() {
          return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
        },
        _simulateEvent: function(t, e) {
          var i = new MouseEvent(t, {
            bubbles: !0,
            cancelable: !0,
            view: window,
            // detail: 1,
            screenX: e.screenX,
            screenY: e.screenY,
            clientX: e.clientX,
            clientY: e.clientY
            // button: 2,
            // buttons: 2
          });
          i._simulated = !0, e.target.dispatchEvent(i);
        }
      });
      G.addInitHook("addHandler", "tapHold", Pn), G.mergeOptions({
        // @section Touch interaction options
        // @option touchZoom: Boolean|String = *
        // Whether the map can be zoomed by touch-dragging with two fingers. If
        // passed `'center'`, it will zoom to the center of the view regardless of
        // where the touch events (fingers) were. Enabled for touch-capable web
        // browsers.
        touchZoom: A.touch,
        // @option bounceAtZoomLimits: Boolean = true
        // Set it to false if you don't want the map to zoom beyond min/max zoom
        // and then bounce back when pinch-zooming.
        bounceAtZoomLimits: !0
      });
      var xn = Lt.extend({
        addHooks: function() {
          D(this._map._container, "leaflet-touch-zoom"), Z(this._map._container, "touchstart", this._onTouchStart, this);
        },
        removeHooks: function() {
          Y(this._map._container, "leaflet-touch-zoom"), q(this._map._container, "touchstart", this._onTouchStart, this);
        },
        _onTouchStart: function(t) {
          var e = this._map;
          if (!(!t.touches || t.touches.length !== 2 || e._animatingZoom || this._zooming)) {
            var i = e.mouseEventToContainerPoint(t.touches[0]), n = e.mouseEventToContainerPoint(t.touches[1]);
            this._centerPoint = e.getSize()._divideBy(2), this._startLatLng = e.containerPointToLatLng(this._centerPoint), e.options.touchZoom !== "center" && (this._pinchStartLatLng = e.containerPointToLatLng(i.add(n)._divideBy(2))), this._startDist = i.distanceTo(n), this._startZoom = e.getZoom(), this._moved = !1, this._zooming = !0, e._stop(), Z(document, "touchmove", this._onTouchMove, this), Z(document, "touchend touchcancel", this._onTouchEnd, this), et(t);
          }
        },
        _onTouchMove: function(t) {
          if (!(!t.touches || t.touches.length !== 2 || !this._zooming)) {
            var e = this._map, i = e.mouseEventToContainerPoint(t.touches[0]), n = e.mouseEventToContainerPoint(t.touches[1]), r = i.distanceTo(n) / this._startDist;
            if (this._zoom = e.getScaleZoom(r, this._startZoom), !e.options.bounceAtZoomLimits && (this._zoom < e.getMinZoom() && r < 1 || this._zoom > e.getMaxZoom() && r > 1) && (this._zoom = e._limitZoom(this._zoom)), e.options.touchZoom === "center") {
              if (this._center = this._startLatLng, r === 1)
                return;
            } else {
              var h = i._add(n)._divideBy(2)._subtract(this._centerPoint);
              if (r === 1 && h.x === 0 && h.y === 0)
                return;
              this._center = e.unproject(e.project(this._pinchStartLatLng, this._zoom).subtract(h), this._zoom);
            }
            this._moved || (e._moveStart(!0, !1), this._moved = !0), rt(this._animRequest);
            var _ = a(e._move, e, this._center, this._zoom, { pinch: !0, round: !1 }, void 0);
            this._animRequest = j(_, this, !0), et(t);
          }
        },
        _onTouchEnd: function() {
          if (!this._moved || !this._zooming) {
            this._zooming = !1;
            return;
          }
          this._zooming = !1, rt(this._animRequest), q(document, "touchmove", this._onTouchMove, this), q(document, "touchend touchcancel", this._onTouchEnd, this), this._map.options.zoomAnimation ? this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), !0, this._map.options.zoomSnap) : this._map._resetView(this._center, this._map._limitZoom(this._zoom));
        }
      });
      G.addInitHook("addHandler", "touchZoom", xn), G.BoxZoom = gn, G.DoubleClickZoom = vn, G.Drag = yn, G.Keyboard = Ln, G.ScrollWheelZoom = wn, G.TapHold = Pn, G.TouchZoom = xn, s.Bounds = V, s.Browser = A, s.CRS = Mt, s.Canvas = fn, s.Circle = ui, s.CircleMarker = ye, s.Class = xt, s.Control = pt, s.DivIcon = ln, s.DivOverlay = wt, s.DomEvent = Lo, s.DomUtil = vo, s.Draggable = It, s.Evented = Kt, s.FeatureGroup = bt, s.GeoJSON = Tt, s.GridLayer = ae, s.Handler = Lt, s.Icon = Wt, s.ImageOverlay = Me, s.LatLng = W, s.LatLngBounds = ut, s.Layer = gt, s.LayerGroup = Ft, s.LineUtil = Oo, s.Map = G, s.Marker = ve, s.Mixin = To, s.Path = zt, s.Point = B, s.PolyUtil = So, s.Polygon = qt, s.Polyline = Ct, s.Popup = be, s.PosAnimation = qi, s.Projection = Eo, s.Rectangle = pn, s.Renderer = St, s.SVG = ue, s.SVGOverlay = un, s.TileLayer = Vt, s.Tooltip = Ce, s.Transformation = Be, s.Util = Oe, s.VideoOverlay = hn, s.bind = a, s.bounds = ht, s.canvas = _n, s.circle = Ho, s.circleMarker = Uo, s.control = oe, s.divIcon = Xo, s.extend = y, s.featureGroup = Ro, s.geoJSON = an, s.geoJson = qo, s.gridLayer = $o, s.icon = No, s.imageOverlay = jo, s.latLng = N, s.latLngBounds = X, s.layerGroup = Do, s.map = wo, s.marker = Go, s.point = E, s.polygon = Wo, s.polyline = Fo, s.popup = Ko, s.rectangle = es, s.setOptions = v, s.stamp = d, s.svg = mn, s.svgOverlay = Jo, s.tileLayer = cn, s.tooltip = Yo, s.transformation = Yt, s.version = c, s.videoOverlay = Vo;
      var ns = window.L;
      s.noConflict = function() {
        return window.L = ns, this;
      }, window.L = s;
    });
  }(ke, ke.exports)), ke.exports;
}
var Ss = Nn();
const K = /* @__PURE__ */ Dn(Ss);
L.Proj && (L.CRS.Baidu = new L.Proj.CRS("EPSG:900913", "+proj=merc +a=6378206 +b=6356584.314245179 +lat_ts=0.0 +lon_0=0.0 +x_0=0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs", {
  resolutions: function() {
    var p = 19, u = [];
    u[0] = Math.pow(2, 18);
    for (var s = 1; s < p; s++)
      u[s] = Math.pow(2, 18 - s);
    return u;
  }(),
  origin: [0, 0],
  bounds: L.bounds([20037508342789244e-9, 0], [0, 20037508342789244e-9])
}));
L.TileLayer.ChinaProvider = L.TileLayer.extend({
  initialize: function(p, u) {
    var s = L.TileLayer.ChinaProvider.providers;
    u = u || {};
    var c = p.split("."), y = c[0], o = c[1], a = c[2], l = s[y][o][a];
    u.subdomains = s[y].Subdomains, u.key = u.key || s[y].key, "tms" in s[y] && (u.tms = s[y].tms), L.TileLayer.prototype.initialize.call(this, l, u);
  },
  getTileUrl: function(p) {
    var u = {
      s: this._getSubdomain(p),
      x: p.x,
      y: p.y,
      z: this._getZoomForUrl()
    };
    if (this._map && !this._map.options.crs.infinite) {
      var s = this._globalTileRange.max.y - p.y;
      this.options.tms && (u.y = s), u["-y"] = s;
    }
    return u.sx = u.x >> 4, u.sy = (1 << u.z) - u.y >> 4, L.Util.template(this._url, L.Util.extend(u, this.options));
  }
});
L.TileLayer.ChinaProvider.providers = {
  TianDiTu: {
    Normal: {
      Map: "//t{s}.tianditu.gov.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}&tk={key}",
      Annotion: "//t{s}.tianditu.gov.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}&tk={key}"
    },
    Satellite: {
      Map: "//t{s}.tianditu.gov.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}&tk={key}",
      Annotion: "//t{s}.tianditu.gov.cn/DataServer?T=cia_w&X={x}&Y={y}&L={z}&tk={key}"
    },
    Terrain: {
      Map: "//t{s}.tianditu.gov.cn/DataServer?T=ter_w&X={x}&Y={y}&L={z}&tk={key}",
      Annotion: "//t{s}.tianditu.gov.cn/DataServer?T=cta_w&X={x}&Y={y}&L={z}&tk={key}"
    },
    Subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
    key: "174705aebfe31b79b3587279e211cb9a"
  },
  GaoDe: {
    Normal: {
      Map: "//webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
    },
    Satellite: {
      Map: "//webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
      Annotion: "//webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}"
    },
    Subdomains: ["1", "2", "3", "4"]
  },
  Google: {
    Normal: {
      Map: "//www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
    },
    Satellite: {
      Map: "//www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}",
      Annotion: "//www.google.cn/maps/vt?lyrs=y@189&gl=cn&x={x}&y={y}&z={z}"
    },
    Subdomains: []
  },
  Geoq: {
    Normal: {
      Map: "//map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}",
      PurplishBlue: "//map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
      Gray: "//map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}",
      Warm: "//map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}"
    },
    Theme: {
      Hydro: "//thematic.geoq.cn/arcgis/rest/services/ThematicMaps/WorldHydroMap/MapServer/tile/{z}/{y}/{x}"
    },
    Subdomains: []
  },
  OSM: {
    Normal: {
      Map: "//{s}.tile.osm.org/{z}/{x}/{y}.png"
    },
    Subdomains: ["a", "b", "c"]
  },
  Baidu: {
    Normal: {
      Map: "//online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1"
    },
    Satellite: {
      Map: "//shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46",
      Annotion: "//online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl&v=020"
    },
    Subdomains: "0123456789",
    tms: !0
  },
  Tencent: {
    Normal: {
      Map: "//rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={-y}&type=vector&styleid=3"
    },
    Satellite: {
      Map: "//p{s}.map.gtimg.com/sateTiles/{z}/{sx}/{sy}/{x}_{-y}.jpg"
    },
    Terrain: {
      Map: "//p{s}.map.gtimg.com/demTiles/{z}/{sx}/{sy}/{x}_{-y}.jpg"
    },
    Subdomains: "0123"
  }
};
L.tileLayer.chinaProvider = function(p, u) {
  return new L.TileLayer.ChinaProvider(p, u);
};
(function(p, u) {
  (function(s, c) {
    c(Nn());
  })(Ae, function(s) {
    s = s && s.hasOwnProperty("default") ? s.default : s;
    function c(g, f) {
      var v = f.x - g.x, C = f.y - g.y;
      return Math.sqrt(v * v + C * C);
    }
    var y = function(f, v) {
      return (Math.atan2(v.y - f.y, v.x - f.x) * 180 / Math.PI + 90 + 360) % 360;
    }, o = function(f, v) {
      var C = f.value, T = f.isInPixels;
      return T ? C / v : C;
    };
    function a(g) {
      if (typeof g == "string" && g.indexOf("%") !== -1)
        return {
          value: parseFloat(g) / 100,
          isInPixels: !1
        };
      var f = g ? parseFloat(g) : 0;
      return {
        value: f,
        isInPixels: f > 0
      };
    }
    var l = function(f, v) {
      return f.x === v.x && f.y === v.y;
    };
    function d(g) {
      return g.reduce(function(f, v, C, T) {
        if (C > 0 && !l(v, T[C - 1])) {
          var k = T[C - 1], I = f.length > 0 ? f[f.length - 1].distB : 0, U = c(k, v);
          f.push({
            a: k,
            b: v,
            distA: I,
            distB: I + U,
            heading: y(k, v)
          });
        }
        return f;
      }, []);
    }
    function w(g, f) {
      var v = d(g), C = v.length;
      if (C === 0)
        return [];
      var T = v[C - 1].distB, k = o(f.offset, T), I = o(f.endOffset, T), U = o(f.repeat, T), H = T * U, st = k > 0 ? T * k : 0, Pt = I > 0 ? T * I : 0, At = [], Ot = st;
      do
        At.push(Ot), Ot += H;
      while (H > 0 && Ot < T - Pt);
      var Nt = 0, j = v[0];
      return At.map(function(rt) {
        for (; rt > j.distB && Nt < C - 1; )
          Nt++, j = v[Nt];
        var Oe = (rt - j.distA) / (j.distB - j.distA);
        return {
          pt: M(j.a, j.b, Oe),
          heading: j.heading
        };
      });
    }
    function M(g, f, v) {
      return f.x !== g.x ? {
        x: g.x + v * (f.x - g.x),
        y: g.y + v * (f.y - g.y)
      } : {
        x: g.x,
        y: g.y + (f.y - g.y) * v
      };
    }
    (function() {
      var g = L.Marker.prototype._initIcon, f = L.Marker.prototype._setPos, v = L.DomUtil.TRANSFORM === "msTransform";
      L.Marker.addInitHook(function() {
        var C = this.options.icon && this.options.icon.options, T = C && this.options.icon.options.iconAnchor;
        T && (T = T[0] + "px " + T[1] + "px"), this.options.rotationOrigin = this.options.rotationOrigin || T || "center bottom", this.options.rotationAngle = this.options.rotationAngle || 0, this.on("drag", function(k) {
          k.target._applyRotation();
        });
      }), L.Marker.include({
        _initIcon: function() {
          g.call(this);
        },
        _setPos: function(C) {
          f.call(this, C), this._applyRotation();
        },
        _applyRotation: function() {
          this.options.rotationAngle && (this._icon.style[L.DomUtil.TRANSFORM + "Origin"] = this.options.rotationOrigin, v ? this._icon.style[L.DomUtil.TRANSFORM] = "rotate(" + this.options.rotationAngle + "deg)" : this._icon.style[L.DomUtil.TRANSFORM] += " rotateZ(" + this.options.rotationAngle + "deg)");
        },
        setRotationAngle: function(C) {
          return this.options.rotationAngle = C, this.update(), this;
        },
        setRotationOrigin: function(C) {
          return this.options.rotationOrigin = C, this.update(), this;
        }
      });
    })(), s.Symbol = s.Symbol || {}, s.Symbol.Dash = s.Class.extend({
      options: {
        pixelSize: 10,
        pathOptions: {}
      },
      initialize: function(f) {
        s.Util.setOptions(this, f), this.options.pathOptions.clickable = !1;
      },
      buildSymbol: function(f, v, C, T, k) {
        var I = this.options, U = Math.PI / 180;
        if (I.pixelSize <= 1)
          return s.polyline([f.latLng, f.latLng], I.pathOptions);
        var H = C.project(f.latLng), st = -(f.heading - 90) * U, Pt = s.point(H.x + I.pixelSize * Math.cos(st + Math.PI) / 2, H.y + I.pixelSize * Math.sin(st) / 2), At = H.add(H.subtract(Pt));
        return s.polyline([C.unproject(Pt), C.unproject(At)], I.pathOptions);
      }
    }), s.Symbol.dash = function(g) {
      return new s.Symbol.Dash(g);
    }, s.Symbol.ArrowHead = s.Class.extend({
      options: {
        polygon: !0,
        pixelSize: 10,
        headAngle: 60,
        pathOptions: {
          stroke: !1,
          weight: 2
        }
      },
      initialize: function(f) {
        s.Util.setOptions(this, f), this.options.pathOptions.clickable = !1;
      },
      buildSymbol: function(f, v, C, T, k) {
        return this.options.polygon ? s.polygon(this._buildArrowPath(f, C), this.options.pathOptions) : s.polyline(this._buildArrowPath(f, C), this.options.pathOptions);
      },
      _buildArrowPath: function(f, v) {
        var C = Math.PI / 180, T = v.project(f.latLng), k = -(f.heading - 90) * C, I = this.options.headAngle / 2 * C, U = k + I, H = k - I, st = s.point(T.x - this.options.pixelSize * Math.cos(U), T.y + this.options.pixelSize * Math.sin(U)), Pt = s.point(T.x - this.options.pixelSize * Math.cos(H), T.y + this.options.pixelSize * Math.sin(H));
        return [v.unproject(st), f.latLng, v.unproject(Pt)];
      }
    }), s.Symbol.arrowHead = function(g) {
      return new s.Symbol.ArrowHead(g);
    }, s.Symbol.Marker = s.Class.extend({
      options: {
        markerOptions: {},
        rotate: !1
      },
      initialize: function(f) {
        s.Util.setOptions(this, f), this.options.markerOptions.clickable = !1, this.options.markerOptions.draggable = !1;
      },
      buildSymbol: function(f, v, C, T, k) {
        return this.options.rotate && (this.options.markerOptions.rotationAngle = f.heading + (this.options.angleCorrection || 0)), s.marker(f.latLng, this.options.markerOptions);
      }
    }), s.Symbol.marker = function(g) {
      return new s.Symbol.Marker(g);
    };
    var m = function(f) {
      return f instanceof s.LatLng || Array.isArray(f) && f.length === 2 && typeof f[0] == "number";
    }, b = function(f) {
      return Array.isArray(f) && m(f[0]);
    };
    s.PolylineDecorator = s.FeatureGroup.extend({
      options: {
        patterns: []
      },
      initialize: function(f, v) {
        s.FeatureGroup.prototype.initialize.call(this), s.Util.setOptions(this, v), this._map = null, this._paths = this._initPaths(f), this._bounds = this._initBounds(), this._patterns = this._initPatterns(this.options.patterns);
      },
      /**
      * Deals with all the different cases. input can be one of these types:
      * array of LatLng, array of 2-number arrays, Polyline, Polygon,
      * array of one of the previous.
      */
      _initPaths: function(f, v) {
        var C = this;
        if (b(f)) {
          var T = v ? f.concat([f[0]]) : f;
          return [T];
        }
        return f instanceof s.Polyline ? this._initPaths(f.getLatLngs(), f instanceof s.Polygon) : Array.isArray(f) ? f.reduce(function(k, I) {
          return k.concat(C._initPaths(I, v));
        }, []) : [];
      },
      // parse pattern definitions and precompute some values
      _initPatterns: function(f) {
        return f.map(this._parsePatternDef);
      },
      /**
      * Changes the patterns used by this decorator
      * and redraws the new one.
      */
      setPatterns: function(f) {
        this.options.patterns = f, this._patterns = this._initPatterns(this.options.patterns), this.redraw();
      },
      /**
      * Changes the patterns used by this decorator
      * and redraws the new one.
      */
      setPaths: function(f) {
        this._paths = this._initPaths(f), this._bounds = this._initBounds(), this.redraw();
      },
      /**
      * Parse the pattern definition
      */
      _parsePatternDef: function(f, v) {
        return {
          symbolFactory: f.symbol,
          // Parse offset and repeat values, managing the two cases:
          // absolute (in pixels) or relative (in percentage of the polyline length)
          offset: a(f.offset),
          endOffset: a(f.endOffset),
          repeat: a(f.repeat)
        };
      },
      onAdd: function(f) {
        this._map = f, this._draw(), this._map.on("moveend", this.redraw, this);
      },
      onRemove: function(f) {
        this._map.off("moveend", this.redraw, this), this._map = null, s.FeatureGroup.prototype.onRemove.call(this, f);
      },
      /**
      * As real pattern bounds depends on map zoom and bounds,
      * we just compute the total bounds of all paths decorated by this instance.
      */
      _initBounds: function() {
        var f = this._paths.reduce(function(v, C) {
          return v.concat(C);
        }, []);
        return s.latLngBounds(f);
      },
      getBounds: function() {
        return this._bounds;
      },
      /**
      * Returns an array of ILayers object
      */
      _buildSymbols: function(f, v, C) {
        var T = this;
        return C.map(function(k, I) {
          return v.buildSymbol(k, f, T._map, I, C.length);
        });
      },
      /**
      * Compute pairs of LatLng and heading angle,
      * that define positions and directions of the symbols on the path
      */
      _getDirectionPoints: function(f, v) {
        var C = this;
        if (f.length < 2)
          return [];
        var T = f.map(function(k) {
          return C._map.project(k);
        });
        return w(T, v).map(function(k) {
          return {
            latLng: C._map.unproject(s.point(k.pt)),
            heading: k.heading
          };
        });
      },
      redraw: function() {
        this._map && (this.clearLayers(), this._draw());
      },
      /**
      * Returns all symbols for a given pattern as an array of FeatureGroup
      */
      _getPatternLayers: function(f) {
        var v = this, C = this._map.getBounds().pad(0.1);
        return this._paths.map(function(T) {
          var k = v._getDirectionPoints(T, f).filter(function(I) {
            return C.contains(I.latLng);
          });
          return s.featureGroup(v._buildSymbols(T, f.symbolFactory, k));
        });
      },
      /**
      * Draw all patterns
      */
      _draw: function() {
        var f = this;
        this._patterns.map(function(v) {
          return f._getPatternLayers(v);
        }).forEach(function(v) {
          f.addLayer(s.featureGroup(v));
        });
      }
    }), s.polylineDecorator = function(g, f) {
      return new s.PolylineDecorator(g, f);
    };
  });
})();
const Sn = L.extend({}, L.DomUtil);
L.extend(L.DomUtil, {
  /**
   * Resets the 3D CSS transform of `el` so it is
   * translated by `offset` pixels and optionally
   * scaled by `scale`. Does not have an effect if
   * the browser doesn't support 3D CSS transforms.
   * 
   * @param {HTMLElement} el 
   * @param {L.Point} offset 
   * @param {Number} scale
   * @param {Number} bearing 
   * @param {L.Point} pivot 
   */
  setTransform: function(p, u, s, c, y) {
    var o = u || new L.Point(0, 0);
    if (!c)
      return u = o._round(), Sn.setTransform.apply(this, arguments);
    o = o.rotateFrom(c, y), p.style[L.DomUtil.TRANSFORM] = "translate3d(" + o.x + "px," + o.y + "px,0)" + (s ? " scale(" + s + ")" : "") + " rotate(" + c + "rad)";
  },
  /**
   * Sets the position of `el` to coordinates specified by
   * `position`, using CSS translate or top/left positioning
   * depending on the browser (used by Leaflet internally
   * to position its layers).
   * 
   * @param {HTMLElement} el 
   * @param {L.Point} point 
   * @param {Number} bearing
   * @param {L.Point} pivot 
   * @param {Number} scale 
   */
  setPosition: function(p, u, s, c, y) {
    if (!s)
      return Sn.setPosition.apply(this, arguments);
    p._leaflet_pos = u, L.Browser.any3d ? L.DomUtil.setTransform(p, u, y, s, c) : (p.style.left = u.x + "px", p.style.top = u.y + "px");
  },
  /**
   * @constant radians = degrees × π/180°
   */
  DEG_TO_RAD: Math.PI / 180,
  /**
   * @constant degrees = radians × 180°/π
   */
  RAD_TO_DEG: 180 / Math.PI
});
L.Draggable.include({
  /** @TODO */
  // updateMapBearing: function(mapBearing) {
  //     this._mapBearing = mapBearing;
  // },
});
L.extend(L.Point.prototype, {
  /**
   * Rotate around (0,0) by applying the 2D rotation matrix:
   * 
   * ⎡ x' ⎤ = ⎡ cos θ  -sin θ ⎤ ⎡ x ⎤
   * ⎣ y' ⎦   ⎣ sin θ   cos θ ⎦ ⎣ y ⎦
   * 
   * @param theta must be given in radians.
   */
  rotate: function(p) {
    return this.rotateFrom(p, new L.Point(0, 0));
  },
  /**
   * Rotate around (pivot.x, pivot.y) by:
   * 
   * 1. subtract (pivot.x, pivot.y)
   * 2. rotate around (0, 0)
   * 3. add (pivot.x, pivot.y) back
   * 
   * same as `this.subtract(pivot).rotate(theta).add(pivot)`
   * 
   * @param {Number} theta 
   * @param {L.Point} pivot 
   * 
   * @returns {L.Point}
   */
  rotateFrom: function(p, u) {
    if (!p)
      return this;
    var s = Math.sin(p), c = Math.cos(p), y = u.x, o = u.y, a = this.x - y, l = this.y - o;
    return new L.Point(
      a * c - l * s + y,
      a * s + l * c + o
    );
  }
});
const kn = L.extend({}, L.DivOverlay.prototype);
L.DivOverlay.include({
  /**
   * Update L.Popup and L.Tooltip anchor positions after
   * the map is moved by calling `map.setBearing(theta)`
   * 
   * @listens L.Map~rotate
   */
  getEvents: function() {
    return L.extend(kn.getEvents.apply(this, arguments), { rotate: this._updatePosition });
  },
  /**
   * 0. update element anchor point (divOverlayProto v1.9.3)
   * 1. rotate around anchor point (subtract anchor -> rotate point -> add anchor)
   */
  _updatePosition: function() {
    if (this._map && (kn._updatePosition.apply(this, arguments), this._map && this._map._rotate && this._zoomAnimated)) {
      var p = this._getAnchor(), u = L.DomUtil.getPosition(this._container).subtract(p);
      L.DomUtil.setPosition(this._container, this._map.rotatedPointToMapPanePoint(u).add(p));
    }
  }
});
const ks = L.extend({}, L.Popup.prototype);
L.Popup.include({
  /**
   * 0. update element anchor point (popupProto v1.9.3)
   * 1. rotate around anchor point (subtract anchor -> rotate point -> add anchor)
   */
  _animateZoom: function(p) {
    if (ks._animateZoom.apply(this, arguments), this._map && this._map._rotate) {
      var u = this._getAnchor(), s = L.DomUtil.getPosition(this._container).subtract(u);
      L.DomUtil.setPosition(this._container, this._map.rotatedPointToMapPanePoint(s).add(u));
    }
  },
  /**
   * Fix for L.popup({ keepInView = true })
   * 
   * @see https://github.com/fnicollet/Leaflet/pull/21
   */
  _adjustPan: function() {
    if (!(!this.options.autoPan || this._map._panAnim && this._map._panAnim._inProgress)) {
      if (this._autopanning) {
        this._autopanning = !1;
        return;
      }
      var p = this._map, u = parseInt(L.DomUtil.getStyle(this._container, "marginBottom"), 10) || 0, s = this._container.offsetHeight + u, c = this._containerWidth, y = new L.Point(this._containerLeft, -s - this._containerBottom);
      y._add(L.DomUtil.getPosition(this._container));
      var o = y._add(this._map._getMapPanePos()), a = L.point(this.options.autoPanPadding), l = L.point(this.options.autoPanPaddingTopLeft || a), d = L.point(this.options.autoPanPaddingBottomRight || a), w = p.getSize(), M = 0, m = 0;
      o.x + c + d.x > w.x && (M = o.x + c - w.x + d.x), o.x - M - l.x < 0 && (M = o.x - l.x), o.y + s + d.y > w.y && (m = o.y + s - w.y + d.y), o.y - m - l.y < 0 && (m = o.y - l.y), (M || m) && (this.options.keepInView && (this._autopanning = !0), p.fire("autopanstart").panBy([M, m]));
    }
  }
});
const In = L.extend({}, L.Tooltip.prototype);
L.Tooltip.include({
  _animateZoom: function(p) {
    if (!this._map._rotate)
      return In._animateZoom.apply(this, arguments);
    var u = this._map._latLngToNewLayerPoint(this._latlng, p.zoom, p.center);
    u = this._map.rotatedPointToMapPanePoint(u), this._setPosition(u);
  },
  _updatePosition: function() {
    if (!this._map._rotate)
      return In._updatePosition.apply(this, arguments);
    var p = this._map.latLngToLayerPoint(this._latlng);
    p = this._map.rotatedPointToMapPanePoint(p), this._setPosition(p);
  }
});
L.extend({}, L.Icon.prototype);
L.Icon.include({
  _setIconStyles: function(p, u) {
    var s = this.options, c = s[u + "Size"];
    typeof c == "number" && (c = [c, c]);
    var y = L.point(c), o = L.point(u === "shadow" && s.shadowAnchor || s.iconAnchor || y && y.divideBy(2, !0));
    p.className = "leaflet-marker-" + u + " " + (s.className || ""), o && (p.style.marginLeft = -o.x + "px", p.style.marginTop = -o.y + "px", p.style[L.DomUtil.TRANSFORM + "Origin"] = o.x + "px " + o.y + "px 0px"), y && (p.style.width = y.x + "px", p.style.height = y.y + "px");
  }
});
const zn = L.extend({}, L.Marker.prototype);
L.Marker.mergeOptions({
  /**
   * Rotation of this marker in rad
   * 
   * @type {Number}
   */
  rotation: 0,
  /**
   * Rotate this marker when map rotates
   * 
   * @type {Boolean}
   */
  rotateWithView: !1,
  /**
   * Scale of the marker icon
   * 
   * @type {Number}
   */
  scale: void 0
});
var _i, An = {
  // _onDragStart: function() {
  //     if (!this._marker._map._rotate) {
  //         return markerDragProto._onDragStart.apply(this, arguments);
  //     }
  //     this._draggable.updateMapBearing(this._marker._map._bearing);
  // },
  _onDrag: function(p) {
    var u = this._marker, s = u.options.rotation || u.options.rotateWithView, c = u._shadow, y = L.DomUtil.getPosition(u._icon);
    !s && c && L.DomUtil.setPosition(c, y), u._map._rotate && (y = u._map.mapPanePointToRotatedPoint(y));
    var o = u._map.layerPointToLatLng(y);
    u._latlng = o, p.latlng = o, p.oldLatLng = this._oldLatLng, s ? u.setLatLng(o) : u.fire("move", p), u.fire("drag", p);
  },
  _onDragEnd: function(p) {
    this._marker._map._rotate && this._marker.update(), _i._onDragEnd.apply(this, arguments);
  }
};
L.Marker.include({
  /**
   * Update L.Marker anchor position after the map
   * is moved by calling `map.setBearing(theta)`
   * 
   * @listens L.Map~rotate
   */
  getEvents: function() {
    return L.extend(zn.getEvents.apply(this, arguments), { rotate: this.update });
  },
  _initInteraction: function() {
    var p = zn._initInteraction.apply(this, arguments);
    return this.dragging && this.dragging.enabled() && this._map && this._map._rotate && (_i = _i || Object.getPrototypeOf(this.dragging), this.dragging.disable(), Object.assign(this.dragging, {
      // _onDragStart: MarkerDrag._onDragStart.bind(this.dragging),
      _onDrag: An._onDrag.bind(this.dragging),
      _onDragEnd: An._onDragEnd.bind(this.dragging)
    }), this.dragging.enable()), p;
  },
  _setPos: function(p) {
    this._map._rotate && (p = this._map.rotatedPointToMapPanePoint(p));
    var u = this.options.rotation || 0;
    this.options.rotateWithView && (u += this._map._bearing), this._icon && L.DomUtil.setPosition(this._icon, p, u, p, this.options.scale), this._shadow && L.DomUtil.setPosition(this._shadow, p, u, p, this.options.scale), this._zIndex = p.y + this.options.zIndexOffset, this._resetZIndex();
  },
  // _updateZIndex: function(offset) {
  //     if (!this._map._rotate) {
  //         return markerProto._updateZIndex.apply(this, arguments);
  //     }
  //     this._icon.style.zIndex = Math.round(this._zIndex + offset);
  // },
  setRotation: function(p) {
    this.options.rotation = p, this.update();
  }
});
const On = L.extend({}, L.GridLayer.prototype);
L.GridLayer.include({
  /**
   * Redraw L.TileLayer bounds after the map is
   * moved by just calling `map.setBearing(theta)`
   * 
   * @listens L.Map~rotate
   */
  getEvents: function() {
    var p = On.getEvents.apply(this, arguments);
    return this._map._rotate && !this.options.updateWhenIdle && (this._onRotate || (this._onRotate = L.Util.throttle(this._onMoveEnd, this.options.updateInterval, this)), p.rotate = this._onRotate), p;
  },
  _getTiledPixelBounds: function(p) {
    return this._map._rotate ? this._map._getNewPixelBounds(p, this._tileZoom) : On._getTiledPixelBounds.apply(this, arguments);
  }
});
const Ie = L.extend({}, L.Renderer.prototype);
L.Renderer.include({
  /**
   * Redraw L.Canvas and L.SVG renderer bounds after the
   * map is moved by just calling `map.setBearing(theta)`
   * 
   * @listens L.Map~rotate
   */
  getEvents: function() {
    return L.extend(Ie.getEvents.apply(this, arguments), { rotate: this._update });
  },
  /**
   * Fix for `map.flyTo()` when `false === map.options.zoomAnimation`
   * 
   * @see https://github.com/Leaflet/Leaflet/pull/8794
   */
  onAdd: function() {
    Ie.onAdd.apply(this, arguments), L.version <= "1.9.3" && this._container.classList.add("leaflet-zoom-animated");
  },
  /**
   * @FIXME layer drifts on `map.setZoom()` (eg. zoom during animation)
   * 
   * the main cause seems to be related to `this._updateTransform(path._center, path._zoom))`
   * and `this._topLeft = this._map.layerPointToLatLng(this._bounds.min);`
   * 
   * @example
   *   map.setZoom(2);
   *   path._renderer._update();
   *   path._renderer._updateTransform(path._renderer._center, path._renderer._zoom);
   * 
   * @see https://github.com/Leaflet/Leaflet/pull/8794
   * @see https://github.com/Leaflet/Leaflet/pull/8103
   * @see https://github.com/Leaflet/Leaflet/issues/7466
   * 
   * @TODO rechek this changes from leaflet@v1.9.3
   * 
   * @see https://github.com/Leaflet/Leaflet/compare/v1.7.0...v1.9.3
   */
  _updateTransform: function(p, u) {
    if (!this._map._rotate)
      return Ie._updateTransform.apply(this, arguments);
    var s = this._map.getZoomScale(u, this._zoom), c = this._map._latLngToNewLayerPoint(this._topLeft, u, p);
    L.DomUtil.setTransform(this._container, c, s);
  },
  // getEvents() {
  //     const events = {
  //         viewreset: this._reset,
  //         zoom: this._onZoom,
  //         moveend: this._update,
  //         zoomend: this._onZoomEnd
  //     };
  //     if (this._zoomAnimated) {
  //         events.zoomanim = this._onAnimZoom;
  //     }
  //     return events;
  // },
  // _onAnimZoom(ev) {
  //     this._updateTransform(ev.center, ev.zoom);
  // },
  // _onZoom() {
  //     this._updateTransform(this._map.getCenter(), this._map.getZoom());
  // },
  // _onZoomEnd() {
  //     for (const id in this._layers) {
  //         this._layers[id]._project();
  //     }
  // },
  // _reset() {
  //     this._update();
  //     this._updateTransform(this._center, this._zoom);
  //     for (const id in this._layers) {
  //         this._layers[id]._reset();
  //     }
  // },
  // _updatePaths() {
  //     for (const id in this._layers) {
  //         this._layers[id]._update();
  //     }
  // },
  _update: function() {
    if (!this._map._rotate)
      return Ie._update.apply(this, arguments);
    this._bounds = this._map._getPaddedPixelBounds(this.options.padding), this._topLeft = this._map.layerPointToLatLng(this._bounds.min), this._center = this._map.getCenter(), this._zoom = this._map.getZoom();
  }
});
const ot = L.extend({}, L.Map.prototype);
L.Map.mergeOptions({ rotate: !1, bearing: 0 });
L.Map.include({
  /**
   * @param {(HTMLElement|String)} id html selector
   * @param {Object} [options={}] leaflet map options
   */
  initialize: function(p, u) {
    u.rotate && (this._rotate = !0, this._bearing = 0), ot.initialize.apply(this, arguments), this.options.rotate && this.setBearing(this.options.bearing);
  },
  /**
   * Given a pixel coordinate relative to the map container,
   * returns the corresponding pixel coordinate relative to
   * the [origin pixel](#map-getpixelorigin).
   * 
   * @param {L.Point} point pixel screen coordinates
   * @returns {L.Point} transformed pixel point
   */
  containerPointToLayerPoint: function(p) {
    return this._rotate ? L.point(p).subtract(this._getMapPanePos()).rotateFrom(-this._bearing, this._getRotatePanePos()).subtract(this._getRotatePanePos()) : ot.containerPointToLayerPoint.apply(this, arguments);
  },
  /**
   * Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
   * returns the corresponding pixel coordinate relative to the map container.
   * 
   * @param {L.Point} point pixel screen coordinates
   * @returns {L.Point} transformed pixel point
   */
  layerPointToContainerPoint: function(p) {
    return this._rotate ? L.point(p).add(this._getRotatePanePos()).rotateFrom(this._bearing, this._getRotatePanePos()).add(this._getMapPanePos()) : ot.layerPointToContainerPoint.apply(this, arguments);
  },
  /**
   * Converts a coordinate from the rotated pane reference system
   * to the reference system of the not rotated map pane.
   * 
   * (rotatePane) --> (mapPane)
   * (rotatePane) --> (norotatePane)
   * 
   * @param {L.Point} point pixel screen coordinates
   * @returns {L.Point}
   * 
   * @since leaflet-rotate (v0.1)
   */
  rotatedPointToMapPanePoint: function(p) {
    return L.point(p).rotate(this._bearing)._add(this._getRotatePanePos());
  },
  /**
   * Converts a coordinate from the not rotated map pane reference system
   * to the reference system of the rotated pane.
   * 
   * (mapPane) --> (rotatePane)
   * (norotatePane) --> (rotatePane)
   * 
   * @param {L.Point} point pixel screen coordinates
   * 
   * @since leaflet-rotate (v0.1)
   */
  mapPanePointToRotatedPoint: function(p) {
    return L.point(p)._subtract(this._getRotatePanePos()).rotate(-this._bearing);
  },
  // latLngToLayerPoint: function (latlng) {
  //     var projectedPoint = this.project(L.latLng(latlng))._round();
  //     return projectedPoint._subtract(this.getPixelOrigin());
  // },
  // latLngToContainerPoint: function (latlng) {
  // 	return this.layerPointToContainerPoint(this.latLngToLayerPoint(toLatLng(latlng)));
  // },
  /**
   * Given latlng bounds, returns the bounds in projected pixel
   * relative to the map container.
   * 
   * @see https://github.com/ronikar/Leaflet/blob/5c480ef959b947c3beed7065425a5a36c486262b/src/map/Map.js#L1114-L1135
   * 
   * @param {L.LatLngBounds} bounds 
   * @returns {L.Bounds}
   * 
   * @since leaflet-rotate (v0.2)
   */
  mapBoundsToContainerBounds: function(p) {
    if (!this._rotate && ot.mapBoundsToContainerBounds)
      return ot.mapBoundsToContainerBounds.apply(this, arguments);
    const u = this.getPixelOrigin(), s = this.layerPointToContainerPoint(this.project(p.getNorthWest())._subtract(u)), c = this.layerPointToContainerPoint(this.project(p.getNorthEast())._subtract(u)), y = this.layerPointToContainerPoint(this.project(p.getSouthWest())._subtract(u)), o = this.layerPointToContainerPoint(this.project(p.getSouthEast())._subtract(u));
    return L.bounds([
      L.point(Math.min(s.x, c.x, o.x, y.x), Math.min(s.y, c.y, o.y, y.y)),
      // [ minX, minY ]
      L.point(Math.max(s.x, c.x, o.x, y.x), Math.max(s.y, c.y, o.y, y.y))
      // [ maxX, maxY ]
    ]);
  },
  /**
   * Returns geographical bounds visible in the current map view
   * 
   * @TODO find out  if map bounds calculated by `L.Map::getBounds()`
   *       function should match the `rotatePane` or `norotatePane` bounds
   * 
   * @see https://github.com/fnicollet/Leaflet/issues/7
   * 
   * @returns {L.LatLngBounds}
   */
  getBounds: function() {
    if (!this._rotate)
      return ot.getBounds.apply(this, arguments);
    var p = this.getSize();
    return new L.LatLngBounds([
      this.containerPointToLatLng([0, 0]),
      // topleft
      this.containerPointToLatLng([p.x, 0]),
      // topright 
      this.containerPointToLatLng([p.x, p.y]),
      // bottomright
      this.containerPointToLatLng([0, p.y])
      // bottomleft
    ]);
  },
  /**
   * Returns the bounds of the current map view in projected pixel
   * coordinates (sometimes useful in layer and overlay implementations).
   * 
   * @TODO find out if map bounds calculated by `L.Map::getPixelBounds()`
   *       function should match the `rotatePane` or `norotatePane` bounds
   *
   * @see https://github.com/fnicollet/Leaflet/issues/7
   * 
   * @returns {L.Bounds}
   */
  // getPixelBounds(center, zoom) {
  //     // const topLeftPoint = map.containerPointToLayerPoint(this._getTopLeftPoint());
  //     const topLeftPoint = this._getTopLeftPoint(center, zoom);
  //       return new L.Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
  // },
  /**
   * Change map rotation
   * 
   * @param {number} theta map degrees
   * 
   * @since leaflet-rotate (v0.1)
   */
  setBearing: function(p) {
    if (!(!L.Browser.any3d || !this._rotate)) {
      var u = L.Util.wrapNum(p, [0, 360]) * L.DomUtil.DEG_TO_RAD, s = this._getPixelCenter(), c = this._getRotatePanePos().rotateFrom(-this._bearing, s), y = c.rotateFrom(u, s);
      L.DomUtil.setPosition(this._rotatePane, c, u, s), this._pivot = s, this._bearing = u, this._rotatePanePos = y, this.fire("rotate");
    }
  },
  /**
   * Get current map rotation
   * 
   * @returns {number} theta map degrees
   * 
   * @since leaflet-rotate (v0.1)
   */
  getBearing: function() {
    return this._bearing * L.DomUtil.RAD_TO_DEG;
  },
  /**
   * Creates a new [map pane](#map-pane) with the given name if it doesn't
   * exist already, then returns it. The pane is created as a child of
   * `container`, or as a child of the main map pane if not set.
   * 
   * @param {String} name leaflet pane
   * @param {HTMLElement} [container] parent element
   * @returns {HTMLElement} pane container
   */
  // createPane: function(name, container) {
  //     if (!this._rotate || name == 'mapPane') {
  //         return mapProto.createPane.apply(this, arguments);
  //     }
  //     // init "rotatePane"
  //     if (!this._rotatePane) {
  //         // this._pivot = this.getSize().divideBy(2);
  //         this._rotatePane = mapProto.createPane.call(this, 'rotatePane', this._mapPane);
  //         L.DomUtil.setPosition(this._rotatePane, new L.Point(0, 0), this._bearing, this._pivot);
  //     }
  //     return mapProto.createPane.call(this, name, container || this._rotatePane);
  // },
  /**
   * Panes are DOM elements used to control the ordering of layers on
   * the map. You can access panes with [`map.getPane`](#map-getpane)
   * or [`map.getPanes`](#map-getpanes) methods. New panes can be created
   * with the [`map.createPane`](#map-createpane) method.
   * 
   * Every map has the following default panes that differ only in zIndex:
   * 
   * - mapPane     [HTMLElement = 'auto'] - Pane that contains all other map panes
   * - tilePane    [HTMLElement = 2]      - Pane for tile layers
   * - overlayPane [HTMLElement = 4]      - Pane for overlays like polylines and polygons
   * - shadowPane  [HTMLElement = 5]      - Pane for overlay shadows (e.g. marker shadows)
   * - markerPane  [HTMLElement = 6]      - Pane for marker icons
   * - tooltipPane [HTMLElement = 650]    - Pane for tooltips.
   * - popupPane   [HTMLElement = 700]    - Pane for popups.
   */
  _initPanes: function() {
    var p = this._panes = {};
    this._paneRenderers = {}, this._mapPane = this.createPane("mapPane", this._container), L.DomUtil.setPosition(this._mapPane, new L.Point(0, 0)), this._rotate ? (this._rotatePane = this.createPane("rotatePane", this._mapPane), this._norotatePane = this.createPane("norotatePane", this._mapPane), this.createPane("tilePane", this._rotatePane), this.createPane("overlayPane", this._rotatePane), this.createPane("shadowPane", this._norotatePane), this.createPane("markerPane", this._norotatePane), this.createPane("tooltipPane", this._norotatePane), this.createPane("popupPane", this._norotatePane)) : (this.createPane("tilePane"), this.createPane("overlayPane"), this.createPane("shadowPane"), this.createPane("markerPane"), this.createPane("tooltipPane"), this.createPane("popupPane")), this.options.markerZoomAnimation || (L.DomUtil.addClass(p.markerPane, "leaflet-zoom-hide"), L.DomUtil.addClass(p.shadowPane, "leaflet-zoom-hide"));
  },
  /**
   * Pans the map the minimum amount to make the `latlng` visible. Use
   * padding options to fit the display to more restricted bounds.
   * If `latlng` is already within the (optionally padded) display bounds,
   * the map will not be panned.
   * 
   * @see https://github.com/Raruto/leaflet-rotate/issues/18
   * 
   * @param {L.LatLng} latlng coordinates
   * @param {Object} [options={}] padding options
   * 
   * @returns {L.Map} current map instance
   */
  panInside(p, u) {
    if (!this._rotate || Math.abs(this._bearing).toFixed(1) < 0.1)
      return ot.panInside.apply(this, arguments);
    u = u || {};
    const s = L.point(u.paddingTopLeft || u.padding || [0, 0]), c = L.point(u.paddingBottomRight || u.padding || [0, 0]), y = this._container.getBoundingClientRect(), o = this.latLngToContainerPoint(p), a = L.bounds([L.point(y), L.point(y).add(this.getSize())]), l = a.getCenter(), d = L.bounds([a.min.add(s), a.max.subtract(c)]), w = d.getSize();
    if (!d.contains(o)) {
      this._enforcingBounds = !0;
      const M = o.subtract(d.getCenter()), m = d.extend(o).getSize().subtract(w);
      l.x += M.x < 0 ? -m.x : m.x, l.y += M.y < 0 ? -m.y : m.y, this.panTo(this.containerPointToLatLng(l), u), this._enforcingBounds = !1;
    }
    return this;
  },
  /**
   * Pans the map to the closest view that would lie inside the given bounds
   * (if it's not already), controlling the animation using the options specific,
   * if any.
   * 
   * @TODO check if map bounds calculated by `L.Map::panInsideBounds()`
   *       function should match the `rotatePane` or `norotatePane` bounds
   *
   * @see https://github.com/fnicollet/Leaflet/issues/7
   * 
   * @param {L.LatLngBounds} bounds coordinates
   * @param {Object} [options] pan options
   * @returns {L.Map} current map instance
   */
  // panInsideBounds: function (bounds, options) {
  //     this._enforcingBounds = true;
  //     var center = this.getCenter(),
  //         newCenter = this._limitCenter(center, this._zoom, L.latLngBounds(bounds));
  //
  //     if (!center.equals(newCenter)) {
  //         this.panTo(newCenter, options);
  //     }
  //
  //     this._enforcingBounds = false;
  //     return this;
  // },
  // adjust center for view to get inside bounds
  // _limitCenter(center, zoom, bounds) {
  //
  //     if (!bounds) { return center; }
  //
  //     const centerPoint = this.project(center, zoom),
  //         viewHalf = this.getSize().divideBy(2),
  //         viewBounds = new Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
  //         offset = this._getBoundsOffset(viewBounds, bounds, zoom);
  //
  //     // If offset is less than a pixel, ignore.
  //     // This prevents unstable projections from getting into
  //     // an infinite loop of tiny offsets.
  //     if (Math.abs(offset.x) <= 1 && Math.abs(offset.y) <= 1) {
  //             return center;
  //     }
  //
  //     return this.unproject(centerPoint.add(offset), zoom);
  // },
  // @method flyToBounds(bounds: LatLngBounds, options?: fitBounds options): this
  // Sets the view of the map with a smooth animation like [`flyTo`](#map-flyto),
  // but takes a bounds parameter like [`fitBounds`](#map-fitbounds).
  // flyToBounds(bounds, options) {
  //     const target = this._getBoundsCenterZoom(bounds, options);
  //     return this.flyTo(target.center, target.zoom, options);
  // },
  // _getBoundsCenterZoom(bounds, options) {
  //
  //     options = options || {};
  //     bounds = bounds.getBounds ? bounds.getBounds() : toLatLngBounds(bounds);
  //
  //     const paddingTL = L.point(options.paddingTopLeft || options.padding || [0, 0]),
  //           paddingBR = L.point(options.paddingBottomRight || options.padding || [0, 0]);
  //
  //     let zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));
  //
  //     zoom = (typeof options.maxZoom === 'number') ? Math.min(options.maxZoom, zoom) : zoom;
  //
  //     if (zoom === Infinity) {
  //         return { center: bounds.getCenter(), zoom };
  //     }
  //
  //     return { center, zoom };
  //
  // },
  /**
   * Returns the maximum zoom level on which the given bounds fit to the map
   * view in its entirety. If `inside` (optional) is set to `true`, the method
   * instead returns the minimum zoom level on which the map view fits into
   * the given bounds in its entirety.
   * 
   * @param {L.LatLngBounds} bounds
   * @param {Boolean} [inside=false]
   * @param {L.Point} [padding=[0,0]]
   * 
   * @returns {Number} zoom level
   */
  getBoundsZoom(p, u, s) {
    if (!this._rotate || Math.abs(this._bearing).toFixed(1) < 0.1)
      return ot.getBoundsZoom.apply(this, arguments);
    p = L.latLngBounds(p), s = L.point(s || [0, 0]);
    let c = this.getZoom() || 0;
    const y = this.getMinZoom(), o = this.getMaxZoom(), a = this.getSize().subtract(s), l = this.mapBoundsToContainerBounds(p).getSize(), d = this.options.zoomSnap, w = a.x / l.x, M = a.y / l.y, m = u ? Math.max(w, M) : Math.min(w, M);
    return c = this.getScaleZoom(m, c), d && (c = Math.round(c / (d / 100)) * (d / 100), c = u ? Math.ceil(c / d) * d : Math.floor(c / d) * d), Math.max(y, Math.min(o, c));
  },
  /**
   * Layer point of the current center
   * 
   * @returns {L.Point} layer center
   */
  // _getCenterLayerPoint: function () {
  //    return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
  // },
  /**
   * Offset of the specified place to the current center in pixels
   * 
   * @param {L.LatLng} latlng map coordinates
   */
  _getCenterOffset: function(p) {
    var u = ot._getCenterOffset.apply(this, arguments);
    return this._rotate && (u = u.rotate(this._bearing)), u;
  },
  /**
   * @since leaflet-rotate (v0.1)
   */
  _getRotatePanePos: function() {
    return this._rotatePanePos || new L.Point(0, 0);
  },
  // _latLngToNewLayerPoint(latlng, zoom, center) {
  //    const topLeft = this._getNewPixelOrigin(center, zoom);
  //    return this.project(latlng, zoom)._subtract(topLeft);
  //},
  _getNewPixelOrigin: function(p, u) {
    if (!this._rotate)
      return ot._getNewPixelOrigin.apply(this, arguments);
    var s = this.getSize()._divideBy(2);
    return this.project(p, u).rotate(this._bearing)._subtract(s)._add(this._getMapPanePos())._add(this._getRotatePanePos()).rotate(-this._bearing)._round();
  },
  /**
   * @since leaflet-rotate (v0.2)
   * 
   * @see src\layer\tile\GridLayer::_getTiledPixelBounds()
   */
  _getNewPixelBounds: function(p, u) {
    if (p = p || this.getCenter(), u = u || this.getZoom(), !this._rotate && ot._getNewPixelBounds)
      return ot._getNewPixelBounds.apply(this, arguments);
    var s = this._animatingZoom ? Math.max(this._animateToZoom, this.getZoom()) : this.getZoom(), c = this.getZoomScale(s, u), y = this.project(p, u).floor(), o = this.getSize(), a = new L.Bounds([
      this.containerPointToLayerPoint([0, 0]).floor(),
      this.containerPointToLayerPoint([o.x, 0]).floor(),
      this.containerPointToLayerPoint([0, o.y]).floor(),
      this.containerPointToLayerPoint([o.x, o.y]).floor()
    ]).getSize().divideBy(c * 2);
    return new L.Bounds(y.subtract(a), y.add(a));
  },
  /**
   * @since leaflet-rotate (v0.2)
   * 
   * @return {L.Point} map pivot point (center)
   */
  _getPixelCenter: function() {
    return !this._rotate && ot._getPixelCenter ? ot._getPixelCenter.apply(this, arguments) : this.getSize()._divideBy(2)._subtract(this._getMapPanePos());
  },
  /**
   * @since leaflet-rotate (v0.2)
   * 
   * @see src\layer\vector\Renderer::_update()
   */
  _getPaddedPixelBounds: function(p) {
    if (!this._rotate && ot._getPaddedPixelBounds)
      return ot._getPaddedPixelBounds.apply(this, arguments);
    var u = p, s = this.getSize(), c = s.multiplyBy(-u), y = s.multiplyBy(1 + u);
    return new L.Bounds([
      this.containerPointToLayerPoint([c.x, c.y]).floor(),
      this.containerPointToLayerPoint([c.x, y.y]).floor(),
      this.containerPointToLayerPoint([y.x, c.y]).floor(),
      this.containerPointToLayerPoint([y.x, y.y]).floor()
    ]);
  },
  _handleGeolocationResponse: function(p) {
    if (this._container._leaflet_id) {
      var u = p.coords.latitude, s = p.coords.longitude, c = p.coords.heading, y = new L.LatLng(u, s), o = y.toBounds(p.coords.accuracy), a = this._locateOptions;
      if (a.setView) {
        var l = this.getBoundsZoom(o);
        this.setView(y, a.maxZoom ? Math.min(l, a.maxZoom) : l);
      }
      var d = {
        latlng: y,
        bounds: o,
        timestamp: p.timestamp,
        /** @TODO use mapProto._handleGeolocationResponse */
        heading: c
      };
      for (var w in p.coords)
        typeof p.coords[w] == "number" && (d[w] = p.coords[w]);
      this.fire("locationfound", d);
    }
  }
  /**
   * @see https://github.com/ronikar/Leaflet/blob/5c480ef959b947c3beed7065425a5a36c486262b/src/geo/LatLngBounds.js#L253-L264
   * 
   * @param {L.Bounds} points 
   * @returns {L.Bounds}
   */
  // toCircumscribedBounds(points) {
  //     var minX = points.reduce(function (pv, v) { return Math.min(pv, v.x); }, points[0].x),
  //         maxX = points.reduce(function (pv, v) { return Math.max(pv, v.x); }, points[0].x),
  //         minY = points.reduce(function (pv, v) { return Math.min(pv, v.y); }, points[0].y),
  //         maxY = points.reduce(function (pv, v) { return Math.max(pv, v.y); }, points[0].y);
  //
  //     return L.bounds(L.point(minX, minY), L.point(maxX, maxY));
  // },
});
L.Map.CompassBearing = L.Handler.extend({
  initialize: function(p) {
    this._map = p, "ondeviceorientationabsolute" in window ? this.__deviceOrientationEvent = "deviceorientationabsolute" : "ondeviceorientation" in window && (this.__deviceOrientationEvent = "deviceorientation"), this._throttled = L.Util.throttle(this._onDeviceOrientation, 100, this);
  },
  addHooks: function() {
    this._map._rotate && this.__deviceOrientationEvent ? L.DomEvent.on(window, this.__deviceOrientationEvent, this._throttled, this) : this.disable();
  },
  removeHooks: function() {
    this._map._rotate && this.__deviceOrientationEvent && L.DomEvent.off(window, this.__deviceOrientationEvent, this._throttled, this);
  },
  /**
   * `DeviceOrientationEvent.absolute` - Indicates whether the device is providing absolute
   *                                     orientation values (relatives to Magnetic North) or
   *                                     using some arbitrary frame determined by the device.
   * 
   * `DeviceOrientationEvent.alpha`    - Returns the rotation of the device around the Z axis;
   *                                     that is, the number of degrees by which the device is
   *                                     being twisted around the center of the screen.
   * 
   * `window.orientation`              - Returns the screen orientation in degrees (in 90-degree increments)
   *                                     of the viewport relative to the device's natural orientation.
   *                                     Its only possible values are -90, 0, 90, and 180. Positive
   *                                     values are counterclockwise; negative values are clockwise.
   * 
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/absolute
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/alpha
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/orientation
   */
  _onDeviceOrientation: function(p) {
    var u = p.webkitCompassHeading || p.alpha, s = 0;
    !p.absolute && p.webkitCompassHeading && (u = 360 - u), !p.absolute && typeof window.orientation < "u" && (s = window.orientation), this._map.setBearing(u - s);
  }
});
L.Map.addInitHook("addHandler", "compassBearing", L.Map.CompassBearing);
L.Map.mergeOptions({
  /**
   * Whether the map uses mutation observers to
   * detect changes in its container and trigger
   * `invalidateSize`. Disabled by default due to
   * support not being available in all web browsers.
   *
   * @type {Boolean}
   * 
   * @see https://developer.mozilla.org/docs/Web/API/MutationObserver
   */
  trackContainerMutation: !1
});
L.Map.ContainerMutation = L.Handler.extend({
  addHooks: function() {
    this._observer || (this._observer = new MutationObserver(L.Util.bind(this._map.invalidateSize, this._map))), this._observer.observe(this._map.getContainer(), {
      childList: !1,
      attributes: !0,
      characterData: !1,
      subtree: !1,
      attributeFilter: ["style"]
    });
  },
  removeHooks: function() {
    this._observer.disconnect();
  }
});
L.Map.addInitHook("addHandler", "trackContainerMutation", L.Map.ContainerMutation);
L.Map.mergeOptions({
  /**
   * Set it to false if you don't want the map to
   * zoom beyond min/max zoom and then bounce back
   * when pinch-zooming.
   * 
   * @type {Boolean}
   */
  bounceAtZoomLimits: !0
});
L.Map.TouchGestures = L.Handler.extend({
  initialize: function(p) {
    this._map = p, this.rotate = !!this._map.options.touchRotate, this.zoom = !!this._map.options.touchZoom;
  },
  addHooks: function() {
    L.DomEvent.on(this._map._container, "touchstart", this._onTouchStart, this);
  },
  removeHooks: function() {
    L.DomEvent.off(this._map._container, "touchstart", this._onTouchStart, this);
  },
  _onTouchStart: function(p) {
    var u = this._map;
    if (!(!p.touches || p.touches.length !== 2 || u._animatingZoom || this._zooming || this._rotating)) {
      var s = u.mouseEventToContainerPoint(p.touches[0]), c = u.mouseEventToContainerPoint(p.touches[1]), y = s.subtract(c);
      this._centerPoint = u.getSize()._divideBy(2), this._startLatLng = u.containerPointToLatLng(this._centerPoint), this.zoom ? (u.options.touchZoom !== "center" && (this._pinchStartLatLng = u.containerPointToLatLng(s.add(c)._divideBy(2))), this._startDist = s.distanceTo(c), this._startZoom = u.getZoom(), this._zooming = !0) : this._zooming = !1, this.rotate ? (this._startTheta = Math.atan(y.x / y.y), this._startBearing = u.getBearing(), y.y < 0 && (this._startBearing += 180), this._rotating = !0) : this._rotating = !1, this._moved = !1, u._stop(), L.DomEvent.on(document, "touchmove", this._onTouchMove, this).on(document, "touchend touchcancel", this._onTouchEnd, this), L.DomEvent.preventDefault(p);
    }
  },
  _onTouchMove: function(p) {
    if (!(!p.touches || p.touches.length !== 2 || !(this._zooming || this._rotating))) {
      var u = this._map, s = u.mouseEventToContainerPoint(p.touches[0]), c = u.mouseEventToContainerPoint(p.touches[1]), y = s.subtract(c), o = s.distanceTo(c) / this._startDist, a;
      if (this._rotating) {
        var l = Math.atan(y.x / y.y), d = (l - this._startTheta) * L.DomUtil.RAD_TO_DEG;
        y.y < 0 && (d += 180), d && u.setBearing(this._startBearing - d);
      }
      if (this._zooming)
        if (this._zoom = u.getScaleZoom(o, this._startZoom), !u.options.bounceAtZoomLimits && (this._zoom < u.getMinZoom() && o < 1 || this._zoom > u.getMaxZoom() && o > 1) && (this._zoom = u._limitZoom(this._zoom)), u.options.touchZoom === "center") {
          if (this._center = this._startLatLng, o === 1)
            return;
        } else {
          if (a = s._add(c)._divideBy(2)._subtract(this._centerPoint), o === 1 && a.x === 0 && a.y === 0)
            return;
          var w = -u.getBearing() * L.DomUtil.DEG_TO_RAD;
          this._center = u.unproject(u.project(this._pinchStartLatLng).subtract(a.rotate(w)));
        }
      this._moved || (u._moveStart(!0, !1), this._moved = !0), L.Util.cancelAnimFrame(this._animRequest);
      var M = u._move.bind(u, this._center, this._zoom, { pinch: !0, round: !1 }, void 0);
      this._animRequest = L.Util.requestAnimFrame(M, this, !0), L.DomEvent.preventDefault(p);
    }
  },
  _onTouchEnd: function() {
    if (!this._moved || !(this._zooming || this._rotating)) {
      this._zooming = !1;
      return;
    }
    this._zooming = !1, this._rotating = !1, L.Util.cancelAnimFrame(this._animRequest), L.DomEvent.off(document, "touchmove", this._onTouchMove, this).off(document, "touchend touchcancel", this._onTouchEnd, this), this.zoom && (this._map.options.zoomAnimation ? this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), !0, this._map.options.zoomSnap) : this._map._resetView(this._center, this._map._limitZoom(this._zoom)));
  }
});
L.Map.addInitHook("addHandler", "touchGestures", L.Map.TouchGestures);
L.Map.mergeOptions({
  /**
   * Whether the map can be rotated with a two-finger rotation gesture
   * 
   * @type {Boolean}
   */
  touchRotate: !1
});
L.Map.TouchRotate = L.Handler.extend({
  addHooks: function() {
    this._map.touchGestures.enable(), this._map.touchGestures.rotate = !0;
  },
  removeHooks: function() {
    this._map.touchGestures.rotate = !1;
  }
});
L.Map.addInitHook("addHandler", "touchRotate", L.Map.TouchRotate);
L.Map.mergeOptions({
  /**
   * Whether the map can be rotated with shift + wheel scroll
   * @type {Boolean}
   */
  shiftKeyRotate: !0
});
L.Map.ShiftKeyRotate = L.Handler.extend({
  addHooks: function() {
    L.DomEvent.on(this._map._container, "wheel", this._handleShiftScroll, this), this._map.shiftKeyRotate.rotate = !0;
  },
  removeHooks: function() {
    L.DomEvent.off(this._map._container, "wheel", this._handleShiftScroll, this), this._map.shiftKeyRotate.rotate = !1;
  },
  _handleShiftScroll: function(p) {
    p.shiftKey ? (p.preventDefault(), this._map.scrollWheelZoom.disable(), this._map.setBearing(this._map._bearing * L.DomUtil.RAD_TO_DEG + Math.sign(p.deltaY) * 5)) : this._map.scrollWheelZoom.enable();
  }
});
L.Map.addInitHook("addHandler", "shiftKeyRotate", L.Map.ShiftKeyRotate);
L.Map.addInitHook(function() {
  this.scrollWheelZoom.enabled() && this.shiftKeyRotate.enabled() && (this.scrollWheelZoom.disable(), this.scrollWheelZoom.enable());
});
L.Map.mergeOptions({
  /**
   * Whether the map can be zoomed by touch-dragging
   * with two fingers. If passed `'center'`, it will
   * zoom to the center of the view regardless of
   * where the touch events (fingers) were. Enabled
   * for touch-capable web browsers.
   * 
   * @type {(Boolean|String)}
   */
  touchZoom: L.Browser.touch,
  /**
   * @TODO check if this is a duplicate of `L.Map.TouchGestures::bounceAtZoomLimits`
   * 
   * Set it to false if you don't want the map to
   * zoom beyond min/max zoom and then bounce back
   * when pinch-zooming.
   * 
   * @type {Boolean}
   */
  bounceAtZoomLimits: !1
});
L.Map.TouchZoom = L.Handler.extend({
  addHooks: function() {
    L.DomUtil.addClass(this._map._container, "leaflet-touch-zoom"), this._map.touchGestures.enable(), this._map.touchGestures.zoom = !0;
  },
  removeHooks: function() {
    L.DomUtil.removeClass(this._map._container, "leaflet-touch-zoom"), this._map.touchGestures.zoom = !1;
  }
});
L.Map.addInitHook("addHandler", "touchZoom", L.Map.TouchZoom);
L.Control.Rotate = L.Control.extend({
  options: {
    position: "topleft",
    closeOnZeroBearing: !0
  },
  onAdd: function(p) {
    var u = this._container = L.DomUtil.create("div", "leaflet-control-rotate leaflet-bar"), s = this._arrow = L.DomUtil.create("span", "leaflet-control-rotate-arrow");
    s.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='29' height='29' viewBox='0 0 29 29' xmlns='http://www.w3.org/2000/svg' fill='%23333'%3E%3Cpath d='M10.5 14l4-8 4 8h-8z'/%3E%3Cpath d='M10.5 16l4 8 4-8h-8z' fill='%23ccc'/%3E%3C/svg%3E")`, s.style.cursor = "grab", s.style.display = "block", s.style.width = "100%", s.style.height = "100%", s.style.backgroundRepeat = "no-repeat", s.style.backgroundPosition = "50%";
    var c = this._link = L.DomUtil.create("a", "leaflet-control-rotate-toggle", u);
    return c.appendChild(s), c.href = "#", c.title = "Rotate map", L.DomEvent.on(c, "dblclick", L.DomEvent.stopPropagation).on(c, "mousedown", this._handleMouseDown, this).on(c, "click", L.DomEvent.stop).on(c, "click", this._cycleState, this).on(c, "click", this._refocusOnMap, this), L.Browser.any3d || L.DomUtil.addClass(c, "leaflet-disabled"), this._restyle(), p.on("rotate", this._restyle, this), this._follow = !1, this._canFollow = !1, this.options.closeOnZeroBearing && p.getBearing() === 0 && (u.style.display = "none"), u;
  },
  onRemove: function(p) {
    p.off("rotate", this._restyle, this);
  },
  _handleMouseDown: function(p) {
    L.DomEvent.stop(p), this.dragging = !0, this.dragstartX = p.pageX, this.dragstartY = p.pageY, L.DomEvent.on(document, "mousemove", this._handleMouseDrag, this).on(document, "mouseup", this._handleMouseUp, this);
  },
  _handleMouseUp: function(p) {
    L.DomEvent.stop(p), this.dragging = !1, L.DomEvent.off(document, "mousemove", this._handleMouseDrag, this).off(document, "mouseup", this._handleMouseUp, this);
  },
  _handleMouseDrag: function(p) {
    if (this.dragging) {
      var u = p.clientX - this.dragstartX;
      this._map.setBearing(u);
    }
  },
  _cycleState: function(p) {
    if (this._map) {
      var u = this._map;
      !u.touchRotate.enabled() && !u.compassBearing.enabled() ? u.touchRotate.enable() : u.compassBearing.enabled() ? (u.compassBearing.disable(), u.setBearing(0), this.options.closeOnZeroBearing && u.touchRotate.enable()) : (u.touchRotate.disable(), u.compassBearing.enable()), this._restyle();
    }
  },
  _restyle: function() {
    if (!this._map.options.rotate)
      L.DomUtil.addClass(this._link, "leaflet-disabled");
    else {
      var p = this._map, u = p.getBearing();
      this._arrow.style.transform = "rotate(" + u + "deg)", u && this.options.closeOnZeroBearing && (this._container.style.display = "block"), p.compassBearing.enabled() ? this._link.style.backgroundColor = "orange" : p.touchRotate.enabled() ? this._link.style.backgroundColor = null : (this._link.style.backgroundColor = "grey", u === 0 && this.options.closeOnZeroBearing && (this._container.style.display = "none"));
    }
  }
});
L.control.rotate = function(p) {
  return new L.Control.Rotate(p);
};
L.Map.mergeOptions({
  rotateControl: !0
});
L.Map.addInitHook(function() {
  if (this.options.rotateControl) {
    var p = typeof this.options.rotateControl == "object" ? this.options.rotateControl : {};
    this.rotateControl = L.control.rotate(p), this.addControl(this.rotateControl);
  }
});
var En = { exports: {} };
(function(p, u) {
  (function(s, c) {
    c(u);
  })(Ae, function(s) {
    var c = L.MarkerClusterGroup = L.FeatureGroup.extend({
      options: {
        maxClusterRadius: 80,
        //A cluster will cover at most this many pixels from its center
        iconCreateFunction: null,
        clusterPane: L.Marker.prototype.options.pane,
        spiderfyOnEveryZoom: !1,
        spiderfyOnMaxZoom: !0,
        showCoverageOnHover: !0,
        zoomToBoundsOnClick: !0,
        singleMarkerMode: !1,
        disableClusteringAtZoom: null,
        // Setting this to false prevents the removal of any clusters outside of the viewpoint, which
        // is the default behaviour for performance reasons.
        removeOutsideVisibleBounds: !0,
        // Set to false to disable all animations (zoom and spiderfy).
        // If false, option animateAddingMarkers below has no effect.
        // If L.DomUtil.TRANSITION is falsy, this option has no effect.
        animate: !0,
        //Whether to animate adding markers after adding the MarkerClusterGroup to the map
        // If you are adding individual markers set to true, if adding bulk markers leave false for massive performance gains.
        animateAddingMarkers: !1,
        // Make it possible to provide custom function to calculate spiderfy shape positions
        spiderfyShapePositions: null,
        //Increase to increase the distance away that spiderfied markers appear from the center
        spiderfyDistanceMultiplier: 1,
        // Make it possible to specify a polyline options on a spider leg
        spiderLegPolylineOptions: { weight: 1.5, color: "#222", opacity: 0.5 },
        // When bulk adding layers, adds markers in chunks. Means addLayers may not add all the layers in the call, others will be loaded during setTimeouts
        chunkedLoading: !1,
        chunkInterval: 200,
        // process markers for a maximum of ~ n milliseconds (then trigger the chunkProgress callback)
        chunkDelay: 50,
        // at the end of each interval, give n milliseconds back to system/browser
        chunkProgress: null,
        // progress callback: function(processed, total, elapsed) (e.g. for a progress indicator)
        //Options to pass to the L.Polygon constructor
        polygonOptions: {}
      },
      initialize: function(o) {
        L.Util.setOptions(this, o), this.options.iconCreateFunction || (this.options.iconCreateFunction = this._defaultIconCreateFunction), this._featureGroup = L.featureGroup(), this._featureGroup.addEventParent(this), this._nonPointGroup = L.featureGroup(), this._nonPointGroup.addEventParent(this), this._inZoomAnimation = 0, this._needsClustering = [], this._needsRemoving = [], this._currentShownBounds = null, this._queue = [], this._childMarkerEventHandlers = {
          dragstart: this._childMarkerDragStart,
          move: this._childMarkerMoved,
          dragend: this._childMarkerDragEnd
        };
        var a = L.DomUtil.TRANSITION && this.options.animate;
        L.extend(this, a ? this._withAnimation : this._noAnimation), this._markerCluster = a ? L.MarkerCluster : L.MarkerClusterNonAnimated;
      },
      addLayer: function(o) {
        if (o instanceof L.LayerGroup)
          return this.addLayers([o]);
        if (!o.getLatLng)
          return this._nonPointGroup.addLayer(o), this.fire("layeradd", { layer: o }), this;
        if (!this._map)
          return this._needsClustering.push(o), this.fire("layeradd", { layer: o }), this;
        if (this.hasLayer(o))
          return this;
        this._unspiderfy && this._unspiderfy(), this._addLayer(o, this._maxZoom), this.fire("layeradd", { layer: o }), this._topClusterLevel._recalculateBounds(), this._refreshClustersIcons();
        var a = o, l = this._zoom;
        if (o.__parent)
          for (; a.__parent._zoom >= l; )
            a = a.__parent;
        return this._currentShownBounds.contains(a.getLatLng()) && (this.options.animateAddingMarkers ? this._animationAddLayer(o, a) : this._animationAddLayerNonAnimated(o, a)), this;
      },
      removeLayer: function(o) {
        return o instanceof L.LayerGroup ? this.removeLayers([o]) : o.getLatLng ? this._map ? o.__parent ? (this._unspiderfy && (this._unspiderfy(), this._unspiderfyLayer(o)), this._removeLayer(o, !0), this.fire("layerremove", { layer: o }), this._topClusterLevel._recalculateBounds(), this._refreshClustersIcons(), o.off(this._childMarkerEventHandlers, this), this._featureGroup.hasLayer(o) && (this._featureGroup.removeLayer(o), o.clusterShow && o.clusterShow()), this) : this : (!this._arraySplice(this._needsClustering, o) && this.hasLayer(o) && this._needsRemoving.push({ layer: o, latlng: o._latlng }), this.fire("layerremove", { layer: o }), this) : (this._nonPointGroup.removeLayer(o), this.fire("layerremove", { layer: o }), this);
      },
      //Takes an array of markers and adds them in bulk
      addLayers: function(o, a) {
        if (!L.Util.isArray(o))
          return this.addLayer(o);
        var l = this._featureGroup, d = this._nonPointGroup, w = this.options.chunkedLoading, M = this.options.chunkInterval, m = this.options.chunkProgress, b = o.length, g = 0, f = !0, v;
        if (this._map) {
          var C = (/* @__PURE__ */ new Date()).getTime(), T = L.bind(function() {
            var I = (/* @__PURE__ */ new Date()).getTime();
            for (this._map && this._unspiderfy && this._unspiderfy(); g < b; g++) {
              if (w && g % 200 === 0) {
                var U = (/* @__PURE__ */ new Date()).getTime() - I;
                if (U > M)
                  break;
              }
              if (v = o[g], v instanceof L.LayerGroup) {
                f && (o = o.slice(), f = !1), this._extractNonGroupLayers(v, o), b = o.length;
                continue;
              }
              if (!v.getLatLng) {
                d.addLayer(v), a || this.fire("layeradd", { layer: v });
                continue;
              }
              if (!this.hasLayer(v) && (this._addLayer(v, this._maxZoom), a || this.fire("layeradd", { layer: v }), v.__parent && v.__parent.getChildCount() === 2)) {
                var H = v.__parent.getAllChildMarkers(), st = H[0] === v ? H[1] : H[0];
                l.removeLayer(st);
              }
            }
            m && m(g, b, (/* @__PURE__ */ new Date()).getTime() - C), g === b ? (this._topClusterLevel._recalculateBounds(), this._refreshClustersIcons(), this._topClusterLevel._recursivelyAddChildrenToMap(null, this._zoom, this._currentShownBounds)) : setTimeout(T, this.options.chunkDelay);
          }, this);
          T();
        } else
          for (var k = this._needsClustering; g < b; g++) {
            if (v = o[g], v instanceof L.LayerGroup) {
              f && (o = o.slice(), f = !1), this._extractNonGroupLayers(v, o), b = o.length;
              continue;
            }
            if (!v.getLatLng) {
              d.addLayer(v);
              continue;
            }
            this.hasLayer(v) || k.push(v);
          }
        return this;
      },
      //Takes an array of markers and removes them in bulk
      removeLayers: function(o) {
        var a, l, d = o.length, w = this._featureGroup, M = this._nonPointGroup, m = !0;
        if (!this._map) {
          for (a = 0; a < d; a++) {
            if (l = o[a], l instanceof L.LayerGroup) {
              m && (o = o.slice(), m = !1), this._extractNonGroupLayers(l, o), d = o.length;
              continue;
            }
            this._arraySplice(this._needsClustering, l), M.removeLayer(l), this.hasLayer(l) && this._needsRemoving.push({ layer: l, latlng: l._latlng }), this.fire("layerremove", { layer: l });
          }
          return this;
        }
        if (this._unspiderfy) {
          this._unspiderfy();
          var b = o.slice(), g = d;
          for (a = 0; a < g; a++) {
            if (l = b[a], l instanceof L.LayerGroup) {
              this._extractNonGroupLayers(l, b), g = b.length;
              continue;
            }
            this._unspiderfyLayer(l);
          }
        }
        for (a = 0; a < d; a++) {
          if (l = o[a], l instanceof L.LayerGroup) {
            m && (o = o.slice(), m = !1), this._extractNonGroupLayers(l, o), d = o.length;
            continue;
          }
          if (!l.__parent) {
            M.removeLayer(l), this.fire("layerremove", { layer: l });
            continue;
          }
          this._removeLayer(l, !0, !0), this.fire("layerremove", { layer: l }), w.hasLayer(l) && (w.removeLayer(l), l.clusterShow && l.clusterShow());
        }
        return this._topClusterLevel._recalculateBounds(), this._refreshClustersIcons(), this._topClusterLevel._recursivelyAddChildrenToMap(null, this._zoom, this._currentShownBounds), this;
      },
      //Removes all layers from the MarkerClusterGroup
      clearLayers: function() {
        return this._map || (this._needsClustering = [], this._needsRemoving = [], delete this._gridClusters, delete this._gridUnclustered), this._noanimationUnspiderfy && this._noanimationUnspiderfy(), this._featureGroup.clearLayers(), this._nonPointGroup.clearLayers(), this.eachLayer(function(o) {
          o.off(this._childMarkerEventHandlers, this), delete o.__parent;
        }, this), this._map && this._generateInitialClusters(), this;
      },
      //Override FeatureGroup.getBounds as it doesn't work
      getBounds: function() {
        var o = new L.LatLngBounds();
        this._topClusterLevel && o.extend(this._topClusterLevel._bounds);
        for (var a = this._needsClustering.length - 1; a >= 0; a--)
          o.extend(this._needsClustering[a].getLatLng());
        return o.extend(this._nonPointGroup.getBounds()), o;
      },
      //Overrides LayerGroup.eachLayer
      eachLayer: function(o, a) {
        var l = this._needsClustering.slice(), d = this._needsRemoving, w, M, m;
        for (this._topClusterLevel && this._topClusterLevel.getAllChildMarkers(l), M = l.length - 1; M >= 0; M--) {
          for (w = !0, m = d.length - 1; m >= 0; m--)
            if (d[m].layer === l[M]) {
              w = !1;
              break;
            }
          w && o.call(a, l[M]);
        }
        this._nonPointGroup.eachLayer(o, a);
      },
      //Overrides LayerGroup.getLayers
      getLayers: function() {
        var o = [];
        return this.eachLayer(function(a) {
          o.push(a);
        }), o;
      },
      //Overrides LayerGroup.getLayer, WARNING: Really bad performance
      getLayer: function(o) {
        var a = null;
        return o = parseInt(o, 10), this.eachLayer(function(l) {
          L.stamp(l) === o && (a = l);
        }), a;
      },
      //Returns true if the given layer is in this MarkerClusterGroup
      hasLayer: function(o) {
        if (!o)
          return !1;
        var a, l = this._needsClustering;
        for (a = l.length - 1; a >= 0; a--)
          if (l[a] === o)
            return !0;
        for (l = this._needsRemoving, a = l.length - 1; a >= 0; a--)
          if (l[a].layer === o)
            return !1;
        return !!(o.__parent && o.__parent._group === this) || this._nonPointGroup.hasLayer(o);
      },
      //Zoom down to show the given layer (spiderfying if necessary) then calls the callback
      zoomToShowLayer: function(o, a) {
        var l = this._map;
        typeof a != "function" && (a = function() {
        });
        var d = function() {
          (l.hasLayer(o) || l.hasLayer(o.__parent)) && !this._inZoomAnimation && (this._map.off("moveend", d, this), this.off("animationend", d, this), l.hasLayer(o) ? a() : o.__parent._icon && (this.once("spiderfied", a, this), o.__parent.spiderfy()));
        };
        o._icon && this._map.getBounds().contains(o.getLatLng()) ? a() : o.__parent._zoom < Math.round(this._map._zoom) ? (this._map.on("moveend", d, this), this._map.panTo(o.getLatLng())) : (this._map.on("moveend", d, this), this.on("animationend", d, this), o.__parent.zoomToBounds());
      },
      //Overrides FeatureGroup.onAdd
      onAdd: function(o) {
        this._map = o;
        var a, l, d;
        if (!isFinite(this._map.getMaxZoom()))
          throw "Map has no maxZoom specified";
        for (this._featureGroup.addTo(o), this._nonPointGroup.addTo(o), this._gridClusters || this._generateInitialClusters(), this._maxLat = o.options.crs.projection.MAX_LATITUDE, a = 0, l = this._needsRemoving.length; a < l; a++)
          d = this._needsRemoving[a], d.newlatlng = d.layer._latlng, d.layer._latlng = d.latlng;
        for (a = 0, l = this._needsRemoving.length; a < l; a++)
          d = this._needsRemoving[a], this._removeLayer(d.layer, !0), d.layer._latlng = d.newlatlng;
        this._needsRemoving = [], this._zoom = Math.round(this._map._zoom), this._currentShownBounds = this._getExpandedVisibleBounds(), this._map.on("zoomend", this._zoomEnd, this), this._map.on("moveend", this._moveEnd, this), this._spiderfierOnAdd && this._spiderfierOnAdd(), this._bindEvents(), l = this._needsClustering, this._needsClustering = [], this.addLayers(l, !0);
      },
      //Overrides FeatureGroup.onRemove
      onRemove: function(o) {
        o.off("zoomend", this._zoomEnd, this), o.off("moveend", this._moveEnd, this), this._unbindEvents(), this._map._mapPane.className = this._map._mapPane.className.replace(" leaflet-cluster-anim", ""), this._spiderfierOnRemove && this._spiderfierOnRemove(), delete this._maxLat, this._hideCoverage(), this._featureGroup.remove(), this._nonPointGroup.remove(), this._featureGroup.clearLayers(), this._map = null;
      },
      getVisibleParent: function(o) {
        for (var a = o; a && !a._icon; )
          a = a.__parent;
        return a || null;
      },
      //Remove the given object from the given array
      _arraySplice: function(o, a) {
        for (var l = o.length - 1; l >= 0; l--)
          if (o[l] === a)
            return o.splice(l, 1), !0;
      },
      /**
       * Removes a marker from all _gridUnclustered zoom levels, starting at the supplied zoom.
       * @param marker to be removed from _gridUnclustered.
       * @param z integer bottom start zoom level (included)
       * @private
       */
      _removeFromGridUnclustered: function(o, a) {
        for (var l = this._map, d = this._gridUnclustered, w = Math.floor(this._map.getMinZoom()); a >= w && d[a].removeObject(o, l.project(o.getLatLng(), a)); a--)
          ;
      },
      _childMarkerDragStart: function(o) {
        o.target.__dragStart = o.target._latlng;
      },
      _childMarkerMoved: function(o) {
        if (!this._ignoreMove && !o.target.__dragStart) {
          var a = o.target._popup && o.target._popup.isOpen();
          this._moveChild(o.target, o.oldLatLng, o.latlng), a && o.target.openPopup();
        }
      },
      _moveChild: function(o, a, l) {
        o._latlng = a, this.removeLayer(o), o._latlng = l, this.addLayer(o);
      },
      _childMarkerDragEnd: function(o) {
        var a = o.target.__dragStart;
        delete o.target.__dragStart, a && this._moveChild(o.target, a, o.target._latlng);
      },
      //Internal function for removing a marker from everything.
      //dontUpdateMap: set to true if you will handle updating the map manually (for bulk functions)
      _removeLayer: function(o, a, l) {
        var d = this._gridClusters, w = this._gridUnclustered, M = this._featureGroup, m = this._map, b = Math.floor(this._map.getMinZoom());
        a && this._removeFromGridUnclustered(o, this._maxZoom);
        var g = o.__parent, f = g._markers, v;
        for (this._arraySplice(f, o); g && (g._childCount--, g._boundsNeedUpdate = !0, !(g._zoom < b)); )
          a && g._childCount <= 1 ? (v = g._markers[0] === o ? g._markers[1] : g._markers[0], d[g._zoom].removeObject(g, m.project(g._cLatLng, g._zoom)), w[g._zoom].addObject(v, m.project(v.getLatLng(), g._zoom)), this._arraySplice(g.__parent._childClusters, g), g.__parent._markers.push(v), v.__parent = g.__parent, g._icon && (M.removeLayer(g), l || M.addLayer(v))) : g._iconNeedsUpdate = !0, g = g.__parent;
        delete o.__parent;
      },
      _isOrIsParent: function(o, a) {
        for (; a; ) {
          if (o === a)
            return !0;
          a = a.parentNode;
        }
        return !1;
      },
      //Override L.Evented.fire
      fire: function(o, a, l) {
        if (a && a.layer instanceof L.MarkerCluster) {
          if (a.originalEvent && this._isOrIsParent(a.layer._icon, a.originalEvent.relatedTarget))
            return;
          o = "cluster" + o;
        }
        L.FeatureGroup.prototype.fire.call(this, o, a, l);
      },
      //Override L.Evented.listens
      listens: function(o, a) {
        return L.FeatureGroup.prototype.listens.call(this, o, a) || L.FeatureGroup.prototype.listens.call(this, "cluster" + o, a);
      },
      //Default functionality
      _defaultIconCreateFunction: function(o) {
        var a = o.getChildCount(), l = " marker-cluster-";
        return a < 10 ? l += "small" : a < 100 ? l += "medium" : l += "large", new L.DivIcon({ html: "<div><span>" + a + "</span></div>", className: "marker-cluster" + l, iconSize: new L.Point(40, 40) });
      },
      _bindEvents: function() {
        var o = this._map, a = this.options.spiderfyOnMaxZoom, l = this.options.showCoverageOnHover, d = this.options.zoomToBoundsOnClick, w = this.options.spiderfyOnEveryZoom;
        (a || d || w) && this.on("clusterclick clusterkeypress", this._zoomOrSpiderfy, this), l && (this.on("clustermouseover", this._showCoverage, this), this.on("clustermouseout", this._hideCoverage, this), o.on("zoomend", this._hideCoverage, this));
      },
      _zoomOrSpiderfy: function(o) {
        var a = o.layer, l = a;
        if (!(o.type === "clusterkeypress" && o.originalEvent && o.originalEvent.keyCode !== 13)) {
          for (; l._childClusters.length === 1; )
            l = l._childClusters[0];
          l._zoom === this._maxZoom && l._childCount === a._childCount && this.options.spiderfyOnMaxZoom ? a.spiderfy() : this.options.zoomToBoundsOnClick && a.zoomToBounds(), this.options.spiderfyOnEveryZoom && a.spiderfy(), o.originalEvent && o.originalEvent.keyCode === 13 && this._map._container.focus();
        }
      },
      _showCoverage: function(o) {
        var a = this._map;
        this._inZoomAnimation || (this._shownPolygon && a.removeLayer(this._shownPolygon), o.layer.getChildCount() > 2 && o.layer !== this._spiderfied && (this._shownPolygon = new L.Polygon(o.layer.getConvexHull(), this.options.polygonOptions), a.addLayer(this._shownPolygon)));
      },
      _hideCoverage: function() {
        this._shownPolygon && (this._map.removeLayer(this._shownPolygon), this._shownPolygon = null);
      },
      _unbindEvents: function() {
        var o = this.options.spiderfyOnMaxZoom, a = this.options.showCoverageOnHover, l = this.options.zoomToBoundsOnClick, d = this.options.spiderfyOnEveryZoom, w = this._map;
        (o || l || d) && this.off("clusterclick clusterkeypress", this._zoomOrSpiderfy, this), a && (this.off("clustermouseover", this._showCoverage, this), this.off("clustermouseout", this._hideCoverage, this), w.off("zoomend", this._hideCoverage, this));
      },
      _zoomEnd: function() {
        this._map && (this._mergeSplitClusters(), this._zoom = Math.round(this._map._zoom), this._currentShownBounds = this._getExpandedVisibleBounds());
      },
      _moveEnd: function() {
        if (!this._inZoomAnimation) {
          var o = this._getExpandedVisibleBounds();
          this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), this._zoom, o), this._topClusterLevel._recursivelyAddChildrenToMap(null, Math.round(this._map._zoom), o), this._currentShownBounds = o;
        }
      },
      _generateInitialClusters: function() {
        var o = Math.ceil(this._map.getMaxZoom()), a = Math.floor(this._map.getMinZoom()), l = this.options.maxClusterRadius, d = l;
        typeof l != "function" && (d = function() {
          return l;
        }), this.options.disableClusteringAtZoom !== null && (o = this.options.disableClusteringAtZoom - 1), this._maxZoom = o, this._gridClusters = {}, this._gridUnclustered = {};
        for (var w = o; w >= a; w--)
          this._gridClusters[w] = new L.DistanceGrid(d(w)), this._gridUnclustered[w] = new L.DistanceGrid(d(w));
        this._topClusterLevel = new this._markerCluster(this, a - 1);
      },
      //Zoom: Zoom to start adding at (Pass this._maxZoom to start at the bottom)
      _addLayer: function(o, a) {
        var l = this._gridClusters, d = this._gridUnclustered, w = Math.floor(this._map.getMinZoom()), M, m;
        for (this.options.singleMarkerMode && this._overrideMarkerIcon(o), o.on(this._childMarkerEventHandlers, this); a >= w; a--) {
          M = this._map.project(o.getLatLng(), a);
          var b = l[a].getNearObject(M);
          if (b) {
            b._addChild(o), o.__parent = b;
            return;
          }
          if (b = d[a].getNearObject(M), b) {
            var g = b.__parent;
            g && this._removeLayer(b, !1);
            var f = new this._markerCluster(this, a, b, o);
            l[a].addObject(f, this._map.project(f._cLatLng, a)), b.__parent = f, o.__parent = f;
            var v = f;
            for (m = a - 1; m > g._zoom; m--)
              v = new this._markerCluster(this, m, v), l[m].addObject(v, this._map.project(b.getLatLng(), m));
            g._addChild(v), this._removeFromGridUnclustered(b, a);
            return;
          }
          d[a].addObject(o, M);
        }
        this._topClusterLevel._addChild(o), o.__parent = this._topClusterLevel;
      },
      /**
       * Refreshes the icon of all "dirty" visible clusters.
       * Non-visible "dirty" clusters will be updated when they are added to the map.
       * @private
       */
      _refreshClustersIcons: function() {
        this._featureGroup.eachLayer(function(o) {
          o instanceof L.MarkerCluster && o._iconNeedsUpdate && o._updateIcon();
        });
      },
      //Enqueue code to fire after the marker expand/contract has happened
      _enqueue: function(o) {
        this._queue.push(o), this._queueTimeout || (this._queueTimeout = setTimeout(L.bind(this._processQueue, this), 300));
      },
      _processQueue: function() {
        for (var o = 0; o < this._queue.length; o++)
          this._queue[o].call(this);
        this._queue.length = 0, clearTimeout(this._queueTimeout), this._queueTimeout = null;
      },
      //Merge and split any existing clusters that are too big or small
      _mergeSplitClusters: function() {
        var o = Math.round(this._map._zoom);
        this._processQueue(), this._zoom < o && this._currentShownBounds.intersects(this._getExpandedVisibleBounds()) ? (this._animationStart(), this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), this._zoom, this._getExpandedVisibleBounds()), this._animationZoomIn(this._zoom, o)) : this._zoom > o ? (this._animationStart(), this._animationZoomOut(this._zoom, o)) : this._moveEnd();
      },
      //Gets the maps visible bounds expanded in each direction by the size of the screen (so the user cannot see an area we do not cover in one pan)
      _getExpandedVisibleBounds: function() {
        if (this.options.removeOutsideVisibleBounds) {
          if (L.Browser.mobile)
            return this._checkBoundsMaxLat(this._map.getBounds());
        } else
          return this._mapBoundsInfinite;
        return this._checkBoundsMaxLat(this._map.getBounds().pad(1));
      },
      /**
       * Expands the latitude to Infinity (or -Infinity) if the input bounds reach the map projection maximum defined latitude
       * (in the case of Web/Spherical Mercator, it is 85.0511287798 / see https://en.wikipedia.org/wiki/Web_Mercator#Formulas).
       * Otherwise, the removeOutsideVisibleBounds option will remove markers beyond that limit, whereas the same markers without
       * this option (or outside MCG) will have their position floored (ceiled) by the projection and rendered at that limit,
       * making the user think that MCG "eats" them and never displays them again.
       * @param bounds L.LatLngBounds
       * @returns {L.LatLngBounds}
       * @private
       */
      _checkBoundsMaxLat: function(o) {
        var a = this._maxLat;
        return a !== void 0 && (o.getNorth() >= a && (o._northEast.lat = 1 / 0), o.getSouth() <= -a && (o._southWest.lat = -1 / 0)), o;
      },
      //Shared animation code
      _animationAddLayerNonAnimated: function(o, a) {
        if (a === o)
          this._featureGroup.addLayer(o);
        else if (a._childCount === 2) {
          a._addToMap();
          var l = a.getAllChildMarkers();
          this._featureGroup.removeLayer(l[0]), this._featureGroup.removeLayer(l[1]);
        } else
          a._updateIcon();
      },
      /**
       * Extracts individual (i.e. non-group) layers from a Layer Group.
       * @param group to extract layers from.
       * @param output {Array} in which to store the extracted layers.
       * @returns {*|Array}
       * @private
       */
      _extractNonGroupLayers: function(o, a) {
        var l = o.getLayers(), d = 0, w;
        for (a = a || []; d < l.length; d++) {
          if (w = l[d], w instanceof L.LayerGroup) {
            this._extractNonGroupLayers(w, a);
            continue;
          }
          a.push(w);
        }
        return a;
      },
      /**
       * Implements the singleMarkerMode option.
       * @param layer Marker to re-style using the Clusters iconCreateFunction.
       * @returns {L.Icon} The newly created icon.
       * @private
       */
      _overrideMarkerIcon: function(o) {
        var a = o.options.icon = this.options.iconCreateFunction({
          getChildCount: function() {
            return 1;
          },
          getAllChildMarkers: function() {
            return [o];
          }
        });
        return a;
      }
    });
    L.MarkerClusterGroup.include({
      _mapBoundsInfinite: new L.LatLngBounds(new L.LatLng(-1 / 0, -1 / 0), new L.LatLng(1 / 0, 1 / 0))
    }), L.MarkerClusterGroup.include({
      _noAnimation: {
        //Non Animated versions of everything
        _animationStart: function() {
        },
        _animationZoomIn: function(o, a) {
          this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), o), this._topClusterLevel._recursivelyAddChildrenToMap(null, a, this._getExpandedVisibleBounds()), this.fire("animationend");
        },
        _animationZoomOut: function(o, a) {
          this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), o), this._topClusterLevel._recursivelyAddChildrenToMap(null, a, this._getExpandedVisibleBounds()), this.fire("animationend");
        },
        _animationAddLayer: function(o, a) {
          this._animationAddLayerNonAnimated(o, a);
        }
      },
      _withAnimation: {
        //Animated versions here
        _animationStart: function() {
          this._map._mapPane.className += " leaflet-cluster-anim", this._inZoomAnimation++;
        },
        _animationZoomIn: function(o, a) {
          var l = this._getExpandedVisibleBounds(), d = this._featureGroup, w = Math.floor(this._map.getMinZoom()), M;
          this._ignoreMove = !0, this._topClusterLevel._recursively(l, o, w, function(m) {
            var b = m._latlng, g = m._markers, f;
            for (l.contains(b) || (b = null), m._isSingleParent() && o + 1 === a ? (d.removeLayer(m), m._recursivelyAddChildrenToMap(null, a, l)) : (m.clusterHide(), m._recursivelyAddChildrenToMap(b, a, l)), M = g.length - 1; M >= 0; M--)
              f = g[M], l.contains(f._latlng) || d.removeLayer(f);
          }), this._forceLayout(), this._topClusterLevel._recursivelyBecomeVisible(l, a), d.eachLayer(function(m) {
            !(m instanceof L.MarkerCluster) && m._icon && m.clusterShow();
          }), this._topClusterLevel._recursively(l, o, a, function(m) {
            m._recursivelyRestoreChildPositions(a);
          }), this._ignoreMove = !1, this._enqueue(function() {
            this._topClusterLevel._recursively(l, o, w, function(m) {
              d.removeLayer(m), m.clusterShow();
            }), this._animationEnd();
          });
        },
        _animationZoomOut: function(o, a) {
          this._animationZoomOutSingle(this._topClusterLevel, o - 1, a), this._topClusterLevel._recursivelyAddChildrenToMap(null, a, this._getExpandedVisibleBounds()), this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), o, this._getExpandedVisibleBounds());
        },
        _animationAddLayer: function(o, a) {
          var l = this, d = this._featureGroup;
          d.addLayer(o), a !== o && (a._childCount > 2 ? (a._updateIcon(), this._forceLayout(), this._animationStart(), o._setPos(this._map.latLngToLayerPoint(a.getLatLng())), o.clusterHide(), this._enqueue(function() {
            d.removeLayer(o), o.clusterShow(), l._animationEnd();
          })) : (this._forceLayout(), l._animationStart(), l._animationZoomOutSingle(a, this._map.getMaxZoom(), this._zoom)));
        }
      },
      // Private methods for animated versions.
      _animationZoomOutSingle: function(o, a, l) {
        var d = this._getExpandedVisibleBounds(), w = Math.floor(this._map.getMinZoom());
        o._recursivelyAnimateChildrenInAndAddSelfToMap(d, w, a + 1, l);
        var M = this;
        this._forceLayout(), o._recursivelyBecomeVisible(d, l), this._enqueue(function() {
          if (o._childCount === 1) {
            var m = o._markers[0];
            this._ignoreMove = !0, m.setLatLng(m.getLatLng()), this._ignoreMove = !1, m.clusterShow && m.clusterShow();
          } else
            o._recursively(d, l, w, function(b) {
              b._recursivelyRemoveChildrenFromMap(d, w, a + 1);
            });
          M._animationEnd();
        });
      },
      _animationEnd: function() {
        this._map && (this._map._mapPane.className = this._map._mapPane.className.replace(" leaflet-cluster-anim", "")), this._inZoomAnimation--, this.fire("animationend");
      },
      //Force a browser layout of stuff in the map
      // Should apply the current opacity and location to all elements so we can update them again for an animation
      _forceLayout: function() {
        L.Util.falseFn(document.body.offsetWidth);
      }
    }), L.markerClusterGroup = function(o) {
      return new L.MarkerClusterGroup(o);
    };
    var y = L.MarkerCluster = L.Marker.extend({
      options: L.Icon.prototype.options,
      initialize: function(o, a, l, d) {
        L.Marker.prototype.initialize.call(
          this,
          l ? l._cLatLng || l.getLatLng() : new L.LatLng(0, 0),
          { icon: this, pane: o.options.clusterPane }
        ), this._group = o, this._zoom = a, this._markers = [], this._childClusters = [], this._childCount = 0, this._iconNeedsUpdate = !0, this._boundsNeedUpdate = !0, this._bounds = new L.LatLngBounds(), l && this._addChild(l), d && this._addChild(d);
      },
      //Recursively retrieve all child markers of this cluster
      getAllChildMarkers: function(o, a) {
        o = o || [];
        for (var l = this._childClusters.length - 1; l >= 0; l--)
          this._childClusters[l].getAllChildMarkers(o, a);
        for (var d = this._markers.length - 1; d >= 0; d--)
          a && this._markers[d].__dragStart || o.push(this._markers[d]);
        return o;
      },
      //Returns the count of how many child markers we have
      getChildCount: function() {
        return this._childCount;
      },
      //Zoom to the minimum of showing all of the child markers, or the extents of this cluster
      zoomToBounds: function(o) {
        for (var a = this._childClusters.slice(), l = this._group._map, d = l.getBoundsZoom(this._bounds), w = this._zoom + 1, M = l.getZoom(), m; a.length > 0 && d > w; ) {
          w++;
          var b = [];
          for (m = 0; m < a.length; m++)
            b = b.concat(a[m]._childClusters);
          a = b;
        }
        d > w ? this._group._map.setView(this._latlng, w) : d <= M ? this._group._map.setView(this._latlng, M + 1) : this._group._map.fitBounds(this._bounds, o);
      },
      getBounds: function() {
        var o = new L.LatLngBounds();
        return o.extend(this._bounds), o;
      },
      _updateIcon: function() {
        this._iconNeedsUpdate = !0, this._icon && this.setIcon(this);
      },
      //Cludge for Icon, we pretend to be an icon for performance
      createIcon: function() {
        return this._iconNeedsUpdate && (this._iconObj = this._group.options.iconCreateFunction(this), this._iconNeedsUpdate = !1), this._iconObj.createIcon();
      },
      createShadow: function() {
        return this._iconObj.createShadow();
      },
      _addChild: function(o, a) {
        this._iconNeedsUpdate = !0, this._boundsNeedUpdate = !0, this._setClusterCenter(o), o instanceof L.MarkerCluster ? (a || (this._childClusters.push(o), o.__parent = this), this._childCount += o._childCount) : (a || this._markers.push(o), this._childCount++), this.__parent && this.__parent._addChild(o, !0);
      },
      /**
       * Makes sure the cluster center is set. If not, uses the child center if it is a cluster, or the marker position.
       * @param child L.MarkerCluster|L.Marker that will be used as cluster center if not defined yet.
       * @private
       */
      _setClusterCenter: function(o) {
        this._cLatLng || (this._cLatLng = o._cLatLng || o._latlng);
      },
      /**
       * Assigns impossible bounding values so that the next extend entirely determines the new bounds.
       * This method avoids having to trash the previous L.LatLngBounds object and to create a new one, which is much slower for this class.
       * As long as the bounds are not extended, most other methods would probably fail, as they would with bounds initialized but not extended.
       * @private
       */
      _resetBounds: function() {
        var o = this._bounds;
        o._southWest && (o._southWest.lat = 1 / 0, o._southWest.lng = 1 / 0), o._northEast && (o._northEast.lat = -1 / 0, o._northEast.lng = -1 / 0);
      },
      _recalculateBounds: function() {
        var o = this._markers, a = this._childClusters, l = 0, d = 0, w = this._childCount, M, m, b, g;
        if (w !== 0) {
          for (this._resetBounds(), M = 0; M < o.length; M++)
            b = o[M]._latlng, this._bounds.extend(b), l += b.lat, d += b.lng;
          for (M = 0; M < a.length; M++)
            m = a[M], m._boundsNeedUpdate && m._recalculateBounds(), this._bounds.extend(m._bounds), b = m._wLatLng, g = m._childCount, l += b.lat * g, d += b.lng * g;
          this._latlng = this._wLatLng = new L.LatLng(l / w, d / w), this._boundsNeedUpdate = !1;
        }
      },
      //Set our markers position as given and add it to the map
      _addToMap: function(o) {
        o && (this._backupLatlng = this._latlng, this.setLatLng(o)), this._group._featureGroup.addLayer(this);
      },
      _recursivelyAnimateChildrenIn: function(o, a, l) {
        this._recursively(
          o,
          this._group._map.getMinZoom(),
          l - 1,
          function(d) {
            var w = d._markers, M, m;
            for (M = w.length - 1; M >= 0; M--)
              m = w[M], m._icon && (m._setPos(a), m.clusterHide());
          },
          function(d) {
            var w = d._childClusters, M, m;
            for (M = w.length - 1; M >= 0; M--)
              m = w[M], m._icon && (m._setPos(a), m.clusterHide());
          }
        );
      },
      _recursivelyAnimateChildrenInAndAddSelfToMap: function(o, a, l, d) {
        this._recursively(
          o,
          d,
          a,
          function(w) {
            w._recursivelyAnimateChildrenIn(o, w._group._map.latLngToLayerPoint(w.getLatLng()).round(), l), w._isSingleParent() && l - 1 === d ? (w.clusterShow(), w._recursivelyRemoveChildrenFromMap(o, a, l)) : w.clusterHide(), w._addToMap();
          }
        );
      },
      _recursivelyBecomeVisible: function(o, a) {
        this._recursively(o, this._group._map.getMinZoom(), a, null, function(l) {
          l.clusterShow();
        });
      },
      _recursivelyAddChildrenToMap: function(o, a, l) {
        this._recursively(
          l,
          this._group._map.getMinZoom() - 1,
          a,
          function(d) {
            if (a !== d._zoom)
              for (var w = d._markers.length - 1; w >= 0; w--) {
                var M = d._markers[w];
                l.contains(M._latlng) && (o && (M._backupLatlng = M.getLatLng(), M.setLatLng(o), M.clusterHide && M.clusterHide()), d._group._featureGroup.addLayer(M));
              }
          },
          function(d) {
            d._addToMap(o);
          }
        );
      },
      _recursivelyRestoreChildPositions: function(o) {
        for (var a = this._markers.length - 1; a >= 0; a--) {
          var l = this._markers[a];
          l._backupLatlng && (l.setLatLng(l._backupLatlng), delete l._backupLatlng);
        }
        if (o - 1 === this._zoom)
          for (var d = this._childClusters.length - 1; d >= 0; d--)
            this._childClusters[d]._restorePosition();
        else
          for (var w = this._childClusters.length - 1; w >= 0; w--)
            this._childClusters[w]._recursivelyRestoreChildPositions(o);
      },
      _restorePosition: function() {
        this._backupLatlng && (this.setLatLng(this._backupLatlng), delete this._backupLatlng);
      },
      //exceptBounds: If set, don't remove any markers/clusters in it
      _recursivelyRemoveChildrenFromMap: function(o, a, l, d) {
        var w, M;
        this._recursively(
          o,
          a - 1,
          l - 1,
          function(m) {
            for (M = m._markers.length - 1; M >= 0; M--)
              w = m._markers[M], (!d || !d.contains(w._latlng)) && (m._group._featureGroup.removeLayer(w), w.clusterShow && w.clusterShow());
          },
          function(m) {
            for (M = m._childClusters.length - 1; M >= 0; M--)
              w = m._childClusters[M], (!d || !d.contains(w._latlng)) && (m._group._featureGroup.removeLayer(w), w.clusterShow && w.clusterShow());
          }
        );
      },
      //Run the given functions recursively to this and child clusters
      // boundsToApplyTo: a L.LatLngBounds representing the bounds of what clusters to recurse in to
      // zoomLevelToStart: zoom level to start running functions (inclusive)
      // zoomLevelToStop: zoom level to stop running functions (inclusive)
      // runAtEveryLevel: function that takes an L.MarkerCluster as an argument that should be applied on every level
      // runAtBottomLevel: function that takes an L.MarkerCluster as an argument that should be applied at only the bottom level
      _recursively: function(o, a, l, d, w) {
        var M = this._childClusters, m = this._zoom, b, g;
        if (a <= m && (d && d(this), w && m === l && w(this)), m < a || m < l)
          for (b = M.length - 1; b >= 0; b--)
            g = M[b], g._boundsNeedUpdate && g._recalculateBounds(), o.intersects(g._bounds) && g._recursively(o, a, l, d, w);
      },
      //Returns true if we are the parent of only one cluster and that cluster is the same as us
      _isSingleParent: function() {
        return this._childClusters.length > 0 && this._childClusters[0]._childCount === this._childCount;
      }
    });
    L.Marker.include({
      clusterHide: function() {
        var o = this.options.opacity;
        return this.setOpacity(0), this.options.opacity = o, this;
      },
      clusterShow: function() {
        return this.setOpacity(this.options.opacity);
      }
    }), L.DistanceGrid = function(o) {
      this._cellSize = o, this._sqCellSize = o * o, this._grid = {}, this._objectPoint = {};
    }, L.DistanceGrid.prototype = {
      addObject: function(o, a) {
        var l = this._getCoord(a.x), d = this._getCoord(a.y), w = this._grid, M = w[d] = w[d] || {}, m = M[l] = M[l] || [], b = L.Util.stamp(o);
        this._objectPoint[b] = a, m.push(o);
      },
      updateObject: function(o, a) {
        this.removeObject(o), this.addObject(o, a);
      },
      //Returns true if the object was found
      removeObject: function(o, a) {
        var l = this._getCoord(a.x), d = this._getCoord(a.y), w = this._grid, M = w[d] = w[d] || {}, m = M[l] = M[l] || [], b, g;
        for (delete this._objectPoint[L.Util.stamp(o)], b = 0, g = m.length; b < g; b++)
          if (m[b] === o)
            return m.splice(b, 1), g === 1 && delete M[l], !0;
      },
      eachObject: function(o, a) {
        var l, d, w, M, m, b, g, f = this._grid;
        for (l in f) {
          m = f[l];
          for (d in m)
            for (b = m[d], w = 0, M = b.length; w < M; w++)
              g = o.call(a, b[w]), g && (w--, M--);
        }
      },
      getNearObject: function(o) {
        var a = this._getCoord(o.x), l = this._getCoord(o.y), d, w, M, m, b, g, f, v, C = this._objectPoint, T = this._sqCellSize, k = null;
        for (d = l - 1; d <= l + 1; d++)
          if (m = this._grid[d], m) {
            for (w = a - 1; w <= a + 1; w++)
              if (b = m[w], b)
                for (M = 0, g = b.length; M < g; M++)
                  f = b[M], v = this._sqDist(C[L.Util.stamp(f)], o), (v < T || v <= T && k === null) && (T = v, k = f);
          }
        return k;
      },
      _getCoord: function(o) {
        var a = Math.floor(o / this._cellSize);
        return isFinite(a) ? a : o;
      },
      _sqDist: function(o, a) {
        var l = a.x - o.x, d = a.y - o.y;
        return l * l + d * d;
      }
    }, function() {
      L.QuickHull = {
        /*
         * @param {Object} cpt a point to be measured from the baseline
         * @param {Array} bl the baseline, as represented by a two-element
         *   array of latlng objects.
         * @returns {Number} an approximate distance measure
         */
        getDistant: function(o, a) {
          var l = a[1].lat - a[0].lat, d = a[0].lng - a[1].lng;
          return d * (o.lat - a[0].lat) + l * (o.lng - a[0].lng);
        },
        /*
         * @param {Array} baseLine a two-element array of latlng objects
         *   representing the baseline to project from
         * @param {Array} latLngs an array of latlng objects
         * @returns {Object} the maximum point and all new points to stay
         *   in consideration for the hull.
         */
        findMostDistantPointFromBaseLine: function(o, a) {
          var l = 0, d = null, w = [], M, m, b;
          for (M = a.length - 1; M >= 0; M--) {
            if (m = a[M], b = this.getDistant(m, o), b > 0)
              w.push(m);
            else
              continue;
            b > l && (l = b, d = m);
          }
          return { maxPoint: d, newPoints: w };
        },
        /*
         * Given a baseline, compute the convex hull of latLngs as an array
         * of latLngs.
         *
         * @param {Array} latLngs
         * @returns {Array}
         */
        buildConvexHull: function(o, a) {
          var l = [], d = this.findMostDistantPointFromBaseLine(o, a);
          return d.maxPoint ? (l = l.concat(
            this.buildConvexHull([o[0], d.maxPoint], d.newPoints)
          ), l = l.concat(
            this.buildConvexHull([d.maxPoint, o[1]], d.newPoints)
          ), l) : [o[0]];
        },
        /*
         * Given an array of latlngs, compute a convex hull as an array
         * of latlngs
         *
         * @param {Array} latLngs
         * @returns {Array}
         */
        getConvexHull: function(o) {
          var a = !1, l = !1, d = !1, w = !1, M = null, m = null, b = null, g = null, f = null, v = null, C;
          for (C = o.length - 1; C >= 0; C--) {
            var T = o[C];
            (a === !1 || T.lat > a) && (M = T, a = T.lat), (l === !1 || T.lat < l) && (m = T, l = T.lat), (d === !1 || T.lng > d) && (b = T, d = T.lng), (w === !1 || T.lng < w) && (g = T, w = T.lng);
          }
          l !== a ? (v = m, f = M) : (v = g, f = b);
          var k = [].concat(
            this.buildConvexHull([v, f], o),
            this.buildConvexHull([f, v], o)
          );
          return k;
        }
      };
    }(), L.MarkerCluster.include({
      getConvexHull: function() {
        var o = this.getAllChildMarkers(), a = [], l, d;
        for (d = o.length - 1; d >= 0; d--)
          l = o[d].getLatLng(), a.push(l);
        return L.QuickHull.getConvexHull(a);
      }
    }), L.MarkerCluster.include({
      _2PI: Math.PI * 2,
      _circleFootSeparation: 25,
      //related to circumference of circle
      _circleStartAngle: 0,
      _spiralFootSeparation: 28,
      //related to size of spiral (experiment!)
      _spiralLengthStart: 11,
      _spiralLengthFactor: 5,
      _circleSpiralSwitchover: 9,
      //show spiral instead of circle from this marker count upwards.
      // 0 -> always spiral; Infinity -> always circle
      spiderfy: function() {
        if (!(this._group._spiderfied === this || this._group._inZoomAnimation)) {
          var o = this.getAllChildMarkers(null, !0), a = this._group, l = a._map, d = l.latLngToLayerPoint(this._latlng), w;
          this._group._unspiderfy(), this._group._spiderfied = this, this._group.options.spiderfyShapePositions ? w = this._group.options.spiderfyShapePositions(o.length, d) : o.length >= this._circleSpiralSwitchover ? w = this._generatePointsSpiral(o.length, d) : (d.y += 10, w = this._generatePointsCircle(o.length, d)), this._animationSpiderfy(o, w);
        }
      },
      unspiderfy: function(o) {
        this._group._inZoomAnimation || (this._animationUnspiderfy(o), this._group._spiderfied = null);
      },
      _generatePointsCircle: function(o, a) {
        var l = this._group.options.spiderfyDistanceMultiplier * this._circleFootSeparation * (2 + o), d = l / this._2PI, w = this._2PI / o, M = [], m, b;
        for (d = Math.max(d, 35), M.length = o, m = 0; m < o; m++)
          b = this._circleStartAngle + m * w, M[m] = new L.Point(a.x + d * Math.cos(b), a.y + d * Math.sin(b))._round();
        return M;
      },
      _generatePointsSpiral: function(o, a) {
        var l = this._group.options.spiderfyDistanceMultiplier, d = l * this._spiralLengthStart, w = l * this._spiralFootSeparation, M = l * this._spiralLengthFactor * this._2PI, m = 0, b = [], g;
        for (b.length = o, g = o; g >= 0; g--)
          g < o && (b[g] = new L.Point(a.x + d * Math.cos(m), a.y + d * Math.sin(m))._round()), m += w / d + g * 5e-4, d += M / m;
        return b;
      },
      _noanimationUnspiderfy: function() {
        var o = this._group, a = o._map, l = o._featureGroup, d = this.getAllChildMarkers(null, !0), w, M;
        for (o._ignoreMove = !0, this.setOpacity(1), M = d.length - 1; M >= 0; M--)
          w = d[M], l.removeLayer(w), w._preSpiderfyLatlng && (w.setLatLng(w._preSpiderfyLatlng), delete w._preSpiderfyLatlng), w.setZIndexOffset && w.setZIndexOffset(0), w._spiderLeg && (a.removeLayer(w._spiderLeg), delete w._spiderLeg);
        o.fire("unspiderfied", {
          cluster: this,
          markers: d
        }), o._ignoreMove = !1, o._spiderfied = null;
      }
    }), L.MarkerClusterNonAnimated = L.MarkerCluster.extend({
      _animationSpiderfy: function(o, a) {
        var l = this._group, d = l._map, w = l._featureGroup, M = this._group.options.spiderLegPolylineOptions, m, b, g, f;
        for (l._ignoreMove = !0, m = 0; m < o.length; m++)
          f = d.layerPointToLatLng(a[m]), b = o[m], g = new L.Polyline([this._latlng, f], M), d.addLayer(g), b._spiderLeg = g, b._preSpiderfyLatlng = b._latlng, b.setLatLng(f), b.setZIndexOffset && b.setZIndexOffset(1e6), w.addLayer(b);
        this.setOpacity(0.3), l._ignoreMove = !1, l.fire("spiderfied", {
          cluster: this,
          markers: o
        });
      },
      _animationUnspiderfy: function() {
        this._noanimationUnspiderfy();
      }
    }), L.MarkerCluster.include({
      _animationSpiderfy: function(o, a) {
        var l = this, d = this._group, w = d._map, M = d._featureGroup, m = this._latlng, b = w.latLngToLayerPoint(m), g = L.Path.SVG, f = L.extend({}, this._group.options.spiderLegPolylineOptions), v = f.opacity, C, T, k, I, U, H;
        for (v === void 0 && (v = L.MarkerClusterGroup.prototype.options.spiderLegPolylineOptions.opacity), g ? (f.opacity = 0, f.className = (f.className || "") + " leaflet-cluster-spider-leg") : f.opacity = v, d._ignoreMove = !0, C = 0; C < o.length; C++)
          T = o[C], H = w.layerPointToLatLng(a[C]), k = new L.Polyline([m, H], f), w.addLayer(k), T._spiderLeg = k, g && (I = k._path, U = I.getTotalLength() + 0.1, I.style.strokeDasharray = U, I.style.strokeDashoffset = U), T.setZIndexOffset && T.setZIndexOffset(1e6), T.clusterHide && T.clusterHide(), M.addLayer(T), T._setPos && T._setPos(b);
        for (d._forceLayout(), d._animationStart(), C = o.length - 1; C >= 0; C--)
          H = w.layerPointToLatLng(a[C]), T = o[C], T._preSpiderfyLatlng = T._latlng, T.setLatLng(H), T.clusterShow && T.clusterShow(), g && (k = T._spiderLeg, I = k._path, I.style.strokeDashoffset = 0, k.setStyle({ opacity: v }));
        this.setOpacity(0.3), d._ignoreMove = !1, setTimeout(function() {
          d._animationEnd(), d.fire("spiderfied", {
            cluster: l,
            markers: o
          });
        }, 200);
      },
      _animationUnspiderfy: function(o) {
        var a = this, l = this._group, d = l._map, w = l._featureGroup, M = o ? d._latLngToNewLayerPoint(this._latlng, o.zoom, o.center) : d.latLngToLayerPoint(this._latlng), m = this.getAllChildMarkers(null, !0), b = L.Path.SVG, g, f, v, C, T, k;
        for (l._ignoreMove = !0, l._animationStart(), this.setOpacity(1), f = m.length - 1; f >= 0; f--)
          g = m[f], g._preSpiderfyLatlng && (g.closePopup(), g.setLatLng(g._preSpiderfyLatlng), delete g._preSpiderfyLatlng, k = !0, g._setPos && (g._setPos(M), k = !1), g.clusterHide && (g.clusterHide(), k = !1), k && w.removeLayer(g), b && (v = g._spiderLeg, C = v._path, T = C.getTotalLength() + 0.1, C.style.strokeDashoffset = T, v.setStyle({ opacity: 0 })));
        l._ignoreMove = !1, setTimeout(function() {
          var I = 0;
          for (f = m.length - 1; f >= 0; f--)
            g = m[f], g._spiderLeg && I++;
          for (f = m.length - 1; f >= 0; f--)
            g = m[f], g._spiderLeg && (g.clusterShow && g.clusterShow(), g.setZIndexOffset && g.setZIndexOffset(0), I > 1 && w.removeLayer(g), d.removeLayer(g._spiderLeg), delete g._spiderLeg);
          l._animationEnd(), l.fire("unspiderfied", {
            cluster: a,
            markers: m
          });
        }, 200);
      }
    }), L.MarkerClusterGroup.include({
      //The MarkerCluster currently spiderfied (if any)
      _spiderfied: null,
      unspiderfy: function() {
        this._unspiderfy.apply(this, arguments);
      },
      _spiderfierOnAdd: function() {
        this._map.on("click", this._unspiderfyWrapper, this), this._map.options.zoomAnimation && this._map.on("zoomstart", this._unspiderfyZoomStart, this), this._map.on("zoomend", this._noanimationUnspiderfy, this), L.Browser.touch || this._map.getRenderer(this);
      },
      _spiderfierOnRemove: function() {
        this._map.off("click", this._unspiderfyWrapper, this), this._map.off("zoomstart", this._unspiderfyZoomStart, this), this._map.off("zoomanim", this._unspiderfyZoomAnim, this), this._map.off("zoomend", this._noanimationUnspiderfy, this), this._noanimationUnspiderfy();
      },
      //On zoom start we add a zoomanim handler so that we are guaranteed to be last (after markers are animated)
      //This means we can define the animation they do rather than Markers doing an animation to their actual location
      _unspiderfyZoomStart: function() {
        this._map && this._map.on("zoomanim", this._unspiderfyZoomAnim, this);
      },
      _unspiderfyZoomAnim: function(o) {
        L.DomUtil.hasClass(this._map._mapPane, "leaflet-touching") || (this._map.off("zoomanim", this._unspiderfyZoomAnim, this), this._unspiderfy(o));
      },
      _unspiderfyWrapper: function() {
        this._unspiderfy();
      },
      _unspiderfy: function(o) {
        this._spiderfied && this._spiderfied.unspiderfy(o);
      },
      _noanimationUnspiderfy: function() {
        this._spiderfied && this._spiderfied._noanimationUnspiderfy();
      },
      //If the given layer is currently being spiderfied then we unspiderfy it so it isn't on the map anymore etc
      _unspiderfyLayer: function(o) {
        o._spiderLeg && (this._featureGroup.removeLayer(o), o.clusterShow && o.clusterShow(), o.setZIndexOffset && o.setZIndexOffset(0), this._map.removeLayer(o._spiderLeg), delete o._spiderLeg);
      }
    }), L.MarkerClusterGroup.include({
      /**
       * Updates the icon of all clusters which are parents of the given marker(s).
       * In singleMarkerMode, also updates the given marker(s) icon.
       * @param layers L.MarkerClusterGroup|L.LayerGroup|Array(L.Marker)|Map(L.Marker)|
       * L.MarkerCluster|L.Marker (optional) list of markers (or single marker) whose parent
       * clusters need to be updated. If not provided, retrieves all child markers of this.
       * @returns {L.MarkerClusterGroup}
       */
      refreshClusters: function(o) {
        return o ? o instanceof L.MarkerClusterGroup ? o = o._topClusterLevel.getAllChildMarkers() : o instanceof L.LayerGroup ? o = o._layers : o instanceof L.MarkerCluster ? o = o.getAllChildMarkers() : o instanceof L.Marker && (o = [o]) : o = this._topClusterLevel.getAllChildMarkers(), this._flagParentsIconsNeedUpdate(o), this._refreshClustersIcons(), this.options.singleMarkerMode && this._refreshSingleMarkerModeMarkers(o), this;
      },
      /**
       * Simply flags all parent clusters of the given markers as having a "dirty" icon.
       * @param layers Array(L.Marker)|Map(L.Marker) list of markers.
       * @private
       */
      _flagParentsIconsNeedUpdate: function(o) {
        var a, l;
        for (a in o)
          for (l = o[a].__parent; l; )
            l._iconNeedsUpdate = !0, l = l.__parent;
      },
      /**
       * Re-draws the icon of the supplied markers.
       * To be used in singleMarkerMode only.
       * @param layers Array(L.Marker)|Map(L.Marker) list of markers.
       * @private
       */
      _refreshSingleMarkerModeMarkers: function(o) {
        var a, l;
        for (a in o)
          l = o[a], this.hasLayer(l) && l.setIcon(this._overrideMarkerIcon(l));
      }
    }), L.Marker.include({
      /**
       * Updates the given options in the marker's icon and refreshes the marker.
       * @param options map object of icon options.
       * @param directlyRefreshClusters boolean (optional) true to trigger
       * MCG.refreshClustersOf() right away with this single marker.
       * @returns {L.Marker}
       */
      refreshIconOptions: function(o, a) {
        var l = this.options.icon;
        return L.setOptions(l, o), this.setIcon(l), a && this.__parent && this.__parent._group.refreshClusters(this), this;
      }
    }), s.MarkerClusterGroup = c, s.MarkerCluster = y, Object.defineProperty(s, "__esModule", { value: !0 });
  });
})(En, En.exports);
async function Bn(p) {
  return new Promise((u, s) => {
    const c = new Image();
    c.src = p, c.onload = function() {
      u({ width: c.width, height: c.height });
    }, c.onerror = function() {
      s(new Error(`Failed to load image: ${p}`));
    };
  });
}
const Zn = [114.057939, 22.543527], Is = 16, zs = "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", As = "https://t0.tianditu.gov.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}&tk={key}";
class Es extends Ts {
  constructor(s) {
    super(s);
    ct(this, "mapLayer");
    ct(this, "circles", []);
    // 存储所有添加的圆形
    ct(this, "markers", []);
    // 存储所有添加的标记
    ct(this, "mapStatus", null);
    ct(this, "markerClusterGroup", null);
  }
  async renderMap(s, c) {
    var a, l;
    c = c ?? {}, c.zoomControl = (c == null ? void 0 : c.zoomControl) ?? !1, c.rotateControl = (c == null ? void 0 : c.rotateControl) ?? !1, c.center = (c == null ? void 0 : c.center) ?? { lng: Zn[0], lat: Zn[1] }, await this.mapLoader();
    const y = this.mapType === "TD_MAP" ? it.transformGCJ02ToWGS84(c.center.lng, c.center.lat) : [c.center.lng, c.center.lat];
    this.mapInstance = K.map(s, {
      zoomControl: c.zoomControl,
      attributionControl: !1,
      zoomSnap: 0.5,
      rotateControl: c.rotateControl,
      rotate: !0,
      renderer: K.canvas()
    }).setView(
      [y[1], y[0]],
      Is
    );
    const o = this.mapType === "TD_MAP" ? As.replace("{key}", ((a = this.mapConfig) == null ? void 0 : a.webKey) ?? "") : zs;
    this.mapLayer = K.tileLayer(o, {
      maxZoom: 18,
      minZoom: 3,
      className: "cube-map-base-tile"
    }), this.mapLayer.addTo(this.mapInstance), this.mapType === "TD_MAP" && K.tileLayer.chinaProvider("TianDiTu.Normal.Annotion", { key: (l = this.mapConfig) == null ? void 0 : l.webKey, maxZoom: 18, minZoom: 5, className: "cube-map-text-tile" }).addTo(this.mapInstance);
    try {
      document.querySelector("#" + s).style.cursor = "auto";
    } catch {
    }
    this.mapInstance.on("click", (d) => {
      const w = this.mapType === "TD_MAP" ? it.transformWGS84ToGCJ02(d.latlng.lng, d.latlng.lat) : [d.latlng.lng, d.latlng.lat];
      this.onMapClick && this.onMapClick({
        mapType: this.mapType,
        lng: w[0],
        lat: w[1]
      });
    });
  }
  async setCenter(s, c) {
    this.ensureMapInstance(), s = Number(s), c = Number(c);
    const y = this.mapType === "TD_MAP" ? it.transformGCJ02ToWGS84(s, c) : [s, c];
    return s = y[0], c = y[1], new Promise((o) => {
      this.mapInstance.flyTo([c, s]).once("moveend", () => {
        o();
      });
    });
  }
  async setRealCenter(s, c) {
    this.ensureMapInstance(), s = Number(s), c = Number(c);
    const y = [s, c];
    return s = y[0], c = y[1], new Promise((o) => {
      this.mapInstance.flyTo([c, s]).once("moveend", () => {
        o();
      });
    });
  }
  async setZoom(s) {
    return this.ensureMapInstance(), new Promise((c) => {
      var y;
      (y = this.mapInstance) == null || y.setZoom(s).once("zoomend", () => {
        c();
      });
    });
  }
  setRotation(s) {
    var c;
    this.ensureMapInstance(), (c = this.mapInstance) == null || c.setBearing(s);
  }
  clearMap() {
    this.ensureMapInstance();
    const s = this.mapInstance;
    s.eachLayer(function(c) {
      c instanceof K.TileLayer || s.removeLayer(c);
    }), this.circles = [], this.initClusterLayer();
  }
  destroy() {
    var s;
    (s = this.mapInstance) == null || s.remove();
  }
  // 创建点标记 但不添加到地图上
  createMarker(s) {
    s.position.lat = Number(s.position.lat), s.position.lng = Number(s.position.lng);
    const c = this.mapType === "TD_MAP" ? it.transformGCJ02ToWGS84(s.position.lng, s.position.lat) : [s.position.lng, s.position.lat];
    s.position.lng = c[0], s.position.lat = c[1], s.icon = s.icon ?? "https://webapi.amap.com/theme/v1.3/markers/b/mark_bs.png";
    const y = K.icon({
      iconUrl: s.icon,
      iconSize: [s.iconSize[0], s.iconSize[1]],
      // size of the icon
      iconAnchor: [s.iconSize[0] / 2, s.iconSize[1] / 2]
      // 根据 offset 调整 iconAnchor
    }), o = K.marker([s.position.lat, s.position.lng], { icon: y });
    if (s.label && o.bindTooltip(s.label.content, {
      direction: s.label.direction,
      // 标签方向
      permanent: !0,
      // 永久显示
      offset: K.point(s.label.offset.x, s.label.offset.y)
      // 偏移量
    }), s.content) {
      const a = document.createElement("div");
      a.innerHTML = s.content, a.style.position = "absolute", a.style.visibility = "hidden", document.body.appendChild(a), setTimeout(() => {
        const l = a.getBoundingClientRect(), d = l.width, w = l.height;
        document.body.removeChild(a), o.setIcon(
          K.divIcon({
            html: s.content,
            // 设置 HTML 内容
            iconSize: [d, w],
            // 动态设置图标大小
            iconAnchor: [d / 2, w / 2]
            // 动态设置图标锚点
          })
        );
      }, 0);
    }
    return o;
  }
  async addMarker(s) {
    this.ensureMapInstance(), s.position.lat = Number(s.position.lat), s.position.lng = Number(s.position.lng), s.icon = s.icon ?? "https://webapi.amap.com/theme/v1.3/markers/b/mark_bs.png";
    const { width: c, height: y } = await Bn(s.icon);
    s.iconSize = s.iconSize ?? [c, y];
    const o = this.mapType === "TD_MAP" ? it.transformGCJ02ToWGS84(s.position.lng, s.position.lat) : [s.position.lng, s.position.lat];
    s.position.lng = o[0], s.position.lat = o[1];
    const a = K.icon({
      iconUrl: s.icon,
      iconSize: [s.iconSize[0], s.iconSize[1]],
      // size of the icon
      iconAnchor: [s.iconSize[0] / 2, s.iconSize[1]],
      // point of the icon which will correspond to marker's location
      popupAnchor: [0, -s.iconSize[1] * 1.2]
      // Popup 出现在图标正上方
    }), l = K.marker([s.position.lat, s.position.lng], { icon: a }).addTo(this.mapInstance);
    return l.on("click", function() {
      var d;
      (d = s.onClick) == null || d.call(s, l);
    }), this.markers.push(l), l;
  }
  removeMarker(s) {
    this.ensureMapInstance(), this.mapInstance.removeLayer(s);
    const c = this.markers.indexOf(s);
    c !== -1 && this.markers.splice(c, 1);
  }
  removeAllMarker() {
    this.markers.slice().forEach((c) => {
      this.removeMarker(c);
    });
  }
  registerMapClickEvent() {
  }
  getMapInstance() {
    return this.ensureMapInstance(), this.mapInstance;
  }
  /**
   * 在地图上添加圆形
   * @param options 圆形配置选项
   * @returns 返回创建的圆形对象
   */
  addCircle(s) {
    this.ensureMapInstance();
    const c = { ...s.center };
    c.lat = Number(c.lat), c.lng = Number(c.lng);
    const y = this.mapType === "TD_MAP" ? it.transformGCJ02ToWGS84(c.lng, c.lat) : [c.lng, c.lat], o = K.circle([y[1], y[0]], {
      radius: s.radius
    }).addTo(this.mapInstance);
    return this.circles.push(o), o;
  }
  /**
   * 清除地图上所有的圆形
   */
  clearCircles() {
    this.ensureMapInstance(), this.circles.forEach((s) => {
      this.mapInstance && this.mapInstance.removeLayer(s);
    }), this.circles = [];
  }
  // /**
  //  * 清除地图上所有的标点
  //  */
  // public clearMarkers (): void {
  //   this.ensureMapInstance()
  //   // 移除所有的标点
  //   this.markers.forEach(marker => {
  //     if (this.mapInstance) {
  //       this.mapInstance.removeLayer(marker)
  //     }
  //   })
  //   // 清空数组
  //   this.markers = []
  // }
  createdImageLayer(s) {
    if (s.bounds[0].lat = Number(s.bounds[0].lat), s.bounds[0].lng = Number(s.bounds[0].lng), s.bounds[1].lat = Number(s.bounds[1].lat), s.bounds[1].lng = Number(s.bounds[1].lng), this.mapType === "TD_MAP") {
      const y = it.transformGCJ02ToWGS84(s.bounds[0].lng, s.bounds[0].lat), o = it.transformGCJ02ToWGS84(s.bounds[1].lng, s.bounds[1].lat);
      s.bounds[0].lat = y[1], s.bounds[0].lng = y[0], s.bounds[1].lat = o[1], s.bounds[1].lng = o[0];
    }
    const c = [
      [s.bounds[0].lat, s.bounds[0].lng],
      [s.bounds[1].lat, s.bounds[1].lng]
    ];
    return K.imageOverlay(s.imageUrl, c);
  }
  addImageLayer(s) {
    this.ensureMapInstance(), s.addTo(this.mapInstance);
  }
  removeImageLayer(s) {
    this.ensureMapInstance(), this.mapInstance.removeLayer(s);
  }
  /**
  * 设置地图的最小和最大缩放级别
  * @param minZoom 最小缩放级别
  * @param maxZoom 最大缩放级别
  * @param zooms [minZoom, maxZoom]
  */
  setZooms(s) {
    this.ensureMapInstance(), this.mapInstance.setMinZoom(s[0]), this.mapInstance.setMaxZoom(s[1]);
  }
  setLimitBounds(s) {
    if (this.ensureMapInstance(), s[0].lat = Number(s[0].lat), s[0].lng = Number(s[0].lng), s[1].lat = Number(s[1].lat), s[1].lng = Number(s[1].lng), this.mapType === "TD_MAP") {
      const y = it.transformGCJ02ToWGS84(s[0].lng, s[0].lat), o = it.transformGCJ02ToWGS84(s[1].lng, s[1].lat);
      s[0].lat = y[1], s[0].lng = y[0], s[1].lat = o[1], s[1].lng = o[0];
    }
    const c = [
      [s[0].lat, s[0].lng],
      [s[1].lat, s[1].lng]
    ];
    this.mapInstance.setMaxBounds(c);
  }
  createInfoWindow(s) {
    const c = document.createElement("div");
    c.style.position = "absolute", c.style.visibility = "hidden", document.body.appendChild(c), c.appendChild(s.content);
    const y = s.content.getBoundingClientRect().width;
    return document.body.removeChild(c), K.popup({
      closeButton: !1,
      minWidth: y
      // 动态设置 minWidth
    }).setContent(s.content);
  }
  openInfoWindow(s, c) {
    if (this.ensureMapInstance(), c.lat = Number(c.lat), c.lng = Number(c.lng), this.mapType === "TD_MAP") {
      const y = it.transformGCJ02ToWGS84(c.lng, c.lat);
      c.lat = y[1], c.lng = y[0];
    }
    s.setLatLng([c.lat, c.lng]), s.openOn(this.mapInstance), setTimeout(() => {
      s.update();
    }, 0);
  }
  createPolyline(s, c, y) {
    this.ensureMapInstance(), s.forEach((a) => {
      if (a.lat = Number(a.lat), a.lng = Number(a.lng), this.mapType === "TD_MAP") {
        const l = it.transformGCJ02ToWGS84(a.lng, a.lat);
        a.lat = l[1], a.lng = l[0];
      }
    });
    const o = K.polyline(s, { color: c ?? "#1890ff", weight: y ?? 1 });
    return o.addTo(this.mapInstance), o;
  }
  createPolygon(s, c, y, o) {
    this.ensureMapInstance(), s.forEach((l) => {
      if (l.lat = Number(l.lat), l.lng = Number(l.lng), this.mapType === "TD_MAP") {
        const d = it.transformGCJ02ToWGS84(l.lng, l.lat);
        l.lat = d[1], l.lng = d[0];
      }
    });
    const a = K.polygon(s, { color: c ?? "#1890ff", weight: y ?? 1, fillColor: o });
    return a.addTo(this.mapInstance), a;
  }
  drawLayerByGeoJson(s, c) {
    this.ensureMapInstance();
    const y = K.geoJSON(s, c);
    return y.addTo(this.mapInstance), y;
  }
  recordMapStatus() {
    this.ensureMapInstance();
    const s = [];
    return this.mapInstance.eachLayer(function(c) {
      c instanceof K.TileLayer || s.push(c);
    }), this.mapStatus = {
      center: this.mapInstance.getCenter(),
      zoom: this.mapInstance.getZoom(),
      layers: s
    }, this.mapStatus;
  }
  recoverMapStatus() {
    if (this.ensureMapInstance(), this.mapStatus) {
      const { lat: s, lng: c } = this.mapStatus.center;
      this.mapInstance.flyTo([s, c], this.mapStatus.zoom), this.mapStatus.layers.forEach((y) => {
        try {
          y.addTo(this.mapInstance);
        } catch {
        }
      });
    }
    this.mapStatus = null;
  }
  // 存储点聚合图层
  /**
   * 初始化点聚合图层
   * @param options 聚合配置选项
   */
  initClusterLayer(s) {
    this.ensureMapInstance(), this.markerClusterGroup = K.markerClusterGroup({
      maxClusterRadius: (s == null ? void 0 : s.maxClusterRadius) ?? 50,
      disableClusteringAtZoom: (s == null ? void 0 : s.disableClusteringAtZoom) ?? 18,
      spiderfyOnMaxZoom: (s == null ? void 0 : s.spiderfyOnMaxZoom) ?? !0,
      // 自定义聚合点样式
      iconCreateFunction: (c) => {
        const y = c.getChildCount();
        let o = 40, a = "marker-cluster-small";
        return y > 50 ? (o = 60, a = "marker-cluster-large") : y > 10 && (o = 50, a = "marker-cluster-medium"), K.divIcon({
          html: `<div><span>${y}</span></div>`,
          className: `marker-cluster ${a}`,
          iconSize: K.point(o, o)
        });
      }
    }), this.mapInstance.addLayer(this.markerClusterGroup);
  }
  /**
   * 添加标记到聚合图层
   * @param marker 要添加的标记
   */
  addMarkerToCluster(s) {
    var c;
    this.markerClusterGroup || this.initClusterLayer(), (c = this.markerClusterGroup) == null || c.addLayer(s), this.markers.push(s);
  }
  /**
   * 创建并添加聚合标记点
   * @param options 标记点选项
   * @returns 创建的标记点
   */
  async addClusteredMarker(s) {
    this.ensureMapInstance(), s.position.lat = Number(s.position.lat), s.position.lng = Number(s.position.lng), s.icon = s.icon ?? "https://webapi.amap.com/theme/v1.3/markers/b/mark_bs.png";
    const { width: c, height: y } = await Bn(s.icon);
    s.iconSize = s.iconSize ?? [c, y];
    const o = this.mapType === "TD_MAP" ? it.transformGCJ02ToWGS84(s.position.lng, s.position.lat) : [s.position.lng, s.position.lat];
    s.position.lng = o[0], s.position.lat = o[1];
    const a = K.icon({
      iconUrl: s.icon,
      iconSize: [s.iconSize[0], s.iconSize[1]],
      // size of the icon
      iconAnchor: [s.iconSize[0] / 2, s.iconSize[1]],
      // point of the icon which will correspond to marker's location
      popupAnchor: [0, -s.iconSize[1] * 1.2]
      // Popup 出现在图标正上方
    }), l = K.marker([s.position.lat, s.position.lng], { icon: a });
    return l.on("click", function() {
      var d;
      (d = s.onClick) == null || d.call(s, l);
    }), this.addMarkerToCluster(l), l;
  }
  /**
   * 清除所有聚合标记点
   */
  clearClusteredMarkers() {
    this.markerClusterGroup && this.markerClusterGroup.clearLayers(), this.markers = [];
  }
  /**
   * 删除聚合图层中的所有点位，但保留聚合图层本身
   */
  removeAllClusteredMarkers() {
    this.markerClusterGroup && this.markerClusterGroup.getLayers().forEach((c) => {
      var o;
      (o = this.markerClusterGroup) == null || o.removeLayer(c);
      const y = this.markers.indexOf(c);
      y !== -1 && this.markers.splice(y, 1);
    });
  }
  /**
   * 修改原有的clearMarkers方法，同时清除聚合图层
   */
  clearMarkers() {
    this.ensureMapInstance(), this.markers.forEach((s) => {
      this.mapInstance && this.mapInstance.removeLayer(s);
    }), this.markerClusterGroup && this.markerClusterGroup.clearLayers(), this.markers = [];
  }
}
export {
  Ts as CubeMapCore,
  Es as CubeMapLeaflet
};
