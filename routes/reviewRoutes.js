const express = require("express")
const router = express.Router({ mergeParams: true })

const catchAsync = require("../utils/catchAsync")
const Review = require("../models/review")
const Campground = require("../models/campground")
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware")

router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    const review = new Review({
      ...req.body.review,
    })
    review.author = req.user._id
    await review.save()
    campground.reviews.push(review)
    await campground.save()
    req.flash("success", "Your review successfully saved!")
    res.redirect(`/campgrounds/${id}`)
  })
)

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
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
