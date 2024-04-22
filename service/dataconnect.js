var express = require('express');
var router = express.Router();
const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '002882',
    database: 'qlcuahangxemayviettrung',
});
// const connection = mysql.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     password: '',
//     database: 'qlch_banxemayviettrung',
// });


connection.connect((err) => {
    if (err) {
        console.error('Lỗi, không thể kết nối tới MySQL: ' + err.stack);
        return;
    }
    console.log('Kết nối tới MySQL thành công với ID: ' + connection.threadId);
});

module.exports = connection;