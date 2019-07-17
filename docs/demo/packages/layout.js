var nxtx_layout = (function () {
    'use strict';

    var NodeType;
    (function (NodeType) {
        NodeType[NodeType["Paragraph"] = 1] = "Paragraph";
        NodeType[NodeType["Command"] = 2] = "Command";
        NodeType[NodeType["Text"] = 3] = "Text";
        NodeType[NodeType["Block"] = 4] = "Block";
        NodeType[NodeType["Html"] = 5] = "Html";
        NodeType[NodeType["Node"] = 6] = "Node";
        NodeType[NodeType["Dictionary"] = 11] = "Dictionary";
        NodeType[NodeType["Array"] = 12] = "Array";
        NodeType[NodeType["Number"] = 13] = "Number";
        NodeType[NodeType["String"] = 14] = "String";
    })(NodeType || (NodeType = {}));

    var style = document.createElement("style");
    style.id = 'layout-style-block';
    document.head.appendChild(style);
    var sheet = style.sheet;
    var parse = function (argNode) {
        if (argNode.type !== NodeType.Number)
            return argNode.value;
        return argNode.value + 'mm';
    };
    var replaceRule = function (newRule, ruleIndex) {
        if (sheet.deleteRule)
            sheet.deleteRule(ruleIndex);
        else if (sheet.removeRule)
            sheet.removeRule(ruleIndex);
        sheet.insertRule(newRule, ruleIndex);
    };
    var marginFormatters = {
        all: function (value) { replaceRule(".sheet { padding: " + value + " }", 1); },
        left: function (value) { replaceRule(".sheet { padding-left: " + value + " }", 1); },
        top: function (value) { replaceRule(".sheet { padding-top: " + value + " }", 1); },
        right: function (value) { replaceRule(".sheet { padding-right: " + value + " }", 1); },
        bottom: function (value) { replaceRule(".sheet { padding-bottom: " + value + " }", 1); },
        vertical: function (value) { replaceRule(".sheet { padding-top: " + value + "; padding-bottom: " + value + " }", 1); },
        horizontal: function (value) { replaceRule(".sheet { padding-left: " + value + "; padding-right: " + value + " }", 1); },
        'head-separator': function (value) { sheet.insertRule("header { margin-bottom: " + value, 2); },
        'foot-skip': function (value) { sheet.insertRule("footer { margin-top: " + value, 3); },
    };
    sheet.insertRule('@page { size: A4 }', 0);
    sheet.insertRule(".sheet { padding: 2cm }", 1);
    sheet.insertRule('header { height: 3cm }', 2);
    sheet.insertRule('footer { height: 3cm }', 3);
    var pkg = {
        name: 'layout',
        commands: {
            'set-paper-size': function (paperSizeNode) { return replaceRule("@page { size: " + paperSizeNode + " }", 0); },
            'set-header': function (heightNode) { return replaceRule("header {height: " + heightNode + "mm", 2); },
            'set-footer': function (heightNode) { return replaceRule("footer {height: " + heightNode + "mm", 3); }
        },
        preprocessors: {
            'set-margin': function (dictNode) { return Object.keys(dictNode.value).forEach(function (key) { return marginFormatters[key](parse(dictNode.value[key])); }); }
        }
    };
    if (nxtx) {
        Object.keys(pkg.commands).forEach(function (name) { return nxtx.registerCommand(name, pkg.commands[name]); });
        Object.keys(pkg.preprocessors).forEach(function (name) { return nxtx.registerPreprocessor(name, pkg.preprocessors[name]); });
    }

    return pkg;

}());
//# sourceMappingURL=layout.js.map
