import * as pegparser from './nxtx-parser.js';
import { Parser } from "pegjs";

const parser : Parser = pegparser.default;
console.log(parser);
export default parser;