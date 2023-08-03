const CustomAPIError = require('../errors/custom-error')
const Task = require('../models/task')
const { StatusCodes } = require('http-status-codes')

const addTask = async (req, res, next) => {
    try {
        const { taskInfo, completionDate, title } = req.body
        if (!completionDate || !taskInfo || !title) {
            throw new CustomAPIError('Add taskInfo and completion date', 404)
        } else if (taskInfo && taskInfo.length > 160) {
            throw new CustomAPIError('Task content is too long', 400)
        }else if (title && title.length > 50) {
            throw new CustomAPIError('Title is too long', 400)
        } else {
            await Task.create({ ...req.body, completionDate: new Date(completionDate) })
            return res.status(StatusCodes.CREATED).json({ status: 'ok', msg: 'Task has been added successfully' })
        }
    } catch (error) {
        next(error)
    }
}

const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({})
        tasks.forEach(async (task) => {
            if (task.status !== 'completed' && task.status !== 'cancelled') {
                if (task.completionDate < new Date() && task.status != 'delayed') {
                    await Task.findOneAndUpdate({
                        _id: task._id
                    },
                        { status: 'delayed' },
                        { new: true, runValidators: true })
                } else if (task.completionDate > new Date() && task.status != 'pending') {
                    await Task.findOneAndUpdate({
                        _id: task._id
                    },
                        { status: 'pending' },
                        { new: true, runValidators: true })
                }
            }
        })
        let allTasks = await Task.find({}).sort({ "completionDate": 1 })
        if (!allTasks) {
            throw new CustomAPIError('Some error occured', 500)
        }
        return res.status(StatusCodes.OK).json({ status: 'ok', count: allTasks.length, allTasks })
    } catch (error) {
        next(error)
    }
}


const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id
        })
        if (!task) {
            throw new CustomAPIError('Task not found', 404)
        }
        return res.status(StatusCodes.OK).send({ status: 'ok', msg: 'Task has been removed' })
    } catch (error) {
        next(error)
    }
}

const deleteSelectedTasks = async (req, res) => {
    try {
        const ids = req.params.id.split('$')
        const newIds = ids.splice(1, ids.length)
        newIds.forEach(async (id) => {
            const task = await Task.findOne({ _id: id })
            if (task) {
                await Task.findOneAndDelete({ _id: id })
            }
        });
        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'All selected tasks have been successfully deleted' })
    } catch (error) {
        next(error)
    }

}


const editTask = async (req, res) => {
    try {
        const taskId = req.params.id

        const task = await Task.findOne({ _id: taskId })
        if (!task) {
            throw new CustomAPIError('task not found', 404)
        }
        const updatedTask = await Task.findOneAndUpdate({
            _id: taskId
        },
            req.body,
            { new: true, runValidators: true })
        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'Task has been updated', updatedTask })
    } catch (error) {
        next(error)
    }

}
module.exports = {
    addTask,
    getAllTasks,
    deleteTask,
    editTask,
    deleteSelectedTasks
}
