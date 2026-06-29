"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Pusher from "pusher-js";

interface Sender {
  id: string;
  name: string | null;
  image: string | null;
}

interface Message {
  id: string;
  senderId: string;
  content: string | null;
  imageData: string | null;
  createdAt: string | Date;
  sender: Sender;
}

interface Props {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}

export function ChatWindow({ conversationId, currentUserId, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe(`conversation-${conversationId}`);
    channel.bind("new-message", (msg: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`conversation-${conversationId}`);
      pusher.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !imageData) return;
    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content: text.trim() || null, imageData }),
      });
      setText("");
      setImageData(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">No messages yet. Say hello! 👋</div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              {msg.sender.image ? (
                <Image src={msg.sender.image} alt={msg.sender.name ?? ""} width={28} height={28} className="rounded-full flex-shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">
                  {(msg.sender.name ?? "?")[0]}
                </div>
              )}
              <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                {msg.content && (
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe ? "bg-green-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}>
                    {msg.content}
                  </div>
                )}
                {msg.imageData && (
                  <img src={msg.imageData} alt="Shared image" className="max-w-full rounded-2xl border border-gray-100 max-h-60 object-contain" />
                )}
                <p className="text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {imageData && (
        <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-3">
          <img src={imageData} alt="Preview" className="h-16 w-16 object-cover rounded-xl" />
          <button onClick={() => { setImageData(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-red-500 text-sm hover:text-red-700">Remove</button>
        </div>
      )}

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex items-center gap-3">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-green-600 transition text-xl flex-shrink-0" title="Attach photo">📷</button>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        <button type="submit" disabled={sending || (!text.trim() && !imageData)} className="bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 transition disabled:opacity-40 flex-shrink-0">Send</button>
      </form>
    </div>
  );
}
