const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Serve static files from "project" folder
app.use(express.static(__dirname));

// Default route → sign in page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/auth/signin.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
