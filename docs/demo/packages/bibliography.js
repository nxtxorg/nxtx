var nxtx_bibliography = (function () {
    'use strict';

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

    var _this = undefined;
    var entries = {};
    var cited = [];
    var style = document.createElement("style");
    style.id = 'bibliography-style-block';
    document.head.appendChild(style);
    var sheet = style.sheet;
    sheet.insertRule('.bib-entry { margin-bottom: 5px }', 0);
    sheet.insertRule('.bib-entry > * { display: inline-block }', 1);
    sheet.insertRule(".bib-entry span { margin-right: 5px }", 2);
    var formatAuthors = function (author) {
        var authors = author.value.split(' and ').map(function (a) {
            var split = a.split(',');
            if (split.length > 1)
                a = split[1].trim() + ' ' + split[0];
            var names = a.split(' ').filter(function (n) { return n[0] === n[0].toUpperCase(); });
            var lastname = names[names.length - 1];
            names.length -= 1;
            return names.map(function (n) { return n[0] + '.'; }).join(' ') + ' ' + lastname;
        }).join(', ');
        return nxtx.html('span', { class: 'bib bib-author' }, authors + '.');
    };
    var entryFieldFormatting = {
        author: formatAuthors,
        year: function (year) { return nxtx.html('span', { class: 'bib bib-year' }, "(" + year.value + ")."); },
        title: function (title) { return nxtx.html('span', { class: 'bib bib-title' }, "\u201C" + title.value + "\u201D."); },
        url: function (url) { return nxtx.html('a', { class: 'bib bib-url', href: url.value, target: '_blank' }, url.value); },
        isbn: function (isbn) { return nxtx.html('span', { class: 'bib bib-isbn' }, "ISBN: " + isbn.value + "."); }
    };
    nxtx.on('prerender', function () { return cited = []; });
    var pkg = {
        name: 'basic-formatting',
        commands: {
            'cite': function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return __awaiter(_this, void 0, void 0, function () {
                    var cites;
                    return __generator(this, function (_a) {
                        cites = args.flatMap(function (arg) {
                            if (!entries[arg.value]) {
                                console.warn("Bibliography entry '" + arg.value + "' was not found");
                                return [arg.value + "?", ', '];
                            }
                            var index = cited.indexOf(arg.value);
                            if (index === -1) {
                                cited.push(arg.value);
                                index = cited.length - 1;
                            }
                            var e = nxtx.htmlLite('a', { href: "#---" + arg.value });
                            e.innerText = (index + 1).toString();
                            return [e, ', '];
                        });
                        cites.length -= 1;
                        return [2, nxtx.html.apply(nxtx, ['span', null, '['].concat(cites, [']']))];
                    });
                });
            },
            'bib-print': function () { return __awaiter(_this, void 0, void 0, function () {
                var mapped;
                return __generator(this, function (_a) {
                    mapped = cited
                        .map(function (e) { return entries[e]; })
                        .map(function (entryFields, number) { return nxtx.html.apply(nxtx, ['div', { id: "---" + cited[number], class: 'bib bib-entry' },
                        nxtx.html('span', { class: 'bib bib-ordering' }, "[" + (number + 1) + "]")].concat(Object.keys(entryFieldFormatting)
                        .filter(function (k) { return entryFields[k] !== undefined; })
                        .map(function (k) { return entryFieldFormatting[k](entryFields[k]); }))); });
                    return [2, [
                            { type: NodeType.Command, name: 'pagebreak', args: [] },
                            nxtx.html('h2', { class: 'bibliography' }, 'Bibliography')
                        ].concat(mapped)];
                });
            }); }
        },
        preprocessors: {
            'bib-add': function (key, entry) {
                if (!entry || entry.type !== NodeType.Dictionary)
                    return console.error('bib-add only must have a dictionary as second argument');
                entries[key.value] = entry.value;
            },
        }
    };
    if (nxtx)
        nxtx.registerPackage(pkg);

    return pkg;

}());
//# sourceMappingURL=bibliography.js.map
