var router = require('express').Router()

// controllers
var adminController = require('../controllers/adminUserController')

// signup
router.route('/admin/signup')
  .get(adminController.signupGet)
  .post(adminController.signupPost)

router.route('/admin/login')
    .get(adminController.loginGet)
    .post(adminController.loginPost)

router.route('/reset/:token')
      .get(adminController.resetGet)
      .post(adminController.resetPost)

router.route('/admin/forgot')
        .get(adminController.forgotGet)
        .post(adminController.forgotPost)

router.get('/signout', adminController.signout)
router.get('/activate/:token',adminController.activateAccount)

// router.post('/user/addnote', (req, res, next) => {
//   User.findOne({_id: req.user._id}, (err, user) => {
//     if (err) return next(err)
//     var date = Date.now()
//     var message = req.body.message
//     var subject = req.body.subject
//     var date = req.body.date
//     User.findById({_id: req.user._id}, (err) => {
//       if (err) return next(err)
//       user.tasks.push({
//         date: new Date(date),
//         subject: subject,
//         task: message
//       })
//       user.save((err, data) => {
//         if (err) return next(err)
//         res.redirect('/user/'+user.username)
//       })
//     })
//     })
//   })

module.exports = router
