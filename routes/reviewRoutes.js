const express = require("express")
const router = express.Router({ mergeParams: true })

const catchAsync = require("../utils/catchAsync")
const ExpressError = require("../utils/ExpressError")
const { reviewSchema } = require("../validationSchemas")
const Review = require("../models/review")
const Campground = require("../models/campground")

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const errMsg = error.details.map((err) => err.message).join(",")
    throw new ExpressError(errMsg, 400)
  } else {
    next()
  }
}

router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    const review = new Review({
      ...req.body.review,
    })
    await review.save()
    campground.reviews.push(review)
    await campground.save()
    res.redirect(`/campgrounds/${id}`)
  })
)

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { reviewId } = req.params
    const { id } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
  })
)

module.exports = router
