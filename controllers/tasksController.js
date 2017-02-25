// model for tasks
var tasksModel = require('../model/tasksModel')

module.exports = {
  getAllTask: (req, res, next) => {
    if(!req.user) {
      res.redirect('/admin/login')
    } else {
      tasksModel.find({}, (err, taskData) => {
        if (err) return next(err)
        res.render('pages/tasks',{
          success: req.flash("success"),
          failure: req.flash("failure"),
          totalTask: taskData
        })
      })
    }
  },
  checkTrue: (req, res, next) => {
    if(!req.user) {
      res.redirect('/admin/login')
    } else {
      var task_id = req.params.task_id
      tasksModel.findById({_id: task_id}, (err, foundTask) => {
        if (err) return next(err)
        if(foundTask.done == false) {
          foundTask.done = true
        } else {
          foundTask.done = false
        }
        foundTask.save((err) => {
          if (err) return next(err)
          res.redirect('/tasks')
        })
      })
    }
  }
}
