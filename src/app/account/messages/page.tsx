"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { createClient, type Client } from "graphql-ws";
import { gqlAuth, GRAPHQL_WS_URL } from "@/lib/graphql";
import { useAuth } from "@/lib/auth";
import type { ApiConversation, ApiMessage } from "@/lib/types";

const conversationName = (c: ApiConversation) =>
  c.type === "BUYER_ADMIN" ? "Tredella Support" : (c.seller?.name ?? "Seller");

const Avatar = ({
  conversation,
  size = "h-10 w-10",
}: {
  conversation: ApiConversation;
  size?: string;
}) => (
  <span
    className={`flex ${size} shrink-0 items-center justify-center rounded-full text-sm font-bold ${
      conversation.type === "BUYER_ADMIN"
        ? "bg-heading text-white"
        : "bg-primary-light text-primary"
    }`}
  >
    {conversation.type === "BUYER_ADMIN"
      ? "T"
      : conversationName(conversation).charAt(0)}
  </span>
);

const timeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

function Messages() {
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(
    useSearchParams().get("c")
  );
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [text, setText] = useState("");
  const [supportBusy, setSupportBusy] = useState(false);
  const { user } = useAuth();
  const wsRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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
        getMessages(conversationId: $conversationId) {
          id text createdAt isMine sender { name }
        }
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
          messageAdded(conversationId: $conversationId) {
            id text createdAt isMine sender { name }
          }
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

  const send = async () => {
    if (!text.trim() || !activeId) return;
    const content = text.trim();
    setText("");
    const data = await gqlAuth<{ sendMessage: ApiMessage }>(
      `mutation($conversationId: ID!, $text: String!) {
        sendMessage(conversationId: $conversationId, text: $text) {
          id text createdAt isMine sender { name }
        }
      }`,
      { conversationId: activeId, text: content }
    );
    setMessages((prev) => [...prev, data.sendMessage]);
    loadConversations();
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

  const active = conversations.find((c) => c.id === activeId);

  return (
    <div className="flex h-[70vh] min-h-[480px] overflow-hidden rounded-lg bg-white shadow-[0_1px_3px_rgba(43,52,69,0.1)]">
      {/* Conversations list — full width on mobile, hidden when a thread is open */}
      <aside
        className={`w-full shrink-0 flex-col border-line md:flex md:w-80 md:border-r ${
          active ? "hidden" : "flex"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
          <h1 className="text-base font-bold text-heading">Messages</h1>
          <button
            type="button"
            onClick={contactSupport}
            disabled={supportBusy}
            className="rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white disabled:opacity-50"
          >
            Contact Support
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-paper text-2xl">
                💬
              </span>
              <p className="mt-3 text-sm text-muted">
                No conversations yet. Use &ldquo;Contact Seller&rdquo; on any
                product page, or contact support.
              </p>
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors hover:bg-paper ${
                  activeId === c.id ? "bg-primary-light/40" : ""
                }`}
              >
                <Avatar conversation={c} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-heading">
                      {conversationName(c)}
                    </span>
                    {c.lastMessage && (
                      <span className="shrink-0 text-[10px] text-muted">
                        {timeAgo(c.lastMessage.createdAt)}
                      </span>
                    )}
                  </span>
                  {c.product && (
                    <span className="block truncate text-xs text-primary">
                      Re: {c.product.name}
                    </span>
                  )}
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted">
                      {c.lastMessage?.text ?? "Start the conversation"}
                    </span>
                    {c.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Thread — full width on mobile with back button */}
      <section
        className={`min-w-0 flex-1 flex-col md:flex ${active ? "flex" : "hidden"}`}
      >
        {!active ? (
          <div className="hidden flex-1 flex-col items-center justify-center md:flex">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper text-3xl">
              💬
            </span>
            <p className="mt-3 text-sm text-muted">
              Select a conversation to start chatting.
            </p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <button
                type="button"
                aria-label="Back to conversations"
                onClick={() => setActiveId(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-heading hover:bg-paper md:hidden"
              >
                ←
              </button>
              <Avatar conversation={active} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-heading">
                  {conversationName(active)}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Online
                </p>
              </div>
              {active.product && (
                <div className="flex items-center gap-2 rounded-full bg-paper py-1 pl-1 pr-3">
                  <Image
                    src={active.product.image}
                    alt={active.product.name}
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

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-paper/60 px-4 py-4 sm:px-5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-end gap-2 ${
                    m.isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  {!m.isMine && (
                    <Avatar conversation={active} size="h-7 w-7" />
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm sm:max-w-[70%] ${
                      m.isMine
                        ? "rounded-br-sm bg-primary text-white"
                        : "rounded-bl-sm bg-white text-body shadow-[0_1px_3px_rgba(43,52,69,0.1)]"
                    }`}
                  >
                    <p className="break-words">{m.text}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        m.isMine ? "text-white/70" : "text-muted"
                      }`}
                    >
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div className="flex gap-2 border-t border-line p-3 sm:p-4">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message…"
                className="h-11 flex-1 rounded-full border border-line px-5 text-sm outline-none placeholder:text-muted focus:border-primary"
              />
              <button
                type="button"
                onClick={send}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark sm:w-auto sm:px-6"
              >
                <span className="hidden text-sm font-semibold sm:inline">
                  Send
                </span>
                <svg
                  className="sm:hidden"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 20v-6l8-2-8-2V4l19 8-19 8Z" />
                </svg>
              </button>
            </div>
          </>
        )}
      </section>
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
