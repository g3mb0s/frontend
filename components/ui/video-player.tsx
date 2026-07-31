"use client";

import Hls from "hls.js";
import {
  MediaCaptionButton,
  MediaCaptions,
  MediaFullscreenButton,
  MediaGesture,
  MediaMenu,
  MediaMenuButton,
  MediaMenuItems,
  MediaMuteButton,
  MediaOutlet,
  MediaPIPButton,
  MediaPlayButton,
  MediaPlayer,
  MediaTime,
  MediaTimeSlider,
  MediaToggleButton,
  MediaVolumeSlider,
} from "@vidstack/react";
import {
  isHLSProvider,
  type MediaPlayerElement,
} from "vidstack";
import { forwardRef, memo, useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";

export type VideoPlayerElement = MediaPlayerElement & {
  currentTime: number;
  style: CSSStyleDeclaration;
  setAttribute(name: string, value: string): void;
  play(): Promise<void>;
  pause(): Promise<void>;
};

type ClipRange = {
  start: number;
  end: number;
};

type VideoPlayerProps = {
  src?: string | null;
  title: string;
  playerRef: RefObject<VideoPlayerElement | null>;
  russianSubtitles?: string | null;
  englishSubtitles?: string | null;
  clipRange?: ClipRange;
  showAddClipButton?: boolean;
  onAddCurrentClip?: () => void;
  onError: (message: string) => void;
  onTimeUpdate?: (player: VideoPlayerElement) => void;
};

type CaptionSettings = {
  fontSize: number;
  controlsOffset: number;
  color: "white" | "yellow" | "cyan";
  background: "dark" | "translucent" | "transparent";
  outline: "none" | "normal" | "strong";
};

const CAPTION_SETTINGS_STORAGE_KEY = "gembos:video-player:caption-settings";
const DEFAULT_CAPTION_SETTINGS: CaptionSettings = {
  fontSize: 24,
  controlsOffset: 12,
  color: "white",
  background: "dark",
  outline: "normal",
};

export const VideoPlayer = memo(function VideoPlayer({
  src,
  title,
  playerRef,
  russianSubtitles,
  englishSubtitles,
  clipRange,
  showAddClipButton = false,
  onAddCurrentClip,
  onError,
  onTimeUpdate,
}: VideoPlayerProps) {
  const clipSliderRef = useRef<HTMLInputElement>(null);
  const clipCurrentTimeRef = useRef<HTMLSpanElement>(null);
  const clipInitializedRef = useRef(false);
  const captionSettingsRef = useRef<CaptionSettings>(DEFAULT_CAPTION_SETTINGS);
  const captionFontSizeInputRef = useRef<HTMLInputElement>(null);
  const captionFontSizeValueRef = useRef<HTMLOutputElement>(null);
  const captionVerticalOffsetInputRef = useRef<HTMLInputElement>(null);
  const captionVerticalOffsetValueRef = useRef<HTMLOutputElement>(null);
  const captionColorSelectRef = useRef<HTMLSelectElement>(null);
  const captionBackgroundSelectRef = useRef<HTMLSelectElement>(null);
  const captionOutlineSelectRef = useRef<HTMLSelectElement>(null);
  const source = useMemo(
    () => src ? { src, type: "application/vnd.apple.mpegurl" } : undefined,
    [src],
  );
  const clipDuration = clipRange ? Math.max(0, clipRange.end - clipRange.start) : 0;

  useEffect(() => {
    const settings = readCaptionSettings();
    captionSettingsRef.current = settings;
    applyCaptionSettings(playerRef.current, settings);
    if (captionFontSizeInputRef.current) {
      captionFontSizeInputRef.current.value = String(settings.fontSize);
    }
    if (captionFontSizeValueRef.current) {
      captionFontSizeValueRef.current.value = `${settings.fontSize}px`;
    }
    if (captionVerticalOffsetInputRef.current) {
      captionVerticalOffsetInputRef.current.value = String(settings.controlsOffset);
    }
    if (captionVerticalOffsetValueRef.current) {
      captionVerticalOffsetValueRef.current.value = `${settings.controlsOffset}px`;
    }
    if (captionColorSelectRef.current) captionColorSelectRef.current.value = settings.color;
    if (captionBackgroundSelectRef.current) captionBackgroundSelectRef.current.value = settings.background;
    if (captionOutlineSelectRef.current) captionOutlineSelectRef.current.value = settings.outline;
  }, [playerRef]);

  function initializeClip() {
    const player = playerRef.current;
    if (!player || !clipRange) return;
    const outsideClip = player.currentTime < clipRange.start || player.currentTime >= clipRange.end;
    if (!clipInitializedRef.current || outsideClip) {
      player.currentTime = clipRange.start;
    }
    clipInitializedRef.current = true;
    updateClipProgress(0);
  }

  function updateClipProgress(relativeTime: number) {
    if (clipSliderRef.current) clipSliderRef.current.value = String(relativeTime);
    if (clipCurrentTimeRef.current) {
      clipCurrentTimeRef.current.textContent = formatTime(relativeTime);
    }
  }

  function handleTimeUpdate() {
    const player = playerRef.current;
    if (!player) return;

    if (clipRange) {
      const relativeTime = Math.min(
        clipDuration,
        Math.max(0, player.currentTime - clipRange.start),
      );
      updateClipProgress(relativeTime);
      if (player.currentTime >= clipRange.end) {
        void player.pause();
        player.currentTime = clipRange.end;
        updateClipProgress(clipDuration);
      }
    }

    onTimeUpdate?.(player);
  }

  function handlePlay() {
    const player = playerRef.current;
    if (!player || !clipRange) return;
    if (player.currentTime < clipRange.start || player.currentTime >= clipRange.end - 0.05) {
      player.currentTime = clipRange.start;
      updateClipProgress(0);
    }
  }

  function updateCaptionSetting<Key extends keyof CaptionSettings>(
    key: Key,
    value: CaptionSettings[Key],
  ) {
    const settings = { ...captionSettingsRef.current, [key]: value };
    captionSettingsRef.current = settings;
    applyCaptionSettings(playerRef.current, settings);
    window.localStorage.setItem(CAPTION_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }

  return (
    <MediaPlayer
      ref={playerRef}
      src={source}
      title={title}
      crossorigin="anonymous"
      load={clipRange ? "eager" : "visible"}
      preload={clipRange ? "auto" : "metadata"}
      playsinline
      onCanPlay={initializeClip}
      onLoadedMetadata={initializeClip}
      onError={() => onError("Не удалось воспроизвести HLS-поток.")}
      onPlay={handlePlay}
      onProviderChange={(event: { detail: unknown }) => {
        if (isHLSProvider(event.detail)) event.detail.library = Hls;
      }}
      onTimeUpdate={handleTimeUpdate}
      className="gembos-video-player group block aspect-video w-full overflow-hidden rounded-2xl bg-black text-white shadow-lg data-[fullscreen]:h-full data-[fullscreen]:rounded-none"
      data-caption-color={DEFAULT_CAPTION_SETTINGS.color}
      data-caption-background={DEFAULT_CAPTION_SETTINGS.background}
      data-caption-outline={DEFAULT_CAPTION_SETTINGS.outline}
    >
      <MediaOutlet className="block h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-contain">
        {russianSubtitles && (
          <track
            kind="subtitles"
            src={russianSubtitles}
            srcLang="ru"
            label="Русский"
            default
          />
        )}
        {englishSubtitles && (
          <track kind="subtitles" src={englishSubtitles} srcLang="en" label="English" />
        )}
      </MediaOutlet>

      <MediaGesture
        event="pointerup"
        action="toggle:paused"
        className="absolute inset-0 h-full w-full"
      />
      <MediaGesture
        event="dblpointerup"
        action="toggle:fullscreen"
        className="absolute inset-0 h-full w-full"
      />

      <MediaCaptions className="gembos-player-captions" />

      <div className="gembos-player-controls absolute inset-x-0 bottom-0 z-20 bg-black/60 p-[3px] transition-opacity">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <MediaPlayButton className="shrink-0 rounded-full">
            <ControlIcon slot="play" filled><path d="m8 5 11 7-11 7Z" /></ControlIcon>
            <ControlIcon slot="pause" filled><path d="M7 5h4v14H7zM14 5h4v14h-4z" /></ControlIcon>
            <ControlIcon slot="replay">
              <path d="M7 7v5h5" />
              <path d="M7.4 11a6.5 6.5 0 1 1 .9 6.1" />
            </ControlIcon>
          </MediaPlayButton>

          {showAddClipButton && onAddCurrentClip && (
            <MediaToggleButton
              aria-label="Добавить текущий клип для повторения"
              title="Добавить текущий клип для повторения"
              onClick={onAddCurrentClip}
              className="!inline-flex shrink-0 overflow-hidden text-white"
              style={{
                "--media-button-border-radius": "9999px",
                borderRadius: "9999px",
                border: "2px solid #fff",
                backgroundColor: "transparent",
              }}
            >
              <span className="text-2xl font-medium leading-none">+</span>
            </MediaToggleButton>
          )}

          <div className="hidden items-center gap-1 sm:flex">
            <MediaMuteButton className="shrink-0 rounded-full">
              <ControlIcon slot="volume-high">
                <path d="M5 10v4h3l4 4V6L8 10Z" />
                <path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a8 8 0 0 1 0 11" />
              </ControlIcon>
              <ControlIcon slot="volume-low">
                <path d="M5 10v4h3l4 4V6L8 10Z" />
                <path d="M15 9a4 4 0 0 1 0 6" />
              </ControlIcon>
              <ControlIcon slot="volume-muted">
                <path d="M5 10v4h3l4 4V6L8 10Z" />
                <path d="m16 9 5 6M21 9l-5 6" />
              </ControlIcon>
            </MediaMuteButton>
            <MediaVolumeSlider
              aria-label="Громкость"
              className="w-20 [--media-slider-height:32px] [--media-slider-thumb-size:12px] [--media-slider-track-height:4px]"
            />
          </div>

          <div className="min-w-0 flex-1">
            {clipRange ? (
              <input
                ref={clipSliderRef}
                type="range"
                min={0}
                max={clipDuration}
                defaultValue={0}
                step={0.05}
                aria-label="Позиция внутри клипа"
                onInput={(event) => {
                  const player = playerRef.current;
                  if (player) player.currentTime = clipRange.start + Number(event.currentTarget.value);
                }}
                className="h-8 w-full cursor-pointer accent-indigo-400"
              />
            ) : (
              <MediaTimeSlider
                aria-label="Позиция видео"
                className="[--media-slider-height:32px] [--media-slider-thumb-size:13px] [--media-slider-track-fill-bg:#818cf8]"
              />
            )}
          </div>

          <div className="shrink-0 text-xs tabular-nums sm:text-sm">
            {clipRange ? (
              <>
                <span ref={clipCurrentTimeRef}>0:00</span>
                <span className="px-1 text-white/60">/</span>
                <span>{formatTime(clipDuration)}</span>
              </>
            ) : (
              <>
                <MediaTime type="current" />
                <span className="px-1 text-white/60">/</span>
                <MediaTime type="duration" />
              </>
            )}
          </div>

          <MediaCaptionButton className="shrink-0 rounded-full">
            <ControlIcon slot="off">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M10 10a2 2 0 1 0 0 4M17 10a2 2 0 1 0 0 4" />
            </ControlIcon>
            <ControlIcon slot="on" filled>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M10 10a2 2 0 1 0 0 4M17 10a2 2 0 1 0 0 4" className="fill-none stroke-black" />
            </ControlIcon>
          </MediaCaptionButton>

          <MediaMenu>
            <MediaMenuButton
              aria-label="Настройки плеера"
              title="Настройки плеера"
              className="h-10 w-10 shrink-0 rounded-full"
            >
              <ControlIcon>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
              </ControlIcon>
            </MediaMenuButton>
            <MediaMenuItems className="gap-3 text-left text-sm text-white">
              <p className="border-b border-white/15 pb-2 font-semibold">Субтитры</p>
              <SettingRange
                ref={captionFontSizeInputRef}
                valueRef={captionFontSizeValueRef}
                label="Размер"
                min={14}
                max={48}
                step={1}
                defaultValue={DEFAULT_CAPTION_SETTINGS.fontSize}
                onChange={(value) => updateCaptionSetting("fontSize", value)}
              />
              <SettingRange
                ref={captionVerticalOffsetInputRef}
                valueRef={captionVerticalOffsetValueRef}
                label="Высота"
                min={0}
                max={160}
                step={2}
                defaultValue={DEFAULT_CAPTION_SETTINGS.controlsOffset}
                onChange={(value) => updateCaptionSetting("controlsOffset", value)}
              />
              <SettingSelect
                ref={captionColorSelectRef}
                label="Цвет текста"
                defaultValue="white"
                onChange={(value) => updateCaptionSetting("color", value as CaptionSettings["color"])}
                options={[
                  ["white", "Белый"],
                  ["yellow", "Жёлтый"],
                  ["cyan", "Голубой"],
                ]}
              />
              <SettingSelect
                ref={captionBackgroundSelectRef}
                label="Фон"
                defaultValue="dark"
                onChange={(value) => updateCaptionSetting("background", value as CaptionSettings["background"])}
                options={[
                  ["dark", "Тёмный"],
                  ["translucent", "Полупрозрачный"],
                  ["transparent", "Без фона"],
                ]}
              />
              <SettingSelect
                ref={captionOutlineSelectRef}
                label="Контур"
                defaultValue="normal"
                onChange={(value) => updateCaptionSetting("outline", value as CaptionSettings["outline"])}
                options={[
                  ["none", "Нет"],
                  ["normal", "Обычный"],
                  ["strong", "Сильный"],
                ]}
              />
            </MediaMenuItems>
          </MediaMenu>

          <MediaPIPButton className="hidden shrink-0 rounded-full sm:inline-flex">
            <ControlIcon slot="enter">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <rect x="12" y="11" width="7" height="5" rx="1" />
            </ControlIcon>
            <ControlIcon slot="exit">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m13 15 5-5M14 10h4v4" />
            </ControlIcon>
          </MediaPIPButton>

          <MediaFullscreenButton className="shrink-0 rounded-full">
            <ControlIcon slot="enter">
              <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
            </ControlIcon>
            <ControlIcon slot="exit">
              <path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
            </ControlIcon>
          </MediaFullscreenButton>
        </div>
      </div>
    </MediaPlayer>
  );
});

function ControlIcon({
  slot,
  children,
  filled = false,
}: {
  slot?: string;
  children: ReactNode;
  filled?: boolean;
}) {
  return (
    <svg
      slot={slot}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const SettingSelect = forwardRef<HTMLSelectElement, {
  label: string;
  defaultValue: string;
  options: Array<[value: string, label: string]>;
  onChange: (value: string) => void;
}>(function SettingSelect({
  label,
  defaultValue,
  options,
  onChange,
}, ref) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs text-white/70">{label}</span>
      <select
        ref={ref}
        defaultValue={defaultValue}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-white/15 bg-slate-900 px-2 py-1.5 text-sm text-white outline-none focus:border-indigo-400"
      >
        {options.map(([value, optionLabel]) => (
          <option key={value} value={value}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
});

const SettingRange = forwardRef<HTMLInputElement, {
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  valueRef: RefObject<HTMLOutputElement | null>;
  onChange: (value: number) => void;
}>(function SettingRange({
  label,
  min,
  max,
  step,
  defaultValue,
  valueRef,
  onChange,
}, ref) {
  return (
    <label className="grid gap-1.5">
      <span className="flex items-center justify-between gap-3 text-xs text-white/70">
        {label}
        <output ref={valueRef}>{defaultValue}px</output>
      </span>
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        onInput={(event) => {
          const value = Number(event.currentTarget.value);
          if (valueRef.current) valueRef.current.value = `${value}px`;
          onChange(value);
        }}
        className="h-5 w-full cursor-pointer accent-indigo-400"
      />
    </label>
  );
});

function applyCaptionSettings(
  player: VideoPlayerElement | null,
  settings: CaptionSettings,
) {
  if (!player) return;
  player.style.setProperty("--media-cue-font-size", `${settings.fontSize}px`);
  player.style.setProperty("--media-large-fullscreen-cue-font-size", `${settings.fontSize}px`);
  player.style.setProperty("--gembos-caption-offset", `${settings.controlsOffset}px`);
  player.setAttribute("data-caption-color", settings.color);
  player.setAttribute("data-caption-background", settings.background);
  player.setAttribute("data-caption-outline", settings.outline);
}

function readCaptionSettings(): CaptionSettings {
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(CAPTION_SETTINGS_STORAGE_KEY) ?? "{}",
    ) as Partial<CaptionSettings> & { size?: string; verticalOffset?: number };
    return {
      fontSize: readFontSize(saved.fontSize, saved.size),
      controlsOffset: readNumberInRange(
        saved.controlsOffset ?? migrateLegacyOffset(saved.verticalOffset),
        0,
        160,
        DEFAULT_CAPTION_SETTINGS.controlsOffset,
      ),
      color: isOneOf(saved.color, ["white", "yellow", "cyan"])
        ? saved.color
        : DEFAULT_CAPTION_SETTINGS.color,
      background: isOneOf(saved.background, ["dark", "translucent", "transparent"])
        ? saved.background
        : DEFAULT_CAPTION_SETTINGS.background,
      outline: isOneOf(saved.outline, ["none", "normal", "strong"])
        ? saved.outline
        : DEFAULT_CAPTION_SETTINGS.outline,
    };
  } catch {
    return DEFAULT_CAPTION_SETTINGS;
  }
}

function migrateLegacyOffset(value: number | undefined) {
  return typeof value === "number" ? Math.max(0, value - 80) : undefined;
}

function readFontSize(value: number | undefined, legacyValue: string | undefined) {
  if (typeof value === "number") return readNumberInRange(value, 14, 48, 24);
  const legacySizes: Record<string, number> = {
    small: 18,
    normal: 24,
    large: 32,
    "extra-large": 40,
  };
  return legacyValue && legacySizes[legacyValue]
    ? legacySizes[legacyValue]
    : DEFAULT_CAPTION_SETTINGS.fontSize;
}

function readNumberInRange(
  value: number | undefined,
  min: number,
  max: number,
  fallback: number,
) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.round(value)))
    : fallback;
}

function isOneOf<Value extends string>(
  value: string | undefined,
  variants: readonly Value[],
): value is Value {
  return value !== undefined && variants.includes(value as Value);
}

function formatTime(secondsValue: number) {
  const totalSeconds = Math.max(0, Math.floor(secondsValue));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const shortTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  return hours > 0 ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}` : shortTime;
}
