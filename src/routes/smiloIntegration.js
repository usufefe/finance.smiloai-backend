const express = require('express');
const router = express.Router();
const { catchErrors } = require('@/handlers/errorHandlers');
const { setupNewTenant } = require('@/middlewares/multiTenant');
const jwt = require('jsonwebtoken');

/**
 * SmiloAI'dan gelen webhook - Yeni kullanıcı kaydı
 * POST /api/smilo/user-registered
 */
router.post('/user-registered', catchErrors(async (req, res) => {
  try {
    const { userId, email, name, surname, companyName } = req.body;
    
    // Webhook güvenliği için secret key kontrolü
    const webhookSecret = req.headers['x-webhook-secret'];
    const expectedSecret = process.env.SMILO_WEBHOOK_SECRET || 'smilo-idurar-webhook-secret-2024';
    
    if (webhookSecret !== expectedSecret) {
      console.error('Webhook auth failed. Expected:', expectedSecret, 'Got:', webhookSecret);
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized webhook request' 
      });
    }

    // Yeni tenant için database ve admin user oluştur
    const result = await setupNewTenant(userId, {
      email,
      name,
      surname,
      companyName
    });

    // IDURAR için JWT token oluştur
    const token = jwt.sign(
      { 
        id: result.admin._id,
        tenantId: userId,
        email: email
      },
      process.env.JWT_SECRET,
      { expiresIn: '90d' }
    );

    res.json({
      success: true,
      message: 'IDURAR account created successfully',
      data: {
        adminId: result.admin._id,
        token: token
      }
    });
  } catch (error) {
    console.error('User registration webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create IDURAR account',
      error: error.message
    });
  }
}));

/**
 * SmiloAI'dan gelen kullanıcı silme webhook'u
 * POST /api/smilo/user-deleted
 */
router.post('/user-deleted', catchErrors(async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Webhook güvenliği
    const webhookSecret = req.headers['x-webhook-secret'];
    if (webhookSecret !== process.env.SMILO_WEBHOOK_SECRET) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized webhook request' 
      });
    }

    // Tenant database'ini silme işlemi (opsiyonel - soft delete yapılabilir)
    // Gerçek silme yerine deaktive etmek daha güvenli olabilir
    
    res.json({
      success: true,
      message: 'IDURAR account deactivated',
      userId: userId
    });
  } catch (error) {
    console.error('User deletion webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete IDURAR account',
      error: error.message
    });
  }
}));

/**
 * SmiloAI'dan SSO login - Token exchange
 * POST /api/smilo/sso-login
 */
router.post('/sso-login', catchErrors(async (req, res) => {
  try {
    const { smiloToken } = req.body;
    
    // SmiloAI token'ını verify et
    // Bu kısım SmiloAI backend ile koordine edilmeli
    const response = await fetch('https://console.smiloai.com/api/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${smiloToken}`
      }
    });

    if (!response.ok) {
      return res.status(401).json({
        success: false,
        message: 'Invalid SmiloAI token'
      });
    }

    const smiloUser = await response.json();
    
    // IDURAR token oluştur
    const idurarToken = jwt.sign(
      { 
        id: smiloUser.idurarAdminId,
        tenantId: smiloUser.userId,
        email: smiloUser.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token: idurarToken,
      tenantId: smiloUser.userId
    });
  } catch (error) {
    console.error('SSO login error:', error);
    res.status(500).json({
      success: false,
      message: 'SSO login failed',
      error: error.message
    });
  }
}));

module.exports = router;
