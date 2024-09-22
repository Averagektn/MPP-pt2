"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * GET home page.
 */
const express = require("express");
const router = express.Router();
const urlencodedParser = express.urlencoded({ extended: false });
let tasks = [{ name: 'test', description: 'desc' }];
router.get('/', (req, res) => {
    res.render('index', { tasks });
});
router.post('/add-task', urlencodedParser, (req, res) => {
    tasks.push({ name: req.body.name, description: req.body.description });
    res.redirect('/');
});
exports.default = router;
//# sourceMappingURL=index.js.map