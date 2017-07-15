'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactMotion = require('react-motion');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function TouchMoveRecord(e) {
  var _getTouchPosition = (0, _utils.getTouchPosition)(e),
      x = _getTouchPosition.x,
      y = _getTouchPosition.y;

  this.x = x;
  this.y = y;
  this.time = Date.now();
}

var TouchCarousel = function (_React$PureComponent) {
  _inherits(TouchCarousel, _React$PureComponent);

  function TouchCarousel(props) {
    _classCallCheck(this, TouchCarousel);

    var _this = _possibleConstructorReturn(this, (TouchCarousel.__proto__ || Object.getPrototypeOf(TouchCarousel)).call(this, props));

    _this.onTouchStart = function () {
      _this.touchCount++;
      _this.setState({ active: true });
      _this.stopAutoplay();
      _this.touchMoves = [];
      // When user grabs the scroll, cancel the spring effect.
      _this.setCursor(_this.usedCursor).then(_this.modCursor);
    };

    _this.onTouchMove = function (e) {
      // NOTE: in Chrome 56+ touchmove event listeners are passive by default,
      // please use CSS `touch-action` for it.
      e.preventDefault();

      var touchMove = new TouchMoveRecord(e);
      if (_this.state.active && _this.touchMoves.length) {
        var _this$props = _this.props,
            cardSize = _this$props.cardSize,
            moveScale = _this$props.moveScale,
            vertical = _this$props.vertical;

        var lastMove = _this.touchMoves[_this.touchMoves.length - 1];
        var xy = vertical ? 'y' : 'x';
        var distance = touchMove[xy] - lastMove[xy];
        _this.setState({ dragging: true });
        _this.setCursor(_this.state.cursor + distance / cardSize * moveScale, true);
      }
      _this.touchMoves.push(touchMove);
      if (_this.touchMoves.length > 250) {
        _this.touchMoves.splice(0, 50);
      }
    };

    _this.onTouchEnd = function (e) {
      _this.touchCount--;
      if (_this.touchCount > 0) {
        return;
      }
      if (_this.state.dragging) {
        var _this$props2 = _this.props,
            cardSize = _this$props2.cardSize,
            moveScale = _this$props2.moveScale,
            vertical = _this$props2.vertical;

        var damping = _this.props.damping / 1e3;
        var touchMoves = _this.touchMoves;

        var i = touchMoves.length;
        var duration = 0;
        while (--i >= 0 && duration < 100) {
          duration = Date.now() - touchMoves[i].time;
        }
        i++;
        var xy = vertical ? 'y' : 'x';
        var touchMoveVelocity = ((0, _utils.getTouchPosition)(e)[xy] - touchMoves[i][xy]) / duration;
        var momentumDistance = touchMoveVelocity * Math.abs(touchMoveVelocity) / damping / 2;
        var cursor = _this.state.cursor;

        var cursorDelta = (0, _utils.clamp)(momentumDistance / cardSize * moveScale, Math.floor(cursor) - cursor, Math.ceil(cursor) - cursor);
        _this.setCursor(Math.round(cursor + cursorDelta));
      } else {
        // User grabs and then releases without any move in between.
        // Snap the cursor.
        _this.setCursor(Math.round(_this.state.cursor));
      }
      _this.setState({ active: false, dragging: false });
      _this.autoplayIfEnabled();
    };

    _this.autoplayIfEnabled = function () {
      if (_this.props.autoplay) {
        _this.autoplayTimer = setInterval(_this.next, _this.props.autoplay);
      }
    };

    _this.stopAutoplay = function () {
      if (_this.autoplayTimer) {
        clearInterval(_this.autoplayTimer);
        _this.autoplayTimer = null;
      }
    };

    _this.next = function () {
      _this.modCursor().then(function () {
        _this.setCursor(_this.state.cursor - 1);
      });
    };

    _this.setCursor = function (cursor, allowOverScroll) {
      var used = (0, _utils.precision)(cursor, _this.props.precision);
      if (!_this.props.loop) {
        used = (0, _utils.clamp)(cursor, 1 - _this.props.cardCount, 0);
      }
      if (allowOverScroll && cursor !== used) {
        if (cursor > used) {
          used += 1 - 1 / (cursor - used + 1);
        } else {
          used -= 1 - 1 / (used - cursor + 1);
        }
      }
      return new Promise(function (resolve) {
        _this.setState({ cursor: used }, resolve);
      });
    };

    _this.modCursor = function () {
      return new Promise(function (resolve) {
        var _this$props3 = _this.props,
            loop = _this$props3.loop,
            cardCount = _this$props3.cardCount;

        if (!loop) {
          return resolve();
        }
        var cursor = _this.state.cursor;

        var newCursor = cursor;
        while (newCursor > 0) {
          newCursor -= cardCount;
        }
        while (newCursor < 1 - cardCount) {
          newCursor += cardCount;
        }
        if (newCursor !== cursor) {
          _this.setState({ moding: true, cursor: newCursor }, function () {
            _this.setState({ moding: false }, resolve);
          });
        } else {
          resolve();
        }
      });
    };

    _this.state = {
      cursor: 0,
      active: false,
      dragging: false,
      moding: false
    };
    _this.usedCursor = 0;
    _this.touchCount = 0;
    _this.touchMoves = [];
    _this.autoplayTimer = null;
    return _this;
  }

  _createClass(TouchCarousel, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.autoplayIfEnabled();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.stopAutoplay();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          Component = _props.component,
          cardSize = _props.cardSize,
          cardCount = _props.cardCount,
          cardPadCount = _props.cardPadCount,
          renderCard = _props.renderCard,
          loop = _props.loop,
          moveScale = _props.moveScale,
          damping = _props.damping,
          autoplay = _props.autoplay,
          vertical = _props.vertical,
          precision = _props.precision,
          rest = _objectWithoutProperties(_props, ['component', 'cardSize', 'cardCount', 'cardPadCount', 'renderCard', 'loop', 'moveScale', 'damping', 'autoplay', 'vertical', 'precision']);

      var _state = this.state,
          cursor = _state.cursor,
          active = _state.active,
          dragging = _state.dragging,
          moding = _state.moding;

      var padCount = loop ? cardPadCount : 0;
      return _react2.default.createElement(
        _reactMotion.Motion,
        {
          defaultStyle: { cursor: cursor },
          style: { cursor: dragging || moding ? cursor : (0, _reactMotion.spring)(cursor) }
        },
        function (_ref) {
          var cursor = _ref.cursor;

          _this2.usedCursor = cursor;
          return _react2.default.createElement(
            Component,
            _extends({}, rest, {
              cursor: cursor,
              active: active,
              dragging: dragging,
              onTouchStart: _this2.onTouchStart,
              onTouchMove: _this2.onTouchMove,
              onTouchEnd: _this2.onTouchEnd
            }),
            (0, _utils.range)(0 - padCount, cardCount - 1 + padCount).map(function (index) {
              var modIndex = index % cardCount;
              while (modIndex < 0) {
                modIndex += cardCount;
              }
              return renderCard(index, modIndex, cursor);
            })
          );
        }
      );
    }
  }]);

  return TouchCarousel;
}(_react2.default.PureComponent);

TouchCarousel.defaultProps = {
  component: 'div',
  cardSize: global.innerWidth || 320,
  cardCount: 1,
  cardPadCount: 2,
  loop: true,
  autoplay: 0,
  vertical: false,
  renderCard: function renderCard() {},

  precision: 0.01,
  moveScale: 1,
  damping: 1
};

exports.default = TouchCarousel;
