import { v4 as uuid } from "uuid";
export const withIdempotency = (fn, operation) => {
  return async (...args) => {
    const key = uuid();
    const headers = { "Idempotency-Key": key, "X-Operation": operation };
    return fn({ headers });
  };
};
