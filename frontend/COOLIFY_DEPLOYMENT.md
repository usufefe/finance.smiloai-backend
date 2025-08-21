# Frontend - Coolify Deployment Guide

## 🚀 Hızlı Başlangıç

### 1. Coolify'da Yeni Proje Oluştur
- Resource Type: **Docker Compose**
- Source: **GitHub** (https://github.com/usufefe/finanace.smilo-frontend)

### 2. Environment Variables
Coolify'da şu değişkenleri ayarlayın:

```env
# ZORUNLU
VITE_API_BASE_URL=https://apifinance.smiloai.com/api

# OPSIYONEL
PORT=3000
NODE_ENV=production
VITE_SMILO_ENABLED=true
VITE_SMILO_TENANT_ID=your-tenant-id
```

### 3. Build Arguments
Docker build sırasında API URL'i belirtin:
```
VITE_API_BASE_URL=https://apifinance.smiloai.com/api
```

### 4. Domain Ayarları
- Domain: `app.yourdomain.com`
- SSL: Otomatik (Let's Encrypt)

### 5. Build & Deploy
```bash
# Coolify otomatik olarak şunları yapacak:
docker-compose up -d
```

## 📝 Deployment Kontrol Listesi

- [ ] Backend API URL'i doğru
- [ ] Domain ve SSL ayarlandı
- [ ] Build başarılı
- [ ] Health check çalışıyor: `http://app.yourdomain.com/health`

## 🔧 Sorun Giderme

### ⚠️ "nginx.conf not found" Hatası
**ÇÖZÜM**: Coolify'da Base Directory ayarını kontrol edin!
- Resource Settings → Build → Base Directory: `frontend/`
- Root (/) DEĞİL, frontend klasörü olmalı!

### API Bağlantı Hatası
```env
# HTTPS kullanıyorsanız:
VITE_API_BASE_URL=https://apifinance.smiloai.com/api

# Development için:
VITE_API_BASE_URL=http://localhost:8888/api
```

### Blank Sayfa Sorunu
1. Browser console'u kontrol edin
2. Network tab'da 404 hataları var mı?
3. API URL'i doğru mu?

### CORS Hatası
Backend'de FRONTEND_URL ayarlandığından emin olun:
```env
# Backend .env
FRONTEND_URL=https://app.yourdomain.com
```

## 📊 Monitoring

Health Check Endpoint:
```
GET /health
```

Nginx Logs:
```bash
docker logs idurar-frontend
```

## 🎨 Özelleştirme

### Logo Değiştirme
`src/style/images/` klasöründeki logo dosyalarını değiştirin:
- logo-icon.png
- logo-text.png
- logo.png

### Renk Teması
`src/style/app.css` dosyasında CSS değişkenlerini düzenleyin.

## 🔐 Güvenlik

### Nginx Security Headers
`nginx.conf` dosyasında güvenlik başlıkları zaten ayarlı:
- X-Frame-Options
- X-XSS-Protection  
- X-Content-Type-Options
- Referrer-Policy

### SmiloAI Iframe Entegrasyonu
CORS headers otomatik olarak ayarlı. Iframe'de kullanmak için:
```html
<iframe src="https://app.yourdomain.com" 
        width="100%" 
        height="600">
</iframe>
```

## 🚀 Performance

### Optimizasyonlar
- Gzip compression ✅
- Static asset caching ✅  
- Code splitting ✅
- Lazy loading ✅

### CDN Kullanımı (Opsiyonel)
Cloudflare veya başka bir CDN kullanabilirsiniz.

## 📱 Mobile Responsive
Uygulama tamamen responsive. Tüm cihazlarda çalışır.

## 🔄 Güncelleme

1. GitHub'a yeni kod push'layın
2. Coolify otomatik deploy edecek
3. Veya manuel: "Redeploy" butonuna tıklayın
