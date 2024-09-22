"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();
let tasks = [];
router.post('/add-task', upload.single('file'), (req, res) => {
    const { name, description } = req.body;
    const file = req.file;
    if (file) {
        const fileData = {
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            buffer: file.buffer
        };
        tasks.push({ name, description, photo: fileData });
    }
    else {
        tasks.push({ name, description });
    }
    res.redirect('/');
});
router.post('/update-task', (req, res) => {
    res.redirect('/');
});
router.get('filter', (req, res) => {
    res.render('index', { tasks });
});
router.get('/', (req, res) => {
    // WORKS!!!
    //admin.database().ref('/').push("another test");
    res.render('index', { tasks });
});
exports.default = router;
//# sourceMappingURL=index.js.map