const express = require("express")
const port = 3000
const path = require("path")
const bodyParser = require("body-parser")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const ExpressError = require("./utils/ExpressError")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport")
const passportLocalStrategy = require("passport-local")
const User = require("./models/user")

const campgroundRoutes = require("./routes/campgroundRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const userRoutes = require("./routes/userRoutes")

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

const sessionConfig = {
  secret: "yelpCampSecret",
  resave: false,
  saveUninitialized: true,
  httpOnly: true,
  cookie: {
    expires: Date.now() + 1000 * 3600 * 24 * 7,
    maxAge: 1000 * 3600 * 24 * 7,
  },
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportLocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  res.locals.currentUser = req.user
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  next()
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

app.get("/", (req, res) => {
  res.render("home")
})

app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)
app.use("/", userRoutes)

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found!", 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  res.status(statusCode).render("error", { err })
})
