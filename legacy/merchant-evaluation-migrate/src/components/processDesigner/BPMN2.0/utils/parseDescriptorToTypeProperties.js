/**
 * 转化descriptor-json构造properties 方便配合自定义属性面板根据不同节点类型生成fields
 */
import SHA1 from 'sha1';
class ParseDescriptors {
  constructor() {
    this.cache = {};
  }
  parse(descriptor) {
    const hashKey = this.getHashKey(descriptor); // 生成唯一映射
    if (!this.cache[hashKey]) {
      if (descriptor && descriptor.types && descriptor.types instanceof Array) {
        const prefix = descriptor.prefix || hashKey;
        this.cache[hashKey] = {
          prefix,
        };
        this.cache[hashKey].typesMap = getTypesMap(descriptor.types);
        // const typesMap = getTypesMap(descriptor.types);
        this.cache[hashKey].fullTypesMap = fullTypesMap(
          this.cache[hashKey].typesMap,
        );
        // const fieldsMap = createFieldsMap(typesMap);
        this.cache[hashKey].fieldsMap = createFieldsMap(
          this.cache[hashKey].fullTypesMap,
        );
      } else {
        throw new Error('ParseDescriptors.create: 请传入正确的数据');
      }
    }
    return this.cache[hashKey];
  }
  getHashKey(descriptor) {
    // 太慢的话,可以用webworker加速?
    const str = JSON.stringify(descriptor);
    return SHA1(str);
  }
  getTypes(descriptor) {
    if (descriptor.types && descriptor.types instanceof Array) {
      return descriptor.types.map((type, i) => type.name || ` ${i} no name`);
    }
    return [];
  }
  getFields(descriptor) {
    const hashKey = this.getHashKey(descriptor); // 获取唯一映射
    return (
      this.cache[hashKey]?.fields || this.createFields(descriptor, hashKey)
    );
  }
}

export const parseDescriptors = new ParseDescriptors();
/**
 *
 * @param {*} types
 * @param {*} prefix
 */
function getTypesMap(types, prefix) {
  // 顺便映射父子关系
  const tm = {};
  types.forEach((type) => {
    const t = type.name;
    tm[t] = {
      properties: ArrayToMap((type.properties || []).filter((p) => p.isAttr)), // 这里过滤一下, 只要isAttr为True的
      superClass: type.superClass,
      extends: type.extends,
    };
  });
  return tm;
}
/**
 * 继承父亲的properties
 * @param {Object} type
 */
function inheritParentsProperties(t, type, typesMap, isInheritMap) {
  // const properties = type.properties;
  /**
   * 继承父亲的properties
   * @param {String} parentType
   */
  function inheritParentProperties(t, type) {
    if (!isInheritMap[t]) {
      isInheritMap[t] = true;
      const properties = type.properties;
      const parentTypes = (type.superClass || []).concat(type.extends || []); // 这里可以配置那些要被继承的
      parentTypes.forEach((t) => {
        const type = typesMap[t];
        inheritParentProperties(t, type);
        Object.assign(properties, type.properties);
      });
    }
  }
  inheritParentProperties(t, type);
}
function fullTypesMap(typesMap) {
  // 根据映射的父子关系,把每个type的properties都补全
  const isInheritMap = {};
  // const ftm = {};
  const types = Object.keys(typesMap);
  types.forEach((t) => {
    const type = typesMap[t];
    // ftm[t] = {};
    inheritParentsProperties(t, type, typesMap, isInheritMap);
  });
  return typesMap; // 这里typesMap 和 fullTypesMap 合在一起了, 考虑要不要分开?
  // return ftm;
}
function createFieldsMap(fullTypesMap) {
  const fieldsMap = [];
  const types = Object.keys(fullTypesMap);
  types.forEach((t) => {
    const type = fullTypesMap[t];
    fieldsMap[t] = {
      fields: MapToArry(type.properties),
    };
  });
  return fieldsMap;
}

// ----------- helper -------------

// import bpmn from 'bpmn-moddle/resources/bpmn/json/bpmn.json';
/**
 *  [
        {
          "name": "name",
          "isAttr": true,
          "type": "String"
        },
        {
          "name": "type",
          "isAttr": true,
          "type": "String"
        },
    ]
    to
    {
        name: {
          "name": "name",
          "isAttr": true,
          "type": "String"
        },
        type: {
          "name": "type",
          "isAttr": true,
          "type": "String"
        },
    }
    
 * @param {Array} properties 
 */
function ArrayToMap(properties) {
  if (!properties) {
    return {};
  }
  const propertiesMap = {};
  properties.forEach((pro) => {
    propertiesMap[pro.name] = pro;
  });
  return propertiesMap;
}
// 上面的逆操作
function MapToArry(properties) {
  if (!properties) {
    return [];
  }
  const propertiesArray = [];
  const types = Object.keys(properties);
  // ---------------- 这里可能需要排一下序 --------------------
  types.forEach((t, i) => {
    propertiesArray[i] = properties[t];
  });
  return propertiesArray;
}
