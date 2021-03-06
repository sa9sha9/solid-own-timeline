import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _objectSpread from "@babel/runtime/helpers/objectSpread";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _inherits from "@babel/runtime/helpers/inherits";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

/* global fetch */
import EventEmitter from 'events';
import { authnFetch } from './authn-fetch';
import { openIdpPopup, obtainSession } from './popup';
import { getSession, saveSession, clearSession } from './session';
import { defaultStorage } from './storage';
import { currentUrlNoParams } from './url-util';
import * as WebIdOidc from './webid-oidc'; // Store the global fetch, so the user is free to override it

var globalFetch = fetch;

var SolidAuthClient =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(SolidAuthClient, _EventEmitter);

  function SolidAuthClient() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, SolidAuthClient);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(SolidAuthClient)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "_pendingSession", void 0);

    return _this;
  }

  _createClass(SolidAuthClient, [{
    key: "fetch",
    value: function fetch(input, options) {
      return authnFetch(defaultStorage(), globalFetch, input, options);
    }
  }, {
    key: "login",
    value: function login(idp, options) {
      options = _objectSpread({}, defaultLoginOptions(currentUrlNoParams()), options);
      return WebIdOidc.login(idp, options);
    }
  }, {
    key: "popupLogin",
    value: function () {
      var _popupLogin = _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee(options) {
        var popup, session;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                options = _objectSpread({}, defaultLoginOptions(), options);

                if (!/https?:/.test(options.popupUri)) {
                  options.popupUri = new URL(options.popupUri || '/.well-known/solid/login', window.location).toString();
                }

                if (!options.callbackUri) {
                  options.callbackUri = options.popupUri;
                }

                popup = openIdpPopup(options.popupUri);
                _context.next = 6;
                return obtainSession(options.storage, popup, options);

              case 6:
                session = _context.sent;
                this.emit('login', session);
                this.emit('session', session);
                return _context.abrupt("return", session);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function popupLogin(_x) {
        return _popupLogin.apply(this, arguments);
      };
    }()
  }, {
    key: "currentSession",
    value: function () {
      var _currentSession = _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee2() {
        var storage,
            session,
            _args2 = arguments;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                storage = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : defaultStorage();
                _context2.next = 3;
                return getSession(storage);

              case 3:
                session = _context2.sent;

                if (session) {
                  _context2.next = 23;
                  break;
                }

                if (!this._pendingSession) {
                  _context2.next = 7;
                  break;
                }

                return _context2.abrupt("return", this._pendingSession);

              case 7:
                _context2.prev = 7;
                this._pendingSession = WebIdOidc.currentSession(storage);
                _context2.next = 11;
                return this._pendingSession;

              case 11:
                session = _context2.sent;
                _context2.next = 17;
                break;

              case 14:
                _context2.prev = 14;
                _context2.t0 = _context2["catch"](7);
                console.error(_context2.t0);

              case 17:
                delete this._pendingSession; // Save the session and emit session events

                if (!session) {
                  _context2.next = 23;
                  break;
                }

                _context2.next = 21;
                return saveSession(storage)(session);

              case 21:
                this.emit('login', session);
                this.emit('session', session);

              case 23:
                return _context2.abrupt("return", session);

              case 24:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[7, 14]]);
      }));

      return function currentSession() {
        return _currentSession.apply(this, arguments);
      };
    }()
  }, {
    key: "trackSession",
    value: function () {
      var _trackSession = _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee3(callback) {
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.t0 = callback;
                _context3.next = 3;
                return this.currentSession();

              case 3:
                _context3.t1 = _context3.sent;
                (0, _context3.t0)(_context3.t1);
                this.on('session', callback);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function trackSession(_x2) {
        return _trackSession.apply(this, arguments);
      };
    }()
  }, {
    key: "logout",
    value: function () {
      var _logout = _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee4() {
        var storage,
            session,
            _args4 = arguments;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                storage = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : defaultStorage();
                _context4.next = 3;
                return getSession(storage);

              case 3:
                session = _context4.sent;

                if (!session) {
                  _context4.next = 18;
                  break;
                }

                _context4.prev = 5;
                _context4.next = 8;
                return WebIdOidc.logout(storage, globalFetch);

              case 8:
                this.emit('logout');
                this.emit('session', null);
                _context4.next = 16;
                break;

              case 12:
                _context4.prev = 12;
                _context4.t0 = _context4["catch"](5);
                console.warn('Error logging out:');
                console.error(_context4.t0);

              case 16:
                _context4.next = 18;
                return clearSession(storage);

              case 18:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[5, 12]]);
      }));

      return function logout() {
        return _logout.apply(this, arguments);
      };
    }()
  }]);

  return SolidAuthClient;
}(EventEmitter);

export { SolidAuthClient as default };

function defaultLoginOptions(url) {
  return {
    callbackUri: url ? url.split('#')[0] : '',
    popupUri: '',
    storage: defaultStorage()
  };
}