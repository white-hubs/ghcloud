// /src/router/module/index.js
import { SHDA } from './SHDA'
import { SHBA } from './SHBA'
import { HTGL } from './HTGL'
import { SHWJ } from './SHWJ'
import { SHXY } from './SHXY'
import { SMRZ } from './SMRZ'
import { AREA } from "./area";
import { MESSAGE } from "./message";
export const module = [...SHDA,...SHBA,...HTGL,...SHWJ,...SHXY,...SMRZ,...AREA, ...MESSAGE]
