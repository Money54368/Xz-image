"use client";

import { ArrowUp, Check, ChevronDown, ImagePlus, LoaderCircle, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type RefObject } from "react";

import { ImageLightbox } from "@/components/image-lightbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ImageConversationMode } from "@/store/image-conversations";
import { cn } from "@/lib/utils";

type ImageComposerProps = {
  mode: ImageConversationMode;
  prompt: string;
  imageCount: string;
  imageSize: string;
  availableQuota: string;
  activeTaskCount: number;
  referenceImages: Array<{ name: string; dataUrl: string }>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onModeChange: (value: ImageConversationMode) => void;
  onPromptChange: (value: string) => void;
  onImageCountChange: (value: string) => void;
  onImageSizeChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  onPickReferenceImage: () => void;
  onReferenceImageChange: (files: File[]) => void | Promise<void>;
  onRemoveReferenceImage: (index: number) => void;
};

export function ImageComposer({
  mode,
  prompt,
  imageCount,
  imageSize,
  availableQuota,
  activeTaskCount,
  referenceImages,
  textareaRef,
  fileInputRef,
  onModeChange,
  onPromptChange,
  onImageCountChange,
  onImageSizeChange,
  onSubmit,
  onPickReferenceImage,
  onReferenceImageChange,
  onRemoveReferenceImage,
}: ImageComposerProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
  const sizeMenuRef = useRef<HTMLDivElement>(null);

  const lightboxImages = useMemo(
    () => referenceImages.map((image, index) => ({ id: `${image.name}-${index}`, src: image.dataUrl })),
    [referenceImages],
  );

  const imageSizeOptions =
    mode === "edit"
      ? [
          { value: "", label: "跟随原图" },
          { value: "1:1", label: "1:1（1024x1024）" },
        ]
      : [
          { value: "", label: "跟随原图" },
          { value: "1:1", label: "1:1（1024x1024）" },
          { value: "16:9", label: "16:9（1824x1024）" },
          { value: "9:16", label: "9:16（1024x1824）" },
        ];

  const imageSizeLabel = imageSizeOptions.find((option) => option.value === imageSize)?.label || "跟随原图";

  useEffect(() => {
    if (!isSizeMenuOpen) {
      return;
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (!sizeMenuRef.current?.contains(event.target as Node)) {
        setIsSizeMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isSizeMenuOpen]);

  const handleTextareaPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(event.clipboardData.items || []);
    const hasImageItem = items.some((item) => item.type.startsWith("image/"));
    if (!hasImageItem) {
      return;
    }

    const imageFiles = Array.from(event.clipboardData.files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      return;
    }

    event.preventDefault();
    void onReferenceImageChange(imageFiles);
  };

  return (
    <div className="shrink-0 flex justify-center">
      <div className="w-full max-w-[820px] xl:max-w-[860px]">
        {mode === "edit" && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              void onReferenceImageChange(Array.from(event.target.files || []));
            }}
          />
        )}

        {mode === "edit" && referenceImages.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2 px-1">
            {referenceImages.map((image, index) => (
              <div key={`${image.name}-${index}`} className="relative size-16">
                <button
                  type="button"
                  onClick={() => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                  className="group size-16 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 transition hover:border-stone-300"
                  aria-label={`预览参考图 ${image.name || index + 1}`}
                >
                  <img
                    src={image.dataUrl}
                    alt={image.name || `参考图 ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveReferenceImage(index);
                  }}
                  className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:text-stone-800"
                  aria-label={`移除参考图 ${image.name || index + 1}`}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="rounded-[28px] border border-stone-200 bg-white p-3 shadow-[0_20px_50px_rgba(28,25,23,0.06)] sm:p-4">
          <ImageLightbox
            images={lightboxImages}
            currentIndex={lightboxIndex}
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
            onIndexChange={setLightboxIndex}
          />

          <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 sm:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {mode === "edit" && (
              <Button
                type="button"
                variant="outline"
                className="h-10 shrink-0 rounded-full border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 shadow-none"
                onClick={onPickReferenceImage}
              >
                <ImagePlus className="size-4" />
                <span>{referenceImages.length > 0 ? "继续添加参考图" : "上传参考图"}</span>
              </Button>
            )}

            <div
              ref={sizeMenuRef}
              className="relative shrink-0 rounded-full border border-stone-200 bg-white px-3 py-2 text-sm"
            >
              <button
                type="button"
                className="flex items-center justify-between gap-3 bg-transparent text-left font-medium text-stone-700"
                onClick={() => setIsSizeMenuOpen((open) => !open)}
              >
                <span className="whitespace-nowrap">比例 {imageSizeLabel}</span>
                <ChevronDown className={cn("size-4 shrink-0 opacity-60 transition", isSizeMenuOpen && "rotate-180")} />
              </button>
              {isSizeMenuOpen ? (
                <div className="absolute bottom-[calc(100%+10px)] left-0 z-50 min-w-[220px] overflow-hidden rounded-3xl border border-white/80 bg-white p-2 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
                  {imageSizeOptions.map((option) => {
                    const active = option.value === imageSize;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-stone-100",
                          active && "bg-stone-100 font-medium text-stone-950",
                        )}
                        onClick={() => {
                          onImageSizeChange(option.value);
                          setIsSizeMenuOpen(false);
                        }}
                      >
                        <span>{option.label}</span>
                        {active ? <Check className="size-4" /> : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2">
              <span className="text-sm font-medium text-stone-700">张数</span>
              <Input
                type="number"
                min="1"
                max="10"
                step="1"
                value={imageCount}
                onChange={(event) => onImageCountChange(event.target.value)}
                className="h-7 w-[44px] border-0 bg-transparent px-0 text-center text-sm font-medium text-stone-700 shadow-none focus-visible:ring-0"
              />
            </div>

            <ModeButton active={mode === "generate"} onClick={() => onModeChange("generate")}>
              文生图
            </ModeButton>
            <ModeButton active={mode === "edit"} onClick={() => onModeChange("edit")}>
              图生图
            </ModeButton>
          </div>

          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            onPaste={handleTextareaPaste}
            placeholder={
              mode === "edit"
                ? "描述你希望如何修改这张参考图，也可以直接粘贴图片"
                : "输入你想生成的画面，也可以直接粘贴图片开始图生图"
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void onSubmit();
              }
            }}
            className="min-h-[120px] rounded-[24px] border-0 bg-transparent px-3 py-3 text-base leading-7 shadow-none focus-visible:ring-0 sm:min-h-[148px] sm:px-5"
          />

          <div className="mt-3 hidden flex-col gap-3 sm:flex">
            <div className="flex flex-wrap items-center gap-2">
              {mode === "edit" && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-full border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 shadow-none"
                  onClick={onPickReferenceImage}
                >
                  <ImagePlus className="size-4" />
                  <span>{referenceImages.length > 0 ? "继续添加参考图" : "上传参考图"}</span>
                </Button>
              )}
              {activeTaskCount > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                  <LoaderCircle className="size-3 animate-spin" />
                  {activeTaskCount} 个任务处理中
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div
                  ref={sizeMenuRef}
                  className="relative min-w-[160px] rounded-full border border-stone-200 bg-white px-3 py-2 text-sm"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 bg-transparent text-left font-medium text-stone-700"
                    onClick={() => setIsSizeMenuOpen((open) => !open)}
                  >
                    <span className="min-w-0 truncate">比例 {imageSizeLabel}</span>
                    <ChevronDown className={cn("size-4 shrink-0 opacity-60 transition", isSizeMenuOpen && "rotate-180")} />
                  </button>
                  {isSizeMenuOpen ? (
                    <div className="absolute bottom-[calc(100%+10px)] left-0 z-50 w-full min-w-[220px] overflow-hidden rounded-3xl border border-white/80 bg-white p-2 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
                      {imageSizeOptions.map((option) => {
                        const active = option.value === imageSize;
                        return (
                          <button
                            key={option.label}
                            type="button"
                            className={cn(
                              "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-stone-100",
                              active && "bg-stone-100 font-medium text-stone-950",
                            )}
                            onClick={() => {
                              onImageSizeChange(option.value);
                              setIsSizeMenuOpen(false);
                            }}
                          >
                            <span>{option.label}</span>
                            {active ? <Check className="size-4" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2">
                  <span className="text-sm font-medium text-stone-700">张数</span>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    step="1"
                    value={imageCount}
                    onChange={(event) => onImageCountChange(event.target.value)}
                    className="h-7 w-[44px] border-0 bg-transparent px-0 text-center text-sm font-medium text-stone-700 shadow-none focus-visible:ring-0"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <ModeButton active={mode === "generate"} onClick={() => onModeChange("generate")}>
                    文生图
                  </ModeButton>
                  <ModeButton active={mode === "edit"} onClick={() => onModeChange("edit")}>
                    图生图
                  </ModeButton>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void onSubmit()}
                  disabled={!prompt.trim() || (mode === "edit" && referenceImages.length === 0)}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-stone-950 text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                  aria-label={mode === "edit" ? "编辑图片" : "生成图片"}
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-end sm:hidden">
            <button
              type="button"
              onClick={() => void onSubmit()}
              disabled={!prompt.trim() || (mode === "edit" && referenceImages.length === 0)}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-stone-950 text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
              aria-label={mode === "edit" ? "编辑图片" : "生成图片"}
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-2 text-sm font-medium transition",
        active ? "bg-stone-950 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200",
      )}
    >
      {children}
    </button>
  );
}
