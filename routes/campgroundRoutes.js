const express = require("express")
const router = express.Router()

const catchAsync = require("../utils/catchAsync")
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware")

const multer = require("multer")
const { storage } = require("../cloudinary")
const upload = multer({ storage })

const campground = require("../controllers/campground")

router
  .route("/")
  .get(catchAsync(campground.index))
  .post(
    isLoggedIn,
    upload.array("campground[images]"),
    validateCampground,
    catchAsync(campground.createCampground)
  )

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
    upload.array("campground[images]"),
    validateCampground,
    catchAsync(campground.editCampground)
  )
  .delete(isAuthor, catchAsync(campground.deleteCampground))

module.exports = router
