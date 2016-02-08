(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'proptypes', 'preact'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('proptypes'), require('preact'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.proptypes, global.preact);
		global.preactCompat = mod.exports;
	}
})(this, function (exports, _proptypes, _preact) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Component = exports.findDOMNode = exports.createElement = exports.createClass = exports.render = exports.Children = exports.PropTypes = undefined;

	var _proptypes2 = _interopRequireDefault(_proptypes);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function _possibleConstructorReturn(self, call) {
		if (!self) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return call && (typeof call === "object" || typeof call === "function") ? call : self;
	}

	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	}

	var DEV = !isProd();

	function isProd() {
		var prod = undefined;
		try {
			prod = process.env.NODE_ENV === 'production';
		} catch (e) {}
		return !!prod;
	}

	// proxy render() since React returns a Component reference.
	function render(vnode, parent, callback) {
		var out = (0, _preact.render)(vnode, parent);
		if (typeof callback === 'function') callback();
		return out && out._component;
	}

	// This API is completely unnecessary for Preact, so it's basically passthrough.
	var Children = {
		map: function (children, fn, ctx) {
			if (ctx && ctx !== children) fn = fn.bind(ctx);
			return children.map(fn);
		},
		forEach: function (children, fn, ctx) {
			if (ctx && ctx !== children) fn = fn.bind(ctx);
			children.forEach(fn);
		},
		count: function (children) {
			return children.length;
		},
		only: function (children) {
			if (children.length !== 1) throw new Error('Children.only() expects only one child.');
			return children[0];
		},
		toArray: function (children) {
			return children;
		}
	};

	var createElement = function () {
		var vnode = _preact.h.apply(undefined, arguments);
		applyClassName(vnode);
		return vnode;
	};

	var applyClassName = function (_ref) {
		var attributes = _ref.attributes;

		if (!attributes) return;
		var cl = attributes.className || attributes.class;
		if (cl) attributes.className = cl;
	};

	var extend = function (base) {
		for (var _len = arguments.length, objs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			objs[_key - 1] = arguments[_key];
		}

		for (var i = 0; i < objs.length; i++) {
			for (var key in objs[i]) {
				if (objs[i].hasOwnProperty(key)) {
					var v = objs[i][key];
					if (v !== null && v !== undefined) {
						base[key] = v;
					}
				}
			}
		}
		return base;
	};

	var findDOMNode = function (component) {
		return component.base || component;
	};

	function F() {}

	var createClass = function (obj) {
		var cl = function () {
			Component.call(this);
			extend(this, obj);
			bindAll(this);
		};
		F.prototype = Component.prototype;
		cl.prototype = new F();
		cl.prototype.constructor = cl;
		return cl;
	};

	var bindAll = function (ctx) {
		for (var i in ctx) {
			var v = ctx[i];
			if (typeof v === 'function' && !v.__bound) {
				(ctx[i] = v.bind(ctx)).__bound = true;
			}
		}
	};

	var Component = function (_PreactComponent) {
		_inherits(Component, _PreactComponent);

		function Component() {
			_classCallCheck(this, Component);

			for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				args[_key2] = arguments[_key2];
			}

			var _this = _possibleConstructorReturn(this, _PreactComponent.call.apply(_PreactComponent, [this].concat(args)));

			_this._stateUpdateCallbacks = [];
			return _this;
		}

		Component.prototype.getDOMNode = function getDOMNode() {
			return this.base;
		};

		Component.prototype.setState = function setState(state, callback) {
			_PreactComponent.prototype.setState.call(this, state);
			if (typeof callback === 'function') {
				this._stateUpdateCallbacks.push(callback);
				callback();
			}
		};

		Component.prototype.componentWillReceiveProps = function componentWillReceiveProps(props) {
			var defaultProps = this.defaultProps || this.constructor.defaultProps;
			if (defaultProps) {
				props = extend({}, defaultProps, props);
			}

			// add proptype checking
			if (DEV) {
				var propTypes = this.propTypes || this.constructor.propTypes;
				if (propTypes) {
					for (var prop in propTypes) {
						if (propTypes.hasOwnProperty(prop) && typeof propTypes[prop] === 'function') {
							var err = propTypes[prop](props, prop, this.constructor.name, 'prop');
							if (err) throw err;
						}
					}
				}
			}
		};

		Component.prototype._render = function _render() {
			var _PreactComponent$prot;

			for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
				args[_key3] = arguments[_key3];
			}

			var ret = (_PreactComponent$prot = _PreactComponent.prototype._render).call.apply(_PreactComponent$prot, [this].concat(args));

			if (this.props.ref && this.base.getAttribute('ref') !== this.props.ref) {
				this.base.setAttribute('ref', this.props.ref);
			}

			// add refs
			var refs = this.base.querySelectorAll('[ref]');
			this.refs = {};
			for (var i = refs.length; i--;) {
				this.refs[refs[i].getAttribute('ref')] = refs[i]._component || refs[i];
			}

			var cb = this._stateUpdateCallbacks;
			if (cb) {
				this._stateUpdateCallbacks = [];
				for (var i = 0; i < cb.length; i++) {
					cb[i]();
				}
			}

			return ret;
		};

		return Component;
	}(_preact.Component);

	exports.PropTypes = _proptypes2.default;
	exports.Children = Children;
	exports.render = render;
	exports.createClass = createClass;
	exports.createElement = createElement;
	exports.findDOMNode = findDOMNode;
	exports.Component = Component;
	exports.default = { PropTypes: _proptypes2.default, Children: Children, render: render, createClass: createClass, createElement: createElement, findDOMNode: findDOMNode, Component: Component };
});

//# sourceMappingURL=preact-compat.js.map