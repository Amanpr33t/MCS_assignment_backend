const express = require('express')
const router = express.Router()
const { addTask, getAllTasks, deleteTask, editTask, deleteSelectedTasks } = require('../controllers/tasks')

router.post('/addTask',  addTask)
router.get('/getAllTasks',  getAllTasks)
router.delete('/deleteTask/:id',  deleteTask)
router.patch('/editTask/:id',  editTask)
router.delete('/deleteSelectedTasks/:id',  deleteSelectedTasks)

module.exports = router