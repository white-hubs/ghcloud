<template>
    <!-- 地图容器 -->
    <div class="map-contain">
        <div class="map-bg"></div>
        <!-- <MapChart /> -->
        <ThreeMapChart :mapData='threeMapData'/>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import MapChart from "./charts/map.vue";
import ThreeMapChart from "./charts/threeMap.vue";
// import ThreeMapChart from "./charts/threeMap2.vue";
const threeMapData = {
  "lines":[
    {
        "coords": [
            [
                "121.584875",
                "31.269682"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "snsh",
        "name": "上海农批",
        "cityCode": "310115"
    },
    {
        "coords": [
            [
                "112.999065",
                "28.210632"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "sncs",
        "name": "长沙海吉星",
        "cityCode": "4301"
    },
    {
        "coords": [
            [
                "103.991796",
                "30.552529"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "sncd",
        "name": "成都市场",
        "cityCode": "5101"
    },
    {
        "coords": [
            [
                "114.418576",
                "23.134433"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "snhz",
        "name": "惠州海吉星",
        "cityCode": "4413"
    },
    {
        "coords": [
            [
                "108.269047",
                "22.783402"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "snnn",
        "name": "广西海吉星",
        "cityCode": "4501"
    },
    {
        "coords": [
            [
                "117.059602",
                "30.572313"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "snaq",
        "name": "安庆海吉星",
        "cityCode": "3408"
    },
    {
        "coords": [
            [
                "109.339331",
                "24.289336"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "snlz",
        "name": "柳州海吉星",
        "cityCode": "4502"
    },
    {
        "coords": [
            [
                "115.781262",
                "28.737241"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "snnc",
        "name": "南昌农批",
        "cityCode": "3601"
    },
    {
        "coords": [
            [
                "109.400268",
                "34.388822"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "snxa",
        "name": "西安市场",
        "cityCode": "6101"
    },
    {
        "coords": [
            [
                "113.171727",
                "29.430144"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "snyy",
        "name": "岳阳海吉星",
        "cityCode": "4306"
    },
    {
        "coords": [
            [
                "115.953241",
                "29.650273"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "snjj",
        "name": "九江琵琶湖",
        "cityCode": "3604"
    },
    {
        "coords": [
            [
                "123.580073",
                "41.954793"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "snsy",
        "name": "沈阳海吉星",
        "cityCode": "2101"
    },
    {
        "coords": [
            [
                "116.957975",
                "38.956705"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "sntj",
        "name": "天津海吉星",
        "cityCode": "120118"
    },
    {
        "coords": [
            [
                "117.394101",
                "32.983265"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "snbb",
        "name": "蚌埠海吉星",
        "cityCode": "3403"
    },
    {
        "coords": [
            [
                "106.334291",
                "38.578039"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "snnx",
        "name": "宁夏海吉星",
        "cityCode": "6401"
    },
    {
        "coords": [
            [
                "125.197529",
                "43.93148"
            ],
            [
                "113.913275",
                "22.51025"
            ]
        ],
        "lineStyle": {
            "color": "#4ab2e5"
        },
        "code": "sncc",
        "name": "长春海吉星",
        "cityCode": "2201"
    }
],
  "points":[
    {
        "name": "上海农批",
        "value": [
            "121.584875",
            "31.269682"
        ],
        "url": "https://sn-sh.guheyun.cn:9000/",
        "code": "snsh",
        "index": "8.75",
        "launchDay": 1025,
        "alarmNmu": 11,
        "image": "img/Amarker1.4ad7199a.gif",
        "cityCode": "310115"
    },
    {
        "name": "长沙海吉星",
        "value": [
            "112.999065",
            "28.210632"
        ],
        "url": "https://sn-cs.guheyun.cn:9000/",
        "code": "sncs",
        "index": "36.11",
        "launchDay": 1033,
        "alarmNmu": 85,
        "image": "img/Amarker1.4ad7199a.gif",
        "cityCode": "4301"
    },
    {
        "name": "成农批",
        "value": [
            "103.991796",
            "30.552529"
        ],
        "url": "http://cap.cdhjx.cn:9087",
        "code": "sncd",
        "index": "5.09",
        "launchDay": 1923,
        "alarmNmu": 0,
        "image": "data:image/png;base64,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",
        "cityCode": "5101"
    },
    {
        "name": "惠州海吉星",
        "value": [
            "114.418576",
            "23.134433"
        ],
        "url": "https://sn-hz.guheyun.cn:9000/",
        "code": "snhz",
        "index": "12.80",
        "launchDay": 859,
        "alarmNmu": 5,
        "image": "img/Amarker1.4ad7199a.gif",
        "cityCode": "4413"
    },
    {
        "name": "广西海吉星",
        "value": [
            "108.269047",
            "22.783402"
        ],
        "url": "https://sn-nn.guheyun.cn:9000/",
        "code": "snnn",
        "index": "7.29",
        "launchDay": 849,
        "alarmNmu": 0,
        "image": "data:image/png;base64,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",
        "cityCode": "4501"
    },
    {
        "name": "安庆海吉星",
        "value": [
            "117.059602",
            "30.572313"
        ],
        "url": "https://sn-aq.guheyun.cn:9000/",
        "code": "snaq",
        "index": "7.15",
        "launchDay": 844,
        "alarmNmu": 7,
        "image": "img/Amarker1.4ad7199a.gif",
        "cityCode": "3408"
    },
    {
        "name": "广西新柳邕",
        "value": [
            "109.339331",
            "24.289336"
        ],
        "url": "https://an1.xlyap.com:9000/",
        "code": "snlz",
        "index": "26.03",
        "launchDay": 841,
        "alarmNmu": 65,
        "image": "img/Amarker1.4ad7199a.gif",
        "cityCode": "4502"
    },
    {
        "name": "南昌海吉星",
        "value": [
            "115.781262",
            "28.737241"
        ],
        "url": "https://sn-nc.guheyun.cn:9000/",
        "code": "snnc",
        "index": "34.44",
        "launchDay": 835,
        "alarmNmu": 105,
        "image": "img/Amarker1.4ad7199a.gif",
        "cityCode": "3601"
    },
    {
        "name": "西安市场",
        "value": [
            "109.400268",
            "34.388822"
        ],
        "url": "https://sn-xa.guheyun.cn:9000/",
        "code": "snxa",
        "index": "17.78",
        "launchDay": 750,
        "alarmNmu": 46,
        "image": "img/Amarker1.4ad7199a.gif",
        "cityCode": "6101"
    },
    {
        "name": "岳阳海吉星",
        "value": [
            "113.171727",
            "29.430144"
        ],
        "url": "https://sn-yy.guheyun.cn:9010/",
        "code": "snyy",
        "index": "3.04",
        "launchDay": 675,
        "alarmNmu": 1,
        "image": "img/Amarker1.4ad7199a.gif",
        "cityCode": "4306"
    },
    {
        "name": "九江琵琶湖",
        "value": [
            "115.953241",
            "29.650273"
        ],
        "url": "https://sn-jj.guheyun.cn:9000/",
        "code": "snjj",
        "index": "18.89",
        "launchDay": 652,
        "alarmNmu": 3,
        "image": "img/Amarker1.4ad7199a.gif",
        "cityCode": "3604"
    },
    {
        "name": "沈阳海吉星",
        "value": [
            "123.580073",
            "41.954793"
        ],
        "url": "https://sn-sy.guheyun.cn:9000",
        "code": "snsy",
        "index": "0",
        "launchDay": 609,
        "alarmNmu": 0,
        "image": "data:image/png;base64,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",
        "cityCode": "2101"
    },
    {
        "name": "天津海吉星",
        "value": [
            "116.957975",
            "38.956705"
        ],
        "url": "https://sn-tj.guheyun.cn:443",
        "code": "sntj",
        "index": "13.16",
        "launchDay": 416,
        "alarmNmu": 9,
        "image": "img/Amarker1.4ad7199a.gif",
        "cityCode": "120118"
    },
    {
        "name": "蚌埠海吉星",
        "value": [
            "117.394101",
            "32.983265"
        ],
        "url": "https://sn-bb.guheyun.cn:9000",
        "code": "snbb",
        "index": "24.53",
        "launchDay": 384,
        "alarmNmu": 564,
        "image": "img/Amarker1.4ad7199a.gif",
        "cityCode": "3403"
    },
    {
        "name": "宁夏海吉星",
        "value": [
            "106.334291",
            "38.578039"
        ],
        "url": "https://sn-nx.guheyun.cn:9000",
        "code": "snnx",
        "index": "14.39",
        "launchDay": 349,
        "alarmNmu": 23,
        "image": "img/Amarker1.4ad7199a.gif",
        "cityCode": "6401"
    },
    {
        "name": "长春海吉星",
        "value": [
            "125.197529",
            "43.93148"
        ],
        "url": "https://sn-cc.guheyun.cn:9000/",
        "code": "sncc",
        "index": "0",
        "launchDay": 301,
        "alarmNmu": 0,
        "image": "data:image/png;base64,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",
        "cityCode": "2201"
    },
    {
        "name": "深圳市",
        "code": "hq",
        "cityCode": "4403",
        "value": [
            "113.913275",
            "22.51025"
        ],
        "image": "data:image/png;base64,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"
    }
],
  "flags":[],
  "labels": []
}
</script>
<style lang="less" scoped>
.map-contain {
width: 100%;
height: 100%;
}

</style>