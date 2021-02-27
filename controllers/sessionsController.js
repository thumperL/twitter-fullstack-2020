const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const db = require('../models');

const { User } = db;

const sessionsController = {
  registerPage: (req, res) => res.render('regist'),
  register    : (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不一致');
      return res.redirect('/regist');
    }
    User.findOne({
      where: { [Op.or]: [{ email: req.body.email }, { account: req.body.account }] },
    }).then((user) => {
      if (user.account === req.body.account) {
        req.flash('error messages', '帳號已經有人用了');
        return res.redirect('/regist');
      }
      if (user.email === req.body.email) {
        req.flash('error_messages', '此信箱已存在');
        return res.redirect('/regist');
      }

      User.create({
        email   : req.body.email,
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null),
        name    : req.body.name,
        account : req.body.account,
      }).then((user) => {
        req.flash('success_message', '成功註冊帳號');
        return res.redirect('/login');
      });
    });
  },
  loginPage: (req, res) => {
    res.render('login');
  },

  login: (req, res) => {
    res.redirect('/');
  },

  logout: (req, res) => {
    req.logout();
    res.redirect('/login');
  },
};
module.exports = sessionsController;
