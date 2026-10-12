import { AimOutlined, AudioOutlined, VideoCameraOutlined } from "@ant-design/icons-vue";
import { Checkbox, DatePicker, Pagination, TreeSelect } from "ant-design-vue";
import dayjs from "dayjs";
import { defineComponent } from "vue";

import { Button, Empty, Input, Modal } from "@ghcloud/cube-ui";

import type { PersonnelDepartment, PersonnelItem, PersonnelTrackPoint } from "@/types/dashboard";

import "./personnel-modals.less";

const defaultAvatar = "/resource/v1/command-dispatch-migrate/commandDispatch/images/default-avatar.png";

export const PersonnelModals = defineComponent({
  name: "PersonnelModals",
  props: {
    personnelVisible: { type: Boolean, required: true },
    personnelKeyword: { type: String, required: true },
    personnelDepartmentId: { type: String, required: true },
    personnelDepartments: { type: Array as () => PersonnelDepartment[], required: true },
    personnelList: { type: Array as () => PersonnelItem[], required: true },
    personnelLoading: { type: Boolean, required: true },
    historyVisible: { type: Boolean, required: true },
    historyPerson: { type: Object as () => PersonnelItem | null, required: false, default: null },
    historyStartDate: { type: String, required: true },
    historyEndDate: { type: String, required: true },
    historyRecords: { type: Array as () => PersonnelTrackPoint[], required: true },
    historyTotal: { type: Number, required: true },
    historyPageNumber: { type: Number, required: true },
    historyPageSize: { type: Number, required: true },
    historyLoading: { type: Boolean, required: true },
    historyMapChecked: { type: Boolean, required: true },
    onClosePersonnel: { type: Function as unknown as () => () => void, required: true },
    onSearchPersonnel: { type: Function as unknown as () => () => void, required: true },
    onResetPersonnel: { type: Function as unknown as () => () => void, required: true },
    onUpdatePersonnelKeyword: { type: Function as unknown as () => (value: string) => void, required: true },
    onUpdatePersonnelDepartmentId: { type: Function as unknown as () => (value: string) => void, required: true },
    onLocatePersonnel: { type: Function as unknown as () => (person: PersonnelItem) => void, required: true },
    onCallPersonnel: { type: Function as unknown as () => (person: PersonnelItem) => void, required: true },
    onVideoPersonnel: { type: Function as unknown as () => (person: PersonnelItem) => void, required: true },
    onCloseHistory: { type: Function as unknown as () => () => void, required: true },
    onSearchHistory: { type: Function as unknown as () => () => void, required: true },
    onResetHistory: { type: Function as unknown as () => () => void, required: true },
    onUpdateHistoryStartDate: { type: Function as unknown as () => (value: string) => void, required: true },
    onUpdateHistoryEndDate: { type: Function as unknown as () => (value: string) => void, required: true },
    onHistoryPageChange: { type: Function as unknown as () => (pageNumber: number) => void, required: true },
    onToggleHistoryMap: { type: Function as unknown as () => (checked: boolean) => void, required: true },
  },
  setup(props) {
    const onlineCount = (): number => props.personnelList.filter((person) => person.isOnline).length;

    const ensureOnline = (person: PersonnelItem, action: (person: PersonnelItem) => void): void => {
      if (!person.isOnline) {
        return;
      }
      action(person);
    };

    const disabledStartDate = (current: dayjs.Dayjs): boolean => {
      return Boolean(current && current > dayjs().endOf("day"));
    };

    const disabledEndDate = (current: dayjs.Dayjs): boolean => {
      if (!current) {
        return false;
      }
      if (!props.historyStartDate) {
        return current > dayjs().endOf("day");
      }
      const start = dayjs(props.historyStartDate);
      return current < start.startOf("day") || current > start.add(29, "day").endOf("day") || current > dayjs().endOf("day");
    };

    return () => (
      <>
        <Modal
          open={props.personnelVisible}
          title={
            <div class="personnel-modal-title">
              <span>现场人员</span>
              <em>
                在线人数{onlineCount()}/<b>{props.personnelList.length}</b>
              </em>
            </div>
          }
          width={660}
          footer={null}
          wrapClassName="screen-modal-wrap personnel-modal-wrap draggable-modal-wrap"
          class="screen-modal personnel-modal"
          onCancel={props.onClosePersonnel}
        >
          <div class="personnel-toolbar">
            <Input
              class="personnel-search-input"
              placeholder="请输入人员查询"
              value={props.personnelKeyword}
              onUpdate:value={props.onUpdatePersonnelKeyword}
              onPressEnter={props.onSearchPersonnel}
              allowClear
            />
            <TreeSelect
              class="personnel-dept-select"
              value={props.personnelDepartmentId || undefined}
              treeData={props.personnelDepartments}
              fieldNames={{ label: "name", value: "id", children: "children" }}
              allowClear
              showSearch
              treeDefaultExpandAll={false}
              placeholder="请选择部门"
              getPopupContainer={(node) => node.parentElement || document.body}
              onUpdate:value={(value) => props.onUpdatePersonnelDepartmentId(String(value || ""))}
            />
            <Button type="primary" onClick={props.onSearchPersonnel}>
              查询
            </Button>
            <Button onClick={props.onResetPersonnel}>重置</Button>
          </div>

          <div class="personnel-list-panel">
            {props.personnelLoading && <div class="personnel-load-status">加载中...</div>}
            {!props.personnelLoading && props.personnelList.length === 0 && <Empty class="screen-empty" description="暂无人员数据" />}
            {!props.personnelLoading &&
              props.personnelList.map((person) => (
                <div class={["personnel-item", person.isOnline ? "online" : "offline"]} key={person.id}>
                  <img class="personnel-avatar" src={person.file?.path || defaultAvatar} alt="" />
                  <div class="personnel-main">
                    <div class="personnel-name-row">
                      <span class="personnel-name">{person.name}</span>
                      <span class="personnel-status">{person.isOnline ? "在线" : "离线"}</span>
                    </div>
                    <div class="personnel-phone">联系电话：{person.mobile || "--"}</div>
                    <div class="personnel-dept">部门：{person.organizationName || "--"}</div>
                  </div>
                  <div class="personnel-actions">
                    <button
                      class="personnel-action-btn"
                      type="button"
                      title="定位"
                      disabled={!person.isOnline}
                      onClick={() => ensureOnline(person, props.onLocatePersonnel)}
                    >
                      <AimOutlined />
                    </button>
                    <button
                      class="personnel-action-btn"
                      type="button"
                      title="通话"
                      disabled={!person.isOnline}
                      onClick={() => ensureOnline(person, props.onCallPersonnel)}
                    >
                      <AudioOutlined />
                    </button>
                    <button
                      class="personnel-action-btn"
                      type="button"
                      title="视频"
                      disabled={!person.isOnline}
                      onClick={() => ensureOnline(person, props.onVideoPersonnel)}
                    >
                      <VideoCameraOutlined />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </Modal>

        <Modal
          open={props.historyVisible}
          title="历史轨迹"
          width={420}
          footer={null}
          wrapClassName="screen-modal-wrap personnel-history-wrap draggable-modal-wrap"
          class="screen-modal personnel-history-modal"
          onCancel={props.onCloseHistory}
        >
          <div class="history-person-card">
            <img class="history-avatar" src={props.historyPerson?.file?.path || defaultAvatar} alt="" />
            <div>
              <div class="history-name-row">
                <span>{props.historyPerson?.name || "--"}</span>
                <em>在线</em>
              </div>
              <div class="history-phone">电话号码：{props.historyPerson?.mobile || "--"}</div>
            </div>
          </div>

          <div class="history-toolbar">
            <div class="history-date-row">
              <span>开始时间:</span>
              <DatePicker
                {...(props.historyStartDate ? { value: props.historyStartDate } : {})}
                valueFormat="YYYY-MM-DD"
                disabledDate={disabledStartDate}
                getPopupContainer={(node) => node.parentElement || document.body}
                onUpdate:value={(value) => props.onUpdateHistoryStartDate(String(value || ""))}
              />
              <Button size="small" onClick={props.onResetHistory}>
                重置
              </Button>
            </div>
            <div class="history-date-row">
              <span>结束时间:</span>
              <DatePicker
                {...(props.historyEndDate ? { value: props.historyEndDate } : {})}
                valueFormat="YYYY-MM-DD"
                disabledDate={disabledEndDate}
                getPopupContainer={(node) => node.parentElement || document.body}
                onUpdate:value={(value) => props.onUpdateHistoryEndDate(String(value || ""))}
              />
              <Button size="small" type="primary" onClick={props.onSearchHistory}>
                查询
              </Button>
            </div>
            <Checkbox checked={props.historyMapChecked} onUpdate:checked={(checked) => props.onToggleHistoryMap(Boolean(checked))}>
              在地图上显示
            </Checkbox>
          </div>

          <div class="history-track-list">
            {props.historyLoading && <div class="personnel-load-status">加载中...</div>}
            {!props.historyLoading && props.historyRecords.length === 0 && <Empty class="screen-empty" description="暂无轨迹数据" />}
            {!props.historyLoading &&
              props.historyRecords.map((record, index) => (
                <div class="track-step-item" key={record.id}>
                  <div class="track-step-axis">
                    <span class={index === 0 ? "track-dot active" : "track-dot"} />
                    {index !== props.historyRecords.length - 1 && <i />}
                  </div>
                  <div class="track-step-content">
                    <div class="track-time">{record.timeText}</div>
                    <div class="track-address">{record.address || "--"}</div>
                  </div>
                </div>
              ))}
          </div>
          {props.historyTotal > 0 && (
            <Pagination
              class="history-pagination"
              size="small"
              current={props.historyPageNumber}
              pageSize={props.historyPageSize}
              total={props.historyTotal}
              showSizeChanger={false}
              onChange={(pageNumber) => props.onHistoryPageChange(pageNumber)}
            />
          )}
        </Modal>
      </>
    );
  },
});
