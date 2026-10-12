import { CalendarOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { defineComponent, computed } from "vue";

import { Avatar } from "@ghcloud/cube-ui";

import "./user-welcome.less";

interface CachedUser {
  name?: string;
  username?: string;
  lastLoginTime?: string | number;
  fileVO?: {
    path?: string;
  };
}

const formatLastLoginTime = (value?: string | number): string => {
  if (value === undefined || value === null || value === "") return "暂无记录";
  const numericValue = typeof value === "number" ? value : Number(value);
  const date = Number.isFinite(numericValue) ? dayjs(numericValue < 100000000000 ? numericValue * 1000 : numericValue) : dayjs(value);
  return date.isValid() ? date.format("YYYY-MM-DD HH:mm:ss") : "暂无记录";
};

export default defineComponent({
  name: "UserWelcome",
  setup() {
    const user = computed<CachedUser>(() => {
      try {
        return JSON.parse(sessionStorage.getItem("GH-UserInfo") ?? "{}") as CachedUser;
      } catch {
        return {};
      }
    });

    return (): JSX.Element => (
      <section class="user-welcome">
        <div class="user-welcome__identity">
          <Avatar class="user-welcome__avatar" size={48} src={user.value.fileVO?.path}>
            {user.value.name || user.value.username || "用户"}
          </Avatar>
          <div>
            <div>
              <strong>{user.value.name || user.value.username || "用户"}</strong>，您好！祝你开心每一天
            </div>
            <small>上次登录时间：{formatLastLoginTime(user.value.lastLoginTime)}</small>
          </div>
        </div>
        <div class="user-welcome__date">
          <CalendarOutlined /> {dayjs().format("YYYY-MM-DD dddd")}
        </div>
      </section>
    );
  },
});
