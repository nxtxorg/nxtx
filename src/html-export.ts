/**
 * Snapshooter is responsible for returning HTML and computed CSS of all nodes from selected DOM subtree.
 *
 * @param HTMLElement root Root node for the subtree that will be processed
 * @returns {*} object with HTML as a string and CSS as an array of arrays of css properties
 */
function Snapshooter(root) {
    "use strict";

    // list of shorthand properties based on CSSShorthands.in from the Chromium code (https://code.google.com/p/chromium/codesearch)
    // TODO this list should not be hardcoded here
    var shorthandProperties = [
            'animation', 'background', 'border','border-top','border-right','border-bottom','border-left',
            'border-width','border-color','border-style','border-radius','border-image','border-spacing',
            'flex','flex-flow','font','grid-area','grid-column','grid-row','list-style','margin','marker','outline',
            'overflow','padding','text-decoration', 'transition','-webkit-border-after','-webkit-border-before',
            '-webkit-border-end','-webkit-border-start','-webkit-columns','-webkit-column-rule',
            '-webkit-margin-collapse','-webkit-mask','-webkit-mask-position','-webkit-mask-repeat',
            '-webkit-text-emphasis','-webkit-transition','-webkit-transform-origin'
        ],
        idCounter = 1;

    /**
     * Changes CSSStyleDeclaration to simple Object removing unwanted properties ('1','2','parentRule','cssText' etc.) in the process.
     *
     * @param CSSStyleDeclaration style
     * @returns {}
     */
    function styleDeclarationToSimpleObject(style) {
        var i, l, cssName, camelCaseName,
            output = { content: '' };

        for (i = 0, l = style.length; i < l; i++) {
            output[style[i]] = style[style[i]];
        }

        // Work around http://crbug.com/313670 (the "content" property is not present as a computed style indexed property value).
        output.content = fixContentProperty(style.content);

        // Since shorthand properties are not available in the indexed array, copy them from named properties
        for (cssName in shorthandProperties) {
            if (shorthandProperties.hasOwnProperty(cssName)) {
                camelCaseName = shorthandProperties[cssName];
                output[cssName] = style[camelCaseName];
            }
        }

        return output;
    }

    // Partial workaround for http://crbug.com/315028 (single words in the "content" property are not wrapped with quotes)
    function fixContentProperty(content) {
        var values, output, value, i, l;

        output = [];

        if (content) {
            //content property can take multiple values - we need to split them up
            //FIXME this won't work for '\''
            values = content.match(/(?:[^\s']+|'[^']*')+/g);

            for (i = 0, l = values.length; i < l; i++) {
                value = values[i];

                if (value.match(/^(url\()|(attr\()|normal|none|open-quote|close-quote|no-open-quote|no-close-quote|chapter_counter|'/g)) {
                    output.push(value);
                } else {
                    output.push("'" + value + "'");
                }
            }
        }

        return output.join(' ');
    }

    function createID(node) {
        //":snappysnippet_prefix:" is a prefix placeholder
        return ':snappysnippet_prefix:' + node.tagName + '_' + idCounter++;
    }

    function dumpCSS(node, pseudoElement) {
        var styles;

        styles = node.ownerDocument.defaultView.getComputedStyle(node, pseudoElement);

        if (pseudoElement) {
            //if we are dealing with pseudoelement, check if 'content' property isn't empty
            //if it is, then we can ignore the whole element
            if (!styles.getPropertyValue('content')) {
                return null;
            }
        }

        return styleDeclarationToSimpleObject(styles);
    }

    function cssObjectForElement(element, omitPseudoElements = false) {
        return {
            id: createID(element),
            tagName: element.tagName,
            node: dumpCSS(element, null),
            before: omitPseudoElements ? null : dumpCSS(element, ':before'),
            after: omitPseudoElements ? null : dumpCSS(element, ':after')
        };
    }

    function ancestorTagHTML(element, closingTag = undefined) {
        var i, attr, value, idSeen,
            result, attributes;

        if (closingTag) {
            return '</' + element.tagName + '>';
        }

        result = '<' + element.tagName;
        attributes = element.attributes;

        for (i = 0; i < attributes.length; ++i) {
            attr = attributes[i];

            if (attr.name.toLowerCase() === 'id') {
                value = createID(element);
                idSeen = true;
            } else {
                value = attr.value;
            }

            result += ' ' + attributes[i].name + '="' + value + '"';
        }

        if (!idSeen) {
            result += ' id="' + createID(element) + '"';
        }

        result += '>';

        return result;
    }

    /**
     * Replaces all relative URLs (in images, links etc.) with absolute URLs
     * @param element
     */
    function relativeURLsToAbsoluteURLs(element) {
        switch (element.nodeName) {
            case 'A':
            case 'AREA':
            case 'LINK':
            case 'BASE':
                if (element.hasAttribute('href')) {
                    element.setAttribute('href', element.href);
                }
                break;
            case 'IMG':
            case 'IFRAME':
            case 'INPUT':
            case 'FRAME':
            case 'SCRIPT':
                if (element.hasAttribute('src')) {
                    element.setAttribute('src', element.src);
                }
                break;
            case 'FORM':
                if (element.hasAttribute('action')) {
                    element.setAttribute('action', element.action);
                }
                break;
        }
    }

    function init() {
        var css = [],
            ancestorCss = [],
            descendants,
            descendant,
            htmlSegments,
            leadingAncestorHtml,
            trailingAncestorHtml,
            reverseAncestors = [],
            i, l,
            parent,
            clone;

        descendants = root.getElementsByTagName('*');

        parent = root.parentElement;
        while (parent && parent !== document.body) {
            reverseAncestors.push(parent);
            parent = parent.parentElement;
        }

        // First we go through all nodes and dump all CSS
        css.push(cssObjectForElement(root));

        for (i = 0, l = descendants.length; i < l; i++) {
            css.push(cssObjectForElement(descendants[i]));
        }

        for (i = reverseAncestors.length - 1; i >= 0; i--) {
            ancestorCss.push(cssObjectForElement(reverseAncestors[i], true));
        }

        // Next we dump all HTML and update IDs
        // Since we don't want to touch original DOM and we want to change IDs, we clone the original DOM subtree
        clone = root.cloneNode(true);
        descendants = clone.getElementsByTagName('*');
        idCounter = 1;

        clone.setAttribute('id', createID(clone));

        for (i = 0, l = descendants.length; i < l; i++) {
            descendant = descendants[i];
            descendant.setAttribute('id', createID(descendant));
            relativeURLsToAbsoluteURLs(descendant);
        }

        // Build leading and trailing HTML for ancestors
        htmlSegments = [];
        for (i = reverseAncestors.length - 1; i >= 0; i--) {
            htmlSegments.push(ancestorTagHTML(reverseAncestors[i]));
        }
        leadingAncestorHtml = htmlSegments.join('');

        htmlSegments = [];
        for (i = 0, l = reverseAncestors.length; i < l; i++) {
            htmlSegments.push(ancestorTagHTML(reverseAncestors[i], true));
        }
        trailingAncestorHtml = htmlSegments.join('');

        return JSON.stringify({
            html: clone.outerHTML,
            leadingAncestorHtml: leadingAncestorHtml,
            trailingAncestorHtml: trailingAncestorHtml,
            css: css,
            ancestorCss: ancestorCss
        });
    }

    return init();
}