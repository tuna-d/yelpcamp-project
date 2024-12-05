const mongoose = require("mongoose")
const Campground = require("../models/campground")
const cities = require("./cities")
const campTitles = require("./campTitle")

mongoose.connect("mongodb://127.0.0.1:27017/yelpCamp")

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
  console.log("Database connected")
})

const seedDb = async () => {
  await Campground.deleteMany({})
  for (let i = 0; i < 50; i++) {
    const randNumCity = Math.floor(Math.random() * cities.length)
    const randNumTitle = Math.floor(Math.random() * campTitles.length)
    const camp = new Campground({
      title: `${campTitles[randNumTitle]}`,
      location: `${cities[randNumCity].city}, ${cities[randNumCity].state}`,
    })
    await camp.save()
  }
}

seedDb().then(() => {
  mongoose.connection.close()
})
