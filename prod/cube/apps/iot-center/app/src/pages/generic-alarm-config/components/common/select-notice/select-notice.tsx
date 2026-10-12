import { Button, Select, Tag } from "antd";
import { useState } from "react";
import type { FC } from "react";
import { useImmer } from "use-immer";

import { useAsyncEffect } from "@ghcloud/cube-iot-center-app/hooks/use-async-effect";
import { guid } from "@ghcloud/cube-iot-center-app/utils/common";
import { messageTargetOptionsEnum } from "@ghcloud/cube-iot-center-app/utils/enum";

import { ModalTable } from "../model-table/modal-table";
import type { SelectEnum, TargetModifyParams } from "./select-notice.model";

import "../../components.less";

interface SelectNoticeProps {
  setTargetModifyParams: (arg0: TargetModifyParams) => void;
  info?: TargetModifyParams; // 修改为可选属性
}
export const SelectNotice: FC<SelectNoticeProps> = ({
  info = {
    id: "",
    messageTargetNotify: "USER",
    targetConfig: [],
  },
  setTargetModifyParams,
}) => {
  const urlParams = new URLSearchParams(location.search);
  const [noticeData, setNoticeData] = useImmer<TargetModifyParams>({
    id: guid(),
    messageTargetNotify: "USER",
    targetConfig: [],
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<{ id: string; name: string }[]>([]);

  useAsyncEffect(async () => {
    if (info) {
      setNoticeData((draft) => {
        draft.id = info.id;
        draft.messageTargetNotify = info.messageTargetNotify;
        draft.targetConfig = info.targetConfig;
      });
      setTags();
    }
  }, [info]);

  return (
    <>
      <Select
        disabled={urlParams.get("type") === "detail"}
        value={noticeData.messageTargetNotify}
        onChange={(value) => {
          changeSelect(value);
        }}
        options={messageTargetOptionsEnum}
        style={{ width: 200 }}
        placeholder="请选择"
        getPopupContainer={() => document.querySelector(".alarm-container") as unknown as HTMLElement}
      />
      {urlParams.get("type") !== "detail" && (
        <Button
          type="primary"
          style={{ marginLeft: "20px" }}
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          {noticeData.messageTargetNotify === "DEPARTMENT"
            ? "选择部门"
            : noticeData.messageTargetNotify === "ROLE"
              ? "选择角色"
              : noticeData.messageTargetNotify === "USER"
                ? "选择人员"
                : ""}
        </Button>
      )}
      <span style={{ marginLeft: "20px", display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        {selectedRows.map((value) => {
          return (
            <Tag
              key={value.id}
              closable={urlParams.get("type") !== "detail"}
              onClose={() => {
                closeTag(value);
              }}
              style={{ height: "20px", marginBottom: "8px" }}
            >
              {value.name}
            </Tag>
          );
        })}
      </span>
      <ModalTable
        allSelectedRowKeys={selectedRows}
        onOkModal={(value) => {
          setNoticeData((draft) => {
            draft.targetConfig = value.map((item) => {
              return {
                roleId: noticeData.messageTargetNotify === "ROLE" ? item.id : "",
                roleName: noticeData.messageTargetNotify === "ROLE" ? item.name : "",
                userId: noticeData.messageTargetNotify === "USER" ? item.id : "",
                userName: noticeData.messageTargetNotify === "USER" ? item.name : "",
                departmentId: noticeData.messageTargetNotify === "DEPARTMENT" ? item.id : "",
                departmentName: noticeData.messageTargetNotify === "DEPARTMENT" ? item.name : "",
              };
            });
            setTargetModifyParams(draft);
          });
          setIsModalOpen(false);
          setSelectedRows(value);
        }}
        isModalOpen={isModalOpen}
        closeModal={(value) => {
          setIsModalOpen(value);
        }}
        type={noticeData.messageTargetNotify as unknown as "DEPARTMENT" | "ROLE" | "USER"}
      />
    </>
  );
  function setTags(): void {
    const tags = info.targetConfig.map((e) => {
      const tagItem = {
        id: "",
        name: "",
      };
      if (info.messageTargetNotify === "USER") {
        tagItem.id = e.userId as unknown as string;
        tagItem.name = e.userName as unknown as string;
      } else if (info.messageTargetNotify === "DEPARTMENT") {
        tagItem.id = e.departmentId as unknown as string;
        tagItem.name = e.departmentName as unknown as string;
      } else {
        tagItem.id = e.roleId as unknown as string;
        tagItem.name = e.roleName as unknown as string;
      }
      return tagItem;
    });
    setSelectedRows(tags);
  }
  function changeSelect(value: SelectEnum): void {
    setSelectedRows([]);
    setNoticeData((draft) => {
      draft.messageTargetNotify = value;
      draft.targetConfig = [];
      setTargetModifyParams(draft);
    });
  }

  function closeTag(value: { id: string }): void {
    const newList = selectedRows.filter((item) => item.id !== value.id);
    setNoticeData((draft) => {
      draft.targetConfig = newList.map((item) => {
        return {
          roleId: noticeData.messageTargetNotify === "ROLE" ? item.id : "",
          roleName: noticeData.messageTargetNotify === "ROLE" ? item.name : "",
          userId: noticeData.messageTargetNotify === "USER" ? item.id : "",
          userName: noticeData.messageTargetNotify === "USER" ? item.name : "",
          departmentId: noticeData.messageTargetNotify === "DEPARTMENT" ? item.id : "",
          departmentName: noticeData.messageTargetNotify === "DEPARTMENT" ? item.name : "",
        };
      });
      setTargetModifyParams(draft);
    });
    setSelectedRows([...newList]);
  }
};
