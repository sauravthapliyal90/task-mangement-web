import ApiError from "../utils/ApiError.js";

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}

export default authorize;
