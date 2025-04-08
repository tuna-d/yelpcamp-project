const deleteImages = document.querySelectorAll(".img-thumbnail")

deleteImages.forEach((img) => {
  img.addEventListener("click", () => {
    img.classList.toggle("opacity-50")
  })
})
