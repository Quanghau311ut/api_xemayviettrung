var express = require("express");
var router = express.Router();
var connection = require("../service/dataconnect");

//GetAll
router.get("/getall", function (req, res) {
  var query = "SELECT * FROM nhacungcap";
  connection.query(query, function (error, result) {
    if (error) res.send("Lổi thao tác csdl");
    res.json(result);
  });
});

//GetdatabyID

router.get('/getdatabyID/:MaNhaCungCap', function(req, res) {
    var query = 'SELECT * FROM nhacungcap WHERE MaNhaCungCap=' + req.params.MaNhaCungCap;
    connection.query(query, function(error, result) {
        if (error) res.send('Lỗi thao tác csdl');
        res.json(result);
    });
});


//Edit
router.post("/edit/:MaNhaCungCap", function (req, res) {  
    var query = "UPDATE nhacungcap SET TenNhaCungCap=?, DiaChi=?, SoDienThoai=?, Email=?, updated_at=NOW() WHERE MaNhaCungCap=?";
    var values = [req.body.TenNhaCungCap, req.body.DiaChi, req.body.SoDienThoai, req.body.Email, req.params.MaNhaCungCap];
  
    connection.query(query, values, function (error, result) {
      if (error) {
        console.error(error);
        res.status(500).send("Lỗi thao tác csdl: " + error.message);
      } else {
        res.json(result);
      }
    });
  });
  

//Create
router.post("/add", function (req, res) {
  var query ="INSERT INTO nhacungcap(TenNhaCungCap, DiaChi, SoDienThoai, Email) VALUES (?,?,?,?)";
  var values = [
    req.body.TenNhaCungCap,
    req.body.DiaChi,
    req.body.SoDienThoai,
    req.body.Email
  ];

  connection.query(query, values, function (error, result) {
    if (error) {
      console.error("Lỗi thao tác csdl:", error);
      res.send("Lỗi thao tác csdl");
    } else {
      console.log("Dữ liệu đã được thêm:", result);
      res.json(result);
      console.log(result);
    }
  });
});

//Delete
router.delete("/delete/:MaNhaCungCap", function (req, res) {
  var query = "DELETE FROM nhacungcap WHERE MaNhaCungCap = ?";
  var MaNhaCungCap = req.params.MaNhaCungCap; // Capture the parameter

  connection.query(query, [MaNhaCungCap], function (error, result) {
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
  const query = `SELECT * FROM nhacungcap WHERE TenNhaCungCap LIKE ?; `;

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
