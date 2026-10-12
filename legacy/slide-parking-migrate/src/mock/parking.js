import Mock from "mockjs"
const Random = Mock.Random;

export const getRetentionVehiclePage = () =>{
    return Mock.mock({
        "code":200,
        "data":{
            "total":50,
            "records|5-10":[
                {
                    "number":"@id",
                    "date":"@datetime",
                    "position":"@ctitle(4,6)",
                    "file":Random.image('50x50')
                }
            ],
            "message":"OK"
        }
        
    })
}