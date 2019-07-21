var nxtx_list_of_contents = (function () {
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

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

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
    //# sourceMappingURL=nxtx-types.js.map

    var baseNumbering = {};
    var numbering = {};
    var parts = [];
    var refs = {};
    var style = document.createElement("style");
    style.id = 'basic-formatting-style-block';
    document.head.appendChild(style);
    var sheet = style.sheet;
    var registerPart = function (type, element) {
        baseNumbering[type] = 0;
        numbering = __assign({}, baseNumbering);
        var obj = { preprocessor: {}, command: {} };
        obj.preprocessor[type] = function (content) {
            numbering[type] += 1;
            resetChildrenNumbering(type);
            parts.push({ type: type, title: content.value, numbering: __assign({}, numbering) });
        };
        obj.command[type] = function (content) { return nxtx.html(element, null, content.value); };
        return obj;
    };
    var types = [
        ['chapter', 'h1'],
        ['section', 'h3'],
        ['subsection', 'h4'],
    ].map(function (arr) { return registerPart(arr[0], arr[1]); });
    var preprocessors = Object.assign.apply(Object, [{}].concat(types.map(function (t) { return t.preprocessor; })));
    var commands = Object.assign.apply(Object, [{}].concat(types.map(function (t) { return t.command; })));
    var resetChildrenNumbering = function (type) {
        var types = Object.keys(numbering);
        var reset = false;
        for (var i = 0; i < types.length; i++) {
            if (reset)
                numbering[types[i]] = 0;
            else if (types[i] === type)
                reset = true;
        }
    };
    var capitalizeStr = function (str) { return str[0].toUpperCase() + str.substr(1); };
    var formatNumbering = function (numbering) { return Object.keys(numbering).map(function (k) { return numbering[k]; }).join('.').replace(/[.0]+$/, ''); };
    var formatRef = function (ref, capitalize) {
        var part = refs[ref];
        if (!part) {
            console.warn("Label '" + ref + "' has not been referenced");
            return nxtx.html('b', { class: "warning" }, "" + ref);
        }
        var result = '';
        switch (part.type) {
            case 'chapter':
                result = "chapter " + formatNumbering(part.numbering);
                break;
            case 'section':
                result = "section " + formatNumbering(part.numbering);
                break;
            case 'subsection':
                result = "section " + formatNumbering(part.numbering);
                break;
        }
        return capitalize ? capitalizeStr(result) : result;
    };
    sheet.insertRule('.loc-chapter { font-size: 14pt }', 0);
    sheet.insertRule('.loc-section { font-size: 13pt; padding-left: 2em }', 1);
    sheet.insertRule('.loc-subsection { font-size: 12pt; padding-left: 4em }', 2);
    var pkg = {
        name: 'images',
        preprocessors: __assign({ 'label': function (ref) {
                if (refs[ref.value] !== undefined)
                    console.warn("Attempt to redefine label '" + ref.value + "' ignored");
                else
                    refs[ref.value] = parts[parts.length - 1];
            } }, preprocessors),
        commands: __assign({ 'label': function (ref) { return nxtx.html('span', { id: '--' + ref.value, 'data-label': ref.value }); }, 'ref': function (ref) { return nxtx.html('a', { href: "#--" + ref.value, 'data-ref': ref.value }, formatRef(ref.value, false)); }, 'Ref': function (ref) { return nxtx.html('a', { href: "#--" + ref.value, 'data-ref': ref.value }, formatRef(ref.value, true)); }, 'loc-print': function () {
                var rendition = [
                    nxtx.html('h2', { class: 'list-of-contents' }, 'List of Contents')
                ].concat(parts.map(function (part) { return nxtx.html('div', { class: "loc-" + part.type }, formatNumbering(part.numbering) + " " + part.title); }), [
                    { type: NodeType.Command, name: 'pagebreak', args: [] }
                ]);
                return rendition;
            } }, commands),
        hooks: {
            prerender: function () {
                numbering = __assign({}, baseNumbering);
                parts = [];
                refs = {};
            }
        }
    };
    if (nxtx)
        nxtx.registerPackage(pkg);

    return nxtx;

}());
//# sourceMappingURL=list-of-contents.js.map
