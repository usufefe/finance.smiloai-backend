/**
 * Tenant database bağlantısına tüm model'leri register eder
 * Her tenant kendi model instance'larına sahip olur
 */

module.exports = (tenantDb) => {
  // Core Models
  tenantDb.model('Admin', require('./coreModels/Admin').schema);
  tenantDb.model('AdminPassword', require('./coreModels/AdminPassword').schema);
  tenantDb.model('Setting', require('./coreModels/Setting').schema);
  tenantDb.model('Upload', require('./coreModels/Upload').schema);

  // App Models
  tenantDb.model('Client', require('./appModels/Client').schema);
  tenantDb.model('Invoice', require('./appModels/Invoice').schema);
  tenantDb.model('Quote', require('./appModels/Quote').schema);
  tenantDb.model('Payment', require('./appModels/Payment').schema);
  tenantDb.model('PaymentMode', require('./appModels/PaymentMode').schema);
  tenantDb.model('Taxes', require('./appModels/Taxes').schema);

  console.log('✅ All models registered for tenant database');
};
