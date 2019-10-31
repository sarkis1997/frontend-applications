
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function (Logo) {
    'use strict';

    Logo = Logo && Logo.hasOwnProperty('default') ? Logo['default'] : Logo;

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        for (const key in attributes) {
            if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key in node) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    function toVal(mix) {
    	var k, y, str='';
    	if (mix) {
    		if (typeof mix === 'object') {
    			if (!!mix.push) {
    				for (k=0; k < mix.length; k++) {
    					if (mix[k] && (y = toVal(mix[k]))) {
    						str && (str += ' ');
    						str += y;
    					}
    				}
    			} else {
    				for (k in mix) {
    					if (mix[k] && (y = toVal(k))) {
    						str && (str += ' ');
    						str += y;
    					}
    				}
    			}
    		} else if (typeof mix !== 'boolean' && !mix.call) {
    			str && (str += ' ');
    			str += mix;
    		}
    	}
    	return str;
    }

    function clsx () {
    	var i=0, x, str='';
    	while (i < arguments.length) {
    		if (x = toVal(arguments[i++])) {
    			str && (str += ' ');
    			str += x;
    		}
    	}
    	return str;
    }

    function isObject(value) {
      const type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    function getColumnSizeClass(isXs, colWidth, colSize) {
      if (colSize === true || colSize === '') {
        return isXs ? 'col' : `col-${colWidth}`;
      } else if (colSize === 'auto') {
        return isXs ? 'col-auto' : `col-${colWidth}-auto`;
      }

      return isXs ? `col-${colSize}` : `col-${colWidth}-${colSize}`;
    }

    function clean($$props) {
      const rest = {};
      for (const key of Object.keys($$props)) {
        if (key !== "children" && key !== "$$scope" && key !== "$$slots") {
          rest[key] = $$props[key];
        }
      }
      return rest;
    }

    /* node_modules/sveltestrap/src/Col.svelte generated by Svelte v3.12.1 */

    const file = "node_modules/sveltestrap/src/Col.svelte";

    function create_fragment(ctx) {
    	var div, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var div_levels = [
    		ctx.props,
    		{ id: ctx.id },
    		{ class: ctx.colClasses.join(' ') }
    	];

    	var div_data = {};
    	for (var i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			set_attributes(div, div_data);
    			add_location(div, file, 52, 0, 1332);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				(changed.props) && ctx.props,
    				(changed.id) && { id: ctx.id },
    				(changed.colClasses) && { class: ctx.colClasses.join(' ') }
    			]));
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	

      let { class: className = '', id = '' } = $$props;

      const props = clean($$props);

      const colClasses = [];
      const widths = ['xs', 'sm', 'md', 'lg', 'xl'];

      widths.forEach(colWidth => {
        const columnProp = $$props[colWidth];
        if (!columnProp && columnProp !== '') {
          return; //no value for this width
        }

        const isXs = colWidth === 'xs';

        if (isObject(columnProp)) {
          const colSizeInterfix = isXs ? '-' : `-${colWidth}-`;
          const colClass = getColumnSizeClass(isXs, colWidth, columnProp.size);

          if (columnProp.size || columnProp.size === '') {
            colClasses.push(colClass);
          }
          if (columnProp.push) {
            colClasses.push(`push${colSizeInterfix}${columnProp.push}`);
          }
          if (columnProp.pull) {
            colClasses.push(`pull${colSizeInterfix}${columnProp.pull}`);
          }
          if (columnProp.offset) {
            colClasses.push(`offset${colSizeInterfix}${columnProp.offset}`);
          }
        } else {
          colClasses.push(getColumnSizeClass(isXs, colWidth, columnProp));
        }
      });

      if (!colClasses.length) {
        colClasses.push('col');
      }

      if (className) {
        colClasses.push(className);
      }

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('id' in $$new_props) $$invalidate('id', id = $$new_props.id);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { className, id };
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('className' in $$props) $$invalidate('className', className = $$new_props.className);
    		if ('id' in $$props) $$invalidate('id', id = $$new_props.id);
    	};

    	return {
    		className,
    		id,
    		props,
    		colClasses,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Col extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["class", "id"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Col", options, id: create_fragment.name });
    	}

    	get class() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltestrap/src/Container.svelte generated by Svelte v3.12.1 */

    const file$1 = "node_modules/sveltestrap/src/Container.svelte";

    function create_fragment$1(ctx) {
    	var div, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var div_levels = [
    		ctx.props,
    		{ id: ctx.id },
    		{ class: ctx.classes }
    	];

    	var div_data = {};
    	for (var i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			set_attributes(div, div_data);
    			add_location(div, file$1, 17, 0, 308);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				(changed.props) && ctx.props,
    				(changed.id) && { id: ctx.id },
    				(changed.classes) && { class: ctx.classes }
    			]));
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	

      let { class: className = '', fluid = false, id = '' } = $$props;

      const props = clean($$props);

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('fluid' in $$new_props) $$invalidate('fluid', fluid = $$new_props.fluid);
    		if ('id' in $$new_props) $$invalidate('id', id = $$new_props.id);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { className, fluid, id, classes };
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('className' in $$props) $$invalidate('className', className = $$new_props.className);
    		if ('fluid' in $$props) $$invalidate('fluid', fluid = $$new_props.fluid);
    		if ('id' in $$props) $$invalidate('id', id = $$new_props.id);
    		if ('classes' in $$props) $$invalidate('classes', classes = $$new_props.classes);
    	};

    	let classes;

    	$$self.$$.update = ($$dirty = { className: 1, fluid: 1 }) => {
    		if ($$dirty.className || $$dirty.fluid) { $$invalidate('classes', classes = clsx(
            className,
            fluid ? 'container-fluid' : 'container',
          )); }
    	};

    	return {
    		className,
    		fluid,
    		id,
    		props,
    		classes,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Container extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["class", "fluid", "id"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Container", options, id: create_fragment$1.name });
    	}

    	get class() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fluid() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fluid(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltestrap/src/NavLink.svelte generated by Svelte v3.12.1 */

    const file$2 = "node_modules/sveltestrap/src/NavLink.svelte";

    function create_fragment$2(ctx) {
    	var a, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var a_levels = [
    		ctx.props,
    		{ href: ctx.href },
    		{ class: ctx.classes }
    	];

    	var a_data = {};
    	for (var i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");

    			if (default_slot) default_slot.c();

    			set_attributes(a, a_data);
    			add_location(a, file$2, 34, 0, 545);

    			dispose = [
    				listen_dev(a, "click", ctx.click_handler),
    				listen_dev(a, "click", ctx.handleClick)
    			];
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(a_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				(changed.props) && ctx.props,
    				(changed.href) && { href: ctx.href },
    				(changed.classes) && { class: ctx.classes }
    			]));
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}

    			if (default_slot) default_slot.d(detaching);
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	

      let { class: className = '', disabled = false, active = false, href = '#' } = $$props;

      const props = clean($$props);

      function handleClick(e){
        if (disabled) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        if (href === '#') {
          e.preventDefault();
        }
      }

    	let { $$slots = {}, $$scope } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('disabled' in $$new_props) $$invalidate('disabled', disabled = $$new_props.disabled);
    		if ('active' in $$new_props) $$invalidate('active', active = $$new_props.active);
    		if ('href' in $$new_props) $$invalidate('href', href = $$new_props.href);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { className, disabled, active, href, classes };
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('className' in $$props) $$invalidate('className', className = $$new_props.className);
    		if ('disabled' in $$props) $$invalidate('disabled', disabled = $$new_props.disabled);
    		if ('active' in $$props) $$invalidate('active', active = $$new_props.active);
    		if ('href' in $$props) $$invalidate('href', href = $$new_props.href);
    		if ('classes' in $$props) $$invalidate('classes', classes = $$new_props.classes);
    	};

    	let classes;

    	$$self.$$.update = ($$dirty = { className: 1, disabled: 1, active: 1 }) => {
    		if ($$dirty.className || $$dirty.disabled || $$dirty.active) { $$invalidate('classes', classes = clsx(
            className,
            'nav-link',
            {
              disabled,
              active
            },
          )); }
    	};

    	return {
    		className,
    		disabled,
    		active,
    		href,
    		props,
    		handleClick,
    		classes,
    		click_handler,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class NavLink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["class", "disabled", "active", "href"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "NavLink", options, id: create_fragment$2.name });
    	}

    	get class() {
    		throw new Error("<NavLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<NavLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<NavLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<NavLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<NavLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<NavLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<NavLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<NavLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltestrap/src/Row.svelte generated by Svelte v3.12.1 */

    const file$3 = "node_modules/sveltestrap/src/Row.svelte";

    function create_fragment$3(ctx) {
    	var div, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var div_levels = [
    		ctx.props,
    		{ id: ctx.id },
    		{ class: ctx.classes }
    	];

    	var div_data = {};
    	for (var i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			set_attributes(div, div_data);
    			add_location(div, file$3, 19, 0, 362);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				(changed.props) && ctx.props,
    				(changed.id) && { id: ctx.id },
    				(changed.classes) && { class: ctx.classes }
    			]));
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	

      let { class: className = '', noGutters = false, form = false, id = '' } = $$props;

      const props = clean($$props);

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('noGutters' in $$new_props) $$invalidate('noGutters', noGutters = $$new_props.noGutters);
    		if ('form' in $$new_props) $$invalidate('form', form = $$new_props.form);
    		if ('id' in $$new_props) $$invalidate('id', id = $$new_props.id);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { className, noGutters, form, id, classes };
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('className' in $$props) $$invalidate('className', className = $$new_props.className);
    		if ('noGutters' in $$props) $$invalidate('noGutters', noGutters = $$new_props.noGutters);
    		if ('form' in $$props) $$invalidate('form', form = $$new_props.form);
    		if ('id' in $$props) $$invalidate('id', id = $$new_props.id);
    		if ('classes' in $$props) $$invalidate('classes', classes = $$new_props.classes);
    	};

    	let classes;

    	$$self.$$.update = ($$dirty = { className: 1, noGutters: 1, form: 1 }) => {
    		if ($$dirty.className || $$dirty.noGutters || $$dirty.form) { $$invalidate('classes', classes = clsx(
            className,
            noGutters ? 'no-gutters' : null,
            form ? 'form-row' : 'row',
          )); }
    	};

    	return {
    		className,
    		noGutters,
    		form,
    		id,
    		props,
    		classes,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["class", "noGutters", "form", "id"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Row", options, id: create_fragment$3.name });
    	}

    	get class() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGutters() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGutters(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get form() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set form(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/header.svelte generated by Svelte v3.12.1 */

    const file$4 = "src/components/header.svelte";

    // (16:3) <NavLink href="#" class="text-center">
    function create_default_slot_5(ctx) {
    	var img;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "src", Logo);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1ki00n9");
    			add_location(img, file$4, 16, 4, 273);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_5.name, type: "slot", source: "(16:3) <NavLink href=\"\" class=\"text-center\">", ctx });
    	return block;
    }

    // (15:2) <Col>
    function create_default_slot_4(ctx) {
    	var current;

    	var navlink = new NavLink({
    		props: {
    		href: "#",
    		class: "text-center",
    		$$slots: { default: [create_default_slot_5] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			navlink.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(navlink, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var navlink_changes = {};
    			if (changed.$$scope) navlink_changes.$$scope = { changed, ctx };
    			navlink.$set(navlink_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(navlink.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(navlink.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(navlink, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_4.name, type: "slot", source: "(15:2) <Col>", ctx });
    	return block;
    }

    // (14:1) <Row>
    function create_default_slot_3(ctx) {
    	var current;

    	var col = new Col({
    		props: {
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			col.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(col, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var col_changes = {};
    			if (changed.$$scope) col_changes.$$scope = { changed, ctx };
    			col.$set(col_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(col.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(col.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(col, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_3.name, type: "slot", source: "(14:1) <Row>", ctx });
    	return block;
    }

    // (23:2) <Col class="text-center">
    function create_default_slot_2(ctx) {
    	var h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Slavernij in de loop der tijd";
    			add_location(h1, file$4, 23, 3, 373);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_2.name, type: "slot", source: "(23:2) <Col class=\"text-center\">", ctx });
    	return block;
    }

    // (22:1) <Row>
    function create_default_slot_1(ctx) {
    	var current;

    	var col = new Col({
    		props: {
    		class: "text-center",
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			col.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(col, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var col_changes = {};
    			if (changed.$$scope) col_changes.$$scope = { changed, ctx };
    			col.$set(col_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(col.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(col.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(col, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_1.name, type: "slot", source: "(22:1) <Row>", ctx });
    	return block;
    }

    // (13:0) <Container>
    function create_default_slot(ctx) {
    	var t0, hr0, t1, t2, hr1, current;

    	var row0 = new Row({
    		props: {
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var row1 = new Row({
    		props: {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			row0.$$.fragment.c();
    			t0 = space();
    			hr0 = element("hr");
    			t1 = space();
    			row1.$$.fragment.c();
    			t2 = space();
    			hr1 = element("hr");
    			add_location(hr0, file$4, 20, 1, 329);
    			add_location(hr1, file$4, 26, 1, 430);
    		},

    		m: function mount(target, anchor) {
    			mount_component(row0, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(row1, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, hr1, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var row0_changes = {};
    			if (changed.$$scope) row0_changes.$$scope = { changed, ctx };
    			row0.$set(row0_changes);

    			var row1_changes = {};
    			if (changed.$$scope) row1_changes.$$scope = { changed, ctx };
    			row1.$set(row1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(row0.$$.fragment, local);

    			transition_in(row1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(row0, detaching);

    			if (detaching) {
    				detach_dev(t0);
    				detach_dev(hr0);
    				detach_dev(t1);
    			}

    			destroy_component(row1, detaching);

    			if (detaching) {
    				detach_dev(t2);
    				detach_dev(hr1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(13:0) <Container>", ctx });
    	return block;
    }

    function create_fragment$4(ctx) {
    	var current;

    	var container = new Container({
    		props: {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			container.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(container, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var container_changes = {};
    			if (changed.$$scope) container_changes.$$scope = { changed, ctx };
    			container.$set(container_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(container, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Header", options, id: create_fragment$4.name });
    	}
    }

    /* src/lib/API.svelte generated by Svelte v3.12.1 */

    let url = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-07/sparql";

    const query = `
   PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
   PREFIX dc: <http://purl.org/dc/elements/1.1/>
   PREFIX dct: <http://purl.org/dc/terms/>
   PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
   PREFIX edm: <http://www.europeana.eu/schemas/edm/>
   PREFIX foaf: <http://xmlns.com/foaf/0.1/>

   SELECT ?cho ?title ?description ?objLabel ?img ?period WHERE {
     ?cho edm:isRelatedTo <https://hdl.handle.net/20.500.11840/termmaster2647> .
     ?cho dc:title ?title .
       FILTER langMatches(lang(?title), "ned")
     OPTIONAL { ?cho dc:description ?description } .
     ?cho edm:object ?obj .
       VALUES ?type { "gereedschap en uitrusting" "slavenketens" }
     ?obj skos:prefLabel ?objLabel .
     ?cho edm:isShownBy ?img .
     ?cho dct:created ?period
   }
   `;

    /* src/lib/regex.svelte generated by Svelte v3.12.1 */

    let filterHTML = (obj) => {
    // replace alles tussen < html tags > en &nbsp;
    obj.description.value = obj.description.value.replace(/(<([^>]+)>)|&nbsp;/g, ' ');
    };

    /* src/lib/item-grid.svelte generated by Svelte v3.12.1 */

    const file$5 = "src/lib/item-grid.svelte";

    // (30:12) <Col sm="10">
    function create_default_slot_6(ctx) {
    	var h1, t;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t = text(ctx.title);
    			attr_dev(h1, "class", "text-center; svelte-9v1cnn");
    			add_location(h1, file$5, 30, 16, 539);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.title) {
    				set_data_dev(t, ctx.title);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_6.name, type: "slot", source: "(30:12) <Col sm=\"10\">", ctx });
    	return block;
    }

    // (33:12) <Col class="m-auto">
    function create_default_slot_5$1(ctx) {
    	var span, t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(ctx.period);
    			attr_dev(span, "class", "period svelte-9v1cnn");
    			add_location(span, file$5, 33, 16, 645);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.period) {
    				set_data_dev(t, ctx.period);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_5$1.name, type: "slot", source: "(33:12) <Col class=\"m-auto\">", ctx });
    	return block;
    }

    // (29:8) <Row>
    function create_default_slot_4$1(ctx) {
    	var t, current;

    	var col0 = new Col({
    		props: {
    		sm: "10",
    		$$slots: { default: [create_default_slot_6] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var col1 = new Col({
    		props: {
    		class: "m-auto",
    		$$slots: { default: [create_default_slot_5$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			col0.$$.fragment.c();
    			t = space();
    			col1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(col1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var col0_changes = {};
    			if (changed.$$scope || changed.title) col0_changes.$$scope = { changed, ctx };
    			col0.$set(col0_changes);

    			var col1_changes = {};
    			if (changed.$$scope || changed.period) col1_changes.$$scope = { changed, ctx };
    			col1.$set(col1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);

    			transition_in(col1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);

    			if (detaching) {
    				detach_dev(t);
    			}

    			destroy_component(col1, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_4$1.name, type: "slot", source: "(29:8) <Row>", ctx });
    	return block;
    }

    // (39:12) <Col sm="4">
    function create_default_slot_3$1(ctx) {
    	var img;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "src", ctx.imgSrc);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-9v1cnn");
    			add_location(img, file$5, 38, 24, 768);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.imgSrc) {
    				attr_dev(img, "src", ctx.imgSrc);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_3$1.name, type: "slot", source: "(39:12) <Col sm=\"4\">", ctx });
    	return block;
    }

    // (40:12) <Col sm="8">
    function create_default_slot_2$1(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text(ctx.description);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.description) {
    				set_data_dev(t, ctx.description);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_2$1.name, type: "slot", source: "(40:12) <Col sm=\"8\">", ctx });
    	return block;
    }

    // (38:8) <Row>
    function create_default_slot_1$1(ctx) {
    	var t, current;

    	var col0 = new Col({
    		props: {
    		sm: "4",
    		$$slots: { default: [create_default_slot_3$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var col1 = new Col({
    		props: {
    		sm: "8",
    		$$slots: { default: [create_default_slot_2$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			col0.$$.fragment.c();
    			t = space();
    			col1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(col1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var col0_changes = {};
    			if (changed.$$scope || changed.imgSrc) col0_changes.$$scope = { changed, ctx };
    			col0.$set(col0_changes);

    			var col1_changes = {};
    			if (changed.$$scope || changed.description) col1_changes.$$scope = { changed, ctx };
    			col1.$set(col1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);

    			transition_in(col1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);

    			if (detaching) {
    				detach_dev(t);
    			}

    			destroy_component(col1, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_1$1.name, type: "slot", source: "(38:8) <Row>", ctx });
    	return block;
    }

    // (28:4) <Container class="p-5">
    function create_default_slot$1(ctx) {
    	var t0, hr, t1, current;

    	var row0 = new Row({
    		props: {
    		$$slots: { default: [create_default_slot_4$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var row1 = new Row({
    		props: {
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			row0.$$.fragment.c();
    			t0 = space();
    			hr = element("hr");
    			t1 = space();
    			row1.$$.fragment.c();
    			add_location(hr, file$5, 36, 8, 724);
    		},

    		m: function mount(target, anchor) {
    			mount_component(row0, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(row1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var row0_changes = {};
    			if (changed.$$scope || changed.period || changed.title) row0_changes.$$scope = { changed, ctx };
    			row0.$set(row0_changes);

    			var row1_changes = {};
    			if (changed.$$scope || changed.description || changed.imgSrc) row1_changes.$$scope = { changed, ctx };
    			row1.$set(row1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(row0.$$.fragment, local);

    			transition_in(row1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(row0.$$.fragment, local);
    			transition_out(row1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(row0, detaching);

    			if (detaching) {
    				detach_dev(t0);
    				detach_dev(hr);
    				detach_dev(t1);
    			}

    			destroy_component(row1, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot$1.name, type: "slot", source: "(28:4) <Container class=\"p-5\">", ctx });
    	return block;
    }

    function create_fragment$5(ctx) {
    	var li, t, hr, current;

    	var container = new Container({
    		props: {
    		class: "p-5",
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			li = element("li");
    			container.$$.fragment.c();
    			t = space();
    			hr = element("hr");
    			attr_dev(li, "class", "mb-2 svelte-9v1cnn");
    			add_location(li, file$5, 26, 0, 437);
    			add_location(hr, file$5, 43, 0, 883);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(container, li, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, hr, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var container_changes = {};
    			if (changed.$$scope || changed.description || changed.imgSrc || changed.period || changed.title) container_changes.$$scope = { changed, ctx };
    			container.$set(container_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(li);
    			}

    			destroy_component(container);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(hr);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { title, description, imgSrc, period } = $$props;

    	const writable_props = ['title', 'description', 'imgSrc', 'period'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Item_grid> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('description' in $$props) $$invalidate('description', description = $$props.description);
    		if ('imgSrc' in $$props) $$invalidate('imgSrc', imgSrc = $$props.imgSrc);
    		if ('period' in $$props) $$invalidate('period', period = $$props.period);
    	};

    	$$self.$capture_state = () => {
    		return { title, description, imgSrc, period };
    	};

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('description' in $$props) $$invalidate('description', description = $$props.description);
    		if ('imgSrc' in $$props) $$invalidate('imgSrc', imgSrc = $$props.imgSrc);
    		if ('period' in $$props) $$invalidate('period', period = $$props.period);
    	};

    	return { title, description, imgSrc, period };
    }

    class Item_grid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, ["title", "description", "imgSrc", "period"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Item_grid", options, id: create_fragment$5.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.title === undefined && !('title' in props)) {
    			console.warn("<Item_grid> was created without expected prop 'title'");
    		}
    		if (ctx.description === undefined && !('description' in props)) {
    			console.warn("<Item_grid> was created without expected prop 'description'");
    		}
    		if (ctx.imgSrc === undefined && !('imgSrc' in props)) {
    			console.warn("<Item_grid> was created without expected prop 'imgSrc'");
    		}
    		if (ctx.period === undefined && !('period' in props)) {
    			console.warn("<Item_grid> was created without expected prop 'period'");
    		}
    	}

    	get title() {
    		throw new Error("<Item_grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Item_grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Item_grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Item_grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imgSrc() {
    		throw new Error("<Item_grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgSrc(value) {
    		throw new Error("<Item_grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get period() {
    		throw new Error("<Item_grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set period(value) {
    		throw new Error("<Item_grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/fetch.svelte generated by Svelte v3.12.1 */

    const file$6 = "src/components/fetch.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.result = list[i];
    	return child_ctx;
    }

    // (42:8) <ItemGrid             title={result.title.value}             description={result.description.value}             imgSrc={result.img.value}             period={result.period.value}>
    function create_default_slot_1$2(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		d: noop
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_1$2.name, type: "slot", source: "(42:8) <ItemGrid             title={result.title.value}             description={result.description.value}             imgSrc={result.img.value}             period={result.period.value}>", ctx });
    	return block;
    }

    // (41:8) {#each dataRaw as result}
    function create_each_block(ctx) {
    	var current;

    	var itemgrid = new Item_grid({
    		props: {
    		title: ctx.result.title.value,
    		description: ctx.result.description.value,
    		imgSrc: ctx.result.img.value,
    		period: ctx.result.period.value,
    		$$slots: { default: [create_default_slot_1$2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			itemgrid.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(itemgrid, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var itemgrid_changes = {};
    			if (changed.dataRaw) itemgrid_changes.title = ctx.result.title.value;
    			if (changed.dataRaw) itemgrid_changes.description = ctx.result.description.value;
    			if (changed.dataRaw) itemgrid_changes.imgSrc = ctx.result.img.value;
    			if (changed.dataRaw) itemgrid_changes.period = ctx.result.period.value;
    			if (changed.$$scope) itemgrid_changes.$$scope = { changed, ctx };
    			itemgrid.$set(itemgrid_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(itemgrid.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(itemgrid.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(itemgrid, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(41:8) {#each dataRaw as result}", ctx });
    	return block;
    }

    // (39:0) <Container>
    function create_default_slot$2(ctx) {
    	var ul, current;

    	let each_value = ctx.dataRaw;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			add_location(ul, file$6, 39, 4, 857);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.dataRaw) {
    				each_value = ctx.dataRaw;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(ul);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot$2.name, type: "slot", source: "(39:0) <Container>", ctx });
    	return block;
    }

    function create_fragment$6(ctx) {
    	var current;

    	var container = new Container({
    		props: {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			container.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(container, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var container_changes = {};
    			if (changed.$$scope || changed.dataRaw) container_changes.$$scope = { changed, ctx };
    			container.$set(container_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(container, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	

    const fetchString = fetch(url+"?query="+ encodeURIComponent(query) +"&format=json");
    let dataRaw = [];

    (fetchData => {
        fetchString
        .then(res => res.json())
        .then(json => {
            $$invalidate('dataRaw', dataRaw = json.results.bindings);
            loopData();
            dataRaw.forEach(filterHTML);
        });
    })();

    let loopData = () => {
        dataRaw.forEach(checkDescription);
                console.log(dataRaw);
    };

    let checkDescription = (obj) => {
        if (!obj.description) {
            obj.description;
            console.log('geen description');
        } else {
            console.log('wel description');
            return
        }
    };

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('dataRaw' in $$props) $$invalidate('dataRaw', dataRaw = $$props.dataRaw);
    		if ('loopData' in $$props) loopData = $$props.loopData;
    		if ('checkDescription' in $$props) checkDescription = $$props.checkDescription;
    	};

    	return { dataRaw };
    }

    class Fetch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Fetch", options, id: create_fragment$6.name });
    	}
    }

    /* src/routes/Index.svelte generated by Svelte v3.12.1 */

    const file$7 = "src/routes/Index.svelte";

    // (18:4) <Col xs="1">
    function create_default_slot_3$2(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("bar");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_3$2.name, type: "slot", source: "(18:4) <Col xs=\"1\">", ctx });
    	return block;
    }

    // (21:4) <Col>
    function create_default_slot_2$2(ctx) {
    	var current;

    	var items = new Fetch({ $$inline: true });

    	const block = {
    		c: function create() {
    			items.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(items, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(items.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(items.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(items, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_2$2.name, type: "slot", source: "(21:4) <Col>", ctx });
    	return block;
    }

    // (17:2) <Row>
    function create_default_slot_1$3(ctx) {
    	var t, current;

    	var col0 = new Col({
    		props: {
    		xs: "1",
    		$$slots: { default: [create_default_slot_3$2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var col1 = new Col({
    		props: {
    		$$slots: { default: [create_default_slot_2$2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			col0.$$.fragment.c();
    			t = space();
    			col1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(col1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var col0_changes = {};
    			if (changed.$$scope) col0_changes.$$scope = { changed, ctx };
    			col0.$set(col0_changes);

    			var col1_changes = {};
    			if (changed.$$scope) col1_changes.$$scope = { changed, ctx };
    			col1.$set(col1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);

    			transition_in(col1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);

    			if (detaching) {
    				detach_dev(t);
    			}

    			destroy_component(col1, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_1$3.name, type: "slot", source: "(17:2) <Row>", ctx });
    	return block;
    }

    // (16:0) <Container>
    function create_default_slot$3(ctx) {
    	var current;

    	var row = new Row({
    		props: {
    		$$slots: { default: [create_default_slot_1$3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			row.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var row_changes = {};
    			if (changed.$$scope) row_changes.$$scope = { changed, ctx };
    			row.$set(row_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot$3.name, type: "slot", source: "(16:0) <Container>", ctx });
    	return block;
    }

    function create_fragment$7(ctx) {
    	var link0, link1, t0, t1, current;

    	var header = new Header({ $$inline: true });

    	var container = new Container({
    		props: {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			t0 = space();
    			header.$$.fragment.c();
    			t1 = space();
    			container.$$.fragment.c();
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css");
    			add_location(link0, file$7, 1, 2, 16);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://use.fontawesome.com/releases/v5.8.1/css/all.css");
    			attr_dev(link1, "integrity", "sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf");
    			attr_dev(link1, "crossorigin", "anonymous");
    			add_location(link1, file$7, 2, 2, 122);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			insert_dev(target, t0, anchor);
    			mount_component(header, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(container, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var container_changes = {};
    			if (changed.$$scope) container_changes.$$scope = { changed, ctx };
    			container.$set(container_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			transition_in(container.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);

    			if (detaching) {
    				detach_dev(t0);
    			}

    			destroy_component(header, detaching);

    			if (detaching) {
    				detach_dev(t1);
    			}

    			destroy_component(container, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$7.name, type: "component", source: "", ctx });
    	return block;
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$7, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Index", options, id: create_fragment$7.name });
    	}
    }

    const index = new Index({
    	target: document.body,
    	props: {}

    });

    return index;

}(Logo));
//# sourceMappingURL=bundle.js.map
