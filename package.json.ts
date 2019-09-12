{
  "name": "@topl/lope",
  "version": "1.0.3",
  "main": "dist/cjs/lope.js",
  "module": "dist/esm/lope.js",
  "browser": "dist/iife/lope.js",
  "typings": "dist/lope.d.ts",
  "license": "MIT",
  "scripts": {
    "test": "stable",
    "build": "rollup -c rollup.config.js",
    "prepublishOnly": "yarn test && yarn build && mv dist/cjs/lope.d.ts* dist && rm dist/*/lope.d.ts*"
  },
  "devDependencies": {
    "@babel/core": "^7.4.5",
    "@babel/generator": "^7.4.4",
    "@babel/types": "^7.4.4",
    "@topl/stable": "^0.5.21",
    "@topl/tack": "^1.0.6",
    "@wessberg/rollup-plugin-ts": "^1.1.54",
    "nyc": "^14.1.1",
    "rollup": "^1.13.0",
    "rollup-plugin-multi-entry": "^2.1.0",
    "typescript": "^3.5.1"
  },
  "nyc": {
    "instrument": false
  },
  "dependencies": {
    "@topl/canter": "^1.0.0",
    "@topl/hiho": "^1.0.0",
    "matched": "^4.0.0"
  }
}
