const Campground = require("../models/campground")

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render("campgrounds/index", { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new")
}

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params
  const findCamp = await Campground.findById(id)
  if (!findCamp) {
    req.flash("error", "Can not find campground!")
    return res.redirect("/campgrounds")
  }
  res.render("campgrounds/edit", { findCamp })
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
  res.render("campgrounds/show", { findCamp })
}

module.exports.createCampground = async (req, res, next) => {
  const campground = new Campground({
    ...req.body.campground,
  })
  campground.author = req.user._id
  await campground.save()
  req.flash("success", "Campgroud successfully saved!")
  res.redirect(`/campgrounds/${campground.id}`)
}

module.exports.editCampground = async (req, res) => {
  const { id } = req.params
  await Campground.findByIdAndUpdate(
    id,
    {
      ...req.body.campground,
    },
    { runValidators: true }
  )
  req.flash("success", "Campgroud successfully saved!")
  res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params
  await Campground.findByIdAndDelete(id)
  req.flash("success", "Campgroud successfully deleted!")
  res.redirect("/campgrounds")
}
