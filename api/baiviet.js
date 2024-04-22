var express = require("express");
var router = express.Router();
var connection = require("../service/dataconnect");

//GetAll
router.get("/getall", function (req, res) {
  var query = "SELECT * FROM baiviet";
  connection.query(query, function (error, result) {
    if (error) res.send("Lỗi thao tác csdl");
    res.json(result);
  });
});

//GetdatabyID
router.get("/get-once/:MaBaiViet", function (req, res) {
  var query = "SELECT * FROM baiviet WHERE MaBaiViet=" + req.params.MaBaiViet;
  connection.query(query, function (error, result) {
    if (error) res.send("Lỗi thao tác csdl");
    res.json(result);
  });
});

//getsanphamtheoloai
router.get('/getDataBaiVietByMaDanhMucTin/:MaDanhMucTin', (req, res) => {
  const MaDanhMucTin = req.params.MaDanhMucTin;

  // Thực hiện truy vấn để lấy các sản phẩm thuộc danh mục có ID tương ứng
  const getProductByCategoryQuery = 'SELECT * FROM baiviet WHERE MaDanhMucTin = ?';

  connection.query(getProductByCategoryQuery, [MaDanhMucTin], (error, results, fields) => {
      if (error) {
          console.error('Lỗi truy vấn: ' + error);
          res.status(500).send('Lỗi server');
          return;
      }

      if (results.length === 0) {
          res.status(404).send('Không có bài viết nào thuộc danh mục này');
          return;
      }

      res.json(results); // Trả về danh sách sản phẩm thuộc danh mục có ID tương ứng
  });
});


//Edit
router.post("/edit/:MaBaiViet", function (req, res) {
  if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
    res.status(400).send("Invalid request body");
    return;
  }

  console.log(req.body);
  var query =
    "UPDATE baiviet SET MaDanhMucTin=?,TieuDe=?, MoTa=?, NoiDung=?,AnhBaiViet=?,TacGia=?,LuotXem=?, updated_at=NOW() WHERE MaBaiViet=?";
  var values = [
    req.body[0].MaDanhMucTin,
    req.body[0].TieuDe,
    req.body[0].MoTa,
    req.body[0].NoiDung,
    req.body[0].AnhBaiViet,
    req.body[0].TacGia,
    req.body[0].LuotXem,
    req.body.MaBaiViet,
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
    "INSERT INTO baiviet(MaDanhMucTin,TieuDe,MoTa,NoiDung,AnhBaiViet,TacGia,LuotXem) VALUES (?, ?, ?,?,?,?,?)";
  var values = [
    req.body.MaDanhMucTin,
    req.body.TieuDe,
    req.body.MoTa,
    req.body.NoiDung,
    req.body.AnhBaiViet,
    req.body.TacGia,
    req.body.LuotXem,
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
router.delete("/delete/:MaBaiViet", function (req, res) {
  var query = "DELETE FROM baiviet WHERE MaBaiViet = ?";
  var MaBaiViet = req.params.MaBaiViet; // Capture the parameter

  connection.query(query, [MaBaiViet], function (error, result) {
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
  const query = `SELECT * FROM baiviet WHERE TieuDe LIKE ?; `;

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
