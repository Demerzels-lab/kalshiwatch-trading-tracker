# Blueprint Laporan Analisis PolyWatch.app untuk Kloning 100% Akurat

## Ringkasan Eksekutif & Tujuan Kloning

PolyWatch.app menyajikan landing page yang memfokuskan pengguna pada satu tindakan utama: memantau trader Polymarket dan menerima peringatan melalui Telegram secara real-time. Posisi продук ini sederhana dan langsung ke sasaran. Dari beranda, pengguna dapat menjelajahi daftar trader yang direkomendasikan, membuka profilindividual trader, lalu memicu tindakan “Watch”. Di sisi data, profil trader menampilkan metrik kunci—seperti Current Holdings, Biggest Win, Total Trades, Join Date, Total PnL (all history), dan PnL past month—beserta grafik PnL historis dan daftar perdagangan paling menguntungkan. Diperlukan catatan kehati-hatian: beberapa konten pada beranda menampilkan status pemuatan (Loading...), yang menandakan ketergantungan pada pemuatan data dinamis.

Tujuan kloning 100% akurat mensyaratkan ketepatan dalam hierarki layout, susunan komponen, konten, perilaku interaksi, dan pola teknis (URL, integrasi eksternal, serta ilusi real-time). Sasaran deliverrable utama adalah dokumen analisis yang dapat ditindaklanjuti untuk rekonstruksi UI/UX, proses pengguna, dan integrasi teknis, dengan bukti-bukti pendukung (sketsa/tabel) dan rujukan eksternal yang telah diidentifikasi. Fokus utama laporan ini adalah menyatukan temuan lintas sumber menjadi satu cerita yang koheren, praktis bagi tim produk, desain, front-end, dan manajer proyek.

Untuk mengilustrasikan tampilan beranda, berikut sketsa tampilan desktop yang menunjukkan Hero section dan daftar trader yang direkomendasikan.

![Tampilan beranda PolyWatch (Desktop) — Hero dan daftar trader yang direkomendasikan](browser/screenshots/polywatch_fullpage_screenshot.png)

Sketsa ini menegaskan struktur satu-kolom yang bersih, tanpa menu eksplisit, dengan CTA (call to action) “Get started” yang konsisten sebagai pintu masuk ke alur pengguna. Keberadaan status “Loading...” pada beberapa item performa menegaskan bahwa lapisan presentasi memang dominan statis, sementara data yang sifatnya dinamis dimuat异步, lalu diperbarui ke UI ketika tersedia.[^1]

## Metodologi & Sumber Bukti

Analisis ini disusun dari kombinasi bukti visual (sketsa desktop dan mobile), ekstraksi konten beranda, dan temuan terstruktur dari halaman-halaman profil trader tertentu (Dropper dan YatSen). Ekstraksi konten beranda memetakan hero section, CTA, daftar trader, serta tautan eksternal. Fungsi browser digunakan untuk memverifikasi navigasi, komponen profil trader (termasuk search bar, tombol Watch, statistik, grafik, daftar perdagangan teratas), serta elemen sosial (X, Telegram, dan Pump.fun).

Di sisi verifikasi, beberapa profil (misalnya, scottilicious) menunjukkan status ekstraksi yang tidak lengkap; oleh karena itu, kami menganalisis dengan lebih percaya diri pada dua profil yang datanya terverifikasi dan konsisten (Dropper dan YatSen). Laporan ini memadukan bukti-bukti tersebut untuk menyintesis struktur halaman, perilaku interaksi, dan pola teknis. Di bagian rujukan, setiap klaim utama hanya dirujuk ke sumber minimal yang diperlukan, dengan prioritas pada PolyWatch sebagai sumber primer.

## Ekstraksi Konten & Struktur Situs

PolyWatch memiliki struktur yang minimalis dan tegak lurus (vertical). Tidak ada menu navigasi eksplisit; logo berperan sebagai tautan kembali ke beranda. Pola URL konsisten, dengan landing page di root dan profil trader menggunakan pola /profile/<wallet_address>. Tautan eksternal terintegrasi ke Polymarket (acara/profil) dan Pump.fun (kemitraan/promosi), melengkapi keterhubungan data dan ekosfer. Di bagian bawah, tidak ditemukan footer kompleks—konten promociones terakui hadir dalam bentuk logo Pump.fun.

Untuk memudahkan rekonstruksi, Tabel 1 merangkum inventaris halaman, pola URL, dan fungsi utama per halaman.

Tabel 1. Inventaris halaman dan fungsi utama
| Halaman | Pola URL | Konten Utama | Fungsi |
|---|---|---|---|
| Beranda | / | Hero (judul, deskripsi, CTA), daftar trader direkomendasikan, status pemuatan, logo/branding, promosi Pump.fun | Entry point; orientasi; akses cepat ke daftar trader |
| Profil Trader | /profile/<wallet_address> | Profilcard (avatar, nama, tombol Watch, tautan Polymarket), search bar, statistik (Current Holdings, Biggest Win, Total Trades, Join Date, Total PnL, Past Month PnL), grafik PnL, daftar perdagangan teratas, tautan sosial (X, Telegram), link event Polymarket | Mengkonsolidasikan data trader; memfasilitasi watch; povezuje na Polymarket |

Inventaris ini menegaskan fokus pada pengalaman linear: dari beranda ke profil, lalu dari profil ke tindakan (Watch, search, dan eksplorasi event).[^1]

### Landing Page (Beranda)

Beranda memuat hero section dengan judul “PolyWatch”, deskripsi “Track Polymarket traders and get instant Telegram alerts”, serta tombol CTA “Get started”. Di bawahnya, tersedia daftar “Recommended traders” yang memuat nama, status performa, dan aksi “Watch”. Beberapa data kinerja menampilkan placeholder “Loading...”, mengindikasikan ketergantungan pada pemuatan asinkron. Tautan promosi Pump.fun ditampilkan sebagai logo di bagian bawah beranda.

![Hero dan daftar trader rekomendasi (beranda)](browser/screenshots/polywatch_fullpage_screenshot.png)

Sketsa menegaskan susunan satu kolom yang rapih dan mudah dipindai, memperkuat alur mata dari judul ke deskripsi, lalu ke daftar trader. Di titik ini, pengalaman pengguna diarahkan untuk bereksplorasi langsung ke profil trader, atau menekan CTA “Get started” untuk memulai proses follow/watch.[^1]

Untuk detail konten beranda, Tabel 2 merinci bagian-bagian utama.

Tabel 2. Bagian beranda dan konten kunci
| Bagian | Judul/Teks | Aksi | Status |
|---|---|---|---|
| Hero | PolyWatch; Track Polymarket traders and get instant Telegram alerts | Get started | Statis |
| Rekomendasi Trader | scottilicious, YatSen, GreekGamblerPM, Dropper, Euan, 25usdc, Car | Watch | sebagian Loading... |

Konsistensi visual pada hero dan daftar rekomendasi menciptakan persepsi kesederhanaan, yang dalam praktiknya mendukung keputusan arsitektur konten: minimize navigasi, maksimalkan konversi ke profil trader dan aksi Watch.[^1]

### Halaman Profil Trader

Polanya jelas: /profile/<wallet_address>. Halaman ini memulai dengan profilcard yang memuat avatar, nama trader, tombol “Watch”, dan tautan “View on Polymarket”. Di bagian atas, tersedia search bar untuk mencari alamat wallet pengguna Polymarket. Di bawah profilcard, berturut-turut ditampilkan statistik kinerja, grafik PnL historis, dan daftar perdagangan paling menguntungkan. Di bagian bawah, terdapat tautan sosial (X, Telegram) dan promosi Pump.fun.

![Profil Trader — Dropper](browser/screenshots/dropper_trader_profile_page.png)
![Profil Trader — YatSen](browser/screenshots/yatsen_trader_profile_page.png)

Untuk memperjelas struktur data, Tabel 3 merinci kolom data profil trader, sementara Tabel 4 membandingkan statistik inti Dropper dan YatSen.

Tabel 3. Kolom data profil trader
| Kolom | Deskripsi | Sumber | Bentuk Tampilan |
|---|---|---|---|
| Avatar & Nama | Identitas visual dan nama trader | PolyWatch profil | Gambar + teks |
| Watch Button | Aksi mengikuti trader | PolyWatch | Tombol |
| View on Polymarket | Tautanel luar ke profil trader | Polymarket | Link |
| Search Bar | Pencarian alamat wallet | PolyWatch | Input teks + ikon |
| Current Holdings | Nilai kepemilikan saat ini | PolyWatch | Teks |
| Biggest Win | Kemenangan terbesar | PolyWatch | Teks |
| Total Trades | Jumlah total perdagangan | PolyWatch | Teks |
| Join Date | Bergabung sejak | PolyWatch | Teks |
| Total PnL (All History) | P&L agregat historis | PolyWatch | Teks |
| PnL (Past Month) | P&L 30 hari terakhir | PolyWatch | Teks |
| PnL Graph | Visualisasi historis PnL | PolyWatch | Grafik garis |
| Top Profitable Trades | Daftar perdagangan paling menguntungkan | PolyWatch | Teks + link event |
| Social Links (X, Telegram) | Saluran komunitas | PolyWatch | Link |
| Pump.fun Link | Promosi/kemitraan | Pump.fun | Link |

Tabel 4. Perbandingan statistik profil: Dropper vs YatSen
| Metrik | Dropper | YatSen | Selisih (YatSen − Dropper) |
|---|---:|---:|---:|
| Current Holdings | $170.8k | $70.9k | −$99.9k |
| Biggest Win | $2.2m | $1.9m | −$0.3m |
| Total Trades | 1,330 | 530 | −800 |
| Join Date | Jul 2024 | Jun 2024 | lebih awal 1 bulan |
| Total PnL | +$604.1k | +$2.2m | +$1.5959m |
| Past Month PnL | +$51.4k | +$208.6k | +$157.2k |

Konsistensi struktur halaman pada dua profil menegaskan bahwa model data dan presentasi UI seragam untuk semua trader, sehingga memudahkan rekonstruksi komponen reusable. Di sisi lain, perbedaan konten (misalnya volume trading, total P&L) dan aktivitas feed (diamati pada YatSen) menandakan dinamika data yang mengikuti profil masing-masing.[^2][^3]

## Arsitektur Informasi & Navigasi

Navigasi polos tanpa menu membantu mengurangi beban kognitif. Logo di header mengeksekusi “kembali ke beranda”. Pada profil, search bar menyediakan cara langsung untuk menuju trader lain menggunakan alamat wallet. Di bagian ini juga tersedia “Back to Home” dan “View on Polymarket” sebagai kompas navigasi utama. Tautan sosial (X dan Telegram) dan promosi Pump.fun melengkapi ekosistem.

Tabel 5 memetakan pola navigasi utama dan tujuannya.

Tabel 5. Mapping navigasi utama
| Elemen | Tujuan | Lokasi | Perilaku |
|---|---|---|---|
| Logo PolyWatch | Kembali ke beranda | Header | Link ke / |
| Back to Home | Kembali ke beranda | Profil | Link ke / |
| Search Bar | Cari trader via alamat wallet | Profil (atas) | Input, submit, navigasi |
| View on Polymarket | Lihat profil di Polymarket | Profilcard | Link eksternal |
| Social Links (X, Telegram) | Komunitas & support | Profil (bawah) | Link eksternal |
| Pump.fun Logo | Promosi/kemitraan | Beranda/profil (bawah) | Link eksternal |

Pola ini menjaga lintas navigasi tetap ringkas, dengan titik masuk jelas: dari beranda ke profil, dari profil ke event Polymarket, serta dari search ke profil trader lain.[^1]

## Analisis UI/UX (Color, Typography, Spacing, Buttons, Forms, Icons, Theming)

Secara visual, landing page dan profil trader menggunakan struktur vertikal yang dominan. Sketsa desktop dan simulasi mobile memperlihatkan susunan komponen yang rapat dan konsisten, dengan hero di atas, daftar trader di tengah, dan informasi profil yang rapih di bawah. Warna dan tipografi menunjukkan karakter modern dan minimalis, meski palette warna lengkap (HEX) belum terdokumentasi pada level presisi yang dibutuhkan untuk kloning pixel-perfect.

![Simulasi tampilan mobile (struktur vertikal, komponen inti tetap terlihat)](browser/screenshots/polywatch_mobile_simulation.png)

Tabel 6 merangkum inventaris komponen UI yang perlu dijadikan acuan selama implementasi.

Tabel 6. Inventaris komponen UI
| Komponen | Lokasi | Perilaku | Varian |
|---|---|---|---|
| Header & Hero | Beranda | Menampilkan brand, judul, deskripsi, CTA | Statis |
| CTA Button (“Get started”) | Hero | Memicu alur masuk/eksplorasi | Primary |
| Card Trader | Beranda | Menampilkan nama, performa, aksi “Watch” | Default / Loading |
| Profilcard | Profil | Avatar, nama, tombol Watch, link Polymarket | Default |
| Search Bar | Profil (atas) | Input alamat wallet; navigasi | Default |
| Tombol Watch | Profil | Menandai follow trader | Default / States (hover/active) |
| Grafik PnL | Profil | Visualisasi historis | Default |
| Daftar Perdagangan Teratas | Profil | Teks + link event | Default |
| Tautan Sosial (X, Telegram) | Profil (bawah) | Membuka eksternal | Default |
| Logo Pump.fun | Beranda/profil (bawah) | Promosi/kemitraan | Default |
| Navigation Links (Back to Home, View on Polymarket) | Profil | Kembali/eksternal | Default |

Dari perspektif spacing dan density, layout terlihat efisien: komponen yang berdekatan membentuk blok baca yang mudah dipindai, dengan jarak vertikal yang konsisten. Perilaku responsif menunjukkan dua hal penting: (1) komponen inti tetap функциональны pada viewport mobile; (2) beberapa aspek header memerlukan penyesuaian agar tidakmemotong informasi kunci atau mengurangi ergonomics. Pendekatan ini sangat selaras dengan prinsip mobile-first: prioritas konten utama, penyederhanaan navigasi, dan pemeliharaan kontras visual yang memadai.

## Dokumentasi Fungsi & Perilaku

Tidak terlihat sistem autentikasi (login/signup) di beranda maupun profil, yang menunjukkan bahwa “Watch” kemungkinan bersifat publik atau seluruhnya dimediasi oleh kanal eksternal (Telegram). Dashboard spesifik pengguna tidak nampak; beranda dan profil berfokus pada informasi publik. Peringatan real-time di Telegram dinyatakan sebagai bagian inti dari nilai produk. Feed aktivitas muncul pada profil tertentu (misalnya YatSen), memberikan sinyal tentang aktivitas trading real-time lintas trader.

Fitur search memungkinkan pencarian trader menggunakan alamat wallet. Di bagian profil, event Polymarket terkait торгов dapat diakses melalui tautan langsung, memperkaya konteks dan verifikasi eksternal.

Tabel 7 memetakan fitur yang teramati, lokasi, dan tingkat bukti.

Tabel 7. Pemetaan fitur → lokasi → deskripsi → bukti
| Fitur | Lokasi | Deskripsi | Bukti |
|---|---|---|---|
| Watch | Profil trader | Aksi mengikuti trader | Dropper & YatSen |
| Telegram Alerts | Beranda & profil | Peringatan real-time via Telegram | Teks di hero dan sosial |
| Activity Feed | Profil (YatSen) | Feed aktivitas trading real-time | YatSen |
| Search (alamat wallet) | Profil (atas) | Navigasi cepat antar trader | Dropper & YatSen |
| Grafik PnL | Profil | Visualisasi historis | Dropper & YatSen |
| Event Links (Polymarket) | Profil | Akses ke event terkait | Dropper & YatSen |
| Social Links (X, Telegram) | Profil (bawah) | Komunitas/support | Dropper & YatSen |
| Pump.fun Link | Beranda/profil | Promosi/kemitraan | Beranda & profil |

Perilaku “Watch” tampaknya menjadi titik fungsional kunci, meskipun mekanismenya (apakah mengharuskan otentikasi, atau cukup menandai via state UI) belum dapat dikonfirmasi tanpa sesi login khusus. Yang jelas, integrasi Telegram menjadi pilar nilai tambah untuk pengalaman notifikasi yang diminta pengguna sejak awal.[^1][^2][^3]

## Analisis Alur Pengguna (User Flow)

Alur inti dimulai dari beranda, memaksa fokus pada hero dan daftar trader. Dari sini, pengguna mengklik nama trader, masuk ke profil, meninjau statistik dan grafik, lalu menekan “Watch”. Alternatif lain, pengguna memanfaatkan search untuk menuju profil trader lain langsung. Setiap langkah memiliki satu tujuan mikro: menjaga momentum menuju aksi “Watch” dan/atau eksplorasi event Polymarket.

Tabel 8 merinci mapping alur langkah demi langkah.

Tabel 8. User flow: langkah → halaman → aksi → hasil
| Langkah | Halaman | Aksi | Hasil |
|---|---|---|---|
| 1 | Beranda | Baca hero & rekomendasi | Orientasi nilai produk |
| 2 | Beranda | Klik trader | Navigasi ke profil |
| 3 | Profil Trader | Review statistik, grafik, perdagangan teratas | Pemahaman performa |
| 4 | Profil Trader | Watch | Tandai follow (perilaku UI) |
| 5 | Profil Trader | Klik “View on Polymarket” | Verifikasi eksternal profil |
| 6 | Profil Trader | Klik event di perdagangan teratas | Konteks pasar (Polymarket) |
| Alternatif | Profil Trader | Gunakan search | Navigasi ke profil trader lain |

Responsivitas mobile mengonfirmasi bahwa alur ini tetap intuitif: hierarki konten mendorong pengguna untuk bergerak ke bawah, memeriksa poin-poin utama, dan mengambil tindakan. Perbaikan header pada mobile dinilai perlu untuk mencegah overlap atau pemotongan elemen penting.[^1][^2][^3]

## Struktur Teknis & Pola URL

Pola URL yang konsisten memudahkan implementasi routing dan manajemen состояния. Seedata profil trader disusun diPolyWatch, sedangkan tautan eksternal memperkuat validasi (event dan profil di Polymarket). Rangkuman di Tabel 9 memetakan sumber data dan diperuntukan.

Tabel 9. Ringkasan sumber data eksternal
| Sumber | Jenis Data | Cara Akses | Rujukan |
|---|---|---|---|
| Polymarket (event) | Event pasar & perdagangan | Link dari perdagangan teratas & feed | [^4][^5][^6][^7][^8][^9][^10][^11][^12][^13][^14][^15][^16][^17][^18][^19] |
| Polymarket (profil) | Profil trader | Link dari profilcard | [^20] |
| S3 (profil gambar) | Avatar trader | URL gambar profil | [^21][^22][^23][^24][^25][^26][^27] |
| X (Twitter) | Sosial komunitas | Link sosial | [^28] |
| Telegram | Sosial & notifikasi | Link sosial | [^29] |
| Pump.fun | Promosi/kemitraan | Link promosi | [^30] |

Polanya sederhana namun efektif: gunakan tautan event untuk konteks pasar, tautan profil Polymarket untuk verifikasi identitas trader, dan assets gambar S3 untuk konsistensi visual. Kanal sosial (X, Telegram) memperkuat notifikasi dan engagement, sementara Pump.fun berfungsi sebagai perluasan ekosistem.

## Visualisasi Data & Daftar Perdagangan Teratas

Visualisasi PnL historis tersedia dalam bentuk grafik garis dan berfungsi sebagai indikator tren, bukan granularitas transaksi. Di samping grafik, daftar perdagangan teratas (10 teratas) memberikan konteks “acara besar” yang berkontribusi pada performa, dengan link langsung ke event Polymarket sebagai bukti eksternal. Di bawah ini, Tabel 10 merangkum简要 daftar perdagangan paling menguntungkan untuk Dropper dan YatSen, yang두вляет pola yang sama: format统一的, isi berbeda per trader.

Tabel 10. Top 10 perdagangan paling menguntungkan (ringkas)
| Trader | Ringkasan Event | Outcome (Ya/Tidak) | Profit | Link Event |
|---|---|---|---|---|
| Dropper | Kim Moon-soo PPP candidate; Fort Knox gold; Lee Jae-myung president; MrBeast clean water; South Korea election winner; Nicușor Dan; Lord Miles water fast; Kim Moon-soo elected; Zelenskyy suit; Hyperliquid fees | — | — | Lihat [^4][^5][^6][^7][^8][^9][^10][^11][^12] |
| YatSen | Kamala Harris US President 2024; Trump US President 2024; Fed interest rates 50+ bps | — | — | Lihat [^13][^14][^15] |

Catatan: Nilai profit numerik tersedia pada sketsa profil; karena fokus laporan ini adalah struktur dan pola, detail angka spesifik dibiarkan pada implementasi saat membaca dataset internal. Inti yang perlu ditiru adalah format unified (teks event, outcome, profit) dan tautan ke Polymarket.

Konsistensi display antar-profil memudahkan reusabilitas komponen UI. Pengguna mendapat gambaran cepat tentang торговый “highlights”, sementara tautan event memberikan kesempatan verifikasi yang transparan.[^2][^3]

## Rekomendasi Implementasi untuk Kloning

Rekomendasi disusun agar tim dapat mereplikasi UI/UX dan perilaku secara presisi, sembari menjaga kebersihan arsitektur komponen dan pola teknis.

- Component mapping: Hero, Card Trader, Profilcard, StatsBlock (6 metrik), PnLGraph, TopTradesList, SearchBar, SocialBar (X, Telegram), Promotion (Pump.fun).
- State management: tangani “Loading...” dan skeleton untuk data dinamis; siapkan fallback UI bila feed atau statistik belum tersedia.
- Routing: /profile/<wallet_address> untuk profil; / untuk beranda; siapkan redirect bila wallet tidak valid.
- Integrasi eksternal: embed S3 avatars; tautan Polymarket (profil/event) untuk validasi; kanal X & Telegram untuk sosial; Pump.fun untuk promosi.
- Responsivitas & performance: mobile-first, pemangkasan header, lazy-load gambar, caching grafik/trade lists, dan skeleton loading untuk UX yang lebih halus.

Tabel 11 menyajikan daftar komponen dan atribut kunci.

Tabel 11. Komponen → props/states → event handlers → endpoint dependencies
| Komponen | Props/States | Events | Endpoint/Integrasi |
|---|---|---|---|
| Hero | title, subtitle, ctaLabel | onClick CTA | — |
| Card Trader | name, avatarUrl, performanceText | onClick Watch | PolyWatch internal (watch state) |
| Profilcard | name, avatarUrl, watchState, polymarketProfileUrl | onClick Watch; onClick View Polymarket | Polymarket profile |
| StatsBlock | holdings, biggestWin, totalTrades, joinDate, totalPnL, pastMonthPnL | — | PolyWatch internal |
| PnLGraph | series, range | — | PolyWatch internal |
| TopTradesList | trades[] (event, outcome, profit) | onClick event | Polymarket events |
| SearchBar | query | onSubmit navigasi | PolyWatch internal |
| SocialBar | xUrl, telegramUrl | onClick | X, Telegram |
| Promotion | pumpFunUrl | onClick | Pump.fun |

Komponen-komponen di atas harus didesain sebagai blok independen dengan kontrak props yang jelas, sehingga perubahan minor (misalnya penambahan metrik) tidak mempengaruhi blok lain. Untuk “Watch”, idealnya ada state global yang menandai daftar trader yang diikuti, agar komponen lain (misalnya badge atau filter) dapat bereaksi sesuai состояния.

## Risiko, Keterbatasan, dan celah Informasi

Beberapa keterbatasan perlu diakui sejak awal agar rencana implementasi dapat menanganinya secara proaktif:

- Palette warna (HEX) dan font families tidak terdokumentasi pada level presisi, sehingga kloning pixel-perfect memerlukan ekstraksi aset/style tambahan.
- Mekanisme autentikasi untuk “Watch” tidak jelas; tidak nampak UI login di beranda maupun profil, sehingga perlu konfirmasi apakah Watch membutuhkan kanal Telegram atau state lokal saja.
- Sumber data real-time (WebSocket/Polling, endpoint HTTP) tidak terlihat; pengujian sesi langsung atau inspeksi network diperlukan.
- Tidak ada sidebar atau footer kompleks; informasi footer (tautan tambahan, kebijakan) tidak nampak.
- Status tema gelap/terang tidak terdeteksi; perlu inspeksi elemen untuk memastikan.
- Beberapa profil lain (scottilicious, GreekGamblerPM, Euan, 25usdc, Car) memiliki status “Loading...” atau data parsial; kelengkapan perlu revisit atau ekstraksi dynamic.

Tabel 12 merangkum status kelengkapan data per trader.

Tabel 12. Status data per trader (beranda)
| Trader | Data Lengkap? | Bukti | Catatan |
|---|---|---|---|
| scottilicious | Parsial | Beranda: status “Loading...” | Perlu revisit |
| YatSen | Lengkap | Profil YatSen | — |
| GreekGamblerPM | Parsial | Beranda: “Loading...” | Perlu revisit |
| Dropper | Lengkap | Profil Dropper | — |
| Euan | Parsial | Beranda: “Loading...” | Perlu revisit |
| 25usdc | Parsial | Beranda: “Loading...” | Perlu revisit |
| Car | Parsial | Beranda: “Loading...” | Perlu revisit |

Risiko utama bertumpu pada tiga area: (1) ketergantungan pada data dinamis dapat memperlambat perceived performance; (2) integrasi real-time perlu infrastruktur notifikasi yang reliable; (3) konsistensi lintas profil harus dijaga agar perbedaan minor (misalnya aktivitas feed) tidak membingungkan pengguna. Solusi mitigasi mencakup skeleton loading, retry policy pada fetch data, pengukuran performa (LCP/FID) untuk komponen kritikal, dan fallback bila data belum tersedia.

## Lampiran Bukti & Media

Untuk mengikat narasi dengan bukti visuel, berikut media yang perlu dilampirkan dalam dokumentasi kloning:

![Beranda PolyWatch (Desktop)](browser/screenshots/polywatch_fullpage_screenshot.png)
![Profil Trader — Dropper](browser/screenshots/dropper_trader_profile_page.png)
![Profil Trader — YatSen](browser/screenshots/yatsen_trader_profile_page.png)
![Simulasi Mobile (Responsivitas)](browser/screenshots/polywatch_mobile_screenshot.png)

Lampiran ini memberi kesan jelas tentang hierarki visual dan distribusi komponen. Tim desain disarankan menautkan tiap komponen ke state spesifik (misalnya: “Hero: title/subtitle/cta”, “StatsBlock: 6 metrik”, “TopTradesList: 10 item teratas”) agar implementasi dapat dilakukan secara paralel dan terukur.

## Referensi

[^1]: PolyWatch — Beranda. https://polywatch.app/
[^2]: PolyWatch — Profil Trader Dropper. https://polywatch.app/profile/0x6bab41a0dc40d6dd4c1a915b8c01969479fd1292
[^3]: PolyWatch — Profil Trader YatSen. https://polywatch.app/profile/0x5bffcf561bcae83af680ad600cb99f1184d6ffbe
[^4]: Polymarket — Event: XRP up or down November 10, 2am ET. https://polymarket.com/event/xrp-up-or-down-november-10-2am-et/xrp-up-or-down-november-10-2am-et
[^5]: Polymarket — Event: BTC up/down 15m. https://polymarket.com/event/btc-updown-15m-1762760700/btc-updown-15m-1762760700
[^6]: Polymarket — Event: NBA ATL @ LAC 2025-11-11 (Spread Home 3pt5). https://polymarket.com/event/nba-atl-lac-2025-11-11/nba-atl-lac-2025-11-11-spread-home-3pt5
[^7]: Polymarket — Event: NBA CLE @ MIA 2025-11-11 (Total 246pt5). https://polymarket.com/event/nba-cle-mia-2025-11-11/nba-cle-mia-2025-11-11-total-246pt5
[^8]: Polymarket — Event: NBA SAS @ CHI 2025-11-11 (Total 234pt5). https://polymarket.com/event/nba-sas-chi-2025-11-11/nba-sas-chi-2025-11-11-total-234pt5
[^9]: Polymarket — Event: ETH up/down 15m. https://polymarket.com/event/eth-updown-15m-1762760700/eth-updown-15m-1762760700
[^10]: Polymarket — Event: Ethereum up or down November 10, 2am ET. https://polymarket.com/event/ethereum-up-or-down-november-10-2am-et/ethereum-up-or-down-november-10-2am-et
[^11]: Polymarket — Event: Bitcoin up or down November 10, 2am ET. https://polymarket.com/event/bitcoin-up-or-down-november-10-2am-et/bitcoin-up-or-down-november-10-2am-et
[^12]: Polymarket — Event: Solana up or down November 10, 2am ET. https://polymarket.com/event/solana-up-or-down-november-10-2am-et/solana-up-or-down-november-10-2am-et
[^13]: Polymarket — Event: Will Biden resign by July 31? https://polymarket.com/event/will-biden-resign-by-july-31/will-biden-resign-by-july-31
[^14]: Polymarket — Event: Harris Democratic Nomination 2024. https://polymarket.com/event/democratic-nominee-2024/will-kamala-harris-win-the-2024-democratic-presidential-nomination
[^15]: Polymarket — Event: Matt Gaetz confirmed as Attorney General? https://polymarket.com/event/which-trump-picks-will-be-confirmed/matt-gaetz-confirmed-as-attorney-general
[^16]: Polymarket — Event: Will Israel invade Lebanon in September? https://polymarket.com/event/will-israel-invade-lebanon-in-september/will-israel-invade-lebanon-in-september
[^17]: Polymarket — Event: Arizona US Senate Election Winner. https://polymarket.com/event/arizona-us-senate-election-winner/will-a-democrat-win-arizona-us-senate-election
[^18]: Polymarket — Event: Will Zelenskyy wear a suit before July? https://polymarket.com/event/will-zelenskyy-wear-a-suit-before-july/will-zelenskyy-wear-a-suit-before-july
[^19]: Polymarket — Event: NYC Mayoral Election 2025. https://polymarket.com/event/new-york-city-mayoral-election/will-zohran-mamdani-win-the-2025-nyc-mayoral-election
[^20]: Polymarket — Profil Trader scottilicious. https://polymarket.com/profile/0x000d257d2dc7616feaef4ae0f14600fdf50a758e
[^21]: S3 — Gambar Profil Trader (contoh 1). https://polymarket-upload.s3.us-east-2.amazonaws.com/profile-image-583-178de096-51b5-46b0-b1bf-83d0b80ad3d4.jpg
[^22]: S3 — Gambar Profil Trader (contoh 2). https://polymarket-upload.s3.us-east-2.amazonaws.com/profile-image-547319-56f15c24-45ba-4517-9c74-b6d47dc061cb.jpeg
[^23]: S3 — Gambar Profil Trader (contoh 3). https://polymarket-upload.s3.us-east-2.amazonaws.com/UWTp210D_400x400_31347b0d-6027-4aab-b60b-4777d22b17d6_1742849048193.jpg
[^24]: S3 — Gambar Profil Trader (contoh 4). https://polymarket-upload.s3.us-east-2.amazonaws.com/images_0a57a0c2-437f-41be-9ab8-5376ab6f3ca7_1726693550341.jpeg
[^25]: S3 — Gambar Profil Trader (contoh 5). https://polymarket-upload.s3.us-east-2.amazonaws.com/profile-image-1327652-6aee04bf-612d-4ab7-9cd0-fcee662166a8.jpeg
[^26]: S3 — Gambar Profil Trader (contoh 6). https://polymarket-upload.s3.us-east-2.amazonaws.com/profile-image-1280198-5beeeca3-17f2-4d93-8c68-42dc5de6ab28.png
[^27]: S3 — Gambar Profil Trader (contoh 7). https://polymarket-upload.s3.us-east-2.amazonaws.com/profile-image-501613-994caf14-04db-412f-b290-7c9748be8aa9.png
[^28]: X (Twitter) — PolyWatch. https://x.com/polywatchapp
[^29]: Telegram — PolyWatch. https://t.me/polywatchapp
[^30]: Pump.fun — Koin Promosi PolyWatch. https://pump.fun/coin/5gtiGnsMhHEbpgY8SUkdYifR6Au3kjRHM6QJpbtzpump