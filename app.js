var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyparser = require('body-parser');

//thu vien upload file
var fileupload = require('express-fileupload');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');





//khai báo đường dẫn đến thư mục "uploads"
var uploadfileAPI = require('./routes/uploadfile');

var routerMenu= require('./routes/menuApi');
var routerDanhmucxe=require('./routes/danhmucxeApi');
var routerSlide=require('./routes/slideApi');
var routerThuonghieu= require('./routes/thuonghieuApi');
var routerKhachhang= require('./routes/khachhangApi');
var routerNhacungcap=require('./routes/nhacungcapApi');
var routerDanhmuctintuc=require('./routes/danhmuctintucApi');
var routerXemay=require('./routes/xemayApi');
var routerAnhchitietxe=require('./routes/anhchitietxe');
var routerThongSoKyThuat=require('./routes/thongsokythuatApi');
var routerBinhLuan= require('./routes/binhluanApi');
var routerBaiviet=require('./routes/baivietApi');
var routerDathang= require('./routes/dathang');
var routerHoaDonXuat= require('./routes/hoadonxuatApi');
var routerDanhGia= require('./routes/danhgiaApi');
var routerSentMail=require('./routes/sentMail');
var routerThongKe=require('./routes/thongke');


var routerHoaDonNhap =require('./routes/hoadonnhapAPI');


var app = express();

const cors = require('cors');
    //
app.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    optionsSuccessStatus:200
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.set('view engine', 'hbs');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//cầu hình để biết vị trí thư mục "uploads"
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use("/menu",routerMenu);
app.use("/danh-muc-xe",routerDanhmucxe);
app.use("/slide",routerSlide);
app.use("/thuong-hieu",routerThuonghieu);
app.use("/khach-hang",routerKhachhang);
app.use("/nha-cung-cap",routerNhacungcap);
app.use("/danh-muc-tin-tuc",routerDanhmuctintuc);
app.use("/xe-may",routerXemay);
app.use("/anh-chi-tiet-xe",routerAnhchitietxe);
app.use("/thong-so-ky-thuat",routerThongSoKyThuat);
app.use("/binh-luan",routerBinhLuan);
app.use("/bai-viet",routerBaiviet);
app.use("/hoa-don-nhap",routerHoaDonNhap);
app.use("/hoa-don-xuat",routerHoaDonXuat);
app.use("/don-hang",routerDathang);
app.use("/upload", uploadfileAPI);
app.use("/danh-gia",routerDanhGia);
app.use("/mail",routerSentMail);
app.use("/thong-ke",routerThongKe);


app.use("/public/uploads/", express.static("public/uploads/"))




// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
// app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.send('Lỗi: ' + err.message);
// });
app.use(function(err, req, res, next) {
    // Ghi log lỗi vào console
    console.error(err.stack);
    
    // Render trang "error" với thông báo lỗi
    res.status(500).render('error', { error: err });
});



module.exports = app;