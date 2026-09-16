import { useState } from 'react'

const Icon = ({ name, size = 22 }) => {
  const icons = {
    star: '★', gift: '✦', play: '▶', arrow: '→', check: '✓', close: '×', fire: '✷', menu: '☰', spark: '✺', bolt: 'ϟ'
  }
  return <span aria-hidden="true" style={{ fontSize: size }}>{icons[name]}</span>
}

function Header({ onReview }) {
  return <header className="header">
    <a className="logo" href="#home" aria-label="Macboom home"><span>mac</span>boom<i>.</i></a>
    <nav><a href="#cara-kerja">Cara kerja</a><a href="#hadiah">Rewards</a><button onClick={onReview}>Beri review</button></nav>
  </header>
}

function ProductVisual() {
  return <div className="product-stage" aria-label="Ilustrasi kemasan Macboom">
    <div className="orbit orbit-one" /><div className="orbit orbit-two" />
    <span className="floating-chip chip-one">✦</span><span className="floating-chip chip-two">✷</span>
    <div className="packet"><div className="packet-top" /><div className="packet-brand">mac<span>boom</span><sup>®</sup></div><div className="packet-label">MAKARONI<br /><strong>SAUS PEDAS</strong></div><div className="packet-bowl"><span>〰</span><span>〰</span><span>〰</span></div><div className="packet-bottom">RASA JUARA <b>•</b> 100% NAGIH</div></div>
    <div className="scan-badge"><div className="qr-mini"><i/><i/><i/><i/><i/></div><span>SCAN ME!</span></div>
  </div>
}

function StepCard({ number, icon, title, text, color }) {
  return <article className={`step-card ${color}`}><div className="step-number">0{number}</div><div className="step-icon"><Icon name={icon} size={26} /></div><h3>{title}</h3><p>{text}</p></article>
}

function ReviewModal({ onClose }) {
  const [rating, setRating] = useState(0)
  const [sent, setSent] = useState(false)
  const submit = (event) => { event.preventDefault(); if (rating) setSent(true) }
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Beri review Macboom"><div className="review-modal"><button className="close" onClick={onClose}><Icon name="close" /></button>{sent ? <div className="thanks"><div className="thanks-icon">✓</div><h2>Terima kasih!</h2><p>Review kamu sudah masuk. Poin Boom kamu sedang ditambahkan.</p><button className="dark-button" onClick={onClose}>Mantap!</button></div> : <form onSubmit={submit}><span className="eyebrow">REVIEW MACBOOM</span><h2>Gimana rasa Macboom-mu?</h2><p className="modal-copy">Pendapatmu bikin Macboom jadi makin juara.</p><div className="stars" aria-label="Pilih rating">{[1,2,3,4,5].map(n => <button type="button" key={n} className={n <= rating ? 'selected' : ''} onClick={() => setRating(n)} aria-label={`${n} bintang`}>★</button>)}</div><textarea placeholder="Ceritakan pengalamanmu..." required /><button className="dark-button" type="submit">Kirim review <Icon name="arrow" /></button></form>}</div></div>
}

function App() {
  const [reviewOpen, setReviewOpen] = useState(false)
  const [gamePlayed, setGamePlayed] = useState(false)
  return <main id="home">
    <Header onReview={() => setReviewOpen(true)} />
    <section className="hero">
      <div className="hero-copy"><p className="kicker"><span /> MAKAN ENAK, DAPAT LEBIH</p><h1>Scan.<br /><em>Play.</em> Repeat.</h1><p className="hero-text">Setiap bungkus Macboom punya kejutan. Scan QR-nya, mainkan gamenya, dan kumpulkan reward-mu!</p><div className="hero-actions"><a href="#cara-kerja" className="primary-button">Mulai petualangan <Icon name="arrow" /></a><button className="text-button" onClick={() => setReviewOpen(true)}>Beri review <Icon name="star" size={17} /></button></div><div className="social-proof"><div className="avatars"><b>R</b><b>A</b><b>N</b><b>+</b></div><span><strong>12.8K+</strong> Boomers sudah ikut!</span></div></div>
      <ProductVisual />
      <div className="scroll-note"><span /> SCROLL UNTUK MENJELAJAH</div>
    </section>
    <section className="how" id="cara-kerja"><div className="section-heading"><div><p className="kicker orange"><span /> GAMPANG BANGET</p><h2>Cuma 3 langkah<br />buat dapet <em>boom!</em></h2></div><p>Bungkus Macboom bukan cuma buat ngemil. Ada pengalaman seru yang nungguin kamu di dalamnya.</p></div><div className="steps"><StepCard number="1" icon="spark" title="Scan QR-nya" text="Arahkan kamera ke QR code di kemasan Macboom." color="yellow" /><StepCard number="2" icon="play" title="Main & review" text="Coba mini game seru atau kasih ulasan jujur kamu." color="orange" /><StepCard number="3" icon="gift" title="Klaim reward" text="Kumpulkan poin dan tukar dengan hadiah pilihanmu." color="purple" /></div></section>
    <section className="play-section"><div className="game-card"><div className="game-copy"><p className="kicker light"><span /> MINI GAME</p><h2>{gamePlayed ? 'BOOM! Kamu hebat.' : 'Siap pecahkan rekor?'}</h2><p>{gamePlayed ? 'Kamu mendapat 50 Boom Points. Lanjutkan scan kemasan lainnya untuk mengumpulkan lebih banyak!' : 'Tantang dirimu di Macboom Crunch Rush. Makin cepat, makin banyak poin!'}</p><button className="cream-button" onClick={() => setGamePlayed(true)}>{gamePlayed ? 'Dapatkan hadiah' : 'Main sekarang'} <Icon name="arrow" /></button></div><div className="game-graphic"><div className="score"><small>SKOR TERTINGGI</small><strong>{gamePlayed ? '2.450' : '1.280'}</strong><span><Icon name="fire" /> 12 hari berturut-turut</span></div><div className="game-disc">✦<span>CRUNCH<br />RUSH</span></div></div></div></section>
    <section className="rewards" id="hadiah"><div className="reward-copy"><p className="kicker orange"><span /> BOOM POINTS</p><h2>Ngemilnya dapat,<br /><em>hadiahnya</em> juga dapat.</h2><p>Setiap aktivitas bikin poinmu bertambah. Tukarkan dengan reward yang kamu suka!</p><a href="#hadiah" className="primary-button">Lihat semua reward <Icon name="arrow" /></a></div><div className="reward-grid"><div className="reward-item sticker"><span className="points">2.500 PTS</span><div>☄</div><h3>Sticker pack</h3></div><div className="reward-item hoodie"><span className="points">15.000 PTS</span><div>♜</div><h3>Macboom hoodie</h3></div><div className="reward-item voucher"><span className="points">5.000 PTS</span><div>Rp</div><h3>Voucher jajan</h3></div></div></section>
    <footer><a className="logo" href="#home"><span>mac</span>boom<i>.</i></a><p>Teman ngemil paling <b>boom!</b></p><div><a href="#home">Instagram</a><a href="#home">TikTok</a><a href="#home">Kontak</a></div><small>© 2025 Macboom. Dibuat untuk para pecinta rasa.</small></footer>
    {reviewOpen && <ReviewModal onClose={() => setReviewOpen(false)} />}
  </main>
}

export default App
