
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.47.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.47.0 */

    const { console: console_1, document: document_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (237:29) 
    function create_if_block_3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "loader svelte-f48tzt");
    			add_location(span, file, 237, 2, 8707);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(237:29) ",
    		ctx
    	});

    	return block;
    }

    // (80:28) 
    function create_if_block_1(ctx) {
    	let div5;
    	let div0;
    	let svg0;
    	let path0;
    	let path1;
    	let path2;
    	let t0;
    	let div1;
    	let t1;
    	let h20;
    	let svg1;
    	let path3;
    	let t2;
    	let t3;
    	let ul;
    	let t4;
    	let div4;
    	let h21;
    	let a;
    	let t5_value = /*recipe*/ ctx[5].name + "";
    	let t5;
    	let a_href_value;
    	let t6;
    	let div2;
    	let t7;
    	let span;
    	let t8_value = (/*shortUrl*/ ctx[3] || /*recipe*/ ctx[5].sourceUrl.split("//")[1]) + "";
    	let t8;
    	let t9;

    	let t10_value = new Date().toLocaleDateString("en-US", {
    		month: "long",
    		day: "numeric",
    		year: "numeric"
    	}) + "";

    	let t10;
    	let t11;
    	let div3;
    	let svg2;
    	let path4;
    	let t12;
    	let t13_value = /*recipe*/ ctx[5].servings + "";
    	let t13;
    	let t14;
    	let svg3;
    	let path5;
    	let t15;
    	let t16_value = /*recipe*/ ctx[5].cookTime / 60 / 1000000 + "";
    	let t16;
    	let t17;
    	let t18;
    	let h22;
    	let svg4;
    	let path6;
    	let t19;
    	let t20;
    	let ol;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*recipe*/ ctx[5].imageUrls[0]) return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value_1 = /*recipe*/ ctx[5].ingredients;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*recipe*/ ctx[5].instructions;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			t0 = space();
    			div1 = element("div");
    			if_block.c();
    			t1 = space();
    			h20 = element("h2");
    			svg1 = svg_element("svg");
    			path3 = svg_element("path");
    			t2 = text("\n        Ingredients");
    			t3 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			div4 = element("div");
    			h21 = element("h2");
    			a = element("a");
    			t5 = text(t5_value);
    			t6 = space();
    			div2 = element("div");
    			t7 = text("Saved from ");
    			span = element("span");
    			t8 = text(t8_value);
    			t9 = text("\n        • ");
    			t10 = text(t10_value);
    			t11 = space();
    			div3 = element("div");
    			svg2 = svg_element("svg");
    			path4 = svg_element("path");
    			t12 = space();
    			t13 = text(t13_value);
    			t14 = text(" servings •\n        ");
    			svg3 = svg_element("svg");
    			path5 = svg_element("path");
    			t15 = space();
    			t16 = text(t16_value);
    			t17 = text(" minutes");
    			t18 = space();
    			h22 = element("h2");
    			svg4 = svg_element("svg");
    			path6 = svg_element("path");
    			t19 = text("\n        Steps");
    			t20 = space();
    			ol = element("ol");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(path0, "fill", "currentColor");
    			attr_dev(path0, "d", "m33.71 17.29l-15-15a1 1 0 0 0-1.41 0l-15 15a1 1 0 0 0 1.41 1.41L18 4.41l14.29 14.3a1 1 0 0 0 1.41-1.41Z");
    			attr_dev(path0, "class", "clr-i-outline clr-i-outline-path-1 svelte-f48tzt");
    			add_location(path0, file, 92, 9, 2553);
    			attr_dev(path1, "fill", "currentColor");
    			attr_dev(path1, "d", "M28 32h-5V22H13v10H8V18l-2 2v12a2 2 0 0 0 2 2h7V24h6v10h7a2 2 0 0 0 2-2V19.76l-2-2Z");
    			attr_dev(path1, "class", "clr-i-outline clr-i-outline-path-2 svelte-f48tzt");
    			add_location(path1, file, 96, 10, 2770);
    			attr_dev(path2, "fill", "none");
    			attr_dev(path2, "d", "M0 0h36v36H0z");
    			attr_dev(path2, "class", "svelte-f48tzt");
    			add_location(path2, file, 100, 10, 2967);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg0, "aria-hidden", "true");
    			attr_dev(svg0, "role", "img");
    			attr_dev(svg0, "class", "iconify iconify--clarity svelte-f48tzt");
    			attr_dev(svg0, "width", "32");
    			attr_dev(svg0, "height", "32");
    			attr_dev(svg0, "preserveAspectRatio", "xMidYMid meet");
    			attr_dev(svg0, "viewBox", "0 0 36 36");
    			add_location(svg0, file, 82, 6, 2247);
    			attr_dev(div0, "id", "home");
    			attr_dev(div0, "class", "svelte-f48tzt");
    			add_location(div0, file, 81, 4, 2192);
    			attr_dev(path3, "fill", "currentColor");
    			attr_dev(path3, "d", "M78 72V32a6 6 0 0 1 12 0v40a6 6 0 0 1-12 0Zm39.9-41a6 6 0 0 0-11.8 2l7.9 47.5a30 30 0 0 1-60 0L61.9 33a6 6 0 1 0-11.8-2l-8 48a3.4 3.4 0 0 0-.1 1a42.2 42.2 0 0 0 36 41.6V224a6 6 0 0 0 12 0V121.6A42.2 42.2 0 0 0 126 80a3.4 3.4 0 0 0-.1-1Zm92.1 1v192a6 6 0 0 1-12 0v-58h-50a6.1 6.1 0 0 1-4.5-2a6.4 6.4 0 0 1-1.5-4.6a412.4 412.4 0 0 1 11.7-59c11.9-41.8 28.1-66.7 48.2-74A6 6 0 0 1 210 32Zm-12 10.1c-25.7 19.4-39.1 81.1-43.2 111.9H198Z");
    			attr_dev(path3, "class", "svelte-f48tzt");
    			add_location(path3, file, 147, 11, 4731);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg1, "aria-hidden", "true");
    			attr_dev(svg1, "role", "img");
    			attr_dev(svg1, "class", "iconify iconify--ph svelte-f48tzt");
    			attr_dev(svg1, "width", "32");
    			attr_dev(svg1, "height", "32");
    			attr_dev(svg1, "preserveAspectRatio", "xMidYMid meet");
    			attr_dev(svg1, "viewBox", "0 0 256 256");
    			add_location(svg1, file, 137, 8, 4408);
    			attr_dev(h20, "class", "ingredientsHeader svelte-f48tzt");
    			add_location(h20, file, 136, 6, 4369);
    			attr_dev(ul, "id", "ingredients");
    			attr_dev(ul, "class", "svelte-f48tzt");
    			add_location(ul, file, 154, 6, 5282);
    			attr_dev(div1, "class", "column imageColumn svelte-f48tzt");
    			add_location(div1, file, 103, 4, 3034);
    			attr_dev(a, "href", a_href_value = /*recipe*/ ctx[5].sourceUrl);
    			attr_dev(a, "class", "svelte-f48tzt");
    			add_location(a, file, 163, 24, 5534);
    			attr_dev(h21, "class", "title svelte-f48tzt");
    			add_location(h21, file, 163, 6, 5516);
    			attr_dev(span, "id", "url_link");
    			attr_dev(span, "class", "svelte-f48tzt");
    			add_location(span, file, 165, 19, 5624);
    			attr_dev(div2, "id", "url");
    			attr_dev(div2, "class", "svelte-f48tzt");
    			add_location(div2, file, 164, 6, 5590);
    			attr_dev(path4, "fill", "currentColor");
    			attr_dev(path4, "d", "M237.6 78.9a13.9 13.9 0 0 0-3.7-18.9a181.9 181.9 0 0 0-211.8 0a13.9 13.9 0 0 0-3.7 18.9l97.8 153.7a14 14 0 0 0 23.6 0l58.4-91.8h.1ZM29.1 69.7a170.1 170.1 0 0 1 197.8 0a2.1 2.1 0 0 1 .6 2.8l-9.8 15.3a149.9 149.9 0 0 0-179.4 0l-9.8-15.3a2.1 2.1 0 0 1 .6-2.8Zm35.6 59.7a22 22 0 1 1 20.7 32.5Zm65 96.8a2.1 2.1 0 0 1-3.4 0l-33.9-53.3a34 34 0 1 0-34.7-54.5L44.7 98a137.9 137.9 0 0 1 166.6 0l-19.4 30.4a34 34 0 1 0-36.5 57.3Zm32.2-50.7A22 22 0 0 1 172 134a21.5 21.5 0 0 1 13.4 4.6Z");
    			attr_dev(path4, "class", "svelte-f48tzt");
    			add_location(path4, file, 185, 11, 6228);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg2, "aria-hidden", "true");
    			attr_dev(svg2, "role", "img");
    			attr_dev(svg2, "class", "iconify iconify--ph svelte-f48tzt");
    			attr_dev(svg2, "width", "32");
    			attr_dev(svg2, "height", "32");
    			attr_dev(svg2, "preserveAspectRatio", "xMidYMid meet");
    			attr_dev(svg2, "viewBox", "0 0 256 256");
    			add_location(svg2, file, 175, 8, 5905);
    			attr_dev(path5, "fill", "currentColor");
    			attr_dev(path5, "d", "M128 230a102 102 0 1 1 102-102a102.2 102.2 0 0 1-102 102Zm0-192a90 90 0 1 0 90 90a90.1 90.1 0 0 0-90-90Zm62 90a6 6 0 0 0-6-6h-50V72a6 6 0 0 0-12 0v56a6 6 0 0 0 6 6h56a6 6 0 0 0 6-6Z");
    			attr_dev(path5, "class", "svelte-f48tzt");
    			add_location(path5, file, 201, 11, 7153);
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg3, "aria-hidden", "true");
    			attr_dev(svg3, "role", "img");
    			attr_dev(svg3, "class", "iconify iconify--ph svelte-f48tzt");
    			attr_dev(svg3, "width", "32");
    			attr_dev(svg3, "height", "32");
    			attr_dev(svg3, "preserveAspectRatio", "xMidYMid meet");
    			attr_dev(svg3, "viewBox", "0 0 256 256");
    			add_location(svg3, file, 191, 8, 6830);
    			attr_dev(div3, "id", "details");
    			attr_dev(div3, "class", "svelte-f48tzt");
    			add_location(div3, file, 174, 6, 5878);
    			attr_dev(path6, "fill", "currentColor");
    			attr_dev(path6, "d", "M222 128a6 6 0 0 1-6 6h-88a6 6 0 0 1 0-12h88a6 6 0 0 1 6 6Zm-94-58h88a6 6 0 0 0 0-12h-88a6 6 0 0 0 0 12Zm88 116h-88a6 6 0 0 0 0 12h88a6 6 0 0 0 0-12ZM87.9 43.6L57.3 71.8L44.1 59.6a6 6 0 0 0-8.2 8.8l17.4 16a5.7 5.7 0 0 0 4 1.6a5.7 5.7 0 0 0 4.1-1.6l34.7-32a6 6 0 1 0-8.2-8.8Zm0 64l-30.6 28.2l-13.2-12.2a6 6 0 0 0-8.2 8.8l17.4 16a5.7 5.7 0 0 0 4 1.6a5.7 5.7 0 0 0 4.1-1.6l34.7-32a6 6 0 1 0-8.2-8.8Zm0 64l-30.6 28.2l-13.2-12.2a6 6 0 0 0-8.2 8.8l17.4 16a5.7 5.7 0 0 0 4 1.6a5.7 5.7 0 0 0 4.1-1.6l34.7-32a6 6 0 1 0-8.2-8.8Z");
    			attr_dev(path6, "class", "svelte-f48tzt");
    			add_location(path6, file, 220, 11, 7837);
    			attr_dev(svg4, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg4, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg4, "aria-hidden", "true");
    			attr_dev(svg4, "role", "img");
    			attr_dev(svg4, "class", "iconify iconify--ph svelte-f48tzt");
    			attr_dev(svg4, "width", "32");
    			attr_dev(svg4, "height", "32");
    			attr_dev(svg4, "preserveAspectRatio", "xMidYMid meet");
    			attr_dev(svg4, "viewBox", "0 0 256 256");
    			add_location(svg4, file, 210, 8, 7514);
    			attr_dev(h22, "class", "recipe svelte-f48tzt");
    			add_location(h22, file, 209, 6, 7486);
    			attr_dev(ol, "id", "steps");
    			attr_dev(ol, "class", "svelte-f48tzt");
    			add_location(ol, file, 227, 6, 8470);
    			attr_dev(div4, "class", "column recipeColumn svelte-f48tzt");
    			add_location(div4, file, 162, 4, 5476);
    			attr_dev(div5, "class", "container svelte-f48tzt");
    			add_location(div5, file, 80, 2, 2164);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(svg0, path2);
    			append_dev(div5, t0);
    			append_dev(div5, div1);
    			if_block.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, h20);
    			append_dev(h20, svg1);
    			append_dev(svg1, path3);
    			append_dev(h20, t2);
    			append_dev(div1, t3);
    			append_dev(div1, ul);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul, null);
    			}

    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, h21);
    			append_dev(h21, a);
    			append_dev(a, t5);
    			append_dev(div4, t6);
    			append_dev(div4, div2);
    			append_dev(div2, t7);
    			append_dev(div2, span);
    			append_dev(span, t8);
    			append_dev(div2, t9);
    			append_dev(div2, t10);
    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			append_dev(div3, svg2);
    			append_dev(svg2, path4);
    			append_dev(div3, t12);
    			append_dev(div3, t13);
    			append_dev(div3, t14);
    			append_dev(div3, svg3);
    			append_dev(svg3, path5);
    			append_dev(div3, t15);
    			append_dev(div3, t16);
    			append_dev(div3, t17);
    			append_dev(div4, t18);
    			append_dev(div4, h22);
    			append_dev(h22, svg4);
    			append_dev(svg4, path6);
    			append_dev(h22, t19);
    			append_dev(div4, t20);
    			append_dev(div4, ol);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ol, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, t1);
    				}
    			}

    			if (dirty & /*recipe*/ 32) {
    				each_value_1 = /*recipe*/ ctx[5].ingredients;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*recipe*/ 32 && t5_value !== (t5_value = /*recipe*/ ctx[5].name + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*recipe*/ 32 && a_href_value !== (a_href_value = /*recipe*/ ctx[5].sourceUrl)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*shortUrl, recipe*/ 40 && t8_value !== (t8_value = (/*shortUrl*/ ctx[3] || /*recipe*/ ctx[5].sourceUrl.split("//")[1]) + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*recipe*/ 32 && t13_value !== (t13_value = /*recipe*/ ctx[5].servings + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*recipe*/ 32 && t16_value !== (t16_value = /*recipe*/ ctx[5].cookTime / 60 / 1000000 + "")) set_data_dev(t16, t16_value);

    			if (dirty & /*recipe*/ 32) {
    				each_value = /*recipe*/ ctx[5].instructions;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ol, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if_block.d();
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(80:28) ",
    		ctx
    	});

    	return block;
    }

    // (71:0) {#if page === "home"}
    function create_if_block(ctx) {
    	let input;
    	let t0;
    	let button;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			t1 = text("Go");
    			attr_dev(input, "spellcheck", "false");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Enter a recipe URL");
    			attr_dev(input, "class", "svelte-f48tzt");
    			add_location(input, file, 71, 2, 1920);
    			button.disabled = /*disabled*/ ctx[6];
    			attr_dev(button, "class", "svelte-f48tzt");
    			add_location(button, file, 78, 2, 2086);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*inputVal*/ ctx[0]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[8]),
    					listen_dev(input, "keyup", /*keyup_handler*/ ctx[9], false, false, false),
    					listen_dev(button, "click", /*load*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*inputVal*/ 1 && input.value !== /*inputVal*/ ctx[0]) {
    				set_input_value(input, /*inputVal*/ ctx[0]);
    			}

    			if (dirty & /*disabled*/ 64) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[6]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(71:0) {#if page === \\\"home\\\"}",
    		ctx
    	});

    	return block;
    }

    // (116:6) {:else}
    function create_else_block(ctx) {
    	let svg;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "fill", "currentColor");
    			attr_dev(path0, "d", "M40 176V48a8 8 0 0 1 8-8h160a8 8 0 0 1 8 8v112l-42.3-42.3a8 8 0 0 0-11.4 0l-44.6 44.6a8 8 0 0 1-11.4 0l-20.6-20.6a8 8 0 0 0-11.4 0Z");
    			attr_dev(path0, "opacity", ".2");
    			attr_dev(path0, "class", "svelte-f48tzt");
    			add_location(path0, file, 126, 11, 3731);
    			attr_dev(path1, "fill", "currentColor");
    			attr_dev(path1, "d", "M88 92a12 12 0 1 1 12 12a12 12 0 0 1-12-12Zm136-44v160a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h160a16 16 0 0 1 16 16ZM48 156.7L68.7 136a16.1 16.1 0 0 1 22.6 0l20.7 20.7l44.7-44.7a16.1 16.1 0 0 1 22.6 0l28.7 28.7V48H48ZM208 208v-44.7l-40-40l-44.7 44.7a16.1 16.1 0 0 1-22.6 0L80 147.3l-32 32V208Z");
    			attr_dev(path1, "class", "svelte-f48tzt");
    			add_location(path1, file, 130, 12, 3954);
    			attr_dev(svg, "class", "noImage svelte-f48tzt");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "width", "32");
    			attr_dev(svg, "height", "32");
    			attr_dev(svg, "preserveAspectRatio", "xMidYMid meet");
    			attr_dev(svg, "viewBox", "0 0 256 256");
    			add_location(svg, file, 116, 8, 3420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(116:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (105:6) {#if recipe.imageUrls[0]}
    function create_if_block_2(ctx) {
    	let img_1;
    	let img_1_alt_value;
    	let img_1_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img_1 = element("img");
    			attr_dev(img_1, "alt", img_1_alt_value = /*recipe*/ ctx[5].name + " image");
    			attr_dev(img_1, "class", "recipeImage svelte-f48tzt");
    			if (!src_url_equal(img_1.src, img_1_src_value = /*recipe*/ ctx[5].imageUrls[0])) attr_dev(img_1, "src", img_1_src_value);
    			add_location(img_1, file, 105, 8, 3107);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img_1, anchor);
    			/*img_1_binding*/ ctx[11](img_1);

    			if (!mounted) {
    				dispose = listen_dev(img_1, "error", /*error_handler*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*recipe*/ 32 && img_1_alt_value !== (img_1_alt_value = /*recipe*/ ctx[5].name + " image")) {
    				attr_dev(img_1, "alt", img_1_alt_value);
    			}

    			if (dirty & /*recipe*/ 32 && !src_url_equal(img_1.src, img_1_src_value = /*recipe*/ ctx[5].imageUrls[0])) {
    				attr_dev(img_1, "src", img_1_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img_1);
    			/*img_1_binding*/ ctx[11](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(105:6) {#if recipe.imageUrls[0]}",
    		ctx
    	});

    	return block;
    }

    // (156:8) {#each recipe.ingredients as ingredient}
    function create_each_block_1(ctx) {
    	let li;
    	let t0_value = /*ingredient*/ ctx[16].name + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(li, "class", "ingredient svelte-f48tzt");
    			add_location(li, file, 156, 10, 5363);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*recipe*/ 32 && t0_value !== (t0_value = /*ingredient*/ ctx[16].name + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(156:8) {#each recipe.ingredients as ingredient}",
    		ctx
    	});

    	return block;
    }

    // (229:8) {#each recipe.instructions as step}
    function create_each_block(ctx) {
    	let li;
    	let t0_value = /*step*/ ctx[13].text + "";
    	let t0;
    	let t1;
    	let li_class_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*step*/ ctx[13].isOptional ? "optional" : "") + " svelte-f48tzt"));
    			add_location(li, file, 229, 10, 8540);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*recipe*/ 32 && t0_value !== (t0_value = /*step*/ ctx[13].text + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*recipe*/ 32 && li_class_value !== (li_class_value = "" + (null_to_empty(/*step*/ ctx[13].isOptional ? "optional" : "") + " svelte-f48tzt"))) {
    				attr_dev(li, "class", li_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(229:8) {#each recipe.instructions as step}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let title_value;
    	let t;
    	let if_block_anchor;
    	document_1.title = title_value = /*title*/ ctx[2];

    	function select_block_type(ctx, dirty) {
    		if (/*page*/ ctx[1] === "home") return create_if_block;
    		if (/*page*/ ctx[1] === "recipe") return create_if_block_1;
    		if (/*page*/ ctx[1] === "loading") return create_if_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 4 && title_value !== (title_value = /*title*/ ctx[2])) {
    				document_1.title = title_value;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let disabled;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let page = "home", title = "Recipes", shortUrl = null;
    	let inputVal = "", img;
    	let recipe = {};

    	onMount(() => {
    		if (new URLSearchParams(location.search).get("url")) {
    			load(null, new URLSearchParams(location.search).get("url"), true);
    		}

    		document.querySelector("input").onpaste = async () => {
    			await new Promise(r => setTimeout(r, 10));
    			console.log("Pasted");
    			load(null, null, true);
    		};

    		window.onbeforeprint = async () => {
    			if (!recipe.sourceUrl || shortUrl) {
    				return;
    			}

    			$$invalidate(3, shortUrl = await fetch(`https://cors.explosionscratc.repl.co/is.gd/create.php?format=simple&url=${encodeURIComponent(recipe.sourceUrl)}`).then(r => r.text()));
    		};
    	});

    	async function load(_, url, bypass = false) {
    		console.log("Loading recipe");

    		if (disabled && !bypass) {
    			return;
    		}

    		if (!(url || inputVal).match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)) {
    			return alert("Invalid URL");
    		}

    		$$invalidate(1, page = "loading");
    		let res = await fetch(`https://cors.explosionscratc.repl.co/www.justtherecipe.com/extractRecipeAtUrl?url=${encodeURIComponent(url || inputVal)}`);

    		if (!res.ok) {
    			prompt("There was an error", await res.text() || res.status);
    			$$invalidate(1, page = "home");
    			return;
    		}

    		$$invalidate(5, recipe = await res.json());
    		history.pushState({}, title, `${location.pathname || ""}?url=${url || inputVal}`);
    		$$invalidate(2, title = recipe.name);
    		$$invalidate(1, page = "recipe");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		inputVal = this.value;
    		$$invalidate(0, inputVal);
    	}

    	const keyup_handler = e => e.key === "Enter" && load();
    	const click_handler = () => $$invalidate(1, page = "home");

    	function img_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			img = $$value;
    			$$invalidate(4, img);
    		});
    	}

    	const error_handler = () => $$invalidate(4, img.src = `https://cors.explosionscratc.repl.co/${img.src.split("//")[1]}`, img);

    	$$self.$capture_state = () => ({
    		onMount,
    		page,
    		title,
    		shortUrl,
    		inputVal,
    		img,
    		recipe,
    		load,
    		disabled
    	});

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(1, page = $$props.page);
    		if ('title' in $$props) $$invalidate(2, title = $$props.title);
    		if ('shortUrl' in $$props) $$invalidate(3, shortUrl = $$props.shortUrl);
    		if ('inputVal' in $$props) $$invalidate(0, inputVal = $$props.inputVal);
    		if ('img' in $$props) $$invalidate(4, img = $$props.img);
    		if ('recipe' in $$props) $$invalidate(5, recipe = $$props.recipe);
    		if ('disabled' in $$props) $$invalidate(6, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*inputVal*/ 1) {
    			$$invalidate(6, disabled = !inputVal.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/));
    		}
    	};

    	return [
    		inputVal,
    		page,
    		title,
    		shortUrl,
    		img,
    		recipe,
    		disabled,
    		load,
    		input_input_handler,
    		keyup_handler,
    		click_handler,
    		img_1_binding,
    		error_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
