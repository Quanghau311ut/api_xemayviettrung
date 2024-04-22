var express = require("express");
var router = express.Router();
var connection = require("../service/dataconnect");

//GetAll
router.get("/getall", function (req, res) {
  var query = "SELECT * FROM ChiTietAnhSanPham";
  connection.query(query, function (error, result) {
    if (error) res.send("Lỗi thao tác csdl");
    res.json(result);
  });
});

//GetdatabyID
router.get("/get-once/:MaAnhChiTiet", function (req, res) {
  var query = "SELECT * FROM ChiTietAnhSanPham WHERE MaAnhChiTiet=" + req.params.MaAnhChiTiet;
  connection.query(query, function (error, result) {
    if (error) res.send("Lỗi thao tác csdl");
    res.json(result);
  });
});




//Edit
router.post("/edit/:MaAnhChiTiet", function (req, res) {
  if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
    res.status(400).send("Invalid request body");
    return;
  }

  console.log(req.body);
  var query =
    "UPDATE ChiTietAnhSanPham SET MaSanPham=?, Anh=?, TenAnh=?, updated_at=NOW() WHERE MaAnhChiTiet=?";
  var values = [
    req.body[0].MaSanPham,
    req.body[0].Anh,
    req.body[0].TenAnh,
    req.body.MaAnhChiTiet,
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
    "INSERT INTO ChiTietAnhSanPham(MaSanPham,Anh,TenAnh) VALUES (?, ?, ?)";
  var values = [
    req.body.MaSanPham,
    req.body.Anh,
    req.body.TenAnh
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
router.delete("/delete/:MaAnhChiTiet", function (req, res) {
  var query = "DELETE FROM ChiTietAnhSanPham WHERE MaAnhChiTiet = ?";
  var MaAnhChiTiet = req.params.MaAnhChiTiet; // Capture the parameter

  connection.query(query, [MaAnhChiTiet], function (error, result) {
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
  const query = `SELECT * FROM ChiTietAnhSanPham WHERE TenAnh LIKE ?; `;

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
