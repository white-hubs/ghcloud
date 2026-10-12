
import { getAssetsImage } from '@/utils/getImage';

// hq 深圳总部

// 图标
export const shenzhengIcon = getAssetsImage('总部.png')
export const startBlue = getAssetsImage('start-blue.png')
export const startLight = getAssetsImage('start-light.png')
// 业务数据
export let zongbuChartData = {
  lines:[
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
            // "color": "#4ab2e5"
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
           // "color": "#4ab2e5"
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
           // "color": "#4ab2e5"
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
           // "color": "#4ab2e5"
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
           // "color": "#4ab2e5"
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
           // "color": "#4ab2e5"
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
           // "color": "#4ab2e5"
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
           // "color": "#4ab2e5"
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
           // "color": "#4ab2e5"
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
           // "color": "#4ab2e5"
        },
        "code": "snyy",
        "name": "岳阳海吉星",
        "cityCode": "4306"
    },

],
  points:[
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
        // "image": "img/Amarker1.4ad7199a.gif",
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
        // "image": "img/Amarker1.4ad7199a.gif",
        "cityCode": "4301"
    },
    {
        "name": "成都海吉星",
        "value": [
            "103.991796",
            "30.552529"
        ],

        "url": "http://cap.cdhjx.cn:9087",
        "code": "sncd",
        "index": "5.09",
        "launchDay": 1923,
        "alarmNmu": 0,
        // "image": "data:image/png;base64,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",
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
        // "image": "img/Amarker1.4ad7199a.gif",
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
        // "image": "img/Amarker1.4ad7199a.gif",
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
        // "image": "img/Amarker1.4ad7199a.gif",
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
        // "image": "img/Amarker1.4ad7199a.gif",
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
        // "image": "img/Amarker1.4ad7199a.gif",
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
        // "image": "img/Amarker1.4ad7199a.gif",
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
        // "image": "img/Amarker1.4ad7199a.gif",
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
        // "image": "data:image/png;base64,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",
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
        // "image": "img/Amarker1.4ad7199a.gif",
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
        // "image": "img/Amarker1.4ad7199a.gif",
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
        // "image": "img/Amarker1.4ad7199a.gif",
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
        // "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAmCAYAAADTGStiAAAGJ0lEQVRYR6WXfYxU1RnGf+fce+6suLjMLLBlcQXWCmW3LoLWxhqs0VZstImrjWlsWkUxoWkXgglNpTFNmkhNbZG2tNZGbCNo1KRtiNYWbMU2xWICWM2igiClfIi4M7OzCNJ77j2nubM7s/fu3tkZ7fw378fzvOc95/24gkZ+lgx5rkdyHZbLkMzBkiu7CgoYDiHYhWEbrfwZwX/rwYoJDQbJErIKwbdghKgeIhQQ/IIPWE8HhVrmtYkLfA14CJhWnyvV4n3gHnJsTtOOJ96Lxyf4JYK7PiZh0s3yGCf4Jt34cUWS2KIo8nvgxhqkVhwWZzjEaVEUGomwbdazc+1kcmQmCPQ5styMQFdsksR5NiK4cxzAB5yVT8pjzm+ck/LfMvXhmCtMc3hnONN8ybThIMdhCB4jO5rFUeIit2P57VgH+Vd52FnpHJF5GTSSerPQTAp+Fsy3n7STU8iXkh3mGCYeYioB+4FszNjKn8u9aq0aaIQwYXMO0t/kd9kr7dQxvkVc5nIeA8PEBX4IfDduJDfL19VqVbMcwrvDNjPfNKt71MHUwJoQ/ha/x/bY+GEi0wfIca/gEE208C4wpXrxB8QR7yrvIHYU0lxrWtAY+Xd5KpLq+/VsO882e1/x+stWCmHmmSbZLz+seJkO4+nt+nLOxY0FN0iJGYIivdjyS67au73ui85OJ25M2BfOCFYEneoGtVvul2fDvrDddJtmtVxFV4T/tN/FFJS3xHstnoFgTdAR9oUXJrJiuCVqeA8Dy6unfUfs9670jqelT2/U8xgiUKuS6Q2XhW1BXzBb3aBelUdlol5Ni3H0a/pzZHBimL+KiHcBl1aEzoPOK+46t5qucQFICFYH55urTWtUx2KHKKj16pjBIIdkmBaw/4zfbRfbeAfcHRHn433Y7XWfc3Y6zRUAvUFfFMUqt8ui84wz4D/ld9nP2+lxAvG6GPSu9/5lZhrPfsY2MwnpPOFUq0Gv0R2mz8TTPRDdcYAdTYP3KW+bKAmvAhzeFk4115icPc8q9xH3qN6sF6adyl3t7g2/Hs60M22T3CNL6hvqzRjGtOAnQXfMTwvynEFwTkWY6cj8rRxKyk//QM8yd5s5aTq5RR6vPLSx+vCWsDXYEFxclVs+jIj3IuiqCNUC9Rd5UiZedDXtD+o59gqbs522GTHSfEaU8o/yXbVM7UsLKlwaTg/WBlUOoD8ifjQ+idw73BecrY5KPfGPdaf8pywFDwXdqGQ/nohYr9WzzVIzO/mqB7gJyR8qQvmofEvdp07UJN4pS8G6j0bsv+BfYj9tqw0KyxLB22Ro5RjQWiYb4GSmJ/NG2i3r7+sL7CLbYrtsy9jA5PPyhFqpDoyVm7mmSW/Xn41Kb0R3lCyzKr36R8DqipP7HXePs8kZioOEvWHOLDSThRACMz4sKyxyhyw5W53BuJ/+tZ5rvmzaY7J7yfHAMPH7tOPwDowM8zyn1WK1RxZHG4K/y7/cttmmtCuoyMQ+ccr7gvdq5b+5xrToTfqS2GlLwCxylOLz+KdYVlRBdov3vF7vLXR6aU0UQKQznSajn9WLxmwm3yPH2kg/SnyKaWjeBqr3J14RJ93b3X2ylN4Ka5GbHjNJP657aCOeoaOcZR7tnEkSR/+KrMSyPgF4nDPufe5+5/nk3aWSKkS4ImwPvh100pQYCmD5Kq08Xc1oAmA7LgvKQ2PBWGDRLwad3zknxFZRlIdie5cEs9CcG94YtpqbzQymj3bBKoYtL/pL4pjj19tBLsWwExLDOxnHaQKG8MtL3RQ8vJTlbtTjFIKLyXJ4YuJIW+B+YE29B9Sgfjk5HhmXwVTnaL8u8DKCyxoEr2W2hRw3pSlrf8KUuIiQ3cD4NbWxaI5wlkW0k7qlTvzRludWBE8lyq4x0qj6r6aVl2uZT0wceeVZh2BVY3xVqz5ybJjIpz5xtJ0M8icsX2yIXLCRLMvq2dYnHm4sU7D8A4ivL2nYL5HluvjH2cdPdcWzwAXADuD8GmD9CBaTJTGd/n/iCGGA+QheQpDYMhEcJOAqppG6j3+0cqoVar6c7m0Ihmes4ACWa8nxn3r3Wr9z1UMYTvsTCHx8bqON9+q5jNX/D/q5Icdmz+Q0AAAAAElFTkSuQmCC",
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
        "image": shenzhengIcon
    }
],
}
export let shenzhengChartData = {
    points: [
        {
            "name": "深圳市",
            "code": "hq",
            "cityCode": "4403",
            "value": [
                "113.913275",
                "22.51025"
            ],
            "image": shenzhengIcon
        },
        {
            "name": "福田农批",
            "value": [
                "114.055305",
                "22.521108"
            ],
            "url": "https://sn-ft.guheyun.cn:9000/",
            "code": "snft",
            "index": "7.63",
            "launchDay": 1027,
            "alarmNmu": 7,
            // "image": "img/Amarker1.4ad7199a.gif",
            "cityCode": "4403"
        },
        {
            "name": "深圳海吉星",
            "value": [
                "114.128802",
                "22.684251"
            ],
            "url": "https://sn-ph.guheyun.cn:9000",
            "code": "snph",
            "index": "24.08",
            "launchDay": 1032,
            "alarmNmu": 0,
            // "image": "data:image/png;base64,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",
            "cityCode": "4403"
        },
        {
            "name": "南山农批",
            "value": [
                "113.924652",
                "22.558515"
            ],
            "url": "https://sn-ns.guheyun.cn:9000/",
            "code": "snns",
            "index": "5.42",
            "launchDay": 787,
            "alarmNmu": 2,
            // "image": "img/Amarker1.4ad7199a.gif",
            "cityCode": "4403"
        },
        {
            "name": "深农置地",
            "value": [
                "114.158181",
                "22.649328"
            ],
            "url": "https://sn-zd.guheyun.cn:9000/",
            "code": "snzd",
            "index": "6.56",
            "launchDay": 676,
            "alarmNmu": 0,
            // "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAmCAYAAADTGStiAAAGJ0lEQVRYR6WXfYxU1RnGf+fce+6suLjMLLBlcQXWCmW3LoLWxhqs0VZstImrjWlsWkUxoWkXgglNpTFNmkhNbZG2tNZGbCNo1KRtiNYWbMU2xWICWM2igiClfIi4M7OzCNJ77j2nubM7s/fu3tkZ7fw378fzvOc95/24gkZ+lgx5rkdyHZbLkMzBkiu7CgoYDiHYhWEbrfwZwX/rwYoJDQbJErIKwbdghKgeIhQQ/IIPWE8HhVrmtYkLfA14CJhWnyvV4n3gHnJsTtOOJ96Lxyf4JYK7PiZh0s3yGCf4Jt34cUWS2KIo8nvgxhqkVhwWZzjEaVEUGomwbdazc+1kcmQmCPQ5styMQFdsksR5NiK4cxzAB5yVT8pjzm+ck/LfMvXhmCtMc3hnONN8ybThIMdhCB4jO5rFUeIit2P57VgH+Vd52FnpHJF5GTSSerPQTAp+Fsy3n7STU8iXkh3mGCYeYioB+4FszNjKn8u9aq0aaIQwYXMO0t/kd9kr7dQxvkVc5nIeA8PEBX4IfDduJDfL19VqVbMcwrvDNjPfNKt71MHUwJoQ/ha/x/bY+GEi0wfIca/gEE208C4wpXrxB8QR7yrvIHYU0lxrWtAY+Xd5KpLq+/VsO882e1/x+stWCmHmmSbZLz+seJkO4+nt+nLOxY0FN0iJGYIivdjyS67au73ui85OJ25M2BfOCFYEneoGtVvul2fDvrDddJtmtVxFV4T/tN/FFJS3xHstnoFgTdAR9oUXJrJiuCVqeA8Dy6unfUfs9670jqelT2/U8xgiUKuS6Q2XhW1BXzBb3aBelUdlol5Ni3H0a/pzZHBimL+KiHcBl1aEzoPOK+46t5qucQFICFYH55urTWtUx2KHKKj16pjBIIdkmBaw/4zfbRfbeAfcHRHn433Y7XWfc3Y6zRUAvUFfFMUqt8ui84wz4D/ld9nP2+lxAvG6GPSu9/5lZhrPfsY2MwnpPOFUq0Gv0R2mz8TTPRDdcYAdTYP3KW+bKAmvAhzeFk4115icPc8q9xH3qN6sF6adyl3t7g2/Hs60M22T3CNL6hvqzRjGtOAnQXfMTwvynEFwTkWY6cj8rRxKyk//QM8yd5s5aTq5RR6vPLSx+vCWsDXYEFxclVs+jIj3IuiqCNUC9Rd5UiZedDXtD+o59gqbs522GTHSfEaU8o/yXbVM7UsLKlwaTg/WBlUOoD8ifjQ+idw73BecrY5KPfGPdaf8pywFDwXdqGQ/nohYr9WzzVIzO/mqB7gJyR8qQvmofEvdp07UJN4pS8G6j0bsv+BfYj9tqw0KyxLB22Ro5RjQWiYb4GSmJ/NG2i3r7+sL7CLbYrtsy9jA5PPyhFqpDoyVm7mmSW/Xn41Kb0R3lCyzKr36R8DqipP7HXePs8kZioOEvWHOLDSThRACMz4sKyxyhyw5W53BuJ/+tZ5rvmzaY7J7yfHAMPH7tOPwDowM8zyn1WK1RxZHG4K/y7/cttmmtCuoyMQ+ccr7gvdq5b+5xrToTfqS2GlLwCxylOLz+KdYVlRBdov3vF7vLXR6aU0UQKQznSajn9WLxmwm3yPH2kg/SnyKaWjeBqr3J14RJ93b3X2ylN4Ka5GbHjNJP657aCOeoaOcZR7tnEkSR/+KrMSyPgF4nDPufe5+5/nk3aWSKkS4ImwPvh100pQYCmD5Kq08Xc1oAmA7LgvKQ2PBWGDRLwad3zknxFZRlIdie5cEs9CcG94YtpqbzQymj3bBKoYtL/pL4pjj19tBLsWwExLDOxnHaQKG8MtL3RQ8vJTlbtTjFIKLyXJ4YuJIW+B+YE29B9Sgfjk5HhmXwVTnaL8u8DKCyxoEr2W2hRw3pSlrf8KUuIiQ3cD4NbWxaI5wlkW0k7qlTvzRludWBE8lyq4x0qj6r6aVl2uZT0wceeVZh2BVY3xVqz5ybJjIpz5xtJ0M8icsX2yIXLCRLMvq2dYnHm4sU7D8A4ivL2nYL5HluvjH2cdPdcWzwAXADuD8GmD9CBaTJTGd/n/iCGGA+QheQpDYMhEcJOAqppG6j3+0cqoVar6c7m0Ihmes4ACWa8nxn3r3Wr9z1UMYTvsTCHx8bqON9+q5jNX/D/q5Icdmz+Q0AAAAAElFTkSuQmCC",
            "cityCode": "4403"
        },
    ],
    lines: [
        {
            "coords": [
                [
                    "114.055305",
                    "22.521108"
                ],
                [
                    "113.913275",
                    "22.51025"
                ]
            ],
            "lineStyle": {
                "color": "#4ab2e5"
            },
            "code": "snft",
            "name": "福田农批",
            "cityCode": "4403"
        },
        {
            "coords": [
                [
                    "114.128802",
                    "22.684251"
                ],
                [
                    "113.913275",
                    "22.51025"
                ]
            ],
            "lineStyle": {
                "color": "#4ab2e5"
            },
            "code": "snph",
            "name": "深圳海吉星",
            "cityCode": "4403"
        },
        {
            "coords": [
                [
                    "113.924652",
                    "22.558515"
                ],
                [
                    "113.913275",
                    "22.51025"
                ]
            ],
            "lineStyle": {
                "color": "#4ab2e5"
            },
            "code": "snns",
            "name": "南山农批",
            "cityCode": "4403"
        },
        {
            "coords": [
                [
                    "114.158181",
                    "22.649328"
                ],
                [
                    "113.913275",
                    "22.51025"
                ]
            ],
            "lineStyle": {
                "color": "#4ab2e5"
            },
            "code": "snzd",
            "name": "深农置地",
            "cityCode": "4403"
        },
    ],
}

// 底图 地图颜色
export const geoItemStyleB = {
    // 非高亮状态下的地图块样式
    normal: {
      areaColor: 'rgba(47, 65, 107, 0.6)',
      // areaColor: 'rgba(63 115 205, 0.8)',
      // areaColor: '#6194F7',
      // shadowColor: '#3F7CDF',
      // shadowBlur: 5,
      shadowOffsetX: 0,
      shadowOffsetY: 6,
      opacity: 1,
    },
    // 高亮状态下的地图块样式
    emphasis: {
      areaColor: 'rgba(63 115 205, 1)',
    },
  }
export const geoItemStyleA = {
    // 非高亮状态下的地图块样式
    normal: {
        shadowColor: '#276fce',
        shadowOffsetX: 0,
        shadowOffsetY: 15,
        opacity: 0.5,
    },
    // 高亮状态下的地图块样式
    emphasis: {
        areaColor: '#276fce',
    }
}
// 上层 地图颜色
export const seriesItemStyleA = {
  // 非高亮状态下的地图块样式
  normal: {
    areaColor: 'rgba(47, 65, 107, 0.8)',
    borderColor: '#94BAF9',
    borderWidth: 1.5,
    shadowColor: '#3F7CDF',
  },
  // 高亮状态下的地图块样式
  emphasis: {
    areaColor: 'rgba(97,148,247,1)',
    label: {
      show: true,
      color: '#fff',
    },
    shadowColor: '#3F7CDF',
  },
}
export const seriesItemStyleB = {
    // 非高亮状态下的地图块样式
  normal: {
  // areaColor: 'rgba(47, 65, 107, 0.8)',
    areaColor: '#6194F7',
  // areaColor: 'rgba(97,148,247,1)',
    borderColor: '#94BAF9',
    borderWidth: 1.5,
    shadowColor: '#3F7CDF',
  },
  // 高亮状态下的地图块样式
  emphasis: {
    // areaColor: '#4ab2e5',
    areaColor: 'rgba(97,148,247,1)',
    label: {
      show: true,
      color: '#fff',
    },
    shadowColor: '#3F7CDF',
  },
}
