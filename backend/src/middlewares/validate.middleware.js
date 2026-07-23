import { ZodError } from "zod";
import ApiError from "../utils/ApiError.js";

// Validates req[part] (body/query/params) against a Zod schema and
// replaces it with the parsed (and coerced/defaulted) value, so
// downstream code always sees data that already matches the schema
// shape - no more manual Number(req.query.page) sprinkled around.
function validate(schema, part = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[part]);
      req[part] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return next(ApiError.badRequest('Validation failed', details));
      }
      next(err);
    }
  };
}

export default validate;