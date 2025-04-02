const express = require("express")
const router = express.Router()

const catchAsync = require("../utils/catchAsync")
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware")

const campground = require("../controllers/campground")

router
  .route("/")
  .get(catchAsync(campground.index))
  .post(isLoggedIn, validateCampground, catchAsync(campground.createCampground))

router.get("/new", isLoggedIn, campground.renderNewForm)

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campground.renderEditForm)
)

router
  .route("/:id")
  .get(catchAsync(campground.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(campground.editCampground)
  )
  .delete(isAuthor, catchAsync(campground.deleteCampground))

module.exports = router
