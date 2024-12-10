const mongoose = require("mongoose")
const Campground = require("../models/campground")
const cities = require("./cities")
const campTitles = require("./campTitle")
const campDesc = require("./campDesc")

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
    const randNumDesc = Math.floor(Math.random() * campDesc.length)
    const camp = new Campground({
      title: `${campTitles[randNumTitle]}`,
      location: `${cities[randNumCity].city}, ${cities[randNumCity].state}`,
      image: `https://picsum.photos/400?random=${Math.random()}`,
      description: `${campDesc[randNumDesc]}`,
      price: `${Math.floor(Math.random() * 25) + 10}`,
    })
    await camp.save()
  }
}

seedDb().then(() => {
  mongoose.connection.close()
})
