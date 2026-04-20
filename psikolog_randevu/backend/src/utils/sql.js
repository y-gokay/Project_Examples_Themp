'use strict';

/**
 * PostgreSQL LIKE / ILIKE için wildcard karakterlerini escape eder.
 * % _ \ karakterleri sorgu manipülasyonuna yol açabilir.
 */
const escapeLike = (str) => str.replace(/[\\%_]/g, '\\$&');

module.exports = { escapeLike };
