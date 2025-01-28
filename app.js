const express = require("express")
const port = 3000
const path = require("path")
const bodyParser = require("body-parser")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const catchAsync = require("./utils/catchAsync")
const ExpressError = require("./utils/ExpressError")
const { campgroundSchema } = require("./validationSchemas")
const mongoose = require("mongoose")
const Campground = require("./models/campground")

mongoose.connect("mongodb://127.0.0.1:27017/yelpCamp")

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
  console.log("Database connected")
})

const app = express()

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "/views"))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(methodOverride("_method"))

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const errMsg = error.details.map((err) => err.message).join(",")
    throw new ExpressError(errMsg, 400)
  } else {
    next()
  }
}

app.get("/", (req, res) => {
  res.render("home")
})

app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
  })
)

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new")
})

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const { id } = req.params
    const findCamp = await Campground.findById(id)
    res.render("campgrounds/edit", { findCamp })
  })
)

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params
    const findCamp = await Campground.findById(id)
    res.render("campgrounds/show", { findCamp })
  })
)

app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground({
      ...req.body.campground,
    })
    await campground.save()

    res.redirect(`/campgrounds/${campground.id}`)
  })
)

app.put(
  "/campgrounds/:id",
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
    res.redirect(`/campgrounds/${id}`)
  })
)

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campgrounds")
  })
)

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found!", 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  res.status(statusCode).render("error", { err })
})
