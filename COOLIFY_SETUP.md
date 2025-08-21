# 🚀 IDURAR ERP/CRM - Coolify Deployment

## 📦 Proje Yapısı

Bu proje **iki ayrı servis** olarak deploy edilecek:
1. **Backend API** - Node.js/Express/MongoDB
2. **Frontend UI** - React/Vite/Nginx

## 🔧 Coolify'da Kurulum Adımları

### Adım 1: Backend Deploy

1. Coolify'da yeni **Resource** oluştur
2. Type: **Docker Compose**  
3. Source: **GitHub**
4. Repository: `https://github.com/usufefe/finance.smiloai-backend`
5. Branch: `master`
6. Base Directory: `/` (root) - AYRI REPO İÇİN!

**Environment Variables:**
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/
DATABASE_NAME=idurar
JWT_SECRET=your-32-character-random-string-here
PORT=8888
NODE_ENV=production
FRONTEND_URL=https://finance.smiloai.com
```

**Domain:** `apifinance.smiloai.com`

### Adım 2: Frontend Deploy

1. Coolify'da yeni **Resource** oluştur
2. Type: **Docker Compose**
3. Source: **GitHub**
4. Repository: `https://github.com/usufefe/finanace.smilo-frontend`
5. Branch: `master`
6. Base Directory: `/` (root) - AYRI REPO İÇİN!

**Build Arguments & Environment Variables:**
```env
VITE_API_BASE_URL=https://apifinance.smiloai.com/api
PORT=3000
NODE_ENV=production
```

**Domain:** `finance.smiloai.com`

## 🗄️ MongoDB Kurulumu

### Seçenek 1: MongoDB Atlas (ÖNERİLEN - ÜCRETSİZ)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) hesabı oluştur
2. Free tier cluster oluştur (M0 - 512MB)
3. Database user oluştur
4. Network Access'e IP adresinizi ekleyin (veya 0.0.0.0/0 herkese açık)
5. Connection string'i kopyalayın:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
```

### Seçenek 2: Coolify MongoDB Service

1. Coolify'da Services → Add Service → MongoDB
2. Deploy edin
3. Connection string'i alın ve backend'e verin

## ✅ Deployment Kontrol Listesi

### Backend
- [ ] MongoDB bağlantısı test edildi
- [ ] JWT_SECRET güvenli (min 32 karakter)
- [ ] Health check çalışıyor: `https://apifinance.smiloai.com/api/health`
- [ ] CORS ayarları doğru

### Frontend  
- [ ] API URL doğru ayarlandı
- [ ] Build başarılı
- [ ] Sayfa açılıyor
- [ ] Login çalışıyor

## 🔐 İlk Giriş

Deploy tamamlandıktan sonra:

1. `https://finance.smiloai.com` adresine gidin
2. İlk admin kullanıcısı oluşturun:
   - Email: admin@company.com
   - Password: güçlü bir şifre

## 🐛 Sorun Giderme

### "Cannot connect to database"
- MongoDB URL'i kontrol edin
- MongoDB Atlas'ta IP whitelist yapın
- Database name'i kontrol edin

### "CORS Error"  
- Backend'de `FRONTEND_URL` doğru mu?
- Frontend'de `VITE_API_BASE_URL` doğru mu?

### "nginx.conf not found" Hatası
⚠️  **EN YAGIN HATA**: Dosyalar yanlış yerde!

**AYRI REPOSITORY'LER İÇİN:**
- `nginx.conf` dosyası frontend repo'nun **root**'unda olmalı
- `Dockerfile` dosyası frontend repo'nun **root**'unda olmalı  
- Coolify Base Directory: `/` (root)

**ÇÖZÜMLERİ:**
1. `nginx.conf`'u frontend repo'nun root'una kopyalayın
2. `Dockerfile`'ı frontend repo'nun root'una kopyalayın
3. Coolify'da Base Directory `/` olarak ayarlayın

### "502 Bad Gateway"
- Container'lar çalışıyor mu?
- Port'lar doğru mu?
- Health check'ler geçiyor mu?

### Logları Kontrol
```bash
# Coolify Dashboard'da:
# Logs sekmesine gidin veya

# SSH ile:
docker logs <container-name>
```

## 📊 Monitoring

### Health Endpoints
- Backend: `GET https://apifinance.smiloai.com/api/health`
- Frontend: `GET https://finance.smiloai.com/health`

### Metrikler
Coolify dashboard'da:
- CPU Usage
- Memory Usage
- Network I/O
- Disk Usage

## 🔄 Güncelleme

1. GitHub'a kod push'layın
2. Coolify otomatik deploy eder (webhook ayarlıysa)
3. Veya manuel: Coolify'da "Redeploy" tıklayın

## 💡 İpuçları

1. **Staging ortamı:** Önce test için ayrı bir deployment yapın
2. **Backup:** MongoDB'yi düzenli yedekleyin
3. **Monitoring:** Uptime monitoring servisi kullanın
4. **SSL:** Let's Encrypt otomatik yenilenir
5. **Scaling:** Gerekirse container sayısını artırın

## 🆘 Destek

- Coolify Discord: https://discord.gg/coolify
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- IDURAR Issues: https://github.com/idurar/idurar-erp-crm/issues

---

**NOT:** Bu setup production-ready! Güvenlik best practice'leri uygulanmıştır. 🎉
