const Campground = require("./models/campground")
const Review = require("./models/review")
const ExpressError = require("./utils/ExpressError")

const { campgroundSchema, reviewSchema } = require("./validationSchemas")

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl
    req.flash("error", "You must be signed in!")
    return res.redirect("/login")
  }
  next()
}

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo
  }
  next()
}

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  if (!campground.author.equals(req.user.id)) {
    req.flash("error", "Sorry, you're not allowed to do that.")
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params
  const review = await Review.findById(reviewId)
  if (!review.author.equals(req.user.id)) {
    req.flash("error", "Sorry, you're not allowed to do that.")
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const errMsg = error.details.map((err) => err.message).join(",")
    throw new ExpressError(errMsg, 400)
  } else {
    next()
  }
}

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const errMsg = error.details.map((err) => err.message).join(",")
    throw new ExpressError(errMsg, 400)
  } else {
    next()
  }
}

module.exports.isUsersProfile = (req, res, next) => {
  const { userId } = req.params
  if (userId !== req.user.id) {
    req.flash("error", "Sorry, you're not allowed to do that.")
    return res.redirect(`/profile/${userId}`)
  }
  next()
}

module.exports.preventSelfFollow = (req, res, next) => {
  const { userId } = req.params
  if (userId === req.user.id) {
    req.flash("error", "Sorry, you're not allowed to do that.")
    return res.redirect(`/profile/${userId}`)
  }
  next()
}
