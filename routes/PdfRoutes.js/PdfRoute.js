const { post } = require("../../controllers/pdfControllers/pdfController")

const app = require("express").Router()

app.post("/generate-pdf",post)
module.exports = app