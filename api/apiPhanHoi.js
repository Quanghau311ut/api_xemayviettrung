var express = require("express");
var router = express.Router();
var connection = require("../service/dataconnect");

//GetAll
router.get("/getall", function (req, res) {
  var query = "SELECT * FROM phanhoi";
  connection.query(query, function (error, result) {
    if (error) res.send("Lỗi thao tác csdl");
    res.json(result);
  });
});

//GetdatabyID
router.get("/get-once/:MaPhanHoi", function (req, res) {
  var query = "SELECT * FROM phanhoi WHERE MaPhanHoi=" + req.params.MaPhanHoi;
  connection.query(query, function (error, result) {
    if (error) res.send("Lỗi thao tác csdl");
    res.json(result);
  });
});


//Create
router.post("/add", function (req, res) {
  var query =
    "INSERT INTO phanhoi(Email,NoiDung) VALUES (?, ?)";
  var values = [
    req.body.Email,
    req.body.NoiDung
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
router.delete("/delete/:MaPhanHoi", function (req, res) {
  var query = "DELETE FROM phanhoi WHERE MaPhanHoi = ?";
  var MaPhanHoi = req.params.MaPhanHoi; // Capture the parameter

  connection.query(query, [MaPhanHoi], function (error, result) {
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
  const query = `SELECT * FROM phanhoi WHERE Email LIKE ?; `;

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
