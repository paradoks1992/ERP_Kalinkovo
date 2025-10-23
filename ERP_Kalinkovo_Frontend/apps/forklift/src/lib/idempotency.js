import { v4 as uuid } from "uuid";

// добавляем идемпотентность к любому axios-запросу
export const withIdempotency = (fn, operation) => {
  return async (...args) => {
    const key = uuid();
    const headers = { "Idempotency-Key": key, "X-Operation": operation };
    try {
      return await fn({ headers });
    } catch (e) {
      throw e;
    }
  };
};
