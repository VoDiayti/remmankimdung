-- XOÁ TOÀN BỘ dữ liệu mà db/seed.ts tạo ra (nội dung, tài khoản, lead mẫu) để seed lại từ đầu.
-- CHỈ DÙNG CHO D1 LOCAL: npm run db:reset  (= chạy file này rồi npm run db:seed)
-- KHÔNG chạy lên production: sẽ mất lead thật của khách, tài khoản admin và nội dung đã sửa trong Admin.
-- Bảng Media được giữ lại vì mỗi dòng gắn với một file ảnh trên R2.
-- Thứ tự xoá theo khoá ngoại: bảng con trước, bảng cha sau (Product → ProductCategory là ON DELETE RESTRICT).
DELETE FROM "_PostToTag";
DELETE FROM "Lead";
DELETE FROM "Post";
DELETE FROM "Product";
DELETE FROM "ProductLine";
DELETE FROM "ProductCategory";
DELETE FROM "Category";
DELETE FROM "Tag";
DELETE FROM "Banner";
DELETE FROM "Faq";
DELETE FROM "Partner";
DELETE FROM "Service";
DELETE FROM "Testimonial";
DELETE FROM "Setting";
DELETE FROM "User";
