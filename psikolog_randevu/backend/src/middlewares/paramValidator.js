'use strict';

/**
 * Route param'ını pozitif integer'a zorla.
 * Kullanım: router.get('/:id', intParam('id'), controller.fn)
 */
const intParam = (...names) => (req, res, next) => {
  for (const name of names) {
    const v = Number(req.params[name]);
    if (!Number.isInteger(v) || v <= 0) {
      return res.status(400).json({ success: false, message: 'Geçersiz parametre' });
    }
    req.params[name] = v; // string → number
  }
  next();
};

module.exports = { intParam };
