const User = require('../model/userSchema')
const Tags = require('../model/tagsModel')

// Custom function for pagination
module.exports = {
  page: function page(req, res, next) {
    var perPage = 15;
    var page = req.params.page;
    User
      .find()
      .skip(perPage * page)
      .limit(perPage)
      .exec(function(err, user) {
        if (err) return next(err)
        User.count().exec(function(err, count) {
          if (err) return next(err)
          res.render('pages/index', {
            users: user,
            singleUser: req.user,
            pages: parseInt(count/perPage),
            currentPage: 1,
            success: req.flash("success"),
            failure: req.flash("failure")
          })
        })
      })
  },
  tagsPage: function(req, res, next) {
    var perPage = 15;
    var page = req.params.page;
    Tags
      .find()
      .skip(perPage * page)
      .limit(perPage)
      .exec(function(err, tags) {
        if (err) return next(err)
        Tags.count().exec(function(err, count) {
          if (err) return next(err)
          res.render('pages/tags', {
            pages: parseInt(count/perPage),
            currentPage: 1,
            tags: tags,
            success: req.flash("success"),
            failure: req.flash("failure")
          })
        })
      })
  }
}
