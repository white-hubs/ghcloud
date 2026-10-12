/**
 * 资产明细
 *
 * PropertyDetailedParam
 */
export interface PropertyDetailedParam {
	key: string;
	/**
	 * 管理员id
	 */
	adminId?: string;
	/**
	 * 管理员姓名
	 */
	adminName?: string;
	/**
	 * 区域id
	 */
	areaId?: number;
	/**
	 * 区域名称
	 */
	areaName?: string;
	/**
	 * 资产图片
	 */
	file?: string;
	id?: number;
	/**
	 * 维保期限（月）
	 */
	maintenanceTime?: number;
	/**
	 * 资产名称
	 */
	name: string;
	/**
	 * 规格型号
	 */
	norms?: string;
	/**
	 * 数量
	 */
	number?: string;
	/**
	 * 原值
	 */
	price?: string;
	/**
	 * 购入时间
	 */
	purchaseDate: string;
	/**
	 * 资产编码
	 */
	serialNumber?: string;
	/**
	 * 资产类别id
	 */
	typeId?: number;
	/**
	 * 资产类别名称
	 */
	typeName: string;
	/**
	 * 计量单位
	 */
	unit?: string;
	/**
	 * 使用期限（月）
	 */
	usageTime?: number;
	flowConvertData?:boolean;
}