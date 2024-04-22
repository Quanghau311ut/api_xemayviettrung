var express = require("express");
var router = express.Router();
var connection = require("../service/dataconnect");

//GetAll
router.get("/getall", function (req, res) {
  var query = "SELECT * FROM slide";
  connection.query(query, function (error, result) {
    if (error) res.send("Lỗi thao tác csdl");
    res.json(result);
  });
});

//GetdatabyID
router.get("/get-once/:MaSlide", function (req, res) {
  var query = "SELECT * FROM slide WHERE MaSlide=" + req.params.MaSlide;
  connection.query(query, function (error, result) {
    if (error) res.send("Lỗi thao tác csdl");
    res.json(result);
  });
});




//Edit
router.post("/edit/:MaSlide", function (req, res) {
  if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
    res.status(400).send("Invalid request body");
    return;
  }

  console.log(req.body);
  var query =
    "UPDATE slide SET TenSlide=?, Anh=?, Link=?, updated_at=NOW() WHERE MaSlide=?";
  var values = [
    req.body[0].TenSlide,
    req.body[0].Anh,
    req.body[0].Link,
    req.body.MaSlide,
  ];

  connection.query(query, values, function (error, result) {
    if (error) {
      console.error(error);
      res.status(500).send("Lỗi thao tác csdl: " + error.message); // Sending the error message to the client
    } else {
      res.json(result);
    }
  });
});

//Create
router.post("/add", function (req, res) {
  var query =
    "INSERT INTO slide(TenSlide,Anh,Link) VALUES (?, ?, ?)";
  var values = [
    req.body.TenSlide,
    req.body.Anh,
    req.body.Link
  ];

  connection.query(query, values, function (error, result) {
    if (error) {
      console.error("Lỗi thao tác csdl:", error);
      res.send("Lỗi thao tác csdl");
    } else {
      console.log("Dữ liệu đã được thêm:", result);
      res.json(result);
    }
  });
});

//Delete
router.delete("/delete/:MaSlide", function (req, res) {
  var query = "DELETE FROM slide WHERE MaSlide = ?";
  var MaSlide = req.params.MaSlide; // Capture the parameter

  connection.query(query, [MaSlide], function (error, result) {
    if (error) {
      console.error("Error executing query:", error);
      return res.status(500).send("Lỗi thao tác csdl");
    }

    res.json(result);
  });
});

//Search
router.get("/search", function (req, res) {
  const keyword = req.query.keyword;

  if (!keyword) {
    return res.status(400).json({ error: "Missing keyword parameter" });
  }
  const query = `SELECT * FROM slide WHERE TenSlide LIKE ?; `;

  connection.query(query, [`%${keyword}%`], function (error, results) {
    if (error) {
      console.error("Error executing query", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log(results);

    res.json(results);
  });
});

module.exports = router;
