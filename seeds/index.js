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
      geometry: { type: "Point", coordinates: [32.854183, 39.920856] },
      description: `${campDesc[randNumDesc]}`,
      price: `${Math.floor(Math.random() * 25) + 10}`,
      author: "67e1b10f682c5167c6b67fcd",
      images: [
        {
          url: "https://res.cloudinary.com/dirdof2ca/image/upload/v1743866414/YelpCamp/csdhlgm7u7x15txzz0xx.jpg",
          fileName: "YelpCamp/csdhlgm7u7x15txzz0xx",
        },
        {
          url: "https://res.cloudinary.com/dirdof2ca/image/upload/v1743866415/YelpCamp/r8mp479jehdrfor8wt8r.jpg",
          fileName: "YelpCamp/r8mp479jehdrfor8wt8r",
        },
      ],
    })
    await camp.save()
  }
}

seedDb().then(() => {
  mongoose.connection.close()
})
