# prod/cube/basic/cube-speech-assistant/AGENTS.md

本目录是 `@ghcloud/cube-speech-assistant` 语音转文字通用模块。

## Rules

- 修改录音、转写、状态机、权限、`SpeechInputController` 前必须读取 `cube-speech-assistant` skill。
- 不绕过控制器直接在业务侧拼装底层服务。
- 状态机和生命周期改动必须考虑并发触发与 `dispose()`。
- 公共 API 变化必须查消费者。

## Skills

以下路径均相对仓库根目录：

- 领域规则：`.agents/skills/cube-speech-assistant/SKILL.md`
- 普通编码：`.agents/skills/project-coding/SKILL.md`
- 验证命令：`.agents/skills/project-verification/SKILL.md`
