const { post, getTotalDownloads } = require("../../controllers/pdfControllers/pdfController")

const app = require("express").Router()

app.post("/generate-pdf", post)
app.get("/total-downloads", getTotalDownloads)

module.exports = app