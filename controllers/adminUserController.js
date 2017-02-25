var crypto = require('crypto')
var async = require('async')
var passport = require('passport')
var passportConfig = require('../config/passport')
var nodemailer = require('nodemailer')
var sgTransport = require('nodemailer-sendgrid-transport')
var ejs = require('ejs')
var fs = require('fs')
var secret = require('../config/secret')
const AdminUserSchema = require('../model/adminUserSchema')
const EmailSchema = require('../model/mailModel')
const TagsSchema = require('../model/tagsModel')

var smtpTransport = nodemailer.createTransport(sgTransport(secret.mailOption))

module.exports = {
  signupPost:(req, res, next) => {
    var adminUser = new AdminUserSchema()
    var mail = new EmailSchema()
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex')
          done(err, token)
        })
      },
      function(token, done) {
        adminUser.admin_first_name = req.body.first_name
        adminUser.admin_last_name = req.body.last_name
        adminUser.admin_email = req.body.email
        adminUser.admin_password = req.body.password
        adminUser.admin_username = req.body.username
        adminUser.admin_confirm = false

        AdminUserSchema.findOne({admin_email: req.body.email}, (err, adminExists) => {
          // if (err) return err;
          if (adminExists) {
            req.flash('errors',"Admin with that email address already exists")
            return res.redirect('/admin/signup')
          } else {
            mail.save(function(err, data) {
              if (err) return next(err)
              adminUser.admin_confirm_code = token
              adminUser.save((err, user) => {
                done(err, token, user)
              })
            })
          }
        })
      },
      function(token, user,done) {
        var emailTempRaw = fs.readFileSync('templates/userSignup.ejs', 'utf-8')
        var address = 'http://'+req.headers.host+'/activate/'+ token
        var mailOptions = {
          to: adminUser.admin_email,
          from: 'admin@nirajgeorgian.me',
          subject: 'Please confirm your account to get started with us.',
          // text: 'Please click on the link below to activate your account \n'+
          // 'http://'+req.headers.host+'/activate/'+ token+ '\n\n'
          html: ejs.render(emailTempRaw, {address: address})
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          // res.redirect('/login')
          var emailClient = new EmailSchema()
          emailClient.created_by = adminUser.admin_email
          emailClient.created_by_id = adminUser._id
          emailClient.save((err) => {
            if (err) return next(err)
            req.flash("success", "An confirmation email was sended to "+ adminUser.admin_email+".")
            done(err, 'done')
            // return res.redirect('/admin/signup')
          })
        })
      }
    ], function(err) {
      if (err) return next(err)
      res.redirect('/admin/signup')
    })
  },
  signupGet:(req, res) => {
    res.render('forms/signup', {
      errors: req.flash('errors'),
      success: req.flash('success')
    })
  },
  loginPost: passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/admin/login',
    failureFlash: true
  }),
  loginGet:(req, res) => {
    if (req.user) return res.redirect('/')
    res.render('forms/login', {
      message: req.flash('loginMessage'),
      success: req.flash('success'),
      info: req.flash('info')
    })
  },
  signout: (req, res, next) => {
    req.logout()
    res.redirect('/admin/login')
  },
  activateAccount: (req, res, next) => {
    AdminUserSchema.findOne({admin_confirm_code: req.params.token},(err, adminUser) => {
      if (!adminUser) {
        req.flash("error", "Password verification code is invalid")
        return res.redirect('/admin/code')
      } else {
        if(adminUser.admin_confirm == true) {
          req.flash("success", "Account already confirmed")
          return res.redirect('/admin/login')
        } else {
          adminUser.admin_confirm = true
          adminUser.save((err) => {
            if (err) return next(err)
            req.flash("success", "Account successfully confirmed")
            res.redirect('/admin/login')
          })
        }
      }
    })
  },
  resetGet:(req, res, next) => {
    AdminUserSchema.findOne({admin_resetPasswordToken: req.params.token, admin_resetPasswordExpires: {$gt: Date.now()}}, (err, adminUser) => {
      if (!adminUser) {
        req.flash('error', "Password reset token is invalid or expired")
        return res.redirect('/admin/forgot')
      }
      res.render('forms/reset', {
        user: req.user,
        error: req.flash('error')
      })
    })
  },
  resetPost:(req, res) => {
    async.waterfall([
      function(done) {
        AdminUserSchema.findOne({admin_resetPasswordToken: req.params.token, admin_resetPasswordToken: {$gt: Date.now()}}, (err, adminUser) => {
          if(!adminUser) {
            req.flash('error', "Password reset token is invalid or has expired")
            return res.redirect('/admin/forgot')
          }
          adminUser.admin_password = req.body.password
          adminUser.admin_resetPasswordToken = undefined
          adminUser.admin_resetPasswordExpires = undefined

          adminUser.save((err) => {
            if (err) return err;
            done(err, adminUser)
          })
        })
      },
      function(adminUser, done) {
        var emailTempRaw = fs.readFileSync('templates/userPasswordSuccess.ejs', 'utf-8')
        var username = adminUser.admin_username
        var address = 'http://'+req.headers.host+'/admin/login'
        var mailOptions = {
          to: adminUser.admin_email,
          from: 'admin@nirajgeorgian.me',
          subject: 'Your password has been successfully reset.',
          // text: 'Hello \n\n\n'+
          // 'Your password for email '+ adminUser.admin_email+ ' has been successfully reset'
          html: ejs.render(emailTempRaw, {username: username, address: address})
        }
        smtpTransport.sendMail(mailOptions, (err) => {
          req.flash('success', " Your password has been reset")
          return res.redirect('/admin/login')
        })
      }
    ],(err) => {
      res.redirect('/admin/forgot')
    })
  },
  forgotGet: (req,res) => {
    res.render('forms/forgot', {
      error: req.flash('error')
    })
  },
  forgotPost: (req, res, next) => {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20,(err, buf) => {
          if (err) throw err
          var token = buf.toString('hex')
          done(err, token)
        })
      },
      function(token, done) {
        AdminUserSchema.findOne({admin_email: req.body.email}, (err, adminUser) => {
          if (!adminUser) {
            req.flash('error', "No account found for "+ req.body.email + " address")
            return res.redirect('/admin/forgot')
          }
          adminUser.admin_resetPasswordToken = token
          adminUser.admin_resetPasswordExpires = Date.now() + 3600000
          // user.admin_confirm = false
          adminUser.save((err) => {
            done(err, token,adminUser)
          })
        })
      },
      function(token, adminUser, done) {
        var emailTempRaw = fs.readFileSync('templates/userPasswordReset.ejs', 'utf-8')
        var resetToken = 'http://'+req.headers.host+'/reset/'+token
        var emailTempCompiled = ejs.compile(emailTempRaw)
        var mailOptions = {
          to: adminUser.admin_email,
          from: 'admin@nirajgeorgian.me',
          subject: 'Your Password reset token.',
          // text: 'You are receiving this because someone requested password reset \n'+
          // 'Please click on the link below to reset your password \n'+
          // 'http://'+req.headers.host+'/reset/'+token+'\n\n'+
          // 'If you did not requested for password, Please ignore this email. \n\n'
          html: ejs.render(emailTempRaw,{token: resetToken})
        }
        smtpTransport.sendMail(mailOptions, (err) => {
          if (err){
            return console.log(err)
          } else {
            req.flash('success', "Successfully sended password reset to " + adminUser.admin_email)
            console.log("successfully sended email");
            return res.redirect('/admin/login')
          }
          done(err, 'done')
        })
      }
    ],function(error) {
      if (error) return next(error)
      res.redirect('/admin/login')
    })
  }
}
