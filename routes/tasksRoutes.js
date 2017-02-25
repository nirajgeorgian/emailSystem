var router = require('express').Router()


// controller
var tasksController = require('../controllers/tasksController')

router.get('/tasks', tasksController.getAllTask)
router.get('/tasks/user/:task_id', tasksController.checkTrue)

module.exports = router
