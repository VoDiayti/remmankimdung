import type { Metadata } from "next";
import { Database, FileText, ListChecks, Lock, Mail, MapPin, Phone, ShieldCheck, UserCheck } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { buildMetadata } from "@/lib/seo";
import { telHref } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/public/page-hero";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Ngày cập nhật chính sách (dd/mm/yyyy) – sửa lại mỗi khi thay đổi nội dung bên dưới */
const LAST_UPDATED = "03/11/2026";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: "Chính sách bảo mật thông tin",
    description: `Cách ${s.companyName} thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của khách hàng khi gửi yêu cầu báo giá, đăng ký tư vấn hoặc liên hệ qua website.`,
    path: "/chinh-sach-bao-mat",
  });
}

/** Mục lục – id trùng với id của từng section bên dưới */
const SECTIONS = [
  { id: "pham-vi", title: "1. Phạm vi áp dụng" },
  { id: "thong-tin-thu-thap", title: "2. Thông tin chúng tôi thu thập" },
  { id: "muc-dich", title: "3. Mục đích sử dụng" },
  { id: "luu-tru-bao-mat", title: "4. Lưu trữ và bảo mật" },
  { id: "chia-se", title: "5. Chia sẻ thông tin" },
  { id: "cookie", title: "6. Cookie và dịch vụ bên thứ ba" },
  { id: "quyen-cua-ban", title: "7. Quyền của bạn" },
  { id: "tre-em", title: "8. Thông tin của trẻ em" },
  { id: "thay-doi", title: "9. Thay đổi chính sách" },
  { id: "lien-he", title: "10. Liên hệ" },
] as const;

const SUMMARY = [
  { Icon: ShieldCheck, text: "Không bán, không cho thuê hay trao đổi thông tin của bạn cho bất kỳ bên nào." },
  { Icon: Database, text: "Chỉ thu thập thông tin cần thiết để tư vấn, báo giá, đo đạc, lắp đặt và bảo hành." },
  { Icon: Lock, text: "Dữ liệu được mã hóa khi truyền (HTTPS); chỉ nhân viên được cấp quyền mới xem được." },
  { Icon: UserCheck, text: "Bạn có quyền xem, sửa, xóa thông tin của mình bất kỳ lúc nào qua hotline hoặc email." },
];

function TableOfContents({ className }: { className?: string }) {
  return (
    <nav aria-label="Mục lục chính sách" className={cn("rounded-2xl border bg-card p-5 shadow-sm", className)}>
      <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-dark">
        <ListChecks className="size-4 text-primary" /> Nội dung
      </p>
      <ol className="space-y-1 text-sm">
        {SECTIONS.map((sec) => (
          <li key={sec.id}>
            <a href={`#${sec.id}`} className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-brand-light hover:text-primary">
              {sec.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default async function PrivacyPolicyPage() {
  const s = await getSettings();
  const shortName = s.shortName || s.companyName;

  return (
    <>
      <PageHero
        title="Chính sách bảo mật thông tin"
        description={`Cách ${s.companyName} thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi sử dụng website và dịch vụ rèm cửa của chúng tôi.`}
        crumbs={[{ label: "Chính sách bảo mật" }]}
      >
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85">
          <FileText className="size-3.5 text-amber-300" /> Cập nhật lần cuối: {LAST_UPDATED}
        </p>
      </PageHero>

      <section className="bg-background py-14 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Tóm tắt nhanh */}
            <div className="rounded-2xl border border-primary/15 bg-brand-light p-6 md:p-7">
              <h2 className="text-lg font-bold text-brand-dark md:text-xl">Tóm tắt nhanh</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {SUMMARY.map((item) => (
                  <li key={item.text} className="flex gap-3 rounded-xl bg-card p-4 text-sm leading-relaxed">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <item.Icon className="size-4.5" />
                    </span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <TableOfContents className="mt-8 lg:hidden" />

            <article className="prose prose-neutral mt-10 max-w-none prose-headings:scroll-mt-28 prose-headings:font-bold prose-h2:text-2xl prose-h2:text-brand-dark prose-h3:text-lg prose-a:text-primary prose-strong:text-foreground prose-li:marker:text-primary">
              <section id="pham-vi">
                <h2>1. Phạm vi áp dụng</h2>
                <p>
                  Chính sách bảo mật này (“Chính sách”) giải thích cách <strong>{s.companyName}</strong> (“chúng tôi”) thu thập, sử dụng, lưu trữ, chia sẻ và bảo vệ thông tin cá nhân của bạn khi bạn truy cập website này, gửi yêu cầu báo giá, đăng ký tư vấn, gửi liên hệ hoặc sử dụng dịch vụ đo đạc – may – lắp đặt rèm cửa của chúng tôi.
                </p>
                <p>
                  Chính sách được xây dựng theo quy định của pháp luật Việt Nam về bảo vệ dữ liệu cá nhân, bao gồm Luật Bảo vệ dữ liệu cá nhân năm 2025 (có hiệu lực từ ngày 01/01/2026) và các văn bản hướng dẫn thi hành. {s.companyName} là bên kiểm soát và xử lý dữ liệu cá nhân nêu trong Chính sách này.
                </p>
                <p>
                  Khi gửi thông tin qua các biểu mẫu trên website, bạn xác nhận đã đọc, hiểu và đồng ý với Chính sách này. Nếu không đồng ý, vui lòng không cung cấp thông tin qua website và liên hệ trực tiếp với chúng tôi qua hotline.
                </p>
              </section>

              <section id="thong-tin-thu-thap">
                <h2>2. Thông tin chúng tôi thu thập</h2>
                <h3>2.1. Thông tin bạn cung cấp qua biểu mẫu</h3>
                <p>Website có các biểu mẫu “Nhận báo giá”, “Đăng ký tư vấn” và “Gửi liên hệ”. Khi gửi biểu mẫu, bạn có thể cung cấp:</p>
                <ul>
                  <li>
                    <strong>Họ và tên, số điện thoại</strong> (bắt buộc) – để nhân viên gọi lại tư vấn, xác nhận yêu cầu.
                  </li>
                  <li>
                    <strong>Email</strong> (tùy chọn) – để gửi báo giá chi tiết, xác nhận lịch hẹn.
                  </li>
                  <li>
                    <strong>Địa chỉ lắp đặt hoặc khu vực</strong> (tùy chọn) – để sắp xếp lịch đo đạc tận nơi và tính chi phí vận chuyển – lắp đặt.
                  </li>
                  <li>
                    <strong>Kích thước cửa, số lượng cửa, loại rèm hoặc sản phẩm quan tâm, nội dung ghi chú</strong> (tùy chọn) – để báo giá sát với nhu cầu thực tế.
                  </li>
                </ul>
                <h3>2.2. Thông tin được ghi nhận tự động khi gửi biểu mẫu</h3>
                <p>
                  Khi bạn gửi biểu mẫu, hệ thống ghi nhận <strong>địa chỉ IP</strong> của thiết bị, <strong>trang bạn đang xem</strong> khi gửi và <strong>thời điểm gửi</strong>. Các thông tin này chỉ dùng để chống gửi hàng loạt (spam), phát hiện yêu cầu giả mạo và thống kê kênh khách hàng tìm đến; chúng tôi không dùng chúng để theo dõi hành vi duyệt web của bạn.
                </p>
                <h3>2.3. Thông tin khi liên hệ qua kênh khác</h3>
                <p>
                  Khi bạn gọi hotline, nhắn Zalo, Messenger hoặc đến showroom, chúng tôi ghi nhận thông tin cần thiết để xử lý yêu cầu (tên, số điện thoại, nội dung trao đổi, địa chỉ lắp đặt). Các nền tảng Zalo, Facebook xử lý dữ liệu của bạn theo chính sách riêng của họ.
                </p>
                <h3>2.4. Thông tin chúng tôi không thu thập qua website</h3>
                <p>
                  Website không yêu cầu bạn tạo tài khoản và không thu thập thông tin thẻ ngân hàng hay tài khoản thanh toán. Việc thanh toán (tiền mặt, chuyển khoản) được thực hiện trực tiếp với nhân viên, không qua website. Vui lòng không ghi các thông tin nhạy cảm (số căn cước, thông tin tài chính, sức khỏe…) vào ô ghi chú.
                </p>
              </section>

              <section id="muc-dich">
                <h2>3. Mục đích sử dụng</h2>
                <p>Chúng tôi sử dụng thông tin của bạn để:</p>
                <ul>
                  <li>Liên hệ lại để tư vấn, báo giá sơ bộ và hẹn lịch đo đạc tận nơi theo yêu cầu bạn đã gửi.</li>
                  <li>Thực hiện đơn hàng: may rèm theo kích thước thực tế, giao hàng, lắp đặt và nghiệm thu.</li>
                  <li>Bảo hành, bảo trì, vệ sinh rèm và chăm sóc khách hàng sau khi lắp đặt.</li>
                  <li>Quản lý, theo dõi tiến trình xử lý yêu cầu trong hệ thống quản trị nội bộ của chúng tôi.</li>
                  <li>Bảo đảm an toàn hệ thống: chống spam, ngăn chặn yêu cầu giả mạo hoặc tấn công website.</li>
                  <li>Thống kê số lượng và nguồn yêu cầu để cải thiện website và dịch vụ.</li>
                </ul>
                <p>
                  Chúng tôi chỉ liên hệ với bạn về yêu cầu bạn đã gửi. Chúng tôi không gửi tin nhắn hay email quảng cáo hàng loạt khi chưa có sự đồng ý của bạn; nếu đã đồng ý, bạn có thể yêu cầu dừng nhận bất kỳ lúc nào.
                </p>
              </section>

              <section id="luu-tru-bao-mat">
                <h2>4. Lưu trữ và bảo mật</h2>
                <h3>4.1. Nơi lưu trữ</h3>
                <p>
                  Thông tin gửi qua biểu mẫu được lưu trong cơ sở dữ liệu của website, đặt trên hạ tầng điện toán đám mây của <strong>Cloudflare</strong> – nhà cung cấp dịch vụ lưu trữ và bảo vệ website. Máy chủ của Cloudflare có thể đặt ngoài lãnh thổ Việt Nam; dữ liệu được mã hóa khi truyền và lưu trữ theo tiêu chuẩn bảo mật của nhà cung cấp.
                </p>
                <h3>4.2. Biện pháp bảo mật</h3>
                <ul>
                  <li>Toàn bộ kết nối giữa trình duyệt của bạn và website được mã hóa bằng HTTPS.</li>
                  <li>Chỉ nhân viên được cấp tài khoản quản trị (có mật khẩu riêng, phân quyền theo vai trò) mới xem được thông tin khách hàng; tài khoản không còn sử dụng sẽ bị khóa.</li>
                  <li>Mật khẩu tài khoản quản trị được lưu dưới dạng băm, không lưu dạng văn bản thuần.</li>
                  <li>Biểu mẫu công khai có giới hạn số lần gửi theo địa chỉ IP và cơ chế chống bot để hạn chế spam.</li>
                  <li>Nhân viên chỉ được sử dụng thông tin khách hàng cho đúng mục đích công việc.</li>
                </ul>
                <p>
                  Không có phương thức truyền tải hay lưu trữ nào an toàn tuyệt đối. Nếu xảy ra sự cố lộ, mất dữ liệu cá nhân, chúng tôi sẽ thông báo cho bạn và cơ quan có thẩm quyền theo quy định pháp luật.
                </p>
                <h3>4.3. Thời gian lưu trữ</h3>
                <p>
                  Chúng tôi lưu giữ thông tin trong thời gian cần thiết để thực hiện các mục đích nêu tại mục 3 – trong quá trình tư vấn, thi công và thời hạn bảo hành – bảo trì của sản phẩm – cũng như theo thời hạn mà pháp luật về kế toán, thuế, thương mại yêu cầu. Sau thời gian đó, thông tin được xóa hoặc ẩn danh hóa. Bạn có thể yêu cầu xóa sớm hơn theo mục 7.
                </p>
              </section>

              <section id="chia-se">
                <h2>5. Chia sẻ thông tin</h2>
                <p>
                  Chúng tôi <strong>không bán, cho thuê hay trao đổi</strong> thông tin cá nhân của bạn cho bất kỳ bên nào. Thông tin chỉ được chia sẻ trong các trường hợp sau:
                </p>
                <ul>
                  <li>Nhân viên, kỹ thuật viên đo đạc – lắp đặt của chúng tôi, trong phạm vi cần thiết để thực hiện yêu cầu của bạn.</li>
                  <li>Nhà cung cấp hạ tầng kỹ thuật (Cloudflare) lưu trữ và vận hành website; họ chỉ xử lý dữ liệu theo chỉ dẫn của chúng tôi, không được dùng cho mục đích riêng.</li>
                  <li>Đơn vị vận chuyển hoặc đối tác thi công (nếu có) khi cần giao hàng, lắp đặt tại địa chỉ của bạn – chỉ chia sẻ tên, số điện thoại và địa chỉ nhận hàng.</li>
                  <li>Cơ quan nhà nước có thẩm quyền khi pháp luật yêu cầu, hoặc khi cần bảo vệ quyền, tài sản và an toàn của chúng tôi, của khách hàng hay cộng đồng.</li>
                </ul>
                <p>
                  Hình ảnh công trình đã thi công chỉ được đăng lên website, mạng xã hội khi có sự đồng ý của bạn và không kèm thông tin định danh (tên, địa chỉ cụ thể).
                </p>
              </section>

              <section id="cookie">
                <h2>6. Cookie và dịch vụ bên thứ ba</h2>
                <p>
                  Phần công khai của website <strong>không sử dụng cookie theo dõi hay cookie quảng cáo</strong>. Cookie phiên đăng nhập chỉ được tạo khi nhân viên đăng nhập khu vực quản trị nội bộ, không áp dụng với khách truy cập.
                </p>
                <p>Một số nội dung trên website do bên thứ ba cung cấp và có thể đặt cookie hoặc thu thập dữ liệu theo chính sách riêng của họ khi bạn tương tác:</p>
                <ul>
                  <li>Video YouTube: nhúng ở chế độ tăng cường quyền riêng tư (youtube-nocookie) và chỉ tải khi bạn bấm phát.</li>
                  <li>Bản đồ Google Maps tại trang Liên hệ.</li>
                  <li>Nút chia sẻ và liên kết đến Facebook, Zalo, Messenger, TikTok, YouTube.</li>
                  <li>Cloudflare: xử lý địa chỉ IP để chống tấn công, tối ưu tốc độ và cung cấp chứng chỉ HTTPS cho website.</li>
                </ul>
                <p>Bạn có thể quản lý hoặc chặn cookie trong cài đặt trình duyệt; website vẫn hoạt động bình thường khi tắt cookie.</p>
              </section>

              <section id="quyen-cua-ban">
                <h2>7. Quyền của bạn</h2>
                <p>Theo pháp luật về bảo vệ dữ liệu cá nhân, bạn có các quyền sau đối với thông tin của mình:</p>
                <ul>
                  <li>
                    <strong>Được biết và truy cập:</strong> biết chúng tôi đang lưu những thông tin gì về bạn và yêu cầu cung cấp bản sao.
                  </li>
                  <li>
                    <strong>Chỉnh sửa:</strong> yêu cầu sửa thông tin sai hoặc chưa đầy đủ.
                  </li>
                  <li>
                    <strong>Xóa:</strong> yêu cầu xóa thông tin khi không còn cần thiết cho mục đích thu thập, trừ trường hợp pháp luật yêu cầu lưu giữ.
                  </li>
                  <li>
                    <strong>Rút lại sự đồng ý, phản đối hoặc hạn chế xử lý:</strong> yêu cầu chúng tôi ngừng liên hệ hoặc ngừng sử dụng thông tin cho một mục đích nhất định.
                  </li>
                  <li>
                    <strong>Khiếu nại:</strong> với chúng tôi hoặc với cơ quan nhà nước có thẩm quyền nếu cho rằng quyền của bạn bị xâm phạm.
                  </li>
                </ul>
                <p>
                  Để thực hiện các quyền trên, vui lòng liên hệ qua hotline hoặc email tại mục 10. Chúng tôi có thể yêu cầu xác minh (ví dụ gọi từ số điện thoại đã đăng ký) để bảo vệ thông tin khỏi truy cập trái phép, và sẽ phản hồi trong thời gian sớm nhất theo thời hạn pháp luật quy định. Việc thực hiện các quyền này là miễn phí.
                </p>
              </section>

              <section id="tre-em">
                <h2>8. Thông tin của trẻ em</h2>
                <p>
                  Website và dịch vụ của chúng tôi hướng đến khách hàng là người trưởng thành. Chúng tôi không chủ đích thu thập thông tin cá nhân của trẻ em dưới 16 tuổi khi chưa có sự đồng ý của cha mẹ hoặc người giám hộ. Nếu bạn cho rằng trẻ em đã cung cấp thông tin cho chúng tôi, vui lòng liên hệ để chúng tôi xóa thông tin đó.
                </p>
              </section>

              <section id="thay-doi">
                <h2>9. Thay đổi chính sách</h2>
                <p>
                  Chúng tôi có thể cập nhật Chính sách này khi thay đổi cách thu thập – xử lý dữ liệu hoặc khi pháp luật thay đổi. Phiên bản mới được đăng tại trang này kèm ngày cập nhật ở đầu trang; thay đổi quan trọng sẽ được thông báo rõ trên website. Bạn nên xem lại Chính sách định kỳ.
                </p>
              </section>

              <section id="lien-he">
                <h2>10. Liên hệ</h2>
                <p>Mọi câu hỏi, yêu cầu liên quan đến thông tin cá nhân, vui lòng liên hệ với {shortName} qua:</p>
              </section>
            </article>

            {/* Thông tin liên hệ – lấy từ Cài đặt chung */}
            <div className="mt-6 rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-lg font-bold text-brand-dark">{s.companyName}</p>
              <ul className="mt-4 space-y-3 text-sm">
                {s.address && (
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{s.address}</span>
                  </li>
                )}
                <li className="flex gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                  <a href={telHref(s.hotline)} className="font-semibold hover:text-primary">
                    {s.hotline}
                  </a>
                </li>
                {s.email && (
                  <li className="flex gap-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                    <a href={`mailto:${s.email}`} className="font-semibold hover:text-primary">
                      {s.email}
                    </a>
                  </li>
                )}
                {s.taxCode && (
                  <li className="flex gap-3">
                    <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>Mã số thuế: {s.taxCode}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <TableOfContents className="hidden lg:block" />
            <div className="rounded-2xl border border-primary/15 bg-brand-light p-6">
              <ShieldCheck className="size-10 text-primary" />
              <h2 className="mt-3 text-xl font-bold text-brand-dark">Yêu cầu về dữ liệu cá nhân</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Muốn xem, sửa hoặc xóa thông tin bạn đã gửi? Gọi hotline hoặc gửi email, chúng tôi sẽ xử lý trong thời gian sớm nhất.
              </p>
              <Button asChild size="lg" className="mt-5 h-12 w-full bg-cta text-base font-semibold text-cta-foreground hover:bg-cta-hover">
                <a href={telHref(s.hotline)}>
                  <Phone className="size-5" /> {s.hotline}
                </a>
              </Button>
              {s.email && (
                <Button asChild size="lg" variant="outline" className="mt-2 h-12 w-full bg-background text-base">
                  <a href={`mailto:${s.email}`}>
                    <Mail className="size-5" /> Gửi email
                  </a>
                </Button>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
