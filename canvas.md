| # | Dòng | Nội dung |
|---|---|---|
| 1 | Track + đề | B · Trợ lý Discord — Bản tin cuối ngày cho TA |
| 2 | Job executor (ai · đang ở đâu · làm gì) | TA đang kiểm tra tin nhắn discord vào cuối ngày để xem có câu hỏi nào của học viên chưa được trả lời. |
| 3 | Pain một câu (ai – đang làm gì – vướng đâu – hậu quả) | Câu hỏi nằm trong nhiều kênh khác nhau, thời điểm hỏi không trong giờ làm việc của TA; TA phải mất rất nhiều thời gian để check từng kênh để trả lời hết tin nhắn của học viên. |
| 4 | 1–2 bằng chứng đầu (số + cách đếm + mã hội thoại/tin nhắn, hoặc khảo sát/phỏng vấn có số người) | Trong `discord-pack/k4_daily_reports.csv`, cả 4 câu trả lời từ bot đều chỉ tổng hợp những câu hay hỏi của học viên trong ngày, 2/4 câu trả lời từ bot chưa chỉ rõ link câu hỏi ở kênh nào. Nhóm đã hỏi 6 Lab coaches trong lớp: 4/6 lab coach bị miss câu hỏi của học viên, 2/6 LC không phải trả câu hỏi của HV/không gặp vấn đề. |
| 5 | Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả) | Cuối mỗi ngày, TA nhận bản tin bot tổng hợp các câu hỏi có khả năng chưa được trả lời, bot gắn link đến đúng kênh/tin nhắn và TA quyết định câu nào cần phản hồi, giúp không bỏ sót câu hỏi của học viên. |
| 6 | AI tự làm đến đâu + 1 dòng lý do · ≥3 willing users ngoài nhóm | AI tự quét các kênh trong ngày, phát hiện câu hỏi có khả năng chưa được trả lời, nhóm các câu hỏi trùng nhau, tóm tắt và gắn link nguồn; TA vẫn kiểm tra kết quả và tự trả lời vì AI có thể hiểu sai ngữ cảnh hoặc mức độ ưu tiên. **Willing users:** Nghĩa, Tài: Lab Coaches |
| 7 | Phân công có tên | Minh Hiếu: phát triển bot, logic phát hiện câu hỏi chưa được trả lời và configuration - Thành Ân: phỏng vấn Lab Coach, thiết kế cách lưu trữ database và dữ liệu thử nghiệm - Đăng Dương: làm mockup bản tin cuối ngày và luồng xem link câu hỏi - Hải Minh: chuẩn bị form khảo sát, phỏng vấn và tổng hợp phản hồi người dùng.|


---

## Track B — trợ lý Discord

1. **Track + đề:** B · Trợ lý Discord — Bản tin cuối ngày cho TA
2. **Job executor:** TA đang kiểm tra tin nhắn discord vào cuối ngày để xem có câu hỏi nào của học viên chưa được trả lời để trả lời.
3. **Pain:** Câu hỏi nằm trong nhiều kênh khác nhau, thời điểm hỏi không trong giờ làm việc của TA; TA phải mất rất nhiều thời gian để check từng kênh để trả lời hết tin nhắn của học viên.
4. **Bằng chứng đầu:**
   - Trong `discord-pack/k4_daily_reports.csv`, cả 4 câu trả lời từ bot đều chỉ tổng hợp những câu hay hỏi của học viên trong ngày, 2/4 câu trả lời từ bot chưa chỉ rõ link câu hỏi ở kênh nào.
   - Hỏi 6 Lab coaches trong lớp: 4/6 lab coach bị miss câu hỏi của học viên, 2/6 LC không phải trả câu hỏi của HV/không gặp vấn đề.
5. **Lát cắt:** Cuối mỗi ngày, TA nhận bản tin bot tổng hợp các câu hỏi có khả năng chưa được trả lời, bot gắn link đến đúng kênh/tin nhắn và TA quyết định câu nào cần phản hồi, giúp không bỏ sót câu hỏi của học viên.
6. **AI tự làm đến đâu:** AI tự quét các kênh trong ngày, phát hiện câu hỏi có khả năng chưa được trả lời, nhóm các câu hỏi trùng nhau, tóm tắt và gắn link nguồn; TA vẫn kiểm tra kết quả và tự trả lời vì AI có thể hiểu sai ngữ cảnh hoặc mức độ ưu tiên. **Willing users:** Nghĩa, Tài: Lab Coaches
7. **Phân công:** Minh Hiếu: phát triển bot, logic phát hiện câu hỏi chưa được trả lời và configuration - Thành Ân: phỏng vấn Lab Coach, thiết kế cách lưu trữ database và dữ liệu thử nghiệm - Đăng Dương: làm mockup bản tin cuối ngày và luồng xem link câu hỏi - Hải Minh: chuẩn bị form khảo sát, phỏng vấn và tổng hợp phản hồi người dùng.