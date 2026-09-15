import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      short_description,
      description,
      daily_price,
      deposit_amount,
      buffer_hours,
      status,
      categories (
        name,
        icon
      )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !product) {
    notFound();
  }

  const category = product.categories as unknown as {
    name: string;
    icon: string;
  } | null;

  const isHoover = product.slug === "hoover-cleanslate-pro-max";

  const rentalPrices = [
    { days: "1 วัน", price: 399, note: "เหมาะกับงานเล็ก" },
    { days: "2 วัน", price: 699, note: "มีเวลาใช้งานมากขึ้น" },
    { days: "3 วัน", price: 899, note: "คุ้มที่สุด", popular: true },
    { days: "4 วัน", price: 1099, note: "" },
    { days: "5 วัน", price: 1299, note: "" },
    { days: "6 วัน", price: 1499, note: "" },
  ];

  return (
    <main className="page">
      {/* HEADER */}
      <header className="header">
        <div className="headerInner">
          <Link href="/" className="brand">
            <div className="logo">⌂</div>
            <div>
              <div className="brandName">Buriram Rental</div>
              <div className="brandSub">
                เช่าง่าย ใช้สะดวก ใกล้บ้านคุณ
              </div>
            </div>
          </Link>

          <nav className="nav">
            <Link href="/">หน้าแรก</Link>
            <Link href="/products">สินค้าให้เช่า</Link>
          </nav>

          <Link href={`/booking/${product.slug}`} className="navButton">
            ตรวจสอบวันว่าง
          </Link>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link href="/">หน้าแรก</Link>
        <span>›</span>
        <Link href="/products">สินค้าให้เช่า</Link>
        <span>›</span>
        <strong>{product.name}</strong>
      </div>

      {/* PRODUCT HERO */}
      <section className="productHero">
        <div className="gallery">
          <div className="mainImage">
            {isHoover ? (
              <Image
                src="/images/hoover-cleanslate-01.webp"
                alt={product.name}
                width={800}
                height={800}
                priority
                className="productImage"
              />
            ) : (
              <div className="imagePlaceholder">
                <span>🧰</span>
                <p>Product image</p>
              </div>
            )}

            <div className="availableBadge">
              ● เปิดให้เช่า
            </div>
          </div>

          {isHoover && (
            <div className="smallImage">
              <Image
                src="/images/hoover-cleanslate-02.webp"
                alt={`${product.name} และอุปกรณ์`}
                width={500}
                height={500}
                className="productImage"
              />
            </div>
          )}
        </div>

        <div className="productInfo">
          <div className="category">
            {category?.icon} {category?.name}
          </div>

          <h1>{product.name}</h1>

          <p className="shortDescription">
            {product.short_description}
          </p>

          {product.description && (
            <p className="description">
              {product.description}
            </p>
          )}

          <div className="quickFeatures">
            <div>
              <span>✨</span>
              <p>
                <strong>สำหรับผื้นผิวผ้า</strong>
                <small>โซฟา พรม และเบาะผ้า</small>
              </p>
            </div>

            <div>
              <span>👍</span>
              <p>
                <strong>ใช้งานง่าย</strong>
                <small>เหมาะสำหรับใช้เองที่บ้าน</small>
              </p>
            </div>

            <div>
              <span>🚗</span>
              <p>
                <strong>ใช้กับเบาะรถได้</strong>
                <small>เบาะผ้าและพรมภายในรถ</small>
              </p>
            </div>
          </div>

          <div className="priceCard">
            <div>
              <small>ค่าเช่าเริ่มต้น</small>

              <div className="price">
                <strong>
                  {Number(product.daily_price).toLocaleString()}
                </strong>
                <span>บาท / 24 ชั่วโมง</span>
              </div>

              <p>
                เงินประกัน{" "}
                <b>
                  {Number(product.deposit_amount).toLocaleString()} บาท
                </b>
                {" "}• คืนหลังตรวจรับเครื่อง
              </p>
            </div>

            <Link
              href={`/booking/${product.slug}`}
              className="primaryButton"
            >
              เลือกวันเช่า →
            </Link>
          </div>

          <div className="deliveryNote">
            <span>🚚</span>
            <div>
              <strong>เลือกรับเอง หรือให้เราจัดส่ง</strong>
              <p>
                ระบบจะคำนวณค่าจัดส่งตามระยะทางจริง
                เมื่อกรอกสถานที่จัดส่งในหน้าจอง
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICE PACKAGES */}
      <section className="priceSection">
        <div className="sectionTitle">
          <span>ราคาเช่า</span>
          <h2>ยิ่งเช่าหลายวัน ยิ่งคุ้ม</h2>
          <p>
            ระบบคำนวณราคาให้อัตโนมัติตามระยะเวลาที่เลือก
          </p>
        </div>

        <div className="priceGrid">
          {rentalPrices.map((item) => (
            <div
              key={item.days}
              className={`packageCard ${
                item.popular ? "popular" : ""
              }`}
            >
              {item.popular && (
                <div className="popularBadge">แนะนำ</div>
              )}

              <strong>{item.days}</strong>

              <div>
                <span>{item.price.toLocaleString()}</span>
                <small> บาท</small>
              </div>

              {item.note && <p>{item.note}</p>}
            </div>
          ))}
        </div>

        <p className="extraDay">
          ตั้งแต่วันที่ 4 เป็นต้นไป เพิ่มเพียง
          <strong> 200 บาท / วัน</strong>
        </p>
      </section>

      {/* USE CASES */}
      <section className="useSection">
        <div className="sectionTitle">
          <span>เหมาะสำหรับ</span>
          <h2>เครื่องเดียว ทำความสะอาดได้หลายอย่าง</h2>
        </div>

        <div className="useGrid">
          <article>
            <div>🛋️</div>
            <h3>โซฟาผ้า</h3>
            <p>จัดการคราบและสิ่งสกปรกบนเบาะโซฟา</p>
          </article>

          <article>
            <div>▦</div>
            <h3>พรม</h3>
            <p>เหมาะสำหรับทำความสะอาดคราบเฉพาะจุด</p>
          </article>

          <article>
            <div>🚗</div>
            <h3>เบาะรถยนต์</h3>
            <p>ทำความสะอาดเบาะผ้าและพรมภายในรถ</p>
          </article>

          <article>
            <div>🪑</div>
            <h3>เฟอร์นิเจอร์ผ้า</h3>
            <p>เก้าอี้ เบาะนั่ง และพื้นผิวผ้าอื่น ๆ</p>
          </article>
        </div>
      </section>

      {/* RENTAL INFO */}
      <section className="infoSection">
        <div className="infoInner">
          <div>
            <span className="redLabel">ก่อนเช่า</span>
            <h2>ข้อมูลที่ควรรู้</h2>
          </div>

          <div className="infoList">
            <div>
              <span>01</span>
              <p>
                <strong>1 วัน = ไม่เกิน 24 ชั่วโมง</strong>
                <small>
                  หากเกิน 24 ชั่วโมง ระบบจะคิดเป็นวันถัดไป
                </small>
              </p>
            </div>

            <div>
              <span>02</span>
              <p>
                <strong>
                  เงินประกัน {Number(product.deposit_amount).toLocaleString()} บาท
                </strong>
                <small>
                  คืนหลังจากได้รับเครื่องคืนและตรวจสอบเรียบร้อย
                </small>
              </p>
            </div>

            <div>
              <span>03</span>
              <p>
                <strong>มีบริการจัดส่ง</strong>
                <small>
                  0–5 กม. 50 บาท • 5–10 กม. 100 บาท •
                  10–15 กม. 150 บาท
                </small>
              </p>
            </div>

            <div>
              <span>04</span>
              <p>
                <strong>เกิน 15 กม.</strong>
                <small>
                  กรุณาติดต่อร้านก่อนทำรายการจอง
                </small>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="finalCta">
        <div>
          <small>{product.name}</small>
          <h2>พร้อมเช่าเครื่องแล้วหรือยัง?</h2>
          <p>
            เลือกวันและเวลาที่ต้องการ ระบบจะตรวจสอบคิวให้ทันที
          </p>
        </div>

        <Link
          href={`/booking/${product.slug}`}
          className="primaryButton large"
        >
          ตรวจสอบวันว่างและจอง →
        </Link>
      </section>

      <footer className="footer">
        <div>
          <strong>Buriram Rental</strong>
          <p>เช่าง่าย ใช้สะดวก ใกล้บ้านคุณ</p>
        </div>

        <Link href="/products">ดูสินค้าให้เช่าทั้งหมด</Link>
      </footer>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        a { color: inherit; text-decoration: none; }

        .page {
          min-height: 100vh;
          background: #fff;
          color: #181818;
          font-family: Arial, Helvetica, sans-serif;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #eee;
        }

        .headerInner {
          max-width: 1200px;
          min-height: 74px;
          margin: auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .logo {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 2px solid #222;
          border-radius: 12px;
          font-size: 25px;
        }

        .brandName {
          font-size: 21px;
          font-weight: 900;
        }

        .brandSub {
          margin-top: 3px;
          color: #777;
          font-size: 11px;
        }

        .nav {
          display: flex;
          gap: 28px;
          font-size: 14px;
          font-weight: 700;
        }

        .nav a:hover { color: #d71920; }

        .navButton {
          padding: 11px 17px;
          border: 1px solid #ddd;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
        }

        .breadcrumb {
          max-width: 1200px;
          margin: auto;
          padding: 24px 24px 0;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          color: #777;
          font-size: 12px;
        }

        .breadcrumb strong { color: #333; }

        .productHero {
          max-width: 1200px;
          margin: auto;
          padding: 35px 24px 75px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
        }

        .gallery {
          display: grid;
          grid-template-columns: 1fr 120px;
          gap: 13px;
          align-items: start;
        }

        .mainImage,
        .smallImage {
          position: relative;
          overflow: hidden;
          background: #f7f6f4;
          border: 1px solid #eee;
          border-radius: 28px;
        }

        .mainImage {
          min-height: 520px;
          display: grid;
          place-items: center;
        }

        .smallImage {
          padding: 5px;
          border-radius: 18px;
        }

        .productImage {
          width: 100%;
          height: auto;
          object-fit: contain;
        }

        .imagePlaceholder {
          text-align: center;
          color: #777;
        }

        .imagePlaceholder span {
          font-size: 70px;
        }

        .availableBadge {
          position: absolute;
          left: 18px;
          top: 18px;
          padding: 8px 13px;
          background: #fff;
          border-radius: 999px;
          color: #16843c;
          font-size: 11px;
          font-weight: 900;
          box-shadow: 0 5px 15px rgba(0,0,0,.08);
        }

        .productInfo {
          padding-top: 10px;
        }

        .category {
          color: #d71920;
          font-size: 13px;
          font-weight: 800;
        }

        .productInfo h1 {
          margin: 10px 0 14px;
          font-size: clamp(34px,4vw,51px);
          line-height: 1.08;
          letter-spacing: -1.5px;
        }

        .shortDescription {
          margin: 0;
          color: #555;
          font-size: 17px;
          line-height: 1.7;
        }

        .description {
          color: #777;
          font-size: 14px;
          line-height: 1.7;
        }

        .quickFeatures {
          margin: 25px 0;
          padding: 20px 0;
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 12px;
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
        }

        .quickFeatures > div {
          display: flex;
          gap: 8px;
        }

        .quickFeatures > div > span {
          font-size: 21px;
        }

        .quickFeatures p {
          margin: 0;
        }

        .quickFeatures strong,
        .quickFeatures small {
          display: block;
        }

        .quickFeatures strong {
          font-size: 12px;
        }

        .quickFeatures small {
          margin-top: 4px;
          color: #888;
          font-size: 10px;
          line-height: 1.4;
        }

        .priceCard {
          padding: 21px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          background: #f7f5f2;
          border-radius: 22px;
        }

        .priceCard > div > small {
          color: #777;
          font-weight: 700;
        }

        .price {
          margin-top: 3px;
          display: flex;
          align-items: baseline;
          gap: 7px;
        }

        .price strong {
          color: #d71920;
          font-size: 44px;
          line-height: 1;
        }

        .price span {
          font-size: 12px;
          font-weight: 800;
        }

        .priceCard p {
          margin: 8px 0 0;
          color: #666;
          font-size: 11px;
        }

        .primaryButton {
          min-height: 50px;
          padding: 0 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #d71920;
          color: #fff;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 900;
          white-space: nowrap;
          box-shadow: 0 10px 24px rgba(215,25,32,.20);
        }

        .deliveryNote {
          margin-top: 15px;
          padding: 16px 18px;
          display: flex;
          gap: 12px;
          border: 1px solid #eee;
          border-radius: 17px;
        }

        .deliveryNote > span { font-size: 24px; }

        .deliveryNote strong {
          font-size: 13px;
        }

        .deliveryNote p {
          margin: 4px 0 0;
          color: #777;
          font-size: 11px;
          line-height: 1.5;
        }

        .priceSection,
        .useSection {
          padding: 75px 24px;
        }

        .priceSection {
          background: #181818;
          color: #fff;
        }

        .sectionTitle {
          max-width: 1152px;
          margin: 0 auto 30px;
        }

        .sectionTitle > span,
        .redLabel {
          color: #d71920;
          font-size: 12px;
          font-weight: 900;
        }

        .priceSection .sectionTitle > span {
          color: #ff686e;
        }

        .sectionTitle h2,
        .infoInner h2,
        .finalCta h2 {
          margin: 7px 0 0;
          font-size: clamp(29px,3.5vw,42px);
          letter-spacing: -1px;
        }

        .sectionTitle > p {
          margin: 9px 0 0;
          color: #aaa;
          font-size: 13px;
        }

        .priceGrid {
          max-width: 1152px;
          margin: auto;
          display: grid;
          grid-template-columns: repeat(6,1fr);
          gap: 10px;
        }

        .packageCard {
          position: relative;
          min-height: 135px;
          padding: 20px 13px;
          background: #242424;
          border: 1px solid #363636;
          border-radius: 17px;
        }

        .packageCard.popular {
          border-color: #d71920;
          background: #2b2020;
        }

        .popularBadge {
          position: absolute;
          right: 9px;
          top: 9px;
          padding: 4px 7px;
          background: #d71920;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 900;
        }

        .packageCard > strong {
          font-size: 13px;
        }

        .packageCard > div:not(.popularBadge) {
          margin-top: 14px;
        }

        .packageCard div span {
          font-size: 23px;
          font-weight: 900;
        }

        .packageCard div small {
          color: #aaa;
          font-size: 10px;
        }

        .packageCard p {
          margin: 7px 0 0;
          color: #aaa;
          font-size: 9px;
        }

        .extraDay {
          max-width: 1152px;
          margin: 18px auto 0;
          color: #aaa;
          font-size: 12px;
        }

        .extraDay strong { color: #fff; }

        .useSection {
          max-width: 1200px;
          margin: auto;
        }

        .useGrid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 15px;
        }

        .useGrid article {
          padding: 25px;
          background: #fafafa;
          border: 1px solid #e9e9e9;
          border-radius: 21px;
        }

        .useGrid article > div {
          font-size: 33px;
        }

        .useGrid h3 {
          margin: 16px 0 6px;
          font-size: 17px;
        }

        .useGrid p {
          margin: 0;
          color: #777;
          font-size: 12px;
          line-height: 1.6;
        }

        .infoSection {
          padding: 70px 24px;
          background: #f5f3f0;
        }

        .infoInner {
          max-width: 1152px;
          margin: auto;
          display: grid;
          grid-template-columns: .8fr 1.2fr;
          gap: 70px;
        }

        .infoList {
          display: grid;
          gap: 12px;
        }

        .infoList > div {
          padding: 15px 0;
          display: flex;
          gap: 14px;
          border-bottom: 1px solid #ddd;
        }

        .infoList > div > span {
          color: #d71920;
          font-size: 11px;
          font-weight: 900;
        }

        .infoList p {
          margin: 0;
        }

        .infoList strong,
        .infoList small {
          display: block;
        }

        .infoList strong {
          font-size: 14px;
        }

        .infoList small {
          margin-top: 4px;
          color: #777;
          font-size: 11px;
          line-height: 1.5;
        }

        .finalCta {
          max-width: 1200px;
          margin: auto;
          padding: 65px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 35px;
        }

        .finalCta > div > small {
          color: #d71920;
          font-weight: 900;
        }

        .finalCta p {
          margin: 9px 0 0;
          color: #777;
          font-size: 12px;
        }

        .primaryButton.large {
          min-height: 56px;
          padding: 0 27px;
        }

        .footer {
          padding: 30px max(24px,calc((100vw - 1152px)/2));
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f5f5f5;
          border-top: 1px solid #e5e5e5;
          font-size: 12px;
        }

        .footer strong {
          font-size: 17px;
        }

        .footer p {
          margin: 4px 0 0;
          color: #777;
        }

        @media(max-width:900px) {
          .nav { display:none; }

          .productHero {
            grid-template-columns:1fr;
            gap:35px;
          }

          .gallery {
            grid-template-columns:1fr;
          }

          .smallImage {
            display:none;
          }

          .mainImage {
            min-height:auto;
          }

          .priceGrid {
            grid-template-columns:repeat(3,1fr);
          }

          .useGrid {
            grid-template-columns:1fr 1fr;
          }

          .infoInner {
            grid-template-columns:1fr;
            gap:30px;
          }
        }

        @media(max-width:560px) {
          .headerInner { padding:0 16px; }

          .logo {
            width:36px;
            height:36px;
          }

          .brandName { font-size:17px; }
          .brandSub { display:none; }

          .navButton {
            padding:9px 11px;
            font-size:10px;
          }

          .breadcrumb {
            padding-left:18px;
            padding-right:18px;
          }

          .productHero {
            padding:25px 18px 50px;
          }

          .productInfo h1 {
            font-size:36px;
          }

          .quickFeatures {
            grid-template-columns:1fr;
          }

          .priceCard {
            align-items:stretch;
            flex-direction:column;
          }

          .primaryButton {
            width:100%;
          }

          .priceSection,
          .useSection,
          .infoSection {
            padding:55px 18px;
          }

          .priceGrid {
            grid-template-columns:1fr 1fr;
          }

          .useGrid {
            grid-template-columns:1fr;
          }

          .finalCta {
            padding:50px 18px;
            align-items:stretch;
            flex-direction:column;
          }

          .footer {
            align-items:flex-start;
            flex-direction:column;
            gap:15px;
          }
        }
      `}</style>
    </main>
  );
}