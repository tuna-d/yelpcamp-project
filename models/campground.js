const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Review = require("./review")

const ImageSchema = new Schema({
  url: String,
  fileName: String,
})

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/ar_16:9,w_200")
})

ImageSchema.virtual("headImage").get(function () {
  return this.url.replace("/upload", "/upload/h_350,c_scale,ar_16:9")
})

const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
})

CampgroundSchema.post("findOneAndDelete", async function (campground) {
  if (campground) {
    await Review.deleteMany({ _id: { $in: campground.reviews } })
  }
})

module.exports = mongoose.model("Campground", CampgroundSchema)
