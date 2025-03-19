const authorizeRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).send({ error: "Permission Denied" })
    }
    next()
}

module.exports = authorizeRole 