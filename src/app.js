const express = require('express');

const cors = require('cors');
const compression = require('compression');

const cookieParser = require('cookie-parser');

const coreAuthRouter = require('./routes/coreRoutes/coreAuth');
const coreApiRouter = require('./routes/coreRoutes/coreApi');
const coreDownloadRouter = require('./routes/coreRoutes/coreDownloadRouter');
const corePublicRouter = require('./routes/coreRoutes/corePublicRouter');
const adminAuth = require('./controllers/coreControllers/adminAuth');

const errorHandlers = require('./handlers/errorHandlers');
const erpApiRouter = require('./routes/appRoutes/appApi');
const smiloIntegrationRouter = require('./routes/smiloIntegration');
const { multiTenantMiddleware } = require('./middlewares/multiTenant');

const fileUpload = require('express-fileupload');
// create our Express app
const app = express();

// CORS Configuration for both development and production
const allowedOrigins = [
  // Production domains
  'https://finance.smiloai.com',
  'https://console.smiloai.com',
  'https://smiloai.com',
  'https://api.smiloai.com',
  'https://workflow.smiloai.com',
  // Development
  'http://localhost:8080',
  'http://localhost:8888',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression());

// // default options
// app.use(fileUpload());

// Here our API Routes

// SmiloAI Integration Routes (webhook'ler için auth yok)
app.use('/api/smilo', smiloIntegrationRouter);

// Normal auth routes
app.use('/api', coreAuthRouter);

// Conditional multi-tenant based on environment
const isMultiTenant = process.env.ENABLE_MULTI_TENANT === 'true';

if (isMultiTenant) {
  // Multi-tenant routes for SmiloAI integration
  app.use('/api', adminAuth.isValidAuthToken, multiTenantMiddleware, coreApiRouter);
  app.use('/api', adminAuth.isValidAuthToken, multiTenantMiddleware, erpApiRouter);
} else {
  // Normal routes for standalone usage
  app.use('/api', adminAuth.isValidAuthToken, coreApiRouter);
  app.use('/api', adminAuth.isValidAuthToken, erpApiRouter);
}

// Public routes
app.use('/download', coreDownloadRouter);
app.use('/public', corePublicRouter);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// production error handler
app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
module.exports = app;
