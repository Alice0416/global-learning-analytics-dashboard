/**
 * Minimal validation helpers to avoid extra deps.
 * Throws error with .status=400 when invalid.
 */

function assert(condition, message, code = 'BAD_REQUEST') {
  if (!condition) {
    const err = new Error(message);
    err.status = 400;
    err.code = code;
    throw err;
  }
}

function isEmail(str) {
  return /.+@.+\..+/.test(str);
}

function requireBodyFields(body, fields) {
  for (const f of fields) {
    assert(Object.prototype.hasOwnProperty.call(body, f), `Missing field: ${f}`);
    assert(body[f] !== undefined && body[f] !== null, `Invalid field: ${f}`);
  }
}

module.exports = { assert, isEmail, requireBodyFields };

