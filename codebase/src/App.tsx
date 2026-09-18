import { useState, useRef, useEffect, useCallback } from 'react'
import {
  CHANNEL_MESSAGES, CHANNEL_META, QUESTION_CHANNEL_MAP,
  type ChannelId, type ChannelMsg,
} from './data'
import {
  callGeminiDigest,
  reconstructConversations,
  formatConversationsForAI,
  testGeminiConnection,
} from './service/gemini'


// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'P0' | 'P1'

interface DigestQuestion {
  id: string
  lastMessageId?: string
  firstMessageId?: string
  convId?: string
  conversationText?: string
  priority: Priority
  channel: ChannelId
  author: string
  avatar: string
  avatarColor: string
  time: string
  content: string
  summary: string
  groupCount: number
  handled: boolean
}

interface Reaction { emoji: string; count: number; mine: boolean }

interface DigestChatMsg {
  id: string
  type: 'user' | 'bot' | 'system' | 'processing'
  author: string
  avatar: string
  avatarColor: string
  time: string
  isCron?: boolean
  cronTime?: string
  isBot?: boolean
  content?: string
  blocks?: DigestBlock[]
}

interface DigestBlock {
  id: string
  priority: Priority
  label: string
  color: string
  questions: DigestQuestion[]
}

// ─── Static digest questions ──────────────────────────────────────────────────

const YESTERDAY: DigestQuestion[] = [
  { id: 'yd1', priority: 'P0', channel: 'lab-2-ho-tro', author: 'Nguyễn Minh Tú', avatar: 'NMT', avatarColor: '#5865f2', time: '14:32', groupCount: 3, content: 'Em bị lỗi "segmentation fault" khi chạy bài lab 3 phần con trỏ...', summary: '3 sinh viên gặp segfault trong lab 3 (con trỏ). Có thể là lỗi malloc/free phổ biến.', handled: true },
  { id: 'yd2', priority: 'P0', channel: 'cau-hoi-chung', author: 'Phạm Thị Lan', avatar: 'PTL', avatarColor: '#eb459e', time: '16:10', groupCount: 2, content: 'Deadline bài tập tuần này là thứ mấy ạ?', summary: '2 sinh viên hỏi deadline tuần 5. Thông tin chưa được thông báo rõ.', handled: true },
]

const TODAY_QUESTIONS: DigestQuestion[] = [
  {
    id: 'q1',
    lastMessageId: 'l3i',
    priority: 'P0',
    channel: 'lab-3-ho-tro',
    author: 'Vũ Đức Thành',
    avatar: 'VDT',
    avatarColor: '#fee75c',
    time: '09:14',
    groupCount: 1,
    content: 'Em không hiểu tại sao hàm đệ quy bị stack overflow dù đã có điều kiện dừng.',
    summary: 'Stack overflow trong đệ quy — base case có thể sai logic. Chưa ai trả lời dứt điểm.',
    conversationText: `Vũ Đức Thành: "Em không hiểu tại sao hàm đệ quy của em bị stack overflow dù đã có điều kiện dừng. Mọi người giúp em với!"\nTrần Khánh: "Bạn share code đệ quy ra đây đi, mình xem thử"\nVũ Đức Thành: "int factorial(int n) { if (n == 0) return 1; return n * factorial(n); } Em không thấy lỗi chỗ nào cả 😭"\nTrần Khánh: "À mình thấy rồi! Dòng return n * factorial(n) phải là factorial(n - 1) chứ bạn. Base case đúng nhưng recursive case không giảm n nên loop mãi."`,
    handled: false,
  },
  {
    id: 'q2',
    lastMessageId: 'l3f',
    priority: 'P0',
    channel: 'lab-3-ho-tro',
    author: 'Lê Thị Bích',
    avatar: 'LTB',
    avatarColor: '#ed4245',
    time: '10:51',
    groupCount: 4,
    content: 'Bài Lab 3 Exercise 4 yêu cầu cài thư viện gì thêm không? Em làm theo đề bị lỗi import.',
    summary: '4 sinh viên hỏi về thư viện cần cài cho Lab 3 Ex4. Có thể thiếu hướng dẫn môi trường.',
    conversationText: `Lê Thị Bích: "Mọi người ơi bài Lab 3 Exercise 4 yêu cầu cài thư viện gì thêm không? Em làm theo đề bị lỗi import."\nNgô Phúc: "Mình cũng bị, thử #include <stdlib.h> chưa bạn?"\nLê Thị Bích: "Rồi nhưng vẫn lỗi bạn ơi. Lỗi báo 'undefined reference to qsort'"\nVũ Mạnh: "Bạn compile với flag -lm chưa? Đôi khi cần link thêm thư viện toán"`,
    handled: false,
  },
  {
    id: 'q3',
    lastMessageId: 'chg6',
    priority: 'P0',
    channel: 'cau-hoi-chung',
    author: 'Hoàng Minh Đức',
    avatar: 'HMĐ',
    avatarColor: '#3ba55d',
    time: '13:05',
    groupCount: 2,
    content: 'Deadline nộp báo cáo Lab 3 có dời không ạ? Không thấy thông báo chính thức.',
    summary: '2 sinh viên hỏi về việc dời deadline Lab 3. Cần xác nhận để tránh nhầm lẫn.',
    conversationText: `Hoàng Minh Đức: "Deadline nộp báo cáo Lab 3 có dời không ạ? Em thấy một bạn nhắn thầy dời rồi nhưng không thấy thông báo chính thức."\nTrần Bảo: "Mình cũng thắc mắc vụ này, có ai biết không?"`,
    handled: false,
  },
  {
    id: 'q4',
    lastMessageId: 'l1e',
    priority: 'P1',
    channel: 'lab-1-ho-tro',
    author: 'Đỗ Thị Mai',
    avatar: 'DTM',
    avatarColor: '#5865f2',
    time: '11:22',
    groupCount: 2,
    content: 'Code em chạy đúng kết quả nhưng bị trừ điểm style. Em không hiểu phần nào bị sai.',
    summary: '2 sinh viên thắc mắc tiêu chí chấm style. Cần giải thích rõ coding conventions.',
    conversationText: `Đỗ Thị Mai: "Code em chạy đúng kết quả nhưng bị trừ điểm style. Em không hiểu phần nào bị sai, có thể xem lại rubric không ạ?"\nPhạm Hùng: "Điểm style tính theo tiêu chí gì vậy thầy? Em thấy code mình đúng rồi nhưng vẫn bị trừ điểm phần này."\nLê Thu: "Bạn ơi style thường gồm: indent đúng, tên biến có nghĩa, có comment, không có dead code. Mình đoán vậy thôi"`,
    handled: false,
  },
  {
    id: 'q5',
    lastMessageId: 'dan7',
    priority: 'P1',
    channel: 'du-an-nhom',
    author: 'Bùi Thị Hương',
    avatar: 'BTH',
    avatarColor: '#eb459e',
    time: '14:37',
    groupCount: 1,
    content: 'Nhóm em chưa biết cách implement hàm delete cho doubly linked list.',
    summary: 'Nhóm hỏi về doubly linked list delete. Yêu cầu tài liệu hoặc gợi ý hướng tiếp cận.',
    conversationText: `Bùi Thị Hương: "Nhóm em chưa biết cách implement hàm delete cho doubly linked list. Có tài liệu tham khảo không ạ?"\nNguyễn An: "Bọn mình cũng đang tìm, bạn tìm được chưa?"\nTrần Long: "GeeksForGeeks có bài viết nhưng code C++ nên khó hiểu hơn chút"\nBùi Thị Hương: "Mình tìm được video YouTube giải thích nhưng vẫn chưa rõ phần update prev pointer"\nLê Đạt: "Nhóm mình vừa xong phần đó, chiều tối hop gg meet giải thích cho bạn được không?"\nBùi Thị Hương: "Được bạn ơi! 7h tối nhé 🙏"`,
    handled: false,
  },
  {
    id: 'q6',
    lastMessageId: 'chg7',
    priority: 'P1',
    channel: 'cau-hoi-chung',
    author: 'Trần Quốc Bảo',
    avatar: 'TQB',
    avatarColor: '#faa61a',
    time: '17:48',
    groupCount: 1,
    content: 'Thầy ơi, slide bài giảng tuần 7 có upload lên Moodle chưa ạ?',
    summary: 'Sinh viên hỏi về tài liệu tuần 7 trên Moodle.',
    conversationText: `Trần Quốc Bảo: "Thầy ơi, slide bài giảng tuần 7 có upload lên Moodle chưa ạ? Em tìm không thấy."\nVũ Lan: "Mình cũng tìm không thấy tuần 7 bạn ơi"`,
    handled: false,
  },
]

const P = {
  P0: { color: '#ed4245', bg: 'rgba(237,66,69,0.10)', border: 'rgba(237,66,69,0.28)', badgeBg: '#ed4245' },
  P1: { color: '#faa61a', bg: 'rgba(250,166,26,0.09)', border: 'rgba(250,166,26,0.28)', badgeBg: '#faa61a' },
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function md(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:#1e1f22;padding:1px 5px;border-radius:3px;font-size:.82em;font-family:monospace">$1</code>')
    .replace(/\n/g, '<br/>')
}

function codify(text: string) {
  // render ```c ... ``` blocks
  return text.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) =>
    `<pre style="background:#1e1f22;padding:10px 12px;border-radius:6px;font-size:12px;font-family:monospace;overflow-x:auto;margin:4px 0;line-height:1.6">${code.replace(/</g, '&lt;')}</pre>`
  ).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:#1e1f22;padding:1px 5px;border-radius:3px;font-size:.82em;font-family:monospace">$1</code>')
    .replace(/\n/g, '<br/>')
}

function Avatar({ initials, color, size = 40 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size, background: color, borderRadius: size >= 36 ? '50%' : 8, fontSize: size * 0.34 }}
      className="flex items-center justify-center font-bold text-white flex-shrink-0 select-none"
    >
      {initials}
    </div>
  )
}

function BotAvatar({ size = 40 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size >= 36 ? '50%' : 8, background: '#23272a', border: '1px solid rgba(88,101,242,0.4)' }}
      className="flex items-center justify-center flex-shrink-0">
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="#5865f2">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
  )
}

function DiscordIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.129 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 19.791 19.791 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.372-.292.246-.198.373-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  )
}

// ─── Channel view ─────────────────────────────────────────────────────────────

function ReplyBar({ msg }: { msg: ChannelMsg }) {
  // The curved reply line SVG Discord uses
  return (
    <div className="flex items-center gap-1.5 mb-0.5 ml-[52px]">
      {/* Curved connector */}
      <svg width="28" height="18" viewBox="0 0 28 18" fill="none" className="flex-shrink-0 -mr-1">
        <path d="M4 0 Q4 14 14 14 H28" stroke="#4e5058" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
      <div className="flex items-center gap-1.5 min-w-0">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-white"
          style={{ background: msg.avatarColor || '#5865f2', fontSize: 7 }}
        >
          {msg.avatar.slice(0, 1)}
        </div>
        <span className="text-xs font-semibold text-[#949ba4] hover:text-white cursor-pointer transition-colors truncate"
          style={{ maxWidth: 100 }}>
          {msg.author}
        </span>
        <span className="text-xs text-[#4e5058] truncate min-w-0">
          {msg.content.replace(/```[\s\S]*?```/g, '[code]').replace(/\n/g, ' ').slice(0, 60)}
          {msg.content.length > 60 ? '…' : ''}
        </span>
      </div>
    </div>
  )
}

function MessageActionBar({ onReply }: { onReply: () => void }) {
  return (
    <div className="absolute right-2 -top-4 flex items-center bg-[#2b2d31] border border-[#1e1f22] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
      {/* Emoji */}
      <button className="w-8 h-8 flex items-center justify-center text-[#949ba4] hover:text-white hover:bg-[#35363c] rounded transition-colors" title="Thêm reaction">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
        </svg>
      </button>
      {/* Reply */}
      <button
        onClick={onReply}
        className="w-8 h-8 flex items-center justify-center text-[#949ba4] hover:text-white hover:bg-[#35363c] rounded transition-colors"
        title="Trả lời"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.4 8.4 4 12l5.4 3.6V13c3.9 0 6.6 1.3 8.6 4-.8-4-3.1-8-8.6-8.6V8.4z" />
        </svg>
      </button>
      {/* More */}
      <button className="w-8 h-8 flex items-center justify-center text-[#949ba4] hover:text-white hover:bg-[#35363c] rounded transition-colors" title="Thêm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
        </svg>
      </button>
    </div>
  )
}

function ChannelView({
  channelId,
  highlightId,
  onHighlightDone,
}: {
  channelId: ChannelId
  highlightId: string | null
  onHighlightDone: () => void
}) {
  const [baseMessages, setBaseMessages] = useState<ChannelMsg[]>(() => CHANNEL_MESSAGES[channelId] ?? [])
  const [replyingTo, setReplyingTo] = useState<ChannelMsg | null>(null)
  const [inputValue, setInputValue] = useState('')
  const meta = CHANNEL_META[channelId]
  const msgRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset when channel changes
  useEffect(() => {
    setBaseMessages(CHANNEL_MESSAGES[channelId] ?? [])
    setReplyingTo(null)
    setInputValue('')
  }, [channelId])

  useEffect(() => {
    if (highlightId && msgRefs.current[highlightId]) {
      msgRefs.current[highlightId]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [channelId, highlightId])

  // Build a lookup map for replyToId resolution
  const msgById = Object.fromEntries(baseMessages.map(m => [m.id, m]))

  const handleReply = (msg: ChannelMsg) => {
    setReplyingTo(msg)
    inputRef.current?.focus()
  }

  const handleSend = () => {
    const val = inputValue.trim()
    if (!val) return
    const newMsg: ChannelMsg = {
      id: `user_${Date.now()}`,
      author: 'lab.coach',
      avatar: 'LC',
      avatarColor: '#5865f2',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      content: val,
      replyToId: replyingTo?.id,
    }
    setBaseMessages(prev => [...prev, newMsg])
    setReplyingTo(null)
    setInputValue('')
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Channel header */}
      <div className="flex items-center gap-3 px-4 h-12 border-b border-[#1e1f22] flex-shrink-0">
        <span className="text-white/60 text-base">{meta.icon}</span>
        <span className="font-semibold text-white text-sm">{meta.label}</span>
        <div className="w-px h-5 bg-[#35363c] mx-1" />
        <span className="text-sm text-[#949ba4] truncate">{meta.topic}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Welcome banner */}
        <div className="mb-6 pb-4 border-b border-[#35363c]">
          <div className="text-3xl mb-2">{meta.icon === '#' ? '#️⃣' : meta.icon}</div>
          <h2 className="text-white text-xl font-bold">Chào mừng đến #{meta.label}!</h2>
          <p className="text-[#949ba4] text-sm mt-1">{meta.topic}</p>
        </div>

        {baseMessages.map((msg, idx) => {
          const prev = baseMessages[idx - 1]
          const repliedMsg = msg.replyToId ? msgById[msg.replyToId] : null
          // Break same-author grouping when there's a reply bar or code block in prev
          const sameAuthor = !repliedMsg && prev && prev.author === msg.author &&
            !prev.content?.includes('```') && !baseMessages[idx - 1]?.replyToId
          const isHighlighted = msg.id === highlightId

          return (
            <div key={msg.id} className={repliedMsg ? 'mt-4' : sameAuthor ? 'mt-0.5' : 'mt-4'}>
              {/* Reply context bar */}
              {repliedMsg && <ReplyBar msg={repliedMsg} />}

              {/* Message row */}
              <div
                ref={el => { msgRefs.current[msg.id] = el }}
                onAnimationEnd={isHighlighted ? onHighlightDone : undefined}
                className={`relative flex items-start gap-3 rounded px-2 py-0.5 group ${isHighlighted ? 'channel-highlight' : 'hover:bg-white/[0.02]'}`}
              >
                {!sameAuthor
                  ? msg.isBot
                    ? <BotAvatar />
                    : <Avatar initials={msg.avatar} color={msg.avatarColor} />
                  : <div className="w-10 flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  {!sameAuthor && (
                    <div className="flex items-center gap-2 mb-0.5">
                      {msg.isBot
                        ? <><span className="text-sm font-semibold text-[#5865f2]">DigestBot</span><span className="text-[10px] bg-[#5865f2] text-white px-1.5 py-0.5 rounded font-semibold">BOT</span></>
                        : <span className="text-sm font-semibold text-white">{msg.author}</span>
                      }
                      <span className="text-xs text-[#949ba4]">{msg.time}</span>
                      {isHighlighted && (
                        <span className="ml-1 text-xs text-[#5865f2] font-mono animate-pulse">← từ digest</span>
                      )}
                    </div>
                  )}
                  <div
                    className="text-sm text-[#dbdee1] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: codify(msg.content) }}
                  />
                </div>

                {/* Hover action bar */}
                <MessageActionBar onReply={() => handleReply(msg)} />
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#383a40] border-t border-[#1e1f22] text-xs text-[#949ba4]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#949ba4] flex-shrink-0">
            <path d="M9.4 8.4 4 12l5.4 3.6V13c3.9 0 6.6 1.3 8.6 4-.8-4-3.1-8-8.6-8.6V8.4z" />
          </svg>
          <span>Đang trả lời <strong className="text-white">{replyingTo.author}</strong></span>
          <span className="text-[#4e5058] truncate flex-1">
            {replyingTo.content.replace(/```[\s\S]*?```/g, '[code]').replace(/\n/g, ' ').slice(0, 50)}
          </span>
          <button onClick={() => setReplyingTo(null)} className="ml-auto text-[#949ba4] hover:text-white transition-colors text-base leading-none">×</button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-6 pt-2 flex-shrink-0">
        <div className="flex items-center gap-3 bg-[#383a40] rounded-xl px-4 py-3">
          <button className="text-[#949ba4] hover:text-white transition-colors flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
          </button>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder={replyingTo ? `Trả lời ${replyingTo.author}…` : `Nhắn tin vào #${meta.label}…`}
            className="flex-1 bg-transparent text-[#dbdee1] placeholder-[#6d6f78] text-sm outline-none"
          />
          <button onClick={handleSend} disabled={!inputValue.trim()}
            className="text-[#949ba4] hover:text-[#5865f2] transition-colors disabled:opacity-30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Digest view ──────────────────────────────────────────────────────────────

function QuestionCard({
  q,
  onJump,
  onHandled,
}: {
  q: DigestQuestion
  onJump: (q: DigestQuestion) => void
  onHandled: (id: string) => void
}) {
  const s = P[q.priority]
  return (
    <div className={`rounded-lg border p-3 transition-opacity ${q.handled ? 'opacity-40' : ''}`}
      style={{ background: s.bg, borderColor: s.border }}>
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <Avatar initials={q.avatar} color={q.avatarColor} size={20} />
        <span className="text-xs font-semibold text-white">{q.author}</span>
        <span className="text-xs text-[#949ba4] font-mono">#{CHANNEL_META[q.channel].label}</span>
        <span className="text-xs text-[#949ba4] font-mono">{q.time}</span>
        {q.groupCount > 1 && (
          <span className="text-xs bg-white/10 text-white/60 px-1.5 py-0.5 rounded font-mono">+{q.groupCount - 1} tương tự</span>
        )}
        {q.handled && <span className="ml-auto text-xs text-[#57f287] font-semibold">✅ Đã xử lý</span>}
      </div>
      <p className="text-xs text-[#b5bac1] leading-relaxed mb-2"
        dangerouslySetInnerHTML={{ __html: md(q.summary) }} />

      {/* Chuỗi hội thoại */}
      {q.conversationText && (
        <div className="my-2.5 rounded bg-[#1e1f22] border border-[#35363c] p-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#949ba4] uppercase tracking-wider mb-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            <span>Đoạn hội thoại ({q.conversationText.split('\n').filter(Boolean).length} tin nhắn)</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto pr-1">
            {q.conversationText.split('\n').filter(Boolean).map((line, lIdx, arr) => {
              const colonIdx = line.indexOf(':')
              const isLast = lIdx === arr.length - 1
              if (colonIdx > 0) {
                const user = line.slice(0, colonIdx).trim()
                const text = line.slice(colonIdx + 1).trim()
                return (
                  <div key={lIdx} className={`p-1.5 rounded transition-colors ${isLast ? 'bg-[#5865f2]/20 border-l-2 border-[#5865f2]' : 'hover:bg-white/[0.03]'}`}>
                    <span className={`font-semibold ${isLast ? 'text-[#8ea1e1]' : 'text-[#dbdee1]'}`}>{user}:</span>
                    <span className="text-[#b5bac1] ml-1.5 font-sans text-xs">{text}</span>
                    {isLast && (
                      <span className="ml-2 text-[9px] bg-[#5865f2]/40 text-[#c9cdfb] px-1.5 py-0.5 rounded font-sans uppercase font-bold tracking-wide">
                        Tin cuối ➜
                      </span>
                    )}
                  </div>
                )
              }
              return <div key={lIdx} className="text-[#949ba4] p-1">{line}</div>
            })}
          </div>
        </div>
      )}

      {!q.handled && (
        <div className="flex items-center gap-2 mt-2.5">
          <button
            onClick={() => onJump(q)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-semibold transition-colors"
          >
            🔗 Nhảy đến tin nhắn
          </button>
          <button
            onClick={() => onHandled(q.id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/5 hover:bg-[#57f287]/15 text-[#949ba4] hover:text-[#57f287] text-xs font-medium border border-white/5 hover:border-[#57f287]/30 transition-colors"
          >
            ✅ Đánh dấu xử lý
          </button>
        </div>
      )}
    </div>
  )
}

function DigestEmbed({
  block, msgId, onJump, onHandled, reactions, onReact,
}: {
  block: DigestBlock; msgId: string; onJump: (q: DigestQuestion) => void
  onHandled: (id: string) => void; reactions: Reaction[]; onReact: (id: string, emoji: string) => void
}) {
  const s = P[block.priority]
  return (
    <div className="mt-1 max-w-[560px]">
      <div className="rounded-lg overflow-hidden" style={{ borderLeft: `4px solid ${s.color}`, background: '#2b2d31' }}>
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ background: s.color }}>{block.priority}</span>
            <span className="text-sm font-semibold text-white">{block.label}</span>
            <span className="text-xs text-[#949ba4] ml-auto font-mono">{block.questions.length} câu</span>
          </div>
          <div className="space-y-2">
            {block.questions.map(q => (
              <QuestionCard key={q.id} q={q} onJump={onJump} onHandled={onHandled} />
            ))}
          </div>
        </div>
      </div>
      {reactions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {reactions.map(r => (
            <button key={r.emoji} onClick={() => onReact(msgId, r.emoji)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs transition-colors ${r.mine ? 'bg-[#5865f2]/20 border-[#5865f2]/50 text-white' : 'bg-[#2b2d31] border-white/10 text-[#949ba4] hover:bg-[#35363c]'}`}>
              {r.emoji} <span className="font-mono">{r.count}</span>
            </button>
          ))}
          <button onClick={() => onReact(msgId, '✅')}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/10 text-[#949ba4] hover:bg-[#35363c] text-xs transition-colors" title="Thêm reaction">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></svg>
          </button>
        </div>
      )}
    </div>
  )
}

function DigestMsgRow({
  msg, prevMsg, onJump, onHandled, reactions, onReact,
}: {
  msg: DigestChatMsg; prevMsg?: DigestChatMsg
  onJump: (q: DigestQuestion) => void; onHandled: (id: string) => void
  reactions: Record<string, Reaction[]>; onReact: (id: string, emoji: string) => void
}) {
  if (msg.type === 'system') {
    return (
      <div className="flex items-center gap-3 py-1 px-2">
        <div className="flex-1 h-px bg-[#35363c]" />
        <span className="text-xs text-[#949ba4] whitespace-nowrap">{msg.content}</span>
        <div className="flex-1 h-px bg-[#35363c]" />
      </div>
    )
  }
  if (msg.type === 'processing') {
    return (
      <div className="flex items-start gap-3 px-2 mt-4">
        <BotAvatar />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-[#5865f2]">DigestBot</span>
            <span className="text-[10px] bg-[#5865f2] text-white px-1.5 py-0.5 rounded font-semibold">BOT</span>
            <span className="text-xs text-[#949ba4]">{msg.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#949ba4]">
            {msg.content}
            <span className="flex gap-1">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#949ba4] animate-bounce inline-block" style={{ animationDelay: `${i*0.15}s` }} />)}</span>
          </div>
        </div>
      </div>
    )
  }

  const sameAuthor = prevMsg && prevMsg.author === msg.author && prevMsg.type === msg.type && !prevMsg.blocks
  const isBot = msg.type === 'bot'

  return (
    <div className={`flex items-start gap-3 hover:bg-white/[0.02] rounded px-2 py-0.5 ${sameAuthor ? 'mt-0.5' : 'mt-4'}`}>
      {!sameAuthor ? isBot ? <BotAvatar /> : <Avatar initials={msg.avatar} color={msg.avatarColor} /> : <div className="w-10 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        {!sameAuthor && (
          <div className="flex items-center gap-2 mb-0.5">
            {isBot
              ? <><span className="text-sm font-semibold text-[#5865f2]">DigestBot</span><span className="text-[10px] bg-[#5865f2] text-white px-1.5 py-0.5 rounded font-semibold">BOT</span></>
              : <span className="text-sm font-semibold text-white">{msg.author}</span>
            }
            {msg.isCron && <span className="text-[10px] bg-[#faa61a]/20 text-[#faa61a] px-1.5 py-0.5 rounded font-mono border border-[#faa61a]/30">⏰ Cron {msg.cronTime || msg.time}</span>}
            <span className="text-xs text-[#949ba4]">{msg.time}</span>
          </div>
        )}
        {msg.content && <p className="text-sm text-[#dbdee1] leading-relaxed" dangerouslySetInnerHTML={{ __html: md(msg.content) }} />}
        {msg.blocks && msg.blocks.map(block => (
          <DigestEmbed key={block.id} block={block} msgId={`${msg.id}_${block.id}`}
            onJump={onJump} onHandled={onHandled}
            reactions={reactions[`${msg.id}_${block.id}`] ?? []}
            onReact={onReact}
          />
        ))}
      </div>
    </div>
  )
}

function DigestView({
  digestMsgs, setDigestMsgs, questions, setQuestions, onJump,
}: {
  digestMsgs: DigestChatMsg[]
  setDigestMsgs: React.Dispatch<React.SetStateAction<DigestChatMsg[]>>
  questions: DigestQuestion[]
  setQuestions: React.Dispatch<React.SetStateAction<DigestQuestion[]>>
  onJump: (q: DigestQuestion) => void
}) {
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') || '' : ''))
  const [selectedModel, setSelectedModel] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('GEMINI_MODEL') || 'gemini-3.1-flash-lite' : 'gemini-3.1-flash-lite'))
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' })
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({})
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [digestMsgs])

  const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  const handleReact = (msgId: string, emoji: string) => {
    setReactions(prev => {
      const cur = prev[msgId] ?? []
      const found = cur.find(r => r.emoji === emoji)
      if (found) {
        const updated = found.mine
          ? cur.map(r => r.emoji === emoji ? { ...r, count: r.count - 1, mine: false } : r).filter(r => r.count > 0)
          : cur.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, mine: true } : r)
        return { ...prev, [msgId]: updated }
      }
      return { ...prev, [msgId]: [...cur, { emoji, count: 1, mine: true }] }
    })
  }

  const triggerDigest = async (slotTime?: string, isAutoCron = false) => {
    setLoading(true)
    const msgTime = slotTime || nowStr
    const isCron = Boolean(isAutoCron || slotTime)

    const procMsg: DigestChatMsg = {
      id: `proc_${Date.now()}`,
      type: 'processing',
      author: 'DigestBot',
      avatar: '',
      avatarColor: '',
      time: msgTime,
      content: slotTime
        ? `Gemini AI đang kéo và phân tích tin nhắn ca ${slotTime}...`
        : 'Gemini AI đang phân tích tin nhắn từ các kênh công khai...',
    }
    setDigestMsgs(prev => [...prev, procMsg])

    try {
      // Lọc tin nhắn tới mốc thời gian của ca cron (nếu có)
      const conversations = reconstructConversations(CHANNEL_MESSAGES, slotTime)
      const promptText = formatConversationsForAI(conversations)

      // Xây dựng bảng tra cứu ID tin nhắn cuối cùng và text conversation
      const lastMsgLookup = new Map<string, string>()
      const convLookup = new Map<string, any>()

      conversations.forEach(c => {
        lastMsgLookup.set(c.convId, c.lastMessage.id)
        lastMsgLookup.set(c.firstMessage.id, c.lastMessage.id)
        lastMsgLookup.set(c.lastMessage.id, c.lastMessage.id)
        convLookup.set(c.convId, c)
        convLookup.set(c.firstMessage.id, c)
        convLookup.set(c.lastMessage.id, c)
        c.messages.forEach(m => {
          lastMsgLookup.set(m.id, c.lastMessage.id)
          convLookup.set(m.id, c)
        })
      })

      const result = await callGeminiDigest(promptText, apiKeyInput.trim() || undefined, selectedModel)

      const formattedQuestions: DigestQuestion[] = (result.questions || []).map((q, idx) => {
        const matchingConv =
          convLookup.get(q.convId || '') ||
          convLookup.get(q.lastMessageId || '') ||
          convLookup.get(q.id) ||
          convLookup.get(q.firstMessageId || '')

        const resolvedLastId =
          matchingConv?.lastMessage.id ||
          lastMsgLookup.get(q.lastMessageId || '') ||
          lastMsgLookup.get(q.id) ||
          lastMsgLookup.get(q.convId || '') ||
          q.lastMessageId ||
          q.id

        const conversationText = matchingConv?.conversationText || q.conversationText || ''

        return {
          id: q.id || `ai_q_${idx}`,
          lastMessageId: resolvedLastId,
          firstMessageId: q.firstMessageId,
          convId: q.convId,
          conversationText,
          priority: q.priority === 'P0' ? 'P0' : 'P1',
          channel: q.channel || (matchingConv ? matchingConv.channel : 'cau-hoi-chung'),
          author: q.author || (matchingConv ? matchingConv.firstMessage.author : 'Học viên'),
          avatar: q.avatar || (q.author ? q.author.slice(0, 2).toUpperCase() : 'HV'),
          avatarColor: q.avatarColor || '#5865f2',
          time: q.time || msgTime,
          content: q.content || '',
          summary: q.summary || '',
          groupCount: q.groupCount || 1,
          handled: false,
        }
      })

      setQuestions(formattedQuestions)

      const p0 = formattedQuestions.filter(q => q.priority === 'P0')
      const p1 = formattedQuestions.filter(q => q.priority === 'P1')

      const summaryMsg: DigestChatMsg = {
        id: `sum_${Date.now()}`,
        type: 'bot',
        author: 'DigestBot',
        avatar: '',
        avatarColor: '',
        time: msgTime,
        isBot: true,
        isCron,
        cronTime: slotTime,
        content: `🤖 **Gemini Digest ${slotTime ? `(Ca Cron ${slotTime})` : '— Quét trực tiếp'} — ${new Date().toLocaleDateString('vi-VN')}**\n\n${result.summary || `Phát hiện **${formattedQuestions.length} câu hỏi** chưa được phản hồi.`}\n\n*Bấm 🔗 để nhảy đến tin nhắn cuối cùng trong chuỗi. React ✅ vào embed để báo đã xử lý.*`,
      }

      const p0Msg: DigestChatMsg | null =
        p0.length > 0
          ? {
              id: `p0_${Date.now()}`,
              type: 'bot',
              author: 'DigestBot',
              avatar: '',
              avatarColor: '',
              time: msgTime,
              isBot: true,
              isCron,
              cronTime: slotTime,
              blocks: [
                {
                  id: 'p0',
                  priority: 'P0',
                  label: 'Blocker / Deadline — cần xử lý ngay',
                  color: '#ed4245',
                  questions: p0,
                },
              ],
            }
          : null

      const p1Msg: DigestChatMsg | null =
        p1.length > 0
          ? {
              id: `p1_${Date.now()}`,
              type: 'bot',
              author: 'DigestBot',
              avatar: '',
              avatarColor: '',
              time: msgTime,
              isBot: true,
              isCron,
              cronTime: slotTime,
              blocks: [
                {
                  id: 'p1',
                  priority: 'P1',
                  label: 'Thủ tục / Hỏi thêm — xử lý khi có thời gian',
                  color: '#faa61a',
                  questions: p1,
                },
              ],
            }
          : null

      setDigestMsgs(prev => {
        const filtered = prev.filter(m => m.type !== 'processing')
        return [...filtered, summaryMsg, ...(p0Msg ? [p0Msg] : []), ...(p1Msg ? [p1Msg] : [])]
      })
    } catch (err: any) {
      console.error('Gemini Digest Error:', err)
      const errorMsg: DigestChatMsg = {
        id: `err_${Date.now()}`,
        type: 'bot',
        author: 'DigestBot',
        avatar: '',
        avatarColor: '',
        time: msgTime,
        isBot: true,
        content: `❌ **Lỗi khi gọi Gemini AI:** ${err?.message || 'Không thể kết nối'}.\n\n*Cách khắc phục:*\n- Bấm nút **⚙️ API** góc trên để kiểm tra hoặc đổi API Key/Model.\n- Dùng lệnh \`/digest demo\` nếu bạn muốn tải ngay dữ liệu mô phỏng.`,
      }
      setDigestMsgs(prev => [...prev.filter(m => m.type !== 'processing'), errorMsg])
    } finally {
      setLoading(false)
    }
  }

  // Auto-cron scheduler: tự động kéo dữ liệu vào lúc 13:30, 18:30, và 21:30 mỗi ngày
  useEffect(() => {
    const triggeredSlots = new Set<string>()

    const checkCron = () => {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const currentClock = `${hh}:${mm}`
      const todayDate = now.toDateString()

      const CRON_SLOTS = ['13:30', '18:30', '21:30']
      for (const slot of CRON_SLOTS) {
        const slotKey = `${todayDate}_${slot}`
        if (currentClock === slot && !triggeredSlots.has(slotKey)) {
          triggeredSlots.add(slotKey)
          console.log(`[DigestBot Cron] Tự động kích hoạt kéo dữ liệu lúc ${slot}`)
          triggerDigest(slot, true)
        }
      }
    }

    const intervalId = setInterval(checkCron, 10000)
    return () => clearInterval(intervalId)
  }, [selectedModel, apiKeyInput])

  const loadDemoData = (slotTime?: string) => {
    setLoading(true)
    const msgTime = slotTime || nowStr
    const isCron = Boolean(slotTime)

    const procMsg: DigestChatMsg = {
      id: `proc_${Date.now()}`,
      type: 'processing',
      author: 'DigestBot',
      avatar: '',
      avatarColor: '',
      time: msgTime,
      content: `Đang tải bản tin mô phỏng ${slotTime ? `ca ${slotTime}` : ''}...`,
    }
    setDigestMsgs(prev => [...prev, procMsg])
    setTimeout(() => {
      const questionsToUse = slotTime
        ? TODAY_QUESTIONS.filter(q => !q.time || q.time <= slotTime)
        : TODAY_QUESTIONS

      setQuestions(questionsToUse)
      const p0 = questionsToUse.filter(q => q.priority === 'P0')
      const p1 = questionsToUse.filter(q => q.priority === 'P1')

      const summaryMsg: DigestChatMsg = {
        id: `sum_${Date.now()}`,
        type: 'bot',
        author: 'DigestBot',
        avatar: '',
        avatarColor: '',
        time: msgTime,
        isBot: true,
        isCron,
        cronTime: slotTime,
        content: `📋 **Digest mô phỏng ${slotTime ? `(Ca Cron ${slotTime})` : ''} — ${new Date().toLocaleDateString('vi-VN')}**\n\nĐã phát hiện **${questionsToUse.length} câu hỏi** từ các kênh thảo luận (kèm chuỗi đối thoại). Bấm 🔗 để nhảy đến tin nhắn cuối cùng trong chuỗi.`,
      }

      const p0Msg: DigestChatMsg | null =
        p0.length > 0
          ? {
              id: `p0_${Date.now()}`,
              type: 'bot',
              author: 'DigestBot',
              avatar: '',
              avatarColor: '',
              time: msgTime,
              isBot: true,
              isCron,
              cronTime: slotTime,
              blocks: [
                {
                  id: 'p0',
                  priority: 'P0',
                  label: 'Blocker / Deadline — cần xử lý ngay',
                  color: '#ed4245',
                  questions: p0,
                },
              ],
            }
          : null

      const p1Msg: DigestChatMsg | null =
        p1.length > 0
          ? {
              id: `p1_${Date.now()}`,
              type: 'bot',
              author: 'DigestBot',
              avatar: '',
              avatarColor: '',
              time: msgTime,
              isBot: true,
              isCron,
              cronTime: slotTime,
              blocks: [
                {
                  id: 'p1',
                  priority: 'P1',
                  label: 'Thủ tục / Hỏi thêm — xử lý khi có thời gian',
                  color: '#faa61a',
                  questions: p1,
                },
              ],
            }
          : null

      setDigestMsgs(prev => {
        const filtered = prev.filter(m => m.type !== 'processing')
        return [...filtered, summaryMsg, ...(p0Msg ? [p0Msg] : []), ...(p1Msg ? [p1Msg] : [])]
      })
      setLoading(false)
    }, 400)
  }

  const handleTest = async () => {
    setTestResult({ status: 'testing', message: 'Đang kiểm tra kết nối tới Google Gemini API...' })
    const res = await testGeminiConnection(apiKeyInput.trim(), selectedModel)
    if (res.success) {
      setTestResult({ status: 'success', message: `✅ Kết nối thành công tới ${res.model}!` })
    } else {
      setTestResult({ status: 'error', message: `❌ ${res.message}` })
    }
  }

  const handleSend = () => {
    const val = inputValue.trim()
    if (!val || loading) return
    setInputValue('')
    const userMsg: DigestChatMsg = { id: `u_${Date.now()}`, type: 'user', author: 'lab.coach', avatar: 'LC', avatarColor: '#5865f2', time: nowStr, content: val }
    setDigestMsgs(prev => [...prev, userMsg])

    if (val === '/digest now') {
      triggerDigest()
    } else if (val === '/digest 13:30' || val === '/digest 13h30') {
      triggerDigest('13:30')
    } else if (val === '/digest 18:30' || val === '/digest 18h30') {
      triggerDigest('18:30')
    } else if (val === '/digest 21:30' || val === '/digest 21h30') {
      triggerDigest('21:30')
    } else if (val === '/digest demo') {
      loadDemoData()
    } else if (val === '/digest demo 13:30' || val === '/digest demo 13h30') {
      loadDemoData('13:30')
    } else if (val === '/digest demo 18:30' || val === '/digest demo 18h30') {
      loadDemoData('18:30')
    } else if (val === '/digest demo 21:30' || val === '/digest demo 21h30') {
      loadDemoData('21:30')
    } else {
      setTimeout(() => {
        setDigestMsgs(prev => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            type: 'bot',
            author: 'DigestBot',
            avatar: '',
            avatarColor: '',
            time: nowStr,
            isBot: true,
            content: `❓ Lệnh không hợp lệ. Các lệnh hỗ trợ:\n- \`/digest now\`: Quét toàn bộ tin nhắn hiện tại\n- \`/digest 13:30\`: Kéo dữ liệu ca 13:30\n- \`/digest 18:30\`: Kéo dữ liệu ca 18:30\n- \`/digest 21:30\`: Kéo dữ liệu ca 21:30\n- \`/digest demo\`: Xem bản tin mô phỏng`,
          },
        ])
      }, 600)
    }
  }

  const handleHandled = (qid: string) => {
    setQuestions(prev => prev.map(q => q.id === qid ? { ...q, handled: true } : q))
  }

  const pendingCount = questions.filter(q => !q.handled).length

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="flex items-center gap-3 px-4 h-12 border-b border-[#1e1f22] flex-shrink-0">
        <span className="text-white/60">🔒</span>
        <span className="font-semibold text-white text-sm">ta-internal-digest</span>
        <div className="w-px h-5 bg-[#35363c] mx-1" />
        <span className="text-sm text-[#949ba4]">Kênh nội bộ TA · Digest tự động lúc 13:30, 18:30, 21:30</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#35363c] hover:bg-[#3f4147] text-[#dbdee1] text-xs font-medium transition-colors"
            title="Cấu hình Gemini API Key"
          >
            ⚙️ API
          </button>
          {!loading ? (
            <div className="flex items-center bg-[#2b2d31] rounded p-0.5 border border-[#35363c]">
              <button
                onClick={() => triggerDigest('13:30')}
                className="px-2 py-1 rounded text-xs font-medium text-[#dbdee1] hover:bg-[#35363c] transition-colors"
                title="Kéo dữ liệu ca 13:30"
              >
                ⚡ 13:30
              </button>
              <button
                onClick={() => triggerDigest('18:30')}
                className="px-2 py-1 rounded text-xs font-medium text-[#dbdee1] hover:bg-[#35363c] transition-colors"
                title="Kéo dữ liệu ca 18:30"
              >
                ⚡ 18:30
              </button>
              <button
                onClick={() => triggerDigest('21:30')}
                className="px-2 py-1 rounded text-xs font-medium text-[#dbdee1] hover:bg-[#35363c] transition-colors"
                title="Kéo dữ liệu ca 21:30"
              >
                ⚡ 21:30
              </button>
              <button
                onClick={() => triggerDigest()}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-semibold transition-colors ml-0.5"
                title="Quét toàn bộ tin nhắn hiện tại"
              >
                ⚡ Now
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#5865f2]/50 text-white text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Đang phân tích...
            </div>
          )}
          {pendingCount > 0 && (
            <span className="text-xs bg-[#ed4245] text-white px-2 py-0.5 rounded-full font-bold">{pendingCount} chưa xử lý</span>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-[#313338] border border-[#1e1f22] rounded-xl p-5 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e1f22] mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🤖</span> Cấu hình Gemini AI
              </h3>
              <button onClick={() => setShowConfig(false)} className="text-[#949ba4] hover:text-white text-lg">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#b5bac1] mb-1">
                  Mô hình AI (Google AI Studio)
                </label>
                <select
                  value={selectedModel}
                  onChange={e => {
                    setSelectedModel(e.target.value)
                    localStorage.setItem('GEMINI_MODEL', e.target.value)
                  }}
                  className="w-full bg-[#1e1f22] border border-[#3f4147] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5865f2]"
                >
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Mặc định)</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#b5bac1] mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy... (hoặc để trống nếu đã cấu hình trong .env)"
                  className="w-full bg-[#1e1f22] border border-[#3f4147] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5865f2]"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-[#949ba4]">
                    {apiKeyInput || import.meta.env.VITE_GEMINI_API_KEY
                      ? '✅ Đã nhận diện API Key'
                      : '⚠️ Chưa có key. Lấy key tại aistudio.google.com'}
                  </span>
                  <button
                    type="button"
                    onClick={handleTest}
                    className="text-xs text-[#5865f2] hover:text-[#7983f5] font-semibold hover:underline"
                  >
                    🔍 Kiểm tra kết nối
                  </button>
                </div>
                {testResult.message && (
                  <div
                    className={`mt-2 p-2 rounded text-xs leading-relaxed ${
                      testResult.status === 'success'
                        ? 'bg-[#57f287]/15 text-[#57f287] border border-[#57f287]/30'
                        : testResult.status === 'error'
                        ? 'bg-[#ed4245]/15 text-[#ed4245] border border-[#ed4245]/30'
                        : 'bg-white/5 text-[#949ba4]'
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#1e1f22]">
              <button
                type="button"
                onClick={() => {
                  setShowConfig(false)
                  loadDemoData()
                }}
                className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs text-[#dbdee1] border border-white/10"
              >
                📋 Dùng dữ liệu demo
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('GEMINI_API_KEY')
                    setApiKeyInput('')
                    setTestResult({ status: 'idle', message: '' })
                  }}
                  className="px-2.5 py-1.5 rounded hover:bg-white/5 text-xs text-[#ed4245]"
                >
                  Xóa key
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (apiKeyInput.trim()) {
                      localStorage.setItem('GEMINI_API_KEY', apiKeyInput.trim())
                    }
                    localStorage.setItem('GEMINI_MODEL', selectedModel)
                    setShowConfig(false)
                  }}
                  className="px-4 py-1.5 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-semibold"
                >
                  Lưu cài đặt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {digestMsgs.map((msg, idx) => (
          <DigestMsgRow key={msg.id} msg={msg} prevMsg={digestMsgs[idx - 1]}
            onJump={onJump} onHandled={handleHandled}
            reactions={reactions} onReact={handleReact}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-6 pt-2 flex-shrink-0">
        <div className="flex items-center gap-3 bg-[#383a40] rounded-xl px-4 py-3">
          <button className="text-[#949ba4] hover:text-white transition-colors flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
          </button>
          <input ref={inputRef} value={inputValue} onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Gõ /digest now để gọi ngay, hoặc nhắn tin cho team…"
            className="flex-1 bg-transparent text-[#dbdee1] placeholder-[#6d6f78] text-sm outline-none"
            disabled={loading}
          />
          <button onClick={handleSend} disabled={!inputValue.trim() || loading}
            className="text-[#949ba4] hover:text-[#5865f2] transition-colors disabled:opacity-30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────

const YESTERDAY_MSGS: DigestChatMsg[] = (() => {
  const yp0 = YESTERDAY.filter(q => q.priority === 'P0')
  const yp1 = YESTERDAY.filter(q => q.priority === 'P1')
  return [
    { id: 'sys_yest', type: 'system', author: '', avatar: '', avatarColor: '', time: '', content: 'Hôm qua, 17/09/2026' },
    { id: 'bot_intro', type: 'bot', author: 'DigestBot', avatar: '', avatarColor: '', time: '08:00', isBot: true, content: 'Chào buổi sáng! 👋 Tôi là **DigestBot** — mỗi ngày vào các khung giờ **13:30**, **18:30**, và **21:30** tôi sẽ tự động kéo dữ liệu tin nhắn và gửi báo cáo các câu hỏi sinh viên chưa được trả lời vào đây.\n\nDùng lệnh `/digest now` hoặc chọn khung giờ bất kỳ lúc nào để quét kiểm tra khẩn cấp.' },
    { id: 'sum_y_1330', type: 'bot', author: 'DigestBot', avatar: '', avatarColor: '', time: '13:30', isCron: true, cronTime: '13:30', isBot: true, content: '📋 **Digest hôm qua — Ca 13:30**\n\nPhát hiện **1 câu hỏi chưa có phản hồi** trong buổi sáng — đã được TA phản hồi.' },
    { id: 'sum_y_1830', type: 'bot', author: 'DigestBot', avatar: '', avatarColor: '', time: '18:30', isCron: true, cronTime: '18:30', isBot: true, content: '📋 **Digest hôm qua — Ca 18:30**\n\nPhát hiện **1 câu hỏi chưa có phản hồi** trong buổi chiều — đã được TA phản hồi.' },
    { id: 'sum_y_2130', type: 'bot', author: 'DigestBot', avatar: '', avatarColor: '', time: '21:30', isCron: true, cronTime: '21:30', isBot: true, content: `📋 **Digest hôm qua — Ca 21:30**\n\nTổng kết cuối ngày: phát hiện **${YESTERDAY.length} câu hỏi chưa có phản hồi** — cần xem xét.` },
    ...(yp0.length > 0 ? [{ id: 'yp0msg', type: 'bot' as const, author: 'DigestBot', avatar: '', avatarColor: '', time: '21:30', isCron: true, cronTime: '21:30', isBot: true, blocks: [{ id: 'p0', priority: 'P0' as Priority, label: 'Blocker / Deadline', color: '#ed4245', questions: yp0 }] }] : []),
    ...(yp1.length > 0 ? [{ id: 'yp1msg', type: 'bot' as const, author: 'DigestBot', avatar: '', avatarColor: '', time: '21:30', isCron: true, cronTime: '21:30', isBot: true, blocks: [{ id: 'p1', priority: 'P1' as Priority, label: 'Thủ tục / Hỏi thêm', color: '#faa61a', questions: yp1 }] }] : []),
    { id: 'user_react', type: 'user', author: 'coach.minh', avatar: 'CM', avatarColor: '#3ba55d', time: '21:38', content: 'Đã xem, sẽ trả lời mấy bạn hỏi deadline trước 👍' },
    { id: 'sys_today', type: 'system', author: '', avatar: '', avatarColor: '', time: '', content: 'Hôm nay, 18/09/2026' },
  ]
})()

const SIDEBAR_CHANNELS: { id: ChannelId; section: 'public' | 'private' }[] = [
  { id: 'thong-bao', section: 'public' },
  { id: 'cau-hoi-chung', section: 'public' },
  { id: 'lab-1-ho-tro', section: 'public' },
  { id: 'lab-2-ho-tro', section: 'public' },
  { id: 'lab-3-ho-tro', section: 'public' },
  { id: 'du-an-nhom', section: 'public' },
  { id: 'chu-de-tu-do', section: 'public' },
  { id: 'ta-internal-digest', section: 'private' },
]

export default function App() {
  const [activeChannel, setActiveChannel] = useState<ChannelId>('ta-internal-digest')
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<DigestQuestion[]>(TODAY_QUESTIONS)
  const [digestMsgs, setDigestMsgs] = useState<DigestChatMsg[]>(YESTERDAY_MSGS)

  const pendingCount = questions.filter(q => !q.handled).length

  const handleJump = useCallback((q: DigestQuestion) => {
    // Chuyển đến tin nhắn cuối cùng trong chuỗi conversation
    const targetMsgId = q.lastMessageId || q.id

    // Tìm kênh chứa tin nhắn mục tiêu
    let channelId = (QUESTION_CHANNEL_MAP[q.id] || q.channel) as ChannelId
    for (const [ch, msgs] of Object.entries(CHANNEL_MESSAGES)) {
      if (msgs.some(m => m.id === targetMsgId || m.id === q.id)) {
        channelId = ch as ChannelId
        break
      }
    }

    setActiveChannel(channelId)
    setHighlightId(targetMsgId)
  }, [])

  return (
    <div className="h-screen flex bg-[#313338] overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Server strip */}
      <div className="w-[72px] flex-shrink-0 bg-[#1e1f22] flex flex-col items-center py-3 gap-2">
        <div className="w-12 h-12 rounded-[50%] hover:rounded-2xl bg-[#5865f2] flex items-center justify-center cursor-pointer transition-all">
          <DiscordIcon size={26} />
        </div>
        <div className="w-8 h-px bg-[#35363c] my-1" />
        {[{ n: 'C', c: '#5865f2' }, { n: 'L', c: '#3ba55d', active: true }, { n: 'T', c: '#eb459e' }].map((s, i) => (
          <div key={i} className="relative w-12 h-12 flex items-center justify-center font-bold text-white text-lg cursor-pointer rounded-2xl hover:rounded-xl transition-all" style={{ background: s.c }}>
            {s.n}
            {s.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full -ml-px" />}
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="w-[240px] flex-shrink-0 bg-[#2b2d31] flex flex-col">
        <div className="flex items-center justify-between px-4 h-12 border-b border-[#1e1f22] cursor-pointer hover:bg-[#35363c] transition-colors">
          <span className="font-semibold text-white text-sm">Lab 2024</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#b9bbbe"><path d="M7 10l5 5 5-5z" /></svg>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="text-xs font-semibold text-[#949ba4] uppercase tracking-wider px-2 py-1.5 mt-1">Kênh văn bản</div>
          {SIDEBAR_CHANNELS.filter(c => c.section === 'public').map(({ id }) => {
            const meta = CHANNEL_META[id]
            const isActive = activeChannel === id
            return (
              <button key={id} onClick={() => setActiveChannel(id)}
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors text-left ${isActive ? 'bg-[#35363c] text-white' : 'text-[#949ba4] hover:bg-[#35363c]/60 hover:text-[#dbdee1]'}`}>
                <span className="text-base">{meta.icon}</span>
                <span className="text-sm">{meta.label}</span>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />}
              </button>
            )
          })}

          <div className="text-xs font-semibold text-[#949ba4] uppercase tracking-wider px-2 py-1.5 mt-3">Kênh nội bộ</div>
          {SIDEBAR_CHANNELS.filter(c => c.section === 'private').map(({ id }) => {
            const meta = CHANNEL_META[id]
            const isActive = activeChannel === id
            return (
              <button key={id} onClick={() => setActiveChannel(id)}
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors text-left ${isActive ? 'bg-[#35363c] text-white' : 'text-[#949ba4] hover:bg-[#35363c]/60 hover:text-[#dbdee1]'}`}>
                <span className="text-base">{meta.icon}</span>
                <span className="text-sm truncate">{meta.label}</span>
                {pendingCount > 0 && (
                  <span className="ml-auto text-[10px] bg-[#ed4245] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1">{pendingCount}</span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 px-2 py-2 bg-[#232428]">
          <Avatar initials="LC" color="#5865f2" size={32} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white leading-none">lab.coach</div>
            <div className="text-xs text-[#57f287]">● Online</div>
          </div>
        </div>
      </div>

      {/* Main area */}
      {activeChannel === 'ta-internal-digest'
        ? <DigestView
            digestMsgs={digestMsgs} setDigestMsgs={setDigestMsgs}
            questions={questions} setQuestions={setQuestions}
            onJump={handleJump}
          />
        : <ChannelView
            channelId={activeChannel}
            highlightId={highlightId}
            onHighlightDone={() => setHighlightId(null)}
          />
      }
    </div>
  )
}
