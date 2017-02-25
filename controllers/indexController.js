var nodemailer = require('nodemailer')
var sgTransport = require('nodemailer-sendgrid-transport')
var secret = require('../config/secret')
var smtpTransport = nodemailer.createTransport(sgTransport(secret.mailOption))
//Custom helper function
var helperFunction = require('../helpers/helperFunction')
var User = require('../model/userSchema')
var Emails = require('../model/mailModel')

module.exports = {
  homePage: (req, res, next) => {                                                 // Homepage
    if (!req. user) {
      return res.redirect('/admin/login')
    } else {
      helperFunction.page(req, res, next)
    }
  },
  // Users configuration
  usersPage: (req, res, next) => {                                                // User configuration for sending mail
    page(req, res, next)
  },
  // User configuration
  userSendMail: (req, res, next) => {
    var subject = req.body.subject
    var message = req.body.message
    var toUser = req.body.email
    var username = req.body.toUsername
    User.findOne({user_email: req.user.email}, (err, userFound) => {
      if (err) return next(err)
      mailOptions = {
        to: toUser,
        from: 'admin@nirajgeorgian.me',
        subject: subject,
        text: message
      }
      smtpTransport.sendMail(mailOptions, (err, sended) => {
        if (err) return next(err)
        // var mail = new Mail()
        Emails.findOne({created_by: req.user.admin_email}, (err, foundMail) => {
          if (err) return next(err)
          foundMail.emailSended.push({
          id: req.body._id,
          message: message,
          subject: subject,
          dateOfSending: Date.now(),
          from: req.user.admin_username,
          to: toUser
          })
          foundMail.save((err, sended) => {
            if (err) return next(err)
            User.findOne({user_email: req.body.email}, (err, userForMail) => {
              if (err) return next(err)
              userForMail.user_admin_email.push({
                admin_name: req.user.admin_username,
                message: message,
                subject: subject,
                dateOfSending: Date.now(),
                from: req.user.admin_email
              })
              userForMail.save((err) => {
                if (err) return next(err)
                req.flash("success", "successfully sended your mail")
                res.redirect('/user/'+username)
              })
            })
          })
          // res.json(foundMail)
        })
       })
    })
  },
  singleUserView: (req, res, next) => {
    if(!req.user) {
      res.redirect('/admin/login')
    } else {
      var user_username = req.params.username
      User.findOne({user_username:user_username}, (err, userFound) => {
        if (err) return next(err)
        var totalTags = userFound.user_tagList
        var onlyTags = totalTags.map(function(tag_name) {
          return tag_name.name
        })
        // res.json(onlyTags)
        var totalMails = userFound.user_admin_email
        res.render('pages/user', {
          userTasks: userFound.user_tasks,
          email: totalMails,
          tags: onlyTags,
          userFound: userFound,
          success: req.flash("success"),
          failure: req.flash("failure")
        })
      })
    }
  }
}
