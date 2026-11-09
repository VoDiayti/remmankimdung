/**
 * Sinh dữ liệu mẫu cho Cloudflare D1 (website rèm màn).
 * Script này KHÔNG kết nối database: nó tạo file db/seed.sql, sau đó wrangler áp dụng file đó:
 *   npm run db:seed          → D1 local (dùng với `next dev` / `npm run preview`)
 *   npm run db:seed:remote   → D1 production
 * ID các bản ghi được sinh ổn định theo tên nên chạy lại nhiều lần không tạo bản ghi trùng (INSERT OR IGNORE).
 *
 * LƯU Ý: thông tin cửa hàng, giá, số liệu, đối tác... bên dưới là DỮ LIỆU MẪU – sửa trong Admin.
 */
import "dotenv/config";
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { hashPassword } from "../src/lib/password";

type Value = string | number | boolean | Date | null | undefined;
type Row = Record<string, Value>;

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);
const FOUNDED_YEAR = 2018;

/** ID ổn định theo nhãn (dạng cuid 25 ký tự) */
const sid = (label: string) => `c${createHash("sha256").update(`remmankimdung-seed:${label}`).digest("hex").slice(0, 24)}`;
const json = (list: string[]) => JSON.stringify(list);
const stamps = (createdAt: Date = now) => ({ createdAt, updatedAt: now });

function lit(v: Value): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return `'${v.toISOString()}'`;
  return `'${v.replace(/'/g, "''")}'`;
}

const statements: string[] = [];
function insert(table: string, rows: Row[]) {
  for (const row of rows) {
    const cols = Object.keys(row);
    statements.push(`INSERT OR IGNORE INTO "${table}" (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${cols.map((c) => lit(row[c])).join(", ")});`);
  }
}

const cat = (slug: string) => sid(`category:${slug}`);
const tag = (slug: string) => sid(`tag:${slug}`);
const pcat = (slug: string) => sid(`product-category:${slug}`);
const line = (slug: string) => sid(`product-line:${slug}`);
const product = (slug: string) => sid(`product:${slug}`);
const post = (slug: string) => sid(`post:${slug}`);

async function main() {
  // ---------- CÀI ĐẶT CHUNG ----------
  insert("Setting", [
    {
      id: 1,
      companyName: "Công ty TNHH Rèm Màn Kim Dung",
      shortName: "Rèm Kim Dung",
      slogan: "Đẹp từng ô cửa – Bền từng đường may",
      logo: "/logo.svg",
      taxCode: "0316 123 456",
      foundedYear: FOUNDED_YEAR,
      hotline: "0909 123 456",
      zalo: "0909123456",
      email: "lienhe@remmankimdung.vn",
      address: "123 Nguyễn Văn Linh, P. Tân Phong, Quận 7, TP. Hồ Chí Minh",
      mapEmbedUrl: null,
      workingHours: "8:00 – 19:00, Thứ 2 – Chủ nhật",
      facebook: "https://facebook.com/remmankimdung",
      youtube: null,
      tiktok: null,
      messenger: null,
      statCustomers: 3500,
      statYears: now.getFullYear() - FOUNDED_YEAR,
      statProjects: 1200,
      statProducts: 500,
      aboutShort:
        "Rèm Kim Dung là xưởng may và showroom rèm cửa tại TP. Hồ Chí Minh, chuyên rèm vải, rèm cuốn, rèm cầu vồng, rèm roman, rèm sáo gỗ – nhôm cho căn hộ, nhà phố, văn phòng và khách sạn. Chúng tôi đo đạc tận nơi miễn phí, báo giá theo mét vuông rõ ràng và lắp đặt trong 3 – 5 ngày.",
      aboutContent: `<h2>Câu chuyện Rèm Kim Dung</h2><p>Thành lập năm ${FOUNDED_YEAR} từ một xưởng may nhỏ tại Quận 7, Rèm Kim Dung đã thi công hơn 1.200 công trình lớn nhỏ: căn hộ chung cư, biệt thự, văn phòng, khách sạn và trường học trên khắp TP. Hồ Chí Minh và các tỉnh lân cận.</p><h2>Vì sao khách hàng chọn Kim Dung</h2><ul><li><strong>Giá tận xưởng:</strong> tự may, tự lắp, không qua trung gian.</li><li><strong>Hơn 500 mẫu vải</strong> nhập khẩu Hàn Quốc, Đài Loan, Bỉ và Việt Nam, cập nhật theo mùa.</li><li><strong>Đo đạc – tư vấn tận nơi miễn phí</strong> trong 24 giờ, báo giá chi tiết theo từng ô cửa.</li><li><strong>Bảo hành 12 – 24 tháng</strong>, bảo trì trọn đời, đổi mới nếu lỗi sản xuất.</li></ul><h2>Xưởng sản xuất</h2><p>Xưởng rộng 600 m² với máy may công nghiệp, máy cắt vải tự động và đội ngũ thợ may hơn 10 năm kinh nghiệm, đảm bảo đường may thẳng, nếp rèm đều và đúng kích thước từng milimet.</p>`,
      vision: "Trở thành thương hiệu rèm cửa được tin chọn nhất tại miền Nam, mang vẻ đẹp và sự tiện nghi đến mọi không gian sống.",
      mission: "Mang đến giải pháp che nắng – trang trí phù hợp cho từng ô cửa với chất lượng xưởng, giá hợp lý và dịch vụ tận tâm từ tư vấn đến bảo hành.",
      warrantyText: "Bảo hành 12 – 24 tháng, bảo trì trọn đời, đổi mới trong 7 ngày nếu lỗi sản xuất",
      introVideoUrl: null,
      metaTitle: "Rèm Kim Dung – Rèm cửa đẹp, giá xưởng tại TP. HCM",
      metaDescription: "Rèm vải, rèm cuốn, rèm cầu vồng, rèm roman, rèm sáo gỗ – nhôm cho căn hộ, nhà phố, văn phòng. Đo đạc tận nơi miễn phí, lắp đặt trong 3 – 5 ngày, bảo hành đến 24 tháng.",
      ogImage: "/og-default.jpg",
      priceTableTitle: "Bảng giá rèm cửa tham khảo",
      priceTableEnabled: true,
      updatedAt: now,
    },
  ]);

  // ---------- TÀI KHOẢN ----------
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";
  const adminId = sid(`user:${adminEmail}`);
  const editorId = sid("user:editor");
  insert("User", [
    { id: adminId, email: adminEmail, name: "Quản trị viên", passwordHash: await hashPassword(adminPassword), role: "ADMIN", isActive: true, ...stamps() },
    { id: editorId, email: "bientap@remmankimdung.vn", name: "Biên tập viên", passwordHash: await hashPassword("Editor@12345"), role: "EDITOR", isActive: true, ...stamps() },
  ]);

  // ---------- CHUYÊN MỤC & THẺ BÀI VIẾT ----------
  const categories: [string, string, string][] = [
    ["kinh-nghiem-chon-rem", "Kinh nghiệm chọn rèm", "Mẹo chọn chất liệu, màu sắc, kiểu rèm phù hợp từng không gian"],
    ["cong-trinh-tieu-bieu", "Công trình tiêu biểu", "Hình ảnh thực tế các công trình Rèm Kim Dung đã thi công"],
    ["huong-dan-bao-quan", "Hướng dẫn sử dụng & bảo quản", "Cách vệ sinh, bảo quản rèm vải, rèm cuốn, rèm sáo"],
    ["khuyen-mai", "Khuyến mãi", "Ưu đãi và chương trình giảm giá theo mùa"],
  ];
  insert("Category", categories.map(([slug, name, description], i) => ({ id: cat(slug), name, slug, description, order: i + 1, isActive: true, ...stamps() })));

  const tags: [string, string][] = [
    ["rem-vai", "Rèm vải"], ["rem-cuon", "Rèm cuốn"], ["rem-cau-vong", "Rèm cầu vồng"], ["rem-sao-go", "Rèm sáo gỗ"],
    ["phong-khach", "Phòng khách"], ["phong-ngu", "Phòng ngủ"], ["van-phong", "Văn phòng"], ["chong-nang", "Chống nắng"], ["bao-quan", "Bảo quản"],
  ];
  insert("Tag", tags.map(([slug, name]) => ({ id: tag(slug), name, slug, createdAt: now })));

  // ---------- DANH MỤC SẢN PHẨM (8 danh mục – cũng là tab bảng giá trang chủ) ----------
  const productCategories = [
    { slug: "rem-vai", name: "Rèm vải", image: "/images/cat-rem-vai.jpg", priceNote: "Giá từ 350.000 đ/m²", isFeatured: true,
      summary: "Rèm vải hệ 1 lớp, 2 lớp (voan + cản sáng) và vải chống nắng 100% – lựa chọn phổ biến nhất cho phòng khách, phòng ngủ.",
      highlights: ["Hơn 300 mẫu vải Hàn Quốc, Đài Loan, Bỉ", "Cản sáng 70 – 100%, cách nhiệt, giảm ồn", "May đúng kích thước, nếp rèm đều", "Thanh treo nhôm hoặc thanh gỗ, có loại chạy motor"],
      description: `<h2>Rèm vải – mềm mại và sang trọng cho mọi không gian</h2><p>Rèm vải là loại rèm phổ biến nhất tại Việt Nam nhờ sự đa dạng về chất liệu, màu sắc và kiểu may. Kim Dung cung cấp 3 dòng chính:</p><ul><li><strong>Rèm vải hệ 1 lớp:</strong> một lớp vải dày cản sáng 70 – 90%, phù hợp phòng khách, phòng làm việc.</li><li><strong>Rèm vải hệ 2 lớp:</strong> lớp voan mỏng ban ngày + lớp vải dày ban đêm, tiện dụng và đẹp nhất cho phòng ngủ, phòng khách căn hộ.</li><li><strong>Rèm vải chống nắng 100%:</strong> vải blackout dệt 3 lớp, cản sáng tuyệt đối, cách nhiệt tốt – lý tưởng cho phòng ngủ hướng Tây, phòng trẻ em, phòng chiếu phim.</li></ul><h2>Kiểu may</h2><p>Ly xếp đôi, ly xếp ba, ly sóng (wave), ô-rê (eyelet) hoặc dây rút. Phụ kiện gồm thanh treo nhôm hợp kim, ray âm trần hoặc thanh gỗ trang trí, có thể lắp motor điều khiển từ xa.</p>` },
    { slug: "rem-cuon", name: "Rèm cuốn", image: "/images/cat-rem-cuon.jpg", priceNote: "Giá từ 250.000 đ/m²", isFeatured: true,
      summary: "Rèm cuốn trơn, hoa văn và rèm cuốn lưới – gọn gàng, hiện đại, dễ vệ sinh cho văn phòng, phòng ngủ, bếp.",
      highlights: ["Thiết kế tối giản, tiết kiệm diện tích", "Vải Polyester phủ PVC, chống ẩm mốc", "Cản sáng 70 – 100% hoặc lưới xuyên sáng", "Kéo dây hoặc motor, lắp trong 30 phút"],
      description: `<h2>Rèm cuốn – gọn gàng, hiện đại</h2><p>Rèm cuốn (roller blind) gồm một tấm vải cuộn quanh ống nhôm, kéo bằng dây hoặc motor. Rèm phẳng, sát cửa, không tốn diện tích nên rất được ưa chuộng cho văn phòng, cửa sổ nhỏ, phòng bếp.</p><ul><li><strong>Rèm cuốn trơn:</strong> vải một màu, cản sáng 70 – 100%.</li><li><strong>Rèm cuốn hoa văn:</strong> vải in hoa văn, tranh phong cảnh, phù hợp phòng trẻ em, quán cà phê.</li><li><strong>Rèm cuốn lưới (sunscreen):</strong> lưới dệt hở 3 – 5%, nhìn ra ngoài được, chặn tia UV và giảm nóng cho văn phòng kính.</li></ul>` },
    { slug: "rem-cau-vong", name: "Rèm cầu vồng Hàn Quốc", image: "/images/cat-rem-cau-vong.jpg", priceNote: "Giá từ 450.000 đ/m²", isFeatured: true,
      summary: "Rèm cầu vồng (combi) hai lớp vải xen kẽ dải trong – dải mờ, điều chỉnh ánh sáng linh hoạt, phong cách Hàn Quốc.",
      highlights: ["Vải Hàn Quốc chính hãng, 50+ màu", "Điều chỉnh ánh sáng chỉ bằng một dây kéo", "Chống bám bụi, không cần giặt", "Phù hợp phòng khách, phòng ngủ, cửa sổ căn hộ"],
      description: `<h2>Rèm cầu vồng Hàn Quốc</h2><p>Rèm cầu vồng (rèm combi) có hai lớp vải với các dải trong và dải mờ xen kẽ. Khi kéo dây, các dải trùng hoặc lệch nhau để mở sáng hoặc che kín. Rèm mang phong cách hiện đại, nhẹ nhàng, rất hợp với căn hộ chung cư và phòng ngủ.</p><p>Vải nhập khẩu Hàn Quốc, bản dải 5 – 7,5 cm, có loại cản sáng cao (blackout combi) cho phòng ngủ.</p>` },
    { slug: "rem-roman", name: "Rèm roman", image: "/images/cat-rem-roman.jpg", priceNote: "Giá từ 550.000 đ/m²", isFeatured: true,
      summary: "Rèm roman xếp lớp hoặc xếp phẳng – vẻ đẹp tinh tế của rèm vải trong thiết kế gọn như rèm cuốn.",
      highlights: ["May từ vải rèm cao cấp, hàng trăm mẫu", "Kéo lên xếp thành từng lớp đều đặn", "Phù hợp cửa sổ nhỏ, bếp, phòng ăn", "Có lớp lót cản sáng tùy chọn"],
      description: `<h2>Rèm roman – rèm vải xếp lớp</h2><p>Rèm roman được may từ vải rèm, có các thanh ngang để khi kéo lên rèm xếp thành từng lớp đều nhau. Rèm kết hợp ưu điểm mềm mại của rèm vải và sự gọn gàng của rèm cuốn, rất hợp với cửa sổ nhỏ, phòng bếp, phòng ăn và phong cách tân cổ điển.</p><ul><li><strong>Roman xếp lớp:</strong> các lớp chồng lên nhau khi buông, tạo chiều sâu.</li><li><strong>Roman phẳng:</strong> khi buông rèm phẳng như một tấm tranh, hiện đại tối giản.</li></ul>` },
    { slug: "rem-sao-go", name: "Rèm sáo gỗ", image: "/images/cat-rem-sao-go.jpg", priceNote: "Giá từ 750.000 đ/m²", isFeatured: true,
      summary: "Rèm sáo gỗ basswood lá 25 – 50 mm, hệ 1 dây hoặc 2 dây – ấm áp, sang trọng cho phòng khách, phòng làm việc.",
      highlights: ["Gỗ basswood nhập khẩu, sơn phủ chống mối mọt", "Lá 25 mm / 35 mm / 50 mm, nhiều màu gỗ", "Hệ 2 dây điều chỉnh độ nghiêng và kéo lên riêng", "Dây kéo hoặc motor"],
      description: `<h2>Rèm sáo gỗ</h2><p>Rèm sáo gỗ gồm các lá gỗ basswood xếp ngang, xoay nghiêng để điều chỉnh ánh sáng. Màu gỗ tự nhiên mang lại cảm giác ấm cúng, sang trọng cho phòng khách, phòng làm việc, quán cà phê.</p><ul><li><strong>Hệ 1 dây:</strong> một dây vừa kéo lên vừa xoay lá, gọn nhẹ.</li><li><strong>Hệ 2 dây:</strong> dây kéo và dây xoay riêng, bền và tiện chỉnh hơn cho cửa lớn.</li></ul>` },
    { slug: "rem-sao-nhom", name: "Rèm sáo nhôm", image: "/images/cat-rem-sao-nhom.jpg", priceNote: "Giá từ 280.000 đ/m²", isFeatured: true,
      summary: "Rèm sáo nhôm lá 25 mm trơn hoặc ánh kim – nhẹ, bền, chống ẩm, giá tốt cho văn phòng, bếp, phòng tắm.",
      highlights: ["Lá nhôm sơn tĩnh điện, không gỉ", "Chịu ẩm, dễ lau chùi", "Nhiều màu trơn và ánh kim", "Giá rẻ nhất trong các loại rèm sáo"],
      description: `<h2>Rèm sáo nhôm</h2><p>Rèm sáo nhôm có lá nhôm mỏng 25 mm sơn tĩnh điện, xoay nghiêng điều chỉnh sáng. Rèm nhẹ, chịu ẩm, giá hợp lý nên thường dùng cho văn phòng, phòng bếp, phòng tắm, nhà xưởng.</p><ul><li><strong>Sáo nhôm trơn:</strong> màu trắng, kem, xám, đen...</li><li><strong>Sáo nhôm ánh kim:</strong> bề mặt bóng kim loại, hiện đại cho văn phòng, showroom.</li></ul>` },
    { slug: "rem-phong-tam", name: "Rèm phòng tắm", image: "/images/cat-rem-phong-tam.jpg", priceNote: "Giá từ 180.000 đ/bộ", isFeatured: false,
      summary: "Rèm phòng tắm Polyester chống thấm, PEVA trong mờ – nhiều họa tiết, kèm thanh treo và móc.",
      highlights: ["Chống thấm, chống nấm mốc", "Giặt máy được", "Kèm thanh treo inox và 12 móc", "Nhiều kích thước 1,8 × 1,8 m – 2,0 × 2,2 m"],
      description: `<h2>Rèm phòng tắm</h2><p>Rèm phòng tắm ngăn nước bắn ra sàn, giữ phòng tắm khô ráo và trang trí không gian. Kim Dung cung cấp rèm Polyester chống thấm (giặt máy được) và rèm PEVA trong mờ, kèm thanh treo inox và bộ móc.</p>` },
    { slug: "rem-la-doc", name: "Rèm lá dọc văn phòng", image: "/images/cat-rem-la-doc.jpg", priceNote: "Giá từ 230.000 đ/m²", isFeatured: false,
      summary: "Rèm sáo lá dọc (lá vải hoặc PVC bản 89 mm) – giải pháp che nắng kinh tế cho văn phòng, phòng họp, vách kính lớn.",
      highlights: ["Lá vải Polyester hoặc PVC chống cháy", "Xoay lá 180°, kéo gom sang một bên", "Chịu được cửa kính cao 3 – 4 m", "Giá tốt cho diện tích lớn"],
      description: `<h2>Rèm lá dọc văn phòng</h2><p>Rèm lá dọc gồm các lá vải bản 89 mm hoặc 127 mm treo đứng trên ray nhôm, xoay 180° để lấy sáng và kéo gom sang một bên để mở thoáng. Đây là lựa chọn kinh tế cho văn phòng, phòng họp và vách kính lớn.</p>` },
  ];
  insert("ProductCategory", productCategories.map((c, i) => ({
    id: pcat(c.slug), name: c.name, slug: c.slug, image: c.image, summary: c.summary, description: c.description,
    highlights: json(c.highlights), priceNote: c.priceNote, isFeatured: c.isFeatured, isActive: true, order: i + 1, metaTitle: null, metaDescription: null, ...stamps(),
  })));

  // ---------- LOẠI RÈM (dòng sản phẩm trong từng danh mục) ----------
  const productLines: { category: string; slug: string; name: string; description: string }[] = [
    { category: "rem-vai", slug: "rem-vai-he-1-lop", name: "Rèm vải hệ 1 lớp", description: "Một lớp vải dày cản sáng 70 – 90%" },
    { category: "rem-vai", slug: "rem-vai-he-2-lop", name: "Rèm vải hệ 2 lớp", description: "Lớp voan + lớp vải cản sáng, chung một thanh treo" },
    { category: "rem-vai", slug: "rem-vai-chong-nang-100", name: "Rèm vải chống nắng 100%", description: "Vải blackout cản sáng tuyệt đối, cách nhiệt" },
    { category: "rem-cuon", slug: "rem-cuon-tron", name: "Rèm cuốn trơn", description: "Vải một màu, cản sáng 70 – 100%" },
    { category: "rem-cuon", slug: "rem-cuon-hoa-van", name: "Rèm cuốn hoa văn", description: "Vải in hoa văn, tranh phong cảnh" },
    { category: "rem-cuon", slug: "rem-cuon-luoi", name: "Rèm cuốn lưới", description: "Lưới sunscreen hở 3 – 5%, chặn UV, nhìn xuyên ra ngoài" },
    { category: "rem-cau-vong", slug: "rem-cau-vong-han-quoc", name: "Rèm cầu vồng", description: "Rèm combi vải Hàn Quốc, dải trong – mờ xen kẽ" },
    { category: "rem-roman", slug: "rem-roman-xep-lop", name: "Rèm roman xếp lớp", description: "Các lớp vải chồng nhau khi buông rèm" },
    { category: "rem-roman", slug: "rem-roman-phang", name: "Rèm roman phẳng", description: "Khi buông rèm phẳng như tấm tranh" },
    { category: "rem-sao-go", slug: "rem-go-he-1-day", name: "Rèm gỗ hệ 1 dây", description: "Một dây vừa kéo vừa xoay lá" },
    { category: "rem-sao-go", slug: "rem-go-he-2-day", name: "Rèm gỗ hệ 2 dây", description: "Dây kéo và dây xoay lá riêng" },
    { category: "rem-sao-nhom", slug: "rem-sao-nhom-tron", name: "Rèm sáo nhôm trơn", description: "Lá nhôm sơn màu trơn" },
    { category: "rem-sao-nhom", slug: "rem-sao-nhom-anh-kim", name: "Rèm sáo nhôm ánh kim", description: "Lá nhôm bề mặt ánh kim loại" },
  ];
  const lineOrder: Record<string, number> = {};
  insert("ProductLine", productLines.map((l) => {
    lineOrder[l.category] = (lineOrder[l.category] ?? 0) + 1;
    return { id: line(l.slug), categoryId: pcat(l.category), name: l.name, slug: l.slug, description: l.description, order: lineOrder[l.category], isActive: true, ...stamps() };
  }));

  // ---------- SẢN PHẨM ----------
  type ProductSeed = {
    slug: string; name: string; category: string; line: string | null; code: string; summary: string; material: string; origin: string; width: string; colors: string;
    rooms: string[]; features: string[]; price: [number | null, number | null]; unit?: "M2" | "SET" | "METER"; priceNote?: string; warranty: number; image: string; gallery: string[];
    featured?: boolean; status?: "ACTIVE" | "HIDDEN"; description?: string;
  };
  const desc = (name: string, extra: string) =>
    `<h2>Giới thiệu</h2><p>${name} được Kim Dung may đo theo đúng kích thước từng ô cửa của bạn. ${extra}</p><h2>Phụ kiện đi kèm</h2><ul><li>Thanh treo / ray nhôm hợp kim sơn tĩnh điện</li><li>Bộ phụ kiện lắp đặt, móc, dây kéo</li><li>Tùy chọn motor điều khiển từ xa (báo giá riêng)</li></ul><h2>Quy trình</h2><p>Đo đạc tận nơi miễn phí → chọn mẫu vải tại nhà → báo giá chi tiết → may trong 3 – 5 ngày → lắp đặt và bàn giao.</p>`;
  const products: ProductSeed[] = [
    { slug: "rem-vai-gam-han-quoc-mot-lop-rv-101", name: "Rèm vải gấm Hàn Quốc một lớp RV-101", category: "rem-vai", line: "rem-vai-he-1-lop", code: "RV-101", featured: true,
      summary: "Vải gấm Polyester dệt dày, bề mặt bóng nhẹ, cản sáng 85%, phù hợp phòng khách và phòng làm việc.",
      material: "Gấm Polyester dệt dày", origin: "Hàn Quốc", width: "Khổ 2,8 m", colors: "Kem, xám ghi, nâu cà phê, xanh rêu", rooms: ["phong-khach", "phong-ngu", "van-phong"],
      features: ["Cản sáng 85%, cách nhiệt tốt", "Vải không xù lông, không phai màu", "May ly xếp đôi hoặc ly sóng", "Giặt máy chế độ nhẹ"], price: [380_000, 520_000], priceNote: "Đã gồm thanh treo nhôm, chưa gồm công lắp đặt", warranty: 12,
      image: "/images/product-03.jpg", gallery: ["/images/product-11.jpg", "/images/hero-1.jpg"], description: desc("Rèm vải gấm Hàn Quốc RV-101", "Vải gấm dệt dày với hoa văn chìm tinh tế, treo buông mềm và giữ nếp tốt.") },
    { slug: "rem-vai-linen-mot-lop-rv-105", name: "Rèm vải linen một lớp RV-105", category: "rem-vai", line: "rem-vai-he-1-lop", code: "RV-105",
      summary: "Vải linen pha, bề mặt thô mộc tự nhiên, cản sáng 70%, phong cách Bắc Âu – Japandi.",
      material: "Linen pha Polyester", origin: "Đài Loan", width: "Khổ 2,8 m", colors: "Trắng ngà, be, xám nhạt, xanh dương pastel", rooms: ["phong-khach", "phong-bep", "phong-tre-em"],
      features: ["Chất vải thoáng, nhẹ", "Màu pastel hợp phong cách tối giản", "Có thể may thêm lớp lót cản sáng"], price: [420_000, 600_000], warranty: 12,
      image: "/images/product-11.jpg", gallery: ["/images/product-07.jpg"], description: desc("Rèm vải linen RV-105", "Linen pha cho bề mặt thô mộc tự nhiên nhưng ít nhăn, dễ bảo quản hơn linen nguyên chất.") },
    { slug: "rem-vai-2-lop-voan-can-sang-rv-201", name: "Rèm vải 2 lớp voan + cản sáng RV-201", category: "rem-vai", line: "rem-vai-he-2-lop", code: "RV-201", featured: true,
      summary: "Bộ rèm 2 lớp: lớp voan trắng lấy sáng ban ngày + lớp vải dày cản sáng 90% ban đêm, chung một thanh treo đôi.",
      material: "Voan Polyester + vải dày dệt 2 lớp", origin: "Hàn Quốc", width: "Khổ 2,8 m", colors: "Lớp vải: kem, xám, nâu, xanh navy; voan trắng/kem", rooms: ["phong-ngu", "phong-khach"],
      features: ["Hai lớp độc lập, kéo riêng từng lớp", "Thanh treo đôi nhôm hợp kim", "Cản sáng 90%, giảm ồn", "Bộ rèm được ưa chuộng nhất cho căn hộ"], price: [650_000, 950_000], priceNote: "Giá cho cả 2 lớp, đã gồm thanh treo đôi", warranty: 18,
      image: "/images/hero-2.jpg", gallery: ["/images/product-03.jpg", "/images/product-07.jpg"], description: desc("Rèm vải 2 lớp RV-201", "Ban ngày kéo lớp vải dày, giữ lớp voan để phòng sáng mà vẫn kín đáo; ban đêm kéo lớp vải dày để ngủ ngon.") },
    { slug: "rem-vai-nhung-2-lop-cao-cap-rv-205", name: "Rèm vải nhung 2 lớp cao cấp RV-205", category: "rem-vai", line: "rem-vai-he-2-lop", code: "RV-205",
      summary: "Nhung Hà Lan mịn, đứng dáng, cản sáng 95%, kết hợp voan thêu – dành cho phòng khách biệt thự, tân cổ điển.",
      material: "Nhung Polyester Hà Lan + voan thêu", origin: "Bỉ / Hà Lan", width: "Khổ 2,8 m", colors: "Xanh cổ vịt, đỏ đô, xám khói, vàng đồng", rooms: ["phong-khach", "phong-ngu"],
      features: ["Nhung dày, bề mặt mượt, không bám bụi", "Cản sáng 95%, cách nhiệt – cách âm tốt", "May ly xếp ba, có dây buộc trang trí"], price: [900_000, 1_400_000], warranty: 24,
      image: "/images/product-05.jpg", gallery: ["/images/product-02.jpg"], description: desc("Rèm nhung 2 lớp RV-205", "Nhung nhập khẩu châu Âu tạo cảm giác sang trọng, đứng dáng cho phòng khách trần cao.") },
    { slug: "rem-vai-chong-nang-100-blackout-rv-301", name: "Rèm vải chống nắng 100% blackout RV-301", category: "rem-vai", line: "rem-vai-chong-nang-100", code: "RV-301", featured: true,
      summary: "Vải blackout dệt 3 lớp, cản sáng 100%, cách nhiệt – lý tưởng cho phòng ngủ hướng Tây, phòng chiếu phim.",
      material: "Blackout Polyester dệt 3 lớp", origin: "Hàn Quốc", width: "Khổ 2,8 m", colors: "Kem, xám, nâu, xanh than, hồng pastel", rooms: ["phong-ngu", "phong-tre-em"],
      features: ["Cản sáng 100%, không lọt sáng qua vải", "Giảm nhiệt 3 – 5°C cho phòng hướng Tây", "Không mùi, an toàn cho trẻ nhỏ", "Giặt máy được"], price: [450_000, 650_000], warranty: 18,
      image: "/images/product-02.jpg", gallery: ["/images/hero-2.jpg"], description: desc("Rèm blackout RV-301", "Vải dệt 3 lớp với lớp sợi đen ở giữa chặn hoàn toàn ánh sáng mà bề mặt ngoài vẫn có màu sắc đẹp.") },
    { slug: "rem-vai-can-sang-100-phong-tre-em-rv-305", name: "Rèm vải cản sáng 100% họa tiết trẻ em RV-305", category: "rem-vai", line: "rem-vai-chong-nang-100", code: "RV-305",
      summary: "Vải blackout in họa tiết mây, sao, khủng long – giúp bé ngủ ngon ban ngày, màu in an toàn.",
      material: "Blackout in kỹ thuật số", origin: "Việt Nam", width: "Khổ 2,8 m", colors: "Họa tiết mây xanh, sao vàng, khủng long, hoa nhí", rooms: ["phong-tre-em", "phong-ngu"],
      features: ["Cản sáng 100%", "Mực in gốc nước an toàn", "Nhiều họa tiết dễ thương"], price: [480_000, 680_000], warranty: 12,
      image: "/images/product-12.jpg", gallery: [], description: desc("Rèm trẻ em RV-305", "Họa tiết in sắc nét trên nền vải blackout, giúp bé ngủ trưa ngon hơn.") },
    { slug: "rem-cuon-tron-polyester-rc-01", name: "Rèm cuốn trơn Polyester RC-01", category: "rem-cuon", line: "rem-cuon-tron", code: "RC-01", featured: true,
      summary: "Rèm cuốn vải Polyester phủ PVC một màu, cản sáng 80%, ống nhôm Ø38, kéo dây bi.",
      material: "Polyester phủ PVC", origin: "Đài Loan", width: "Khổ tối đa 3,0 m", colors: "Trắng, kem, xám, be, xanh dương", rooms: ["van-phong", "phong-ngu", "phong-bep"],
      features: ["Cản sáng 80%, chống ẩm mốc", "Ống nhôm Ø38, cơ chế kéo bi êm", "Lắp đặt trong 30 phút/bộ", "Có thể nâng cấp motor"], price: [250_000, 320_000], priceNote: "Đã gồm phụ kiện lắp đặt", warranty: 12,
      image: "/images/cat-rem-cuon.jpg", gallery: ["/images/hero-3.jpg"], description: desc("Rèm cuốn trơn RC-01", "Mẫu rèm cuốn kinh tế, phẳng gọn, hợp văn phòng và cửa sổ nhỏ.") },
    { slug: "rem-cuon-tron-chong-nang-100-rc-05", name: "Rèm cuốn trơn chống nắng 100% RC-05", category: "rem-cuon", line: "rem-cuon-tron", code: "RC-05",
      summary: "Vải blackout phủ bạc mặt sau, cản sáng 100%, cách nhiệt – cho phòng ngủ, phòng họp chiếu máy chiếu.",
      material: "Blackout phủ bạc", origin: "Hàn Quốc", width: "Khổ tối đa 3,0 m", colors: "Trắng, kem, xám, nâu", rooms: ["phong-ngu", "phong-hop"],
      features: ["Cản sáng 100%", "Mặt sau phủ bạc phản xạ nhiệt", "Kéo dây hoặc motor"], price: [300_000, 380_000], warranty: 12,
      image: "/images/hero-3.jpg", gallery: [], description: desc("Rèm cuốn blackout RC-05", "Chặn hoàn toàn ánh sáng, phù hợp phòng họp dùng máy chiếu.") },
    { slug: "rem-cuon-in-hoa-van-3d-rc-20", name: "Rèm cuốn in hoa văn 3D RC-20", category: "rem-cuon", line: "rem-cuon-hoa-van", code: "RC-20",
      summary: "Rèm cuốn in tranh phong cảnh, hoa lá hoặc họa tiết theo yêu cầu, sắc nét, bền màu.",
      material: "Polyester in UV", origin: "Việt Nam", width: "Khổ tối đa 2,4 m", colors: "In theo mẫu: phong cảnh, hoa lá, hoạt hình, logo", rooms: ["phong-tre-em", "cua-hang", "phong-bep"],
      features: ["In theo yêu cầu, gửi file là in", "Mực UV bền màu 5 năm", "Cản sáng 85%"], price: [350_000, 450_000], warranty: 12,
      image: "/images/product-09.jpg", gallery: [], description: desc("Rèm cuốn hoa văn RC-20", "In kỹ thuật số theo file khách gửi, phù hợp quán cà phê, cửa hàng, phòng trẻ em.") },
    { slug: "rem-cuon-luoi-sunscreen-5-rc-30", name: "Rèm cuốn lưới sunscreen 5% RC-30", category: "rem-cuon", line: "rem-cuon-luoi", code: "RC-30", featured: true,
      summary: "Lưới sợi thủy tinh phủ PVC hở 5%: chặn 95% tia UV, giảm nóng, vẫn nhìn ra ngoài – chuẩn cho văn phòng kính.",
      material: "Sợi thủy tinh phủ PVC", origin: "Đài Loan", width: "Khổ tối đa 3,0 m", colors: "Trắng, xám, đen, nâu", rooms: ["van-phong", "phong-hop", "cua-hang"],
      features: ["Chặn 95% UV, giảm chói màn hình", "Nhìn xuyên ra ngoài, không bí", "Chống cháy lan, không bám bụi"], price: [320_000, 420_000], warranty: 24,
      image: "/images/product-08.jpg", gallery: ["/images/hero-3.jpg"], description: desc("Rèm cuốn lưới RC-30", "Lựa chọn số một cho tòa nhà văn phòng vách kính: giảm nóng mà vẫn giữ tầm nhìn.") },
    { slug: "rem-cau-vong-han-quoc-combi-cv-01", name: "Rèm cầu vồng Hàn Quốc Combi CV-01", category: "rem-cau-vong", line: "rem-cau-vong-han-quoc", code: "CV-01", featured: true,
      summary: "Rèm cầu vồng vải Hàn Quốc dải 5 cm, 50+ màu, kéo dây bi, cản sáng 70% khi đóng.",
      material: "Polyester Hàn Quốc dệt 2 lớp", origin: "Hàn Quốc", width: "Khổ tối đa 2,8 m", colors: "Trắng, kem, xám, be, xanh mint, hồng, nâu", rooms: ["phong-khach", "phong-ngu", "phong-bep"],
      features: ["Điều chỉnh sáng linh hoạt", "Chống bám bụi, không cần giặt", "Phụ kiện nhôm sơn tĩnh điện"], price: [450_000, 650_000], warranty: 18,
      image: "/images/cat-rem-cau-vong.jpg", gallery: ["/images/product-06.jpg"], description: desc("Rèm cầu vồng CV-01", "Vải combi Hàn Quốc chính hãng, bản dải 5 cm, phù hợp cửa sổ căn hộ.") },
    { slug: "rem-cau-vong-can-sang-cao-cap-cv-08", name: "Rèm cầu vồng cản sáng cao cấp CV-08", category: "rem-cau-vong", line: "rem-cau-vong-han-quoc", code: "CV-08",
      summary: "Dải mờ dệt blackout cản sáng 95% khi đóng, bản dải 7,5 cm sang trọng cho phòng ngủ.",
      material: "Blackout combi Hàn Quốc", origin: "Hàn Quốc", width: "Khổ tối đa 2,8 m", colors: "Kem, xám, nâu, xanh than", rooms: ["phong-ngu", "phong-khach"],
      features: ["Cản sáng 95%", "Bản dải lớn 7,5 cm", "Kéo dây hoặc motor pin sạc"], price: [600_000, 850_000], warranty: 24,
      image: "/images/product-06.jpg", gallery: [], description: desc("Rèm cầu vồng CV-08", "Phiên bản cản sáng cao của rèm cầu vồng, dành cho phòng ngủ cần tối.") },
    { slug: "rem-roman-xep-lop-vai-bo-rm-01", name: "Rèm roman xếp lớp vải bố RM-01", category: "rem-roman", line: "rem-roman-xep-lop", code: "RM-01",
      summary: "Vải bố cotton pha dày dặn, các lớp xếp chồng mềm mại, kéo dây bi – đẹp cho bếp, phòng ăn, cửa sổ nhỏ.",
      material: "Vải bố cotton pha", origin: "Việt Nam", width: "Khổ tối đa 2,4 m", colors: "Be, xám, xanh rêu, nâu đất", rooms: ["phong-bep", "phong-khach", "phong-tre-em"],
      features: ["Xếp lớp đều nhờ thanh ngang", "Có lớp lót cản sáng tùy chọn", "Cơ chế kéo bi, khóa an toàn"], price: [550_000, 750_000], warranty: 12,
      image: "/images/cat-rem-roman.jpg", gallery: ["/images/product-09.jpg"], description: desc("Rèm roman RM-01", "Rèm roman xếp lớp từ vải bố mộc mạc, hợp phong cách vintage và đồng quê.") },
    { slug: "rem-roman-phang-vai-linen-rm-05", name: "Rèm roman phẳng vải linen RM-05", category: "rem-roman", line: "rem-roman-phang", code: "RM-05",
      summary: "Khi buông rèm phẳng như một bức tranh vải, linen pha màu nhã – tối giản cho phòng làm việc, phòng ngủ.",
      material: "Linen pha Polyester", origin: "Đài Loan", width: "Khổ tối đa 2,4 m", colors: "Trắng ngà, xám nhạt, be", rooms: ["phong-ngu", "van-phong"],
      features: ["Kiểu phẳng hiện đại", "Lớp lót cản sáng 90%", "Kéo dây hoặc motor"], price: [600_000, 800_000], warranty: 12,
      image: "/images/product-09.jpg", gallery: [], description: desc("Rèm roman phẳng RM-05", "Phong cách tối giản, không lộ nếp gấp khi buông.") },
    { slug: "rem-sao-go-basswood-50mm-he-1-day-sg-01", name: "Rèm sáo gỗ basswood 50 mm hệ 1 dây SG-01", category: "rem-sao-go", line: "rem-go-he-1-day", code: "SG-01",
      summary: "Lá gỗ basswood 50 mm sơn phủ PU, một dây vừa kéo vừa xoay – gọn nhẹ cho cửa sổ vừa và nhỏ.",
      material: "Gỗ basswood sơn PU", origin: "Trung Quốc (gỗ nhập Bắc Mỹ)", width: "Lá 50 mm, rộng tối đa 2,4 m", colors: "Gỗ sồi, óc chó, trắng, xám khói", rooms: ["phong-khach", "van-phong", "phong-ngu"],
      features: ["Gỗ nhẹ, chống cong vênh", "Sơn phủ chống mối mọt", "Thang dây hoặc thang vải"], price: [750_000, 950_000], warranty: 24,
      image: "/images/product-01.jpg", gallery: ["/images/cat-rem-sao-go.jpg"], description: desc("Rèm sáo gỗ SG-01", "Màu gỗ tự nhiên ấm áp, lá 50 mm cho tầm nhìn thoáng.") },
    { slug: "rem-sao-go-basswood-50mm-he-2-day-sg-02", name: "Rèm sáo gỗ basswood 50 mm hệ 2 dây SG-02", category: "rem-sao-go", line: "rem-go-he-2-day", code: "SG-02", featured: true,
      summary: "Hệ 2 dây: dây kéo và dây xoay riêng, bền và dễ điều chỉnh cho cửa lớn, phòng khách biệt thự.",
      material: "Gỗ basswood sơn PU", origin: "Trung Quốc (gỗ nhập Bắc Mỹ)", width: "Lá 50 mm, rộng tối đa 3,0 m", colors: "Gỗ sồi, óc chó, trắng, đen mờ", rooms: ["phong-khach", "van-phong"],
      features: ["Chịu lực tốt cho cửa rộng", "Thang vải trang trí tùy chọn", "Có bản motor"], price: [850_000, 1_050_000], warranty: 24,
      image: "/images/cat-rem-sao-go.jpg", gallery: ["/images/product-04.jpg"], description: desc("Rèm sáo gỗ SG-02", "Hệ 2 dây bền bỉ, chuyên cho cửa lớn và không gian sang trọng.") },
    { slug: "rem-sao-nhom-25mm-tron-sn-01", name: "Rèm sáo nhôm 25 mm trơn SN-01", category: "rem-sao-nhom", line: "rem-sao-nhom-tron", code: "SN-01",
      summary: "Lá nhôm 25 mm sơn tĩnh điện màu trơn, nhẹ, chịu ẩm – giá tốt nhất cho văn phòng, bếp, phòng tắm.",
      material: "Nhôm sơn tĩnh điện", origin: "Việt Nam", width: "Lá 25 mm, rộng tối đa 2,4 m", colors: "Trắng, kem, xám, đen, xanh dương", rooms: ["van-phong", "phong-bep", "phong-tam"],
      features: ["Không gỉ, chịu ẩm", "Lau chùi dễ dàng", "Cơ chế xoay lá bằng cần"], price: [280_000, 350_000], warranty: 12,
      image: "/images/cat-rem-sao-nhom.jpg", gallery: ["/images/product-04.jpg"], description: desc("Rèm sáo nhôm SN-01", "Giải pháp che nắng kinh tế và bền cho khu vực ẩm.") },
    { slug: "rem-sao-nhom-25mm-anh-kim-sn-05", name: "Rèm sáo nhôm 25 mm ánh kim SN-05", category: "rem-sao-nhom", line: "rem-sao-nhom-anh-kim", code: "SN-05",
      summary: "Lá nhôm bề mặt ánh kim (bạc, vàng đồng, đồng đỏ) hiện đại cho văn phòng, showroom.",
      material: "Nhôm phủ ánh kim", origin: "Đài Loan", width: "Lá 25 mm, rộng tối đa 2,4 m", colors: "Bạc, vàng đồng, đồng đỏ, than chì", rooms: ["van-phong", "cua-hang", "phong-hop"],
      features: ["Bề mặt kim loại sang trọng", "Chống xước, chống ẩm", "Xoay lá 180°"], price: [320_000, 400_000], warranty: 12,
      image: "/images/product-04.jpg", gallery: [], description: desc("Rèm sáo nhôm SN-05", "Điểm nhấn kim loại cho không gian làm việc hiện đại.") },
    { slug: "rem-phong-tam-polyester-chong-tham-pt-01", name: "Rèm phòng tắm Polyester chống thấm PT-01", category: "rem-phong-tam", line: null, code: "PT-01",
      summary: "Vải Polyester dệt dày phủ chống thấm, giặt máy được, kèm thanh treo inox và 12 móc.",
      material: "Polyester chống thấm", origin: "Việt Nam", width: "Bộ 1,8 × 2,0 m (có cỡ 2,0 × 2,2 m)", colors: "Trắng, xám, xanh biển, họa tiết lá", rooms: ["phong-tam"],
      features: ["Chống thấm, chống nấm mốc", "Giặt máy được", "Kèm thanh treo inox + 12 móc"], price: [180_000, 280_000], unit: "SET", warranty: 6,
      image: "/images/cat-rem-phong-tam.jpg", gallery: ["/images/product-10.jpg"], description: desc("Rèm phòng tắm PT-01", "Trọn bộ rèm + thanh treo + móc, lắp ngay không cần khoan.") },
    { slug: "rem-phong-tam-peva-trong-mo-pt-03", name: "Rèm phòng tắm PEVA trong mờ PT-03", category: "rem-phong-tam", line: null, code: "PT-03",
      summary: "Màng PEVA không mùi, trong mờ lấy sáng, đáy có chì giữ rèm thẳng – giá tiết kiệm.",
      material: "Màng PEVA", origin: "Việt Nam", width: "Bộ 1,8 × 1,8 m", colors: "Trong mờ, trắng sữa, hoa nhí", rooms: ["phong-tam"],
      features: ["Không mùi, không PVC", "Đáy nhồi chì giữ thẳng", "Kèm 12 móc"], price: [150_000, 220_000], unit: "SET", warranty: 6,
      image: "/images/product-10.jpg", gallery: [], description: desc("Rèm phòng tắm PT-03", "Lựa chọn kinh tế cho phòng tắm nhỏ.") },
    { slug: "rem-la-doc-vai-89mm-ld-01", name: "Rèm lá dọc vải 89 mm LD-01", category: "rem-la-doc", line: null, code: "LD-01",
      summary: "Lá vải Polyester bản 89 mm, xoay 180°, kéo gom một bên – giải pháp kinh tế cho văn phòng, phòng họp.",
      material: "Polyester dệt cứng", origin: "Đài Loan", width: "Lá 89 mm, cao tối đa 4,0 m", colors: "Trắng, kem, xám, xanh dương, xanh lá", rooms: ["van-phong", "phong-hop"],
      features: ["Chịu cửa kính cao 3 – 4 m", "Ray nhôm sơn tĩnh điện", "Thay lá lẻ dễ dàng"], price: [230_000, 300_000], warranty: 12,
      image: "/images/cat-rem-la-doc.jpg", gallery: ["/images/product-08.jpg"], description: desc("Rèm lá dọc LD-01", "Phủ được diện tích lớn với chi phí thấp, chuẩn văn phòng.") },
    { slug: "rem-la-doc-pvc-chong-chay-ld-05", name: "Rèm lá dọc PVC chống cháy LD-05", category: "rem-la-doc", line: null, code: "LD-05",
      summary: "Lá PVC bản 89 mm chống cháy lan, chịu ẩm, lau sạch dễ – cho nhà xưởng, phòng y tế, văn phòng.",
      material: "PVC chống cháy", origin: "Đài Loan", width: "Lá 89 mm, cao tối đa 4,0 m", colors: "Trắng, kem, xám", rooms: ["van-phong", "phong-hop", "cua-hang"],
      features: ["Đạt chuẩn chống cháy lan", "Chịu ẩm, lau rửa được", "Không bám bụi"], price: [260_000, 340_000], warranty: 12,
      image: "/images/product-08.jpg", gallery: [], description: desc("Rèm lá dọc PVC LD-05", "Vật liệu PVC chống cháy, an toàn cho công trình thương mại.") },
    { slug: "rem-vai-mau-cu-rv-099", name: "Rèm vải mẫu cũ RV-099 (ngừng kinh doanh)", category: "rem-vai", line: "rem-vai-he-1-lop", code: "RV-099", status: "HIDDEN",
      summary: "Mẫu vải đã ngừng sản xuất – chỉ còn trong kho dữ liệu, không hiện ngoài web.",
      material: "Polyester", origin: "Việt Nam", width: "Khổ 2,8 m", colors: "Kem", rooms: ["phong-khach"], features: [], price: [300_000, null], warranty: 12,
      image: "/images/product-03.jpg", gallery: [], description: "<p>Mẫu đã ngừng kinh doanh.</p>" },
  ];
  insert("Product", products.map((p, i) => ({
    id: product(p.slug), name: p.name, slug: p.slug, categoryId: pcat(p.category), lineId: p.line ? line(p.line) : null, code: p.code, summary: p.summary,
    description: p.description ?? "", material: p.material, origin: p.origin, width: p.width, colors: p.colors, rooms: json(p.rooms), features: json(p.features),
    priceFrom: p.price[0], priceTo: p.price[1], priceUnit: p.unit ?? "M2", priceNote: p.priceNote ?? null, warrantyMonths: p.warranty, image: p.image, gallery: json(p.gallery),
    status: p.status ?? "ACTIVE", isFeatured: p.featured ?? false, showInPriceTable: true, viewCount: 0, metaTitle: null, metaDescription: null, ...stamps(daysAgo(products.length - i)),
  })));

  // ---------- DỊCH VỤ ----------
  insert("Service", [
    { slug: "tu-van-do-dac-tan-noi", title: "Tư vấn & đo đạc tận nơi miễn phí", icon: "Ruler", image: "/images/service-tu-van.jpg", price: "Miễn phí", duration: "Trong 24 giờ", order: 1,
      summary: "Nhân viên mang catalogue mẫu vải đến tận nhà, đo kích thước từng ô cửa và tư vấn kiểu rèm phù hợp nội thất, báo giá ngay tại chỗ.",
      content: `<h2>Quy trình</h2><ol><li>Đặt lịch qua hotline, Zalo hoặc form trên website.</li><li>Nhân viên đến đúng hẹn với hơn 300 mẫu vải thật để bạn xem trực tiếp dưới ánh sáng phòng.</li><li>Đo kích thước chính xác từng ô cửa, tư vấn kiểu may, phụ kiện.</li><li>Báo giá chi tiết theo m² ngay tại chỗ, không phát sinh.</li></ol><p>Miễn phí trong nội thành TP. HCM và các khu vực lân cận (Bình Dương, Đồng Nai, Long An).</p>` },
    { slug: "lap-dat-rem-cua", title: "Lắp đặt rèm cửa chuyên nghiệp", icon: "Wrench", image: "/images/service-lap-dat.jpg", price: "Miễn phí nội thành", duration: "1 – 3 giờ / căn hộ", order: 2,
      summary: "Đội thợ lắp đặt kinh nghiệm, khoan bắt chắc chắn, căn chỉnh rèm thẳng đều, dọn dẹp sạch sẽ sau khi bàn giao.",
      content: `<h2>Cam kết lắp đặt</h2><ul><li>Đúng hẹn, lắp trong 1 – 3 giờ cho căn hộ 2 – 3 phòng ngủ.</li><li>Khoan bắt vít nở chuyên dụng cho tường bê tông, thạch cao, trần nhôm.</li><li>Căn chỉnh rèm thẳng, kiểm tra vận hành từng bộ trước khi bàn giao.</li><li>Dọn vệ sinh sạch sẽ, hướng dẫn sử dụng và bảo quản.</li></ul>` },
    { slug: "bao-hanh-bao-tri", title: "Bảo hành – bảo trì trọn đời", icon: "ShieldCheck", image: "/images/service-bao-hanh.jpg", price: "Miễn phí trong thời hạn bảo hành", duration: "Xử lý trong 48 giờ", order: 3,
      summary: "Bảo hành 12 – 24 tháng cho vải và phụ kiện, bảo trì trọn đời: sửa dây kéo, thay phụ kiện, chỉnh rèm tận nơi.",
      content: `<h2>Chính sách</h2><ul><li>Bảo hành 12 tháng với rèm cuốn, sáo nhôm; 18 – 24 tháng với rèm vải, cầu vồng, sáo gỗ.</li><li>Đổi mới trong 7 ngày nếu lỗi sản xuất (đường may, phụ kiện).</li><li>Sau bảo hành: bảo trì trọn đời, chỉ tính phí linh kiện thay thế.</li></ul>` },
    { slug: "ve-sinh-giat-rem", title: "Vệ sinh – giặt rèm tại nhà", icon: "Sparkles", image: "/images/service-ve-sinh.jpg", price: "Từ 60.000 đ/m²", duration: "1 – 2 ngày", order: 4,
      summary: "Tháo – giặt – ủi – treo lại rèm vải; vệ sinh rèm cuốn, sáo gỗ, sáo nhôm tại chỗ bằng máy hơi nước.",
      content: `<h2>Dịch vụ</h2><ul><li>Rèm vải: tháo tận nơi, giặt bằng máy công nghiệp với nước giặt chuyên dụng, ủi phẳng và treo lại.</li><li>Rèm cuốn, cầu vồng, sáo gỗ, sáo nhôm: vệ sinh tại chỗ bằng máy hơi nước và dung dịch chuyên dụng.</li><li>Khuyến nghị giặt rèm vải 6 – 12 tháng/lần.</li></ul>` },
    { slug: "rem-cong-trinh", title: "Rèm công trình: căn hộ, khách sạn, văn phòng", icon: "Building", image: "/images/cta-bg.jpg", price: "Báo giá theo dự án", duration: "Theo tiến độ công trình", order: 5,
      summary: "Cung cấp và thi công rèm số lượng lớn cho dự án chung cư, khách sạn, trường học, tòa nhà văn phòng với giá đại lý.",
      content: `<h2>Năng lực</h2><ul><li>Xưởng 600 m², sản xuất 500 bộ rèm/tuần.</li><li>Đã thi công hơn 1.200 công trình: căn hộ bàn giao, khách sạn 3 – 4 sao, văn phòng, trường học.</li><li>Hồ sơ mẫu vải, chứng nhận chống cháy, bảo hành dự án 24 tháng.</li></ul>` },
  ].map((s) => ({ id: sid(`service:${s.slug}`), ...s, isActive: true, ...stamps() })));

  // ---------- BÀI VIẾT ----------
  type PostSeed = { slug: string; title: string; category: string; tags: string[]; coverImage: string; status: "PUBLISHED" | "DRAFT" | "SCHEDULED"; publishedAt: Date | null; isFeatured: boolean; excerpt: string; content: string; metaTitle: null; metaDescription: null; authorId: string; categoryId: string };
  const posts: PostSeed[] = [
    { slug: "cach-chon-rem-cua-phong-khach-dep-hop-noi-that", title: "Cách chọn rèm cửa phòng khách đẹp, hợp nội thất", category: "kinh-nghiem-chon-rem", tags: ["rem-vai", "phong-khach"], coverImage: "/images/post-1.jpg", status: "PUBLISHED", publishedAt: daysAgo(2), isFeatured: true, authorId: adminId, categoryId: cat("kinh-nghiem-chon-rem"), metaTitle: null, metaDescription: null,
      excerpt: "Phòng khách là bộ mặt của ngôi nhà. Chọn màu, chất liệu và kiểu rèm thế nào để vừa đẹp vừa tiện dụng?",
      content: `<h2>1. Chọn màu theo tông nội thất</h2><p>Rèm nên cùng tông hoặc đậm hơn màu tường một bậc. Nhà màu trắng – xám hợp rèm kem, be, xám ghi; nội thất gỗ hợp rèm nâu, xanh rêu.</p><h2>2. Chất liệu</h2><p>Phòng khách nhiều ánh sáng nên dùng rèm vải 2 lớp (voan + vải dày) hoặc rèm cầu vồng để chỉnh sáng linh hoạt. Nếu hướng Tây, chọn vải chống nắng 100%.</p><h2>3. Kiểu may</h2><p>Ly sóng (wave) cho phong cách hiện đại, ly xếp ba cho tân cổ điển. Nên may rèm chạm sàn (cách sàn 1 – 2 cm) để phòng trông cao hơn.</p>` },
    { slug: "rem-vai-1-lop-hay-2-lop-nen-chon-loai-nao", title: "Rèm vải 1 lớp hay 2 lớp: nên chọn loại nào?", category: "kinh-nghiem-chon-rem", tags: ["rem-vai", "phong-ngu", "chong-nang"], coverImage: "/images/post-2.jpg", status: "PUBLISHED", publishedAt: daysAgo(6), isFeatured: true, authorId: adminId, categoryId: cat("kinh-nghiem-chon-rem"), metaTitle: null, metaDescription: null,
      excerpt: "So sánh chi phí, công năng và thẩm mỹ của rèm 1 lớp và 2 lớp để bạn chọn đúng cho từng phòng.",
      content: `<h2>Rèm 1 lớp</h2><p>Chi phí thấp hơn 30 – 40%, phù hợp phòng làm việc, phòng khách ít cần riêng tư ban ngày.</p><h2>Rèm 2 lớp</h2><p>Lớp voan lấy sáng ban ngày mà vẫn kín đáo, lớp vải dày cản sáng ban đêm. Phù hợp phòng ngủ và phòng khách căn hộ cao tầng.</p><h2>Kết luận</h2><p>Phòng ngủ: nên chọn 2 lớp hoặc 1 lớp blackout. Phòng khách: 2 lớp nếu ngân sách cho phép.</p>` },
    { slug: "so-sanh-rem-cuon-va-rem-cau-vong-cho-can-ho", title: "So sánh rèm cuốn và rèm cầu vồng cho căn hộ chung cư", category: "kinh-nghiem-chon-rem", tags: ["rem-cuon", "rem-cau-vong"], coverImage: "/images/post-3.jpg", status: "PUBLISHED", publishedAt: daysAgo(10), isFeatured: false, authorId: editorId, categoryId: cat("kinh-nghiem-chon-rem"), metaTitle: null, metaDescription: null,
      excerpt: "Hai loại rèm gọn gàng được chọn nhiều nhất cho căn hộ – khác nhau ở đâu và loại nào hợp với bạn?",
      content: `<p>Rèm cuốn rẻ hơn, phẳng gọn, cản sáng tốt nhưng chỉ có hai trạng thái đóng/mở. Rèm cầu vồng đắt hơn 40 – 60% nhưng điều chỉnh được mức sáng và đẹp hơn cho phòng khách, phòng ngủ.</p><ul><li>Bếp, phòng tắm, cửa sổ nhỏ: rèm cuốn.</li><li>Phòng khách, phòng ngủ: rèm cầu vồng.</li></ul>` },
    { slug: "cong-trinh-can-ho-3-phong-ngu-vinhomes-grand-park", title: "Công trình: căn hộ 3 phòng ngủ Vinhomes Grand Park", category: "cong-trinh-tieu-bieu", tags: ["rem-vai", "rem-cau-vong", "phong-ngu"], coverImage: "/images/post-4.jpg", status: "PUBLISHED", publishedAt: daysAgo(14), isFeatured: true, authorId: editorId, categoryId: cat("cong-trinh-tieu-bieu"), metaTitle: null, metaDescription: null,
      excerpt: "Trọn bộ rèm vải 2 lớp phòng khách, rèm cầu vồng 3 phòng ngủ và rèm cuốn bếp – hoàn thiện trong 4 ngày.",
      content: `<p>Khách hàng mong muốn không gian sáng, tông màu be – xám ấm. Kim Dung tư vấn rèm vải 2 lớp RV-201 màu kem cho phòng khách, rèm cầu vồng CV-01 màu xám cho 3 phòng ngủ và rèm cuốn trơn RC-01 cho bếp.</p><p>Tổng diện tích 38 m², thời gian từ đo đạc đến lắp đặt: 4 ngày.</p>` },
    { slug: "huong-dan-ve-sinh-rem-vai-tai-nha", title: "Hướng dẫn vệ sinh rèm vải tại nhà đúng cách", category: "huong-dan-bao-quan", tags: ["rem-vai", "bao-quan"], coverImage: "/images/service-ve-sinh.jpg", status: "PUBLISHED", publishedAt: daysAgo(20), isFeatured: false, authorId: editorId, categoryId: cat("huong-dan-bao-quan"), metaTitle: null, metaDescription: null,
      excerpt: "Hút bụi định kỳ, giặt máy chế độ nhẹ và phơi đúng cách để rèm bền màu, không nhăn.",
      content: `<ol><li>Hút bụi rèm 2 tuần/lần bằng đầu hút mềm.</li><li>Giặt máy chế độ nhẹ, nước lạnh, không vắt mạnh với vải Polyester; nhung và linen nên giặt khô.</li><li>Phơi nơi râm mát, treo lại khi còn hơi ẩm để rèm tự thẳng.</li><li>Không dùng thuốc tẩy; vết bẩn cục bộ dùng xà phòng loãng.</li></ol>` },
    { slug: "uu-dai-thang-nay-giam-15-rem-vai-2-lop", title: "Ưu đãi tháng này: giảm 15% rèm vải 2 lớp, tặng công lắp đặt", category: "khuyen-mai", tags: ["rem-vai"], coverImage: "/images/hero-2.jpg", status: "PUBLISHED", publishedAt: daysAgo(1), isFeatured: false, authorId: adminId, categoryId: cat("khuyen-mai"), metaTitle: null, metaDescription: null,
      excerpt: "Áp dụng cho đơn hàng từ 10 m² trong tháng, đo đạc miễn phí toàn TP. HCM.",
      content: `<p>Từ nay đến cuối tháng, Rèm Kim Dung giảm 15% toàn bộ rèm vải hệ 2 lớp và miễn phí công lắp đặt cho đơn hàng từ 10 m². Liên hệ hotline hoặc gửi yêu cầu báo giá để được áp dụng.</p>` },
    { slug: "rem-van-phong-nen-chon-loai-nao", title: "Rèm văn phòng nên chọn loại nào? (bản nháp)", category: "kinh-nghiem-chon-rem", tags: ["van-phong", "rem-cuon"], coverImage: "/images/hero-3.jpg", status: "DRAFT", publishedAt: null, isFeatured: false, authorId: editorId, categoryId: cat("kinh-nghiem-chon-rem"), metaTitle: null, metaDescription: null,
      excerpt: "So sánh rèm cuốn lưới, rèm lá dọc và rèm sáo nhôm cho văn phòng.", content: `<p>Bản nháp – đang biên tập.</p>` },
  ];
  insert(
    "Post",
    posts.map((p) => {
      const { tags: _tags, category: _category, ...rest } = p;
      void _tags; void _category;
      return { id: post(p.slug), ...rest, ogImage: null, viewCount: 0, ...stamps(p.publishedAt ?? now) } as Row;
    })
  );
  insert("_PostToTag", posts.flatMap((p) => p.tags.map((t) => ({ A: post(p.slug), B: tag(t) }))));

  // ---------- CẢM NHẬN, FAQ, ĐỐI TÁC, BANNER ----------
  insert("Testimonial", [
    { name: "Chị Thu Hà", position: "Chủ căn hộ tại Quận 7, TP. HCM", content: "Nhân viên mang vải đến tận nhà cho mình chọn, đo đạc rất kỹ. Bộ rèm 2 lớp phòng khách lên màu đẹp hơn cả mong đợi, nếp rèm đều tăm tắp. Lắp xong dọn dẹp sạch sẽ.", rating: 5, order: 1 },
    { name: "Anh Minh Quân", position: "Giám đốc văn phòng tại Quận 1", content: "Văn phòng kính hướng Tây rất nóng, lắp rèm cuốn lưới sunscreen xong giảm nóng rõ rệt mà vẫn nhìn ra ngoài được. Giá hợp lý, thi công 1 buổi là xong 12 cửa.", rating: 5, order: 2 },
    { name: "Chị Lan Anh", position: "Chủ nhà phố tại Thủ Đức", content: "Chọn rèm cầu vồng cho 3 phòng ngủ, rất dễ dùng và không bám bụi như rèm vải. Sau 1 năm dây kéo hơi rít, gọi bảo hành là có thợ đến chỉnh ngay, không tính phí.", rating: 5, order: 3 },
    { name: "Anh Hoàng Nam", position: "Chủ quán cà phê tại Bình Thạnh", content: "Rèm sáo gỗ basswood làm quán ấm cúng hẳn, khách khen nhiều. Kim Dung tư vấn màu gỗ hợp với bàn ghế, giao đúng hẹn.", rating: 5, order: 4 },
    { name: "Chị Phương Thảo", position: "Chủ đầu tư căn hộ dịch vụ, Quận 2", content: "Đặt 40 bộ rèm cho tòa căn hộ dịch vụ, giá công trình tốt, mẫu đồng bộ, bảo hành 2 năm. Đội thi công làm gọn trong 3 ngày.", rating: 4, order: 5 },
  ].map((t) => ({ id: sid(`testimonial:${t.order}`), ...t, avatar: null, isActive: true, ...stamps() })));

  insert("Faq", [
    { order: 1, question: "Giá rèm được tính như thế nào?", answer: "Rèm vải, rèm cuốn, cầu vồng, roman, sáo gỗ, sáo nhôm, lá dọc tính theo mét vuông (m²) = chiều rộng × chiều cao của bộ rèm (đã cộng phần dư hai bên và phía trên). Rèm phòng tắm tính theo bộ. Giá đã gồm vải, may, thanh treo/phụ kiện tiêu chuẩn; motor và phụ kiện trang trí tính riêng. Báo giá chi tiết từng ô cửa được gửi sau khi đo đạc." },
    { order: 2, question: "Đo đạc và tư vấn tại nhà có mất phí không?", answer: "Hoàn toàn miễn phí trong nội thành TP. HCM và khu vực lân cận. Nhân viên mang theo catalogue mẫu vải thật để bạn chọn dưới ánh sáng thực tế của căn phòng." },
    { order: 3, question: "Thời gian từ lúc đặt đến khi lắp xong là bao lâu?", answer: "Rèm vải, roman: 3 – 5 ngày sau khi chốt mẫu. Rèm cuốn, cầu vồng, sáo nhôm: 2 – 3 ngày. Rèm sáo gỗ: 5 – 7 ngày. Công trình số lượng lớn theo tiến độ thỏa thuận." },
    { order: 4, question: "Phòng ngủ nên chọn rèm gì để tối hoàn toàn?", answer: "Rèm vải chống nắng 100% (blackout) hoặc rèm vải 2 lớp với lớp dày blackout. Nếu muốn gọn, chọn rèm cuốn blackout hoặc rèm cầu vồng cản sáng cao. Lưu ý may rèm rộng hơn cửa mỗi bên 15 – 20 cm để không lọt sáng mép." },
    { order: 5, question: "Chính sách bảo hành thế nào?", answer: "Bảo hành 12 tháng với rèm cuốn, sáo nhôm, phòng tắm; 18 – 24 tháng với rèm vải, cầu vồng, roman, sáo gỗ. Đổi mới trong 7 ngày nếu lỗi sản xuất. Sau bảo hành vẫn hỗ trợ bảo trì trọn đời, chỉ tính phí linh kiện." },
    { order: 6, question: "Có lắp motor điều khiển từ xa được không?", answer: "Có. Rèm vải, rèm cuốn, cầu vồng, roman, sáo gỗ đều lắp được motor (nguồn điện hoặc pin sạc), điều khiển bằng remote hoặc app điện thoại, kết nối nhà thông minh. Nên báo trước khi thi công để chừa nguồn điện." },
    { order: 7, question: "Văn phòng vách kính nên dùng loại rèm nào?", answer: "Rèm cuốn lưới (sunscreen) giảm nóng, chống chói mà vẫn nhìn ra ngoài; rèm lá dọc cho vách kính cao, diện tích lớn và ngân sách tiết kiệm; rèm sáo nhôm cho phòng nhỏ, khu vực ẩm." },
    { order: 8, question: "Thanh toán và xuất hóa đơn như thế nào?", answer: "Đặt cọc 30 – 50% khi chốt mẫu, thanh toán phần còn lại sau khi lắp đặt nghiệm thu. Nhận tiền mặt, chuyển khoản; xuất hóa đơn VAT cho công ty, công trình." },
  ].map((f) => ({ id: sid(`faq:${f.order}`), ...f, isActive: true, ...stamps() })));

  insert("Partner", [
    "Daehan Textile (Hàn Quốc)", "Kyung Fabric (Hàn Quốc)", "Jinli Blinds (Đài Loan)", "Aluvina – Nhôm Việt", "Mộc Việt Basswood", "Hunter Fabric (Bỉ)",
  ].map((name, i) => ({ id: sid(`partner:${i + 1}`), name, logo: null, website: "https://example.com", order: i + 1, isActive: true, ...stamps() })));

  insert("Banner", [
    { order: 1, title: "Rèm đẹp cho mọi ô cửa – giá tận xưởng", subtitle: "Hơn 500 mẫu rèm vải, rèm cuốn, cầu vồng, roman, sáo gỗ – nhôm. Đo đạc & tư vấn tận nơi miễn phí, lắp đặt trong 3 – 5 ngày, bảo hành đến 24 tháng.", image: "/images/hero-1.jpg", ctaText: "Nhận báo giá", ctaLink: "/bao-gia", ctaText2: "Xem sản phẩm", ctaLink2: "/san-pham" },
    { order: 2, title: "Rèm vải 2 lớp giảm 15% tháng này", subtitle: "Voan + vải cản sáng cho phòng ngủ, phòng khách căn hộ. Tặng công lắp đặt cho đơn từ 10 m².", image: "/images/hero-2.jpg", ctaText: "Xem rèm vải", ctaLink: "/danh-muc/rem-vai", ctaText2: "Đặt lịch đo đạc", ctaLink2: "/bao-gia" },
    { order: 3, title: "Giải pháp rèm văn phòng: cuốn lưới, lá dọc, sáo nhôm", subtitle: "Giảm nóng, chống chói cho vách kính. Giá công trình cho dự án số lượng lớn, bảo hành 24 tháng.", image: "/images/hero-3.jpg", ctaText: "Xem rèm cuốn", ctaLink: "/danh-muc/rem-cuon", ctaText2: "Liên hệ dự án", ctaLink2: "/dich-vu/rem-cong-trinh" },
  ].map((b) => ({ id: sid(`banner:${b.order}`), ...b, isActive: true, ...stamps() })));

  // ---------- YÊU CẦU BÁO GIÁ MẪU ----------
  insert("Lead", [
    { type: "QUOTE", fullName: "Nguyễn Thị Hồng", phone: "0912345678", email: null, address: "Chung cư Sunrise City, Quận 7", size: "Phòng khách 3,2 × 2,7 m, 2 phòng ngủ 1,8 × 2,2 m", categoryId: pcat("rem-vai"), productId: product("rem-vai-2-lop-voan-can-sang-rv-201"), message: "Muốn làm rèm 2 lớp màu kem cho cả căn hộ, vui lòng báo giá.", status: "NEW", adminNote: null, source: "/san-pham/rem-vai-2-lop-voan-can-sang-rv-201", createdAt: daysAgo(0.2) },
    { type: "CONSULTATION", fullName: "Trần Văn Bình", phone: "0987654321", email: "binhtv@example.com", address: "Văn phòng tầng 12, tòa nhà Bitexco, Quận 1", size: "12 ô cửa kính 1,5 × 2,8 m", categoryId: pcat("rem-cuon"), productId: null, message: "Văn phòng hướng Tây rất nóng, cần tư vấn rèm cuốn lưới hoặc lá dọc.", status: "CONTACTED", adminNote: "Đã gọi, hẹn đo đạc thứ 5 lúc 14h.", source: "/danh-muc/rem-cuon", createdAt: daysAgo(1) },
    { type: "QUOTE", fullName: "Lê Minh Châu", phone: "0905123456", email: null, address: "Nhà phố KDC Vạn Phúc, Thủ Đức", size: "Phòng khách cửa lớn 4,5 × 3,0 m", categoryId: pcat("rem-sao-go"), productId: product("rem-sao-go-basswood-50mm-he-2-day-sg-02"), message: "Hỏi giá rèm gỗ hệ 2 dây màu óc chó.", status: "QUOTED", adminNote: "Đã gửi báo giá 12,8 triệu qua Zalo.", source: "/san-pham/rem-sao-go-basswood-50mm-he-2-day-sg-02", createdAt: daysAgo(3) },
    { type: "CONTACT", fullName: "Phạm Quốc Đạt", phone: "0933222111", email: "datpq@example.com", address: null, size: null, categoryId: null, productId: null, message: "Tôi là chủ đầu tư dự án căn hộ dịch vụ 60 phòng, cần báo giá rèm công trình.", status: "CONTACTED", adminNote: "Chuyển bộ phận dự án.", source: "/lien-he", createdAt: daysAgo(5) },
    { type: "QUOTE", fullName: "Hoàng Thu Trang", phone: "0966778899", email: null, address: "Căn hộ Masteri Thảo Điền, Quận 2", size: "3 cửa sổ 1,6 × 1,5 m", categoryId: pcat("rem-cau-vong"), productId: product("rem-cau-vong-han-quoc-combi-cv-01"), message: "Rèm cầu vồng màu xám cho 3 phòng ngủ.", status: "WON", adminNote: "Đã lắp xong ngày hôm qua, khách hài lòng.", source: "/", createdAt: daysAgo(12) },
    { type: "CONSULTATION", fullName: "Đỗ Văn Long", phone: "0944556677", email: null, address: "Biên Hòa, Đồng Nai", size: null, categoryId: pcat("rem-vai"), productId: null, message: "Hỏi rèm vải cho nhà mới xây.", status: "CANCELLED", adminNote: "Khách không nghe máy sau 3 lần gọi.", source: "/bao-gia", createdAt: daysAgo(20) },
  ].map((l, i) => ({ id: sid(`lead:${i + 1}`), ...l, ipAddress: null, updatedAt: now })));

  const sql = `-- File sinh tự động bởi db/seed.ts (${now.toISOString()}). Không sửa tay.\n${statements.join("\n")}\n`;
  writeFileSync("db/seed.sql", sql, "utf8");
  console.log(`Đã sinh db/seed.sql (${statements.length} câu lệnh). Tài khoản admin: ${adminEmail} / ${adminPassword}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
