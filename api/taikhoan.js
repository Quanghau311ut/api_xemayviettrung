var express = require("express");
var router = express.Router();
var connection = require("../service/dataconnect");

//getall-nguoidung-taikhoan

router.get('/getall', function(req, res, next) {
   var sql = "SELECT * FROM `nguoidung`";
   connection.query(sql, function(err, results) {
       if (err) {
           throw err;
       }
       console.log(results); // good
       res.json(results);
   })
});

//getdataby-MaNguoiDung
router.get("/get-one/:MaNguoiDung", (req, res) => {
  const { MaNguoiDung } = req.params;

  // SQL query to retrieve specific user and account based on MaNguoiDung
  const query = `
     SELECT *
     FROM NguoiDung AS nd
     INNER JOIN TaiKhoan AS tk ON nd.ManguoiDung = tk.MaNguoiDung
     WHERE nd.ManguoiDung = ?;
   `;

  // Execute the query with the MaNguoiDung parameter
  connection.query(query, [MaNguoiDung], (error, results, fields) => {
    if (error) {
      console.error("Error retrieving data:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    // Check if the user with the provided ID exists
    if (results.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Send the fetched user and account data as a JSON response
    res.status(200).json({ userData: results[0] });
  });
});


//tạo mới

router.post('/register', async (req, res) => {
  try {
    // Hash the password

    // SQL query to insert user data into the database
    const query = `
      INSERT INTO nguoidung 
      (HoTen, NgaySinh, GioiTinh, AnhDaiDien, DiaChi, Email, DienThoai, TrangThai, created_at, updated_at, MatKhau) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
    `;
    
    // Values to be inserted into the database
    const values = [
      req.body.HoTen,
      req.body.NgaySinh,
      req.body.GioiTinh,
      req.body.AnhDaiDien,
      req.body.DiaChi,
      req.body.Email,
      req.body.DienThoai,
      req.body.TrangThai,
      req.body.MatKhau,
    ];

    // Execute the query
    connection.query(query, values, function(error, result) {
      if (error) {
        console.error('Error executing query:', error);
        return res.status(500).send('Database operation error');
      }
      res.json({ message: 'Account created successfully', userId: result.insertId });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).send('Error processing request');
  }
});

 
//đăng nhập
router.post("/dangnhap", (req, res) => {
  const { Email, MatKhau } = req.body;

  // SQL query to check username and password in the TaiKhoan table
  const query = "SELECT * FROM nguoidung WHERE Email = ? AND MatKhau = ?";

  // Execute the query with the provided username and password
  connection.query(query, [Email, MatKhau], (error, results) => {
    if (error) {
      console.error("Error authenticating Email:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    if (results.length === 0) {
      // No matching username and password found
      res.status(401).json({ error: "Invalid Email or MatKhau" });
      return;
    }

    // User authenticated successfully
    res.status(200).json({ message: "Login successful", userData: results[0] });
  });
});

//xóa
router.delete('/delete/:ManguoiDung', function(req, res) {
   var query = "DELETE FROM nguoidung WHERE ManguoiDung = ?";
   var ManguoiDung = req.params.ManguoiDung; // Capture the parameter

   connection.query(query, [ManguoiDung], function(error, result) {
       if (error) {
           console.error('Error executing query:', error);
           return res.status(500).send('Lỗi thao tác csdl');
       }
       
       res.json(result);
   });
});



module.exports = router;
