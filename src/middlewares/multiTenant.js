const mongoose = require('mongoose');

// Tenant (SmiloAI user) bazlı database bağlantıları saklamak için cache
const tenantConnections = new Map();

/**
 * SmiloAI user ID'sine göre tenant database bağlantısı oluşturur
 * @param {string} tenantId - SmiloAI user ID
 * @returns {mongoose.Connection} Tenant'a özel database bağlantısı
 */
const getTenantConnection = async (tenantId) => {
  // Cache'de varsa döndür
  if (tenantConnections.has(tenantId)) {
    return tenantConnections.get(tenantId);
  }

  // Yeni bağlantı oluştur
  const dbName = `idurar_tenant_${tenantId}`;
  const mongoUri = process.env.DATABASE.replace(/\/[^/?]+(\?|$)/, `/${dbName}$1`);
  
  const tenantDb = await mongoose.createConnection(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Model'leri bu bağlantıya register et
  require('../models/registerTenantModels')(tenantDb);

  // Cache'e kaydet
  tenantConnections.set(tenantId, tenantDb);
  
  console.log(`✅ Tenant database connected: ${dbName}`);
  return tenantDb;
};

/**
 * Express middleware - Her request'te tenant bağlantısını ayarlar
 */
const multiTenantMiddleware = async (req, res, next) => {
  try {
    // SmiloAI'dan gelen tenant ID (user ID)
    const tenantId = req.headers['x-tenant-id'] || req.user?.smiloUserId;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID required'
      });
    }

    // Tenant database bağlantısını al
    const tenantDb = await getTenantConnection(tenantId);
    
    // Request'e tenant bilgilerini ekle
    req.tenantId = tenantId;
    req.tenantDb = tenantDb;
    
    // Model'lere kolay erişim için
    req.models = {
      Invoice: tenantDb.model('Invoice'),
      Quote: tenantDb.model('Quote'),
      Payment: tenantDb.model('Payment'),
      Client: tenantDb.model('Client'),
      Admin: tenantDb.model('Admin'),
      Setting: tenantDb.model('Setting'),
      PaymentMode: tenantDb.model('PaymentMode'),
      Taxes: tenantDb.model('Taxes'),
    };

    next();
  } catch (error) {
    console.error('Multi-tenant middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection error'
    });
  }
};

/**
 * İlk kurulum - Yeni tenant için database ve admin user oluşturur
 */
const setupNewTenant = async (tenantId, userInfo) => {
  try {
    const tenantDb = await getTenantConnection(tenantId);
    
    // Admin modelini al
    const Admin = tenantDb.model('Admin');
    const AdminPassword = tenantDb.model('AdminPassword');
    const Setting = tenantDb.model('Setting');
    const PaymentMode = tenantDb.model('PaymentMode');
    const Taxes = tenantDb.model('Taxes');

    // Admin user oluştur
    const adminData = {
      email: userInfo.email,
      name: userInfo.name || 'Admin',
      surname: userInfo.surname || 'User',
      enabled: true,
      role: 'admin',
    };

    const newAdmin = await Admin.create(adminData);

    // Password hash (SmiloAI'dan gelecek veya random)
    const salt = mongoose.Types.ObjectId().toString();
    const password = userInfo.password || 'changeme123';
    const bcrypt = require('bcryptjs');
    const passwordHash = bcrypt.hashSync(salt + password, 10);

    await AdminPassword.create({
      admin: newAdmin._id,
      password: passwordHash,
      salt: salt,
      emailVerified: true,
    });

    // Default ayarları yükle
    const defaultSettings = require('../setup/defaultSettings/appSettings.json');
    await Setting.insertMany(defaultSettings);

    // Default payment modes
    const paymentModes = [
      { name: 'Nakit', description: 'Nakit Ödeme', enabled: true, isDefault: true },
      { name: 'Kredi Kartı', description: 'Kredi Kartı ile Ödeme', enabled: true },
      { name: 'Havale/EFT', description: 'Banka Havalesi', enabled: true },
    ];
    await PaymentMode.insertMany(paymentModes);

    // Default taxes
    const taxes = [
      { taxName: 'KDV %20', taxValue: '20', enabled: true, isDefault: true },
      { taxName: 'KDV %18', taxValue: '18', enabled: true },
      { taxName: 'KDV %8', taxValue: '8', enabled: true },
      { taxName: 'KDV %1', taxValue: '1', enabled: true },
      { taxName: 'KDV Muaf', taxValue: '0', enabled: true },
    ];
    await Taxes.insertMany(taxes);

    console.log(`✅ New tenant setup completed for: ${tenantId}`);
    return {
      success: true,
      admin: newAdmin,
      message: 'Tenant setup completed successfully'
    };
  } catch (error) {
    console.error('Tenant setup error:', error);
    throw error;
  }
};

module.exports = {
  multiTenantMiddleware,
  getTenantConnection,
  setupNewTenant,
};
