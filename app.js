const express = require("express")
const port = 3000
const path = require("path")
const bodyParser = require("body-parser")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
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

app.get("/", (req, res) => {
  res.render("home")
})

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render("campgrounds/index", { campgrounds })
})

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new")
})

app.get("/campgrounds/:id/edit", async (req, res) => {
  const { id } = req.params
  const findCamp = await Campground.findById(id)
  res.render("campgrounds/edit", { findCamp })
})

app.get("/campgrounds/:id", async (req, res) => {
  const { id } = req.params
  const findCamp = await Campground.findById(id)
  res.render("campgrounds/show", { findCamp })
})

app.post("/campgrounds", async (req, res) => {
  await new Campground({
    ...req.body,
  }).save()

  res.redirect("/campgrounds")
})

app.put("/campgrounds/:id", async (req, res) => {
  const { id } = req.params
  await Campground.findByIdAndUpdate(
    id,
    {
      ...req.body,
    },
    { runValidators: true }
  )
  res.redirect(`/campgrounds/${id}`)
})

app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params
  await Campground.findByIdAndDelete(id)
  res.redirect("/campgrounds")
})
