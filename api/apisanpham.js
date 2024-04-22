var express = require("express");
var router = express.Router();
var connection = require("../service/dataconnect");

//GetAll
router.get("/getall", function (req, res) {
  var query = "SELECT * FROM sanpham";
  connection.query(query, function (error, result) {
    if (error) res.send("Lỗi thao tác csdl");
    res.json(result);
  });
});

//GetdatabyID
router.get("/get-once/:MaSanPham", function (req, res) {
  var query = "SELECT * FROM sanpham WHERE MaSanPham=" + req.params.MaSanPham;
  connection.query(query, function (error, result) {
    if (error) res.send("Lỗi thao tác csdl");
    res.json(result);
  });
});

// Route để lấy thông tin sản phẩm và thông số kỹ thuật và chi tiết ảnh SP
router.get('/getAllDataSanPhamByMaSanPham/:MaSanPham', (req, res) => {
  const MaSanPham = req.params.MaSanPham;

  const querySanPham = `SELECT * FROM SanPham WHERE MaSanPham = ${MaSanPham}`;
  const queryThongSo = `SELECT * FROM ThongSoKyThuat WHERE MaSanPham = ${MaSanPham}`;
  const queryChiTietAnh = `SELECT * FROM ChiTietAnhSanPham WHERE MaSanPham = ${MaSanPham}`;

  const result = {};

  // Lấy thông tin sản phẩm từ bảng SanPham
  connection.query(querySanPham, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu.' });
    } else {
      if (results.length === 0) {
        res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
      } else {
        result.sanPham = results[0]; // Lưu thông tin sản phẩm vào result
        // Tiếp tục truy vấn để lấy thông tin ThongSoKyThuat
        connection.query(queryThongSo, (error, results) => {
          if (error) {
            res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu.' });
          } else {
            result.thongSoKyThuat = results; // Lưu thông tin ThongSoKyThuat vào result
            // Tiếp tục truy vấn để lấy thông tin ChiTietAnhSanPham
            connection.query(queryChiTietAnh, (error, results) => {
              if (error) {
                res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu.' });
              } else {
                result.chiTietAnhSanPham = results; // Lưu thông tin ChiTietAnhSanPham vào result
                res.status(200).json({ data: result }); // Trả về kết quả cuối cùng
              }
            });
          }
        });
      }
    }
  });
});


//getsanphamtheoloai
router.get('/getDataSanPhamByMaDanhMuc/:MaDanhMuc', (req, res) => {
  const MaDanhMuc = req.params.MaDanhMuc;

  // Thực hiện truy vấn để lấy các sản phẩm thuộc danh mục có ID tương ứng
  const getProductByCategoryQuery = 'SELECT * FROM sanpham WHERE MaDanhMuc = ?';

  connection.query(getProductByCategoryQuery, [MaDanhMuc], (error, results, fields) => {
      if (error) {
          console.error('Lỗi truy vấn: ' + error);
          res.status(500).send('Lỗi server');
          return;
      }

      if (results.length === 0) {
          res.status(404).send('Không có sản phẩm nào thuộc danh mục này');
          return;
      }

      res.json(results); // Trả về danh sách sản phẩm thuộc danh mục có ID tương ứng
  });
});


//Edit
router.post("/edit/:MaSanPham", function (req, res) {
  if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
    res.status(400).send("Invalid request body");
    return;
  }

  console.log(req.body);
  var query =
    "UPDATE sanpham SET MaDanhMuc=?,TenSanPham=?, MoTa=?, AnhDaiDien=?,MaNhaSanXuat=?,SoLuong=?,LuotXem=?,GiaBan=?, updated_at=NOW() WHERE MaSanPham=?";
  var values = [
    req.body[0].MaDanhMuc,
    req.body[0].TenSanPham,
    req.body[0].MoTa,
    req.body[0].AnhDaiDien,
    req.body[0].MaNhaSanXuat,
    req.body[0].SoLuong,
    req.body[0].LuotXem,
    req.body[0].GiaBan,
    req.body.MaSanPham,
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
    "INSERT INTO sanpham(MaDanhMuc,TenSanPham,MoTa,AnhDaiDien,MaNhaSanXuat,SoLuong,LuotXem,GiaBan) VALUES (?, ?, ?,?,?,?,?,?)";
  var values = [
    req.body.MaDanhMuc,
    req.body.TenSanPham,
    req.body.MoTa,
    req.body.AnhDaiDien,
    req.body.MaNhaSanXuat,
    req.body.SoLuong,
    req.body.LuotXem,
    req.body.GiaBan,
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
router.delete("/delete/:MaSanPham", function (req, res) {
  var query = "DELETE FROM sanpham WHERE MaSanPham = ?";
  var maSanPham = req.params.MaSanPham; // Capture the parameter

  connection.query(query, [maSanPham], function (error, result) {
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
  const query = `SELECT * FROM sanpham WHERE TenSanPham LIKE ?; `;

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
