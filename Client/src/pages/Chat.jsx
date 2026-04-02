import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../Context/AuthContext'
import { connectSocket, getSocket, disconnectSocket } from '../utils/socket'
import api from '../utils/api'

export default function Chat() {
  const { user, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUser, setTypingUser] = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // ── Connect Socket on mount ──────────────────────────
  useEffect(() => {
    const socket = connectSocket()

    socket.on('connect', () => {
      console.log('✅ Socket connected')
      socket.emit('get_online_users')
    })

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message)
    })

    // Receive new message
    socket.on('receive_message', (message) => {
      setMessages(prev => {
        // Only add if it belongs to current conversation
        if (
          message.senderId === selectedUserRef.current?._id ||
          message.receiverId === selectedUserRef.current?._id
        ) {
          return [...prev, message]
        }
        return prev
      })
    })

    // Message sent confirmation
    socket.on('message_sent', (message) => {
      setMessages(prev => [...prev, message])
    })

    // Online users list
    socket.on('online_users', (userIds) => {
      setOnlineUsers(userIds)
    })

    // User comes online/goes offline
    socket.on('user_status', ({ userId, status }) => {
      setOnlineUsers(prev =>
        status === 'online'
          ? [...new Set([...prev, userId])]
          : prev.filter(id => id !== userId)
      )
    })

    // Typing indicators
    socket.on('user_typing', ({ userId }) => {
      if (userId === selectedUserRef.current?._id) {
        setTypingUser(userId)
      }
    })

    socket.on('user_stop_typing', ({ userId }) => {
      if (userId === selectedUserRef.current?._id) {
        setTypingUser(null)
      }
    })

    // Chat history
    socket.on('chat_history', (history) => {
      setMessages(history)
    })

    return () => disconnectSocket()
  }, [])

  // Keep a ref to selectedUser so socket callbacks can access it
  const selectedUserRef = useRef(selectedUser)
  useEffect(() => {
    selectedUserRef.current = selectedUser
  }, [selectedUser])

  // ── Fetch all users ──────────────────────────────────
  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data))
  }, [])

  // ── Load chat history when user is selected ──────────
  useEffect(() => {
    if (!selectedUser) return
    const socket = getSocket()
    if (socket) {
      socket.emit('get_history', { receiverId: selectedUser._id })
    }
  }, [selectedUser])

  // ── Auto scroll to bottom ────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ─────────────────────────────────────
  const sendMessage = () => {
    if (!text.trim() || !selectedUser) return
    const socket = getSocket()
    socket.emit('send_message', {
      receiverId: selectedUser._id,
      content: text.trim()
    })
    setText('')
    socket.emit('stop_typing', { receiverId: selectedUser._id })
  }

  // ── Typing indicator ─────────────────────────────────
  const handleTyping = (e) => {
    setText(e.target.value)
    const socket = getSocket()
    if (!socket || !selectedUser) return
    socket.emit('typing', { receiverId: selectedUser._id })
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { receiverId: selectedUser._id })
    }, 1500)
  }

  const isOnline = (userId) => onlineUsers.includes(userId)

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* ── Sidebar ───────────────────────────────────── */}
      <div style={s.sidebar}>

        {/* Header */}
        <div style={s.sidebarHeader}>
          <div>
            <div style={s.logoText}>CHAT<span style={s.dot}>.</span></div>
            <div style={s.loggedInAs}>{user?.username}</div>
          </div>
          <button onClick={logout} style={s.logoutBtn} title="Sign out">
            ↪
          </button>
        </div>

        {/* Users list */}
        <div style={s.sectionLabel}>CONVERSATIONS</div>
        <div style={s.usersList}>
          {users.length === 0 && (
            <div style={s.emptyUsers}>No other users yet</div>
          )}
          {users.map(u => (
            <div
              key={u._id}
              onClick={() => setSelectedUser(u)}
              style={{
                ...s.userItem,
                ...(selectedUser?._id === u._id ? s.userItemActive : {})
              }}
              className="user-item"
            >
              <div style={s.avatarWrap}>
                <div style={s.avatar}>
                  {u.username[0].toUpperCase()}
                </div>
                <div style={{
                  ...s.onlineDot,
                  background: isOnline(u._id) ? '#22c55e' : '#d1d5db'
                }} />
              </div>
              <div style={s.userInfo}>
                <div style={s.userName}>{u.username}</div>
                <div style={s.userStatus}>
                  {isOnline(u._id) ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chat Area ─────────────────────────────────── */}
      <div style={s.chatArea}>
        {!selectedUser ? (

          /* Empty state */
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>💬</div>
            <div style={s.emptyTitle}>Select a conversation</div>
            <div style={s.emptySubtitle}>
              Choose someone from the left to start chatting
            </div>
          </div>

        ) : (
          <>
            {/* Chat Header */}
            <div style={s.chatHeader}>
              <div style={s.avatarWrap}>
                <div style={{ ...s.avatar, width: '38px', height: '38px', fontSize: '15px' }}>
                  {selectedUser.username[0].toUpperCase()}
                </div>
                <div style={{
                  ...s.onlineDot,
                  background: isOnline(selectedUser._id) ? '#22c55e' : '#d1d5db'
                }} />
              </div>
              <div>
                <div style={s.chatHeaderName}>{selectedUser.username}</div>
                <div style={s.chatHeaderStatus}>
                  {isOnline(selectedUser._id) ? '● Online' : '○ Offline'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={s.messages}>
              {messages.length === 0 && (
                <div style={s.noMessages}>
                  No messages yet — say hello! 👋
                </div>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.senderId === user?.id || msg.senderId === user?._id
                return (
                  <div
                    key={msg._id || i}
                    style={{
                      ...s.msgRow,
                      justifyContent: isMine ? 'flex-end' : 'flex-start'
                    }}
                    className="msg-appear"
                  >
                    <div style={{
                      ...s.bubble,
                      ...(isMine ? s.bubbleMine : s.bubbleTheirs)
                    }}>
                      <div style={s.bubbleText}>{msg.content}</div>
                      <div style={s.bubbleTime}>{formatTime(msg.createdAt)}</div>
                    </div>
                  </div>
                )
              })}

              {/* Typing indicator */}
              {typingUser && (
                <div style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
                  <div style={{ ...s.bubble, ...s.bubbleTheirs, padding: '10px 16px' }}>
                    <div className="typing-dots">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={s.inputBar}>
              <input
                style={s.textInput}
                className="chat-input"
                placeholder={`Message ${selectedUser.username}...`}
                value={text}
                onChange={handleTyping}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!text.trim()}
                style={s.sendBtn}
                className="send-btn"
              >
                →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Styles ──────────────────────────────────────────────
const s = {
  root: {
    display: 'flex',
    height: '100vh',
    background: '#fafaf9',
    fontFamily: "'Instrument Sans', 'Helvetica Neue', sans-serif",
    overflow: 'hidden',
  },
  sidebar: {
    width: '280px',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    background: '#ffffff',
  },
  sidebarHeader: {
    padding: '24px 20px',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0a0a0a',
    letterSpacing: '-1px',
  },
  dot: { color: '#e8ff47', WebkitTextStroke: '1px #b5cc1a' },
  loggedInAs: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '2px',
    letterSpacing: '0.03em',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.15em',
    color: '#9ca3af',
    padding: '16px 20px 8px',
  },
  usersList: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 8px',
  },
  emptyUsers: {
    padding: '20px',
    fontSize: '13px',
    color: '#9ca3af',
    textAlign: 'center',
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    marginBottom: '2px',
  },
  userItemActive: {
    background: '#f3f4f6',
  },
  avatarWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#0a0a0a',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: '1px',
    right: '1px',
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    border: '1.5px solid #ffffff',
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0a0a0a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userStatus: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '1px',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  emptyIcon: { fontSize: '40px' },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0a0a0a',
    letterSpacing: '-0.5px',
  },
  emptySubtitle: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  chatHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#ffffff',
  },
  chatHeaderName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0a0a0a',
  },
  chatHeaderStatus: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '1px',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  noMessages: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#9ca3af',
    marginTop: '40px',
  },
  msgRow: {
    display: 'flex',
    marginBottom: '4px',
  },
  bubble: {
    maxWidth: '65%',
    padding: '10px 14px',
    borderRadius: '16px',
    wordBreak: 'break-word',
  },
  bubbleMine: {
    background: '#0a0a0a',
    color: '#ffffff',
    borderBottomRightRadius: '4px',
  },
  bubbleTheirs: {
    background: '#f3f4f6',
    color: '#0a0a0a',
    borderBottomLeftRadius: '4px',
  },
  bubbleText: {
    fontSize: '14px',
    lineHeight: 1.5,
  },
  bubbleTime: {
    fontSize: '10px',
    opacity: 0.5,
    marginTop: '4px',
    textAlign: 'right',
  },
  inputBar: {
    padding: '16px 24px',
    borderTop: '1px solid #f3f4f6',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    background: '#ffffff',
  },
  textInput: {
    flex: 1,
    padding: '12px 16px',
    background: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#0a0a0a',
    transition: 'border-color 0.2s',
  },
  sendBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: '#0a0a0a',
    color: '#ffffff',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&display=swap');

  .user-item:hover { background: #f9fafb !important; }

  .msg-appear {
    animation: msgIn 0.25s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .chat-input:focus {
    border-color: #0a0a0a !important;
    background: #ffffff !important;
  }

  .send-btn:hover:not(:disabled) {
    background: #1f1f1f !important;
    transform: scale(1.05);
  }
  .send-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .typing-dots {
    display: flex; gap: 4px; align-items: center; height: 16px;
  }
  .typing-dots span {
    width: 6px; height: 6px; border-radius: 50%;
    background: #9ca3af;
    animation: typingBounce 1.2s infinite ease-in-out;
  }
  .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingBounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-6px); }
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
`