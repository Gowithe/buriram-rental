import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      {/* HEADER */}
      <header className="header">
        <div className="headerInner">
          <Link href="/" className="brand">
            <div className="logo">⌂</div>
            <div>
              <div className="brandName">Buriram Rental</div>
              <div className="brandSub">เช่าง่าย ใช้สะดวก ใกล้บ้านคุณ</div>
            </div>
          </Link>

          <nav className="nav">
            <Link href="/" className="active">หน้าแรก</Link>
            <Link href="/products">สินค้าให้เช่า</Link>
            <a href="#how">วิธีการเช่า</a>
            <a href="#why">ทำไมต้องเช่า</a>
          </nav>

          <Link
            href="/booking/hoover-cleanslate-pro-max"
            className="navCta"
          >
            ตรวจสอบวันว่าง
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="heroInner">
          <div className="heroContent">
            <div className="eyebrow">
              ✨ สะอาดเองได้ ไม่ต้องจ้างร้าน
            </div>

            <h1>
              เครื่องทำความสะอาด
              <span>โซฟา พรม และเบาะรถ</span>
            </h1>

            <p className="lead">
              เช่าเครื่อง <strong>Hoover CleanSlate Pro Max</strong>
              <br />
              ขจัดคราบบนโซฟา พรม เบาะรถ และเฟอร์นิเจอร์ผ้า
              ใช้เสร็จแล้วคืน ไม่ต้องซื้อเครื่องราคาแพง
            </p>

            <div className="checks">
              <div>✓ ขจัดคราบฝังลึกและสิ่งสกปรก</div>
              <div>✓ ใช้งานง่าย เหมาะสำหรับใช้ที่บ้าน</div>
              <div>✓ เช่าเฉพาะวันที่ต้องใช้</div>
              <div>✓ มีบริการจัดส่งตามระยะทาง</div>
            </div>

            <div className="bookingBox">
              <div>
                <small>ค่าเช่าเริ่มต้น</small>
                <div className="priceLine">
                  <strong>399</strong>
                  <span>บาท / วัน</span>
                </div>
              </div>

              <Link
                href="/booking/hoover-cleanslate-pro-max"
                className="primaryButton"
              >
                เช่าเครื่องนี้เลย →
              </Link>
            </div>

            <div className="deposit">
              เงินประกัน 1,000 บาท • เลือกรับเองหรือจัดส่ง
            </div>
          </div>

          <div className="heroProduct">
            <div className="recommended">สินค้าแนะนำ</div>

            <Image
              src="/images/hoover-cleanslate-01.webp"
              alt="เครื่องทำความสะอาด Hoover CleanSlate Pro Max"
              width={700}
              height={700}
              priority
              className="heroImage"
            />

            <div className="productTag">
              <strong>Hoover CleanSlate Pro Max</strong>
              <span>Portable Spot Cleaner</span>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK BENEFITS */}
      <section className="benefits">
        <div className="benefitsInner">
          <div className="benefit">
            <span>✨</span>
            <div>
              <strong>สะอาดล้ำลึก</strong>
              <small>จัดการคราบบนพื้นผิวผ้า</small>
            </div>
          </div>

          <div className="benefit">
            <span>💰</span>
            <div>
              <strong>ประหยัดกว่า</strong>
              <small>ไม่ต้องซื้อเครื่องเอง</small>
            </div>
          </div>

          <div className="benefit">
            <span>👍</span>
            <div>
              <strong>ใช้งานง่าย</strong>
              <small>เหมาะสำหรับมือใหม่</small>
            </div>
          </div>

          <div className="benefit">
            <span>🚚</span>
            <div>
              <strong>มีบริการจัดส่ง</strong>
              <small>คิดตามระยะทางจริง</small>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="section">
        <div className="sectionHead">
          <div>
            <div className="kicker">เครื่องเดียว ใช้ได้หลายงาน</div>
            <h2>วันนี้อยากทำความสะอาดอะไร?</h2>
          </div>

          <p>
            เหมาะกับงานทำความสะอาดที่เราไม่ได้ทำทุกวัน
            จึงไม่จำเป็นต้องซื้อเครื่องมาเก็บไว้เอง
          </p>
        </div>

        <div className="useGrid">
          <article className="useCard">
            <div className="useIcon">🛋️</div>
            <h3>โซฟาที่บ้าน</h3>
            <p>คราบอาหาร เครื่องดื่ม และสิ่งสกปรกบนโซฟาผ้า</p>
          </article>

          <article className="useCard">
            <div className="useIcon">▦</div>
            <h3>พรม</h3>
            <p>ทำความสะอาดคราบสกปรกบนพรมและพื้นผิวผ้า</p>
          </article>

          <article className="useCard">
            <div className="useIcon">🚗</div>
            <h3>เบาะรถยนต์</h3>
            <p>เบาะผ้า พรมรถ และบริเวณภายในรถยนต์</p>
          </article>

          <article className="useCard">
            <div className="useIcon">🪑</div>
            <h3>เฟอร์นิเจอร์ผ้า</h3>
            <p>เก้าอี้ เบาะนั่ง และเฟอร์นิเจอร์ผ้าอื่น ๆ</p>
          </article>
        </div>
      </section>

      {/* WHY RENT */}
      <section className="rentSection" id="why">
        <div className="rentInner">
          <div className="productPhoto">
            <Image
              src="/images/hoover-cleanslate-02.webp"
              alt="Hoover CleanSlate Pro Max พร้อมหัวทำความสะอาด"
              width={700}
              height={700}
              className="secondImage"
            />
          </div>

          <div className="rentContent">
            <div className="kicker">เช่าแทนซื้อ</div>
            <h2>
              ใช้ปีละไม่กี่ครั้ง
              <br />
              ทำไมต้องซื้อเครื่องมาเก็บ?
            </h2>

            <p className="rentIntro">
              เครื่องทำความสะอาดประเภทนี้เหมาะกับการเช่า
              เพราะเราอาจใช้เพียงเวลาที่ต้องการล้างโซฟา
              ทำความสะอาดรถ หรือจัดบ้านครั้งใหญ่
            </p>

            <div className="reason">
              <span>01</span>
              <div>
                <strong>ประหยัดเงิน</strong>
                <p>จ่ายเฉพาะวันที่ต้องการใช้งาน</p>
              </div>
            </div>

            <div className="reason">
              <span>02</span>
              <div>
                <strong>ไม่ต้องหาที่เก็บ</strong>
                <p>ใช้เสร็จแล้วคืน ไม่ต้องมีเครื่องวางอยู่ในบ้าน</p>
              </div>
            </div>

            <div className="reason">
              <span>03</span>
              <div>
                <strong>จองได้ด้วยตัวเอง</strong>
                <p>เลือกวัน เวลา และวิธีรับเครื่องผ่านเว็บไซต์</p>
              </div>
            </div>

            <Link
              href="/products/hoover-cleanslate-pro-max"
              className="outlineButton"
            >
              ดูรายละเอียดเครื่อง →
            </Link>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="section how" id="how">
        <div className="centerHead">
          <div className="kicker">ง่าย ไม่ยุ่งยาก</div>
          <h2>เช่าเครื่องใน 4 ขั้นตอน</h2>
          <p>ตรวจสอบวันว่างและจองได้ด้วยตัวเองตลอด 24 ชั่วโมง</p>
        </div>

        <div className="steps">
          <div className="step">
            <span>1</span>
            <strong>เลือกวันและเวลา</strong>
            <p>ระบุเวลาที่ต้องการรับและคืนเครื่อง</p>
          </div>

          <div className="step">
            <span>2</span>
            <strong>เลือกวิธีรับเครื่อง</strong>
            <p>มารับเอง หรือเลือกบริการจัดส่ง</p>
          </div>

          <div className="step">
            <span>3</span>
            <strong>ชำระเงิน</strong>
            <p>ชำระค่าเช่าและเงินประกันผ่าน QR</p>
          </div>

          <div className="step">
            <span>4</span>
            <strong>รับเครื่องไปใช้งาน</strong>
            <p>ใช้งานตามช่วงเวลาที่จองไว้</p>
          </div>
        </div>
      </section>

      {/* TRUST / FUTURE REAL REVIEW */}
      <section className="realSection">
        <div className="realInner">
          <div>
            <div className="kicker light">เครื่องจริง • ทดลองจริง</div>
            <h2>เราจะไม่ขายฝัน<br />เรื่องความสะอาด</h2>
          </div>

          <div>
            <p>
              เรากำลังทดสอบเครื่อง Hoover ตัวจริงกับโซฟา
              พรม และเบาะ เพื่อจัดทำคู่มือการใช้งานที่เข้าใจง่าย
              พร้อมภาพผลลัพธ์จากการใช้งานจริง
            </p>

            <div className="coming">
              📷 ภาพ Before / After จากเครื่องจริงกำลังมา
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="finalCta">
        <div>
          <small>Hoover CleanSlate Pro Max</small>
          <h2>พร้อมทำความสะอาดแล้วหรือยัง?</h2>
          <p>เริ่มต้น 399 บาท / วัน • เงินประกัน 1,000 บาท</p>
        </div>

        <Link
          href="/booking/hoover-cleanslate-pro-max"
          className="primaryButton big"
        >
          ตรวจสอบวันว่างและจอง →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div>
          <strong>Buriram Rental</strong>
          <p>เช่าง่าย ใช้สะดวก ใกล้บ้านคุณ</p>
        </div>

        <div>
          <p>บริการให้เช่าอุปกรณ์ในพื้นที่บุรีรัมย์</p>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }

        .page {
          min-height: 100vh;
          background: #fff;
          color: #171717;
          font-family: Arial, Helvetica, sans-serif;
        }

        a { color: inherit; text-decoration: none; }

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
          gap: 28px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
          flex-shrink: 0;
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
          line-height: 1;
          font-weight: 900;
        }

        .brandSub {
          margin-top: 5px;
          color: #777;
          font-size: 11px;
        }

        .nav {
          display: flex;
          gap: 27px;
          font-size: 14px;
          font-weight: 700;
        }

        .nav a:hover,
        .nav .active { color: #d71920; }

        .navCta {
          padding: 11px 17px;
          border: 1px solid #ddd;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }

        .hero {
          background:
            radial-gradient(circle at 82% 35%, rgba(215,25,32,.09), transparent 31%),
            linear-gradient(135deg,#fff,#f8f6f4);
          border-bottom: 1px solid #eee;
        }

        .heroInner {
          max-width: 1200px;
          margin: auto;
          padding: 62px 24px;
          display: grid;
          grid-template-columns: 1.04fr .96fr;
          gap: 55px;
          align-items: center;
        }

        .eyebrow, .kicker {
          color: #d71920;
          font-size: 13px;
          font-weight: 900;
        }

        .hero h1 {
          margin: 13px 0 21px;
          font-size: clamp(42px,5vw,67px);
          line-height: 1.05;
          letter-spacing: -2px;
        }

        .hero h1 span {
          display: block;
          color: #d71920;
        }

        .lead {
          max-width: 590px;
          margin: 0;
          color: #5d5d5d;
          font-size: 17px;
          line-height: 1.75;
        }

        .checks {
          margin-top: 26px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px 22px;
          font-size: 14px;
          font-weight: 700;
        }

        .checks div { color: #333; }

        .bookingBox {
          max-width: 610px;
          margin-top: 30px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: #fff;
          border: 1px solid #e8e5e2;
          border-radius: 22px;
          box-shadow: 0 16px 40px rgba(0,0,0,.06);
        }

        .bookingBox small {
          color: #777;
          font-weight: 700;
        }

        .priceLine {
          margin-top: 3px;
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .priceLine strong {
          color: #d71920;
          font-size: 46px;
          line-height: 1;
        }

        .priceLine span {
          font-size: 14px;
          font-weight: 800;
        }

        .primaryButton {
          min-height: 50px;
          padding: 0 23px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #d71920;
          color: #fff;
          font-size: 14px;
          font-weight: 900;
          box-shadow: 0 10px 25px rgba(215,25,32,.22);
          transition: .2s;
        }

        .primaryButton:hover {
          background: #b91218;
          transform: translateY(-2px);
        }

        .deposit {
          margin-top: 12px;
          color: #777;
          font-size: 12px;
        }

        .heroProduct {
          position: relative;
          overflow: hidden;
          min-height: 510px;
          display: grid;
          place-items: center;
          background: #fff;
          border-radius: 34px;
          box-shadow: 0 25px 65px rgba(0,0,0,.10);
        }

        .heroImage {
          width: 88%;
          height: auto;
          object-fit: contain;
        }

        .recommended {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 2;
          padding: 9px 14px;
          background: #d71920;
          color: #fff;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
        }

        .productTag {
          position: absolute;
          right: 18px;
          bottom: 18px;
          padding: 14px 18px;
          background: #181818;
          color: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,.18);
        }

        .productTag strong,
        .productTag span { display:block; }

        .productTag strong { font-size:13px; }

        .productTag span {
          margin-top:4px;
          color:#bbb;
          font-size:10px;
        }

        .benefits { border-bottom:1px solid #eee; }

        .benefitsInner {
          max-width:1200px;
          margin:auto;
          padding:24px;
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:25px;
        }

        .benefit {
          display:flex;
          align-items:center;
          gap:12px;
        }

        .benefit > span { font-size:25px; }

        .benefit strong,
        .benefit small { display:block; }

        .benefit strong { font-size:14px; }

        .benefit small {
          margin-top:4px;
          color:#777;
          font-size:11px;
        }

        .section {
          max-width:1200px;
          margin:auto;
          padding:78px 24px;
        }

        .sectionHead {
          display:flex;
          align-items:end;
          justify-content:space-between;
          gap:50px;
          margin-bottom:32px;
        }

        .sectionHead h2,
        .rentContent h2,
        .centerHead h2,
        .realInner h2,
        .finalCta h2 {
          margin:8px 0 0;
          font-size:clamp(29px,3.5vw,43px);
          line-height:1.15;
          letter-spacing:-1px;
        }

        .sectionHead > p {
          max-width:430px;
          margin:0;
          color:#777;
          font-size:14px;
          line-height:1.7;
        }

        .useGrid {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:16px;
        }

        .useCard {
          padding:25px;
          border:1px solid #e9e9e9;
          border-radius:22px;
          background:#fafafa;
        }

        .useIcon { font-size:33px; }

        .useCard h3 {
          margin:18px 0 7px;
          font-size:18px;
        }

        .useCard p {
          margin:0;
          color:#777;
          font-size:13px;
          line-height:1.6;
        }

        .rentSection {
          padding:80px 24px;
          background:#f5f3f0;
        }

        .rentInner {
          max-width:1200px;
          margin:auto;
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:65px;
          align-items:center;
        }

        .productPhoto {
          overflow:hidden;
          background:#fff;
          border-radius:30px;
          box-shadow:0 22px 55px rgba(0,0,0,.08);
        }

        .secondImage {
          width:100%;
          height:auto;
          display:block;
        }

        .rentIntro {
          margin:18px 0 27px;
          color:#666;
          font-size:15px;
          line-height:1.75;
        }

        .reason {
          display:flex;
          gap:14px;
          margin-top:18px;
        }

        .reason > span {
          flex:0 0 40px;
          height:40px;
          display:grid;
          place-items:center;
          background:#d71920;
          color:#fff;
          border-radius:50%;
          font-size:11px;
          font-weight:900;
        }

        .reason strong { font-size:15px; }

        .reason p {
          margin:4px 0 0;
          color:#777;
          font-size:13px;
        }

        .outlineButton {
          margin-top:27px;
          padding:12px 19px;
          display:inline-flex;
          border:1px solid #d71920;
          border-radius:999px;
          color:#d71920;
          font-size:13px;
          font-weight:900;
        }

        .centerHead {
          text-align:center;
        }

        .centerHead > p {
          margin:10px 0 0;
          color:#777;
          font-size:14px;
        }

        .steps {
          margin-top:35px;
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:16px;
        }

        .step {
          padding:25px 18px;
          text-align:center;
          border:1px solid #e9e9e9;
          border-radius:21px;
          background:#fafafa;
        }

        .step > span {
          width:42px;
          height:42px;
          margin:0 auto 14px;
          display:grid;
          place-items:center;
          background:#181818;
          color:#fff;
          border-radius:50%;
          font-size:13px;
          font-weight:900;
        }

        .step strong {
          display:block;
          font-size:15px;
        }

        .step p {
          margin:6px 0 0;
          color:#777;
          font-size:12px;
          line-height:1.55;
        }

        .realSection {
          padding:70px 24px;
          background:#181818;
          color:#fff;
        }

        .realInner {
          max-width:1200px;
          margin:auto;
          display:grid;
          grid-template-columns:.9fr 1.1fr;
          gap:80px;
          align-items:center;
        }

        .kicker.light { color:#ff6d72; }

        .realInner p {
          margin:0;
          color:#ccc;
          line-height:1.8;
        }

        .coming {
          margin-top:20px;
          padding:17px 20px;
          border:1px solid #3b3b3b;
          border-radius:15px;
          background:#222;
          font-size:13px;
          font-weight:700;
        }

        .finalCta {
          max-width:1200px;
          margin:auto;
          padding:65px 24px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:35px;
        }

        .finalCta small {
          color:#d71920;
          font-weight:900;
        }

        .finalCta p {
          margin:10px 0 0;
          color:#777;
          font-size:13px;
        }

        .primaryButton.big {
          min-height:56px;
          padding:0 28px;
        }

        .footer {
          padding:32px max(24px,calc((100vw - 1152px)/2));
          display:flex;
          justify-content:space-between;
          gap:30px;
          background:#f5f5f5;
          border-top:1px solid #e7e7e7;
        }

        .footer strong { font-size:18px; }

        .footer p {
          margin:5px 0 0;
          color:#777;
          font-size:12px;
        }

        @media(max-width:900px) {
          .nav { display:none; }

          .heroInner {
            grid-template-columns:1fr;
            padding-top:42px;
          }

          .checks { grid-template-columns:1fr; }

          .heroProduct { min-height:auto; }

          .benefitsInner,
          .useGrid,
          .steps {
            grid-template-columns:1fr 1fr;
          }

          .rentInner,
          .realInner {
            grid-template-columns:1fr;
            gap:38px;
          }

          .sectionHead {
            display:block;
          }

          .sectionHead > p {
            margin-top:13px;
          }

          .finalCta {
            flex-direction:column;
            align-items:flex-start;
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

          .navCta {
            padding:9px 12px;
            font-size:11px;
          }

          .heroInner {
            padding:34px 18px 42px;
            gap:35px;
          }

          .hero h1 {
            font-size:39px;
            letter-spacing:-1px;
          }

          .lead { font-size:15px; }

          .bookingBox {
            flex-direction:column;
            align-items:stretch;
          }

          .primaryButton { width:100%; }

          .heroProduct { border-radius:25px; }

          .productTag {
            right:12px;
            bottom:12px;
          }

          .benefitsInner {
            padding:20px 18px;
            grid-template-columns:1fr 1fr;
            gap:20px 12px;
          }

          .benefit {
            align-items:flex-start;
          }

          .section {
            padding:58px 18px;
          }

          .useGrid,
          .steps {
            grid-template-columns:1fr;
          }

          .rentSection,
          .realSection {
            padding:58px 18px;
          }

          .finalCta {
            padding:50px 18px;
          }

          .footer {
            flex-direction:column;
          }
        }
      `}</style>
    </main>
  );
}