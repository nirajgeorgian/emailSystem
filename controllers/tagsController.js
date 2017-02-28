var faker = require('faker')
var tagRoute = require('../model/tagsModel')
var adminRoute = require('../model/adminUserSchema')
var userSchema = require('../model/userSchema')

module.exports = {
  getTags: (req, res, next) => {
    if(!req.user) {
      res.redirect('/admin/login')
    } else {
      adminRoute.findOne({admin_username: req.user.admin_username}, (err, adminUser) => {
        if (err) return next(err)
        tagRoute.find({}, (err, allTags) => {
          if (err) return next(err)
          // var admin_user = req.user.admin_username
          // var filterTags = allTags.filter(function(tag) {
          //   return (tag.tagList.tag_created_by == admin_user)
          // })
          if(allTags.length > 0) {
            res.render('pages/tags',{
              tags: allTags,
              users: adminUser,
              success: req.flash("success"),
              failure: req.flash("failure")
            })
          } else {
            res.render('pages/tags',{
              tags: '',
              users: adminUser,
              success: req.flash("success"),
              failure: req.flash("failure")
            })
          }
        })
      })
    }
  },
  getTagsApi: (req, res, next) => {
    if (!req.user) {
      res.redirect('/admin/login')
    } else {
      tagRoute.find({}, (err, tagsFound) => {
        if (err) return next(err)
        res.json(tagsFound)
      })
    }
  },
  postTagsApi: (req, res, next) => {
    if (!req.user) {
      res.redirect('/admin/login')
    } else {
      for(var i = 0; i < 10; i++) {
        var tagsData = new tagRoute()
        tagsData.tag_name = faker.random.word()
        tagsData.tag_created_by = req.user.admin_username
        tagsData.tag_creation_date = new Date()
        tagsData.save((err) => {
          if (err) return next(err)
          console.log("Successfully added tags " + i);
        })
      }
      return res.redirect('/tags')
    }
  },
  insertTag: (req, res, next) => {
    if(!req.user) {
      res.redirect('/admin/login')
    } else {
      var tagData = new tagRoute()
      tagData.tag_name = req.body.tagList;
      tagRoute.findOne({tag_name: req.body.tagList}, (err, tagDataRes) => {
        if (err) return next(err)
        if(tagDataRes) {
          // Tag already present so skip it
          req.flash("success", "Tag already present")
          return res.redirect('/tags')
        } else {
          // Tag not present so insert it
          tagData.tag_created_by = req.user.admin_username
          tagData.tag_creation_date = new Date()
          // Save the data to tags
          tagData.save((err) => {
            if (err) return next(err)
            console.log("Tag successfully added")
            req.flash("success","Successfully added your tag")
            return res.redirect('/tags')
          })
        }
      })
    }
  },
  tagDelete: (req, res, next) => {
    if(!req.user) {
      res.redirect('/admin/login')
    } else {
      var tagParam = req.params.tag_name
      tagRoute.remove({tag_name: tagParam}, (err, data) => {
        if (err) return next(err)
        userSchema.update({}, {$pull: {"user_tagList" : {"name": tagParam}}}, {multi: true}, (err, removed) => {
          if (err) return next(err)
          req.flash("failure", "successfully deleted your tag")
          return res.redirect('/tags')
        })
      })
    }
  },
  editUserTag: (req, res, next) => {
    if(!req.user) {
      res.redirect('/admin/login')
    } else {
      tagRoute.find({}, (err, data) => {
        if (err) return next(err)
        if(data.length != 0) {
          var tagData = new tagRoute()
          tagData.tag_name = req.body.tagList
          tagRoute.findOne({tag_name: req.body.tagList}, (err, tagDataFound) => {
            if(tagDataFound){
              //Tag is there in tags now  only check in user to add or skip
              userSchema.find({$and: [{"user_email": req.body.email}, {"user_tagList.name": req.body.tagList}]}, (err, userWthTag) => {
                if (err) return next(err)
                if(userWthTag.length == 0) {
                  userSchema.findOne({user_email: req.body.email}, (err, userFound) => {
                    if (err) return next(err)
                    // User not having tag so add it
                    userFound.user_tagList.push({
                      id: tagDataFound._id,
                      name: req.body.tagList
                    })
                    userFound.save((err) => {
                      if (err) return next(err)
                      req.flash("success", "successfully added " + req.body.tagList + " tag to " + req.body.email)
                      return res.redirect('/')
                    })
                  })
                // res.json("if statement")
                } else {
                  // Tag alreadt present to it
                  req.flash("failure", "Tag " + req.body.tagList + " is already present to " + req.body.email)
                  return res.redirect('/')
                // res.json("else block")
                }
                // res.json(userWthTag)
              })
            } else {
              // Update tags inside both the user and well as tags
              tagData.tag_created_by = req.user.admin_username
              tagData.tag_creation_date = new Date()
              tagData.save((err, savedData) => {                       // Tags updated
                if (err) return next(err)
                  userSchema.findOne({user_email: req.body.email}, (err, userTagList) => {
                    if (err) return next(err)
                    userTagList.user_tagList.push({
                      id: savedData._id,
                      name: req.body.tagList
                    })
                    userTagList.save((err) => {
                      if (err) return next(err)
                      req.flash("success", "Successfully added " + req.body.tagList + " tag to " + req.body.email + " and tags")
                      return res.redirect('/')
                    })
                  })
              })
            }
          })
        }
      })
    }
  },
  editOnlyTags: (req, res, next) => {
    if (!req.user) {
      res.redirect('/admin/login')
    } else {
      var tagParam = req.params.tag
      tagRoute.find({tag_name:tagParam}, (err, foundTag) => {
        if (err) return next(err)
        res.render('forms/edit', {
          tags: foundTag[0].tag_name
        })
      })
    }
  },
  editOnlyTagsPost: (req, res, next) => {
    if(!req.user) {
      res.redirect('/admin/login')
    } else {
      var tagParam = req.params.tag
      var tagBody = req.body.tags
      tagRoute.update({"tag_name": tagParam}, {$set: {'tag_name': tagBody}}, (err, tagsUpdated) => {
        if (err) return next(err)
        userSchema.update({"user_tagList.name": tagParam}, {$set: {"user_tagList.$.name": tagBody}}, {multi: true}, (err, usersTagsUpdated) => {
          if (err) return next(err)
          req.flash("success", "Successfully updated your tag")
          return res.redirect('/tags')
        })
      })
    }
  },
  editSinleUserTag: (req, res, next) => {
    if(!req.user) {
      res.redirect('/admin/login')
    } else {
      tagRoute.find({}, (err, data) => {
        if (err) return next(err)
        if(data.length != 0) {
          var tagData = new tagRoute()
          tagData.tag_name = req.body.tagList
          tagRoute.findOne({tag_name: req.body.tagList}, (err, tagDataFound) => {
            if(tagDataFound){
              //Tag is there in tags now  only check in user to add or skip
              userSchema.find({$and: [{"user_email": req.body.email}, {"user_tagList.name": req.body.tagList}]}, (err, userWthTag) => {
                if (err) return next(err)
                if(userWthTag.length == 0) {
                  userSchema.findOne({user_email: req.body.email}, (err, userFound) => {
                    if (err) return next(err)
                    // User not having tag so add it
                    userFound.user_tagList.push({
                      id: tagDataFound._id,
                      name: req.body.tagList
                    })
                    userFound.save((err) => {
                      if (err) return next(err)
                      req.flash("success", "successfully added " + req.body.tagList + " tag to " + req.body.email)
                      return res.redirect('/user/'+req.body.username)
                    })
                  })
                // res.json("if statement")
                } else {
                  // Tag alreadt present to it
                  req.flash("failure", "Tag " + req.body.tagList + " is already present to " + req.body.email)
                  return res.redirect('/user/'+req.body.username)
                // res.json("else block")
                }
                // res.json(userWthTag)
              })
            } else {
              // Update tags inside both the user and well as tags
              tagData.tag_created_by = req.user.admin_username
              tagData.tag_creation_date = new Date()
              tagData.save((err, savedData) => {                       // Tags updated
                if (err) return next(err)
                  userSchema.findOne({user_email: req.body.email}, (err, userTagList) => {
                    if (err) return next(err)
                    userTagList.user_tagList.push({
                      id: savedData._id,
                      name: req.body.tagList
                    })
                    userTagList.save((err) => {
                      if (err) return next(err)
                      req.flash("success", "Successfully added " + req.body.tagList + " tag to " + req.body.email + " and tags")
                      return res.redirect('/user/'+req.body.username)
                    })
                  })
              })
            }
          })
        }
      })
    }
  },
  tagSearch: (req, res, next) => {
    if (!req.user) {
      res.redirect('/admin/login')
    } else {
      res.json("hello")
    }
  },
  tagSearchPost: (req, res, next) => {
    if(!req.user) {
      res.redirect('/admin/login')
    } else {
      console.log(req.body.tagsearch)
      tagRoute.find({"tag_name": req.body.tagsearch}, (err, tagsFound) => {
        if(tagsFound.length != 0) {
          res.json(tagsFound)
        } else {
          res.json({
            "data": req.body.tagsearch
          })
        }
      })
    }
  },
  search: (req,res, next) => {
    if (!req.user) {
      res.redirect('/admin/login')
    } else {

      console.log(req.body.tagsearch)
    }
  },
  universalSearchTag: (req, res, next) => {
    if(!req.user) {
      res.redirect('/admin/login')
    } else {
      tagRoute.find({}, (err, found) => {
        if (err) return next(err)
        res.json(found)
      })
    }
  },
  tagOption: (req, res, next) => {
    if(!req.user) {
      res.redirect('/admin/login')
    } else {
      var tagName = req.params.tagname
      console.log(tagName);
      res.render('pages/singleTags')
    }
  }
}
