const router = require('express').Router()

// require controllers
var tagsController = require('../controllers/tagsController')

router.route('/tags')                   // Render tha tags page
    .get(tagsController.getTags)

router.route('/add/tags')               //Api to generate tags data
    .get(tagsController.postTagsApi)

router.route('/tags/add')
    .post(tagsController.insertTag)

router.route('/api/tags')
      .get(tagsController.getTagsApi)

router.route('/tags/edit/:tag')
        .get(tagsController.editOnlyTags)
        .post(tagsController.editOnlyTagsPost)

router.route('/search/tags')
        .get(tagsController.tagSearch)
        .post(tagsController.tagSearchPost)

router.get('/tags/delete/:tag_name', tagsController.tagDelete)
router.post('/user/add/tag', tagsController.editUserTag)
router.post('/insert/tag', tagsController.editSinleUserTag)

module.exports = router
