const Campground = require("../models/campground")
const { cloudinary } = require("../cloudinary")
const mapboxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapboxToken = process.env.MAPBOX_TOKEN
const geocoder = mapboxGeocoding({ accessToken: mapboxToken })

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({})
  return res.render("campgrounds/index", { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
  return res.render("campgrounds/new")
}

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params
  const findCamp = await Campground.findById(id)
  if (!findCamp) {
    req.flash("error", "Can not find campground!")
    return res.redirect("/campgrounds")
  }
  return res.render("campgrounds/edit", { findCamp })
}

module.exports.showCampground = async (req, res) => {
  const { id } = req.params
  const findCamp = await Campground.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author")
  if (!findCamp) {
    req.flash("error", "Can not find campground!")
    return res.redirect("/campgrounds")
  }
  return res.render("campgrounds/show", { findCamp })
}

module.exports.createCampground = async (req, res, next) => {
  try {
    const geocode = await geocoder
      .forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
      })
      .send()
    const campground = new Campground({
      ...req.body.campground,
    })
    campground.images = req.files.map((file) => ({
      url: file.path,
      fileName: file.filename,
    }))
    campground.geometry = geocode.body.features[0].geometry
    campground.author = req.user._id
    await campground.save()
    req.flash("success", "Campgroud successfully saved!")
    return res.redirect(`/campgrounds/${campground.id}`)
  } catch (err) {
    next(err)
  }
}

module.exports.editCampground = async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findByIdAndUpdate(
    id,
    {
      ...req.body.campground,
    },
    { runValidators: true }
  )
  const images = req.files.map((file) => ({
    url: file.path,
    fileName: file.filename,
  }))
  campground.images.push(...images)
  await campground.save()
  if (req.body.deleteImages) {
    for (let fileName of req.body.deleteImages) {
      const filename = fileName
      await cloudinary.uploader.destroy(filename)
    }
    await campground.updateOne({
      $pull: { images: { fileName: { $in: req.body.deleteImages } } },
    })
  }
  req.flash("success", "Campgroud successfully saved!")
  return res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params
  await Campground.findByIdAndDelete(id)
  req.flash("success", "Campgroud successfully deleted!")
  return res.redirect("/campgrounds")
}
