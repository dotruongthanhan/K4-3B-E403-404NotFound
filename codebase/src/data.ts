export interface ChannelMsg {
  id: string
  author: string
  avatar: string
  avatarColor: string
  time: string
  content: string
  isBot?: boolean
  replyToId?: string // ID of the message being replied to
}

export type ChannelId =
  | 'ta-internal-digest'
  | 'thong-bao'
  | 'cau-hoi-chung'
  | 'lab-1-ho-tro'
  | 'lab-2-ho-tro'
  | 'lab-3-ho-tro'
  | 'du-an-nhom'
  | 'chu-de-tu-do'

export const CHANNEL_MESSAGES: Record<ChannelId, ChannelMsg[]> = {
  'ta-internal-digest': [],

  'thong-bao': [
    { id: 'tb1', author: 'Thầy Khoa', avatar: 'TK', avatarColor: '#5865f2', time: '08:00', content: '📌 **Lịch lab tuần này:**\n- Lab 3 nộp trước **23:59 thứ Sáu 20/09**\n- Không có buổi lab ngày thứ Tư do nghỉ lễ\n\nMọi câu hỏi kỹ thuật đặt trong kênh #lab-3-hỗ-trợ nhé!' },
    { id: 'tb2', author: 'Thầy Khoa', avatar: 'TK', avatarColor: '#5865f2', time: '08:01', content: '📚 Slide bài giảng tuần 6 đã upload lên Moodle. Tuần 7 sẽ có trước thứ Hai.' },
    { id: 'tb3', author: 'DigestBot', avatar: '', avatarColor: '', time: '08:05', isBot: true, content: '✅ Thông báo đã được ghim.' },
    { id: 'tb4', author: 'Nguyễn An', avatar: 'NA', avatarColor: '#eb459e', time: '08:10', content: 'Thầy ơi deadline Lab 3 là 23:59 thứ Sáu hay Chủ nhật ạ? Em nhớ tuần trước thầy nói Chủ nhật.', replyToId: 'tb1' },
    { id: 'tb5', author: 'Thầy Khoa', avatar: 'TK', avatarColor: '#5865f2', time: '08:15', content: 'Thứ Sáu 23:59 nhé bạn, tuần trước mình có nhắn nhầm, lần này là chính xác rồi.', replyToId: 'tb4' },
    { id: 'tb6', author: 'Nguyễn An', avatar: 'NA', avatarColor: '#eb459e', time: '08:16', content: 'Dạ em hiểu rồi ạ, cảm ơn thầy!', replyToId: 'tb5' },
  ],

  'cau-hoi-chung': [
    { id: 'chg1', author: 'Nguyễn An', avatar: 'NA', avatarColor: '#eb459e', time: '07:55', content: 'Chào mọi người! Hôm nay học buổi sáng hay chiều vậy?' },
    { id: 'chg2', author: 'Trần Long', avatar: 'TL', avatarColor: '#fee75c', time: '07:58', content: 'Chiều 13h bạn ơi, lịch vẫn y như cũ', replyToId: 'chg1' },
    { id: 'chg3', author: 'Nguyễn An', avatar: 'NA', avatarColor: '#eb459e', time: '07:59', content: 'Oke cảm ơn!', replyToId: 'chg2' },
    { id: 'chg4', author: 'Phạm Ngọc', avatar: 'PN', avatarColor: '#3ba55d', time: '08:30', content: 'Mọi người đã làm xong Lab 2 chưa? Em thấy bài khó quá 😅' },
    { id: 'chg5', author: 'Lê Minh', avatar: 'LM', avatarColor: '#5865f2', time: '08:33', content: 'Bài 2 phần con trỏ mình xong rồi nhưng bài 3 thì chịu 😂', replyToId: 'chg4' },
    { id: 'q3', author: 'Hoàng Minh Đức', avatar: 'HMĐ', avatarColor: '#3ba55d', time: '13:05', content: 'Deadline nộp báo cáo Lab 3 có dời không ạ? Em thấy một bạn nhắn thầy dời rồi nhưng không thấy thông báo chính thức.' },
    { id: 'chg6', author: 'Trần Bảo', avatar: 'TB', avatarColor: '#ed4245', time: '13:09', content: 'Mình cũng thắc mắc vụ này, có ai biết không?', replyToId: 'q3' },
    { id: 'q6', author: 'Trần Quốc Bảo', avatar: 'TQB', avatarColor: '#faa61a', time: '17:48', content: 'Thầy ơi, slide bài giảng tuần 7 có upload lên Moodle chưa ạ? Em tìm không thấy.' },
    { id: 'chg7', author: 'Vũ Lan', avatar: 'VL', avatarColor: '#eb459e', time: '17:52', content: 'Mình cũng tìm không thấy tuần 7 bạn ơi', replyToId: 'q6' },
  ],

  'lab-1-ho-tro': [
    { id: 'l1a', author: 'Nguyễn Thành', avatar: 'NT', avatarColor: '#5865f2', time: '09:10', content: 'Em làm xong Lab 1 rồi, nhưng không chắc phần output có đúng format không. Thầy có thể cho em xem expected output không ạ?' },
    { id: 'l1b', author: 'coach.minh', avatar: 'CM', avatarColor: '#3ba55d', time: '09:25', content: 'Expected output đã được mô tả trong file `lab1_spec.pdf` phần 3.2 bạn nhé. Nếu vẫn không chắc thì paste output ra đây mình xem cho.', replyToId: 'l1a' },
    { id: 'l1c', author: 'Nguyễn Thành', avatar: 'NT', avatarColor: '#5865f2', time: '09:27', content: 'Dạ em cảm ơn thầy! Để em đọc lại spec', replyToId: 'l1b' },
    { id: 'q4', author: 'Đỗ Thị Mai', avatar: 'DTM', avatarColor: '#5865f2', time: '11:22', content: 'Code em chạy đúng kết quả nhưng bị trừ điểm style. Em không hiểu phần nào bị sai, có thể xem lại rubric không ạ?' },
    { id: 'l1d', author: 'Phạm Hùng', avatar: 'PH', avatarColor: '#eb459e', time: '11:28', content: 'Điểm style tính theo tiêu chí gì vậy thầy? Em thấy code mình đúng rồi nhưng vẫn bị trừ điểm phần này.', replyToId: 'q4' },
    { id: 'l1e', author: 'Lê Thu', avatar: 'LT', avatarColor: '#fee75c', time: '12:00', content: 'Bạn ơi style thường gồm: indent đúng, tên biến có nghĩa, có comment, không có dead code. Mình đoán vậy thôi', replyToId: 'l1d' },
  ],

  'lab-2-ho-tro': [
    { id: 'l2a', author: 'Bùi Nam', avatar: 'BN', avatarColor: '#3ba55d', time: '09:00', content: 'Thầy ơi bài Lab 2 exercise 1 em không hiểu yêu cầu "implement without using library functions" nghĩa là sao ạ?' },
    { id: 'l2b', author: 'coach.minh', avatar: 'CM', avatarColor: '#3ba55d', time: '09:15', content: 'Nghĩa là không dùng các hàm có sẵn như `strlen`, `strcpy`, v.v. bạn phải tự viết logic từ đầu bằng vòng lặp hoặc đệ quy nhé.', replyToId: 'l2a' },
    { id: 'l2c', author: 'Bùi Nam', avatar: 'BN', avatarColor: '#3ba55d', time: '09:17', content: 'À hiểu rồi ạ, cảm ơn thầy nhiều!', replyToId: 'l2b' },
    { id: 'l2d', author: 'Hoàng Yến', avatar: 'HY', avatarColor: '#eb459e', time: '10:05', content: 'Mọi người cho hỏi bài 2 dùng `char*` hay `char[]` ạ? Em không biết cách nào phù hợp hơn.' },
    { id: 'l2e', author: 'Trần Dũng', avatar: 'TD', avatarColor: '#fee75c', time: '10:10', content: 'Mình nghĩ cả hai đều ok nhưng `char[]` an toàn hơn cho người mới. Ai biết thêm không?', replyToId: 'l2d' },
    { id: 'l2f', author: 'coach.minh', avatar: 'CM', avatarColor: '#3ba55d', time: '10:18', content: 'Đúng rồi, cả hai hợp lệ. `char[]` cấp phát trên stack, `char*` linh hoạt hơn nhưng cần quản lý bộ nhớ cẩn thận hơn. Trong bài lab này dùng `char[]` là đủ.', replyToId: 'l2d' },
    { id: 'l2g', author: 'Nguyễn Minh Tú', avatar: 'NMT', avatarColor: '#5865f2', time: '14:32', content: 'Em bị lỗi "segmentation fault" khi chạy bài lab 3 phần con trỏ. Em đã kiểm tra lại code nhiều lần nhưng vẫn không hiểu tại sao.' },
    { id: 'l2h', author: 'Trần Bảo Châu', avatar: 'TBC', avatarColor: '#57f287', time: '14:35', content: 'Em cũng gặp segfault ở phần malloc trong lab 3, không biết có phải do cách giải phóng bộ nhớ không?', replyToId: 'l2g' },
  ],

  'lab-3-ho-tro': [
    { id: 'l3a', author: 'Phạm Quân', avatar: 'PQ', avatarColor: '#5865f2', time: '08:45', content: 'Chào thầy, em xem đề Lab 3 rồi, phần linked list khó hơn em tưởng. Thầy có thể cho gợi ý cách tiếp cận bài 2 không ạ?' },
    { id: 'l3b', author: 'coach.linh', avatar: 'CL', avatarColor: '#eb459e', time: '08:55', content: 'Bài 2 bạn nên vẽ sơ đồ node trước, sau đó xử lý từng bước: tìm node cần xóa → cập nhật con trỏ trước → giải phóng bộ nhớ. Đừng cố viết code ngay, hình dung được logic trước đã.', replyToId: 'l3a' },
    { id: 'l3c', author: 'Phạm Quân', avatar: 'PQ', avatarColor: '#5865f2', time: '08:58', content: 'Dạ em hiểu hơn rồi, cảm ơn cô!', replyToId: 'l3b' },
    { id: 'q1', author: 'Vũ Đức Thành', avatar: 'VDT', avatarColor: '#fee75c', time: '09:14', content: 'Em không hiểu tại sao hàm đệ quy của em bị stack overflow dù đã có điều kiện dừng. Mọi người giúp em với!' },
    { id: 'l3g', author: 'Trần Khánh', avatar: 'TK2', avatarColor: '#5865f2', time: '09:20', content: 'Bạn share code đệ quy ra đây đi, mình xem thử', replyToId: 'q1' },
    { id: 'l3h', author: 'Vũ Đức Thành', avatar: 'VDT', avatarColor: '#fee75c', time: '09:22', content: '```c\nint factorial(int n) {\n  if (n == 0) return 1;\n  return n * factorial(n);\n}\n```\nEm không thấy lỗi chỗ nào cả 😭', replyToId: 'l3g' },
    { id: 'l3i', author: 'Trần Khánh', avatar: 'TK2', avatarColor: '#5865f2', time: '09:24', content: 'À mình thấy rồi! Dòng `return n * factorial(n)` phải là `factorial(n - 1)` chứ bạn. Base case đúng nhưng recursive case không giảm n nên loop mãi.', replyToId: 'l3h' },
    { id: 'q2', author: 'Lê Thị Bích', avatar: 'LTB', avatarColor: '#ed4245', time: '10:51', content: 'Mọi người ơi bài Lab 3 Exercise 4 yêu cầu cài thư viện gì thêm không? Em làm theo đề bị lỗi import.' },
    { id: 'l3d', author: 'Ngô Phúc', avatar: 'NP', avatarColor: '#3ba55d', time: '10:55', content: 'Mình cũng bị, thử `#include <stdlib.h>` chưa bạn?', replyToId: 'q2' },
    { id: 'l3e', author: 'Lê Thị Bích', avatar: 'LTB', avatarColor: '#ed4245', time: '10:57', content: 'Rồi nhưng vẫn lỗi bạn ơi. Lỗi báo "undefined reference to qsort"', replyToId: 'l3d' },
    { id: 'l3f', author: 'Vũ Mạnh', avatar: 'VM', avatarColor: '#faa61a', time: '11:02', content: 'Bạn compile với flag `-lm` chưa? Đôi khi cần link thêm thư viện toán', replyToId: 'l3e' },
  ],

  'du-an-nhom': [
    { id: 'dan1', author: 'Nhóm 7 - Minh', avatar: 'N7', avatarColor: '#5865f2', time: '10:00', content: 'Nhóm mình đang phân chia việc: Minh làm insert, Hương làm delete, Bảo làm search. Ai có thắc mắc gì không?' },
    { id: 'dan2', author: 'Nhóm 5 - Lan', avatar: 'N5', avatarColor: '#eb459e', time: '10:05', content: 'Nhóm mình chưa phân chia xong, đang họp trong voice channel' },
    { id: 'q5', author: 'Bùi Thị Hương', avatar: 'BTH', avatarColor: '#eb459e', time: '14:37', content: 'Nhóm em chưa biết cách implement hàm delete cho doubly linked list. Có tài liệu tham khảo không ạ?' },
    { id: 'dan3', author: 'Nguyễn An', avatar: 'NA', avatarColor: '#3ba55d', time: '14:42', content: 'Bọn mình cũng đang tìm, bạn tìm được chưa?', replyToId: 'q5' },
    { id: 'dan4', author: 'Trần Long', avatar: 'TL', avatarColor: '#fee75c', time: '14:45', content: 'GeeksForGeeks có bài viết nhưng code C++ nên khó hiểu hơn chút', replyToId: 'q5' },
    { id: 'dan5', author: 'Bùi Thị Hương', avatar: 'BTH', avatarColor: '#eb459e', time: '14:47', content: 'Mình tìm được video YouTube giải thích nhưng vẫn chưa rõ phần update prev pointer', replyToId: 'dan4' },
    { id: 'dan6', author: 'Lê Đạt', avatar: 'LĐ', avatarColor: '#faa61a', time: '15:00', content: 'Nhóm mình vừa xong phần đó, chiều tối hop gg meet giải thích cho bạn được không?', replyToId: 'dan5' },
    { id: 'dan7', author: 'Bùi Thị Hương', avatar: 'BTH', avatarColor: '#eb459e', time: '15:02', content: 'Được bạn ơi! 7h tối nhé 🙏', replyToId: 'dan6' },
  ],

  'chu-de-tu-do': [
    { id: 'ctd1', author: 'Nguyễn An', avatar: 'NA', avatarColor: '#eb459e', time: '12:00', content: 'Mọi người ăn trưa chưa 😂' },
    { id: 'ctd2', author: 'Trần Long', avatar: 'TL', avatarColor: '#fee75c', time: '12:01', content: 'Đang ăn đây 🍜', replyToId: 'ctd1' },
    { id: 'ctd3', author: 'Lê Minh', avatar: 'LM', avatarColor: '#5865f2', time: '12:03', content: 'Bọn mình đang nói chuyện vui mà sao toàn lỗi segfault thế 😅' },
    { id: 'ctd4', author: 'Phạm Linh', avatar: 'PL', avatarColor: '#3ba55d', time: '13:30', content: 'Ai xem series "Mr. Robot" chưa? Môn này học xong mình mới hiểu tại sao hackers toàn dùng C lol' },
    { id: 'ctd5', author: 'Hoàng Nam', avatar: 'HN', avatarColor: '#faa61a', time: '13:33', content: 'Xem rồi, hay lắm! Nhưng thực ra bây giờ người ta dùng Python nhiều hơn haha', replyToId: 'ctd4' },
    { id: 'ctd6', author: 'Trần Quốc Bảo', avatar: 'TQB', avatarColor: '#faa61a', time: '15:30', content: 'Thầy ơi, mình có thể dùng Python thay vì C cho các bài lab không? Em quen Python hơn ạ.' },
    { id: 'ctd7', author: 'Nguyễn An', avatar: 'NA', avatarColor: '#eb459e', time: '15:32', content: 'Haha bạn hỏi đúng chỗ mình đang nghĩ 😂', replyToId: 'ctd6' },
    { id: 'ctd8', author: 'Lê Minh', avatar: 'LM', avatarColor: '#5865f2', time: '15:35', content: 'Chắc không được đâu, môn này học quản lý bộ nhớ mà. Python không có pointer', replyToId: 'ctd6' },
  ],
}

export const CHANNEL_META: Record<ChannelId, { label: string; icon: string; topic: string; isPrivate?: boolean }> = {
  'ta-internal-digest': { label: 'ta-internal-digest', icon: '🔒', topic: 'Kênh nội bộ TA · Digest tự động lúc 13:30, 18:30, 21:30', isPrivate: true },
  'thong-bao':    { label: 'thông-báo',      icon: '📣', topic: 'Thông báo chính thức từ giảng viên' },
  'cau-hoi-chung':{ label: 'câu-hỏi-chung', icon: '#',  topic: 'Câu hỏi chung về môn học, lịch học, deadline' },
  'lab-1-ho-tro': { label: 'lab-1-hỗ-trợ',  icon: '#',  topic: 'Hỗ trợ kỹ thuật cho Lab 1' },
  'lab-2-ho-tro': { label: 'lab-2-hỗ-trợ',  icon: '#',  topic: 'Hỗ trợ kỹ thuật cho Lab 2' },
  'lab-3-ho-tro': { label: 'lab-3-hỗ-trợ',  icon: '#',  topic: 'Hỗ trợ kỹ thuật cho Lab 3' },
  'du-an-nhom':   { label: 'dự-án-nhóm',    icon: '#',  topic: 'Thảo luận và hỗ trợ dự án nhóm cuối kỳ' },
  'chu-de-tu-do': { label: 'chủ-đề-tự-do',  icon: '#',  topic: 'Tán gẫu, off-topic, câu chuyện ngoài lề 🎉' },
}

export const QUESTION_CHANNEL_MAP: Record<string, ChannelId> = {
  q1: 'lab-3-ho-tro',
  q2: 'lab-3-ho-tro',
  q3: 'cau-hoi-chung',
  q4: 'lab-1-ho-tro',
  q5: 'du-an-nhom',
  q6: 'cau-hoi-chung',
}
