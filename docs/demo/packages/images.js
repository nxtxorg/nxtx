var nxtx_images = (function () {
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

    var pkg = {
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
        Object.keys(pkg.commands).forEach(function (name) { return nxtx.registerCommand(name, pkg.commands[name]); });
    }

    return pkg;

}());
//# sourceMappingURL=images.js.map
