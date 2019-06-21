define("ace/mode/nxtx_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function(e, t, n) {
    "use strict";
    var r = e("../lib/oop"),
        i = e("./text_highlight_rules").TextHighlightRules,
        s = function() {
            this.$rules = {
                "start" : [{
                    token : ["keyword", "lparen", "string", "rparen"],
                    regex : "(\\\\[a-zA-Z](?:[a-zA-Z0-9_:-]*[a-zA-Z0-9]+)?)(\\()([^)]+)(\\))"
                }, {
                    token : "keyword",
                    regex : "\\\\[a-zA-Z]([a-zA-Z0-9_:-]*[a-zA-Z0-9]+)?"
                }]
            }, this.normalizeRules()
        };
    r.inherits(s, i), t.LatexHighlightRules = s
}), define("ace/mode/folding/nxtx", ["require", "exports", "module", "ace/lib/oop", "ace/mode/folding/fold_mode", "ace/range", "ace/token_iterator"], function(e, t, n) {
    "use strict";
    var r = e("../../lib/oop"),
        i = e("./fold_mode").FoldMode,
        s = e("../../range").Range,
        o = e("../../token_iterator").TokenIterator,
        u = {
            "\\subparagraph": 1,
            "\\paragraph": 2,
            "\\subsubsubsection": 3,
            "\\subsubsection": 4,
            "\\subsection": 5,
            "\\section": 6,
            "\\chapter": 7,
        },
        a = t.FoldMode = function() {};

}), define("ace/mode/nxtx", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/nxtx_highlight_rules", "ace/mode/behaviour/cstyle", "ace/mode/folding/nxtx"], function(e, t, n) {
    "use strict";
    var r = e("../lib/oop"),
        i = e("./text").Mode,
        s = e("./nxtx_highlight_rules").NxTxHighlightRules,
        o = e("./behaviour/cstyle").CstyleBehaviour,
        u = e("./folding/nxtx").FoldMode,
        a = function() {
            this.HighlightRules = s, this.foldingRules = new u, this.$behaviour = new o({
                braces: !0
            })
        };
});
(function() {
    window.require(["ace/mode/nxtx"], function(m) {
        if (typeof module == "object" && typeof exports == "object" && module) {
            module.exports = m;
        }
    });
})();