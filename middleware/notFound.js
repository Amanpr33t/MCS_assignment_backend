const CustomAPIError = require('../errors/custom-error')
const notFound = (req, res) => {
    throw new CustomAPIError('Route not found', 404)
}
module.exports = notFound

