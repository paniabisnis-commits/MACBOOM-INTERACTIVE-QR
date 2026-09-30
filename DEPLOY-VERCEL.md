# Deploy statis Macboom ke Vercel

Mode ini tidak menjalankan backend. Saat pengguna menukar DANA Kaget atau ShopeePay Kaget, situs mengurangi poin yang tersimpan di browser, membuka tautan hadiah secara langsung, dan menyimpan riwayat lokal.

## Langkah deploy

1. Push folder project ke GitHub.
2. Import repository di Vercel dan pilih framework **Vite**.
3. Gunakan Build Command `npm run build` dan Output Directory `dist` (sudah ditetapkan di `vercel.json`).
4. Deploy. Tidak perlu membuat environment variable database atau token admin untuk mode statis.
5. Buka URL deployment dan coba klaim. Pastikan tautan DANA dan ShopeePay membuka aplikasi/halaman resmi.

## Batas mode statis

- Kedua tautan ada di file JavaScript publik website. Pengunjung dapat menemukannya tanpa menukar poin.
- Poin dan riwayat hanya tersimpan di browser pengguna; dapat diubah atau dihapus.
- Kuota tidak diperiksa atau dibatasi oleh website. Penerima saldo mengikuti kuota yang dibuat pada link DANA/ShopeePay dan siapa cepat dia dapat.
- Jangan menampilkan saldo reward atau janji hadiah melebihi kuota yang tersedia. Buat tautan baru di aplikasi resmi saat kuota habis.

Vercel mengabaikan folder `api/`, `server/`, dan `lib/` pada deploy ini melalui `.vercelignore`, sehingga endpoint klaim tidak dijalankan.
