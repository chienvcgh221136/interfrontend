const User = require('../models/User');
const Admin = require('../models/Admin');

exports.getMe = async (req, res) => {
  try {
    const { id, role } = req.user; // Lấy từ middleware verifyToken
    let userProfile;

    if (role === 'admin') {
      userProfile = await Admin.findById(id).select('-password');
    } else {
      userProfile = await User.findById(id).select('-password');
    }

    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Trả về thông tin user/admin với cấu trúc nhất quán
    res.json({
      id: userProfile._id,
      username: userProfile.username,
      role: userProfile.role || 'user', // Đảm bảo role luôn tồn tại
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};