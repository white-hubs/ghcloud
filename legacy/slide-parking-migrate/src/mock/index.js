import Mock from "mockjs"
import {getRetentionVehiclePage} from "./parking"

// const Random = Mock.Random;
Mock.XHR.prototype.proxy_send = Mock.XHR.prototype.send;
Mock.XHR.prototype.send = function(){
    if(this.custom.xhr){
        this.custom.xhr.withCredentials = this.withCredentials || false
    }
    this.proxy_send(...arguments)
}

Mock.mock(/\/api\/park\/vetention-vehicle\/page/,'get',getRetentionVehiclePage)

