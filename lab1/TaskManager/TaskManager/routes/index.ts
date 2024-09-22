/*
 * GET home page.
 */
import express = require('express');
const router = express.Router();

let tasks = [{ name: 'test', description: 'desc' }];

router.get('/', (req: express.Request, res: express.Response) => {
    res.render('index', { tasks });
});

router.post('/add-task', (req: express.Request, res: express.Response) => {
    //tasks.push({ name: req.body.name, description: req.body.description });
    res.redirect('/');
});

export default router;