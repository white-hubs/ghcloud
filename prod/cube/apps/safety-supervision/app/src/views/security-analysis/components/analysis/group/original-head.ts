
export const mockHeadData = {
  scoreItems: [
    {
      itemCode: "SECURITY_MONITORING",
      itemCodeConcat: "SECURITY_MONITORING",
      itemName: "安防监控",
      itemType: "APPLICATION",
      weightAllot: 0.15,
      scoreRanges: [],
      subItems: [
        {
          itemCode: "DEVICE",
          itemCodeConcat: "SECURITY_MONITORING::DEVICE",
          itemName: "设备情况",
          itemType: "GROUP",
          weightAllot: 0.15,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_DEVICE_ONLINE_RATE",
              itemCodeConcat: "SECURITY_MONITORING::DEVICE::HEADQUARTERS_DEVICE_ONLINE_RATE",
              itemName: "设备在线率",
              itemType: "METRIC_RULE",
              weightAllot: 0.33,
              "describe": "在线设备数【设备数】，在线率【在线率】",
              scoreRanges: [
                {
                  "gt": 90,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 80,
                  "le": 90,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 70,
                  "le": 80,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 60,
                  "le": 70,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 60,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_DEVICE_HEALTH_LEVEL",
              itemCodeConcat: "SECURITY_MONITORING::DEVICE::HEADQUARTERS_DEVICE_HEALTH_LEVEL",
              itemName: "设备健康度",
              itemType: "METRIC_RULE",
              weightAllot: 0.33,
              "describe": "设备健康度低于60分的设备数【设备数】个，占总设备的【健康率】",
              scoreRanges: [
                {
                  "gt": 90,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 80,
                  "le": 90,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 70,
                  "le": 80,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 60,
                  "le": 70,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 60,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_DEVICE_EXPIRATION_RATE",
              itemCodeConcat: "SECURITY_MONITORING::DEVICE::HEADQUARTERS_DEVICE_EXPIRATION_RATE",
              itemName: "质保到期率",
              itemType: "METRIC_RULE",
              weightAllot: 0.34,
              "describe": "设备到期数【到期数】个，到期率【到期率】",
              scoreRanges: [
                {
                  "gt": -1,
                  "le": 10,
                  "scoreRatio": 1
                },
                {
                  "gt": 10,
                  "le": 20,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 20,
                  "le": 30,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 30,
                  "le": 40,
                  "scoreRatio": 0.25
                },
                {
                  "gt": 40,
                  "le": 60,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "ALARM",
          itemCodeConcat: "SECURITY_MONITORING::OVERALL_ALARM_SITUATION",
          itemName: "总报警情况",
          itemType: "GROUP",
          weightAllot: 0.1,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_ALARM_USER_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "SECURITY_MONITORING::OVERALL_ALARM_SITUATION::HEADQUARTERS_ALARM_USER_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              weightAllot: 0.33,
              "describe": "总报警数【报警数】个，已处理【处理数】个，处理率【处理率】；报警处理数前五为：【处理人】（【处理数】，【处理率】）；报警处理数后五为：【处理人】（【处理数】，【处理率】）",
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "SECURITY_MONITORING::OVERALL_ALARM_SITUATION::HEADQUARTERS_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时处理的报警数】，总报警处理数【总处理数】。处理效率【总处理效率】；处理效率前五：【处理人】（【处理效率】）",
              weightAllot: 0.33,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "ONE_LEVEL_ALARM",
          itemCodeConcat: "SECURITY_MONITORING::ONE_LEVEL_ALARM",
          itemName: "一级报警",
          itemType: "GROUP",
          weightAllot: 0.1,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_ONE_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "SECURITY_MONITORING::ONE_LEVEL_ALARM::HEADQUARTERS_ONE_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              "describe": "总报警数【一级报警数】个，已处理【一级报警处理数】个，处理率【一级报警处理率】；报警处理数前五为：【处理人】（【一级报警处理率】）；报警处理数后五为：【处理人】（【一级报警处理率】）",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_ONE_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "SECURITY_MONITORING::ONE_LEVEL_ALARM::HEADQUARTERS_ONE_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时处理的报警数】，总报警处理数【总处理数】。处理效率【一级总处理效率】；处理效率前五为：【处理人】（一级处理效率）；处理效率后五为：【处理人】（一级处理效率）；",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "TWO_LEVEL_ALARM",
          itemCodeConcat: "SECURITY_MONITORING::TWO_LEVEL_ALARM",
          itemName: "二级报警",
          itemType: "GROUP",
          weightAllot: 0.1,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "SECURITY_MONITORING::TWO_LEVEL_ALARM::HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              "describe": "总报警数【二级报警数】个，已处理【二级报警处理数】个，处理率【二级报警处理率】；报警处理数前五为：【处理人】（【二级报警处理率】）；报警处理数后五为：【处理人】（【二级报警处理率】）",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "SECURITY_MONITORING::TWO_LEVEL_ALARM::HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时二级处理的报警数】，总报警处理数【二级总处理数】。处理效率【二级总处理效率】；处理效率前五为：【处理人】（二级处理效率）；处理效率后五为：【处理人】（二级处理效率）；",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "THREE_LEVEL_ALARM",
          itemCodeConcat: "SECURITY_MONITORING::THREE_LEVEL_ALARM",
          itemName: "三级报警",
          itemType: "GROUP",
          weightAllot: 0.1,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_THREE_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "SECURITY_MONITORING::THREE_LEVEL_ALARM::HEADQUARTERS_THREE_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              weightAllot: 0.5,
              "describe": "总报警数【三级报警数】个，已处理【三级报警处理数】个，处理率【三级报警处理率】；报警处理数前五为：【处理人】（【三级报警处理率】）；报警处理数后五为：【处理人】（【三级报警处理率】）",
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_THREE_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "SECURITY_MONITORING::THREE_LEVEL_ALARM::HEADQUARTERS_THREE_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时三级处理的报警数】，总报警处理数【三级总处理数】。处理效率【三级总处理效率】；处理效率前五为：【处理人】（三级处理效率）；处理效率后五为：【处理人】（三级处理效率）；",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "FLAME_SMOG_ALARM",
          itemCodeConcat: "SECURITY_MONITORING::FLAME_SMOG_ALARM",
          itemName: "明火烟雾",
          itemType: "GROUP",
          weightAllot: 0.15,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_FLAME_SMOG_ALARM_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "SECURITY_MONITORING::FLAME_SMOG_ALARM::HEADQUARTERS_FLAME_SMOG_ALARM_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              "describe": "总报警数【明火烟雾报警数】个，已处理【明火烟雾报警处理数】个，处理率【明火烟雾报警处理率】；报警处理数前五为：【处理人】（【明火烟雾报警处理率】）；报警处理数后五为：【处理人】（【明火烟雾报警处理率】）",
              itemType: "METRIC_RULE",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_FLAME_SMOG_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "SECURITY_MONITORING::FLAME_SMOG_ALARM::HEADQUARTERS_FLAME_SMOG_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时明火烟雾处理的报警数】，总报警处理数【明火烟雾总处理数】。处理效率【明火烟雾总处理效率】；处理效率前五为：【处理人】（明火烟雾处理效率）；处理效率后五为：【处理人】（明火烟雾处理效率）；",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "ILOR_ALARM",
          itemCodeConcat: "SECURITY_MONITORING::ILOR_ALARM",
          itemName: "违停占道",
          itemType: "GROUP",
          weightAllot: 0.1,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_ILLEGAL_PARKING_ALARM_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "SECURITY_MONITORING::ILOR_ALARM::HEADQUARTERS_ILLEGAL_PARKING_ALARM_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              "describe": "总报警数【违停占道报警数】个，已处理【违停占道报警处理数】个，处理率【违停占道报警处理率】；报警处理数前五为：【处理人】（【违停占道报警处理率】）；报警处理数后五为：【处理人】（【违停占道报警处理率】）",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_ILOR_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "SECURITY_MONITORING::ILOR_ALARM::HEADQUARTERS_ILOR_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时违停占道处理的报警数】，总报警处理数【违停占道总处理数】。处理效率【违停占道总处理效率】；处理效率前五为：【处理人】（违停占道处理效率）；处理效率后五为：【处理人】（违停占道处理效率）；",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "TC_ALARM",
          itemCodeConcat: "SECURITY_MONITORING::TC_ALARM",
          itemName: "交通拥堵",
          itemType: "GROUP",
          weightAllot: 0.15,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_TRAFFIC_JAM_ALARM_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "SECURITY_MONITORING::TC_ALARM::HEADQUARTERS_TRAFFIC_JAM_ALARM_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              "describe": "总报警数【交通拥堵报警数】个，已处理【交通拥堵报警处理数】个，处理率【交通拥堵报警处理率】；报警处理数前五为：【处理人】（【交通拥堵报警处理率】）；报警处理数后五为：【处理人】（【交通拥堵报警处理率】）",
              weightAllot: 0.04,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_TC_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "SECURITY_MONITORING::TC_ALARM::HEADQUARTERS_TC_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时交通拥堵处理的报警数】，总报警处理数【交通拥堵总处理数】。处理效率【交通拥堵总处理效率】；处理效率前五为：【处理人】（交通拥堵处理效率）；处理效率后五为：【处理人】（交通拥堵处理效率）；",
              weightAllot: 0.04,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        }
      ]
    },
    {
      itemCode: "ELECTRICMANAGE",
      itemCodeConcat: "ELECTRICMANAGE",
      itemName: "电气管理",
      itemType: "APPLICATION",
      weightAllot: 0.15,
      scoreRanges: [],
      subItems: [
        {
          itemCode: "DEVICE",
          itemCodeConcat: "ELECTRICMANAGE::DEVICE",
          itemName: "设备情况",
          itemType: "GROUP",
          weightAllot: 0.2,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_DEVICE_ONLINE_RATE",
              itemCodeConcat: "ELECTRICMANAGE::DEVICE::HEADQUARTERS_DEVICE_ONLINE_RATE",
              itemName: "设备在线率",
              itemType: "METRIC_RULE",
              "describe": "在线设备数【设备数】，在线率【在线率】",
              weightAllot: 0.33,
              scoreRanges: [
                {
                  "gt": 90,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 80,
                  "le": 90,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 70,
                  "le": 80,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 60,
                  "le": 70,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 60,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_DEVICE_HEALTH_LEVEL",
              itemCodeConcat: "ELECTRICMANAGE::DEVICE::HEADQUARTERS_DEVICE_HEALTH_LEVEL",
              itemName: "设备健康度",
              itemType: "METRIC_RULE",
              "describe": "设备健康度低于60分的设备数【设备数】个，占总设备的【健康率】",
              weightAllot: 0.33,
              scoreRanges: [
                {
                  "gt": 90,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 80,
                  "le": 90,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 70,
                  "le": 80,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 60,
                  "le": 70,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 60,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_DEVICE_EXPIRATION_RATE",
              itemCodeConcat: "ELECTRICMANAGE::DEVICE::HEADQUARTERS_DEVICE_EXPIRATION_RATE",
              itemName: "质保到期率",
              itemType: "METRIC_RULE",
              weightAllot: 0.34,
              "describe": "设备到期数【到期数】个，到期率【到期率】",
              scoreRanges: [
                {
                  "gt": -1,
                  "le": 10,
                  "scoreRatio": 1
                },
                {
                  "gt": 10,
                  "le": 20,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 20,
                  "le": 30,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 30,
                  "le": 40,
                  "scoreRatio": 0.25
                },
                {
                  "gt": 40,
                  "le": 60,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "ALARM",
          itemCodeConcat: "ELECTRICMANAGE::OVERALL_ALARM_SITUATION",
          itemName: "总报警情况",
          itemType: "GROUP",
          weightAllot: 0.3,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_ALARM_USER_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "ELECTRICMANAGE::OVERALL_ALARM_SITUATION::HEADQUARTERS_ALARM_USER_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              "describe": "总报警数【报警数】个，已处理【处理数】个，处理率【处理率】；报警处理数前五为：【处理人】（【处理数】，【处理率】）；报警处理数后五为：【处理人】（【处理数】，【处理率】）",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "ELECTRICMANAGE::OVERALL_ALARM_SITUATION::HEADQUARTERS_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时处理的报警数】，总报警处理数【总处理数】。处理效率【总处理效率】；处理效率前五：【处理人】（【处理效率】）",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "ONE_LEVEL_ALARM",
          itemCodeConcat: "ELECTRICMANAGE::ONE_LEVEL_ALARM",
          itemName: "一级报警",
          itemType: "GROUP",
          weightAllot: 0.3,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_ONE_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "ELECTRICMANAGE::ONE_LEVEL_ALARM::HEADQUARTERS_ONE_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              "describe": "总报警数【一级报警数】个，已处理【一级报警处理数】个，处理率【一级报警处理率】；报警处理数前五为：【处理人】（【一级报警处理率】）；报警处理数后五为：【处理人】（【一级报警处理率】）",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "ELECTRICMANAGE::ONE_LEVEL_ALARM::HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时处理的报警数】，总报警处理数【总处理数】。处理效率【一级总处理效率】；处理效率前五为：【处理人】（一级处理效率）；处理效率后五为：【处理人】（一级处理效率）；",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "TWO_LEVEL_ALARM",
          itemCodeConcat: "ELECTRICMANAGE::TWO_LEVEL_ALARM",
          itemName: "二级报警",
          itemType: "GROUP",
          weightAllot: 0.1,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "ELECTRICMANAGE::TWO_LEVEL_ALARM::HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              "describe": "总报警数【二级报警数】个，已处理【二级报警处理数】个，处理率【二级报警处理率】；报警处理数前五为：【处理人】（【二级报警处理率】）；报警处理数后五为：【处理人】（【二级报警处理率】）",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "ELECTRICMANAGE::TWO_LEVEL_ALARM::HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时二级处理的报警数】，总报警处理数【二级总处理数】。处理效率【二级总处理效率】；处理效率前五为：【处理人】（二级处理效率）；处理效率后五为：【处理人】（二级处理效率）；",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "THREE_LEVEL_ALARM",
          itemCodeConcat: "ELECTRICMANAGE::THREE_LEVEL_ALARM",
          itemName: "三级报警",
          itemType: "GROUP",
          weightAllot: 0.1,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_THREE_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "ELECTRICMANAGE::THREE_LEVEL_ALARM::HEADQUARTERS_THREE_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              "describe": "总报警数【三级报警数】个，已处理【三级报警处理数】个，处理率【三级报警处理率】；报警处理数前五为：【处理人】（【三级报警处理率】）；报警处理数后五为：【处理人】（【三级报警处理率】）",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_THREE_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "ELECTRICMANAGE::THREE_LEVEL_ALARM::HEADQUARTERS_THREE_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              weightAllot: 0.5,
              "describe": "达标处理报警数【未超时三级处理的报警数】，总报警处理数【三级总处理数】。处理效率【三级总处理效率】；处理效率前五为：【处理人】（三级处理效率）；处理效率后五为：【处理人】（三级处理效率）；",
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        }
      ]
    },
    {
      itemCode: "FIRECONTROL",
      itemCodeConcat: "FIRECONTROL",
      itemName: "消防管理",
      itemType: "APPLICATION",
      weightAllot: 0.15,
      scoreRanges: [],
      subItems: [
        {
          itemCode: "DEVICE",
          itemCodeConcat: "FIRECONTROL::DEVICE",
          itemName: "设备情况",
          itemType: "GROUP",
          weightAllot: 0.2,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_DEVICE_ONLINE_RATE",
              itemCodeConcat: "FIRECONTROL::DEVICE::HEADQUARTERS_DEVICE_ONLINE_RATE",
              itemName: "设备在线率",
              itemType: "METRIC_RULE",
              "describe": "在线设备数【设备数】，在线率【在线率】",
              weightAllot: 0.33,
              scoreRanges: [
                {
                  "gt": 90,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 80,
                  "le": 90,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 70,
                  "le": 80,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 60,
                  "le": 70,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 60,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_DEVICE_HEALTH_LEVEL",
              itemCodeConcat: "FIRECONTROL::DEVICE::HEADQUARTERS_DEVICE_HEALTH_LEVEL",
              itemName: "设备健康度",
              itemType: "METRIC_RULE",
              "describe": "设备健康度低于60分的设备数【设备数】个，占总设备的【健康率】",
              weightAllot: 0.33,
              scoreRanges: [
                {
                  "gt": 90,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 80,
                  "le": 90,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 70,
                  "le": 80,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 60,
                  "le": 70,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 60,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_DEVICE_EXPIRATION_RATE",
              itemCodeConcat: "FIRECONTROL::DEVICE::HEADQUARTERS_DEVICE_EXPIRATION_RATE",
              itemName: "质保到期率",
              itemType: "METRIC_RULE",
              "describe": "设备到期数【到期数】个，到期率【到期率】",
              weightAllot: 0.34,
              scoreRanges: [
                {
                  "gt": -1,
                  "le": 10,
                  "scoreRatio": 1
                },
                {
                  "gt": 10,
                  "le": 20,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 20,
                  "le": 30,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 30,
                  "le": 40,
                  "scoreRatio": 0.25
                },
                {
                  "gt": 40,
                  "le": 60,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "ALARM",
          itemCodeConcat: "FIRECONTROL::OVERALL_ALARM_SITUATION",
          itemName: "总报警情况",
          itemType: "GROUP",
          weightAllot: 0.2,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_ALARM_USER_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "FIRECONTROL::OVERALL_ALARM_SITUATION::HEADQUARTERS_ALARM_USER_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              "describe": "总报警数【报警数】个，已处理【处理数】个，处理率【处理率】；报警处理数前五为：【处理人】（【处理数】，【处理率】）；报警处理数后五为：【处理人】（【处理数】，【处理率】）",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "FIRECONTROL::OVERALL_ALARM_SITUATION::HEADQUARTERS_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时处理的报警数】，总报警处理数【总处理数】。处理效率【总处理效率】；处理效率前五：【处理人】（【处理效率】）",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "ONE_LEVEL_ALARM",
          itemCodeConcat: "FIRECONTROL::ONE_LEVEL_ALARM",
          itemName: "一级报警",
          itemType: "GROUP",
          weightAllot: 0.2,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_ONE_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "FIRECONTROL::ONE_LEVEL_ALARM::HEADQUARTERS_ONE_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              "describe": "总报警数【一级报警数】个，已处理【一级报警处理数】个，处理率【一级报警处理率】；报警处理数前五为：【处理人】（【一级报警处理率】）；报警处理数后五为：【处理人】（【一级报警处理率】）",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "FIRECONTROL::ONE_LEVEL_ALARM::HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时处理的报警数】，总报警处理数【总处理数】。处理效率【一级总处理效率】；处理效率前五为：【处理人】（一级处理效率）；处理效率后五为：【处理人】（一级处理效率）；",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "TWO_LEVEL_ALARM",
          itemCodeConcat: "FIRECONTROL::TWO_LEVEL_ALARM",
          itemName: "二级报警",
          itemType: "GROUP",
          weightAllot: 0.1,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "FIRECONTROL::TWO_LEVEL_ALARM::HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              "describe": "总报警数【二级报警数】个，已处理【二级报警处理数】个，处理率【二级报警处理率】；报警处理数前五为：【处理人】（【二级报警处理率】）；报警处理数后五为：【处理人】（【二级报警处理率】）",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "FIRECONTROL::TWO_LEVEL_ALARM::HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时二级处理的报警数】，总报警处理数【二级总处理数】。处理效率【二级总处理效率】；处理效率前五为：【处理人】（二级处理效率）；处理效率后五为：【处理人】（二级处理效率）；",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "THREE_LEVEL_ALARM",
          itemCodeConcat: "FIRECONTROL::THREE_LEVEL_ALARM",
          itemName: "三级报警",
          itemType: "GROUP",
          weightAllot: 0.1,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_THREE_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "FIRECONTROL::THREE_LEVEL_ALARM::HEADQUARTERS_THREE_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              "describe": "总报警数【三级报警数】个，已处理【三级报警处理数】个，处理率【三级报警处理率】；报警处理数前五为：【处理人】（【三级报警处理率】）；报警处理数后五为：【处理人】（【三级报警处理率】）",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_THREE_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "FIRECONTROL::THREE_LEVEL_ALARM::HEADQUARTERS_THREE_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时三级处理的报警数】，总报警处理数【三级总处理数】。处理效率【三级总处理效率】；处理效率前五为：【处理人】（三级处理效率）；处理效率后五为：【处理人】（三级处理效率）；",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "WP_ALARM",
          itemCodeConcat: "FIRECONTROL::WP_ALARM",
          itemName: "水压报警",
          itemType: "GROUP",
          weightAllot: 0.1,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_WATER_PRESSURE_ALARM_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "FIRECONTROL::WP_ALARM::HEADQUARTERS_WATER_PRESSURE_ALARM_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              weightAllot: 0.5,
              "describe": "总报警数【水压报警数】个，已处理【水压报警处理数】个，处理率【水压报警处理率】；报警处理数前五为：【处理人】（【水压报警处理率】）；报警处理数后五为：【处理人】（【水压报警处理率】）",
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_WP_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "FIRECONTROL::WP_ALARM::HEADQUARTERS_WP_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时水压处理的报警数】，总报警处理数【水压总处理数】。处理效率【水压总处理效率】；处理效率前五为：【处理人】（水压处理效率）；处理效率后五为：【处理人】（水压处理效率）；",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        },
        {
          itemCode: "MCP_ALARM",
          itemCodeConcat: "FIRECONTROL::MCP_ALARM",
          itemName: "手报报警",
          itemType: "GROUP",
          weightAllot: 0.1,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_HAND_ALARM_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "FIRECONTROL::MCP_ALARM::HEADQUARTERS_HAND_ALARM_HANDLER_RATE_RANK_METRIC",
              itemName: "处理率",
              itemType: "METRIC_RULE",
              "describe": "总报警数【手报报警数】个，已处理【手报报警处理数】个，处理率【手报报警处理率】；报警处理数前五为：【处理人】（【手报报警处理率】）；报警处理数后五为：【处理人】（【手报报警处理率】）",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            },
            {
              itemCode: "HEADQUARTERS_MCP_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemCodeConcat: "FIRECONTROL::MCP_ALARM::HEADQUARTERS_MCP_ALARM_HANDLER_TIMEOUT_EFFICIENCY",
              itemName: "处理效率",
              itemType: "METRIC_RULE",
              "describe": "达标处理报警数【未超时手报处理的报警数】，总报警处理数【手报总处理数】。处理效率【手报总处理效率】；处理效率前五为：【处理人】（手报处理效率）；处理效率后五为：【处理人】（手报处理效率）；",
              weightAllot: 0.5,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        }
      ]
    },
    {
      itemCode: "ELECTRlC_VEHICLE",
      itemCodeConcat: "ELECTRlC_VEHICLE",
      itemName: "电动车管理",
      itemType: "APPLICATION",
      weightAllot: 0.15,
      scoreRanges: [],
      subItems: [
        {
          itemCode: "ALARM",
          itemCodeConcat: "ELECTRlC_VEHICLE::OVERALL_ALARM_SITUATION",
          itemName: "总报警情况",
          itemType: "GROUP",
          weightAllot: 1,
          scoreRanges: [],
          subItems: [
            {
              itemCode: "HEADQUARTERS_ALARM_USER_HANDLER_RATE_RANK_METRIC",
              itemCodeConcat: "ELECTRlC_VEHICLE::OVERALL_ALARM_SITUATION::HEADQUARTERS_ALARM_USER_HANDLER_RATE_RANK_METRIC",
              itemName: "数量",
              itemType: "METRIC_RULE",
              "describe": "总报警数【报警数】个，已处理【处理数】个，处理率【处理率】；报警处理数前五为：【处理人】（【处理数】，【处理率】）；报警处理数后五为：【处理人】（【处理数】，【处理率】）",
              weightAllot: 1,
              scoreRanges: [
                {
                  "gt": 89,
                  "le": 100,
                  "scoreRatio": 1
                },
                {
                  "gt": 79,
                  "le": 89,
                  "scoreRatio": 0.75
                },
                {
                  "gt": 69,
                  "le": 79,
                  "scoreRatio": 0.5
                },
                {
                  "gt": 59,
                  "le": 69,
                  "scoreRatio": 0.25
                },
                {
                  "gt": -1,
                  "le": 59,
                  "scoreRatio": 0
                }
              ],
              subItems: null
            }
          ]
        }
      ]
    }
  ]
}