const express = require('express');
const { listUsers, createUser, updateUser, removeUser, approveUser, rejectUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.patch('/:id/approve', approveUser);
router.patch('/:id/reject', rejectUser);
router.delete('/:id', removeUser);

module.exports = router;