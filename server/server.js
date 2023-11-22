const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());


app.get("/message", (req, res) => {
  res.json({ message: "wassup" });
});

app.listen(8000, () => {
  console.log(`Server is running on port 8000.`);
});