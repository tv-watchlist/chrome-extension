/*
Author: Surya Nyayapati
http://www.nyayapati.com/surya

The MIT License (MIT)
Copyright (c) <2012> <Surya Nyayapati>
*/
 export class X2J {
    static VERSION: '2.0';
    /**
     * <pre>
     * convert xml to x2j object
     * Rule: Get ordered list of javascript object for xml
     * Grammar :-
     * jNode = [{jName, jValue}] || [{jIndex, jNode,jName}]
     * jIndex = [{jName, counter}]
     * jName = 'node_name'
     * jValue = 'node_value'
     * counter = 0..n (i.e. index for jNode)
     * </pre>
     * @param xml
     * @param xpathExpression
     */
    static parseXml(xml, xpathExpression) {
        // TODO: if there is name conflict, change name and during output change it back
        const GetChildNode = (domElement) => {
            // Rule: attributes are unique list of name value pair inside a node.
            // Summary: This will return an object with jIndex property as an array
            // and all the attributes as name value properties.
            // The number of attributes in a node will be equal to jIndex length.
            // each element inside jIndex will be same as attribute name.
            const GetAttributes = (attrs) => {
                const obj = {};
                obj['jIndex'] = [];
                if (!attrs) {
                    return obj;
                }
                for (let i = 0; i < attrs.length; i++) {
                    obj[attrs[i].name] = attrs[i].value;
                    obj['jIndex'].push(attrs[i].name);
                }
                return obj;
            };
            const obj = {};
            obj['jName'] = domElement.nodeName;
            obj['jAttr'] = GetAttributes(domElement.attributes);

            for (const node1 of domElement.childNodes) {
                if (node1.nodeType === TEXT_NODE) {
                    if (node1.textContent.trim() !== '') {
                        obj['jValue'] = node1.textContent;
                    }
                } else {
                    let tmp = {};
                    const childNode = GetChildNode(node1);
                    for (const key in childNode) {
                        if (key !== 'jIndex' && key !== 'jValue') {
                            tmp[key] = childNode[key];
                        }
                    }

                    if (!childNode['jIndex']) {
                        tmp = childNode;
                        if (!tmp.hasOwnProperty('jValue')) {
                            tmp['jValue'] = '';
                        }
                    }

                    if (obj['jIndex'] === undefined) {
                        obj['jIndex'] = [];
                    }

                    if (obj.hasOwnProperty(node1.nodeName)) {
                        obj['jIndex'].push([node1.nodeName, obj[node1.nodeName].length]);
                        if (childNode['jIndex'] !== undefined) {
                            tmp['jIndex'] = childNode['jIndex'];
                        }
                        obj[node1.nodeName].push(tmp);
                    } else {
                        obj[node1.nodeName] = [];
                        obj['jIndex'].push([node1.nodeName, obj[node1.nodeName].length]);
                        if (childNode['jIndex'] !== undefined) {
                            tmp['jIndex'] = childNode['jIndex'];
                        }
                        obj[node1.nodeName].push(tmp);
                    }
                }
            }

            return obj;
        };

        if (!xml) {
            return;
        }
        if (!xpathExpression) {
            xpathExpression = '/';
        }
        // var xmlStr = (new XMLSerializer()).serializeToString(xml);
        let xmlDocument = null;
        if (typeof(xml) === 'string') {
            const parser = new DOMParser();
            xmlDocument = parser.parseFromString(xml, 'text/xml');
        } else {
            xmlDocument = xml;
        }

        // var xmlDoc = parser.parseFromString(xmlStr, 'text/xml');
        // var nodes = xmlDoc.evaluate('/', xmlDoc, null, XPathResult.ANY_TYPE, null);
        const xPathResult1 = xmlDocument.evaluate(xpathExpression, xmlDocument, null, XPathResult.ANY_TYPE, null);
        if (xPathResult1.resultType === UNORDERED_NODE_ITERATOR_TYPE
        || xPathResult1.resultType === ORDERED_NODE_ITERATOR_TYPE) {
            // if result is a node-set then UNORDERED_NODE_ITERATOR_TYPE is always the resulting type

            let dom_node1 = xPathResult1.iterateNext(); // returns node https://developer.mozilla.org/en/DOM/Node
            const domArr = [];
            while (dom_node1) {
                domArr.push(GetChildNode(dom_node1));
                dom_node1 = xPathResult1.iterateNext();
            }
            // if (domArr.length == 1) {
            //    return domArr[0];
            // }
            return domArr;
        } else {
            console.log(xPathResult1);
        }
    }

    static printJNode(jNode, callback) {
        if (jNode === undefined) {
            return;
        }
        const _printNode = (_jNode, level) => {
            if (_jNode.jIndex !== undefined) {
                for (let j = 0; j < _jNode.jIndex.length; j++) {
                    const node = _jNode[_jNode.jIndex[j][0]][_jNode.jIndex[j][1]];
                    if (node.jIndex !== undefined) {
                        callback(_jNode.jIndex[j][0], node.jIndex, node.jAttr, level);
                        _printNode(node, level + 1); // go deeper
                    } else {
                        callback(node.jName, node.jValue, node.jAttr, level);
                    }
                }
            } else {
                callback(_jNode.jName, _jNode.jValue, _jNode.jAttr, level);
            }
        };
        _printNode(jNode, 0);
    }

    static printJAttribute(jAttr) {
        const strArr = [];
        if (jAttr.jIndex) {
            for (let i = 0; i < jAttr.jIndex.length; i++) {
                strArr.push(`${jAttr.jIndex[i]}=${jAttr[jAttr.jIndex[i]]}`);
            }
        }
        return strArr.join(', ');
    }

    /// Safe way to get value, Use when not sure if a name is present.
    // if not present return default_value.
    static getValue(jNode, name, index?, default_value?) {
        // if index undefined then 0
        // console.log(jNode, name, index,default_value);
        if (jNode === undefined || jNode === null) {
            return default_value;
        }
        if (index === undefined || typeof(index) !== 'number') {
            index = 0;
        }

        if (index >= 0) {
            // if index is present
            if (jNode.length !== undefined && jNode.length === index + 1) { // if array
                if (jNode[index].jName !== undefined && jNode[index].jName === name) {
                    // console.log('getValue 0');
                    return jNode[index].jValue; // tested
                }
            } else if (jNode[name] !== undefined) {
                // if not array but name obj is array then return indexOf
                const node = jNode[name][index];
                if (node !== undefined) {
                    if (node.jValue !== undefined) {
                        // console.log('getValue 1');
                        return node.jValue;
                    } else {
                        // console.log('getValue 2');
                        return node;
                    }
                }
            } else if (jNode.jName !== undefined && jNode.jName === name) {
                // console.log('getValue 3');
                return jNode.jValue;
            } else if (jNode.length === undefined && jNode[name]) { // if not array and name exists
                // console.log('getValue 4');
                return jNode[name]; // tested
            }

            return default_value;
        }

        throw new RangeError('index must be positive!');

    }

    static search(jNode, name, options) {
        // options is object with keys like 'max_deep', ...
        // same as getValue, but returns array of obj(jName,jValue/jIndex,jAttr,[jNode]??)
    }

    static getAttr(jNode, name) {
        if (!jNode || !jNode.jAttr || isObjectEmpty(jNode.jAttr)) {
            return;
        }
        return jNode.jAttr[name];
    }

    static getJson(jNode) {
        return JSON.stringify(jNode);
    }

    static getXml(jNode) {
        const _printAttribute = (_jNode) => {
            if (!_jNode) {
                return;
            }
            const arr = [];
            for (let i = 0; i < _jNode.jAttr.jIndex.length; i++) {
                arr.push(`${_jNode.jAttr.jIndex[i]}='${_jNode.jAttr[_jNode.jAttr.jIndex[i]]}'`);
            }
            return arr.join('');
        };
        const _printNode = (_jNode, level) => {
            if (!_jNode) {
                return;
            }
            let xml = '';
            if (_jNode.jIndex) {
                for (let j = 0; j < _jNode.jIndex.length; j++) {
                    const node = _jNode[_jNode.jIndex[j][0]][_jNode.jIndex[j][1]];
                    if (node.jIndex) {
                        xml += `${spaces(level)}<${_jNode.jIndex[j][0]}${_printAttribute(node)}>
                                ${_printNode(node, level + 1)}${spaces(level)}</${_jNode.jIndex[j][0]}>`;
                    } else {
                        xml += `${spaces(level)}<${_jNode.jIndex[j][0]}${_printAttribute(node)}>
                                ${node.jValue}</${_jNode.jIndex[j][0]}>\n`;
                    }
                }
            } else {
                xml += `${spaces(level)}<${_jNode.jName}${_printAttribute(_jNode)}>
                        ${_jNode.jValue}</${_jNode.jName}>\n`;
            }
            return xml;
        };
        if (jNode.length) {
            const xmlArr = [];
            for (let i = 0; i < jNode.length; i++) {
                xmlArr.push(_printNode(jNode[i], 0))
            }
            return xmlArr;
        } else {
            return _printNode(jNode, 0);
        }
    }
}

const isObjectEmpty = (obj) => {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
};

const spaces = (no: number) => {
    if (no === 0) {
        return '';
    }
    let space = ' ';
    for (let i = 0; i < no; i++) {
        space += ' ';
    }
    return space;
};

//////////////////////////////////////////////////////////
////////////////////// Constants /////////////////////////
//////////////////////////////////////////////////////////

// A result set containing whatever type naturally results from evaluation of the expression.
//  Note that if the result is a node-set then UNORDERED_NODE_ITERATOR_TYPE is always the resulting type.
const ANY_TYPE = 0; // A result node-set containing the first node in the document that matches the expression.

// A result containing a single number. This is useful for example,
// in an XPath expression using the count() function.
const NUMBER_TYPE = 1;

// A result containing a single string.
const STRING_TYPE = 2;

// A result containing a single boolean value. This is useful for example,
// in an XPath expression using the not() function.
const BOOLEAN_TYPE = 3;

// A result node-set containing all the nodes matching the expression.
// The nodes may not necessarily be in the same order that they appear in the document.
const UNORDERED_NODE_ITERATOR_TYPE = 4;

// A result node-set containing all the nodes matching the expression.
// The nodes in the result set are in the same order that they appear in the document.
const ORDERED_NODE_ITERATOR_TYPE = 5;

// A result node-set containing snapshots of all the nodes matching the expression.
// The nodes may not necessarily be in the same order that they appear in the document.
const UNORDERED_NODE_SNAPSHOT_TYPE = 6;

// A result node-set containing snapshots of all the nodes matching the expression.
// The nodes in the result set are in the same order that they appear in the document.
const ORDERED_NODE_SNAPSHOT_TYPE = 7;

// A result node-set containing any single node that matches the expression.
// The node is not necessarily the first node in the document that matches the expression.
const ANY_UNORDERED_NODE_TYPE = 8;

const FIRST_ORDERED_NODE_TYPE = 9;

const XPathDict = {
    0: 'ANY_TYPE',
    1: 'NUMBER_TYPE',
    2: 'STRING_TYPE',
    3: 'BOOLEAN_TYPE',
    4: 'UNORDERED_NODE_ITERATOR_TYPE',
    5: 'ORDERED_NODE_ITERATOR_TYPE',
    6: 'UNORDERED_NODE_SNAPSHOT_TYPE',
    7: 'ORDERED_NODE_SNAPSHOT_TYPE',
    8: 'ANY_UNORDERED_NODE_TYPE',
    9: 'FIRST_ORDERED_NODE_TYPE'
};

const ELEMENT_NODE = 1;
const ATTRIBUTE_NODE = 2;
const TEXT_NODE = 3;
const DATA_SECTION_NODE = 4;
const ENTITY_REFERENCE_NODE = 5;
const ENTITY_NODE = 6;
const PROCESSING_INSTRUCTION_NODE = 7;
const COMMENT_NODE = 8;
const DOCUMENT_NODE = 9;
const DOCUMENT_TYPE_NODE = 10;
const DOCUMENT_FRAGMENT_NODE = 11;
const NOTATION_NODE = 12;


const ElementDict = { 1: 'ELEMENT_NODE',
    2: 'ATTRIBUTE_NODE',
    3: 'TEXT_NODE',
    4: 'DATA_SECTION_NODE',
    5: 'ENTITY_REFERENCE_NODE',
    6: 'ENTITY_NODE',
    7: 'PROCESSING_INSTRUCTION_NODE',
    8: 'COMMENT_NODE',
    9: 'DOCUMENT_NODE',
    10: 'DOCUMENT_TYPE_NODE',
    11: 'DOCUMENT_FRAGMENT_NODE',
    12: 'NOTATION_NODE'
};
