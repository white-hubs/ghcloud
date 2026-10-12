import { defineComponent, nextTick, onMounted, onUnmounted, shallowRef } from "vue";

import { MFRootEventNameEnum, publisher } from "@ghcloud/cube-mf-root";
import { SpeechInputController, type SpeechInputStatus } from "@ghcloud/cube-speech-assistant";
import { Textarea, Tooltip, message, Button } from "@ghcloud/cube-ui";

import { fetchAssistantSkills, type AssistantSkillOption } from "@/api/ai-assistant";
import robotImage from "@/assets/images/robot.png";
import WorkbenchIcon from "@/components/icon/workbench-icon";

import "./ai-assistant-entry.less";

const WORKBENCH_ASSISTANT_DRAFT_STORAGE_KEY = "cube-ai-application:workbench-assistant-draft";
const SKILL_AUTO_SCROLL_SPEED = 25;
const SKILL_SCROLLBAR_HIDE_DELAY = 450;

export default defineComponent({
  name: "AiAssistantEntry",
  setup() {
    const question = shallowRef("");
    const voiceStatus = shallowRef<SpeechInputStatus>("idle");
    const skills = shallowRef<AssistantSkillOption[]>([]);
    const skillLoading = shallowRef(false);
    const selectedSkillIds = shallowRef<string[]>([]);
    const suggestionsViewportRef = shallowRef<HTMLDivElement | null>(null);
    const suggestionsRef = shallowRef<HTMLDivElement | null>(null);
    const scrollbarTrackRef = shallowRef<HTMLDivElement | null>(null);
    const scrollbarThumbRef = shallowRef<HTMLDivElement | null>(null);
    let skillResizeObserver: ResizeObserver | undefined;
    let skillAutoScrollFrame: number | undefined;
    let skillLastAutoScrollAt = 0;
    let skillAutoScrollPosition = 0;
    let isAutoScrolling = false;
    let skillAutoScrollDirection = 1;
    let skillAutoScrollPaused = false;
    let skillMaxScrollLeft = 0;
    let skillScrollbarHideTimer: ReturnType<typeof setTimeout> | undefined;
    let skillScrollbarDragging = false;
    let skillViewportHovered = false;
    let skillDragStartX = 0;
    let skillDragStartScrollLeft = 0;

    const updateSkillViewportState = (): void => {
      const container = suggestionsRef.value;
      const viewport = suggestionsViewportRef.value;
      const track = scrollbarTrackRef.value;
      const thumb = scrollbarThumbRef.value;
      if (!container || !viewport || !track || !thumb) return;

      skillMaxScrollLeft = Math.max(container.scrollWidth - container.clientWidth, 0);
      const hasOverflow = skillMaxScrollLeft > 1;
      viewport.classList.toggle("ai-assistant-entry__suggestions--fade-start", hasOverflow && container.scrollLeft > 1);
      viewport.classList.toggle("ai-assistant-entry__suggestions--fade-end", hasOverflow && container.scrollLeft < skillMaxScrollLeft - 1);

      const visibleRatio = container.scrollWidth > 0 ? container.clientWidth / container.scrollWidth : 1;
      const thumbWidth = Math.max(4, Math.min(100, visibleRatio * 100));
      const thumbLeft = hasOverflow ? (container.scrollLeft / skillMaxScrollLeft) * (100 - thumbWidth) : 0;
      thumb.style.width = `${thumbWidth}%`;
      thumb.style.left = `${thumbLeft}%`;
      thumb.setAttribute("aria-valuenow", String(Math.round(thumbLeft)));
    };

    const handleSkillScroll = (): void => {
      if (!isAutoScrolling) {
        skillAutoScrollPosition = suggestionsRef.value?.scrollLeft ?? 0;
      }
      updateSkillViewportState();
    };

    const stopSkillAutoScroll = (): void => {
      if (skillAutoScrollFrame !== undefined) {
        window.cancelAnimationFrame(skillAutoScrollFrame);
        skillAutoScrollFrame = undefined;
      }
      skillLastAutoScrollAt = 0;
    };

    const runSkillAutoScroll = (timestamp: number): void => {
      const container = suggestionsRef.value;
      if (!container || skillAutoScrollPaused || document.hidden || skillMaxScrollLeft <= 1) {
        stopSkillAutoScroll();
        return;
      }

      const elapsed = skillLastAutoScrollAt ? timestamp - skillLastAutoScrollAt : 0;
      skillLastAutoScrollAt = timestamp;
      const nextScrollLeft = skillAutoScrollPosition + (skillAutoScrollDirection * (SKILL_AUTO_SCROLL_SPEED * elapsed)) / 1000;
      if (nextScrollLeft >= skillMaxScrollLeft) {
        skillAutoScrollPosition = skillMaxScrollLeft;
        skillAutoScrollDirection = -1;
      } else if (nextScrollLeft <= 0) {
        skillAutoScrollPosition = 0;
        skillAutoScrollDirection = 1;
      } else {
        skillAutoScrollPosition = nextScrollLeft;
      }
      isAutoScrolling = true;
      container.scrollLeft = Math.round(skillAutoScrollPosition);
      isAutoScrolling = false;
      updateSkillViewportState();
      skillAutoScrollFrame = window.requestAnimationFrame(runSkillAutoScroll);
    };

    const startSkillAutoScroll = (): void => {
      if (skillAutoScrollPaused || skillAutoScrollFrame !== undefined || skillMaxScrollLeft <= 1 || document.hidden) return;
      skillAutoScrollFrame = window.requestAnimationFrame(runSkillAutoScroll);
    };

    const refreshSkillViewport = (): void => {
      updateSkillViewportState();
      if (skillAutoScrollFrame === undefined) {
        skillAutoScrollPosition = suggestionsRef.value?.scrollLeft ?? 0;
      }
      if (skillMaxScrollLeft <= 1) {
        stopSkillAutoScroll();
        return;
      }
      if (skillViewportHovered) {
        scrollbarTrackRef.value?.classList.add("ai-assistant-entry__scrollbar--visible");
      }
      startSkillAutoScroll();
    };

    const clearSkillScrollbarHideTimer = (): void => {
      if (skillScrollbarHideTimer) {
        clearTimeout(skillScrollbarHideTimer);
        skillScrollbarHideTimer = undefined;
      }
    };

    const revealSkillScrollbar = (): void => {
      clearSkillScrollbarHideTimer();
      scrollbarTrackRef.value?.classList.toggle("ai-assistant-entry__scrollbar--visible", skillMaxScrollLeft > 1);
    };

    const hideSkillScrollbar = (): void => {
      clearSkillScrollbarHideTimer();
      skillScrollbarHideTimer = setTimeout(() => {
        scrollbarTrackRef.value?.classList.remove("ai-assistant-entry__scrollbar--visible");
      }, SKILL_SCROLLBAR_HIDE_DELAY);
    };

    const pauseSkillAutoScroll = (): void => {
      skillAutoScrollPaused = true;
      stopSkillAutoScroll();
    };

    const resumeSkillAutoScroll = (): void => {
      skillAutoScrollPaused = false;
      startSkillAutoScroll();
    };

    const handleSkillViewportEnter = (): void => {
      skillViewportHovered = true;
      revealSkillScrollbar();
      pauseSkillAutoScroll();
    };

    const handleSkillViewportLeave = (): void => {
      skillViewportHovered = false;
      if (skillScrollbarDragging) return;
      hideSkillScrollbar();
      resumeSkillAutoScroll();
    };

    const setSkillScrollFromTrackPosition = (clientX: number): void => {
      const container = suggestionsRef.value;
      const track = scrollbarTrackRef.value;
      if (!container || !track || skillMaxScrollLeft <= 1) return;

      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return;
      const thumbWidth = Number.parseFloat(scrollbarThumbRef.value?.style.width ?? "100") || 100;
      const thumbTravelRatio = Math.max(1 - thumbWidth / 100, 0.01);
      const pointerRatio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      const scrollRatio = Math.min(Math.max((pointerRatio - thumbWidth / 200) / thumbTravelRatio, 0), 1);
      container.scrollLeft = scrollRatio * skillMaxScrollLeft;
      handleSkillScroll();
    };

    const handleScrollbarTrackPointerDown = (event: PointerEvent): void => {
      event.preventDefault();
      revealSkillScrollbar();
      setSkillScrollFromTrackPosition(event.clientX);
    };

    const endSkillScrollbarDrag = (): void => {
      if (!skillScrollbarDragging) return;
      skillScrollbarDragging = false;
      window.removeEventListener("pointermove", handleSkillScrollbarPointerMove);
      window.removeEventListener("pointerup", endSkillScrollbarDrag);

      if (skillViewportHovered) return;
      hideSkillScrollbar();
      resumeSkillAutoScroll();
    };

    const handleSkillScrollbarPointerMove = (event: PointerEvent): void => {
      const container = suggestionsRef.value;
      const track = scrollbarTrackRef.value;
      if (!container || !track || !skillScrollbarDragging || skillMaxScrollLeft <= 1) return;

      const thumbWidth = Number.parseFloat(scrollbarThumbRef.value?.style.width ?? "100") || 100;
      const thumbTravel = track.clientWidth * Math.max(1 - thumbWidth / 100, 0.01);
      container.scrollLeft = Math.min(
        Math.max(skillDragStartScrollLeft + ((event.clientX - skillDragStartX) / thumbTravel) * skillMaxScrollLeft, 0),
        skillMaxScrollLeft,
      );
      handleSkillScroll();
    };

    const handleScrollbarThumbPointerDown = (event: PointerEvent): void => {
      event.preventDefault();
      event.stopPropagation();
      skillScrollbarDragging = true;
      skillDragStartX = event.clientX;
      skillDragStartScrollLeft = suggestionsRef.value?.scrollLeft ?? 0;
      revealSkillScrollbar();
      pauseSkillAutoScroll();
      window.addEventListener("pointermove", handleSkillScrollbarPointerMove);
      window.addEventListener("pointerup", endSkillScrollbarDrag);
    };

    const handleScrollbarThumbKeydown = (event: KeyboardEvent): void => {
      const container = suggestionsRef.value;
      if (!container || skillMaxScrollLeft <= 1) return;

      const step = Math.min(container.clientWidth * 0.35, 120);
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        container.scrollLeft = Math.max(container.scrollLeft - step, 0);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        container.scrollLeft = Math.min(container.scrollLeft + step, skillMaxScrollLeft);
      } else {
        return;
      }
      handleSkillScroll();
    };

    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        stopSkillAutoScroll();
        return;
      }
      refreshSkillViewport();
    };
    const speechController = new SpeechInputController({
      onStateChange: ({ status }) => {
        voiceStatus.value = status;
      },
      onTranscribed: (text) => {
        const normalized = text.trim();
        if (!normalized) return;
        question.value = question.value.trim() ? `${question.value.trim()} ${normalized}` : normalized;
      },
      onError: (error) => {
        message.error(error instanceof Error ? error.message : "语音识别失败");
      },
    });

    const loadSkills = async (): Promise<void> => {
      skillLoading.value = true;
      try {
        skills.value = await fetchAssistantSkills();
        await nextTick();
        refreshSkillViewport();
      } catch {
        skills.value = [];
        await nextTick();
        refreshSkillViewport();
      } finally {
        skillLoading.value = false;
      }
    };

    const toggleSkill = (skillId: string): void => {
      selectedSkillIds.value = selectedSkillIds.value.includes(skillId)
        ? selectedSkillIds.value.filter((id) => id !== skillId)
        : [...selectedSkillIds.value, skillId];
    };

    const goAssistant = (): void => {
      try {
        sessionStorage.setItem(
          WORKBENCH_ASSISTANT_DRAFT_STORAGE_KEY,
          JSON.stringify({
            question: question.value.trim(),
            skillIds: selectedSkillIds.value,
            createdAt: Date.now(),
          }),
        );
      } catch {
        message.error("暂无法保存 AI 草稿，请稍后重试");
        return;
      }

      const search = new URLSearchParams({ hideMenu: "1", fromWorkbench: "1" });
      const path = `/portal/ai-application/assistant?${search.toString()}`;
      publisher.publish(MFRootEventNameEnum.MF_ROOT_TO_APPLICATION, { code: "AI_APPLICATION_CENTE", path });
    };

    const toggleSpeechInput = async (): Promise<void> => {
      if (voiceStatus.value === "starting" || voiceStatus.value === "transcribing") return;
      await speechController.handleClick();
    };

    onUnmounted(() => {
      endSkillScrollbarDrag();
      stopSkillAutoScroll();
      clearSkillScrollbarHideTimer();
      skillResizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void speechController.dispose();
    });

    onMounted(() => {
      skillResizeObserver = new ResizeObserver(refreshSkillViewport);
      if (suggestionsRef.value) {
        skillResizeObserver.observe(suggestionsRef.value);
      }
      document.addEventListener("visibilitychange", handleVisibilityChange);
      void loadSkills();
    });

    return (): JSX.Element => (
      <section class="ai-assistant-entry">
        <img src={robotImage} class="ai-assistant-entry__icon" alt="AI助手" />
        <div class="ai-assistant-entry__body">
          <h2>您好，欢迎使用安全生产管理助手</h2>
          <p>您可以选择安全专家、智能助手、智能应用等业务场景进行提问</p>
          <div
            ref={suggestionsViewportRef}
            class="ai-assistant-entry__suggestions-viewport"
            onMouseenter={handleSkillViewportEnter}
            onMouseleave={handleSkillViewportLeave}
          >
            <div ref={suggestionsRef} class="ai-assistant-entry__suggestions" onScroll={handleSkillScroll}>
              <div class="ai-assistant-entry__suggestions-content">
                {skills.value.map((skill) => (
                  <button
                    class={selectedSkillIds.value.includes(skill.id) && "ai-assistant-entry__suggestion--selected"}
                    type="button"
                    aria-pressed={selectedSkillIds.value.includes(skill.id)}
                    onClick={() => toggleSkill(skill.id)}
                  >
                    {skill.label}
                  </button>
                ))}
                {!skillLoading.value && skills.value.length === 0 && (
                  <span class="ai-assistant-entry__suggestions-empty">暂无可用技能</span>
                )}
              </div>
            </div>
            <div ref={scrollbarTrackRef} class="ai-assistant-entry__scrollbar" onPointerdown={handleScrollbarTrackPointerDown}>
              <div
                ref={scrollbarThumbRef}
                class="ai-assistant-entry__scrollbar-thumb"
                role="slider"
                tabindex={0}
                aria-label="Skills 列表滚动位置"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={0}
                onPointerdown={handleScrollbarThumbPointerDown}
                onKeydown={handleScrollbarThumbKeydown}
              />
            </div>
          </div>
          <div class="ai-assistant-entry__input">
            <Textarea
              class="ai-assistant-entry__input-control"
              v-model:value={question.value}
              placeholder="请输入您的问题"
              autoSize={{ minRows: 3, maxRows: 6 }}
              showCount={false}
              bordered={false}
              allowClear={false}
            />
            <Tooltip
              title={
                voiceStatus.value === "recording"
                  ? "正在录音，点击结束"
                  : voiceStatus.value === "transcribing"
                    ? "正在识别语音"
                    : "语音输入"
              }
            >
              <span
                class={[
                  "ai-assistant-entry__voice",
                  voiceStatus.value === "recording" && "ai-assistant-entry__voice--recording",
                  voiceStatus.value === "starting" && "ai-assistant-entry__voice--pending",
                ]}
                role="button"
                tabindex={0}
                aria-label="语音输入"
                onClick={() => void toggleSpeechInput()}
                onKeydown={(event: KeyboardEvent) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    void toggleSpeechInput();
                  }
                }}
              >
                <WorkbenchIcon iconClass="icon-yuyin" />
              </span>
            </Tooltip>
            <Button type="primary" onClick={() => goAssistant()}>
              <WorkbenchIcon iconClass="icon-a-submitbutton" />
            </Button>
          </div>
        </div>
      </section>
    );
  },
});
