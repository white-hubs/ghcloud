export function uuid() {
    let s = [];
    let hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
    let uuid = s.join("");
    return uuid;
}
export const textConfig = {
    "type":"textBox",
    "textType":"FIX_TEXT",  //固定文本
    "entityType":"",
    "entityAttributesVlaue":"",
    "text":"文本内容",
    "component":{
        "name":"text",
        "left":0,
        "top":0,
        "width":200,
        "height":32,
    },
    "option":{
        "fontSize":18,
        "fontFamily":"微软雅黑",
        "color":"#FFFFFF",
        "fontWeight":"normal",
        "textAlign":"center",
        "textDecoration":"none",  
        "backgroundColor":"#000000",
    }
}
export const imgConfig = {
    "type":"imgBox",
    "url":"",
    "imgId":"",
    "component":{
        "name":"img",
        "left":0,
        "top":0,
        "width":100,
        "height":100,
    },
    "option":{}
}
export const qrConfig = {
    "type":"qrBox",
    "url":"",
    "component":{
        "name":"qr",
        "left":0,
        "top":0,
        "width":120,
        "height":120,
    },
    "option":{}
}

export const dicOption = {
    fontWeight: [{ label: '正常', value: 'normal' }, { label: '加粗', value: 'bold' }, { label: '细体', value: 'lighter' }],
    textAlign: [{ label: '居中', value: 'center' }, { label: '左对齐', value: 'left' }, { label: '右对齐', value: 'right' }],
    fontFamily:[{label:"微软雅黑",value:"微软雅黑"}]
}