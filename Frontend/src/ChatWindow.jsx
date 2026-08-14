import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useRef, useEffect } from "react";
import { ScaleLoader } from "react-spinners";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    setReply,
    currThreadId,
    setPrevChats,
    setNewChat,
    loading,
    setLoading,
    setSidebarOpen,
    setAllThreads,
    createNewChat
  } = useContext(MyContext);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Focus input automatically on mount and thread switch
  useEffect(() => {
    inputRef.current?.focus();
  }, [currThreadId]);

  const refreshThreads = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/thread`);
      if (!response.ok) return;
      const res = await response.json();
      setAllThreads(res.map(t => ({ threadId: t.threadId, title: t.title })));
    } catch (err) {
      console.error("Error refreshing threads:", err);
    }
  };

  const handleSend = async () => {
    const messageText = prompt.trim();
    if (!messageText || loading) return;

    // Optimistically update the chat history with the user's message immediately
    const userMessage = { role: "user", content: messageText };
    setPrevChats(prev => [...prev, userMessage]);
    setPrompt("");
    setNewChat(false);
    setLoading(true);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: messageText,
        threadId: currThreadId
      })
    };

    try {
      const response = await fetch(`${API_BASE}/api/chat`, options);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      const assistantMessage = {
        role: "assistant",
        content: data.reply || "No response received."
      };

      setPrevChats(prev => [...prev, assistantMessage]);
      setReply(data.reply || "");
      refreshThreads();
    } catch (err) {
      console.error("Error sending chat message:", err);
      const errorMessage = {
        role: "assistant",
        content: "**Connection Error:** Could not reach the backend server. Please make sure the server is running."
      };
      setPrevChats(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="chat-window">
      {/* Top Navbar */}
      <header className="chat-navbar">
        <div className="navbar-left">
          <button
            className="mobile-toggle-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <i className="fa-solid fa-bars-staggered"></i>
          </button>

          <div className="model-selector">
            <span className="model-status-dot"></span>
            <span className="model-name">IntelliGPT Flash Lite</span>
            <i className="fa-solid fa-bolt model-sparkle"></i>
          </div>
        </div>

        <div className="navbar-right" ref={dropdownRef}>
          <button
            className="profile-btn"
            onClick={() => setIsDropdownOpen(prev => !prev)}
            aria-label="User Profile Menu"
            aria-expanded={isDropdownOpen}
          >
            <span className="avatar-initial">I</span>
          </button>

          {/* Profile Dropdown */}
          {isDropdownOpen && (
            <div className="profile-dropdown" role="menu">
              <div className="dropdown-user-header">
                <div className="dropdown-avatar">
                  <i className="fa-solid fa-user-astronaut"></i>
                </div>
                <div className="dropdown-user-info">
                  <p className="dropdown-user-name">Intelli User</p>
                  <p className="dropdown-user-email">user@intelligpt.local</p>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <button
                className="dropdown-item"
                role="menuitem"
                onClick={() => {
                  createNewChat();
                  setIsDropdownOpen(false);
                }}
              >
                <i className="fa-solid fa-plus"></i>
                <span>New conversation</span>
              </button>

              <button
                className="dropdown-item"
                role="menuitem"
                onClick={() => {
                  setIsDropdownOpen(false);
                  alert("IntelliGPT is running in local development mode.");
                }}
              >
                <i className="fa-solid fa-gear"></i>
                <span>Settings</span>
              </button>

              <button
                className="dropdown-item"
                role="menuitem"
                onClick={() => {
                  setIsDropdownOpen(false);
                  window.open("https://github.com", "_blank");
                }}
              >
                <i className="fa-brands fa-github"></i>
                <span>Documentation</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Chat Stream */}
      <Chat />

      {/* Loading Indicator */}
      {loading && (
        <div className="loading-bar">
          <ScaleLoader color="#3b82f6" height={18} width={3} radius={2} margin={2} loading={loading} />
          <span className="loading-text">IntelliGPT is thinking...</span>
        </div>
      )}

      {/* Input Section */}
      <footer className="chat-input-section">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            className="main-chat-input"
            placeholder="Ask IntelliGPT anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            aria-label="Chat input"
          />

          <button
            className={`send-button ${prompt.trim() && !loading ? "active" : ""}`}
            onClick={handleSend}
            disabled={!prompt.trim() || loading}
            aria-label="Send message"
            title="Send message"
          >
            <i className="fa-solid fa-arrow-up"></i>
          </button>
        </div>

        <p className="chat-footer-disclaimer">
          IntelliGPT can make mistakes. Verify critical facts and information.
        </p>
      </footer>
    </main>
  );
}

export default ChatWindow;