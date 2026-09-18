# AI SPEC —  Bản tin cuối ngày cho Lab Coach · Nhóm 404NotFound · Zone 3
Hướng: [ ] A — VLearn  [x] B — Trợ lý Discord   [ ] C — Làn mở
Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

## §1. User & Job
- Job executor + workflow (đính kèm worksheet JTBD / ảnh sơ đồ): **Lab Coach**. Vào cuối ngày, Lab Coach rà soát các tin nhắn trong nhiều kênh Discord, tìm câu hỏi của học viên chưa được trả lời, mở đúng ngữ cảnh của từng câu hỏi, rồi trả lời.
- Core JTBD (không tên sản phẩm/AI trong câu): **Cuối mỗi ngày, rà soát các kênh Discord để tìm và xử lý những câu hỏi của học viên còn bị bỏ sót.**
- Problem statement (KHÔNG chữ AI): **Câu hỏi của học viên nằm rải rác ở nhiều kênh và có thể được gửi ngoài giờ làm việc, khiến TA phải kiểm tra thủ công từng kênh, tốn thời gian và vẫn có nguy cơ bỏ sót câu hỏi cần trả lời.**
- Evidence (chuẩn A và/hoặc B — log đầy đủ trong repo):
  - **Số liệu mining / kết quả khảo sát (n = 6 Lab Coaches, 66,7% xác nhận gặp vấn đề):** nhóm hỏi 6 Lab Coaches trong lớp về việc có từng bỏ sót câu hỏi của học viên hay không; **4/6** cho biết đã bị miss câu hỏi, **2/6** cho biết không phải trả lời câu hỏi của học viên hoặc chưa gặp vấn đề. Ngoài ra, nhóm rà soát **4** bản tin trong `discord-pack/k4_daily_reports.csv`: cả 4 bản chỉ tổng hợp các câu hỏi thường gặp trong ngày và **2/4** bản chưa chỉ rõ link đến kênh/tin nhắn nguồn.
  - **Quote/ví dụ nguyên văn + nguồn:** "Mình thấy khó khăn lớn nhất trong việc theo dõi các câu hỏi của học viên là do có quá nhiều câu hỏi được hỏi ở nhiều kênh khác nhau” - Lab coach "X"
## §2. Impact & quyết định chọn
- Bảng impact ≥3 ứng viên (bao nhiêu người · tần suất · tốn gì mỗi lần · khả thi):

  | Ứng viên | Bao nhiêu người / tín hiệu | Tần suất | Tốn gì mỗi lần | Khả thi trong hackathon | Quyết định |
  |---|---|---|---|---|---|
  | Bản tin cuối ngày phát hiện câu hỏi có khả năng chưa được trả lời, gom câu trùng và gắn link nguồn | 4/6 Lab Coaches từng miss câu hỏi; job phát sinh vào cuối mỗi ngày | Hàng ngày, theo workflow trong canvas | Thời gian kiểm tra nhiều kênh và rủi ro bỏ sót câu hỏi | Cao: có thể dùng data giả/data pack, mock flow và một lời gọi AI ở bước phát hiện/gom nhóm | **Chọn** |
  | Bổ sung link kênh/tin nhắn nguồn vào bản tin hiện có | 2/4 bản tin được rà soát thiếu link nguồn | Mỗi bản tin trong ngày | TA phải lần lại kênh và ngữ cảnh thủ công; giảm khả năng kiểm chứng | Cao: giới hạn ở truy xuất và hiển thị nguồn | Loại khỏi lát cắt chính, giữ làm yêu cầu bắt buộc của ứng viên chọn |
  | Tự động trả lời trực tiếp các câu hỏi của học viên | Chưa có số liệu xác nhận nhu cầu; bằng chứng hiện tại chỉ nói về việc **tìm câu hỏi bị bỏ sót** | Có thể phát sinh bất kỳ lúc nào | Nếu trả lời sai, học viên có thể nhận hướng dẫn sai; TA phải sửa và chịu trách nhiệm | Trung bình/thấp: cần đánh giá ngữ cảnh, quyền trả lời và chất lượng câu trả lời | **Loại** |
- Ứng viên ĐÃ LOẠI + vì sao:
  - **Tự động trả lời trực tiếp:** không đúng pain đã được chứng minh; bài toán hiện tại là phát hiện và định tuyến câu hỏi bị bỏ sót. Cost-of-error cao vì câu trả lời sai có thể làm học viên hiểu sai, trong khi chưa có evidence đủ mạnh cho độ chính xác.
  - **Chỉ bổ sung link nguồn:** giải quyết lỗi `2/4` bản tin thiếu link nhưng chưa bao quát nguyên nhân lớn hơn là TA phải rà soát nhiều kênh và vẫn miss câu hỏi. Giữ lại như yêu cầu bắt buộc trong bản tin chính.
- Ứng viên CHỌN + vì sao (bằng số): **Bản tin cuối ngày cho TA phát hiện câu hỏi có khả năng chưa được trả lời, nhóm các câu trùng nhau, tóm tắt và gắn link nguồn.** Đây là hướng duy nhất đồng thời bám vào **4/6 (66,7%)** Lab Coaches từng miss câu hỏi và lỗi kiểm chứng nguồn ở **2/4 (50%)** bản tin đã rà soát. Hướng này cũng giữ quyết định cuối cho TA, nên phù hợp với rủi ro cao hơn của việc trả lời sai, trong khi vẫn khả thi để prototype trong phạm vi hackathon.

## §3. Giải pháp tương tự đã nghiên cứu
- Trợ lý Kute: 
  - Họ đang làm: Discord bot có sử dụng AI, người dùng có thể hỏi trực tiếp "Những câu hỏi chưa được trả lời hôm nay là gì"
  - Điều đáng học: Tận dụng khả năng của AI để tạo văn bản tự nhiên, thân thiện
  - Điều đáng tránh: Một bot "toàn năng" nhưng không thực sự fit với bài toán
  - Điểm khác biệt: Giải pháp của nhóm chỉ giải quyết 1 vấn đề duy nhất của 1 nhóm người dùng cụ thể, tối ưu cho việc giải quyết vấn đề ấy tốt hơn
- Discord Search + Threads/Pinned messages (cách làm thủ công hiện có):
  - Họ đang làm: TA tìm theo từ khóa trong từng kênh, mở thread hoặc tin đã ghim để kiểm tra ngữ cảnh và tự đánh dấu câu hỏi đã xử lý.
  - Điều đáng học: Nguồn phải nằm cạnh nội dung cần xử lý; thread và permalink giúp người dùng quay lại đúng ngữ cảnh.
  - Điều đáng tránh: Phụ thuộc vào việc TA nhớ từ khóa và lặp lại thao tác ở nhiều kênh; không có hàng đợi chung cho câu hỏi chưa được trả lời.
  - Điểm khác biệt: Nhóm tự động quét theo khung thời gian, kiểm tra lịch sử phản hồi, gom câu trùng và gửi digest tập trung vào `#ta-internal-digest`, nhưng vẫn giữ thao tác kiểm tra và trả lời ở tin gốc cho TA.
## §4. Thiết kế
- Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả): **Mỗi ngày, sau mỗi buổi học hoặc khi Lab Coach gõ `/digest now`, hệ thống quét tin nhắn public trong ngày, AI xác định và gom các câu hỏi chưa được trả lời, rồi gửi một digest có mức ưu tiên và permalink để Lab Coach mở đúng tin nhắn và tự trả lời, giúp giảm nguy cơ bỏ sót.**
- Non-goals (≥3 thứ KHÔNG build):
  - Không tự động gửi câu trả lời cho học viên; Lab Coach luôn là người kiểm tra và chịu trách nhiệm trả lời.
  - Không quét DM, kênh private hoặc dữ liệu ngoài các kênh public được cấu hình.
  - Không thay thế hệ thống ticket/escalation trong digest.
  - Không tự xác nhận một câu hỏi là “đã giải quyết” chỉ vì có bot phản hồi rỗng hoặc câu “hãy tạo ticket”.
  - Không lưu hoặc hiển thị nội dung không cần thiết ngoài tác giả, thời gian, kênh, nội dung câu hỏi và permalink.
- Mức prototype nhắm tới: [ ] Sketch [x] Mock [ ] Working — phần nào mock, phần nào thật:
  - **Mock:** giao diện Discord, một số kênh và tin nhắn đầu vào, cron job 20:00 trong lúc demo, phần cuộn đến tin nhắn gốc, và việc gửi reaction sau khi Lab Coach xử lý.
  - **Thật:** luồng `/digest now`, bộ lọc nội dung, kiểm tra lịch sử phản hồi, AI gom nhóm câu hỏi, trích xuất tác giả/thời gian/kênh, xếp P0/P1, tạo permalink fixture và chia digest khi vượt 2.000 ký tự.
  - **Kết quả đầu ra:** digest được gửi vào `#ta-internal-digest`, mỗi nhóm có câu hỏi, mức ưu tiên, metadata, permalink và trạng thái để Lab Coach xử lý.
- Automation: [ ] augment [x] conditional [ ] automate — hệ thống tự động làm các bước lặp lại và ít rủi ro (quét, lọc, gom nhóm, định dạng); các trường hợp không chắc phải được đưa vào digest với nhãn cần kiểm tra. Lab Coach vẫn mở permalink, đối chiếu ngữ cảnh và trả lời vì nếu AI bỏ sót hoặc gán sai câu hỏi thì chi phí sửa là mất thời gian và có thể làm học viên chờ; nếu AI tự trả lời sai thì chi phí còn cao hơn do học viên có thể học hoặc làm theo thông tin sai.
- Luồng demo chi tiết:
  1. Trigger: cron sau mỗi buổi học hằng ngày hoặc Lab Coach gõ `/digest now`.
  2. Thu thập: quét tin nhắn trong ngày từ các kênh public đã cấu hình.
  3. Lọc: bỏ tin chào hỏi/tán gẫu/bot spam; bỏ câu hỏi đã có Coach/TA trả lời; giữ câu hỏi chưa có trả lời và câu chỉ nhận bot reply rỗng hoặc yêu cầu tạo ticket.
  4. AI processing: gom câu hỏi cùng chủ đề, trích xuất tác giả/thời gian/kênh, tạo permalink, rồi chia thành nhiều Discord Embed nếu tổng nội dung vượt 2.000 ký tự.
  5. TA workflow: gửi digest vào `#ta-internal-digest`; Lab Coach đọc, bấm **Nhảy đến tin nhắn**, trả lời trực tiếp tại tin gốc và react ✅ trên digest để báo đã xử lý.
- §4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR, xem guide):
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|
  | G1 — Làm rõ hệ thống làm được gì | Digest ghi rõ phạm vi: chỉ quét kênh public trong ngày và chỉ đề xuất câu hỏi có khả năng chưa được trả lời; không tự trả lời học viên. |
  | G2 — Làm rõ nó làm tốt đến đâu | Mỗi mục hiển thị trạng thái và lý do được đưa vào hàng đợi, cùng permalink để Lab Coach tự kiểm tra thay vì mặc định tin kết luận AI. |
  | G10 — Thu hẹp phạm vi khi nghi ngờ | Tin chỉ có bot reply rỗng, câu hỏi thiếu ngữ cảnh hoặc không xác định được lịch sử phản hồi được gắn “Cần kiểm tra”, không tự loại bỏ. |
  | G11 — Giải thích vì sao | Mỗi mục ghi nguồn gồm tác giả, thời gian, kênh và link trực tiếp; digest phân biệt P0 blocker/deadline với P1 thủ tục. |
  | G8 — Gạt bỏ dễ dàng | Lab Coach có thể bỏ qua mục không liên quan bằng cách không mở link hoặc đánh dấu đã xử lý; hệ thống không chặn việc trả lời thủ công. |
  | G17 — Quyền kiểm soát tổng | Trigger thủ công `/digest now`, quyền quyết định trả lời, và reaction ✅ đều nằm ở Lab Coach; AI không có quyền gửi câu trả lời cho học viên. |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

| Tình huống cụ thể | Lớp | Hành vi mong muốn | Nguyên tắc áp |
|---|---|---|---|
| Tin nhắn là “hii”, emoji, tán gẫu hoặc bot spam | ② Mơ hồ/thiếu thông tin | Lọc khỏi digest, không làm tăng hàng đợi unresolved | G1, PAIR Errors |
| Tin có dấu hỏi nhưng không chứa câu hỏi hoàn chỉnh, ví dụ “ai biết cái này không?” | ② Mơ hồ/thiếu thông tin | Giữ lại với nhãn “Cần kiểm tra”, không tự suy đoán nội dung | G10 |
| Câu hỏi đã có Coach trả lời trong thread | ① Nguồn sự thật | Đánh dấu đã xử lý và không đưa vào digest | G11 |
| Chỉ có bot trả lời rỗng hoặc “hãy tạo ticket” | ① Nguồn sự thật | Đưa vào unresolved vì chưa có câu trả lời của người; hiển thị lý do giữ lại | G10, G11 |
| Không tạo được permalink hợp lệ | ① Nguồn sự thật | Không tạo link giả; hiển thị mã kênh/tin nhắn và gắn “Không có link, cần mở thủ công” | G2, G10 |
| Tổng digest vượt 2.000 ký tự | ③ Ngoài phạm vi/kỹ thuật | Chia thành nhiều Embed liên tiếp, giữ thứ tự và số thứ tự nhóm | G8 |
| Tin nằm trong DM hoặc kênh private chưa được cấp quyền | ③ Ngoài phạm vi/thẩm quyền | Không quét, không báo nội dung; ghi log số lượng bị bỏ qua nếu cần | G1, G17 |
| AI gộp nhầm hai câu hỏi khác chủ đề | ④ Đặc thù domain | Tách nhóm khi confidence thấp, hiển thị từng permalink để Lab Coach sửa bằng thao tác thủ công | G9, G10 |
| AI xếp câu hỏi deadline thành P1 | ④ Đặc thù domain | Cho phép Lab Coach nhận diện qua nhãn “Cần kiểm tra”; không tự trả lời và ưu tiên hiển thị từ khóa deadline/blocker | G2, G11 |
| Tin nhắn chứa thông tin cá nhân hoặc nội dung ngoài phạm vi học tập | ③ Ngoài phạm vi/thẩm quyền | Không tóm tắt thêm dữ liệu; chỉ đưa metadata tối thiểu hoặc loại khỏi digest theo cấu hình | G17 |

## §6. Bốn đường đi của trải nghiệm
- Happy path: đến lịch hoặc `/digest now` → quét tin public → bỏ chào hỏi/spam và câu đã có người trả lời → gom các câu hỏi unresolved → tạo metadata/permalink → xếp P0/P1 → gửi digest vào `#ta-internal-digest` → Lab Coach mở link, trả lời ở tin gốc và react ✅.
- Low-confidence (②): AI không chắc đó là câu hỏi hoặc không chắc lịch sử phản hồi → vẫn hiển thị mục với nhãn **Cần kiểm tra**, lý do và permalink; Lab Coach tự quyết định giữ/bỏ.
- Failure/không căn cứ (①): không đọc được lịch sử, không có permalink hoặc chỉ có bot reply rỗng → không bịa trạng thái “đã trả lời”; đưa vào unresolved hoặc báo lỗi rõ ràng, kèm hành động mở thủ công.
- Correction (user sửa): Lab Coach mở tin gốc, tự đối chiếu và trả lời; nếu nhóm/gán ưu tiên sai thì bỏ qua reaction ✅ cho mục đó và xử lý thủ công. Lần chạy sau không coi reaction của digest là câu trả lời cho tin gốc.
- Khi bị đòi ngoài phạm vi (③): DM, private channel, yêu cầu tự trả lời, yêu cầu xử lý ticket hoặc dữ liệu không thuộc kênh cấu hình → thông báo “Ngoài phạm vi digest”, không quét/không tự hành động.
- Case đặc thù domain (④): câu hỏi có deadline, blocker, lỗi môi trường hoặc yêu cầu thủ tục → ưu tiên P0 nếu có tín hiệu blocker/deadline; P1 nếu chỉ là hướng dẫn thủ tục; luôn giữ permalink để Coach kiểm tra ngữ cảnh.

## §7. Kiểm thử
- Chiều chất lượng + định nghĩa kiểm chứng được:
  - **Coverage:** mọi case hợp lệ đều được xử lý đúng một nhánh: bỏ qua, đã xử lý, unresolved hoặc lỗi cần kiểm tra; không bị mất im lặng.
  - **Traceability:** mọi mục được đưa vào digest phải có tác giả, thời gian, kênh và permalink hợp lệ; không được bịa link hoặc nguồn.
  - **Triage:** P0 chỉ dùng khi có tín hiệu blocker/deadline; case thủ tục thông thường là P1. Hai người chấm độc lập phải đồng ý cùng nhãn hoặc ghi rõ lý do bất đồng.
  - **Formatting/reliability:** digest không vượt 2.000 ký tự mỗi Embed; khi vượt phải chia đúng thứ tự, không mất mục và trigger `/digest now` phải tạo được kết quả.
- Golden set (≥20 case theo cơ cấu trong guide §2.6, file trong eval/): 
- Quality bar (chốt từ hạn chốt spec của khoá, giữ nguyên sau đó): **“Đạt khi ≥80% case trong golden set được phân loại đúng và không có case P0 nào mất permalink hợp lệ; mọi mục unresolved phải có lý do kiểm tra.”**
- Kết quả các lượt chạy (bảng % — cập nhật đến trước CP6):

  | Lượt | Số case | Coverage | Traceability | Triage | Formatting | Đạt quality bar? | Failure chính |
  |---|---:|---:|---:|---:|---:|---|---|
  | Chưa chạy | 20+ | Chưa đo | Chưa đo | Chưa đo | Chưa đo | Chưa kết luận | Cần tạo `eval/golden-set.md` và log kết quả |

## §8. Phân công & kế hoạch
- Phân công có tên: spec / evidence / prompt / code / demo
  - **Lê Minh Hiếu:** code bot, cron/`/digest now`, logic phát hiện câu hỏi chưa trả lời, configuration và AI call.
  - **Dương Hải Minh:** evidence, form/phỏng vấn, log quote và tổng hợp phản hồi người dùng.
  - **Đỗ Trương Thành Ân:** prompt/golden set, thiết kế lưu trữ dữ liệu và fixture thử nghiệm.
  - **Tạ Đăng Dương:** UX/UI, mockup digest, nút permalink và demo flow.
  - **Cả nhóm:** review các case P0, chạy golden set, dry run và thuyết trình.
- Willing users (≥2 tên) + kế hoạch vòng validation: **Nghĩa và Tài — Lab Coaches** (canvas đã ghi nhận). Mỗi người thực hiện một phiên khoảng 10 phút: giao task “dùng digest để tìm và xử lý câu hỏi chưa được trả lời”, quan sát thao tác đầu tiên, thời điểm do dự, việc mở permalink và cách đánh dấu hoàn tất; ghi quote nguyên văn và một thay đổi sau test vào `validation/`.
- Multi-prototype (nếu làm): phương án A gửi digest tự động lúc 22:00; phương án B chỉ tạo digest khi Lab Coach gõ `/digest now`. Nhóm chọn **kết hợp cả hai**: cron phục vụ công việc định kỳ, lệnh thủ công phục vụ retry/demo và tình huống cần kiểm tra ngay; hai trigger dùng chung pipeline để giảm khác biệt hành vi.

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |

