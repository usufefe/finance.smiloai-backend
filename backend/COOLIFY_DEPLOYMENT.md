# Backend - Coolify Deployment Guide

## 🚀 Hızlı Başlangıç

### 1. Coolify'da Yeni Proje Oluştur
- Resource Type: **Docker Compose**
- Source: **GitHub** (https://github.com/usufefe/finance.smiloai-backend)

### 2. Environment Variables
Coolify'da şu değişkenleri ayarlayın:

```env
# ZORUNLU
DATABASE_URL=mongodb://mongo:27017
DATABASE_NAME=idurar
JWT_SECRET=your-super-secret-jwt-key-generate-random-string

# ÖNEMLİ
PORT=8888
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# OPSIYONEL
OPENAI_API_KEY=sk-your-openai-key
```

### 3. MongoDB Bağlantısı

#### Seçenek A: Coolify MongoDB Service
Coolify'da MongoDB servis ekleyin ve bağlantı URL'ini kullanın.

#### Seçenek B: MongoDB Atlas (Önerilen)
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) ücretsiz cluster oluşturun
2. Connection string'i alın
3. `DATABASE_URL` olarak ayarlayın

### 4. Domain Ayarları
- Domain: `apifinance.smiloai.com` 
- SSL: Otomatik (Let's Encrypt)

### 5. Build & Deploy
```bash
# Coolify otomatik olarak şunları yapacak:
docker-compose up -d
```

## 📝 Deployment Kontrol Listesi

- [ ] MongoDB bağlantısı hazır
- [ ] JWT_SECRET güçlü ve random
- [ ] CORS için FRONTEND_URL doğru
- [ ] Domain ve SSL ayarlandı
- [ ] Health check çalışıyor: `https://apifinance.smiloai.com/api/health`

## 🔧 Sorun Giderme

### MongoDB Bağlantı Hatası
```env
# MongoDB Atlas için örnek:
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/
```

### CORS Hatası
```env
FRONTEND_URL=https://app.yourdomain.com
# Virgülle ayırarak birden fazla URL ekleyebilirsiniz
```

### Port Çakışması
```env
PORT=3001  # Farklı bir port deneyin
```

## 📊 Monitoring

Health Check Endpoint:
```
GET /api/health
```

Logs:
```bash
docker logs idurar-backend
```

## 🔐 Güvenlik

1. **JWT_SECRET**: En az 32 karakter, random string kullanın
2. **MongoDB**: IP whitelist yapın
3. **HTTPS**: Her zaman SSL kullanın
4. **Environment Variables**: Coolify secrets kullanın

## 📦 Volumes

Kalıcı dosyalar için:
- `/app/public/uploads` - Yüklenen dosyalar
- `/app/public/download` - İndirilebilir dosyalar
