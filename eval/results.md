# CP3 — Kết quả chạy Golden Set (Run 1)

**Thử 20 câu, đúng cả 3 tiêu chí 17 câu (85%).**

| ID | Lớp | Tin nhắn | Nhãn đúng | AI trả về | Khớp |
|---|---|---|---|---|---|
| G01 | ① Nguồn sự thật | Tôi nộp codelab trên Vlearn đúng giờ deadline 23:59 nhưng commit trên máy bị lỗi, sau thời gian đó mới đẩy lên thì có tính là nộp đúng hạn không? | P0 · false_resolution | P0 · false_resolution | ✅ |
| G02 | ① Nguồn sự thật | Vì buổi sáng học 13h mới tan mà chiều em có lịch bận, em có thể xin tan sớm vào buổi sáng không ạ? | P1 · false_resolution | P1 · false_resolution | ✅ |
| G03 | ① Nguồn sự thật | Ở level 2 em muốn theo hướng CV cho predictive maintenance thay vì chỉ detect vật thể trong cabin/tự hành được không ạ? | P1 · false_resolution | P1 · false_resolution | ✅ |
| G04 | ① Nguồn sự thật | Email cá nhân nhận lịch mã số 02, sau đó nhận thêm mã số 03. Còn email Outlook thì ngược lại, vậy mình nên học theo lịch nào? | P1 · unresolved | P1 · unresolved | ✅ |
| G05 | ② Mơ hồ/thiếu tin | Hạn nộp Lab02 là ngày nào vậy ạ, em thấy thông báo ghi không rõ. | P0 · unresolved | P1 · unresolved | ❌ |
| G06 | ② Mơ hồ/thiếu tin | Có điểm danh ws không ạ | P1 · unresolved | P1 · unresolved | ✅ |
| G07 | ② Mơ hồ/thiếu tin | Em vẫn chưa biết LV2 có build và sẽ build cái gì để lập team cho hợp lý. Ngày đầu tiên nghe mấy anh giảng viên bảo LV2 chỉ học 3 tuần rồi thực chiến tại doanh nghiệp luôn. | P1 · false_resolution | P1 · false_resolution | ✅ |
| G08 | ② Mơ hồ/thiếu tin | Buổi workshop chủ nhật ngày mai có tính vào số buổi nghỉ không ạ? Giả dụ sáng mai em có việc thì sao ạ? | P1 · resolved | P1 · resolved | ✅ |
| G09 | ② Mơ hồ/thiếu tin | Ai có link Zoom buổi workshop tối nay không ạ, em tìm hoài không ra. | P1 · unresolved | P0 · unresolved | ❌ |
| G10 | ③ Ngoài phạm vi | Thứ 3 tuần sau lecture sáng em có việc muốn xin vào trễ 30 phút, thì gửi mail cho ai ạ? | P1 · resolved | P1 · resolved | ✅ |
| G11 | ③ Ngoài phạm vi | Mới có thông báo lập team trên Phoenix, cho em hỏi là LV2 có cần phải lập team không ạ? | P1 · resolved | P1 · resolved | ✅ |
| G12 | ③ Ngoài phạm vi | Em đang cần hỗ trợ về vấn đề giấy tờ gấp thì liên lạc đến bộ phận nào ạ? | P0 · false_resolution | P1 · false_resolution | ❌ |
| G13 | ③ Ngoài phạm vi | Workshop bắt đầu chưa ạ? Em vào phòng chờ Zoom 15 phút rồi mà vẫn chưa được duyệt vào. | P0 · unresolved | P0 · unresolved | ✅ |
| G14 | ③ Ngoài phạm vi | Bọn em vẫn chưa vào được Phoenix thì lập nhóm như thế nào ạ? | P0 · unresolved | P0 · unresolved | ✅ |
| G15 | ④ Đặc thù domain | Ngay sau docker compose up -d, OPA chưa lấy được policy bundle từ cvat-server nên health check báo lỗi 500. | P1 · unresolved | P1 · unresolved | ✅ |
| G16 | ④ Đặc thù domain | Cho em hỏi Lab2 có được extend thời gian submit thêm không ạ? Em lỡ nộp muộn 1 phút không submit bài được ạ. | P0 · unresolved | P0 · unresolved | ✅ |
| G17 | ④ Đặc thù domain | Cho em hỏi việc clone hoặc fork code của nhóm khác trong bài lab có bị coi là gian lận không ạ? | P1 · unresolved | P1 · unresolved | ✅ |
| G18 | ④ Đặc thù domain | Anh cho em hỏi Vlearn chưa up bài mới hả? | P1 · false_resolution | P1 · false_resolution | ✅ |
| N01 | Noise | Không có câu hỏi thì lắng nghe các quy định và nội dung thôi. Đâu có bắt buộc hỏi 😅 | NONE · resolved · noise | NONE · resolved · noise | ✅ |
| N02 | Noise | [Thông báo @everyone của BTC] Hoàn thiện các bước onboarding vào chương trình, hạn hoàn thành và ghép đội tự do đến 21:00 13/9. | NONE · resolved · noise | NONE · resolved · noise | ✅ |

## Phân tích nguyên nhân case sai

- **G05** (② Mơ hồ/thiếu tin): priority: AI="P1" ≠ đúng="P0". AI giải thích: "Học viên hỏi về hạn nộp bài tập, cần làm rõ mốc thời gian để hoàn thành kịp tiến độ."
- **G09** (② Mơ hồ/thiếu tin): priority: AI="P0" ≠ đúng="P1". AI giải thích: "Học viên cần link để vào lớp học ngay, chưa có phản hồi."
- **G12** (③ Ngoài phạm vi): priority: AI="P1" ≠ đúng="P0". AI giải thích: "Phản hồi chưa cung cấp địa chỉ email cụ thể hoặc quy trình rõ ràng cho học viên."
