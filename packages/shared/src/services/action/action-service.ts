import type { ActionBinding, ActionId, ActionService } from "./interface";

// J/K/Space 等のベアキー（修飾子なし）はテキスト入力中に無効化する
const BARE_KEYS_DISABLED_DURING_TEXT_INPUT = new Set(["j", "k", " "]);

interface ParsedShortcut {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
}

function isMac(): boolean {
  return navigator.platform.startsWith("Mac");
}

function parseShortcut(shortcut: string): ParsedShortcut {
  const parts = shortcut.split("+");
  let ctrl = false;
  let shift = false;
  let alt = false;
  let key = "";

  for (const part of parts) {
    const lower = part.toLowerCase();
    if (lower === "ctrl" || lower === "cmd") {
      ctrl = true;
    } else if (lower === "shift") {
      shift = true;
    } else if (lower === "alt") {
      alt = true;
    } else {
      key = lower === "space" ? " " : lower;
    }
  }

  return { key, ctrl, shift, alt };
}

function isTextInputFocused(): boolean {
  const el = document.activeElement;
  if (el == null) {
    return false;
  }
  if (el instanceof HTMLInputElement) {
    const type = el.type;
    return (
      type === "text" ||
      type === "search" ||
      type === "url" ||
      type === "tel" ||
      type === "password"
    );
  }
  if (el instanceof HTMLTextAreaElement) {
    return true;
  }
  if (el instanceof HTMLElement && el.isContentEditable) {
    return true;
  }
  return false;
}

function matchesShortcut(
  event: KeyboardEvent,
  parsed: ParsedShortcut,
): boolean {
  const eventKey = event.key === " " ? " " : event.key.toLowerCase();
  if (eventKey !== parsed.key) {
    return false;
  }
  const useMeta = isMac();
  const ctrlMatch = useMeta
    ? event.metaKey === parsed.ctrl
    : event.ctrlKey === parsed.ctrl;
  if (!ctrlMatch) {
    return false;
  }
  if (event.shiftKey !== parsed.shift) {
    return false;
  }
  if (event.altKey !== parsed.alt) {
    return false;
  }
  return true;
}

class ActionServiceImpl implements ActionService {
  private readonly bindings: Map<ActionId, ActionBinding> = new Map();
  private readonly listener: (event: KeyboardEvent) => void;

  constructor() {
    this.listener = (event: KeyboardEvent) => {
      this.handleKeydown(event);
    };
  }

  register(binding: ActionBinding): void {
    this.bindings.set(binding.id, binding);
  }

  unregister(id: ActionId): void {
    this.bindings.delete(id);
  }

  execute(id: ActionId): void {
    const binding = this.bindings.get(id);
    if (binding == null) {
      throw new Error(`アクション "${id}" が登録されていません`);
    }
    if (!binding.enabled()) {
      return;
    }
    binding.handler();
  }

  startListening(): void {
    document.addEventListener("keydown", this.listener);
  }

  stopListening(): void {
    document.removeEventListener("keydown", this.listener);
  }

  private handleKeydown(event: KeyboardEvent): void {
    const textInputFocused = isTextInputFocused();

    for (const binding of this.bindings.values()) {
      if (!binding.enabled()) {
        continue;
      }
      const parsed = parseShortcut(binding.shortcut);
      if (!matchesShortcut(event, parsed)) {
        continue;
      }
      // ベアキーはテキスト入力中に無効化
      const isBareKey = !parsed.ctrl && !parsed.shift && !parsed.alt;
      if (
        isBareKey &&
        textInputFocused &&
        BARE_KEYS_DISABLED_DURING_TEXT_INPUT.has(parsed.key)
      ) {
        continue;
      }
      event.preventDefault();
      binding.handler();
      return;
    }
  }
}

export const actionService: ActionService = new ActionServiceImpl();
