"use client";

import { LoaderCircle, MessageSquarePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getImageConversationStats, type ImageConversation } from "@/store/image-conversations";

type ImageSidebarProps = {
  conversations: ImageConversation[];
  isLoadingHistory: boolean;
  selectedConversationId: string | null;
  onCreateDraft: () => void;
  onClearHistory: () => void | Promise<void>;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void | Promise<void>;
  formatConversationTime: (value: string) => string;
  hideActionButtons?: boolean;
};

export function ImageSidebar({
  conversations,
  isLoadingHistory,
  selectedConversationId,
  onCreateDraft,
  onClearHistory,
  onSelectConversation,
  onDeleteConversation,
  formatConversationTime,
  hideActionButtons = false,
}: ImageSidebarProps) {
  return (
    <aside className="min-h-0">
      <div className="flex h-full min-h-0 flex-col gap-3 py-2">
        {!hideActionButtons && (
          <div className="flex items-center gap-2">
            <Button className="h-11 flex-1 rounded-2xl bg-stone-950 text-white hover:bg-stone-800" onClick={onCreateDraft}>
              <MessageSquarePlus className="size-4" />
              新建对话
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-2xl border-stone-200 bg-white px-3 text-stone-600 hover:bg-stone-50"
              onClick={() => void onClearHistory()}
              disabled={conversations.length === 0}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {isLoadingHistory ? (
            <div className="flex items-center gap-2 px-2 py-3 text-sm text-stone-500">
              <LoaderCircle className="size-4 animate-spin" />
              正在读取会话记录
            </div>
          ) : conversations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-white/60 px-3 py-4 text-sm leading-7 text-stone-500">
              还没有图片记录，输入提示词后会在这里显示。
            </div>
          ) : (
            conversations.map((conversation) => {
              const active = conversation.id === selectedConversationId;
              const stats = getImageConversationStats(conversation);

              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative rounded-2xl border px-3 py-3 transition",
                    active
                      ? "border-stone-900 bg-stone-950 text-white"
                      : "border-stone-200 bg-white/70 text-stone-800 hover:border-stone-300 hover:bg-white",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelectConversation(conversation.id)}
                    className="block w-full pr-8 text-left"
                  >
                    <div className="truncate text-sm font-semibold">
                      <span className="truncate">{conversation.title}</span>
                    </div>
                    <div className={cn("mt-1 text-xs", active ? "text-white/70" : "text-stone-400")}>
                      {conversation.turns.length} 轮 · {formatConversationTime(conversation.updatedAt)}
                    </div>
                    {stats.running > 0 || stats.queued > 0 ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                        {stats.running > 0 ? (
                          <span className={cn("rounded-full px-2 py-1", active ? "bg-white/15 text-white" : "bg-blue-50 text-blue-600")}>
                            处理中 {stats.running}
                          </span>
                        ) : null}
                        {stats.queued > 0 ? (
                          <span className={cn("rounded-full px-2 py-1", active ? "bg-white/15 text-white" : "bg-amber-50 text-amber-700")}>
                            排队 {stats.queued}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </button>

                  <button
                    type="button"
                    onClick={() => void onDeleteConversation(conversation.id)}
                    className={cn(
                      "absolute top-3 right-2 inline-flex size-7 items-center justify-center rounded-md transition",
                      active
                        ? "text-white/70 hover:bg-white/10 hover:text-white"
                        : "text-stone-400 opacity-0 hover:bg-stone-100 hover:text-rose-500 group-hover:opacity-100",
                    )}
                    aria-label="删除会话"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
