$(function() {

  /* L20n */

  var parser = new L20n.Parser();
  var compiler = new L20n.Compiler();

  var _retr = new L20n.RetranslationManager();
  compiler.setGlobals(_retr.globals);

  var entries;
  var data;

  function update() {
    $("#errors").empty();
    $("#output").empty();

    var code = source.getValue();
    var ast = parser.parse(code);
    try {
      data = JSON.parse(context.getValue());
    } catch (e) {}
    entries = compiler.compile(ast);

    for (var id in entries) {
      if (entries[id].expression) {
        continue;
        $("#output").append("<div><dt><code class=\"disabled\">" + id + "()</code></dt><dd></dd></div>");
      }
      var val;
      try {
        val = entries[id].getString(data);
      } catch (e) {
        if (e.source) {
          val = e.source;
        } else {
          $("#output").append("<div><dt><code class=\"disabled\">" + e.entry + "</code></dt><dd></dd></div>");
          continue;
        }
      }
      $("#output").append("<div><dt><code>" + id + "</code></dt><dd>" + val + "</dd></div>");
    }
  }

  /* ACE */

  var source = ace.edit("source");
  source.setShowPrintMargin(false);
  source.setDisplayIndentGuides(false);
  source.getSession().setUseWrapMode(true);
  source.setTheme("ace/theme/solarized_light");
  source.getSession().setMode("ace/mode/php");
  source.getSession().on('change', update);

  var context = ace.edit("context");
  context.setShowPrintMargin(false);
  context.setHighlightActiveLine(false);
  context.setHighlightGutterLine(false);
  context.setHighlightSelectedWord(false);
  context.getSession().setMode("ace/mode/json");
  context.getSession().on('change', update);


  /* Errors */

  parser.addEventListener('error', function(e) {
    var pos = source.getSession().getDocument().indexToPosition(e.pos);
    $("#errors").append("<dt>Syntax error near row " + (pos.row + 1) + 
                        ", column " + (pos.column + 1) + "</dt><dd>" + 
                        e.message + "</dd>");
  });
  compiler.addEventListener('error', function(e) {
    $("#errors").append("<dt>" + e.name + " in entity <code>" + e.entry + 
                        "</code></dt><dd>" + e.message + "</dd>");
  });



  /* Linkify */

  function utf8_to_b64(str) {
      return window.btoa(unescape(encodeURIComponent(str)));
  }

  function b64_to_utf8(str) {
      return decodeURIComponent(escape(window.atob(str)));
  }

  function linkify() {
    var state = {
      source: source.getValue(),
      context: context.getValue(),
    }
    return window.location.href.split("#")[0] + '#' + utf8_to_b64(JSON.stringify(state));
  }



  /* Main Code */


  var hash = window.location.hash.slice(1) || defaultHash;
  var state = JSON.parse(b64_to_utf8(hash));
  context.setValue(state.context);
  source.setValue(state.source);
  source.clearSelection();
  source.gotoLine(0);
  context.clearSelection();

  $('#share').popover({
    placement: 'bottom',
    html: true,
    title: 'Share URL',
    content: '<input id="share-url" type="text">',
  }).click(function() {
    $('#share-url').val(linkify()).focus().select();
    $(this).popover('toggle');
  });

  window.addEventListener("resize", update);
});
