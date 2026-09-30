# Backend kupon reward

> Catatan: deploy yang sekarang dipilih adalah mode statis tanpa backend. Ikuti [DEPLOY-VERCEL.md](DEPLOY-VERCEL.md). Panduan ini hanya dipakai kembali jika backend diaktifkan.

## Deploy ke Vercel

Project menyediakan Vercel Functions di folder `api/` dan PostgreSQL melalui Neon. Vercel Functions tidak memakai file SQLite lokal sebagai penyimpanan persisten; klaim kupon production disimpan di database PostgreSQL.

1. Push project ke GitHub, lalu import repo itu di Vercel. Gunakan root project ini sebagai Root Directory.
2. Di Vercel Marketplace, buat dan hubungkan database Neon/Postgres ke project. Pastikan connection string tersedia sebagai `DATABASE_URL` atau `POSTGRES_URL`.
3. Di **Project Settings → Environment Variables**, tambahkan `MACBOOM_ADMIN_TOKEN` dengan secret acak baru. Pilih environment Production (dan Preview jika perlu); jangan pakai token lokal.
4. Deploy dengan Build Command `npm run build` dan Output Directory `dist`. Vercel akan mengenali fungsi backend di `api/`.
5. Setelah deploy, buka `https://<domain>/api/health`. Hasil sukses adalah `{"ok":true}`. Jika gagal, periksa environment connection string serta Function Logs.
6. Masukkan setiap URL kupon ke database production memakai endpoint admin di bawah ini. Database `data/macboom.sqlite` di komputer lokal dan link yang pernah dimasukkan ke sana **tidak** ikut terdeploy.

Vercel Marketplace menghubungkan database eksternal seperti Neon/Postgres dan memasukkan credential ke environment project. Fungsi Node.js di folder `/api` menjadi Vercel Functions. Lihat [Vercel Functions](https://vercel.com/docs/functions/runtimes/node-js), [storage Marketplace](https://vercel.com/docs/marketplace-storage), dan [Vite di Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## Jalankan lokal

Perlu Node.js 22 atau lebih baru. Backend menggunakan SQLite di `data/macboom.sqlite`.

1. Atur token admin di PowerShell (ganti dengan rahasia acak yang panjang):

   ```powershell
   $env:MACBOOM_ADMIN_TOKEN = "ganti-dengan-token-acak-panjang"
   ```

2. Terminal pertama: `npm run server` (API di port 3000).
3. Terminal kedua: `npm run dev` (frontend Vite; `/api` diteruskan ke backend).

Untuk deploy satu server, jalankan `npm run build`, lalu `npm start`. Atur `PORT`, `MACBOOM_ADMIN_TOKEN`, dan `MACBOOM_DB_FILE` melalui environment platform. Simpan direktori database pada disk persisten dan gunakan HTTPS.

## Masukkan link kupon

Buat DANA Kaget atau Saldo Kaget ShopeePay di aplikasi resminya. Satu link biasanya bisa diklaim banyak penerima sampai kuotanya habis. Untuk kontrol jumlah klaim di website secara ketat, masukkan link unik satu per penerima/kupon. Jangan menaruh link mentah di kode frontend atau repo.

Contoh PowerShell untuk mengimpor link:

```powershell
$headers = @{ Authorization = "Bearer $env:MACBOOM_ADMIN_TOKEN" }
$body = @{ rewardId = "dana"; batch = "dana-september"; links = @("https://link.dana.id/ISI-LINK-RESMI-1", "https://link.dana.id/ISI-LINK-RESMI-2") } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/admin/coupons -Headers $headers -ContentType "application/json" -Body $body
```

Untuk production, ganti URL localhost dengan `https://<domain-vercel>/api/admin/coupons`, lalu isi `$env:MACBOOM_ADMIN_TOKEN` dengan token production dari Vercel. Jalankan contoh itu di komputer admin saja; token admin jangan dikirim ke browser atau dimasukkan ke variabel frontend berawalan `VITE_`.

Ganti `rewardId` dengan `shopee` untuk kupon ShopeePay. API menyimpan kupon, menghitung sisa kuota, memberi hanya satu kupon untuk pengguna/reward, dan mengalokasikannya dalam transaksi SQLite atomik agar dua klaim bersamaan tidak mengambil kupon yang sama. Pengguna membuka link dari bagian riwayat reward.

## Batasan sebelum peluncuran publik

Versi ini melindungi inventori dan klaim kupon di server. Identitas pengguna saat ini berupa ID anonim browser dan saldo Boom Points masih berasal dari penyimpanan lokal aplikasi. Itu cukup untuk uji alur/demo, tetapi bukan bukti identitas maupun poin yang aman untuk hadiah bernilai nyata. Sebelum kampanye publik, hubungkan login/OTP, pindahkan ledger poin ke backend, dan verifikasi QR/aktivitas di server. Jangan menerima nominal poin dari klien sebagai otorisasi final. Terapkan pula syarat promo, batas per akun, dan prosedur penanganan link kedaluwarsa.

Implementasi Vercel memakai database Postgres untuk alokasi kupon atomik. Backend menerima nilai poin dari browser hanya sebagai pemeriksaan awal; sebelum hadiah sungguhan dibuka ke publik, pindahkan validasi serta pemotongan poin ke ledger di server.

Database kupon berisi tautan penukaran bernilai uang. Batasi akses admin, jangan commit database atau token ke Git, dan hapus kupon yang sudah kedaluwarsa melalui prosedur admin/operasional.
