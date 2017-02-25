const router = require('express').Router()
var nodemailer = require('nodemailer')
var sgTransport = require('nodemailer-sendgrid-transport')
// Secret database
var secret = require('../config/secret')
// Custom controller's required
var indexController = require('../controllers/indexController')
//Custom helper function
var helperFunction = require('../helpers/helperFunction')

var smtpTransport = nodemailer.createTransport(sgTransport(secret.mailOption));

router.get('/', indexController.homePage)                                        // Homepage
router.get('/users/:page', indexController.homePage)                            // Single user page
router.route('/user/:username')
    .get(indexController.singleUserView)
router.post('/user/sendmail', indexController.userSendMail)
                      // Sending user a mail

module.exports = router
