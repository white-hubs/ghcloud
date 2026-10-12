export interface GroupControl {
    groupTotal: number,
    deviceTotal: number,
    openTotal: number,
    closeTotal: number,
    name: string,
}


export interface UsageStatByType {
    /**
     * 总用量
     */
    totalUsage: number;
    /**
     * 类型
     */
    waterType: string;
    /**
     * 类型名称
     */
    waterTypeName: string;
}

export interface UsageStatByArea {
    /**
     * 区域名称
     */
    areaName: string;
    /**
     * 总用量
     */
    totalUsage: number;
}

export interface DirectionOutList {
	direction: string;
	num: number;
	timeFlag: string;
	lane: string;
	inNum: number;
	outNum: number;
	speed: number;
}

export interface DirectionInList {
	direction: string;
	num: number;
	timeFlag: string;
	lane: string;
	inNum: number;
	outNum: number;
	speed: number;
}

export interface TrafficFlowTunnels {
	directionOutList: DirectionOutList[];
	directionTotalOut: number;
	directionInList: DirectionInList[];
	xtitle: string[];
	directionTotalIn: number;
}