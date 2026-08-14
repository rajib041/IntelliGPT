import "./Sidebar.css";
import { useContext, useEffect, useCallback } from "react";
import { MyContext } from "./MyContext.jsx";
import blackLogo from "./assets/blacklogo.png";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrevChats,
    setCurrThreadId,
    setReply,
    sidebarOpen,
    setSidebarOpen,
    createNewChat
  } = useContext(MyContext);

  const getAllThreads = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/thread`);
      if (!response.ok) return;
      const res = await response.json();
      if (!Array.isArray(res)) return;
      const filteredData = res.map(thread => ({
        threadId: thread.threadId,
        title: thread.title || "Untitled Chat",
        updatedAt: thread.updatedAt
      }));
      setAllThreads(filteredData);
    } catch (err) {
      console.error("Failed to load threads:", err);
    }
  }, [setAllThreads]);

  useEffect(() => {
    getAllThreads();
  }, [currThreadId, getAllThreads]);

  const changeThread = async (newThreadId) => {
    if (newThreadId === currThreadId) {
      setSidebarOpen(false);
      return;
    }

    setCurrThreadId(newThreadId);
    setSidebarOpen(false);

    try {
      const response = await fetch(`${API_BASE}/api/thread/${newThreadId}`);
      if (!response.ok) {
        console.error("Thread not found on server");
        return;
      }
      const res = await response.json();
      setPrevChats(Array.isArray(res) ? res : []);
      setNewChat(false);
      setReply(null);
    } catch (err) {
      console.error("Error changing thread:", err);
    }
  };

  const deleteThread = async (e, threadId) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_BASE}/api/thread/${threadId}`, { method: "DELETE" });
      if (!response.ok) {
        console.error("Failed to delete thread");
        return;
      }

      setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (err) {
      console.error("Error deleting thread:", err);
    }
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Header with App Brand and New Chat button */}
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-logo-container">
              <img src={blackLogo} alt="IntelliGPT Logo" className="logo" />
            </div>
            <div className="brand-info">
              <span className="brand-name">IntelliGPT</span>
              <span className="brand-badge">PRO</span>
            </div>
            <button
              className="mobile-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <button className="new-chat-btn" onClick={createNewChat}>
            <i className="fa-solid fa-plus"></i>
            <span>New chat</span>
          </button>
        </div>

        {/* History List */}
        <div className="sidebar-content">
          <div className="history-section-title">
            <span>Recent Chats</span>
            <span className="count-badge">{allThreads?.length || 0}</span>
          </div>

          <ul className="history-list">
            {allThreads && allThreads.length > 0 ? (
              allThreads.map((thread) => {
                const isActive = thread.threadId === currThreadId;
                return (
                  <li
                    key={thread.threadId}
                    onClick={() => changeThread(thread.threadId)}
                    className={`history-item ${isActive ? "active" : ""}`}
                    title={thread.title}
                  >
                    <i className="fa-regular fa-message thread-icon"></i>
                    <span className="thread-title">{thread.title}</span>
                    <button
                      className="delete-thread-btn"
                      onClick={(e) => deleteThread(e, thread.threadId)}
                      aria-label={`Delete chat: ${thread.title}`}
                      title="Delete chat"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </li>
                );
              })
            ) : (
              <div className="empty-history">
                <i className="fa-regular fa-comments"></i>
                <p>No conversations yet</p>
              </div>
            )}
          </ul>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="avatar">
              <i className="fa-solid fa-user-astronaut"></i>
            </div>
            <div className="user-text">
              <span className="user-title">IntelliGPT Pro</span>
              <span className="user-sub">AI Assistant</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;