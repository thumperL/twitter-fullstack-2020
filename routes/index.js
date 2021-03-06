/* Use Express Router */
const express = require('express');

const router = express.Router();

const users = require('./modules/users');
const tweets = require('./modules/tweets');
const followships = require('./modules/followships');
const chatroom = require('./modules/chatroom');
const subscriptions = require('./modules/subscriptions');
const apis = require('./modules/apis');

// For Authentication and Admin Login
const passport = require('../config/passport');
const authenticationHelper = require('../middleware/authenticationHelper');
const adminController = require('../controllers/adminController');

// Admin Portal
router.get('/admin/', adminController.adminLoginPage);
router.get('/admin/signin', adminController.adminLoginPage);
router.post(
  '/admin/signin',
  passport.authenticate('local', { failureRedirect: '/admin/signin' }),
  (req, res, next) => {
    if (req.user.toJSON().role === 'admin') {
      return res.redirect('/admin/tweets');
    }
    req.flash('error_messages', '沒有權限');
    req.logout();
    return res.redirect('/signin');
  },
);
router.get('/admin/tweets', authenticationHelper.authenticatedAdmin, adminController.adminMain);
router.get('/admin/users', authenticationHelper.authenticatedAdmin, adminController.adminUsers);
router.delete('/admin/tweets/:id', authenticationHelper.authenticatedAdmin, adminController.deleteTweet);

// User authentication
router.use('/', users);

// Main functions
router.use('/followships/', authenticationHelper.authenticatedNonAdmin, followships);
router.use('/tweets/', authenticationHelper.authenticatedNonAdmin, tweets);
router.use('/chat/', authenticationHelper.authenticatedNonAdmin, chatroom);
router.use('/subscriptions/', authenticationHelper.authenticatedNonAdmin, subscriptions);

// Api functions
router.use('/api/', apis);

// 匯出路由器
module.exports = router;
