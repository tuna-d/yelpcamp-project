const Review = require("../models/review")
const Campground = require("../models/campground")

module.exports.createReview = async (req, res) => {
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
}

module.exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params
  const { id } = req.params
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
  await Review.findByIdAndDelete(reviewId)
  req.flash("success", "Your review successfully deleted!")
  res.redirect(`/campgrounds/${id}`)
}
