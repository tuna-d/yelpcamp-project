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
  for (let i = 0; i < 200; i++) {
    const randNumCity = Math.floor(Math.random() * cities.length)
    const randNumTitle = Math.floor(Math.random() * campTitles.length)
    const randNumDesc = Math.floor(Math.random() * campDesc.length)
    const camp = new Campground({
      title: `${campTitles[randNumTitle]}`,
      location: `${cities[randNumCity].city}, ${cities[randNumCity].state}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[randNumCity].longitude,
          cities[randNumCity].latitude,
        ],
      },
      description: `${campDesc[randNumDesc]}`,
      price: `${Math.floor(Math.random() * 25) + 10}`,
      author: "67e1b10f682c5167c6b67fcd",
      images: [
        {
          url: "https://res.cloudinary.com/dirdof2ca/image/upload/v1743866414/YelpCamp/csdhlgm7u7x15txzz0xx.jpg",
          fileName: "YelpCamp/csdhlgm7u7x15txzz0xx",
        },
        {
          url: "https://res.cloudinary.com/dirdof2ca/image/upload/v1744812546/wei-pan-Ta0A1miYZKc-unsplash_ldldme.jpg",
          fileName: "YelpCamp/wei-pan-Ta0A1miYZKc-unsplash_ldldme",
        },
      ],
    })
    await camp.save()
  }
}

seedDb().then(() => {
  mongoose.connection.close()
})
