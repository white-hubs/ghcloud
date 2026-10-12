export const baseSize:number = 16
function setRem():void{
    /**
     *当前设计稿比列为1920*1080
     */
    const scale = document.documentElement.clientWidth / 1920;
    document.documentElement.style.fontSize = baseSize * Math.min(scale,2) +'px';
}
setRem()
window.onresize = function(){
    setRem()
}