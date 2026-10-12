import { inject, nextTick, onUnmounted, provide, reactive, ref, type ComputedRef, type InjectionKey, type Ref } from "vue";

import { movePanelCard, type PanelCardDropPlacement } from "./move-panel-card";
import { computeCardShift, resolveInsertIndex, PANEL_CARD_GAP } from "./panel-card-shift";

export type PanelCardPosition = "LEFT_PANEL" | "RIGHT_PANEL";

type Identifiable = {
  uuid: string;
};

export type PanelCardDragSession = {
  from: PanelCardPosition;
  uuid: string;
  title: string;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
};

export type PanelCardOverTarget = {
  position: PanelCardPosition;
  uuid: string | null;
  placement: PanelCardDropPlacement;
  insertIndex: number;
  valid: boolean;
};

export type PanelCardInsertLine = {
  top: number;
  valid: boolean;
};

type PanelCardSide = {
  cards: Ref<Identifiable[]>;
  canAccept: ComputedRef<boolean>;
  listEl: Ref<HTMLElement | undefined>;
  cardEls: Map<string, HTMLElement>;
};

type StartPointerDragInput = {
  from: PanelCardPosition;
  uuid: string;
  title: string;
  event: PointerEvent;
  cardEl: HTMLElement;
};

export type PanelCardDragApi = {
  session: Ref<PanelCardDragSession | null>;
  pointer: { x: number; y: number };
  over: Ref<PanelCardOverTarget | null>;
  register: <T extends Identifiable>(
    position: PanelCardPosition,
    cards: Ref<T[]>,
    canAccept: ComputedRef<boolean>,
    listEl: Ref<HTMLElement | undefined>,
  ) => void;
  bindCardEl: (position: PanelCardPosition, uuid: string, el: HTMLElement | null) => void;
  startPointerDrag: (input: StartPointerDragInput) => void;
  cardShift: (position: PanelCardPosition, uuid: string, cardIndex: number) => number;
  insertLine: (position: PanelCardPosition) => PanelCardInsertLine | null;
  isOriginAway: (position: PanelCardPosition) => boolean;
};

export const PANEL_CARD_DRAG_KEY: InjectionKey<PanelCardDragApi> = Symbol("panel-card-drag");

const SCROLL_EDGE = 48;
const SCROLL_SPEED = 16;
const FLIP_MS = 260;
const INSERT_HYSTERESIS = 10;
const FLIP_EASING = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const BODY_DRAGGING_CLASS = "panel-card-dragging";

type LayoutBox = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

const layoutBox = (el: HTMLElement): LayoutBox => {
  const rect = el.getBoundingClientRect();
  const raw = getComputedStyle(el).transform;
  if (!raw || raw === "none") {
    return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
  }
  const matrix = new DOMMatrixReadOnly(raw);
  return {
    top: rect.top - matrix.m42,
    bottom: rect.bottom - matrix.m42,
    left: rect.left - matrix.m41,
    right: rect.right - matrix.m41,
  };
};

const sameOver = (current: PanelCardOverTarget | null, next: PanelCardOverTarget | null): boolean => {
  if (!current && !next) {
    return true;
  }
  if (!current || !next) {
    return false;
  }
  return current.position === next.position && current.insertIndex === next.insertIndex && current.valid === next.valid;
};

const playFlip = (prev: Map<string, DOMRect>, sides: Map<PanelCardPosition, PanelCardSide>): void => {
  for (const side of sides.values()) {
    for (const [uuid, el] of side.cardEls.entries()) {
      const nextRect = el.getBoundingClientRect();
      const prevRect = prev.get(uuid);
      if (!prevRect) {
        el.animate(
          [
            { opacity: 0, transform: "translateY(-12px) scale(0.98)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: FLIP_MS, easing: FLIP_EASING },
        );
        continue;
      }
      const dx = prevRect.left - nextRect.left;
      const dy = prevRect.top - nextRect.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
        continue;
      }
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: FLIP_MS, easing: FLIP_EASING });
    }
  }
};

export const createPanelCardDrag = (): PanelCardDragApi => {
  const session = ref<PanelCardDragSession | null>(null);
  const pointer = reactive({ x: 0, y: 0 });
  const over = ref<PanelCardOverTarget | null>(null);
  const sides = new Map<PanelCardPosition, PanelCardSide>();
  let scrollRaf = 0;
  let lastPointerY = 0;

  const stopScrollLoop = (): void => {
    if (scrollRaf) {
      cancelAnimationFrame(scrollRaf);
      scrollRaf = 0;
    }
  };

  const scrollNearEdge = (): void => {
    const y = lastPointerY;
    for (const side of sides.values()) {
      const list = side.listEl.value;
      const scroller = list?.closest("[data-panel-scroll]");
      if (!(scroller instanceof HTMLElement)) {
        continue;
      }
      const rect = scroller.getBoundingClientRect();
      if (y < rect.top || y > rect.bottom) {
        continue;
      }
      if (y < rect.top + SCROLL_EDGE) {
        scroller.scrollTop -= SCROLL_SPEED;
      } else if (y > rect.bottom - SCROLL_EDGE) {
        scroller.scrollTop += SCROLL_SPEED;
      }
    }
  };

  const tickScroll = (): void => {
    if (!session.value) {
      stopScrollLoop();
      return;
    }
    scrollNearEdge();
    const next = hitTest(pointer.x, lastPointerY);
    if (!sameOver(over.value, next)) {
      over.value = next;
    }
    scrollRaf = requestAnimationFrame(tickScroll);
  };

  const hitTest = (x: number, y: number): PanelCardOverTarget | null => {
    const current = session.value;
    if (!current) {
      return null;
    }
    for (const [position, side] of sides.entries()) {
      const list = side.listEl.value;
      if (!list) {
        continue;
      }
      const scroller = list.closest("[data-panel-scroll]");
      const bounds = scroller instanceof HTMLElement ? scroller.getBoundingClientRect() : list.getBoundingClientRect();
      if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) {
        continue;
      }
      const valid = side.canAccept.value;
      const slots = side.cards.value
        .filter((item) => item.uuid !== current.uuid)
        .map((item) => {
          const el = side.cardEls.get(item.uuid);
          const box = el ? layoutBox(el) : undefined;
          return box ? { uuid: item.uuid, mid: (box.top + box.bottom) / 2, top: box.top, bottom: box.bottom } : undefined;
        })
        .filter((item): item is { uuid: string; mid: number; top: number; bottom: number } => Boolean(item));

      let slotIndex = slots.length;
      for (const [index, slot] of slots.entries()) {
        if (y < slot.mid) {
          slotIndex = index;
          break;
        }
      }

      const nextInsertIndex =
        slotIndex >= slots.length
          ? side.cards.value.length
          : resolveInsertIndex(side.cards.value, slots[slotIndex]?.uuid ?? null, "before");
      const prev = over.value;
      if (prev?.position === position && prev.insertIndex !== nextInsertIndex) {
        const movingUp = nextInsertIndex < prev.insertIndex;
        const boundary = movingUp ? slots[slotIndex]?.mid : slots[Math.max(slotIndex - 1, 0)]?.mid;
        if (boundary !== undefined) {
          if (movingUp && y > boundary - INSERT_HYSTERESIS) {
            return prev;
          }
          if (!movingUp && y < boundary + INSERT_HYSTERESIS) {
            return prev;
          }
        }
      }

      if (slotIndex >= slots.length) {
        return {
          position,
          uuid: null,
          placement: "end",
          insertIndex: nextInsertIndex,
          valid,
        };
      }
      return {
        position,
        uuid: slots[slotIndex]?.uuid ?? null,
        placement: "before",
        insertIndex: nextInsertIndex,
        valid,
      };
    }
    return null;
  };

  const snapshotRects = (): Map<string, DOMRect> => {
    const prev = new Map<string, DOMRect>();
    for (const side of sides.values()) {
      for (const [uuid, el] of side.cardEls.entries()) {
        prev.set(uuid, el.getBoundingClientRect());
      }
    }
    return prev;
  };

  const detachPointer = (): void => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
    document.body.classList.remove(BODY_DRAGGING_CLASS);
    stopScrollLoop();
  };

  const finishDrag = (): void => {
    const current = session.value;
    const target = over.value;
    const prev = snapshotRects();
    session.value = null;
    over.value = null;
    detachPointer();
    if (!current || !target?.valid) {
      return;
    }
    const source = sides.get(current.from);
    const dest = sides.get(target.position);
    if (!source || !dest) {
      return;
    }
    movePanelCard(source.cards.value, dest.cards.value, current.uuid, target.uuid, target.placement);
    void nextTick(() => {
      playFlip(prev, sides);
    });
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!session.value) {
      return;
    }
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    lastPointerY = event.clientY;
    const next = hitTest(event.clientX, event.clientY);
    if (!sameOver(over.value, next)) {
      over.value = next;
    }
  };

  const onPointerUp = (): void => {
    finishDrag();
  };

  const api: PanelCardDragApi = {
    session,
    pointer,
    over,
    register: (position, cards, accept, listEl) => {
      const current = sides.get(position);
      sides.set(position, {
        cards: cards as Ref<Identifiable[]>,
        canAccept: accept,
        listEl,
        cardEls: current?.cardEls ?? new Map<string, HTMLElement>(),
      });
      onUnmounted(() => {
        if (sides.get(position)?.cards === cards) {
          sides.delete(position);
        }
      });
    },
    bindCardEl: (position, uuid, el) => {
      const side = sides.get(position);
      if (!side) {
        return;
      }
      if (el) {
        side.cardEls.set(uuid, el);
      } else {
        side.cardEls.delete(uuid);
      }
    },
    startPointerDrag: ({ from, uuid, title, event, cardEl }) => {
      if (event.button !== 0 || session.value) {
        return;
      }
      event.preventDefault();
      const rect = cardEl.getBoundingClientRect();
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      lastPointerY = event.clientY;
      session.value = {
        from,
        uuid,
        title,
        width: rect.width,
        height: rect.height,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };
      over.value = hitTest(event.clientX, event.clientY) ?? {
        position: from,
        uuid: null,
        placement: "end",
        insertIndex: sides.get(from)?.cards.value.length ?? 0,
        valid: true,
      };
      document.body.classList.add(BODY_DRAGGING_CLASS);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
      stopScrollLoop();
      scrollRaf = requestAnimationFrame(tickScroll);
    },
    cardShift: (position, uuid, cardIndex) => {
      const current = session.value;
      if (!current) {
        return 0;
      }
      const side = sides.get(position);
      if (!side) {
        return 0;
      }
      const sourceIndex = current.from === position ? side.cards.value.findIndex((item) => item.uuid === current.uuid) : -1;
      if (uuid === current.uuid) {
        return 0;
      }
      const hovering = over.value?.position === position && over.value.valid ? over.value : null;
      return computeCardShift({
        cardIndex,
        sourceIndex,
        insertIndex: hovering ? hovering.insertIndex : null,
        itemSize: current.height + PANEL_CARD_GAP,
      });
    },
    insertLine: (position) => {
      const current = session.value;
      const target = over.value;
      if (!current || !target || target.position !== position) {
        return null;
      }
      const side = sides.get(position);
      const list = side?.listEl.value;
      if (!side || !list) {
        return null;
      }
      const listTop = list.getBoundingClientRect().top;
      if (!target.uuid || target.placement === "end") {
        const last = side.cards.value.findLast((item) => item.uuid !== current.uuid);
        const lastEl = last ? side.cardEls.get(last.uuid) : undefined;
        const top = lastEl ? layoutBox(lastEl).bottom - listTop : 36;
        return { top, valid: target.valid };
      }
      const el = side.cardEls.get(target.uuid);
      if (!el) {
        return null;
      }
      const box = layoutBox(el);
      const top = (target.placement === "after" ? box.bottom : box.top) - listTop;
      return { top, valid: target.valid };
    },
    isOriginAway: (position) => {
      const current = session.value;
      const target = over.value;
      return Boolean(current && current.from === position && target && target.position !== position && target.valid);
    },
  };

  onUnmounted(() => {
    detachPointer();
    session.value = null;
    over.value = null;
  });

  return api;
};

export const providePanelCardDrag = (): PanelCardDragApi => {
  const api = createPanelCardDrag();
  provide(PANEL_CARD_DRAG_KEY, api);
  return api;
};

export const usePanelCardDrag = (): PanelCardDragApi => {
  const api = inject(PANEL_CARD_DRAG_KEY);
  if (!api) {
    throw new Error("usePanelCardDrag 必须在 PanelSelect 内使用");
  }
  return api;
};
