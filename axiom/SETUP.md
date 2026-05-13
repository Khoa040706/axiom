# ≡ƒÜÇ H╞»ß╗ÜNG Dß║¬N C├ÇI ─Éß║╢T & CHß║áY AXIOM HRM ΓÇö Tß╗½ A ─æß║┐n Z

> **Dß╗▒ ├ín:** AXIOM ΓÇö Hß╗ç thß╗æng Quß║ún l├╜ Nh├ón sß╗▒ & Tiß╗ün l╞░╞íng  
> **Tech Stack:** Next.js 16 ┬╖ React 19 ┬╖ TypeScript ┬╖ PostgreSQL 17 ┬╖ Prisma 7 ┬╖ NextAuth v5  
> **Nh├│m:** 52400017 ΓÇô 52400133 ΓÇô 52400004  
> **Cß║¡p nhß║¡t:** 28/04/2026

---

## ≡ƒôï Mß╗Ñc lß╗Ñc

1. [Y├¬u cß║ºu hß╗ç thß╗æng](#-1--y├¬u-cß║ºu-hß╗ç-thß╗æng)
2. [C├ái ─æß║╖t c├┤ng cß╗Ñ](#-2--c├ái-─æß║╖t-c├┤ng-cß╗Ñ)
3. [Clone dß╗▒ ├ín & C├ái dependencies](#-3--clone-dß╗▒-├ín--c├ái-dependencies)
4. [Khß╗ƒi ─æß╗Öng Database (Docker)](#-4--khß╗ƒi-─æß╗Öng-database-docker)
5. [Cß║Ñu h├¼nh biß║┐n m├┤i tr╞░ß╗¥ng (.env)](#-5--cß║Ñu-h├¼nh-biß║┐n-m├┤i-tr╞░ß╗¥ng-env)
6. [Tß║ío bß║úng Database (Migration)](#%EF%B8%8F-6--tß║ío-bß║úng-database-migration)
7. [Seed dß╗» liß╗çu demo](#-7--seed-dß╗»-liß╗çu-demo)
8. [Chß║íy ß╗⌐ng dß╗Ñng](#-8--chß║íy-ß╗⌐ng-dß╗Ñng)
9. [T├ái khoß║ún ─æ─âng nhß║¡p demo](#-9--t├ái-khoß║ún-─æ─âng-nhß║¡p-demo)
10. [C├íc lß╗çnh hay d├╣ng](#-10--c├íc-lß╗çnh-hay-d├╣ng)
11. [Cß║Ñu tr├║c th╞░ mß╗Ñc](#-11--cß║Ñu-tr├║c-th╞░-mß╗Ñc)
12. [Xß╗¡ l├╜ lß╗ùi th╞░ß╗¥ng gß║╖p](#-12--xß╗¡-l├╜-lß╗ùi-th╞░ß╗¥ng-gß║╖p)
13. [Cß║¡p nhß║¡t code tß╗½ Git](#-13--cß║¡p-nhß║¡t-code-tß╗½-git)
14. [L╞░u ├╜ kß╗╣ thuß║¡t quan trß╗ìng](#-14--l╞░u-├╜-kß╗╣-thuß║¡t-quan-trß╗ìng)

---

## ≡ƒôï 1 ΓÇö Y├¬u cß║ºu hß╗ç thß╗æng

Tr╞░ß╗¢c khi bß║»t ─æß║ºu, ─æß║úm bß║úo m├íy ─æ├ú c├ái ─æß╗º c├íc c├┤ng cß╗Ñ sau:

| C├┤ng cß╗Ñ | Phi├¬n bß║ún tß╗æi thiß╗âu | Mß╗Ñc ─æ├¡ch | Link tß║úi |
|---------|---------------------|----------|----------|
| **Node.js** | 20.x trß╗ƒ l├¬n | Chß║íy Next.js & TypeScript | https://nodejs.org |
| **npm** | 10.x+ (k├¿m Node.js) | Quß║ún l├╜ th╞░ viß╗çn | _(c├ái k├¿m Node.js)_ |
| **Docker Desktop** | Latest | Chß║íy PostgreSQL trong container | https://www.docker.com/products/docker-desktop |
| **Git** | Bß║Ñt kß╗│ | Quß║ún l├╜ m├ú nguß╗ôn | https://git-scm.com |

> ≡ƒÆí **Docker Desktop** ─æ├ú bao gß╗ôm sß║╡n Docker Compose. PostgreSQL sß║╜ chß║íy trong Docker container ΓÇö **kh├┤ng cß║ºn c├ái PostgreSQL ri├¬ng l├¬n m├íy**.

---

## ≡ƒöº 2 ΓÇö C├ái ─æß║╖t c├┤ng cß╗Ñ

### 2.1. C├ái Node.js

1. V├áo https://nodejs.org ΓåÆ Tß║úi bß║ún **LTS** (20.x trß╗ƒ l├¬n)
2. Chß║íy file `.msi` (Windows) hoß║╖c `.pkg` (macOS) ΓåÆ Next ΓåÆ Next ΓåÆ Finish
3. **Khß╗ƒi ─æß╗Öng lß║íi Terminal/PowerShell** sau khi c├ái

### 2.2. C├ái Docker Desktop

1. V├áo https://www.docker.com/products/docker-desktop ΓåÆ Tß║úi Docker Desktop
2. C├ái ─æß║╖t v├á **khß╗ƒi ─æß╗Öng lß║íi m├íy** khi ─æ╞░ß╗úc y├¬u cß║ºu
3. Mß╗ƒ Docker Desktop, ─æß╗úi icon Docker ß╗ƒ taskbar chuyß╗ân sang **m├áu xanh** (Running)

### 2.3. C├ái Git

1. V├áo https://git-scm.com ΓåÆ Tß║úi Git
2. C├ái ─æß║╖t vß╗¢i cß║Ñu h├¼nh mß║╖c ─æß╗ïnh (Next ΓåÆ Next ΓåÆ Finish)

### 2.4. Kiß╗âm tra tß║Ñt cß║ú ─æ├ú c├ái xong

Mß╗ƒ **PowerShell** (Windows) hoß║╖c **Terminal** (macOS/Linux), g├╡ tß╗½ng lß╗çnh:

```powershell
node --version          # ΓåÆ v20.x.x trß╗ƒ l├¬n Γ£à
npm --version           # ΓåÆ 10.x.x trß╗ƒ l├¬n Γ£à
docker --version        # ΓåÆ Docker version 2x.x.x Γ£à
docker compose version  # ΓåÆ Docker Compose version v2.x.x Γ£à
git --version           # ΓåÆ git version 2.x.x Γ£à
```

> ΓÜá∩╕Å Nß║┐u lß╗çnh n├áo b├ío `not found` hoß║╖c `not recognized`, h├úy c├ái lß║íi c├┤ng cß╗Ñ ─æ├│ v├á **khß╗ƒi ─æß╗Öng lß║íi Terminal**.

---

## ≡ƒôÑ 3 ΓÇö Clone dß╗▒ ├ín & C├ái dependencies

```powershell
# 1. Clone repository vß╗ü m├íy
git clone <URL-REPO>

# 2. Di chuyß╗ân v├áo th╞░ mß╗Ñc Next.js project
cd 52400017_52400133_52400004/axiom

# 3. C├ái ─æß║╖t tß║Ñt cß║ú th╞░ viß╗çn (39 packages)
npm install
```

> ΓÅ│ Lß╗çnh `npm install` sß║╜ mß║Ñt **2ΓÇô5 ph├║t** t├╣y tß╗æc ─æß╗Ö mß║íng. Sau khi xong sß║╜ xuß║Ñt hiß╗çn th╞░ mß╗Ñc `node_modules/`.
>
> ΓÜá∩╕Å Nß║┐u gß║╖p lß╗ùi **`ERESOLVE could not resolve`** (xung ─æß╗Öt phi├¬n bß║ún nodemailer), chß║íy lß║íi bß║▒ng:
> ```powershell
> npm install --legacy-peer-deps
> ```
> File `.npmrc` trong project ─æ├ú ─æ╞░ß╗úc cß║Ñu h├¼nh sß║╡n `legacy-peer-deps=true` ─æß╗â tß╗▒ xß╗¡ l├╜. Nß║┐u vß║½n lß╗ùi, x├│a cache v├á thß╗¡ lß║íi:
> ```powershell
> rm -rf node_modules package-lock.json
> npm install --legacy-peer-deps
> ```

**Kiß╗âm tra c├ái th├ánh c├┤ng:**
```powershell
# Phß║úi thß║Ñy th╞░ mß╗Ñc node_modules tß╗ôn tß║íi
ls node_modules
```

---

## ≡ƒÉÿ 4 ΓÇö Khß╗ƒi ─æß╗Öng Database (Docker)

> ΓÜá∩╕Å **Bß║»t buß╗Öc:** Docker Desktop phß║úi ─æang **chß║íy** (icon xanh ß╗ƒ taskbar) tr╞░ß╗¢c khi thß╗▒c hiß╗çn b╞░ß╗¢c n├áy.

```powershell
# ─Éß║úm bß║úo ─æang ß╗ƒ th╞░ mß╗Ñc axiom/
docker compose up -d
```

Lß╗çnh n├áy sß║╜ tß╗▒ ─æß╗Öng tß║úi image PostgreSQL 17 v├á pgAdmin 4 vß╗ü m├íy (lß║ºn ─æß║ºu mß║Ñt ~2 ph├║t), sau ─æ├│ khß╗ƒi chß║íy 2 container:

| Container | Cß╗òng | Mß╗Ñc ─æ├¡ch |
|-----------|------|----------|
| `axiom_db` | `5432` | PostgreSQL 17 Alpine ΓÇö database ch├¡nh |
| `axiom_pgadmin` | `5050` | pgAdmin 4 ΓÇö giao diß╗çn web quß║ún l├╜ DB (t├╣y chß╗ìn) |

**Kiß╗âm tra container ─æ├ú chß║íy:**
```powershell
docker ps
```
Phß║úi thß║Ñy 2 d├▓ng: `axiom_db` (STATUS: Up) v├á `axiom_pgadmin` (STATUS: Up).

**Truy cß║¡p pgAdmin (t├╣y chß╗ìn ΓÇö ─æß╗â xem DB bß║▒ng giao diß╗çn web):**
- URL: http://localhost:5050
- Email: `admin@axiom.dev`
- Password: `admin123`

---

## ≡ƒöæ 5 ΓÇö Cß║Ñu h├¼nh biß║┐n m├┤i tr╞░ß╗¥ng (.env)

```powershell
# Copy file mß║½u th├ánh file .env
cp .env.example .env
```

Mß╗ƒ file `.env` bß║▒ng bß║Ñt kß╗│ text editor n├áo (VSCode, Notepad++...) v├á kiß╗âm tra nß╗Öi dung:

```env
# ΓöÇΓöÇ DATABASE ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
DATABASE_URL="postgresql://axiom:axiom_password@localhost:5432/axiom_hrm?schema=public"

# ΓöÇΓöÇ AUTHENTICATION ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
AUTH_SECRET="your-super-secret-key-change-in-production-min-32-chars"
AUTH_URL="http://localhost:3000"

# ΓöÇΓöÇ APP CONFIG ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
NEXT_PUBLIC_APP_NAME="AXIOM HRM"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ΓöÇΓöÇ GMAIL SMTP (cho t├¡nh n─âng Qu├¬n mß║¡t khß║⌐u) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
GMAIL_USER="your_email@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
```

### Giß║úi th├¡ch tß╗½ng biß║┐n:

| Biß║┐n | M├┤ tß║ú | Cß║ºn thay ─æß╗òi? |
|------|-------|---------------|
| `DATABASE_URL` | Chuß╗ùi kß║┐t nß╗æi PostgreSQL Docker | Γ¥î Giß╗» nguy├¬n nß║┐u d├╣ng Docker mß║╖c ─æß╗ïnh |
| `AUTH_SECRET` | Kh├│a b├¡ mß║¡t cho NextAuth (ΓëÑ32 k├╜ tß╗▒) | Γ£à N├¬n ─æß╗òi th├ánh chuß╗ùi ngß║½u nhi├¬n |
| `AUTH_URL` | URL ß╗⌐ng dß╗Ñng | Γ¥î Giß╗» nguy├¬n |
| `GMAIL_USER` | Gmail ─æß╗â gß╗¡i email qu├¬n mß║¡t khß║⌐u | ΓÜí Chß╗ë cß║ºn nß║┐u muß╗æn d├╣ng t├¡nh n─âng **Qu├¬n mß║¡t khß║⌐u** |
| `GMAIL_APP_PASSWORD` | App Password cß╗ºa Gmail | ΓÜí Chß╗ë cß║ºn nß║┐u muß╗æn d├╣ng t├¡nh n─âng **Qu├¬n mß║¡t khß║⌐u** |

> ≡ƒÆí **Tß║ío AUTH_SECRET ngß║½u nhi├¬n:**
> ```powershell
> node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
> ```

> ≡ƒôº **H╞░ß╗¢ng dß║½n lß║Ñy Gmail App Password** (chß╗ë cß║ºn nß║┐u muß╗æn gß╗¡i email thß║¡t):
> 1. V├áo https://myaccount.google.com/security
> 2. Bß║¡t "X├íc minh 2 b╞░ß╗¢c" nß║┐u ch╞░a bß║¡t
> 3. T├¼m "Mß║¡t khß║⌐u ß╗⌐ng dß╗Ñng" ΓåÆ Tß║ío mß║¡t khß║⌐u mß╗¢i ΓåÆ Chß╗ìn "Th╞░"
> 4. Copy d├úy 16 k├╜ tß╗▒ v├áo `GMAIL_APP_PASSWORD`

---

## ≡ƒùä∩╕Å 6 ΓÇö Tß║ío bß║úng Database (Migration)

```powershell
# Tß║ío tß║Ñt cß║ú 13 bß║úng trong database
npx prisma migrate dev
```

Khi ─æ╞░ß╗úc hß╗Åi t├¬n migration, c├│ thß╗â nhß║¡p bß║Ñt kß╗│ (v├¡ dß╗Ñ: `init`) hoß║╖c nhß║Ñn Enter ─æß╗â bß╗Å qua.

**Kß║┐t quß║ú mong ─æß╗úi:**
```
Γ£à 13 bß║úng ─æ├ú ─æ╞░ß╗úc tß║ío:
   departments, positions, employees, contracts, users,
   attendance, leave_requests, leave_balance, payroll,
   payslips, career_history, business_trips, salary_config
```

> ≡ƒÆí Nß║┐u migration ─æ├ú chß║íy tr╞░ß╗¢c ─æ├│, lß╗çnh n├áy sß║╜ tß╗▒ ph├ít hiß╗çn v├á bß╗Å qua.

---

## ≡ƒî▒ 7 ΓÇö Seed dß╗» liß╗çu demo

Chß║íy lß║ºn l╞░ß╗út 3 lß╗çnh sau ─æß╗â tß║ío dß╗» liß╗çu mß║½u:

```powershell
# B╞░ß╗¢c 7a: Tß║ío nh├ón vi├¬n, t├ái khoß║ún, ph├▓ng ban, hß╗úp ─æß╗ông, chß║Ñm c├┤ng T3...
npx tsx scripts/seed-demo-data.ts

# B╞░ß╗¢c 7b: T├¡nh l╞░╞íng th├íng 3/2026 cho to├án bß╗Ö nh├ón vi├¬n
npx tsx scripts/generate-payroll.ts --month=3 --year=2026

# B╞░ß╗¢c 7c (t├╣y chß╗ìn): Tß║ío biß║┐n ─æß╗Öng l╞░╞íng nhiß╗üu th├íng (cho biß╗âu ─æß╗ô xu h╞░ß╗¢ng)
npx tsx scripts/vary-payroll.ts
```

**Kß║┐t quß║ú sau khi seed:**
```
Γ£à 5 ph├▓ng ban  |  19 chß╗⌐c vß╗Ñ
Γ£à 63 nh├ón vi├¬n (3 BG─É + 5 Tr╞░ß╗ƒng ph├▓ng + 50 NV + 5 Thß╗¡ viß╗çc)
Γ£à 64 t├ái khoß║ún (1 Admin + 63 NV)
Γ£à 63 hß╗úp ─æß╗ông lao ─æß╗Öng
Γ£à ~1.280 records chß║Ñm c├┤ng T3/2026
Γ£à 63 quß╗╣ nghß╗ë ph├⌐p  |  8 ─æ╞ín nghß╗ë ph├⌐p
Γ£à 7 sß╗▒ kiß╗çn c├┤ng t├íc  |  6 chuyß║┐n c├┤ng t├íc ph├¡
Γ£à 7 tham sß╗æ cß║Ñu h├¼nh l╞░╞íng VN 2026
Γ£à Payroll T3/2026: Tß╗òng Net ~1.41 tß╗╖ ─æ
```

> ΓÜá∩╕Å Script seed sß║╜ **x├│a to├án bß╗Ö dß╗» liß╗çu c┼⌐** tr╞░ß╗¢c khi tß║ío mß╗¢i. Chß╗ë chß║íy khi muß╗æn reset data.

---

## Γû╢∩╕Å 8 ΓÇö Chß║íy ß╗⌐ng dß╗Ñng

```powershell
npm run dev
```

Mß╗ƒ tr├¼nh duyß╗çt tß║íi: **http://localhost:3000**

Hß╗ç thß╗æng sß║╜ tß╗▒ chuyß╗ân ─æß║┐n trang ─æ─âng nhß║¡p. Sß╗¡ dß╗Ñng t├ái khoß║ún demo ß╗ƒ b╞░ß╗¢c 9 ─æß╗â ─æ─âng nhß║¡p.

> ≡ƒÆí Nhß║Ñn `Ctrl + C` trong Terminal ─æß╗â dß╗½ng server.

---

## ≡ƒæñ 9 ΓÇö T├ái khoß║ún ─æ─âng nhß║¡p demo

### 6 t├ái khoß║ún thß╗¡ nhanh (1 t├ái khoß║ún / vai tr├▓)

| Vai tr├▓ | Username | Mß║¡t khß║⌐u | Dashboard | Chß╗⌐c n─âng ch├¡nh |
|---------|----------|----------|-----------|-----------------|
| ≡ƒææ **Admin** | `admin` | `admin` | `/dashboard` | Quß║ún trß╗ï to├án hß╗ç thß╗æng, RBAC |
| ≡ƒÅ¢∩╕Å **Gi├ím ─æß╗æc** | `giamdoc` | `giamdoc` | `/dashboard-director` | Xem KPI, biß╗âu ─æß╗ô to├án c├┤ng ty |
| ≡ƒæ¿ΓÇì≡ƒÆ╝ **Nh├ón sß╗▒** | `nhansu` | `nhansu` | `/dashboard-hr` | QL nh├ón vi├¬n, duyß╗çt nghß╗ë ph├⌐p |
| ≡ƒÆ░ **Kß║┐ to├ín** | `ketoan` | `ketoan` | `/dashboard-accountant` | T├¡nh l╞░╞íng, BH, thuß║┐ TNCN |
| ≡ƒÅó **Tr╞░ß╗ƒng ph├▓ng** | `quanly` | `quanly` | `/dashboard-manager` | Chß║Ñm c├┤ng, duyß╗çt ph├⌐p ph├▓ng ban |
| ≡ƒæñ **Nh├ón vi├¬n** | `nhanvien` | `nhanvien` | `/dashboard-employee` | Chß║Ñm c├┤ng, phiß║┐u l╞░╞íng c├í nh├ón |

### T├ái khoß║ún bß╗ò sung

| Username | Mß║¡t khß║⌐u | Role | Ghi ch├║ |
|----------|----------|------|---------|
| `pgd1`, `pgd2` | `123456` | Director | Ph├│ Gi├ím ─æß╗æc |
| `tp_kinhdoanh`, `tp_marketing` | `123456` | Manager | Tr╞░ß╗ƒng ph├▓ng |
| `nv009` ΓåÆ `nv063` | `123456` | Employee | 55 nh├ón vi├¬n c├íc ph├▓ng ban |

> ≡ƒöÉ Tß║Ñt cß║ú user (trß╗½ Admin) khi ─æ─âng nhß║¡p lß║ºn ─æß║ºu sß║╜ ─æ╞░ß╗úc y├¬u cß║ºu **thiß║┐t lß║¡p Gmail c├í nh├ón** tß║íi `/setup-email` ─æß╗â sß╗¡ dß╗Ñng t├¡nh n─âng qu├¬n mß║¡t khß║⌐u. Mß╗Öt sß╗æ t├ái khoß║ún ch├¡nh (`giamdoc`, `nhansu`, `ketoan`, `quanly`, `nhanvien`) ─æ├ú ─æ╞░ß╗úc thiß║┐t lß║¡p sß║╡n.

---

## ≡ƒô£ 10 ΓÇö C├íc lß╗çnh hay d├╣ng

### Development
```powershell
npm run dev                         # Chß║íy dev server (http://localhost:3000)
npm run build                       # Build production
npm run start                       # Chß║íy production server
npm run lint                        # Kiß╗âm tra code style
```

### Database
```powershell
npx prisma studio                   # Mß╗ƒ GUI quß║ún l├╜ DB (http://localhost:5555)
npx prisma migrate dev              # Tß║ío & chß║íy migration mß╗¢i
npx prisma generate                 # Tß║ío lß║íi Prisma Client (sau khi sß╗¡a schema)
node scripts/test-db.mjs            # Test kß║┐t nß╗æi database
```

### Docker
```powershell
docker compose up -d                # Khß╗ƒi ─æß╗Öng PostgreSQL & pgAdmin
docker compose down                 # Dß╗½ng containers (dß╗» liß╗çu ─æ╞░ß╗úc giß╗» lß║íi)
docker compose down -v              # Dß╗½ng & X├ôA dß╗» liß╗çu (reset ho├án to├án)
docker ps                           # Xem container ─æang chß║íy
docker compose logs -f postgres     # Xem logs PostgreSQL
```

### Seed & Payroll
```powershell
npx tsx scripts/seed-demo-data.ts               # Seed dß╗» liß╗çu demo (63 NV + 64 TK)
npx tsx scripts/generate-attendance.ts           # Tß║ío chß║Ñm c├┤ng th├íng hiß╗çn tß║íi
npx tsx scripts/generate-payroll.ts --month=3 --year=2026  # T├¡nh l╞░╞íng th├íng cß╗Ñ thß╗â
npx tsx scripts/vary-payroll.ts                  # Tß║ío biß║┐n ─æß╗Öng l╞░╞íng nhiß╗üu th├íng
npx tsx scripts/check-payroll-months.ts          # Kiß╗âm tra payroll theo th├íng
```

---

## ≡ƒôü 11 ΓÇö Cß║Ñu tr├║c th╞░ mß╗Ñc

```
52400017_52400133_52400004/         ΓåÉ Root repository
Γö£ΓöÇΓöÇ README.md                       ΓåÉ Giß╗¢i thiß╗çu dß╗▒ ├ín
Γö£ΓöÇΓöÇ docs/                           ΓåÉ T├ái liß╗çu
Γöé   Γö£ΓöÇΓöÇ SETUP.md                    ΓåÉ ≡ƒôì File n├áy
Γöé   Γö£ΓöÇΓöÇ project-summary.md          ΓåÉ T├│m tß║»t dß╗▒ ├ín
Γöé   Γö£ΓöÇΓöÇ tai-khoan-demo.md           ΓåÉ Danh s├ích 64 t├ái khoß║ún chi tiß║┐t
Γöé   Γö£ΓöÇΓöÇ thuyet-trinh.md             ΓåÉ Nß╗Öi dung thuyß║┐t tr├¼nh
Γöé   Γö£ΓöÇΓöÇ mo-ta-de-tai.md             ΓåÉ M├┤ tß║ú ─æß╗ü t├ái
Γöé   ΓööΓöÇΓöÇ bangmau.md                  ΓåÉ Bß║úng m├áu thiß║┐t kß║┐
Γö£ΓöÇΓöÇ UML/                            ΓåÉ Biß╗âu ─æß╗ô UML (Use Case, Activity, Class, ERD)
Γö£ΓöÇΓöÇ bao-cao/                        ΓåÉ B├ío c├ío Word/PDF
ΓööΓöÇΓöÇ axiom/                          ΓåÉ ≡ƒöÑ NEXT.JS PROJECT (th╞░ mß╗Ñc ch├¡nh)
    Γö£ΓöÇΓöÇ .env / .env.example         ΓåÉ Biß║┐n m├┤i tr╞░ß╗¥ng
    Γö£ΓöÇΓöÇ docker-compose.yml          ΓåÉ Docker: PostgreSQL + pgAdmin
    Γö£ΓöÇΓöÇ package.json                ΓåÉ Dependencies (39 packages)
    Γö£ΓöÇΓöÇ prisma/
    Γöé   Γö£ΓöÇΓöÇ schema.prisma           ΓåÉ Database schema (13 models)
    Γöé   ΓööΓöÇΓöÇ migrations/             ΓåÉ SQL migrations tß╗▒ ─æß╗Öng
    Γö£ΓöÇΓöÇ prisma.config.ts            ΓåÉ Prisma 7 connection config
    Γö£ΓöÇΓöÇ scripts/                    ΓåÉ 9 seed & utility scripts
    Γöé   Γö£ΓöÇΓöÇ seed-demo-data.ts       ΓåÉ Tß║ío 63 NV + 64 TK + to├án bß╗Ö data
    Γöé   Γö£ΓöÇΓöÇ generate-attendance.ts  ΓåÉ Tß║ío chß║Ñm c├┤ng
    Γöé   Γö£ΓöÇΓöÇ generate-payroll.ts     ΓåÉ T├¡nh l╞░╞íng h├áng loß║ít
    Γöé   Γö£ΓöÇΓöÇ vary-payroll.ts         ΓåÉ Biß║┐n ─æß╗Öng l╞░╞íng nhiß╗üu th├íng
    Γöé   ΓööΓöÇΓöÇ ...
    Γö£ΓöÇΓöÇ public/                     ΓåÉ Static assets (logo, avatar, cß╗¥...)
    ΓööΓöÇΓöÇ src/                        ΓåÉ Source code ch├¡nh
        Γö£ΓöÇΓöÇ middleware.ts           ΓåÉ Auth guard (Edge Runtime)
        Γö£ΓöÇΓöÇ app/
        Γöé   Γö£ΓöÇΓöÇ (auth)/             ΓåÉ Trang login, qu├¬n mß║¡t khß║⌐u
        Γöé   Γö£ΓöÇΓöÇ (dashboard)/        ΓåÉ 6 dashboards + 14 trang chß╗⌐c n─âng
        Γöé   Γöé   Γö£ΓöÇΓöÇ layout.tsx      ΓåÉ Layout chung: sidebar + header + theme
        Γöé   Γöé   Γö£ΓöÇΓöÇ dashboard/      ΓåÉ Trang chß╗º Admin
        Γöé   Γöé   Γö£ΓöÇΓöÇ dashboard-director/  ΓåÉ Dashboard Gi├ím ─æß╗æc / Thß╗æng k├¬
        Γöé   Γöé   Γö£ΓöÇΓöÇ dashboard-hr/        ΓåÉ Dashboard Nh├ón sß╗▒
        Γöé   Γöé   Γö£ΓöÇΓöÇ dashboard-accountant/ ΓåÉ Dashboard Kß║┐ to├ín
        Γöé   Γöé   Γö£ΓöÇΓöÇ dashboard-manager/   ΓåÉ Dashboard Tr╞░ß╗ƒng ph├▓ng
        Γöé   Γöé   Γö£ΓöÇΓöÇ dashboard-employee/  ΓåÉ Dashboard Nh├ón vi├¬n
        Γöé   Γöé   Γö£ΓöÇΓöÇ employees/      ΓåÉ Quß║ún l├╜ nh├ón sß╗▒
        Γöé   Γöé   Γö£ΓöÇΓöÇ contracts/      ΓåÉ Hß╗úp ─æß╗ông lao ─æß╗Öng
        Γöé   Γöé   Γö£ΓöÇΓöÇ career-history/ ΓåÉ Qu├í tr├¼nh c├┤ng t├íc
        Γöé   Γöé   Γö£ΓöÇΓöÇ attendance/     ΓåÉ Chß║Ñm c├┤ng
        Γöé   Γöé   Γö£ΓöÇΓöÇ leave/          ΓåÉ Nghß╗ë ph├⌐p
        Γöé   Γöé   Γö£ΓöÇΓöÇ payroll/        ΓåÉ Bß║úng l╞░╞íng & cß║Ñu h├¼nh
        Γöé   Γöé   Γö£ΓöÇΓöÇ payslips/       ΓåÉ Phiß║┐u l╞░╞íng
        Γöé   Γöé   Γö£ΓöÇΓöÇ business-trips/ ΓåÉ C├┤ng t├íc ph├¡
        Γöé   Γöé   Γö£ΓöÇΓöÇ profile/        ΓåÉ Hß╗ô s╞í c├í nh├ón
        Γöé   Γöé   ΓööΓöÇΓöÇ settings/       ΓåÉ RBAC ph├ón quyß╗ün
        Γöé   Γö£ΓöÇΓöÇ api/                ΓåÉ 10+ API routes
        Γöé   ΓööΓöÇΓöÇ setup-email/        ΓåÉ Thiß║┐t lß║¡p Gmail lß║ºn ─æß║ºu
        Γö£ΓöÇΓöÇ components/             ΓåÉ Shared UI components
        Γö£ΓöÇΓöÇ hooks/                  ΓåÉ Custom React hooks
        Γö£ΓöÇΓöÇ lib/                    ΓåÉ Server Actions, helpers, i18n
        ΓööΓöÇΓöÇ types/                  ΓåÉ TypeScript type definitions
```

---

## ≡ƒÉ¢ 12 ΓÇö Xß╗¡ l├╜ lß╗ùi th╞░ß╗¥ng gß║╖p

### Γ¥î `Can't reach database server at localhost:5432`
**Nguy├¬n nh├ón:** PostgreSQL Docker ch╞░a chß║íy.
```powershell
# Giß║úi ph├íp:
docker compose up -d         # Khß╗ƒi ─æß╗Öng container
docker ps                    # Kiß╗âm tra: phß║úi thß║Ñy axiom_db
```

### Γ¥î `Error: P1001 Can't reach database`
**Nguy├¬n nh├ón:** `DATABASE_URL` trong `.env` sai hoß║╖c Docker ch╞░a khß╗ƒi ─æß╗Öng.
```powershell
# Giß║úi ph├íp:
# 1. Kiß╗âm tra Docker ─æang chß║íy: docker ps
# 2. Kiß╗âm tra .env c├│ ─æ├║ng: DATABASE_URL="postgresql://axiom:axiom_password@localhost:5432/axiom_hrm?schema=public"
# 3. Khß╗ƒi ─æß╗Öng lß║íi: docker compose down && docker compose up -d
```

### Γ¥î `npm install` bß╗ï lß╗ùi hoß║╖c treo
```powershell
# X├│a cache v├á c├ái lß║íi:
rm -rf node_modules package-lock.json
npm install
```

### Γ¥î `next: command not found` hoß║╖c `npx: command not found`
**Nguy├¬n nh├ón:** Ch╞░a chß║íy `npm install` hoß║╖c Node.js ch╞░a c├ái ─æ├║ng.
```powershell
npm install        # C├ái lß║íi dependencies
```

### Γ¥î `EACCES: permission denied` khi upload avatar
```powershell
# Tß║ío th╞░ mß╗Ñc upload thß╗º c├┤ng:
mkdir -p public/uploads/avatars
```

### Γ¥î `Error [ERR_MODULE_NOT_FOUND]` khi chß║íy seed
```powershell
# Ch╞░a c├ái dependencies:
npm install
```

### Γ¥î `Edge Runtime` hoß║╖c `crypto` error ß╗ƒ middleware
**Nguy├¬n nh├ón:** Middleware import sai file.
```
ΓåÆ middleware.ts chß╗ë ─æ╞░ß╗úc import auth.config.ts (Edge-safe)
ΓåÆ KH├öNG import auth.ts (chß╗⌐a bcrypt ΓÇö chß╗ë chß║íy tr├¬n Node.js)
```

### Γ¥î Port 3000 ─æang bß╗ï chiß║┐m
```powershell
# T├¼m process ─æang d├╣ng port 3000:
netstat -ano | findstr :3000
# Kß║┐t th├║c process (thay PID bß║▒ng sß╗æ thß╗▒c tß║┐):
taskkill /PID <PID> /F

# Hoß║╖c chß║íy dev tr├¬n port kh├íc:
npx next dev -p 3001
```

### Γ¥î `prisma migrate dev` bß╗ï lß╗ùi "shadow database"
```powershell
# Reset database ho├án to├án:
docker compose down -v
docker compose up -d
# ─Éß╗úi 5 gi├óy cho DB khß╗ƒi ─æß╗Öng
npx prisma migrate dev
```

---

## ≡ƒöä 13 ΓÇö Cß║¡p nhß║¡t code tß╗½ Git

Khi c├│ code mß╗¢i tß╗½ th├ánh vi├¬n kh├íc:

```powershell
# 1. K├⌐o code mß╗¢i
git pull origin main

# 2. C├ái lß║íi dependencies (nß║┐u package.json thay ─æß╗òi)
npm install

# 3. Chß║íy migration (nß║┐u schema.prisma thay ─æß╗òi)
npx prisma migrate dev

# 4. Chß║íy dev server
npm run dev
```

---

## ≡ƒôî 14 ΓÇö L╞░u ├╜ kß╗╣ thuß║¡t quan trß╗ìng

### Prisma 7 ΓÇö Driver Adapter Pattern
- Connection URL ─æ╞░ß╗úc cß║Ñu h├¼nh trong `prisma.config.ts`, **kh├┤ng phß║úi** trong `schema.prisma`
- File `schema.prisma` chß╗ë khai b├ío `provider = "postgresql"` m├á kh├┤ng c├│ `url`
- Khi chß║íy seed scripts, connection URL ─æ╞░ß╗úc ─æß╗ìc tß╗½ biß║┐n `DATABASE_URL` trong `.env`

### NextAuth v5 ΓÇö Edge Runtime
- `middleware.ts` sß╗¡ dß╗Ñng `auth.config.ts` (Edge-safe) thay v├¼ `auth.ts`
- `auth.ts` chß╗⌐a bcrypt (Node.js only) ΓÇö **kh├┤ng ─æ╞░ß╗úc import trong middleware**

### Thiß║┐t lß║¡p Gmail lß║ºn ─æß║ºu
- Mß╗ùi user (trß╗½ Admin) khi ─æ─âng nhß║¡p lß║ºn ─æß║ºu sß║╜ ─æ╞░ß╗úc redirect ─æß║┐n `/setup-email`
- Y├¬u cß║ºu nhß║¡p Gmail c├í nh├ón ─æß╗â k├¡ch hoß║ít t├¡nh n─âng "Qu├¬n mß║¡t khß║⌐u"
- C├íc t├ái khoß║ún ch├¡nh (`giamdoc`, `nhansu`, `ketoan`, `quanly`, `nhanvien`) ─æ├ú ─æ╞░ß╗úc thiß║┐t lß║¡p sß║╡n, kh├┤ng cß║ºn setup lß║íi

### Song ngß╗» (Bilingual)
- Hß╗ç thß╗æng hß╗ù trß╗ú **Tiß║┐ng Viß╗çt** v├á **Tiß║┐ng Anh**
- Chuyß╗ân ─æß╗òi bß║▒ng n├║t cß╗¥ ≡ƒç╗≡ƒç│/≡ƒç¼≡ƒçº tr├¬n header
- Tß║Ñt cß║ú labels, messages, biß╗âu ─æß╗ô, PDF ─æß╗üu ─æ╞░ß╗úc dß╗ïch

### Dark Mode
- Chuyß╗ân ─æß╗òi s├íng/tß╗æi bß║▒ng n├║t ΓÿÇ∩╕Å/≡ƒîÖ tr├¬n header
- To├án bß╗Ö giao diß╗çn (sidebar, cards, biß╗âu ─æß╗ô, tables) ─æß╗üu hß╗ù trß╗ú

---

## ΓÜí T├ôM Tß║«T NHANH ΓÇö 8 lß╗çnh ─æß╗â chß║íy tß╗½ ─æß║ºu

```powershell
git clone <URL-REPO>                                    # 1. Clone
cd 52400017_52400133_52400004/axiom                     # 2. V├áo th╞░ mß╗Ñc
npm install                                             # 3. C├ái th╞░ viß╗çn
docker compose up -d                                    # 4. Khß╗ƒi ─æß╗Öng DB
cp .env.example .env                                    # 5. Tß║ío file .env
npx prisma migrate dev                                  # 6. Tß║ío bß║úng
npx tsx scripts/seed-demo-data.ts                       # 7a. Seed data
npx tsx scripts/generate-payroll.ts --month=3 --year=2026  # 7b. T├¡nh l╞░╞íng
npm run dev                                             # 8. Chß║íy app ΓåÆ localhost:3000
```

**─É─âng nhß║¡p thß╗¡:** `admin` / `admin` ΓåÆ Trang chß╗º Admin vß╗¢i ─æß║ºy ─æß╗º dß╗» liß╗çu demo.

---

> ≡ƒôû Xem th├¬m: [tai-khoan-demo.md](./tai-khoan-demo.md) ΓÇö Danh s├ích chi tiß║┐t 64 t├ái khoß║ún vß╗¢i chß╗⌐c n─âng tß╗½ng role.
