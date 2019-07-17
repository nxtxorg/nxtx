var nxtx_core = (function () {
    'use strict';

    var style = document.createElement("style");
    style.id = 'basic-formatting-style-block';
    document.head.appendChild(style);
    var sheet = style.sheet;
    sheet.insertRule('.page-break { height: 0 }', 0);
    sheet.insertRule('.meta ~ .page-break:not(:last-child) { height: 100% }', 1);
    sheet.insertRule('.paragraph-break { height: 0 }', 2);
    sheet.insertRule('.meta ~ .paragraph-break:not(:last-child) { height: 1.2em }', 3);
    var pkg = {
        name: 'basic-formatting',
        commands: {
            'text:it': function (content) { return nxtx.html('i', null, content.value); },
            'text:bf': function (content) { return nxtx.html('b', null, content.value); },
            'text:tt': function (content) { return nxtx.html('code', null, content.value); },
            'dquote': function (contentNode) { return nxtx.text("\u201C" + contentNode.value + "\u201D"); },
            'break': function () { return nxtx.htmlLite('div', { class: 'meta', style: 'height: 1.5em' }); },
            'pagebreak': function () { return nxtx.htmlLite('div', { class: 'meta page-break' }); },
            'title': function (titleNode) { return (document.title = titleNode.value) && undefined; },
            'ignore': function () { return undefined; },
        }
    };
    if (nxtx) {
        Object.keys(pkg.commands).forEach(function (name) { return nxtx.registerCommand(name, pkg.commands[name]); });
    }

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

    var pkg$1 = {
        name: 'images',
        commands: {
            'image': function (srcNode, pctNode) {
                if (pctNode === void 0) { pctNode = { type: NodeType.Number, value: 100 }; }
                return nxtx.htmlLite('img', { src: srcNode.value, style: "max-width: " + pctNode.value + "%" });
            },
            'images': function (srcArray) { return srcArray.value.map(function (srcNode) { return nxtx.htmlLite('img', { src: srcNode.value, style: "max-width: calc(" + (99.9 / srcArray.value.length) + "% - 4px); margin: 2px" }); }); }
        }
    };
    if (nxtx) {
        Object.keys(pkg$1.commands).forEach(function (name) { return nxtx.registerCommand(name, pkg$1.commands[name]); });
    }

    var style$1 = document.createElement("style");
    style$1.id = 'layout-style-block';
    document.head.appendChild(style$1);
    var sheet$1 = style$1.sheet;
    var parse = function (argNode) {
        if (argNode.type !== NodeType.Number)
            return argNode.value;
        return argNode.value + 'mm';
    };
    var replaceRule = function (newRule, ruleIndex) {
        if (sheet$1.deleteRule)
            sheet$1.deleteRule(ruleIndex);
        else if (sheet$1.removeRule)
            sheet$1.removeRule(ruleIndex);
        sheet$1.insertRule(newRule, ruleIndex);
    };
    var marginFormatters = {
        all: function (value) { replaceRule(".sheet { padding: " + value + " }", 1); },
        left: function (value) { replaceRule(".sheet { padding-left: " + value + " }", 1); },
        top: function (value) { replaceRule(".sheet { padding-top: " + value + " }", 1); },
        right: function (value) { replaceRule(".sheet { padding-right: " + value + " }", 1); },
        bottom: function (value) { replaceRule(".sheet { padding-bottom: " + value + " }", 1); },
        vertical: function (value) { replaceRule(".sheet { padding-top: " + value + "; padding-bottom: " + value + " }", 1); },
        horizontal: function (value) { replaceRule(".sheet { padding-left: " + value + "; padding-right: " + value + " }", 1); },
        'head-separator': function (value) { sheet$1.insertRule("header { margin-bottom: " + value, 2); },
        'foot-skip': function (value) { sheet$1.insertRule("footer { margin-top: " + value, 3); },
    };
    sheet$1.insertRule('@page { size: A4 }', 0);
    sheet$1.insertRule(".sheet { padding: 2cm }", 1);
    sheet$1.insertRule('header { height: 3cm }', 2);
    sheet$1.insertRule('footer { height: 3cm }', 3);
    var pkg$2 = {
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
        Object.keys(pkg$2.commands).forEach(function (name) { return nxtx.registerCommand(name, pkg$2.commands[name]); });
        Object.keys(pkg$2.preprocessors).forEach(function (name) { return nxtx.registerPreprocessor(name, pkg$2.preprocessors[name]); });
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var _this = undefined;
    var loaded = {
        documents: {},
        packages: []
    };
    var pkg$3 = {
        name: 'loading',
        preprocessors: {
            'load:document': function (nameNode) { return __awaiter(_this, void 0, void 0, function () {
                var name, filename, response, lastModified, cached, content, nodes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            name = nameNode.value.toString();
                            filename = (name.substr(name.length - 5).toLowerCase() !== '.nxtx') ? name + ".nxtx" : name;
                            return [4, fetch(filename)];
                        case 1:
                            response = _a.sent();
                            if (!response.ok)
                                return [2, console.error("NxTx document " + filename + " not found")];
                            lastModified = response.headers.get('last-modified');
                            cached = loaded.documents[filename];
                            if (lastModified && cached && cached.lastModified === lastModified) {
                                console.log('using cached', filename);
                                return [2, loaded.documents[filename].nodes];
                            }
                            return [4, response.text()];
                        case 2:
                            content = _a.sent();
                            nodes = nxtx.parse(content);
                            if (lastModified) {
                                loaded.documents[filename] = { lastModified: lastModified, nodes: nodes };
                            }
                            return [2, nodes];
                    }
                });
            }); },
            'load:package': function (srcNode) { return new Promise(function (acc, rej) {
                if (loaded.packages[srcNode.value])
                    return acc();
                loaded.packages[srcNode.value] = true;
                var script = document.createElement('script');
                script.src = srcNode.value;
                script.async = true;
                var done = false;
                script.onreadystatechange = script.onload = function () {
                    if (!done && (!script.readyState || /loaded|complete/.test(script.readyState))) {
                        done = true;
                        acc();
                    }
                };
                document.head.appendChild(script);
            }); }
        }
    };
    if (nxtx) {
        Object.keys(pkg$3.preprocessors).forEach(function (name) { return nxtx.registerPreprocessor(name, pkg$3.preprocessors[name]); });
    }

    var _this$1 = undefined;
    var style$2 = document.createElement("style");
    style$2.id = 'styling-style-block';
    document.head.appendChild(style$2);
    var sheet$2 = style$2.sheet;
    var pkg$4 = {
        name: 'styling',
        commands: {
            'add-css-rule': function (rule, index) {
                if (index === void 0) { index = 1; }
                return sheet$2.insertRule(rule.value, index);
            },
            'set-root-style': function (prop) {
                var values = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    values[_i - 1] = arguments[_i];
                }
                return document.querySelector('.nxtx-root').style.setProperty(prop, values.map(function (e) { return e.value; }).join(', '));
            },
            'set-font-family': function () {
                var fontFamilies = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    fontFamilies[_i] = arguments[_i];
                }
                return ({
                    type: NodeType.Command,
                    name: 'set-root-style',
                    args: ['font-family'].concat(fontFamilies)
                });
            },
            'set-local-font-family': function (fontName, fontUrl) {
                var css = "@font-face { font-family: '" + fontName.value + "'; src: local('" + fontName.value + "'), url('" + fontUrl.value + "'); }";
                return ([
                    {
                        type: NodeType.Command,
                        name: 'add-css-root',
                        args: [{ type: NodeType.Text, value: css }]
                    },
                    {
                        type: NodeType.Command,
                        name: 'set-root-style',
                        args: ['font-family', fontName]
                    }
                ]);
            },
            'set-google-font-family': function () {
                var fontFamilies = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    fontFamilies[_i] = arguments[_i];
                }
                return __awaiter(_this$1, void 0, void 0, function () {
                    var attr, link;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                attr = {
                                    rel: 'stylesheet',
                                    href: "https://fonts.googleapis.com/css?family=" + fontFamilies[0].value + "&display=swap",
                                    id: 'link-gfont-' + fontFamilies[0].value
                                };
                                if (!!document.getElementById(attr.id)) return [3, 2];
                                return [4, nxtx.html('link', attr)];
                            case 1:
                                link = _a.sent();
                                document.head.appendChild(link);
                                _a.label = 2;
                            case 2: return [2, { type: NodeType.Command, name: 'set-font-family', args: fontFamilies }];
                        }
                    });
                });
            }
        }
    };
    if (nxtx) {
        Object.keys(pkg$4.commands).forEach(function (name) { return nxtx.registerCommand(name, pkg$4.commands[name]); });
    }

    var core = {
        formatting: pkg,
        images: pkg$1,
        layout: pkg$2,
        loading: pkg$3,
        styling: pkg$4
    };

    return core;

}());
//# sourceMappingURL=core.js.map
