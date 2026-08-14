import "./Chat.css";
import { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

// Helper to fix malformed single-line markdown tables and spacing
function formatMarkdownContent(text) {
  if (!text || typeof text !== "string") return "";
  
  let formatted = text;
  
  // 1. Fix collapsed table rows where newlines were removed (e.g. "| col1 | |---| | data |")
  formatted = formatted.replace(/\|\s*\|\s*(?=[-\w\d`*#[:\s])/g, "|\n|");
  
  // 2. Ensure table headers and separators have leading/trailing newlines
  formatted = formatted.replace(/([^\n])\n?(\|[\s\S]+?\|)\n?([^\n|])/g, (match, before, table, after) => {
    return `${before}\n\n${table}\n\n${after}`;
  });

  return formatted;
}

// CodeBlock helper component with copy-to-clipboard functionality
function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false);
  const codeContent = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <span className="code-language">{language || "code"}</span>
        <button className="code-copy-btn" onClick={handleCopy} title="Copy code">
          <i className={`fa-regular ${copied ? "fa-circle-check" : "fa-copy"}`}></i>
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <pre className="code-pre">
        <code className={`hljs ${language ? `language-${language}` : ""}`}>
          {children}
        </code>
      </pre>
    </div>
  );
}

function Chat() {
  const { newChat, prevChats, reply, setPrompt } = useContext(MyContext);
  const [streamedReply, setStreamedReply] = useState(null);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null);
  const chatBottomRef = useRef(null);

  const starterPrompts = [
    {
      icon: "fa-solid fa-lightbulb",
      title: "Explain a concept",
      desc: "Explain quantum computing in simple terms with an analogy."
    },
    {
      icon: "fa-solid fa-code",
      title: "Debug & Code",
      desc: "Write a modern debounce utility function in JavaScript."
    },
    {
      icon: "fa-solid fa-wand-magic-sparkles",
      title: "Brainstorm ideas",
      desc: "Suggest 5 innovative SaaS project ideas for AI pair programming."
    },
    {
      icon: "fa-solid fa-pen-nib",
      title: "Draft content",
      desc: "Draft a concise, professional follow-up email after an interview."
    }
  ];

  // Auto-scroll to bottom whenever chats or streamed reply updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [prevChats, streamedReply]);

  // High-speed Streaming/Typing effect for the newest assistant reply
  useEffect(() => {
    if (!reply) {
      setStreamedReply(null);
      return;
    }

    const words = reply.split(" ");
    let index = 0;
    setStreamedReply(words[0] || "");

    const interval = setInterval(() => {
      index += 2;
      if (index >= words.length) {
        clearInterval(interval);
        setStreamedReply(null);
      } else {
        setStreamedReply(words.slice(0, index + 1).join(" "));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [reply]);

  const handleCopyMessage = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMsgIdx(idx);
      setTimeout(() => setCopiedMsgIdx(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handlePromptClick = (text) => {
    setPrompt(text);
  };

  const isChatEmpty = !prevChats || prevChats.length === 0;

  return (
    <div className="chat-container">
      {/* Empty State / Welcome Screen */}
      {(newChat || isChatEmpty) ? (
        <div className="welcome-hero">
          <div className="welcome-icon">
            <i className="fa-solid fa-bolt"></i>
          </div>
          <h1 className="welcome-title">What's on your mind?</h1>
          <p className="welcome-subtitle">
            Ask IntelliGPT anything — code, reasoning, creative writing, or technical explanations.
          </p>

          <div className="prompt-grid">
            {starterPrompts.map((item, idx) => (
              <div
                key={idx}
                className="prompt-card"
                onClick={() => handlePromptClick(item.desc)}
              >
                <div className="prompt-card-header">
                  <i className={item.icon}></i>
                  <span className="prompt-card-title">{item.title}</span>
                </div>
                <p className="prompt-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="message-list">
          {prevChats.map((chat, idx) => {
            const isUser = chat.role === "user";
            const isLastAssistant = !isUser && idx === prevChats.length - 1;
            const rawContent = isLastAssistant && streamedReply !== null ? streamedReply : chat.content;
            const contentToRender = isUser ? rawContent : formatMarkdownContent(rawContent);

            return (
              <div
                key={idx}
                className={`message-row ${isUser ? "message-user" : "message-assistant"}`}
              >
                <div className="message-avatar">
                  {isUser ? (
                    <i className="fa-solid fa-user"></i>
                  ) : (
                    <i className="fa-solid fa-bolt"></i>
                  )}
                </div>

                <div className="message-body">
                  <div className="message-header">
                    <span className="message-sender">{isUser ? "You" : "IntelliGPT"}</span>
                    {!isUser && (
                      <button
                        className="message-action-btn"
                        onClick={() => handleCopyMessage(chat.content, idx)}
                        title="Copy response"
                        aria-label="Copy response"
                      >
                        <i className={`fa-regular ${copiedMsgIdx === idx ? "fa-circle-check" : "fa-copy"}`}></i>
                      </button>
                    )}
                  </div>

                  <div className="message-content">
                    {isUser ? (
                      <p className="user-text-content">{chat.content}</p>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          table({ children, ...props }) {
                            return (
                              <div className="table-responsive-wrapper">
                                <table className="markdown-table" {...props}>
                                  {children}
                                </table>
                              </div>
                            );
                          },
                          code({ inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            if (!inline && match) {
                              return (
                                <CodeBlock language={match[1]}>
                                  {children}
                                </CodeBlock>
                              );
                            }
                            return (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {contentToRender}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={chatBottomRef} />
        </div>
      )}
    </div>
  );
}

export default Chat;