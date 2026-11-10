import Image from "next/image";
import { revealDelay } from "@/lib/reveal";
import { cn } from "@/lib/utils";

export type GalleryImage = { src: string; alt: string; caption?: string };

/**
 * Lưới ảnh hoạt động (ảnh đầu tiên lớn hơn).
 * Trong <RevealSection>: ảnh lần lượt phóng lên khi cuộn tới. Rê chuột: ảnh phóng to, chú thích trượt lên.
 */
export function Gallery({ images, className }: { images: GalleryImage[]; className?: string }) {
  if (images.length === 0) return null;
  return (
    <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4", className)}>
      {images.map((img, i) => (
        <figure
          key={img.src}
          data-reveal="zoom"
          style={revealDelay(i * 90)}
          className={cn(
            "group relative overflow-hidden rounded-2xl bg-muted shadow-sm",
            i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-square"
          )}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-brand-dark/0 transition-colors duration-500 group-hover:bg-brand-dark/20" />
          {img.caption && (
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-10 text-xs font-medium text-white md:p-4 md:pt-12 md:text-sm">
              <span className="block transition-transform duration-500 group-hover:-translate-y-1">{img.caption}</span>
              <span aria-hidden="true" className="mt-1.5 block h-0.5 w-8 origin-left scale-x-0 rounded-full bg-amber-300 transition-transform duration-500 group-hover:scale-x-100" />
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
