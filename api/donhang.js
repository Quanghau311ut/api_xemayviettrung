var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

// GET ALL ORDERS
router.get('/get', (req, res) => {
   connection.query('SELECT * FROM DonHang', (error, results, fields) => {
       if (error) {
           res.json(error);
       } else {
           if (results.length > 0) {
               res.json(results);
           } else {
               res.json({ message: "Không tìm thấy đơn hàng nào" });
           }
       }
   });
});


// LẤY ORDER THEO ID
router.get('/getById/:MaDonHang', (req, res) => {
   let MaDonHang = req.params.MaDonHang;

   connection.query('SELECT * FROM DonHang where MaDonHang=?', MaDonHang, (error, results, fields) => {
       if (error) {
           res.json(error);
       } else {
           if (results.length > 0) {
               res.json(results[0]);
           } else {
               res.json({ message: "Không tìm thấy đơn hàng" });
           }
       }
   });
});

router.get('/details', (req, res) => {
 // Execute SQL query to fetch all orders_details
 const sqlQuery = 'SELECT * FROM chitietdonhang';

 // Assuming you're using a database connection pool or ORM
 // Execute the SQL query to fetch all orders_details
 connection.query(sqlQuery, (err, result) => {
   if (err) {
     console.error('Error fetching orders_details:', err);
     res.status(500).json({ error: 'Error fetching orders_details' });
   } else {
     // Send the retrieved data as a JSON response
     res.json(result);
   }
 });
});

router.get('/getByOrderId/:MaDonHang', (req, res) => {
 const MaDonHang = req.params.MaDonHang;

 connection.query(
   'SELECT * FROM chitietdonhang WHERE MaDonHang = ?',
   MaDonHang,
   (error, results, fields) => {
     if (error) {
       res.status(500).json({ message: 'Lỗi khi lấy chi tiết đơn hàng', error: error });
     } else {
       res.status(200).json(results);
     }
   }
 );
});

router.get('/getOrderByProduct/:MaDonHang', (req, res) => {
   const MaDonHang = req.params.MaDonHang;
   const query = `
     SELECT f.*, chitietdonhang.SoLuongDat, chitietdonhang.GiaMua
     FROM chitietdonhang
     JOIN sanpham AS f ON f.MaSanPham = chitietdonhang.MaSanPham
     WHERE chitietdonhang.MaDonHang = ?
   `;
 
   connection.query(query, [MaDonHang], (err, results) => {
     if (err) {
       console.error('Error executing query:', err);
       res.status(500).json({ error: 'Internal server error' });
       return;
     }
 
     if (results.length === 0) {
       res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
       return;
     }
 
     res.status(200).json(results);
   });
 });
 
// ĐẶT ĐƠN HÀNG MỚI
router.post('/add', async (req, res) => {
   const { TrangThaiDonhang, MaNguoiDung, products } = req.body;

   if (MaNguoiDung !== null && MaNguoiDung > 0) {
       try {
           const insertOrderQuery = 'INSERT INTO donhang (TrangThaiDonhang, MaNguoiDung) VALUES (?, ?)';
           const orderData = [TrangThaiDonhang, MaNguoiDung];

           connection.beginTransaction(async (err) => {
               if (err) throw err;

               try {
                   const insertedOrder = await new Promise((resolve, reject) => {
                       connection.query(insertOrderQuery, orderData, (error, results) => {
                           if (error) {
                               connection.rollback(() => {
                                   reject(error);
                               });
                           } else {
                               resolve(results);
                           }
                       });
                   });

                   const orderId = insertedOrder.insertId;

                   for (const p of products) {
                       const productInfoQuery = 'SELECT * FROM sanpham WHERE MaSanPham = ?';
                       const productInfo = await queryDB(productInfoQuery, [p.MaSanPham]);

                       const inCart = parseInt(p.SoLuongDat);

                       if (productInfo.length > 0 && productInfo[0].SoLuong >= inCart) {
                           const insertOrderDetailsQuery = 'INSERT INTO ChiTietDonHang (MaDonHang, MaSanPham, SoLuongDat, GiaMua) VALUES (?, ?, ?, ?)';
                           const orderDetailsData = [orderId, p.MaSanPham, inCart, parseFloat(productInfo[0].GiaBan)];

                           await queryDB(insertOrderDetailsQuery, orderDetailsData);

                           const updateProductQuery = 'UPDATE SanPham SET SoLuong = SoLuong - ? WHERE MaSanPham = ?';
                           await queryDB(updateProductQuery, [inCart, p.MaSanPham]);
                       } else {
                           connection.rollback(() => {
                               res.json({ message: `Sản phẩm không đủ số lượng để đặt hàng`, success: false });
                           });
                           return;
                       }
                   }

                   connection.commit((err) => {
                       if (err) {
                           connection.rollback(() => {
                               throw err;
                           });
                       } else {
                           res.json({
                               message: `Đã đặt đơn hàng thành công với id đơn hàng ${orderId}`,
                               success: true,
                               order_id: orderId,
                               products
                           });
                       }
                   });
               } catch (error) {
                   connection.rollback(() => {
                       res.json(error);
                   });
               }
           });
       } catch (err) {
           res.json(err);
           console.log(err);
       }
   } else {
       res.json({ message: 'Đặt đơn hàng mới không thành công', success: false });
   }
});

async function queryDB(sql, values) {
   return new Promise((resolve, reject) => {
       connection.query(sql, values, (error, results) => {
           if (error) {
               reject(error);
           } else {
               resolve(results);
           }
       });
   });
}



// edit
router.put('/edit/:MaDonHang', function(req, res) {
   const query = "UPDATE donhang SET TrangThaiDonhang=? WHERE MaDonHang=?";
   const { TrangThaiDonhang } = req.body;
   const { MaDonHang } = req.params;
 
   // Assuming TrangThaiDonhang is a boolean value in the request body
   const valueToUpdate = TrangThaiDonhang === true ? 1 : 0;
 
   connection.query(query, [valueToUpdate, MaDonHang], function(error, result) {
     if (error) {
       console.error(error);
       res.status(500).send('Lỗi thao tác csdl: ' + error.message);
     } else {
       res.json(result);
     }
   });
 });
 
// Payment Gateway
router.post('/payment', async (req, res) => {
   try {
       // Giả lập thời gian chờ 3 giây trước khi trả về kết quả thành công
       await new Promise((resolve) => {
           setTimeout(() => {
               resolve();
           }, 3000);
       });

       res.status(200).json({ success: true });
   } catch (error) {
       res.status(500).json({ success: false, message: error.message });
   }
});


module.exports = router;