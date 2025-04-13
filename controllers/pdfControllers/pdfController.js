const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const EzUser = require("../../models/EzUser");
const jwt = require("jsonwebtoken");

// Get total downloads across all users
const getTotalDownloads = async (req, res) => {
    try {
        // Get total downloads by summing noOfDownloadedPdf from all users
        const result = await EzUser.aggregate([
            {
                $group: {
                    _id: null,
                    totalDownloads: { $sum: "$noOfDownloadedPdf" }
                }
            }
        ]);

        const totalDownloads = result[0]?.totalDownloads || 0;

        res.json({
            totalDownloads,
            message: "Total downloads retrieved successfully"
        });
    } catch (error) {
        console.error("Error getting total downloads:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const post = async(req , res)=>{
    try {
        const { html } = req.body;
        if (!html) {
          return res.status(400).json({ error: "HTML content is required" });
        }

        // Get user token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: "Authentication required" });
        }

        // Verify token and get user
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await EzUser.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
    
        // Launch Puppeteer
        const browser = await puppeteer.launch({
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Update this to your actual Chrome path
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
          });
          
    
        const page = await browser.newPage();
    
        // Set HTML content
        const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resume PDF</title>
              <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            .page-container { width: 100%; height: auto; }
              ul {
                   list-style-type: disc !important; /* Force bullet points */
                   padding-left:15px !important;
                  }
    
               ol {
                     list-style-type: decimal !important; /* Force numbers */
                     padding-left:15px !important;
                  }
          </style>
        </head>
        <body>
          ${html}
        </body>
        </html>
      `;
    
      await page.setContent(fullHtml, { waitUntil: "networkidle0" });
    
        // Generate PDF
        const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
        
        await browser.close();
    
        // Update user's download count
        user.noOfDownloadedPdf += 1;
        await user.save();
    
        // Send the PDF as a response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
        res.setHeader("Content-Length", pdfBuffer.length);
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        
        res.end(pdfBuffer);
        
        console.log("PDF Buffer Length:", pdfBuffer.length);
        console.log("Sending PDF to frontend...");
            
      } catch (error) {
        console.error("Error generating PDF:", error.message);
        res.status(500).json({ error: error });
        console.log(error)
      }
}

module.exports = { post, getTotalDownloads }