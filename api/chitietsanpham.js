var express = require("express");
var router = express.Router();
var connection = require("../service/dataconnect");

//GetAll
router.get("/getall", function (req, res) {
  var query = "SELECT * FROM thongsokythuat";
  connection.query(query, function (error, result) {
    if (error) res.send("Lỗi thao tác csdl");
    res.json(result);
  });
});

//GetdatabyID
router.get("/get-once/:MaThongSo", function (req, res) {
  var query = "SELECT * FROM thongsokythuat WHERE MaThongSo=" + req.params.MaThongSo;
  connection.query(query, function (error, result) {
    if (error) res.send("Lỗi thao tác csdl");
    res.json(result);
  });
});

//getsanphamtheoloai
router.get('/getDataThongSoKyThuatByMaSanPham/:MaSanPham', (req, res) => {
  const MaSanPham = req.params.MaSanPham;

  // Thực hiện truy vấn để lấy các sản phẩm thuộc danh mục có ID tương ứng
  const getProductByCategoryQuery = 'SELECT * FROM thongsokythuat WHERE MaSanPham = ?';

  connection.query(getProductByCategoryQuery, [MaSanPham], (error, results, fields) => {
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
router.post("/edit/:MaThongSo", function (req, res) {
  if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
    res.status(400).send("Invalid request body");
    return;
  }

  console.log(req.body);
  var query =
    "UPDATE thongsokythuat SET MaSanPham=?,TenThongSo=?, MoTa=?, updated_at=NOW() WHERE MaThongSo=?";
  var values = [
    req.body[0].MaSanPham,
    req.body[0].TenThongSo,
    req.body[0].MoTa,
    req.body.MaThongSo,
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
    "INSERT INTO thongsokythuat(MaSanPham,TenThongSo,MoTa) VALUES (?, ?, ?)";
  var values = [
    req.body.MaSanPham,
    req.body.TenThongSo,
    req.body.MoTa,
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
router.delete("/delete/:MaThongSo", function (req, res) {
  var query = "DELETE FROM thongsokythuat WHERE MaThongSo = ?";
  var MaThongSo = req.params.MaThongSo; // Capture the parameter

  connection.query(query, [MaThongSo], function (error, result) {
    if (error) {
      console.error("Error executing query:", error);
      return res.status(500).send("Lỗi thao tác csdl");
    }

    res.json(result);
  });
});



module.exports = router;
