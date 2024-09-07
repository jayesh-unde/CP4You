const authController = require('./controllers/auth-controller');
const authMiddlewares = require('./middlewares/authMiddlewares')
const router = require('express').Router();

// authentication routes
router.post('/api/send-otp-email',authController.sendOtpEmail);
router.post('/api/verify-otp',authController.verifyOtp);
router.get('/api/refresh',authController.refresh); // to refresh the access token and refresh token
router.post('/api/login-email',authController.loginEmail);
router.post('/api/google-login', authController.googleLogin);
router.post('/api/logout',authController.logout);
module.exports = router;