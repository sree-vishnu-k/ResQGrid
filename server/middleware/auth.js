const jwt = require('jsonwebtoken');
const { ROLE_LEVEL } = require('../config/roles');
const userStore = require('../dataAccess').users;

/**
 * Verify the Authorization: Bearer <token> header and attach req.user.
 */
async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No session token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await userStore.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Session user not found or expired. Please sign in again.' });
    }
    if (user.active === false) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated. Contact an administrator.' });
    }
    if (user.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Account registration is pending administrator approval.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ success: false, message: 'Account registration was rejected by an administrator.' });
    }
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token. Please sign in again.' });
  }
}

/**
 * Restrict an endpoint to one of the listed roles (or higher privilege).
 * `roles` may be an array of role strings or a comparison string like '>=analyst'.
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized.' });
    const level = ROLE_LEVEL[req.user.role] || 0;
    let allowed = false;
    for (const r of roles) {
      if (typeof r === 'string' && r.startsWith('>=')) {
        if (level >= (ROLE_LEVEL[r.slice(2)] || 0)) allowed = true;
      } else if (req.user.role === r) {
        allowed = true;
      }
    }
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Insufficient privileges for this action.' });
    }
    return next();
  };
}

module.exports = { protect, authorize };