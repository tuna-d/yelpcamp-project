const express = require("express")
const router = express.Router()

const { campgroundSchema } = require("../validationSchemas")
const Campground = require("../models/campground")
const catchAsync = require("../utils/catchAsync")
const ExpressError = require("../utils/ExpressError")

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const errMsg = error.details.map((err) => err.message).join(",")
    throw new ExpressError(errMsg, 400)
  } else {
    next()
  }
}

router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
  })
)

router.get("/new", (req, res) => {
  res.render("campgrounds/new")
})

router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const { id } = req.params
    const findCamp = await Campground.findById(id)
    if (!findCamp) {
      req.flash("error", "Can not find campground!")
      return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { findCamp })
  })
)

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params
    const findCamp = await Campground.findById(id).populate("reviews")
    if (!findCamp) {
      req.flash("error", "Can not find campground!")
      return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { findCamp })
  })
)

router.post(
  "/",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground({
      ...req.body.campground,
    })
    await campground.save()
    req.flash("success", "Campgroud successfully saved!")
    res.redirect(`/campgrounds/${campground.id}`)
  })
)

router.put(
  "/:id",
  validateCampground,
  catchAsync(async (req, res) => {
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
  })
)

router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash("success", "Campgroud successfully deleted!")
    res.redirect("/campgrounds")
  })
)

module.exports = router
