
import { createApp, createVNode, render } from "vue";
import ModalTable from "./modal-table.vue";
export default function insertModal(optionProps){
    const mountNode = document.createElement('div');
    const dom = document.getElementById("app");
    mountNode.setAttribute("style","width:100%;height:100%"); 
    dom.appendChild(mountNode);
    const app = createApp(ModalTable,{
        ...optionProps,
        showModal:true,
        remove(){
            app.unmount();
            dom.removeChild(mountNode)
        }
    })
    return app.mount(mountNode)
}
