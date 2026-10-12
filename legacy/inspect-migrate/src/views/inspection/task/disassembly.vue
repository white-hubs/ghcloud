<template>
    <g-layout title="巡检任务-任务拆解">
        <template #content-table>
            <div class="tabTop singleLine mt2">
                <div class="standard">
                    <div class="treeCtr">
                        <div style="display: flex;align-items: center;justify-content: space-between; ">
                            <gVerticalLine title="巡检对象列表" :style="{
                                height: '32px',
                                lineHeight: '32px',
                            }" />
                            <a-button :disabled="butDisabled" type="primary" @click="openModal">
                                分发
                            </a-button>
                        </div>
                        <a-tree @check="checkTree" v-model:checkedKeys="checkedKeys" checkable :tree-data="treeOptions"
                            v-model:selectedKeys="treeChild" :replaceFields="replaceFields" @select="selectTree">
                            <template #title="{targetName,distributionStatus,id}">
                                <div class="tree_item" :title="targetName">
                                    <span class="tree_item_name">{{ targetName }}</span>
                                    <span v-show="id.indexOf('parent')"
                                        :style="{color:distributionStatus?'#70B603':'#F59A23'}">{{
                                        distributionStatus?'已分发':'未分发' }}</span>
                                </div>
                            </template>
                        </a-tree>
                    </div>
                    <div class="tableCtr pl2">
                        <div class="standardList">
                            <gVerticalLine title="巡检标准列表" :style="{
                                    height: '32px',
                                    lineHeight: '32px',
                                }" />
                            <div class="InspectionStandardsInfoBox">
                                <div class="InspectionStandardsInfo" v-for="item in checkedStandard" :key="item.id">
                                    <div class="InspectionStandardsInfo-header">
                                        <span>{{ item.name }} </span>
                                    </div>
                                    <a-table :dataSource="item.standardItems" :columns="itemColumns"
                                        :pagination='false'>
                                    </a-table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <a-modal width="1000px" v-model:visible="visible" centered title="选择人员" @ok="userObj"
                    @cancel="setObjCancel">
                    <TableInModal1 v-if="visible" ref="stallTableRef" :sly="180" :scrollX="200" :search="search"
                        :searchLength="2" :api="stallApi" :rowSelection="true" :columns="connectCol"
                        :selectedKeys="stanSelect" :rowKey="'id'" :size="'small'" :isInModal="true"
                        :selectType="'checkbox'" :pagination="true"></TableInModal1>
                </a-modal>
            </div>
        </template>
        <template #footer-page>
            <a-button @click="goBack">取消</a-button>
            <a-button type="primary" :loading="subLoading" @click="submit">保存</a-button>
        </template>
    </g-layout>
</template>
<script lang="jsx">
import {
    defineComponent,
    getCurrentInstance,
    onMounted,
    reactive,
    toRefs,
    ref
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { replaceObjectKeys } from "@pansy/utils";
import _ from "lodash";
import gLayout from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/gLayout'
import gVerticalLine from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/gVerticalLine'
import TableInModal1 from '@/components/Common/TableInModal1.vue'
export default defineComponent({
    components: {
        gLayout,
        gVerticalLine,
        TableInModal1
    },
    setup() {
        const router = useRouter();
        const { proxy } = getCurrentInstance()
        const route = useRoute();
        const id = route.query.id;
        const state = reactive({
            stanSelect: [],
            subLoading:false,
            butDisabled: true,
            itemColumns: [
                {
                    dataIndex: "referTypeNames",
                    title: "巡检名称",
                    ellipsis: true,
                    slots: {
                        customRender: "referTypeNames",
                    },
                },
                {
                    dataIndex: "name",
                    title: "内容描述",
                    ellipsis: true,
                    slots: {
                        customRender: "name",
                    },
                },
                // {
                //     dataIndex: "resultItemName",
                //     title: "默认结果",
                //     ellipsis: true,
                //     slots: {
                //         customRender: "resultItemName",
                //     },
                // },
                // {
                //     dataIndex: "imageFlag",
                //     title: "拍照",
                //     ellipsis: true,
                //     customRender: ({ text }) => {
                //         return (
                //             text ? '是' : '否'
                //         );
                //     },
                // },
                {
                    dataIndex: "resultNames",
                    title: "巡检结果",
                    ellipsis: true,
                    slots: {
                        customRender: "resultNames",
                    },
                },
                {
                    dataIndex: "targetCategory",
                    title: "适用对象",
                    ellipsis: true,
                    slots: {
                        customRender: "targetCategory",
                    },
                },
                {
                    dataIndex: "executor",
                    title: "执行人",
                    ellipsis: true,
                    slots: {
                        customRender: "executor",
                    },
                }
            ],
            treeOptions: [],
            standardCol: [
                {
                    dataIndex: "name",
                    title: "标准名称",
                    slots: {
                        customRender: "name",
                    },
                    ellipsis: true,
                    customRender: ({ text }) => {
                        return (
                            <PopOver position="topLeft" content={text}>
                                {text ? text : "--"}
                            </PopOver>
                        );
                    },
                },
                {
                    dataIndex: "code",
                    title: "标准编号",
                    slots: {
                        customRender: "code",
                    },
                    ellipsis: true,
                    customRender: ({ text }) => {
                        return (
                            <PopOver position="topLeft" content={text}>
                                {text ? text : "--"}
                            </PopOver>
                        );
                    },
                },
                {
                    dataIndex: "standardItemNames",
                    title: "标准详情",
                    slots: {
                        customRender: "standardItemNames",
                    },
                    ellipsis: true,
                    customRender: ({ text }) => {
                        return (
                            <PopOver position="topLeft" content={text}>
                                {text ? text : "--"}
                            </PopOver>
                        );
                    },
                },
                {
                    dataIndex: "action",
                    title: "操作",
                    slots: {
                        customRender: "action",
                    },
                },
            ],
            connectCol: [
                {
                    dataIndex: "name",
                    title: "名称",
                    ellipsis: true,
                    customRender: ({ text }) => {
                        return (
                            <PopOver position="topLeft" content={text ? text : ""}>
                                {text ? text : "--"}
                            </PopOver>
                        );
                    },
                },
                {
                    dataIndex: "mobile",
                    title: "联系电话",
                    ellipsis: true,
                    customRender: ({ text }) => {
                        return (
                            <PopOver position="topLeft" content={text ? text : ""}>
                                {text ? text : "--"}
                            </PopOver>
                        );
                    },
                },
                {
                    dataIndex: "organization",
                    title: "部门",
                    ellipsis: true,
                    customRender: ({ text }) => {
                        return (
                            <PopOver position="topLeft" content={text ? text : ""}>
                                {text ? text.name : "--"}
                            </PopOver>
                        );
                    },
                },
            ],
            checkedStandard: [],
            nowSelectTree: [],
            replaceFields: {
                children: "children",
                label: "targetName",
                key: "id",
            },
            visible: false,
            search: [
                {
                    label: "部门",
                    value: "organizationId",
                    component: "g-select",
                    url: "deptList",
                    defaultValue: "",
                    field: { name: "label", id: "value" },
                    placeholder: "全部",
                },
                { label: "", value: "keyword", placeholder: "人员名称" }
            ],
            stallApi: {
                list: "tenantUsers",
            },
        })
        const modalState = reactive({
            objSelect: [],
        })
        const tableState = reactive({
            tableData: [],
        })
        const selectTreeData = ref([])
        const submitData = ref([])
        const stallTableRef = ref();
        const checkedKeys = ref([])
        const treeChild = ref([])
        // 打开人员弹窗
        const openModal = () => {
            state.visible = true;
        };
        const goBack = () => {
            router.push({
                path: "/inspectionTask"
            });
        };
        const getTargetData = async () => {
            proxy.$api.inspectTaskDetailV2({id: id}).then(res => {
                let arr = []
                res.typeTargets.forEach(data => {
                    data.forEach(item => {
                        arr.push({
                            areaId: item.areaId,
                            targetCode: item.targetCode,
                            areaName: item.areaName,
                            targetCategory: item.targetCategory,
                            genreName: item.targetTypeName,
                            name: item.targetName,
                            genreId: item.targetType,
                            id: item.targetId,
                        })
                    })
                })
                setObj(arr)
            })
        }
        const obj = {
            "DEVICE": '设备',
            "STALL": '档位',
            "PROPERTY": '资产',
            "RISK_SOURCE": '风险源',
            "SITE_POINT": '现场点',
            "SMALL_ENGINEERING": '小散工程',
        }
        // 巡检对象配置保存
        const setObj = async (arr) => {
            
            const saveItems = arr;
            // 构造表格数据
            const intersectionData = _.intersectionBy(
                tableState.tableData,
                saveItems,
                "id"
            );
            const addItems = _.differenceBy(saveItems, intersectionData, "id");
            addItems.forEach(item => item.genreName = obj[item.targetCategory])
            addItems.forEach(item => item.genreName = obj[item.targetCategory])
            tableState.tableData = replaceObjectKeys(
                [...intersectionData, ...addItems],
                {
                    id: "id",
                    name: "targetName",
                    type: "targetType",
                    typeName: "typeName",
                    areaName: "areaName",
                    genreName: "typeName",
                    genreId: "targetType",
                    targetType: "targetType",
                    targetName: "targetName",
                    targetCode:'targetCode',
                    targetCategory: "targetCategory",
                }
            );
            modalState.objSelect = tableState.tableData.map((item) => item.id);
            setTreeData();
        };

        const setTreeData = async () => {
            if (tableState.tableData.length) {
                const tableGroup = _.groupBy(tableState.tableData, "typeName");
                // 添加
                if (state.treeOptions.length) {
                    const tableKeys = _.uniq(
                        tableState.tableData.map((item) => item.typeName)
                    );
                    for (let j in tableGroup) {
                        const targetNames = state.treeOptions.map(
                            (item) => item.targetName
                        );
                        if (targetNames.includes(j)) {
                            const index = state.treeOptions.findIndex(
                                (item) => item.targetName === j
                            );
                            const addItems = _.differenceBy(
                                tableGroup[j],
                                state.treeOptions[index].children,
                                "id"
                            );
                            const deleteIds = _.differenceBy(
                                state.treeOptions[index].children,
                                tableGroup[j],
                                "id"
                            ).map((item) => item.id);
                            const addList = addItems.filter((item) => {
                                Object.assign(item, {
                                    standardItems: state.treeOptions[index].standardItems,
                                    standardIds: state.treeOptions[index].standardIds,
                                });
                                return item;
                            });
                            state.treeOptions[index].children = state.treeOptions[
                                index
                            ].children
                                .concat(addList)
                                .filter((ele) => !deleteIds.includes(ele.id));
                        } else {
                            proxy.$api
                                .targetCategory({ targetCategory: state.nowSelectTree.targetCategory, targetType: state.nowSelectTree.targetType })
                                .then((res) => {
                                    res.forEach(item => {
                                        item.standardItems.forEach(data => {
                                            data.isRawItem = 1
                                        })
                                    });
                                    state.treeOptions.push({
                                        targetName: j,
                                        id: `parent${j}`,
                                        standardItems: res,
                                        standardIds: res.map((item) => item.id),
                                        children: tableGroup[j].filter((item) => {
                                            Object.assign(item, {
                                                standardItems: res,
                                                standardIds: res.map((item) => item.id),
                                            });
                                            return item;
                                        }),
                                    });
                                });
                        }

                        state.treeOptions = state.treeOptions.filter((item) =>
                            tableKeys.includes(item.targetName)
                        );
                    }
                } else {
                    // 表格数据分组--typeName
                    for (let i in tableGroup) {
                        proxy.$api
                            .targetCategory({ targetCategory: tableGroup[i][0].targetCategory, targetType: tableGroup[i][0].targetType })
                            .then((res) => {
                                res.forEach(item => {
                                    item.standardItems.forEach(data => {
                                        data.isRawItem = 1
                                    })
                                });
                                state.treeOptions.push({
                                    targetName: i,
                                    id: `parent${i}`,
                                    standardItems: res,
                                    standardIds: res.map((item) => item.id),
                                    children: tableGroup[i].filter((item) => {
                                        Object.assign(item, {
                                            standardItems: res,
                                            standardIds: res.map((item) => item.id),
                                        });
                                        return item;
                                    }),
                                });
                            });
                    }
                }
            } else {
                state.treeOptions = [];
            }
        };
        const checkTree = (checkedKeys, { checked }) => {
            selectTreeData.value = []
            // state.treeOptions.forEach(item => {
            //     item.children.forEach(child => {
            //         checkedKeys.forEach(data => {
            //             if (child.id === data && !child.distributionStatus) {
            //                 selectTreeData.value.push(child)
            //             }
            //         })
            //     })
            // })
            state.butDisabled = false
        }
        const selectTree = async (selectedKeys, { selectedNodes, node }) => {
            if (!selectedKeys.length) return;
            state.checkedStandard = []
            if (selectedKeys[0].includes("parent")) {
                state.checkedStandard = []
                return
            }
            const raw = selectedNodes?.[0] ?? node
            const row = raw?.props?.dataRef ?? raw?.dataRef ?? raw
            let params = {
                targetId: row.id,
                taskId: id
            }
            proxy.$api.taskDetailStandardV2(params).then((res) => {
                modalState.checkedStandard = []
                res.forEach(item => {
                    let Standard = {
                        name: item.standardName,
                        id: item.id,
                        standardItems: item.itemList.map(data => {
                            return {
                                resultNames: data.resultNames,
                                alias: data.itemName,
                                name: data.itemContent,
                                executor: row.executor,
                                id: data.itemId,
                                referTypeNames: data.referTypeNames,
                                targetCategory: obj[item.targetCategory]
                            }
                        })
                    }
                    state.checkedStandard.push(Standard)
                })
            });
        };
        const submit = () => {
            let params = {
                taskId: id,
                taskReceiveUsersDTOList: submitData.value
            }
            let data = []
            state.treeOptions.forEach(item => {
                item.children.forEach(child => {
                    if (child.distributionStatus) {
                        data.push(true)
                    }
                })
            })
            if (data.length === setObjCancel(state.treeOptions).length) {
                state.subLoading = true
                proxy.$api.inspectTaskSplitV2(params).then((() => {
                    goBack()
                    state.subLoading = false
                })).catch(()=>{
                    state.subLoading = false
                })
            } else {
                proxy.$message.warn("请分发所有任务");
            }
        }
        const setObjCancel = (source) => {
            if (!Array.isArray(source)) return;
            let res = []
            source.forEach(el => {
                if (!(el.id == 'parent设备' || el.id == 'parent档位' || el.id == 'parent资产' || el.id == 'parent现场点'|| el.id == "parent风险源"|| el.id == "parent小散工程")) {
                    res.push(el)
                }
                el.children && res.push(...setObjCancel(el.children))
            })
            return res
        }
        const userObj = () => {
            if (stallTableRef.value.alreadySelected.length === 0) {
                proxy.$message.warn("请选择分发人员");
                return
            }
            treeChild.value = []
            state.checkedStandard = []
            state.treeOptions.forEach(item => {
                item.children.forEach(taskTarget => {
                    if (checkedKeys.value.includes(taskTarget.id)) {

                        selectTreeData.value.push(taskTarget)
                    }
                })
            })
            let obj = {
                receiveIds: stallTableRef.value.alreadySelected.join(",")
            }
            
            obj.taskTargetDTOList = replaceObjectKeys(
                [...selectTreeData.value],
                {
                    latAndLon: 'latAndLon',
                    location: 'location',
                    targetCategory: "targetCategory",
                    targetType: "targetType",
                    id: "targetId",
                    targetCode:'targetCode',
                    targetName: "targetName",
                }
            )
            submitData.value.push(JSON.parse(JSON.stringify(obj)))
            submitData.value = submitData.value.filter(item => {
                item.taskTargetDTOList = item.taskTargetDTOList.filter(taskTarget => {
                    if (!checkedKeys.value.includes(taskTarget.targetId)) {
                        return taskTarget
                    }
                })
                if (item.taskTargetDTOList.length) {
                    return item
                }
            })
            submitData.value.push(JSON.parse(JSON.stringify(obj)))
            state.treeOptions.forEach(item => {
                item.children.forEach(child => {
                    selectTreeData.value.forEach(data => {
                        if (child.id === data.id) {
                            child.executor = stallTableRef.value.selectedItem.map(e => e.name).join(',')
                            // child.disabled = true
                            child.distributionStatus = true
                        }
                    })
                })
            })
            selectTreeData.value = []
            state.stanSelect = []
            checkedKeys.value = []
            state.visible = false;
        }
        onMounted(() => {
            getTargetData()
        });

        return {
            ...toRefs(state),
            stallTableRef,
            checkedKeys,
            treeChild,
            setObj,
            checkTree,
            userObj,
            selectTree,
            setObjCancel,
            submit,
            openModal,
            goBack
        };
    },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");

.ctr {
    width: 100%;
    height: 100%;
}

:deep(.ant-tabs-tabpane) {
    width: 100%;
    height: 100%;
}

.standard {
    width: 100%;
    height: 100%;
    display: flex;
    background-color: #fff;

    .treeCtr {
        width: 300px;
        border-right: 1px solid #f3f3f3;
    }

    .tableCtr {
        flex: 1;
    }
}

.timeLimitForm {
    height: 32px !important;

    .ant-form-item {
        margin-bottom: 0;
    }
}

.tabTop {
    font-family: @fontMedium;
    font-size: 14px;
    font-weight: 500;
}

:deep(.ant-tabs-top-bar) {
    background-color: #fafafa;
    margin-bottom: 8px;
}

:deep(.ant-table-title) {
    text-align: right;
    padding-top: 0;
}

:deep(.ant-table-tbody) {
    text-align: left;
    font-family: @fontRegular;
}

:deep(.ant-modal) {
    text-align: left;

    .ant-modal-content .ant-modal-body {
        max-height: 600px !important;
        overflow-y: auto;
    }
}

:deep(.ant-modal-body) {
    padding: 16px !important;
}

:deep(.detail-form .ant-form-item > .ant-form-item-label) {
    width: 125px !important;
}

:deep(.ant-select-selection-search) {
    overflow: hidden;
}

.InspectionStandardsInfoBox {
    height: 700px;
    overflow-y: scroll;
}

.tree_item {
    width: 150px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .tree_item_name {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

    }
}
:deep(.ant-tree) {
  height: calc(100vh - 400px);
  overflow-y: auto;
}
</style>
