(function() {
  /* 
      TODO: disable ACE keyboard shortcuts
  */  var DuctTape, capture_event;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty;
  capture_event = function(ev) {
    ev.preventDefault();
    return ev.stopPropagation();
  };
  DuctTape = (function() {
    function DuctTape() {
      this.format_command = __bind(this.format_command, this);      this.session = {
        history: [],
        last_exception: null,
        last_result: null,
        last_evaluated_js: null,
        config: {
          initial_buffer: "\u0111"
        }
      };
      this.editor = 0;
      this.editor_div = document.getElementById("editor");
      this.coffee_source = "";
      this.js_source = "";
      this.init_ace();
      this.init_ui();
      this.reset_editor_contents();
    }
    DuctTape.prototype.init_ace = function() {
      this.editor = ace.edit("editor");
      this.editor.getSession().setMode(new (require("ace/mode/coffee").Mode)());
      this.editor.getSession().setTabSize(4);
      this.editor.getSession().setUseSoftTabs(true);
      this.editor.getSession().setUseWrapMode(false);
      this.editor.setHighlightActiveLine(true);
      this.editor.setShowPrintMargin(false);
      this.editor.renderer.setShowGutter(false);
      this.editor.renderer.setHScrollBarAlwaysVisible(false);
      this.editor.getSession().on("change", __bind(function(ev) {
        return this.update(ev);
      }, this));
      return this.editor.setKeyboardHandler({
        handleKeyboard: __bind(function(_1, _2, _3, keyCode, ev) {
          if (ev != null) {
            switch (ev.keyCode) {
              case 13:
                if (ev.shiftKey === false) {
                  capture_event(ev);
                  if (this.js_source.length > 0) {
                    this.execute(this.coffee_source, this.js_source);
                    this.clear_src_buffers();
                    this.reset_editor_contents();
                    return this.scroll_to_bottom();
                  }
                }
                break;
              case 68:
                if (ev.altKey === true) {
                  capture_event(ev);
                  return this.editor.insert('\u0111');
                }
            }
          }
        }, this)
      });
    };
    DuctTape.prototype.init_ui = function() {
      $('#editor_wrapper').height($('#editor').height());
      $('#editor_wrapper').width($('#editor').width());
      $('#parseerror').width($('#editor').width());
      return $('#menuhelp').click(__bind(function() {
        this.run('help');
        return false;
      }, this));
    };
    DuctTape.prototype.compile = function(src) {
      if (src.length === 0) {
        return src;
      } else {
        return CoffeeScript.compile(src, {
          'bare': true
        });
      }
    };
    DuctTape.prototype.update = function(ev) {
      var _ref;
      this.coffee_source = this.editor.getSession().getValue().trim();
      try {
        this.js_source = (_ref = this.compile(this.coffee_source)) != null ? _ref.trim() : void 0;
        $("#ok").show();
        return $("#parseerror").hide();
      } catch (error) {
        this.js_source = "";
        $("#ok").hide();
        return $("#parseerror").show().text(error.message);
      }
    };
    DuctTape.prototype.format_ex = function(ex) {
      var _ref, _ref2;
      return $("<div class=\"eval_result\"><span class=\"label label-warning\"> <strong>Exception</strong> (" + ((_ref = ex.type) != null ? _ref : "") + ") </span>&nbsp;<strong>" + ((_ref2 = ex.message) != null ? _ref2 : "") + "</strong></div>");
    };
    DuctTape.prototype.format_retval = function(val) {
      var wrap;
      wrap = function(x) {
        return $("<div class=\"eval_result\">" + x + "</div>");
      };
      if (val instanceof HTMLElement) {
        return val;
      } else {
        switch (typeof val) {
          case "string":
            return wrap("\"" + val + "\"");
          case "object":
            if (val.toString !== Object.prototype.toString) {
              return wrap(val.toString());
            } else {
              return this.format_object(val);
            }
            break;
          default:
            return wrap(val);
        }
      }
    };
    DuctTape.prototype.format_object = function(obj) {
      var get_node_data, object_viewer;
      get_node_data = function(nodeid) {
        var data, key, node, value;
        data = {
          data: "Object",
          state: "open",
          children: []
        };
        node = obj;
        if (nodeid !== -1) {
          debugger;
          data.state = "closed";
        }
        data.children = (function() {
          var _results;
          _results = [];
          for (key in node) {
            if (!__hasProp.call(node, key)) continue;
            value = node[key];
            _results.push({
              data: key,
              state: "closed"
            });
          }
          return _results;
        })();
        console.dir(data);
        return data;
      };
      object_viewer = $("<div class='eval_result'></div>");
      object_viewer.jstree({
        json_data: {
          data: function(nodeid, cb) {
            return cb(get_node_data(nodeid));
          }
        },
        plugins: ["themes", "json_data", "crrm"]
      });
      return object_viewer;
    };
    DuctTape.prototype.format_command = function() {
      var div_inner, div_outer, lines;
      lines = $('div.ace_content', this.editor_div).find('div.ace_line').clone();
      div_inner = $("<div class='highlighted_expr ace_editor ace_text-layer'></div>");
      div_inner.append(lines);
      div_outer = $("<div class='" + (this.editor.getTheme().cssClass) + " alert alert-info'></div>");
      div_outer.append(div_inner);
      return div_outer;
    };
    DuctTape.prototype.clear_src_buffers = function() {
      this.js_source = "";
      return this.coffee_source = "";
    };
    DuctTape.prototype.reset_editor_contents = function() {
      this.editor.gotoLine(0);
      this.editor.getSession().setValue(this.session.config.initial_buffer);
      return this.editor.moveCursorToPosition({
        column: 1,
        row: 0
      });
    };
    DuctTape.prototype.scroll_to_bottom = function() {
      return $("html, body").animate({
        scrollTop: $(document).height()
      }, 200);
    };
    DuctTape.prototype.execute = function(coffee_stmt, js_stmt) {
      var evalexpr, result;
      evalexpr = js_stmt != null ? js_stmt : this.compile(coffee_stmt);
      result = null;
      try {
        return result = this.format_retval(window.eval(evalexpr.replace(/\n/g, "") + "\n"));
      } catch (error) {
        return result = this.format_ex(error);
      } finally {
        $('#interactions').append(this.format_command());
        $('#interactions').append(result);
      }
    };
    DuctTape.prototype.run = function(expr) {
      this.execute(expr);
      return this.scroll_to_bottom();
    };
    return DuctTape;
  })();
  $(function() {
    return window["\u0111"] = new DuctTape();
  });
}).call(this);