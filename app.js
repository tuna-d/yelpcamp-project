const express = require("express")
const port = 3000
const path = require("path")
const bodyParser = require("body-parser")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const catchAsync = require("./utils/catchAsync")
const ExpressError = require("./utils/ExpressError")
const { campgroundSchema, reviewSchema } = require("./validationSchemas")
const mongoose = require("mongoose")
const Campground = require("./models/campground")
const Review = require("./models/review")

const campgroundRoutes = require("./routes/campgroundRoutes")
const reviewRoutes = require("./routes/reviewRoutes")

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
app.use(express.static(path.join(__dirname, "/public")))

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

app.get("/", (req, res) => {
  res.render("home")
})

app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found!", 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  res.status(statusCode).render("error", { err })
})
