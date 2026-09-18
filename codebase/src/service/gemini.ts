import type { ChannelId, ChannelMsg } from '../data'

export interface ReconstructedConversation {
  convId: string
  channel: ChannelId
  messages: ChannelMsg[]
  firstMessage: ChannelMsg
  lastMessage: ChannelMsg
  conversationText: string
}

export interface GeminiDigestQuestion {
  id: string
  lastMessageId?: string
  firstMessageId?: string
  convId?: string
  priority: 'P0' | 'P1'
  channel: ChannelId
  author: string
  avatar: string
  avatarColor: string
  time: string
  groupCount: number
  content: string
  summary: string
  conversationText?: string
  handled: boolean
}

export interface GeminiDigestResponse {
  summary: string
  questions: GeminiDigestQuestion[]
}

// ─── DSU (Disjoint Set Union) để gom cụm tin nhắn theo reply_to ───────────────

class DSU {
  parent: Map<string, string> = new Map()

  find(i: string): string {
    if (!this.parent.has(i)) {
      this.parent.set(i, i)
      return i
    }
    const p = this.parent.get(i)!
    if (p === i) return i
    const root = this.find(p)
    this.parent.set(i, root)
    return root
  }

  union(i: string, j: string) {
    const rootI = this.find(i)
    const rootJ = this.find(j)
    if (rootI !== rootJ) {
      this.parent.set(rootI, rootJ)
    }
  }
}

/**
 * Gom cụm các tin nhắn trong từng kênh thành các chuỗi conversation dựa trên replyToId
 */
export function reconstructConversations(
  channelMessages: Record<ChannelId, ChannelMsg[]>,
  untilTime?: string
): ReconstructedConversation[] {
  const conversations: ReconstructedConversation[] = []

  for (const [chId, rawMsgs] of Object.entries(channelMessages)) {
    const channelId = chId as ChannelId
    if (channelId === 'ta-internal-digest') continue
    if (!rawMsgs || rawMsgs.length === 0) continue

    // Lọc tin nhắn theo mốc thời gian nếu có (ví dụ ca 13:30, 18:30, 21:30)
    const msgs = untilTime
      ? rawMsgs.filter(m => !m.time || m.time <= untilTime)
      : rawMsgs

    if (msgs.length === 0) continue

    const dsu = new DSU()
    const msgMap = new Map<string, ChannelMsg>()

    msgs.forEach(m => {
      dsu.find(m.id)
      msgMap.set(m.id, m)
    })

    // Gom các tin nhắn có quan hệ replyToId vào cùng một nhóm
    msgs.forEach(m => {
      if (m.replyToId && msgMap.has(m.replyToId)) {
        dsu.union(m.id, m.replyToId)
      }
    })

    // Gom nhóm theo root DSU
    const groups = new Map<string, ChannelMsg[]>()
    msgs.forEach(m => {
      const root = dsu.find(m.id)
      if (!groups.has(root)) groups.set(root, [])
      groups.get(root)!.push(m)
    })

    // Sắp xếp các tin nhắn trong từng hội thoại theo thứ tự xuất hiện ban đầu
    groups.forEach(groupMsgs => {
      const orderedMsgs = [...groupMsgs]
      const firstMsg = orderedMsgs[0]
      const lastMsg = orderedMsgs[orderedMsgs.length - 1]

      // Format thành khối dạng:
      // User A: ...
      // User B: ...
      const conversationText = orderedMsgs
        .map(m => `${m.author}: "${m.content.replace(/\n/g, ' ')}"`)
        .join('\n')

      conversations.push({
        convId: `conv_${firstMsg.id}`,
        channel: channelId,
        messages: orderedMsgs,
        firstMessage: firstMsg,
        lastMessage: lastMsg,
        conversationText,
      })
    })
  }

  return conversations
}

/**
 * Tạo prompt định dạng các khối conversation gửi cho AI
 */
export function formatConversationsForAI(conversations: ReconstructedConversation[]): string {
  return conversations
    .map((c, i) => {
      return `=== [CONVERSATION #${i + 1}] ===
ID: ${c.convId}
Kênh: #${c.channel}
Tin nhắn đầu: [ID: ${c.firstMessage.id}] ${c.firstMessage.author} (${c.firstMessage.time})
Tin nhắn cuối: [ID: ${c.lastMessage.id}] ${c.lastMessage.author} (${c.lastMessage.time})
Nội dung trao đổi:
${c.conversationText}`
    })
    .join('\n\n----------------------------------------\n\n')
}

const SYSTEM_PROMPT = `Bạn là trợ lý TA Digest AI cho khoá học lập trình trên Discord.
Nhiệm vụ: Bạn được cung cấp danh sách các CHUỖI HỘI THOẠI (Conversation) giữa học viên và người hỗ trợ.
Mỗi conversation đã được gom nhóm liên thông theo reply_to dưới dạng:
User A: "..."
User B: "..."

Quy tắc phân tích:
1. Lọc bỏ các conversation chỉ là chào hỏi, tán gẫu, đùa vui, ăn trưa, hoặc thông báo 1 chiều.
2. Kiểm tra trạng thái xử lý:
   - RESOLVED (Đã xong): Câu hỏi của học viên đã được trả lời rõ ràng, cụ thể và học viên đã xác nhận hiểu/cảm ơn. -> BỎ QUA, KHÔNG đưa vào danh sách.
   - UNRESOLVED (Chưa giải quyết): Câu hỏi chưa ai trả lời, HOẶC câu trả lời chưa giải quyết được vấn đề, HOẶC học viên hỏi tiếp một thắc mắc mới ở cuối chuỗi mà bị bỏ lửng. -> ĐƯA VÀO DANH SÁCH.
3. Phân loại mức độ ưu tiên:
   - "P0": Blocker kỹ thuật nghiêm trọng (segfault, compile fail, đệ quy stack overflow), thắc mắc về hạn nộp/deadline, lịch thi.
   - "P1": Thắc mắc thủ tục, xin tài liệu, slide Moodle, tiêu chí chấm style.
4. QUY TẮC ĐIỀU HƯỚNG QUAN TRỌNG:
   - Trường "lastMessageId" PHẢI LÀ ID CỦA TIN NHẮN CUỐI CÙNG trong chuỗi hội thoại (được ghi ở dòng 'Tin nhắn cuối: [ID: ...]'), để khi TA bấm "Nhảy đến tin nhắn", ứng dụng sẽ chuyển thẳng đến tin nhắn cuối cùng của chuỗi hội thoại này.
5. Tóm tắt ngắn gọn vấn đề bằng tiếng Việt (dưới 20 từ).

Trả về DUY NHẤT một chuỗi JSON hợp lệ theo định dạng sau (không kèm văn bản ngoài JSON):
{
  "summary": "Tổng quan ngắn gọn kết quả quét (ví dụ: Đã quét 12 hội thoại, phát hiện 4 câu hỏi chưa giải quyết...)",
  "questions": [
    {
      "convId": "ID_conversation",
      "lastMessageId": "ID_tin_nhắn_cuối_cùng",
      "priority": "P0",
      "summary": "Tóm tắt ngắn gọn vấn đề chưa được giải quyết"
    }
  ]
}`

function parseJsonLoose(text: string): GeminiDigestResponse {
  let clean = text.trim()

  // 1. Gỡ bỏ markdown code block nếu có
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  }

  // 2. Thử parse trực tiếp
  try {
    const res = JSON.parse(clean)
    if (res && Array.isArray(res.questions)) return res
  } catch {}

  // 3. Tìm khối JSON { ... } lớn nhất
  const firstBrace = clean.indexOf('{')
  const lastBrace = clean.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonStr = clean.slice(firstBrace, lastBrace + 1)
    try {
      const res = JSON.parse(jsonStr)
      if (res && Array.isArray(res.questions)) return res
    } catch {
      try {
        // Loại bỏ control characters
        const sanitized = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
        const res = JSON.parse(sanitized)
        if (res && Array.isArray(res.questions)) return res
      } catch {}
    }
  }

  // 4. Fallback: Dùng Regex bóc tách từng phần tử question nếu JSON bị lỗi cú pháp chuỗi/cắt ngang
  const questions: GeminiDigestQuestion[] = []
  const questionBlockRegex = /\{[^{}]*?(?:"priority"|"convId"|"lastMessageId"|"summary")[^{}]*?\}/g
  let match: RegExpExecArray | null

  while ((match = questionBlockRegex.exec(clean)) !== null) {
    try {
      const parsed = JSON.parse(match[0])
      if (parsed.priority || parsed.summary || parsed.convId || parsed.lastMessageId) {
        const lastId = parsed.lastMessageId || parsed.id || parsed.convId || `q_${questions.length + 1}`
        questions.push({
          id: lastId,
          lastMessageId: lastId,
          convId: parsed.convId,
          priority: parsed.priority === 'P0' ? 'P0' : 'P1',
          channel: parsed.channel || 'cau-hoi-chung',
          author: parsed.author || 'Học viên',
          avatar: parsed.avatar || 'HV',
          avatarColor: parsed.avatarColor || '#5865f2',
          time: parsed.time || 'Hôm nay',
          groupCount: parsed.groupCount || 1,
          content: parsed.content || '',
          summary: parsed.summary || 'Cần hỗ trợ',
          handled: false,
        })
      }
    } catch {
      const convIdMatch = match[0].match(/"convId"\s*:\s*"([^"]+)"/)
      const lastIdMatch = match[0].match(/"lastMessageId"\s*:\s*"([^"]+)"/)
      const priorityMatch = match[0].match(/"priority"\s*:\s*"(P0|P1)"/)
      const summaryMatch = match[0].match(/"summary"\s*:\s*"([^"]+)"/)

      if (convIdMatch || lastIdMatch || summaryMatch) {
        const lastId = lastIdMatch ? lastIdMatch[1] : (convIdMatch ? convIdMatch[1] : `q_${questions.length + 1}`)
        questions.push({
          id: lastId,
          lastMessageId: lastId,
          convId: convIdMatch ? convIdMatch[1] : undefined,
          priority: (priorityMatch ? priorityMatch[1] : 'P1') as 'P0' | 'P1',
          channel: 'cau-hoi-chung',
          author: 'Học viên',
          avatar: 'HV',
          avatarColor: '#5865f2',
          time: 'Hôm nay',
          groupCount: 1,
          content: '',
          summary: summaryMatch ? summaryMatch[1] : 'Câu hỏi cần giải đáp',
          handled: false,
        })
      }
    }
  }

  const summaryMatch = clean.match(/"summary"\s*:\s*"([^"]+)"/)
  const summary = summaryMatch ? summaryMatch[1] : `Đã quét và phát hiện ${questions.length} câu hỏi chưa giải quyết.`

  if (questions.length > 0) {
    return { summary, questions }
  }

  throw new Error(`Unable to parse JSON string: ${clean.slice(0, 150)}`)
}

export async function testGeminiConnection(
  customApiKey?: string,
  customModel?: string
): Promise<{ success: boolean; model: string; message: string }> {
  const apiKey =
    customApiKey ||
    (typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') : null) ||
    import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    return { success: false, model: '', message: 'Chưa có API Key' }
  }

  const model = customModel || 'gemini-3.1-flash-lite'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey.trim())}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      return { success: false, model, message: `HTTP ${res.status}: ${errText.slice(0, 200)}` }
    }

    return { success: true, model, message: 'Kết nối thành công!' }
  } catch (err: any) {
    return { success: false, model, message: err?.message || 'Lỗi kết nối mạng' }
  }
}

export async function callGeminiDigest(
  promptText: string,
  customApiKey?: string,
  customModel?: string
): Promise<GeminiDigestResponse> {
  const apiKey =
    customApiKey ||
    (typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') : null) ||
    import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error(
      'Chưa cấu hình Gemini API Key. Vui lòng bấm nút "⚙️ API" góc trên để nhập key hoặc thêm VITE_GEMINI_API_KEY vào .env.'
    )
  }

  const defaultModel =
    customModel ||
    (typeof window !== 'undefined' ? localStorage.getItem('GEMINI_MODEL') : null) ||
    import.meta.env.VITE_GEMINI_MODEL ||
    'gemini-3.1-flash-lite'

  // Thử gemini-3.1-flash-lite trước, fallback sang 2.5/2.0 nếu cần
  const candidateModels = Array.from(
    new Set([defaultModel, 'gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'])
  )

  let lastError: Error | null = null

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(apiKey.trim())}`

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Dưới đây là danh sách các chuỗi hội thoại Discord cần phân loại:\n\n${promptText}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: 4096,
          },
        }),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        // Nếu tên model không tồn tại hoặc lỗi argument do tên model, thử model tiếp theo
        if (
          res.status === 404 ||
          (res.status === 400 && (errText.includes('not found') || errText.includes('models/')))
        ) {
          lastError = new Error(`Model ${model} không tồn tại: ${errText.slice(0, 150)}`)
          continue
        }
        throw new Error(`Google Gemini API (${res.status} [${model}]): ${errText.slice(0, 300)}`)
      }

      const data = await res.json()
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!rawText) {
        throw new Error('Gemini API không trả về nội dung text.')
      }

      return parseJsonLoose(rawText)
    } catch (err: any) {
      lastError = err
      if (
        err.message &&
        (err.message.includes('not found') ||
          err.message.includes('404') ||
          (err.message.includes('400') && err.message.includes('models/')))
      ) {
        continue
      }
      throw err
    }
  }

  throw lastError || new Error('Không thể kết nối tới Gemini API.')
}