if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}
const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const mongoSanitize = require("express-mongo-sanitize")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const ExpressError = require("./utils/ExpressError")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const flash = require("connect-flash")
const passport = require("passport")
const passportLocalStrategy = require("passport-local")
const User = require("./models/user")
const helmet = require("helmet")
const dbUrl = process.env.DB_URL
const secret = process.env.SECRET
const localDbUrl = "mongodb://127.0.0.1:27017/yelpCamp"

const campgroundRoutes = require("./routes/campgroundRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const userRoutes = require("./routes/userRoutes")
const { contentSecurityPolicy } = require("helmet")

mongoose.connect(dbUrl)

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
app.use(mongoSanitize())
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "/public")))
app.use(helmet())

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
]
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
]
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
]
const fontSrcUrls = []
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dirdof2ca/",
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
)

const store = MongoStore.create({
  mongoUrl: localDbUrl,
  secret: secret,
  touchAfter: 24 * 3600,
})

store.on("error", function (e) {
  console.log("Session store error!", e)
})

const sessionConfig = {
  store,
  name: "dln_ss",
  secret: secret,
  resave: false,
  saveUninitialized: true,
  httpOnly: true,
  //secure: true,
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

const port = 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
