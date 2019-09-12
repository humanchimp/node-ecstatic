import mime from "mime";
import charset from "charset";

export const define = mappings => mime.define(mappings, true);

let customGetType = (file, defaultValue) => null; // eslint-disable-line no-unused-vars

export const setCustomGetType = (fn) => { customGetType = fn; };

export const getType = (file, defaultValue) => (
  customGetType(file, defaultValue) ||
  mime.getType(file) ||
  defaultValue
);

let customLookupCharset = mimeType => null; // eslint-disable-line no-unused-vars

export const setCustomLookupCharset = (fn) => { customLookupCharset = fn; };

export const lookupCharset = mimeType => (
  customLookupCharset(mimeType) ||
  charset(mimeType)
);
