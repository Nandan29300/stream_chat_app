"use client";
import { useState, useRef } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [streamResponse, setStreamResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);

  const [copiedChat, setCopiedChat] = useState(false);
  const [copiedStream, setCopiedStream] = useState(false);

  const chatRef = useRef(null);
  const streamRef = useRef(null);

  const handlechat = async () => {
    setChatLoading(true);
    setResponse("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setResponse(data.response);
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    } catch (error) {
      setResponse("Error: " + error.message);
    }
    setChatLoading(false);
  };

  const handleStreamChat = async () => {
    setStreamLoading(true);
    setStreamResponse("");
    try {
      const response = await fetch("/api/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            for (const char of data.content) {
              setStreamResponse((prev) => {
                const updated = prev + char;
                if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
                return updated;
              });
              await new Promise((r) => setTimeout(r, 10));
            }
          }
        }
      }
    } catch (error) {
      setStreamResponse("Error: " + error.message);
    }
    setStreamLoading(false);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "chat") {
      setCopiedChat(true);
      setTimeout(() => setCopiedChat(false), 1500);
    } else {
      setCopiedStream(true);
      setTimeout(() => setCopiedStream(false), 1500);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Get Started with Stream Chat App with AI</h1>

      {/* Description Section */}
      <div className={styles.description}>
        <p>
          This app allows you to interact with AI in two ways:
        </p>
        <ul>
          <li><strong>Chat:</strong> Sends your message and returns the AI's response all at once.</li>
          <li><strong>Stream Chat:</strong> Streams the AI's response character by character, so you can see it generated live.</li>
        </ul>
      </div>

      <div className={styles.inputContainer}>
        <input
          className={styles.fixedInput}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your awesome message"
        />
      </div>

      <div className={styles.buttonContainer}>
        <button onClick={handlechat} className={styles.chatButton} disabled={chatLoading}>
          {chatLoading ? "Loading..." : "Chat"}
        </button>

        <button
          onClick={handleStreamChat}
          className={styles.streamButton}
          disabled={streamLoading}
        >
          {streamLoading ? "Loading..." : "Stream Chat"}
        </button>
      </div>

      <div className={styles.responseWrapper}>
        {/* Chat Response */}
        <div className={styles.responseBox}>
          <div
            className={styles.copyBtn}
            onClick={() => copyToClipboard(response, "chat")}
          >
            Copy
          </div>
          {copiedChat && <div className={`${styles.copiedLabel} ${styles.slideIn}`}>Copied!</div>}
          <div
            className={`${styles.scrollBox} ${response ? styles.slideInLeft : ""}`}
            ref={chatRef}
          >
            {response}
          </div>
        </div>

        {/* Stream Response */}
        <div className={styles.responseBox}>
          <div
            className={styles.copyBtn}
            onClick={() => copyToClipboard(streamResponse, "stream")}
          >
            Copy
          </div>
          {copiedStream && <div className={`${styles.copiedLabel} ${styles.slideIn}`}>Copied!</div>}
          <div
            className={`${styles.scrollBox} ${streamResponse ? styles.slideInRight : ""}`}
            ref={streamRef}
          >
            {streamResponse}
          </div>
        </div>
      </div>
    </div>
  );
}
