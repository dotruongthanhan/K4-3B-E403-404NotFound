Create a clickable desktop web app prototype in Vietnamese for “Discord Daily Brief”, an assistant that helps Lab Coaches and Teaching Assistants avoid missing unanswered student questions on Discord.

Context:
Lab Coaches currently check multiple Discord channels at the end of the day. Student questions may be posted outside working hours or buried in different channels. The assistant scans Discord messages during the day, detects questions that may not have received an answer, groups duplicate questions, summarizes them, and provides a direct link to the original Discord message. The AI must not automatically answer students. The Lab Coach reviews the AI results and decides what to do.

Primary user:
Lab Coach / Teaching Assistant.

Main user flow:
1. The user opens the daily brief dashboard.
2. The dashboard shows how many unanswered-question candidates were detected today.
3. The user scans grouped questions by urgency and confidence.
4. The user clicks a question to see the AI summary, original message, channel, timestamp, and related replies.
5. The user chooses one action:
   - Open in Discord
   - Mark as answered
   - Snooze
   - Mark as false positive
6. The user can give feedback on whether the AI detection was correct.

Create these screens and connect them with clickable interactions:

Screen 1: Daily Brief Dashboard
- Header: “Bản tin Discord cuối ngày”
- Date selector showing “17/09/2026”
- User profile: “Nghĩa · Lab Coach”
- Summary metrics:
  - “12 câu hỏi được phát hiện”
  - “5 câu có khả năng chưa được trả lời”
  - “3 câu cần ưu tiên”
  - “4 câu đã xử lý”
- Main list titled “Câu hỏi cần kiểm tra”
- Each question card must show:
  - Short Vietnamese summary
  - Student name
  - Discord channel, for example “#lab-03”
  - Time posted
  - AI confidence badge: “Cao”, “Trung bình”, or “Thấp”
  - Status: “Chưa kiểm tra”, “Đã xử lý”, or “Cần xác minh”
  - Number of related/duplicate questions
- Add filters:
  - Tất cả
  - Chưa xử lý
  - Ưu tiên cao
  - Độ tin cậy thấp
- Add sorting by priority and time.
- Use a clear empty state when there are no unanswered questions.

Screen 2: Question Detail
When the user clicks a question card, open a detail view or side panel containing:
- AI summary
- Original student message in a Discord-style message block
- Student name, channel, date, and time
- Link button: “Mở tin nhắn trên Discord”
- Related messages and replies
- AI explanation:
  “AI đánh dấu câu hỏi này vì chưa tìm thấy câu trả lời trực tiếp trong 24 giờ.”
- Confidence indicator and a short explanation of uncertainty
- Action buttons:
  - “Mở trên Discord”
  - “Đánh dấu đã trả lời”
  - “Bỏ qua / False positive”
  - “Nhắc lại sau”
- Feedback controls:
  - “Đúng”
  - “Sai”
  - Optional text field: “Điều gì chưa chính xác?”

Screen 3: Discord Message Preview
Create a realistic Discord-style preview showing:
- Channel name
- Student avatar and message
- Existing replies, if any
- A visual highlight around the detected unanswered question
- Button “Quay lại bản tin”
- Button “Mở trong Discord”
The “Mở trong Discord” button can link to a prototype confirmation state instead of a real external URL.

Screen 4: Confirmation and status states
Create clickable confirmation states for:
- Marked as answered: show toast “Đã đánh dấu câu hỏi là đã xử lý”
- False positive: show toast “Đã loại khỏi danh sách cần kiểm tra”
- Snoozed: show toast “Sẽ nhắc lại vào ngày mai”
- Feedback submitted: show toast “Cảm ơn phản hồi của bạn”
After each action, update the question status visually.

Screen 5: Low-confidence state
Create one question with low AI confidence. Show:
- Badge “Cần xác minh”
- Text:
  “AI chưa chắc đây là câu hỏi chưa được trả lời. Có thể câu trả lời nằm ở một thread khác.”
- Make the user review the original Discord context before taking action.
- Do not present low-confidence results as facts.

Visual direction:
- Professional internal tool for education operations.
- Desktop-first layout, approximately 1440 × 1024.
- Use a calm light interface with white content areas, dark navy text, Discord-inspired indigo accents, and amber/red only for warnings and priority.
- Avoid excessive cards and decorative gradients.
- Use a compact left sidebar with:
  - Bản tin hôm nay
  - Lịch sử bản tin
  - Phản hồi AI
  - Cài đặt
- Use clear hierarchy, readable Vietnamese typography, compact data-dense layouts, and strong scanability.
- Use familiar icons for search, filter, external link, check, clock, warning, and feedback.
- Keep button labels in Vietnamese.
- Use realistic Vietnamese sample data.
- Include hover, selected, loading, empty, success, and error states.
- Make all main buttons and cards clickable.
- Prototype should clearly demonstrate the complete flow from daily brief to question review and status update.

Important product constraints:
- AI only detects, groups, summarizes, and links to possible unanswered questions.
- AI must never automatically send a reply to a student.
- The Lab Coach remains responsible for reviewing the context and deciding the final action.
- Every AI result must show the source Discord channel/message and an uncertainty level.
- If confidence is low, encourage the user to verify instead of presenting a definitive conclusion.