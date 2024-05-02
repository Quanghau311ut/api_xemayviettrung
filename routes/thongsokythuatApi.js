var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//getall
router.get('/get-all', function(req, res) {
    var query = 'SELECT * FROM thongsokythuat';

    connection.query(query, function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            res.json(results);
        }
    });
});


//get-one
router.get('/get-one/:id_thong_so_ky_thuat', function(req, res) {
    var id_thong_so_ky_thuat = req.params.id_thong_so_ky_thuat;
    var query = 'SELECT * FROM thongsokythuat WHERE id_thong_so_ky_thuat = ?';

    connection.query(query, id_thong_so_ky_thuat, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            if (result.length === 0) {
                res.status(404).send('Không tìm thấy thông số kỹ thuật');
            } else {
                res.json(result[0]);
            }
        }
    });
});



//add
router.post('/add', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem các trường thông tin cần thiết đã được cung cấp chưa
    if (!req.body || !req.body.id_xe || !req.body.dung_tich_xilanh || !req.body.cong_suat_toi_da || !req.body.momen_xoan_toi_da || !req.body.tieu_hao_nhien_lieu || !req.body.hop_so || !req.body.trong_luong) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var query = "INSERT INTO thongsokythuat (id_xe, dung_tich_xilanh, cong_suat_toi_da, momen_xoan_toi_da, tieu_hao_nhien_lieu, hop_so, trong_luong, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
    var values = [req.body.id_xe, req.body.dung_tich_xilanh, req.body.cong_suat_toi_da, req.body.momen_xoan_toi_da, req.body.tieu_hao_nhien_lieu, req.body.hop_so, req.body.trong_luong];

    connection.query(query, values, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            console.log('Thêm thành công bản ghi:', result);
            res.json(result);
        }
    });
});




//edit
router.post('/edit/:id_thong_so_ky_thuat', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem các trường thông tin cần thiết đã được cung cấp chưa
    if (!req.body || !req.body.dung_tich_xilanh || !req.body.cong_suat_toi_da || !req.body.momen_xoan_toi_da || !req.body.tieu_hao_nhien_lieu || !req.body.hop_so || !req.body.trong_luong) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var id_thong_so_ky_thuat = req.params.id_thong_so_ky_thuat;
    var query = "UPDATE thongsokythuat SET dung_tich_xilanh = ?, cong_suat_toi_da = ?, momen_xoan_toi_da = ?, tieu_hao_nhien_lieu = ?, hop_so = ?, trong_luong = ?, updated_at = CURRENT_TIMESTAMP WHERE id_thong_so_ky_thuat = ?";
    var values = [req.body.dung_tich_xilanh, req.body.cong_suat_toi_da, req.body.momen_xoan_toi_da, req.body.tieu_hao_nhien_lieu, req.body.hop_so, req.body.trong_luong, id_thong_so_ky_thuat];

    connection.query(query, values, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            console.log('Chỉnh sửa thành công bản ghi:', result);
            res.json(result);
        }
    });
});



//delete    
router.delete('/delete/:id_thong_so_ky_thuat', function(req, res) {
    var id_thong_so_ky_thuat = req.params.id_thong_so_ky_thuat;
    var query = 'DELETE FROM thongsokythuat WHERE id_thong_so_ky_thuat = ?';

    connection.query(query, id_thong_so_ky_thuat, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            console.log('Xóa thành công bản ghi:', result);
            res.json(result);
        }
    });
});


//search
router.get('/search', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Tạo câu truy vấn SQL để tìm kiếm thông số kỹ thuật dựa trên từ khóa tìm kiếm
    var query = 'SELECT * FROM thongsokythuat WHERE 1 = 1';
    var values = [];

    // Thêm điều kiện tìm kiếm cho mỗi trường nếu từ khóa tìm kiếm được cung cấp từ client
    if (req.body.keyword) {
        var keyword = '%' + req.body.keyword + '%';
        query += ' AND (dung_tich_xilanh LIKE ? OR cong_suat_toi_da LIKE ? OR momen_xoan_toi_da LIKE ? OR tieu_hao_nhien_lieu LIKE ? OR hop_so LIKE ? OR trong_luong LIKE ?)';
        values.push(keyword, keyword, keyword, keyword, keyword, keyword);
    }

    connection.query(query, values, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            res.json(result);
        }
    });
});






module.exports = router;