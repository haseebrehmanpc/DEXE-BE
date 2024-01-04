const { DateTime } = require("luxon");
const SIGNATURE_LIFETIME = 500;
class ExpirationTimestamp {
  _currentTimestamp = 0;

  get currentTimestamp() {
    if (this._currentTimestamp === 0) {
      this._currentTimestamp = Math.floor(DateTime.now().toMillis() / 1000);
    }
    return this._currentTimestamp;
  }

  get expirationTimestamp() {
    return this.currentTimestamp + SIGNATURE_LIFETIME;
  }
}

module.exports = { ExpirationTimestamp };
