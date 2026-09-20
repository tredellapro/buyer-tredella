"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { createClient, type Client } from "graphql-ws";
import Dropdown from "@/components/Dropdown";
import {
  gqlAuth,
  GRAPHQL_WS_URL,
  uploadChatAttachment,
} from "@/lib/graphql";
import { useAuth } from "@/lib/auth";
import {
  CHAT_ATTACHMENT_ACCEPT,
  fileKind,
  formatBytes,
  isImage,
  parseAttachment,
  serialiseAttachment,
  type ChatAttachment,
} from "@/lib/chat-attachment";
import type { ApiConversation, ApiMessage } from "@/lib/types";

const MESSAGE_FIELDS = `id text createdAt isMine attachment sender { name }`;

const FILTERS = [
  { value: "All", label: "All" },
  { value: "Unread", label: "Unread" },
  { value: "Sellers", label: "Sellers" },
  { value: "Support", label: "Support" },
];

const EMOJI = [
  "👍", "🙏", "👌", "🙂", "😊", "😀", "😅", "🤝",
  "📦", "🚚", "💰", "📄", "✅", "❗", "❓", "🔥",
];

const isSupport = (c: ApiConversation) => c.type === "BUYER_ADMIN";

const partyName = (c: ApiConversation) =>
  isSupport(c) ? "Support Chat" : (c.seller?.name ?? "Seller");

/** "01:15 PM", written out rather than via toLocaleTimeString. */
function clockTime(iso: string) {
  const date = new Date(iso);
  const hours = date.getHours();
  const suffix = hours < 12 ? "AM" : "PM";
  const twelve = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(twelve).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")} ${suffix}`;
}

/* The API carries no presence, so rather than a green dot that always claims
   someone is online, the dot reports recency from the last message. */
type Presence = "ACTIVE" | "RECENT" | "AWAY";

function presenceOf(c: ApiConversation): Presence {
  const last = c.lastMessage?.createdAt ?? c.updatedAt;
  const minutes = (Date.now() - new Date(last).getTime()) / 60000;
  if (minutes < 5) return "ACTIVE";
  if (minutes < 60) return "RECENT";
  return "AWAY";
}

const PRESENCE_DOT: Record<Presence, string> = {
  ACTIVE: "bg-green-500",
  RECENT: "bg-amber-400",
  AWAY: "bg-line",
};

const PRESENCE_LABEL: Record<Presence, string> = {
  ACTIVE: "Active Now",
  RECENT: "Active recently",
  AWAY: "Away",
};

function Avatar({
  conversation,
  size = "h-10 w-10 text-sm",
  showDot = true,
}: {
  conversation: ApiConversation;
  size?: string;
  showDot?: boolean;
}) {
  const support = isSupport(conversation);

  return (
    <span className="relative shrink-0">
      <span
        aria-hidden="true"
        className={`flex ${size} items-center justify-center rounded-full font-bold ${
          support ? "bg-heading text-white" : "bg-primary-light text-primary"
        }`}
      >
        {support ? "T" : partyName(conversation).charAt(0).toUpperCase()}
      </span>
      {showDot && (
        <span
          aria-hidden="true"
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
            PRESENCE_DOT[presenceOf(conversation)]
          }`}
        />
      )}
    </span>
  );
}

function AttachmentCard({
  attachment,
  mine,
}: {
  attachment: ChatAttachment;
  mine: boolean;
}) {
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-opacity hover:opacity-90 ${
        mine ? "bg-primary text-white" : "bg-paper text-heading"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
          mine ? "bg-white/15" : "bg-white"
        }`}
      >
        {isImage(attachment) ? "IMG" : "PDF"}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold">
          {attachment.name}
        </span>
        <span className={`block text-[10px] ${mine ? "text-white/70" : "text-muted"}`}>
          {fileKind(attachment)}
          {attachment.sizeBytes !== null &&
            ` · ${formatBytes(attachment.sizeBytes)}`}
        </span>
      </span>
    </a>
  );
}

/** Consecutive messages from one person, drawn as a block with one timestamp. */
type MessageGroup = { mine: boolean; messages: ApiMessage[] };

function groupMessages(messages: ApiMessage[]): MessageGroup[] {
  return messages.reduce<MessageGroup[]>((groups, message) => {
    const last = groups[groups.length - 1];
    if (last && last.mine === message.isMine) last.messages.push(message);
    else groups.push({ mine: message.isMine, messages: [message] });
    return groups;
  }, []);
}

function Messages() {
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(
    useSearchParams().get("c")
  );
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [pending, setPending] = useState<ChatAttachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [supportBusy, setSupportBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const wsRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadConversations = useCallback(async () => {
    const data = await gqlAuth<{ getConversations: ApiConversation[] }>(
      `query {
        getConversations {
          id type updatedAt unreadCount
          seller { name slug logo }
          product { name slug image }
          lastMessage { text createdAt }
        }
      }`
    );
    setConversations(data.getConversations);
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    const data = await gqlAuth<{ getMessages: ApiMessage[] }>(
      `query($conversationId: ID!) {
        getMessages(conversationId: $conversationId) { ${MESSAGE_FIELDS} }
      }`,
      { conversationId }
    );
    setMessages(data.getMessages);
    await gqlAuth(
      `mutation($conversationId: ID!) { markMessageAsRead(conversationId: $conversationId) }`,
      { conversationId }
    );
  }, []);

  useEffect(() => {
    if (user) loadConversations();
  }, [user, loadConversations]);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId, loadMessages]);

  /* Real-time: graphql-ws subscription to messageAdded */
  useEffect(() => {
    if (!activeId || !user) return;
    const token = window.localStorage.getItem("tredella-token");
    const client = createClient({
      url: GRAPHQL_WS_URL,
      connectionParams: { authorization: token ? `Bearer ${token}` : "" },
    });
    wsRef.current = client;

    const unsubscribe = client.subscribe(
      {
        query: `subscription($conversationId: ID!) {
          messageAdded(conversationId: $conversationId) { ${MESSAGE_FIELDS} }
        }`,
        variables: { conversationId: activeId },
      },
      {
        next: (value) => {
          const message = (value.data as { messageAdded: ApiMessage })
            ?.messageAdded;
          if (message && !message.isMine)
            setMessages((prev) => [...prev, message]);
        },
        error: () => {},
        complete: () => {},
      }
    );

    return () => {
      unsubscribe();
      client.dispose();
      wsRef.current = null;
    };
  }, [activeId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const support = useMemo(
    () => conversations.find(isSupport) ?? null,
    [conversations]
  );

  const sellerThreads = useMemo(() => {
    const term = search.trim().toLowerCase();
    return conversations
      .filter((c) => !isSupport(c))
      .filter((c) => {
        if (filter === "Unread" && c.unreadCount === 0) return false;
        if (filter === "Support") return false;
        if (!term) return true;
        return `${partyName(c)} ${c.product?.name ?? ""} ${c.lastMessage?.text ?? ""}`
          .toLowerCase()
          .includes(term);
      });
  }, [conversations, search, filter]);

  const showSupport =
    support !== null &&
    filter !== "Sellers" &&
    (filter !== "Unread" || support.unreadCount > 0) &&
    (!search.trim() || "support chat".includes(search.trim().toLowerCase()));

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const groups = useMemo(() => groupMessages(messages), [messages]);

  const send = async () => {
    const body = text.trim();
    if ((!body && !pending) || !activeId) return;

    setText("");
    setEmojiOpen(false);
    const attachment = pending;
    setPending(null);
    setError(null);

    try {
      const data = await gqlAuth<{ sendMessage: ApiMessage }>(
        `mutation($conversationId: ID!, $text: String!, $attachment: String) {
          sendMessage(conversationId: $conversationId, text: $text, attachment: $attachment) { ${MESSAGE_FIELDS} }
        }`,
        {
          conversationId: activeId,
          text: body,
          attachment: attachment ? serialiseAttachment(attachment) : null,
        }
      );
      setMessages((prev) => [...prev, data.sendMessage]);
      loadConversations();
    } catch {
      // put everything back rather than losing what was typed or attached
      setText(body);
      setPending(attachment);
      setError("That message did not send. Try again.");
    }
  };

  const attach = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setPending(await uploadChatAttachment(file));
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "That file could not be attached."
      );
    } finally {
      setUploading(false);
    }
  };

  const contactSupport = async () => {
    setSupportBusy(true);
    try {
      const data = await gqlAuth<{ startConversation: { id: string } }>(
        `mutation { startConversation(type: "BUYER_ADMIN") { id } }`
      );
      await loadConversations();
      setActiveId(data.startConversation.id);
    } finally {
      setSupportBusy(false);
    }
  };

  const row = (c: ApiConversation, pinned = false) => {
    const selected = activeId === c.id;

    return (
      <button
        key={c.id}
        type="button"
        onClick={() => setActiveId(c.id)}
        className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-0 ${
          selected ? "bg-primary text-white" : "hover:bg-paper"
        }`}
      >
        <Avatar conversation={c} />

        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span
              className={`truncate text-sm font-semibold ${
                selected ? "text-white" : "text-heading"
              }`}
            >
              {partyName(c)}
            </span>
            {pinned ? (
              <span
                aria-label="Pinned"
                className={`shrink-0 text-[10px] font-semibold uppercase ${
                  selected ? "text-white" : "text-primary"
                }`}
              >
                Pinned
              </span>
            ) : (
              c.lastMessage && (
                <span
                  className={`shrink-0 text-[10px] ${
                    selected ? "text-white/80" : "text-muted"
                  }`}
                >
                  {clockTime(c.lastMessage.createdAt)}
                </span>
              )
            )}
          </span>

          {c.product && (
            <span
              className={`block truncate text-xs ${
                selected ? "text-white/90" : "text-primary"
              }`}
            >
              Re: {c.product.name}
            </span>
          )}

          <span className="mt-0.5 flex items-center justify-between gap-2">
            <span
              className={`truncate text-xs ${
                selected ? "text-white/80" : "text-muted"
              }`}
            >
              {c.lastMessage?.text ||
                (c.lastMessage ? "Attachment" : "Start the conversation")}
            </span>
            {c.unreadCount > 0 && !selected && (
              <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {c.unreadCount}
              </span>
            )}
          </span>
        </span>
      </button>
    );
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
      {/* Conversations — full width on mobile, hidden once a thread is open */}
      <div className={`flex-col gap-4 lg:flex ${active ? "hidden" : "flex"}`}>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-heading">Messages</h1>
          <button
            type="button"
            onClick={contactSupport}
            disabled={supportBusy}
            className="rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
          >
            Contact Support
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 shrink-0 text-muted"
          >
            <path d="M9 3a6 6 0 1 0 3.5 10.9l3.3 3.3 1.4-1.4-3.3-3.3A6 6 0 0 0 9 3Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
          </svg>
          <label htmlFor="chat-search" className="sr-only">
            Search conversations
          </label>
          <input
            id="chat-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="min-w-0 flex-1 bg-transparent text-sm text-heading outline-none placeholder:text-muted"
          />
          <span className="shrink-0 border-l border-line pl-2">
            <Dropdown
              align="right"
              label="Filter conversations"
              value={filter}
              onChange={setFilter}
              options={FILTERS}
              className="w-24"
            />
          </span>
        </div>

        <div className="max-h-[calc(70vh-40px)] min-h-80 overflow-y-auto rounded-lg bg-white shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
          {showSupport && support && row(support, true)}
          {sellerThreads.map((c) => row(c))}

          {!showSupport && sellerThreads.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-muted">
              {search.trim() || filter !== "All"
                ? "Nothing matches that."
                : "No conversations yet. Use “Contact Seller” on any product page, or contact support."}
            </p>
          )}
        </div>
      </div>

      {/* Thread */}
      <div className={`lg:block ${active ? "block" : "hidden"}`}>
        <div className="flex h-[70vh] min-h-120 flex-col overflow-hidden rounded-lg bg-white shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper text-3xl">
                💬
              </span>
              <p className="mt-3 text-sm text-muted">
                Select a conversation to start chatting.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-line px-4 py-3.5 sm:px-5">
                <button
                  type="button"
                  aria-label="Back to conversations"
                  onClick={() => setActiveId(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-heading hover:bg-paper lg:hidden"
                >
                  ←
                </button>

                <Avatar conversation={active} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-heading">
                    {partyName(active)}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 rounded-full ${
                        PRESENCE_DOT[presenceOf(active)]
                      }`}
                    />
                    {PRESENCE_LABEL[presenceOf(active)]}
                  </p>
                </div>

                {active.product && (
                  <div className="flex items-center gap-2 rounded-full bg-paper py-1 pl-1 pr-3">
                    <Image
                      src={active.product.image}
                      alt=""
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-full bg-white object-contain p-0.5"
                    />
                    <span className="hidden max-w-40 truncate text-xs text-body sm:block">
                      {active.product.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-5">
                {groups.length === 0 && (
                  <p className="py-10 text-center text-xs text-muted">
                    No messages yet — say hello.
                  </p>
                )}

                {groups.map((group) => {
                  const last = group.messages[group.messages.length - 1];

                  return (
                    <div
                      key={group.messages[0].id}
                      className={`flex items-end gap-2.5 ${
                        group.mine ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar
                        conversation={active}
                        size="h-9 w-9 text-xs"
                        showDot={false}
                      />

                      <div className="flex max-w-[78%] flex-col gap-2 sm:max-w-[70%]">
                        {group.messages.map((message) => {
                          const attachment = parseAttachment(message.attachment);

                          return (
                            <div
                              key={message.id}
                              className={`flex flex-col gap-2 ${
                                group.mine ? "items-end" : "items-start"
                              }`}
                            >
                              {message.text && (
                                <p
                                  className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                    group.mine
                                      ? "bg-primary text-white"
                                      : "bg-paper text-heading"
                                  }`}
                                >
                                  {message.text}
                                </p>
                              )}

                              {attachment && (
                                <AttachmentCard
                                  attachment={attachment}
                                  mine={group.mine}
                                />
                              )}
                            </div>
                          );
                        })}

                        {/* One stamp per block, tucked against the inner edge */}
                        <span
                          className={`text-[10px] text-muted ${
                            group.mine ? "text-left" : "text-right"
                          }`}
                        >
                          {clockTime(last.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {error && (
                <p
                  role="alert"
                  className="border-t border-primary/20 bg-primary-light px-4 py-2 text-xs text-heading sm:px-5"
                >
                  {error}
                </p>
              )}

              {pending && (
                <div className="flex items-center gap-2 border-t border-line px-4 py-2 sm:px-5">
                  <span className="min-w-0 flex-1">
                    <AttachmentCard attachment={pending} mine={false} />
                  </span>
                  <button
                    type="button"
                    onClick={() => setPending(null)}
                    className="shrink-0 text-xs text-primary hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="relative border-t border-line p-3 sm:p-4">
                {emojiOpen && (
                  <div className="absolute bottom-full right-4 mb-2 grid grid-cols-8 gap-1 rounded-xl border border-line bg-white p-2 shadow-[0_8px_30px_rgba(43,52,69,0.15)]">
                    {EMOJI.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setText((current) => current + emoji);
                          setEmojiOpen(false);
                        }}
                        className="h-7 w-7 rounded text-base transition-colors hover:bg-paper"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 rounded-full border border-line py-1.5 pl-5 pr-1.5">
                  <label htmlFor="message-text" className="sr-only">
                    Type a message
                  </label>
                  <input
                    id="message-text"
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Type message..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-heading outline-none placeholder:text-muted"
                  />

                  <button
                    type="button"
                    onClick={() => setEmojiOpen((open) => !open)}
                    aria-label="Insert an emoji"
                    aria-expanded={emojiOpen}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base text-muted transition-colors hover:text-primary"
                  >
                    🙂
                  </button>

                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    aria-label="Attach a file"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-primary disabled:opacity-50"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                    >
                      <path d="M21.4 11.1 12.3 20.2a5 5 0 1 1-7.1-7.1l9.2-9.1a3.3 3.3 0 1 1 4.7 4.7l-9.2 9.1a1.7 1.7 0 0 1-2.3-2.3l8.4-8.4" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={send}
                    disabled={uploading || (!text.trim() && !pending)}
                    aria-label="Send message"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M3 20v-6l8-2-8-2V4l19 8-19 8Z" />
                    </svg>
                  </button>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept={CHAT_ATTACHMENT_ACCEPT}
                  className="sr-only"
                  onChange={(e) => {
                    attach(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense>
      <Messages />
    </Suspense>
  );
}
