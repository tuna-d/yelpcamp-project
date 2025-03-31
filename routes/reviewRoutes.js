const express = require("express")
const router = express.Router({ mergeParams: true })

const catchAsync = require("../utils/catchAsync")
const Review = require("../models/review")
const Campground = require("../models/campground")
const { validateReview } = require("../middleware")

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
    req.flash("success", "Your review successfully saved!")
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
    req.flash("success", "Your review successfully deleted!")
    res.redirect(`/campgrounds/${id}`)
  })
)

module.exports = router
