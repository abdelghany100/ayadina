const {  getDataForSearchCtr , getAllUserByFilterCtr } = require('../controller/userController');
const { verifyToken } = require('../middlewares/verifyToken');

const router = require('express').Router();


router.route("/get-data-search").get(verifyToken , getDataForSearchCtr)
router.route("/filter-data-search").get(verifyToken , getAllUserByFilterCtr)
module.exports = router;
