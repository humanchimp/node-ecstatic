'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));
var fs = _interopDefault(require('fs'));
var url = _interopDefault(require('url'));
var http = _interopDefault(require('http'));

var autoIndex = true;
var showDir = true;
var showDotfiles = true;
var humanReadable = true;
var hidePermissions = false;
var si = false;
var cache = "max-age=3600";
var cors = false;
var gzip = true;
var brotli = false;
var defaultExt = ".html";
var handleError = true;
var serverHeader = true;
var contentType = "application/octet-stream";
var weakEtags = true;
var weakCompare = true;
var handleOptionsMethod = false;
var defaults = {
	autoIndex: autoIndex,
	showDir: showDir,
	showDotfiles: showDotfiles,
	humanReadable: humanReadable,
	hidePermissions: hidePermissions,
	si: si,
	cache: cache,
	cors: cors,
	gzip: gzip,
	brotli: brotli,
	defaultExt: defaultExt,
	handleError: handleError,
	serverHeader: serverHeader,
	contentType: contentType,
	weakEtags: weakEtags,
	weakCompare: weakCompare,
	handleOptionsMethod: handleOptionsMethod
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var urlJoin = createCommonjsModule(function (module) {
(function (name, context, definition) {
  if ( module.exports) module.exports = definition();
  else context[name] = definition();
})('urljoin', commonjsGlobal, function () {

  function normalize (strArray) {
    var resultArray = [];
    if (strArray.length === 0) { return ''; }

    if (typeof strArray[0] !== 'string') {
      throw new TypeError('Url must be a string. Received ' + strArray[0]);
    }

    // If the first part is a plain protocol, we combine it with the next part.
    if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
      var first = strArray.shift();
      strArray[0] = first + strArray[0];
    }

    // There must be two or three slashes in the file protocol, two slashes in anything else.
    if (strArray[0].match(/^file:\/\/\//)) {
      strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1:///');
    } else {
      strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1://');
    }

    for (var i = 0; i < strArray.length; i++) {
      var component = strArray[i];

      if (typeof component !== 'string') {
        throw new TypeError('Url must be a string. Received ' + component);
      }

      if (component === '') { continue; }

      if (i > 0) {
        // Removing the starting slashes for each component but the first.
        component = component.replace(/^[\/]+/, '');
      }
      if (i < strArray.length - 1) {
        // Removing the ending slashes for each component but the last.
        component = component.replace(/[\/]+$/, '');
      } else {
        // For the last component we will combine multiple slashes to a single one.
        component = component.replace(/[\/]+$/, '/');
      }

      resultArray.push(component);

    }

    var str = resultArray.join('/');
    // Each input component is now separated by a single slash except the possible first plain protocol part.

    // remove trailing slash before parameters or hash
    str = str.replace(/\/(\?|&|#[^!])/g, '$1');

    // replace ? in parameters with &
    var parts = str.split('?');
    str = parts.shift() + (parts.length > 0 ? '?': '') + parts.join('&');

    return str;
  }

  return function () {
    var input;

    if (typeof arguments[0] === 'object') {
      input = arguments[0];
    } else {
      input = [].slice.call(arguments);
    }

    return normalize(input);
  };

});
});

/*!
 * ee-first
 * Copyright(c) 2014 Jonathan Ong
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var eeFirst = first;

/**
 * Get the first event in a set of event emitters and event pairs.
 *
 * @param {array} stuff
 * @param {function} done
 * @public
 */

function first(stuff, done) {
  if (!Array.isArray(stuff))
    throw new TypeError('arg must be an array of [ee, events...] arrays')

  var cleanups = [];

  for (var i = 0; i < stuff.length; i++) {
    var arr = stuff[i];

    if (!Array.isArray(arr) || arr.length < 2)
      throw new TypeError('each array member must be [ee, events...]')

    var ee = arr[0];

    for (var j = 1; j < arr.length; j++) {
      var event = arr[j];
      var fn = listener(event, callback);

      // listen to the event
      ee.on(event, fn);
      // push this listener to the list of cleanups
      cleanups.push({
        ee: ee,
        event: event,
        fn: fn,
      });
    }
  }

  function callback() {
    cleanup();
    done.apply(null, arguments);
  }

  function cleanup() {
    var x;
    for (var i = 0; i < cleanups.length; i++) {
      x = cleanups[i];
      x.ee.removeListener(x.event, x.fn);
    }
  }

  function thunk(fn) {
    done = fn;
  }

  thunk.cancel = cleanup;

  return thunk
}

/**
 * Create the event listener.
 * @private
 */

function listener(event, done) {
  return function onevent(arg1) {
    var args = new Array(arguments.length);
    var ee = this;
    var err = event === 'error'
      ? arg1
      : null;

    // copy args to prevent arguments escaping scope
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    done(err, ee, event, args);
  }
}

/**
 * Module exports.
 * @public
 */

var onFinished_1 = onFinished;
var isFinished_1 = isFinished;

/**
 * Module dependencies.
 * @private
 */



/**
 * Variables.
 * @private
 */

/* istanbul ignore next */
var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)); };

/**
 * Invoke callback when the response has finished, useful for
 * cleaning up resources afterwards.
 *
 * @param {object} msg
 * @param {function} listener
 * @return {object}
 * @public
 */

function onFinished(msg, listener) {
  if (isFinished(msg) !== false) {
    defer(listener, null, msg);
    return msg
  }

  // attach the listener to the message
  attachListener(msg, listener);

  return msg
}

/**
 * Determine if message is already finished.
 *
 * @param {object} msg
 * @return {boolean}
 * @public
 */

function isFinished(msg) {
  var socket = msg.socket;

  if (typeof msg.finished === 'boolean') {
    // OutgoingMessage
    return Boolean(msg.finished || (socket && !socket.writable))
  }

  if (typeof msg.complete === 'boolean') {
    // IncomingMessage
    return Boolean(msg.upgrade || !socket || !socket.readable || (msg.complete && !msg.readable))
  }

  // don't know
  return undefined
}

/**
 * Attach a finished listener to the message.
 *
 * @param {object} msg
 * @param {function} callback
 * @private
 */

function attachFinishedListener(msg, callback) {
  var eeMsg;
  var eeSocket;
  var finished = false;

  function onFinish(error) {
    eeMsg.cancel();
    eeSocket.cancel();

    finished = true;
    callback(error);
  }

  // finished on first message event
  eeMsg = eeSocket = eeFirst([[msg, 'end', 'finish']], onFinish);

  function onSocket(socket) {
    // remove listener
    msg.removeListener('socket', onSocket);

    if (finished) return
    if (eeMsg !== eeSocket) return

    // finished on first socket event
    eeSocket = eeFirst([[socket, 'error', 'close']], onFinish);
  }

  if (msg.socket) {
    // socket already assigned
    onSocket(msg.socket);
    return
  }

  // wait for socket to be assigned
  msg.on('socket', onSocket);

  if (msg.socket === undefined) {
    // node.js 0.8 patch
    patchAssignSocket(msg, onSocket);
  }
}

/**
 * Attach the listener to the message.
 *
 * @param {object} msg
 * @return {function}
 * @private
 */

function attachListener(msg, listener) {
  var attached = msg.__onFinished;

  // create a private single listener with queue
  if (!attached || !attached.queue) {
    attached = msg.__onFinished = createListener(msg);
    attachFinishedListener(msg, attached);
  }

  attached.queue.push(listener);
}

/**
 * Create listener on message.
 *
 * @param {object} msg
 * @return {function}
 * @private
 */

function createListener(msg) {
  function listener(err) {
    if (msg.__onFinished === listener) msg.__onFinished = null;
    if (!listener.queue) return

    var queue = listener.queue;
    listener.queue = null;

    for (var i = 0; i < queue.length; i++) {
      queue[i](err, msg);
    }
  }

  listener.queue = [];

  return listener
}

/**
 * Patch ServerResponse.prototype.assignSocket for node.js 0.8.
 *
 * @param {ServerResponse} res
 * @param {function} callback
 * @private
 */

function patchAssignSocket(res, callback) {
  var assignSocket = res.assignSocket;

  if (typeof assignSocket !== 'function') return

  // res.on('socket', callback) is broken in 0.8
  res.assignSocket = function _assignSocket(socket) {
    assignSocket.call(this, socket);
    callback(socket);
  };
}
onFinished_1.isFinished = isFinished_1;

/**
 * @param typeMap [Object] Map of MIME type -> Array[extensions]
 * @param ...
 */
function Mime() {
  this._types = Object.create(null);
  this._extensions = Object.create(null);

  for (var i = 0; i < arguments.length; i++) {
    this.define(arguments[i]);
  }

  this.define = this.define.bind(this);
  this.getType = this.getType.bind(this);
  this.getExtension = this.getExtension.bind(this);
}

/**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * If a type declares an extension that has already been defined, an error will
 * be thrown.  To suppress this error and force the extension to be associated
 * with the new type, pass `force`=true.  Alternatively, you may prefix the
 * extension with "*" to map the type to extension, without mapping the
 * extension to the type.
 *
 * e.g. mime.define({'audio/wav', ['wav']}, {'audio/x-wav', ['*wav']});
 *
 *
 * @param map (Object) type definitions
 * @param force (Boolean) if true, force overriding of existing definitions
 */
Mime.prototype.define = function(typeMap, force) {
  for (var type in typeMap) {
    var extensions = typeMap[type].map(function(t) {return t.toLowerCase()});
    type = type.toLowerCase();

    for (var i = 0; i < extensions.length; i++) {
      var ext = extensions[i];

      // '*' prefix = not the preferred type for this extension.  So fixup the
      // extension, and skip it.
      if (ext[0] == '*') {
        continue;
      }

      if (!force && (ext in this._types)) {
        throw new Error(
          'Attempt to change mapping for "' + ext +
          '" extension from "' + this._types[ext] + '" to "' + type +
          '". Pass `force=true` to allow this, otherwise remove "' + ext +
          '" from the list of extensions for "' + type + '".'
        );
      }

      this._types[ext] = type;
    }

    // Use first extension as default
    if (force || !this._extensions[type]) {
      var ext = extensions[0];
      this._extensions[type] = (ext[0] != '*') ? ext : ext.substr(1);
    }
  }
};

/**
 * Lookup a mime type based on extension
 */
Mime.prototype.getType = function(path) {
  path = String(path);
  var last = path.replace(/^.*[/\\]/, '').toLowerCase();
  var ext = last.replace(/^.*\./, '').toLowerCase();

  var hasPath = last.length < path.length;
  var hasDot = ext.length < last.length - 1;

  return (hasDot || !hasPath) && this._types[ext] || null;
};

/**
 * Return file extension associated with a mime type
 */
Mime.prototype.getExtension = function(type) {
  type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
  return type && this._extensions[type.toLowerCase()] || null;
};

var Mime_1 = Mime;

var standard = {"application/andrew-inset":["ez"],"application/applixware":["aw"],"application/atom+xml":["atom"],"application/atomcat+xml":["atomcat"],"application/atomsvc+xml":["atomsvc"],"application/bdoc":["bdoc"],"application/ccxml+xml":["ccxml"],"application/cdmi-capability":["cdmia"],"application/cdmi-container":["cdmic"],"application/cdmi-domain":["cdmid"],"application/cdmi-object":["cdmio"],"application/cdmi-queue":["cdmiq"],"application/cu-seeme":["cu"],"application/dash+xml":["mpd"],"application/davmount+xml":["davmount"],"application/docbook+xml":["dbk"],"application/dssc+der":["dssc"],"application/dssc+xml":["xdssc"],"application/ecmascript":["ecma","es"],"application/emma+xml":["emma"],"application/epub+zip":["epub"],"application/exi":["exi"],"application/font-tdpfr":["pfr"],"application/geo+json":["geojson"],"application/gml+xml":["gml"],"application/gpx+xml":["gpx"],"application/gxf":["gxf"],"application/gzip":["gz"],"application/hjson":["hjson"],"application/hyperstudio":["stk"],"application/inkml+xml":["ink","inkml"],"application/ipfix":["ipfix"],"application/java-archive":["jar","war","ear"],"application/java-serialized-object":["ser"],"application/java-vm":["class"],"application/javascript":["js","mjs"],"application/json":["json","map"],"application/json5":["json5"],"application/jsonml+json":["jsonml"],"application/ld+json":["jsonld"],"application/lost+xml":["lostxml"],"application/mac-binhex40":["hqx"],"application/mac-compactpro":["cpt"],"application/mads+xml":["mads"],"application/manifest+json":["webmanifest"],"application/marc":["mrc"],"application/marcxml+xml":["mrcx"],"application/mathematica":["ma","nb","mb"],"application/mathml+xml":["mathml"],"application/mbox":["mbox"],"application/mediaservercontrol+xml":["mscml"],"application/metalink+xml":["metalink"],"application/metalink4+xml":["meta4"],"application/mets+xml":["mets"],"application/mods+xml":["mods"],"application/mp21":["m21","mp21"],"application/mp4":["mp4s","m4p"],"application/msword":["doc","dot"],"application/mxf":["mxf"],"application/n-quads":["nq"],"application/n-triples":["nt"],"application/octet-stream":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"],"application/oda":["oda"],"application/oebps-package+xml":["opf"],"application/ogg":["ogx"],"application/omdoc+xml":["omdoc"],"application/onenote":["onetoc","onetoc2","onetmp","onepkg"],"application/oxps":["oxps"],"application/patch-ops-error+xml":["xer"],"application/pdf":["pdf"],"application/pgp-encrypted":["pgp"],"application/pgp-signature":["asc","sig"],"application/pics-rules":["prf"],"application/pkcs10":["p10"],"application/pkcs7-mime":["p7m","p7c"],"application/pkcs7-signature":["p7s"],"application/pkcs8":["p8"],"application/pkix-attr-cert":["ac"],"application/pkix-cert":["cer"],"application/pkix-crl":["crl"],"application/pkix-pkipath":["pkipath"],"application/pkixcmp":["pki"],"application/pls+xml":["pls"],"application/postscript":["ai","eps","ps"],"application/pskc+xml":["pskcxml"],"application/raml+yaml":["raml"],"application/rdf+xml":["rdf","owl"],"application/reginfo+xml":["rif"],"application/relax-ng-compact-syntax":["rnc"],"application/resource-lists+xml":["rl"],"application/resource-lists-diff+xml":["rld"],"application/rls-services+xml":["rs"],"application/rpki-ghostbusters":["gbr"],"application/rpki-manifest":["mft"],"application/rpki-roa":["roa"],"application/rsd+xml":["rsd"],"application/rss+xml":["rss"],"application/rtf":["rtf"],"application/sbml+xml":["sbml"],"application/scvp-cv-request":["scq"],"application/scvp-cv-response":["scs"],"application/scvp-vp-request":["spq"],"application/scvp-vp-response":["spp"],"application/sdp":["sdp"],"application/set-payment-initiation":["setpay"],"application/set-registration-initiation":["setreg"],"application/shf+xml":["shf"],"application/sieve":["siv","sieve"],"application/smil+xml":["smi","smil"],"application/sparql-query":["rq"],"application/sparql-results+xml":["srx"],"application/srgs":["gram"],"application/srgs+xml":["grxml"],"application/sru+xml":["sru"],"application/ssdl+xml":["ssdl"],"application/ssml+xml":["ssml"],"application/tei+xml":["tei","teicorpus"],"application/thraud+xml":["tfi"],"application/timestamped-data":["tsd"],"application/voicexml+xml":["vxml"],"application/wasm":["wasm"],"application/widget":["wgt"],"application/winhlp":["hlp"],"application/wsdl+xml":["wsdl"],"application/wspolicy+xml":["wspolicy"],"application/xaml+xml":["xaml"],"application/xcap-diff+xml":["xdf"],"application/xenc+xml":["xenc"],"application/xhtml+xml":["xhtml","xht"],"application/xml":["xml","xsl","xsd","rng"],"application/xml-dtd":["dtd"],"application/xop+xml":["xop"],"application/xproc+xml":["xpl"],"application/xslt+xml":["xslt"],"application/xspf+xml":["xspf"],"application/xv+xml":["mxml","xhvml","xvml","xvm"],"application/yang":["yang"],"application/yin+xml":["yin"],"application/zip":["zip"],"audio/3gpp":["*3gpp"],"audio/adpcm":["adp"],"audio/basic":["au","snd"],"audio/midi":["mid","midi","kar","rmi"],"audio/mp3":["*mp3"],"audio/mp4":["m4a","mp4a"],"audio/mpeg":["mpga","mp2","mp2a","mp3","m2a","m3a"],"audio/ogg":["oga","ogg","spx"],"audio/s3m":["s3m"],"audio/silk":["sil"],"audio/wav":["wav"],"audio/wave":["*wav"],"audio/webm":["weba"],"audio/xm":["xm"],"font/collection":["ttc"],"font/otf":["otf"],"font/ttf":["ttf"],"font/woff":["woff"],"font/woff2":["woff2"],"image/aces":["exr"],"image/apng":["apng"],"image/bmp":["bmp"],"image/cgm":["cgm"],"image/dicom-rle":["drle"],"image/emf":["emf"],"image/fits":["fits"],"image/g3fax":["g3"],"image/gif":["gif"],"image/heic":["heic"],"image/heic-sequence":["heics"],"image/heif":["heif"],"image/heif-sequence":["heifs"],"image/ief":["ief"],"image/jls":["jls"],"image/jp2":["jp2","jpg2"],"image/jpeg":["jpeg","jpg","jpe"],"image/jpm":["jpm"],"image/jpx":["jpx","jpf"],"image/jxr":["jxr"],"image/ktx":["ktx"],"image/png":["png"],"image/sgi":["sgi"],"image/svg+xml":["svg","svgz"],"image/t38":["t38"],"image/tiff":["tif","tiff"],"image/tiff-fx":["tfx"],"image/webp":["webp"],"image/wmf":["wmf"],"message/disposition-notification":["disposition-notification"],"message/global":["u8msg"],"message/global-delivery-status":["u8dsn"],"message/global-disposition-notification":["u8mdn"],"message/global-headers":["u8hdr"],"message/rfc822":["eml","mime"],"model/3mf":["3mf"],"model/gltf+json":["gltf"],"model/gltf-binary":["glb"],"model/iges":["igs","iges"],"model/mesh":["msh","mesh","silo"],"model/stl":["stl"],"model/vrml":["wrl","vrml"],"model/x3d+binary":["*x3db","x3dbz"],"model/x3d+fastinfoset":["x3db"],"model/x3d+vrml":["*x3dv","x3dvz"],"model/x3d+xml":["x3d","x3dz"],"model/x3d-vrml":["x3dv"],"text/cache-manifest":["appcache","manifest"],"text/calendar":["ics","ifb"],"text/coffeescript":["coffee","litcoffee"],"text/css":["css"],"text/csv":["csv"],"text/html":["html","htm","shtml"],"text/jade":["jade"],"text/jsx":["jsx"],"text/less":["less"],"text/markdown":["markdown","md"],"text/mathml":["mml"],"text/mdx":["mdx"],"text/n3":["n3"],"text/plain":["txt","text","conf","def","list","log","in","ini"],"text/richtext":["rtx"],"text/rtf":["*rtf"],"text/sgml":["sgml","sgm"],"text/shex":["shex"],"text/slim":["slim","slm"],"text/stylus":["stylus","styl"],"text/tab-separated-values":["tsv"],"text/troff":["t","tr","roff","man","me","ms"],"text/turtle":["ttl"],"text/uri-list":["uri","uris","urls"],"text/vcard":["vcard"],"text/vtt":["vtt"],"text/xml":["*xml"],"text/yaml":["yaml","yml"],"video/3gpp":["3gp","3gpp"],"video/3gpp2":["3g2"],"video/h261":["h261"],"video/h263":["h263"],"video/h264":["h264"],"video/jpeg":["jpgv"],"video/jpm":["*jpm","jpgm"],"video/mj2":["mj2","mjp2"],"video/mp2t":["ts"],"video/mp4":["mp4","mp4v","mpg4"],"video/mpeg":["mpeg","mpg","mpe","m1v","m2v"],"video/ogg":["ogv"],"video/quicktime":["qt","mov"],"video/webm":["webm"]};

var other = {"application/prs.cww":["cww"],"application/vnd.3gpp.pic-bw-large":["plb"],"application/vnd.3gpp.pic-bw-small":["psb"],"application/vnd.3gpp.pic-bw-var":["pvb"],"application/vnd.3gpp2.tcap":["tcap"],"application/vnd.3m.post-it-notes":["pwn"],"application/vnd.accpac.simply.aso":["aso"],"application/vnd.accpac.simply.imp":["imp"],"application/vnd.acucobol":["acu"],"application/vnd.acucorp":["atc","acutc"],"application/vnd.adobe.air-application-installer-package+zip":["air"],"application/vnd.adobe.formscentral.fcdt":["fcdt"],"application/vnd.adobe.fxp":["fxp","fxpl"],"application/vnd.adobe.xdp+xml":["xdp"],"application/vnd.adobe.xfdf":["xfdf"],"application/vnd.ahead.space":["ahead"],"application/vnd.airzip.filesecure.azf":["azf"],"application/vnd.airzip.filesecure.azs":["azs"],"application/vnd.amazon.ebook":["azw"],"application/vnd.americandynamics.acc":["acc"],"application/vnd.amiga.ami":["ami"],"application/vnd.android.package-archive":["apk"],"application/vnd.anser-web-certificate-issue-initiation":["cii"],"application/vnd.anser-web-funds-transfer-initiation":["fti"],"application/vnd.antix.game-component":["atx"],"application/vnd.apple.installer+xml":["mpkg"],"application/vnd.apple.keynote":["keynote"],"application/vnd.apple.mpegurl":["m3u8"],"application/vnd.apple.numbers":["numbers"],"application/vnd.apple.pages":["pages"],"application/vnd.apple.pkpass":["pkpass"],"application/vnd.aristanetworks.swi":["swi"],"application/vnd.astraea-software.iota":["iota"],"application/vnd.audiograph":["aep"],"application/vnd.blueice.multipass":["mpm"],"application/vnd.bmi":["bmi"],"application/vnd.businessobjects":["rep"],"application/vnd.chemdraw+xml":["cdxml"],"application/vnd.chipnuts.karaoke-mmd":["mmd"],"application/vnd.cinderella":["cdy"],"application/vnd.citationstyles.style+xml":["csl"],"application/vnd.claymore":["cla"],"application/vnd.cloanto.rp9":["rp9"],"application/vnd.clonk.c4group":["c4g","c4d","c4f","c4p","c4u"],"application/vnd.cluetrust.cartomobile-config":["c11amc"],"application/vnd.cluetrust.cartomobile-config-pkg":["c11amz"],"application/vnd.commonspace":["csp"],"application/vnd.contact.cmsg":["cdbcmsg"],"application/vnd.cosmocaller":["cmc"],"application/vnd.crick.clicker":["clkx"],"application/vnd.crick.clicker.keyboard":["clkk"],"application/vnd.crick.clicker.palette":["clkp"],"application/vnd.crick.clicker.template":["clkt"],"application/vnd.crick.clicker.wordbank":["clkw"],"application/vnd.criticaltools.wbs+xml":["wbs"],"application/vnd.ctc-posml":["pml"],"application/vnd.cups-ppd":["ppd"],"application/vnd.curl.car":["car"],"application/vnd.curl.pcurl":["pcurl"],"application/vnd.dart":["dart"],"application/vnd.data-vision.rdz":["rdz"],"application/vnd.dece.data":["uvf","uvvf","uvd","uvvd"],"application/vnd.dece.ttml+xml":["uvt","uvvt"],"application/vnd.dece.unspecified":["uvx","uvvx"],"application/vnd.dece.zip":["uvz","uvvz"],"application/vnd.denovo.fcselayout-link":["fe_launch"],"application/vnd.dna":["dna"],"application/vnd.dolby.mlp":["mlp"],"application/vnd.dpgraph":["dpg"],"application/vnd.dreamfactory":["dfac"],"application/vnd.ds-keypoint":["kpxx"],"application/vnd.dvb.ait":["ait"],"application/vnd.dvb.service":["svc"],"application/vnd.dynageo":["geo"],"application/vnd.ecowin.chart":["mag"],"application/vnd.enliven":["nml"],"application/vnd.epson.esf":["esf"],"application/vnd.epson.msf":["msf"],"application/vnd.epson.quickanime":["qam"],"application/vnd.epson.salt":["slt"],"application/vnd.epson.ssf":["ssf"],"application/vnd.eszigno3+xml":["es3","et3"],"application/vnd.ezpix-album":["ez2"],"application/vnd.ezpix-package":["ez3"],"application/vnd.fdf":["fdf"],"application/vnd.fdsn.mseed":["mseed"],"application/vnd.fdsn.seed":["seed","dataless"],"application/vnd.flographit":["gph"],"application/vnd.fluxtime.clip":["ftc"],"application/vnd.framemaker":["fm","frame","maker","book"],"application/vnd.frogans.fnc":["fnc"],"application/vnd.frogans.ltf":["ltf"],"application/vnd.fsc.weblaunch":["fsc"],"application/vnd.fujitsu.oasys":["oas"],"application/vnd.fujitsu.oasys2":["oa2"],"application/vnd.fujitsu.oasys3":["oa3"],"application/vnd.fujitsu.oasysgp":["fg5"],"application/vnd.fujitsu.oasysprs":["bh2"],"application/vnd.fujixerox.ddd":["ddd"],"application/vnd.fujixerox.docuworks":["xdw"],"application/vnd.fujixerox.docuworks.binder":["xbd"],"application/vnd.fuzzysheet":["fzs"],"application/vnd.genomatix.tuxedo":["txd"],"application/vnd.geogebra.file":["ggb"],"application/vnd.geogebra.tool":["ggt"],"application/vnd.geometry-explorer":["gex","gre"],"application/vnd.geonext":["gxt"],"application/vnd.geoplan":["g2w"],"application/vnd.geospace":["g3w"],"application/vnd.gmx":["gmx"],"application/vnd.google-apps.document":["gdoc"],"application/vnd.google-apps.presentation":["gslides"],"application/vnd.google-apps.spreadsheet":["gsheet"],"application/vnd.google-earth.kml+xml":["kml"],"application/vnd.google-earth.kmz":["kmz"],"application/vnd.grafeq":["gqf","gqs"],"application/vnd.groove-account":["gac"],"application/vnd.groove-help":["ghf"],"application/vnd.groove-identity-message":["gim"],"application/vnd.groove-injector":["grv"],"application/vnd.groove-tool-message":["gtm"],"application/vnd.groove-tool-template":["tpl"],"application/vnd.groove-vcard":["vcg"],"application/vnd.hal+xml":["hal"],"application/vnd.handheld-entertainment+xml":["zmm"],"application/vnd.hbci":["hbci"],"application/vnd.hhe.lesson-player":["les"],"application/vnd.hp-hpgl":["hpgl"],"application/vnd.hp-hpid":["hpid"],"application/vnd.hp-hps":["hps"],"application/vnd.hp-jlyt":["jlt"],"application/vnd.hp-pcl":["pcl"],"application/vnd.hp-pclxl":["pclxl"],"application/vnd.hydrostatix.sof-data":["sfd-hdstx"],"application/vnd.ibm.minipay":["mpy"],"application/vnd.ibm.modcap":["afp","listafp","list3820"],"application/vnd.ibm.rights-management":["irm"],"application/vnd.ibm.secure-container":["sc"],"application/vnd.iccprofile":["icc","icm"],"application/vnd.igloader":["igl"],"application/vnd.immervision-ivp":["ivp"],"application/vnd.immervision-ivu":["ivu"],"application/vnd.insors.igm":["igm"],"application/vnd.intercon.formnet":["xpw","xpx"],"application/vnd.intergeo":["i2g"],"application/vnd.intu.qbo":["qbo"],"application/vnd.intu.qfx":["qfx"],"application/vnd.ipunplugged.rcprofile":["rcprofile"],"application/vnd.irepository.package+xml":["irp"],"application/vnd.is-xpr":["xpr"],"application/vnd.isac.fcs":["fcs"],"application/vnd.jam":["jam"],"application/vnd.jcp.javame.midlet-rms":["rms"],"application/vnd.jisp":["jisp"],"application/vnd.joost.joda-archive":["joda"],"application/vnd.kahootz":["ktz","ktr"],"application/vnd.kde.karbon":["karbon"],"application/vnd.kde.kchart":["chrt"],"application/vnd.kde.kformula":["kfo"],"application/vnd.kde.kivio":["flw"],"application/vnd.kde.kontour":["kon"],"application/vnd.kde.kpresenter":["kpr","kpt"],"application/vnd.kde.kspread":["ksp"],"application/vnd.kde.kword":["kwd","kwt"],"application/vnd.kenameaapp":["htke"],"application/vnd.kidspiration":["kia"],"application/vnd.kinar":["kne","knp"],"application/vnd.koan":["skp","skd","skt","skm"],"application/vnd.kodak-descriptor":["sse"],"application/vnd.las.las+xml":["lasxml"],"application/vnd.llamagraphics.life-balance.desktop":["lbd"],"application/vnd.llamagraphics.life-balance.exchange+xml":["lbe"],"application/vnd.lotus-1-2-3":["123"],"application/vnd.lotus-approach":["apr"],"application/vnd.lotus-freelance":["pre"],"application/vnd.lotus-notes":["nsf"],"application/vnd.lotus-organizer":["org"],"application/vnd.lotus-screencam":["scm"],"application/vnd.lotus-wordpro":["lwp"],"application/vnd.macports.portpkg":["portpkg"],"application/vnd.mcd":["mcd"],"application/vnd.medcalcdata":["mc1"],"application/vnd.mediastation.cdkey":["cdkey"],"application/vnd.mfer":["mwf"],"application/vnd.mfmp":["mfm"],"application/vnd.micrografx.flo":["flo"],"application/vnd.micrografx.igx":["igx"],"application/vnd.mif":["mif"],"application/vnd.mobius.daf":["daf"],"application/vnd.mobius.dis":["dis"],"application/vnd.mobius.mbk":["mbk"],"application/vnd.mobius.mqy":["mqy"],"application/vnd.mobius.msl":["msl"],"application/vnd.mobius.plc":["plc"],"application/vnd.mobius.txf":["txf"],"application/vnd.mophun.application":["mpn"],"application/vnd.mophun.certificate":["mpc"],"application/vnd.mozilla.xul+xml":["xul"],"application/vnd.ms-artgalry":["cil"],"application/vnd.ms-cab-compressed":["cab"],"application/vnd.ms-excel":["xls","xlm","xla","xlc","xlt","xlw"],"application/vnd.ms-excel.addin.macroenabled.12":["xlam"],"application/vnd.ms-excel.sheet.binary.macroenabled.12":["xlsb"],"application/vnd.ms-excel.sheet.macroenabled.12":["xlsm"],"application/vnd.ms-excel.template.macroenabled.12":["xltm"],"application/vnd.ms-fontobject":["eot"],"application/vnd.ms-htmlhelp":["chm"],"application/vnd.ms-ims":["ims"],"application/vnd.ms-lrm":["lrm"],"application/vnd.ms-officetheme":["thmx"],"application/vnd.ms-outlook":["msg"],"application/vnd.ms-pki.seccat":["cat"],"application/vnd.ms-pki.stl":["*stl"],"application/vnd.ms-powerpoint":["ppt","pps","pot"],"application/vnd.ms-powerpoint.addin.macroenabled.12":["ppam"],"application/vnd.ms-powerpoint.presentation.macroenabled.12":["pptm"],"application/vnd.ms-powerpoint.slide.macroenabled.12":["sldm"],"application/vnd.ms-powerpoint.slideshow.macroenabled.12":["ppsm"],"application/vnd.ms-powerpoint.template.macroenabled.12":["potm"],"application/vnd.ms-project":["mpp","mpt"],"application/vnd.ms-word.document.macroenabled.12":["docm"],"application/vnd.ms-word.template.macroenabled.12":["dotm"],"application/vnd.ms-works":["wps","wks","wcm","wdb"],"application/vnd.ms-wpl":["wpl"],"application/vnd.ms-xpsdocument":["xps"],"application/vnd.mseq":["mseq"],"application/vnd.musician":["mus"],"application/vnd.muvee.style":["msty"],"application/vnd.mynfc":["taglet"],"application/vnd.neurolanguage.nlu":["nlu"],"application/vnd.nitf":["ntf","nitf"],"application/vnd.noblenet-directory":["nnd"],"application/vnd.noblenet-sealer":["nns"],"application/vnd.noblenet-web":["nnw"],"application/vnd.nokia.n-gage.data":["ngdat"],"application/vnd.nokia.n-gage.symbian.install":["n-gage"],"application/vnd.nokia.radio-preset":["rpst"],"application/vnd.nokia.radio-presets":["rpss"],"application/vnd.novadigm.edm":["edm"],"application/vnd.novadigm.edx":["edx"],"application/vnd.novadigm.ext":["ext"],"application/vnd.oasis.opendocument.chart":["odc"],"application/vnd.oasis.opendocument.chart-template":["otc"],"application/vnd.oasis.opendocument.database":["odb"],"application/vnd.oasis.opendocument.formula":["odf"],"application/vnd.oasis.opendocument.formula-template":["odft"],"application/vnd.oasis.opendocument.graphics":["odg"],"application/vnd.oasis.opendocument.graphics-template":["otg"],"application/vnd.oasis.opendocument.image":["odi"],"application/vnd.oasis.opendocument.image-template":["oti"],"application/vnd.oasis.opendocument.presentation":["odp"],"application/vnd.oasis.opendocument.presentation-template":["otp"],"application/vnd.oasis.opendocument.spreadsheet":["ods"],"application/vnd.oasis.opendocument.spreadsheet-template":["ots"],"application/vnd.oasis.opendocument.text":["odt"],"application/vnd.oasis.opendocument.text-master":["odm"],"application/vnd.oasis.opendocument.text-template":["ott"],"application/vnd.oasis.opendocument.text-web":["oth"],"application/vnd.olpc-sugar":["xo"],"application/vnd.oma.dd2+xml":["dd2"],"application/vnd.openofficeorg.extension":["oxt"],"application/vnd.openxmlformats-officedocument.presentationml.presentation":["pptx"],"application/vnd.openxmlformats-officedocument.presentationml.slide":["sldx"],"application/vnd.openxmlformats-officedocument.presentationml.slideshow":["ppsx"],"application/vnd.openxmlformats-officedocument.presentationml.template":["potx"],"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":["xlsx"],"application/vnd.openxmlformats-officedocument.spreadsheetml.template":["xltx"],"application/vnd.openxmlformats-officedocument.wordprocessingml.document":["docx"],"application/vnd.openxmlformats-officedocument.wordprocessingml.template":["dotx"],"application/vnd.osgeo.mapguide.package":["mgp"],"application/vnd.osgi.dp":["dp"],"application/vnd.osgi.subsystem":["esa"],"application/vnd.palm":["pdb","pqa","oprc"],"application/vnd.pawaafile":["paw"],"application/vnd.pg.format":["str"],"application/vnd.pg.osasli":["ei6"],"application/vnd.picsel":["efif"],"application/vnd.pmi.widget":["wg"],"application/vnd.pocketlearn":["plf"],"application/vnd.powerbuilder6":["pbd"],"application/vnd.previewsystems.box":["box"],"application/vnd.proteus.magazine":["mgz"],"application/vnd.publishare-delta-tree":["qps"],"application/vnd.pvi.ptid1":["ptid"],"application/vnd.quark.quarkxpress":["qxd","qxt","qwd","qwt","qxl","qxb"],"application/vnd.realvnc.bed":["bed"],"application/vnd.recordare.musicxml":["mxl"],"application/vnd.recordare.musicxml+xml":["musicxml"],"application/vnd.rig.cryptonote":["cryptonote"],"application/vnd.rim.cod":["cod"],"application/vnd.rn-realmedia":["rm"],"application/vnd.rn-realmedia-vbr":["rmvb"],"application/vnd.route66.link66+xml":["link66"],"application/vnd.sailingtracker.track":["st"],"application/vnd.seemail":["see"],"application/vnd.sema":["sema"],"application/vnd.semd":["semd"],"application/vnd.semf":["semf"],"application/vnd.shana.informed.formdata":["ifm"],"application/vnd.shana.informed.formtemplate":["itp"],"application/vnd.shana.informed.interchange":["iif"],"application/vnd.shana.informed.package":["ipk"],"application/vnd.simtech-mindmapper":["twd","twds"],"application/vnd.smaf":["mmf"],"application/vnd.smart.teacher":["teacher"],"application/vnd.solent.sdkm+xml":["sdkm","sdkd"],"application/vnd.spotfire.dxp":["dxp"],"application/vnd.spotfire.sfs":["sfs"],"application/vnd.stardivision.calc":["sdc"],"application/vnd.stardivision.draw":["sda"],"application/vnd.stardivision.impress":["sdd"],"application/vnd.stardivision.math":["smf"],"application/vnd.stardivision.writer":["sdw","vor"],"application/vnd.stardivision.writer-global":["sgl"],"application/vnd.stepmania.package":["smzip"],"application/vnd.stepmania.stepchart":["sm"],"application/vnd.sun.wadl+xml":["wadl"],"application/vnd.sun.xml.calc":["sxc"],"application/vnd.sun.xml.calc.template":["stc"],"application/vnd.sun.xml.draw":["sxd"],"application/vnd.sun.xml.draw.template":["std"],"application/vnd.sun.xml.impress":["sxi"],"application/vnd.sun.xml.impress.template":["sti"],"application/vnd.sun.xml.math":["sxm"],"application/vnd.sun.xml.writer":["sxw"],"application/vnd.sun.xml.writer.global":["sxg"],"application/vnd.sun.xml.writer.template":["stw"],"application/vnd.sus-calendar":["sus","susp"],"application/vnd.svd":["svd"],"application/vnd.symbian.install":["sis","sisx"],"application/vnd.syncml+xml":["xsm"],"application/vnd.syncml.dm+wbxml":["bdm"],"application/vnd.syncml.dm+xml":["xdm"],"application/vnd.tao.intent-module-archive":["tao"],"application/vnd.tcpdump.pcap":["pcap","cap","dmp"],"application/vnd.tmobile-livetv":["tmo"],"application/vnd.trid.tpt":["tpt"],"application/vnd.triscape.mxs":["mxs"],"application/vnd.trueapp":["tra"],"application/vnd.ufdl":["ufd","ufdl"],"application/vnd.uiq.theme":["utz"],"application/vnd.umajin":["umj"],"application/vnd.unity":["unityweb"],"application/vnd.uoml+xml":["uoml"],"application/vnd.vcx":["vcx"],"application/vnd.visio":["vsd","vst","vss","vsw"],"application/vnd.visionary":["vis"],"application/vnd.vsf":["vsf"],"application/vnd.wap.wbxml":["wbxml"],"application/vnd.wap.wmlc":["wmlc"],"application/vnd.wap.wmlscriptc":["wmlsc"],"application/vnd.webturbo":["wtb"],"application/vnd.wolfram.player":["nbp"],"application/vnd.wordperfect":["wpd"],"application/vnd.wqd":["wqd"],"application/vnd.wt.stf":["stf"],"application/vnd.xara":["xar"],"application/vnd.xfdl":["xfdl"],"application/vnd.yamaha.hv-dic":["hvd"],"application/vnd.yamaha.hv-script":["hvs"],"application/vnd.yamaha.hv-voice":["hvp"],"application/vnd.yamaha.openscoreformat":["osf"],"application/vnd.yamaha.openscoreformat.osfpvg+xml":["osfpvg"],"application/vnd.yamaha.smaf-audio":["saf"],"application/vnd.yamaha.smaf-phrase":["spf"],"application/vnd.yellowriver-custom-menu":["cmp"],"application/vnd.zul":["zir","zirz"],"application/vnd.zzazz.deck+xml":["zaz"],"application/x-7z-compressed":["7z"],"application/x-abiword":["abw"],"application/x-ace-compressed":["ace"],"application/x-apple-diskimage":["*dmg"],"application/x-arj":["arj"],"application/x-authorware-bin":["aab","x32","u32","vox"],"application/x-authorware-map":["aam"],"application/x-authorware-seg":["aas"],"application/x-bcpio":["bcpio"],"application/x-bdoc":["*bdoc"],"application/x-bittorrent":["torrent"],"application/x-blorb":["blb","blorb"],"application/x-bzip":["bz"],"application/x-bzip2":["bz2","boz"],"application/x-cbr":["cbr","cba","cbt","cbz","cb7"],"application/x-cdlink":["vcd"],"application/x-cfs-compressed":["cfs"],"application/x-chat":["chat"],"application/x-chess-pgn":["pgn"],"application/x-chrome-extension":["crx"],"application/x-cocoa":["cco"],"application/x-conference":["nsc"],"application/x-cpio":["cpio"],"application/x-csh":["csh"],"application/x-debian-package":["*deb","udeb"],"application/x-dgc-compressed":["dgc"],"application/x-director":["dir","dcr","dxr","cst","cct","cxt","w3d","fgd","swa"],"application/x-doom":["wad"],"application/x-dtbncx+xml":["ncx"],"application/x-dtbook+xml":["dtb"],"application/x-dtbresource+xml":["res"],"application/x-dvi":["dvi"],"application/x-envoy":["evy"],"application/x-eva":["eva"],"application/x-font-bdf":["bdf"],"application/x-font-ghostscript":["gsf"],"application/x-font-linux-psf":["psf"],"application/x-font-pcf":["pcf"],"application/x-font-snf":["snf"],"application/x-font-type1":["pfa","pfb","pfm","afm"],"application/x-freearc":["arc"],"application/x-futuresplash":["spl"],"application/x-gca-compressed":["gca"],"application/x-glulx":["ulx"],"application/x-gnumeric":["gnumeric"],"application/x-gramps-xml":["gramps"],"application/x-gtar":["gtar"],"application/x-hdf":["hdf"],"application/x-httpd-php":["php"],"application/x-install-instructions":["install"],"application/x-iso9660-image":["*iso"],"application/x-java-archive-diff":["jardiff"],"application/x-java-jnlp-file":["jnlp"],"application/x-latex":["latex"],"application/x-lua-bytecode":["luac"],"application/x-lzh-compressed":["lzh","lha"],"application/x-makeself":["run"],"application/x-mie":["mie"],"application/x-mobipocket-ebook":["prc","mobi"],"application/x-ms-application":["application"],"application/x-ms-shortcut":["lnk"],"application/x-ms-wmd":["wmd"],"application/x-ms-wmz":["wmz"],"application/x-ms-xbap":["xbap"],"application/x-msaccess":["mdb"],"application/x-msbinder":["obd"],"application/x-mscardfile":["crd"],"application/x-msclip":["clp"],"application/x-msdos-program":["*exe"],"application/x-msdownload":["*exe","*dll","com","bat","*msi"],"application/x-msmediaview":["mvb","m13","m14"],"application/x-msmetafile":["*wmf","*wmz","*emf","emz"],"application/x-msmoney":["mny"],"application/x-mspublisher":["pub"],"application/x-msschedule":["scd"],"application/x-msterminal":["trm"],"application/x-mswrite":["wri"],"application/x-netcdf":["nc","cdf"],"application/x-ns-proxy-autoconfig":["pac"],"application/x-nzb":["nzb"],"application/x-perl":["pl","pm"],"application/x-pilot":["*prc","*pdb"],"application/x-pkcs12":["p12","pfx"],"application/x-pkcs7-certificates":["p7b","spc"],"application/x-pkcs7-certreqresp":["p7r"],"application/x-rar-compressed":["rar"],"application/x-redhat-package-manager":["rpm"],"application/x-research-info-systems":["ris"],"application/x-sea":["sea"],"application/x-sh":["sh"],"application/x-shar":["shar"],"application/x-shockwave-flash":["swf"],"application/x-silverlight-app":["xap"],"application/x-sql":["sql"],"application/x-stuffit":["sit"],"application/x-stuffitx":["sitx"],"application/x-subrip":["srt"],"application/x-sv4cpio":["sv4cpio"],"application/x-sv4crc":["sv4crc"],"application/x-t3vm-image":["t3"],"application/x-tads":["gam"],"application/x-tar":["tar"],"application/x-tcl":["tcl","tk"],"application/x-tex":["tex"],"application/x-tex-tfm":["tfm"],"application/x-texinfo":["texinfo","texi"],"application/x-tgif":["obj"],"application/x-ustar":["ustar"],"application/x-virtualbox-hdd":["hdd"],"application/x-virtualbox-ova":["ova"],"application/x-virtualbox-ovf":["ovf"],"application/x-virtualbox-vbox":["vbox"],"application/x-virtualbox-vbox-extpack":["vbox-extpack"],"application/x-virtualbox-vdi":["vdi"],"application/x-virtualbox-vhd":["vhd"],"application/x-virtualbox-vmdk":["vmdk"],"application/x-wais-source":["src"],"application/x-web-app-manifest+json":["webapp"],"application/x-x509-ca-cert":["der","crt","pem"],"application/x-xfig":["fig"],"application/x-xliff+xml":["xlf"],"application/x-xpinstall":["xpi"],"application/x-xz":["xz"],"application/x-zmachine":["z1","z2","z3","z4","z5","z6","z7","z8"],"audio/vnd.dece.audio":["uva","uvva"],"audio/vnd.digital-winds":["eol"],"audio/vnd.dra":["dra"],"audio/vnd.dts":["dts"],"audio/vnd.dts.hd":["dtshd"],"audio/vnd.lucent.voice":["lvp"],"audio/vnd.ms-playready.media.pya":["pya"],"audio/vnd.nuera.ecelp4800":["ecelp4800"],"audio/vnd.nuera.ecelp7470":["ecelp7470"],"audio/vnd.nuera.ecelp9600":["ecelp9600"],"audio/vnd.rip":["rip"],"audio/x-aac":["aac"],"audio/x-aiff":["aif","aiff","aifc"],"audio/x-caf":["caf"],"audio/x-flac":["flac"],"audio/x-m4a":["*m4a"],"audio/x-matroska":["mka"],"audio/x-mpegurl":["m3u"],"audio/x-ms-wax":["wax"],"audio/x-ms-wma":["wma"],"audio/x-pn-realaudio":["ram","ra"],"audio/x-pn-realaudio-plugin":["rmp"],"audio/x-realaudio":["*ra"],"audio/x-wav":["*wav"],"chemical/x-cdx":["cdx"],"chemical/x-cif":["cif"],"chemical/x-cmdf":["cmdf"],"chemical/x-cml":["cml"],"chemical/x-csml":["csml"],"chemical/x-xyz":["xyz"],"image/prs.btif":["btif"],"image/prs.pti":["pti"],"image/vnd.adobe.photoshop":["psd"],"image/vnd.airzip.accelerator.azv":["azv"],"image/vnd.dece.graphic":["uvi","uvvi","uvg","uvvg"],"image/vnd.djvu":["djvu","djv"],"image/vnd.dvb.subtitle":["*sub"],"image/vnd.dwg":["dwg"],"image/vnd.dxf":["dxf"],"image/vnd.fastbidsheet":["fbs"],"image/vnd.fpx":["fpx"],"image/vnd.fst":["fst"],"image/vnd.fujixerox.edmics-mmr":["mmr"],"image/vnd.fujixerox.edmics-rlc":["rlc"],"image/vnd.microsoft.icon":["ico"],"image/vnd.ms-modi":["mdi"],"image/vnd.ms-photo":["wdp"],"image/vnd.net-fpx":["npx"],"image/vnd.tencent.tap":["tap"],"image/vnd.valve.source.texture":["vtf"],"image/vnd.wap.wbmp":["wbmp"],"image/vnd.xiff":["xif"],"image/vnd.zbrush.pcx":["pcx"],"image/x-3ds":["3ds"],"image/x-cmu-raster":["ras"],"image/x-cmx":["cmx"],"image/x-freehand":["fh","fhc","fh4","fh5","fh7"],"image/x-icon":["*ico"],"image/x-jng":["jng"],"image/x-mrsid-image":["sid"],"image/x-ms-bmp":["*bmp"],"image/x-pcx":["*pcx"],"image/x-pict":["pic","pct"],"image/x-portable-anymap":["pnm"],"image/x-portable-bitmap":["pbm"],"image/x-portable-graymap":["pgm"],"image/x-portable-pixmap":["ppm"],"image/x-rgb":["rgb"],"image/x-tga":["tga"],"image/x-xbitmap":["xbm"],"image/x-xpixmap":["xpm"],"image/x-xwindowdump":["xwd"],"message/vnd.wfa.wsc":["wsc"],"model/vnd.collada+xml":["dae"],"model/vnd.dwf":["dwf"],"model/vnd.gdl":["gdl"],"model/vnd.gtw":["gtw"],"model/vnd.mts":["mts"],"model/vnd.opengex":["ogex"],"model/vnd.parasolid.transmit.binary":["x_b"],"model/vnd.parasolid.transmit.text":["x_t"],"model/vnd.usdz+zip":["usdz"],"model/vnd.valve.source.compiled-map":["bsp"],"model/vnd.vtu":["vtu"],"text/prs.lines.tag":["dsc"],"text/vnd.curl":["curl"],"text/vnd.curl.dcurl":["dcurl"],"text/vnd.curl.mcurl":["mcurl"],"text/vnd.curl.scurl":["scurl"],"text/vnd.dvb.subtitle":["sub"],"text/vnd.fly":["fly"],"text/vnd.fmi.flexstor":["flx"],"text/vnd.graphviz":["gv"],"text/vnd.in3d.3dml":["3dml"],"text/vnd.in3d.spot":["spot"],"text/vnd.sun.j2me.app-descriptor":["jad"],"text/vnd.wap.wml":["wml"],"text/vnd.wap.wmlscript":["wmls"],"text/x-asm":["s","asm"],"text/x-c":["c","cc","cxx","cpp","h","hh","dic"],"text/x-component":["htc"],"text/x-fortran":["f","for","f77","f90"],"text/x-handlebars-template":["hbs"],"text/x-java-source":["java"],"text/x-lua":["lua"],"text/x-markdown":["mkd"],"text/x-nfo":["nfo"],"text/x-opml":["opml"],"text/x-org":["*org"],"text/x-pascal":["p","pas"],"text/x-processing":["pde"],"text/x-sass":["sass"],"text/x-scss":["scss"],"text/x-setext":["etx"],"text/x-sfv":["sfv"],"text/x-suse-ymp":["ymp"],"text/x-uuencode":["uu"],"text/x-vcalendar":["vcs"],"text/x-vcard":["vcf"],"video/vnd.dece.hd":["uvh","uvvh"],"video/vnd.dece.mobile":["uvm","uvvm"],"video/vnd.dece.pd":["uvp","uvvp"],"video/vnd.dece.sd":["uvs","uvvs"],"video/vnd.dece.video":["uvv","uvvv"],"video/vnd.dvb.file":["dvb"],"video/vnd.fvt":["fvt"],"video/vnd.mpegurl":["mxu","m4u"],"video/vnd.ms-playready.media.pyv":["pyv"],"video/vnd.uvvu.mp4":["uvu","uvvu"],"video/vnd.vivo":["viv"],"video/x-f4v":["f4v"],"video/x-fli":["fli"],"video/x-flv":["flv"],"video/x-m4v":["m4v"],"video/x-matroska":["mkv","mk3d","mks"],"video/x-mng":["mng"],"video/x-ms-asf":["asf","asx"],"video/x-ms-vob":["vob"],"video/x-ms-wm":["wm"],"video/x-ms-wmv":["wmv"],"video/x-ms-wmx":["wmx"],"video/x-ms-wvx":["wvx"],"video/x-msvideo":["avi"],"video/x-sgi-movie":["movie"],"video/x-smv":["smv"],"x-conference/x-cooltalk":["ice"]};

var mime = new Mime_1(standard, other);

const CHARTSET_RE = /(?:charset|encoding)\s{0,10}=\s{0,10}['"]? {0,10}([\w\-]{1,100})/i;

var charset_1 = charset;

/**
 * guest data charset from req.headers, xml, html content-type meta tag
 * headers:
 *  'content-type': 'text/html;charset=gbk'
 * meta tag:
 *  <meta http-equiv="Content-Type" content="text/html; charset=xxxx"/>
 * xml file:
 *  <?xml version="1.0" encoding="UTF-8"?>
 *
 * @param {Object} obj `Content-Type` String, or `res.headers`, or `res` Object
 * @param {Buffer} [data] content buffer
 * @param {Number} [peekSize] max content peek size, default is 512
 * @return {String} charset, lower case, e.g.: utf8, gbk, gb2312, ....
 *  If can\'t guest, return null
 * @api public
 */
function charset(obj, data, peekSize) {
  let matchs = null;
  let end = 0;
  if (data) {
    peekSize = peekSize || 512;
    // https://github.com/node-modules/charset/issues/4
    end = data.length > peekSize ? peekSize : data.length;
  }
  // charset('text/html;charset=gbk')
  let contentType = obj;
  if (contentType && typeof contentType !== 'string') {
    // charset(res.headers)
    let headers = obj;
    if (obj.headers) {
      // charset(res)
      headers = obj.headers;
    }
    contentType = headers['content-type'] || headers['Content-Type'];
  }
  if (contentType) {
    // guest from obj first
    matchs = CHARTSET_RE.exec(contentType);
  }
  if (!matchs && end > 0) {
    // guest from content body (html/xml) header
    contentType = data.slice(0, end).toString();
    matchs = CHARTSET_RE.exec(contentType);
  }
  let cs = null;
  if (matchs) {
    cs = matchs[1].toLowerCase();
    if (cs === 'utf-8') {
      cs = 'utf8';
    }
  }
  return cs;
}

const define = mappings => mime.define(mappings, true);

let customGetType = (file, defaultValue) => null; // eslint-disable-line no-unused-vars

const setCustomGetType = (fn) => { customGetType = fn; };

const getType = (file, defaultValue) => (
  customGetType(file, defaultValue) ||
  mime.getType(file) ||
  defaultValue
);

let customLookupCharset = mimeType => null; // eslint-disable-line no-unused-vars

const setCustomLookupCharset = (fn) => { customLookupCharset = fn; };

const lookupCharset = mimeType => (
  customLookupCharset(mimeType) ||
  charset_1(mimeType)
);

var mime$1 = /*#__PURE__*/Object.freeze({
	define: define,
	setCustomGetType: setCustomGetType,
	getType: getType,
	setCustomLookupCharset: setCustomLookupCharset,
	lookupCharset: lookupCharset
});

var he = createCommonjsModule(function (module, exports) {
(function(root) {

	// Detect free variables `exports`.
	var freeExports =  exports;

	// Detect free variable `module`.
	var freeModule =  module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`.
	var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	// All astral symbols.
	var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
	// All ASCII symbols (not just printable ASCII) except those listed in the
	// first column of the overrides table.
	// https://html.spec.whatwg.org/multipage/syntax.html#table-charref-overrides
	var regexAsciiWhitelist = /[\x01-\x7F]/g;
	// All BMP symbols that are not ASCII newlines, printable ASCII symbols, or
	// code points listed in the first column of the overrides table on
	// https://html.spec.whatwg.org/multipage/syntax.html#table-charref-overrides.
	var regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;

	var regexEncodeNonAscii = /<\u20D2|=\u20E5|>\u20D2|\u205F\u200A|\u219D\u0338|\u2202\u0338|\u2220\u20D2|\u2229\uFE00|\u222A\uFE00|\u223C\u20D2|\u223D\u0331|\u223E\u0333|\u2242\u0338|\u224B\u0338|\u224D\u20D2|\u224E\u0338|\u224F\u0338|\u2250\u0338|\u2261\u20E5|\u2264\u20D2|\u2265\u20D2|\u2266\u0338|\u2267\u0338|\u2268\uFE00|\u2269\uFE00|\u226A\u0338|\u226A\u20D2|\u226B\u0338|\u226B\u20D2|\u227F\u0338|\u2282\u20D2|\u2283\u20D2|\u228A\uFE00|\u228B\uFE00|\u228F\u0338|\u2290\u0338|\u2293\uFE00|\u2294\uFE00|\u22B4\u20D2|\u22B5\u20D2|\u22D8\u0338|\u22D9\u0338|\u22DA\uFE00|\u22DB\uFE00|\u22F5\u0338|\u22F9\u0338|\u2933\u0338|\u29CF\u0338|\u29D0\u0338|\u2A6D\u0338|\u2A70\u0338|\u2A7D\u0338|\u2A7E\u0338|\u2AA1\u0338|\u2AA2\u0338|\u2AAC\uFE00|\u2AAD\uFE00|\u2AAF\u0338|\u2AB0\u0338|\u2AC5\u0338|\u2AC6\u0338|\u2ACB\uFE00|\u2ACC\uFE00|\u2AFD\u20E5|[\xA0-\u0113\u0116-\u0122\u0124-\u012B\u012E-\u014D\u0150-\u017E\u0192\u01B5\u01F5\u0237\u02C6\u02C7\u02D8-\u02DD\u0311\u0391-\u03A1\u03A3-\u03A9\u03B1-\u03C9\u03D1\u03D2\u03D5\u03D6\u03DC\u03DD\u03F0\u03F1\u03F5\u03F6\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E\u045F\u2002-\u2005\u2007-\u2010\u2013-\u2016\u2018-\u201A\u201C-\u201E\u2020-\u2022\u2025\u2026\u2030-\u2035\u2039\u203A\u203E\u2041\u2043\u2044\u204F\u2057\u205F-\u2063\u20AC\u20DB\u20DC\u2102\u2105\u210A-\u2113\u2115-\u211E\u2122\u2124\u2127-\u2129\u212C\u212D\u212F-\u2131\u2133-\u2138\u2145-\u2148\u2153-\u215E\u2190-\u219B\u219D-\u21A7\u21A9-\u21AE\u21B0-\u21B3\u21B5-\u21B7\u21BA-\u21DB\u21DD\u21E4\u21E5\u21F5\u21FD-\u2205\u2207-\u2209\u220B\u220C\u220F-\u2214\u2216-\u2218\u221A\u221D-\u2238\u223A-\u2257\u2259\u225A\u225C\u225F-\u2262\u2264-\u228B\u228D-\u229B\u229D-\u22A5\u22A7-\u22B0\u22B2-\u22BB\u22BD-\u22DB\u22DE-\u22E3\u22E6-\u22F7\u22F9-\u22FE\u2305\u2306\u2308-\u2310\u2312\u2313\u2315\u2316\u231C-\u231F\u2322\u2323\u232D\u232E\u2336\u233D\u233F\u237C\u23B0\u23B1\u23B4-\u23B6\u23DC-\u23DF\u23E2\u23E7\u2423\u24C8\u2500\u2502\u250C\u2510\u2514\u2518\u251C\u2524\u252C\u2534\u253C\u2550-\u256C\u2580\u2584\u2588\u2591-\u2593\u25A1\u25AA\u25AB\u25AD\u25AE\u25B1\u25B3-\u25B5\u25B8\u25B9\u25BD-\u25BF\u25C2\u25C3\u25CA\u25CB\u25EC\u25EF\u25F8-\u25FC\u2605\u2606\u260E\u2640\u2642\u2660\u2663\u2665\u2666\u266A\u266D-\u266F\u2713\u2717\u2720\u2736\u2758\u2772\u2773\u27C8\u27C9\u27E6-\u27ED\u27F5-\u27FA\u27FC\u27FF\u2902-\u2905\u290C-\u2913\u2916\u2919-\u2920\u2923-\u292A\u2933\u2935-\u2939\u293C\u293D\u2945\u2948-\u294B\u294E-\u2976\u2978\u2979\u297B-\u297F\u2985\u2986\u298B-\u2996\u299A\u299C\u299D\u29A4-\u29B7\u29B9\u29BB\u29BC\u29BE-\u29C5\u29C9\u29CD-\u29D0\u29DC-\u29DE\u29E3-\u29E5\u29EB\u29F4\u29F6\u2A00-\u2A02\u2A04\u2A06\u2A0C\u2A0D\u2A10-\u2A17\u2A22-\u2A27\u2A29\u2A2A\u2A2D-\u2A31\u2A33-\u2A3C\u2A3F\u2A40\u2A42-\u2A4D\u2A50\u2A53-\u2A58\u2A5A-\u2A5D\u2A5F\u2A66\u2A6A\u2A6D-\u2A75\u2A77-\u2A9A\u2A9D-\u2AA2\u2AA4-\u2AB0\u2AB3-\u2AC8\u2ACB\u2ACC\u2ACF-\u2ADB\u2AE4\u2AE6-\u2AE9\u2AEB-\u2AF3\u2AFD\uFB00-\uFB04]|\uD835[\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDD6B]/g;
	var encodeMap = {'\xAD':'shy','\u200C':'zwnj','\u200D':'zwj','\u200E':'lrm','\u2063':'ic','\u2062':'it','\u2061':'af','\u200F':'rlm','\u200B':'ZeroWidthSpace','\u2060':'NoBreak','\u0311':'DownBreve','\u20DB':'tdot','\u20DC':'DotDot','\t':'Tab','\n':'NewLine','\u2008':'puncsp','\u205F':'MediumSpace','\u2009':'thinsp','\u200A':'hairsp','\u2004':'emsp13','\u2002':'ensp','\u2005':'emsp14','\u2003':'emsp','\u2007':'numsp','\xA0':'nbsp','\u205F\u200A':'ThickSpace','\u203E':'oline','_':'lowbar','\u2010':'dash','\u2013':'ndash','\u2014':'mdash','\u2015':'horbar',',':'comma',';':'semi','\u204F':'bsemi',':':'colon','\u2A74':'Colone','!':'excl','\xA1':'iexcl','?':'quest','\xBF':'iquest','.':'period','\u2025':'nldr','\u2026':'mldr','\xB7':'middot','\'':'apos','\u2018':'lsquo','\u2019':'rsquo','\u201A':'sbquo','\u2039':'lsaquo','\u203A':'rsaquo','"':'quot','\u201C':'ldquo','\u201D':'rdquo','\u201E':'bdquo','\xAB':'laquo','\xBB':'raquo','(':'lpar',')':'rpar','[':'lsqb',']':'rsqb','{':'lcub','}':'rcub','\u2308':'lceil','\u2309':'rceil','\u230A':'lfloor','\u230B':'rfloor','\u2985':'lopar','\u2986':'ropar','\u298B':'lbrke','\u298C':'rbrke','\u298D':'lbrkslu','\u298E':'rbrksld','\u298F':'lbrksld','\u2990':'rbrkslu','\u2991':'langd','\u2992':'rangd','\u2993':'lparlt','\u2994':'rpargt','\u2995':'gtlPar','\u2996':'ltrPar','\u27E6':'lobrk','\u27E7':'robrk','\u27E8':'lang','\u27E9':'rang','\u27EA':'Lang','\u27EB':'Rang','\u27EC':'loang','\u27ED':'roang','\u2772':'lbbrk','\u2773':'rbbrk','\u2016':'Vert','\xA7':'sect','\xB6':'para','@':'commat','*':'ast','/':'sol','undefined':null,'&':'amp','#':'num','%':'percnt','\u2030':'permil','\u2031':'pertenk','\u2020':'dagger','\u2021':'Dagger','\u2022':'bull','\u2043':'hybull','\u2032':'prime','\u2033':'Prime','\u2034':'tprime','\u2057':'qprime','\u2035':'bprime','\u2041':'caret','`':'grave','\xB4':'acute','\u02DC':'tilde','^':'Hat','\xAF':'macr','\u02D8':'breve','\u02D9':'dot','\xA8':'die','\u02DA':'ring','\u02DD':'dblac','\xB8':'cedil','\u02DB':'ogon','\u02C6':'circ','\u02C7':'caron','\xB0':'deg','\xA9':'copy','\xAE':'reg','\u2117':'copysr','\u2118':'wp','\u211E':'rx','\u2127':'mho','\u2129':'iiota','\u2190':'larr','\u219A':'nlarr','\u2192':'rarr','\u219B':'nrarr','\u2191':'uarr','\u2193':'darr','\u2194':'harr','\u21AE':'nharr','\u2195':'varr','\u2196':'nwarr','\u2197':'nearr','\u2198':'searr','\u2199':'swarr','\u219D':'rarrw','\u219D\u0338':'nrarrw','\u219E':'Larr','\u219F':'Uarr','\u21A0':'Rarr','\u21A1':'Darr','\u21A2':'larrtl','\u21A3':'rarrtl','\u21A4':'mapstoleft','\u21A5':'mapstoup','\u21A6':'map','\u21A7':'mapstodown','\u21A9':'larrhk','\u21AA':'rarrhk','\u21AB':'larrlp','\u21AC':'rarrlp','\u21AD':'harrw','\u21B0':'lsh','\u21B1':'rsh','\u21B2':'ldsh','\u21B3':'rdsh','\u21B5':'crarr','\u21B6':'cularr','\u21B7':'curarr','\u21BA':'olarr','\u21BB':'orarr','\u21BC':'lharu','\u21BD':'lhard','\u21BE':'uharr','\u21BF':'uharl','\u21C0':'rharu','\u21C1':'rhard','\u21C2':'dharr','\u21C3':'dharl','\u21C4':'rlarr','\u21C5':'udarr','\u21C6':'lrarr','\u21C7':'llarr','\u21C8':'uuarr','\u21C9':'rrarr','\u21CA':'ddarr','\u21CB':'lrhar','\u21CC':'rlhar','\u21D0':'lArr','\u21CD':'nlArr','\u21D1':'uArr','\u21D2':'rArr','\u21CF':'nrArr','\u21D3':'dArr','\u21D4':'iff','\u21CE':'nhArr','\u21D5':'vArr','\u21D6':'nwArr','\u21D7':'neArr','\u21D8':'seArr','\u21D9':'swArr','\u21DA':'lAarr','\u21DB':'rAarr','\u21DD':'zigrarr','\u21E4':'larrb','\u21E5':'rarrb','\u21F5':'duarr','\u21FD':'loarr','\u21FE':'roarr','\u21FF':'hoarr','\u2200':'forall','\u2201':'comp','\u2202':'part','\u2202\u0338':'npart','\u2203':'exist','\u2204':'nexist','\u2205':'empty','\u2207':'Del','\u2208':'in','\u2209':'notin','\u220B':'ni','\u220C':'notni','\u03F6':'bepsi','\u220F':'prod','\u2210':'coprod','\u2211':'sum','+':'plus','\xB1':'pm','\xF7':'div','\xD7':'times','<':'lt','\u226E':'nlt','<\u20D2':'nvlt','=':'equals','\u2260':'ne','=\u20E5':'bne','\u2A75':'Equal','>':'gt','\u226F':'ngt','>\u20D2':'nvgt','\xAC':'not','|':'vert','\xA6':'brvbar','\u2212':'minus','\u2213':'mp','\u2214':'plusdo','\u2044':'frasl','\u2216':'setmn','\u2217':'lowast','\u2218':'compfn','\u221A':'Sqrt','\u221D':'prop','\u221E':'infin','\u221F':'angrt','\u2220':'ang','\u2220\u20D2':'nang','\u2221':'angmsd','\u2222':'angsph','\u2223':'mid','\u2224':'nmid','\u2225':'par','\u2226':'npar','\u2227':'and','\u2228':'or','\u2229':'cap','\u2229\uFE00':'caps','\u222A':'cup','\u222A\uFE00':'cups','\u222B':'int','\u222C':'Int','\u222D':'tint','\u2A0C':'qint','\u222E':'oint','\u222F':'Conint','\u2230':'Cconint','\u2231':'cwint','\u2232':'cwconint','\u2233':'awconint','\u2234':'there4','\u2235':'becaus','\u2236':'ratio','\u2237':'Colon','\u2238':'minusd','\u223A':'mDDot','\u223B':'homtht','\u223C':'sim','\u2241':'nsim','\u223C\u20D2':'nvsim','\u223D':'bsim','\u223D\u0331':'race','\u223E':'ac','\u223E\u0333':'acE','\u223F':'acd','\u2240':'wr','\u2242':'esim','\u2242\u0338':'nesim','\u2243':'sime','\u2244':'nsime','\u2245':'cong','\u2247':'ncong','\u2246':'simne','\u2248':'ap','\u2249':'nap','\u224A':'ape','\u224B':'apid','\u224B\u0338':'napid','\u224C':'bcong','\u224D':'CupCap','\u226D':'NotCupCap','\u224D\u20D2':'nvap','\u224E':'bump','\u224E\u0338':'nbump','\u224F':'bumpe','\u224F\u0338':'nbumpe','\u2250':'doteq','\u2250\u0338':'nedot','\u2251':'eDot','\u2252':'efDot','\u2253':'erDot','\u2254':'colone','\u2255':'ecolon','\u2256':'ecir','\u2257':'cire','\u2259':'wedgeq','\u225A':'veeeq','\u225C':'trie','\u225F':'equest','\u2261':'equiv','\u2262':'nequiv','\u2261\u20E5':'bnequiv','\u2264':'le','\u2270':'nle','\u2264\u20D2':'nvle','\u2265':'ge','\u2271':'nge','\u2265\u20D2':'nvge','\u2266':'lE','\u2266\u0338':'nlE','\u2267':'gE','\u2267\u0338':'ngE','\u2268\uFE00':'lvnE','\u2268':'lnE','\u2269':'gnE','\u2269\uFE00':'gvnE','\u226A':'ll','\u226A\u0338':'nLtv','\u226A\u20D2':'nLt','\u226B':'gg','\u226B\u0338':'nGtv','\u226B\u20D2':'nGt','\u226C':'twixt','\u2272':'lsim','\u2274':'nlsim','\u2273':'gsim','\u2275':'ngsim','\u2276':'lg','\u2278':'ntlg','\u2277':'gl','\u2279':'ntgl','\u227A':'pr','\u2280':'npr','\u227B':'sc','\u2281':'nsc','\u227C':'prcue','\u22E0':'nprcue','\u227D':'sccue','\u22E1':'nsccue','\u227E':'prsim','\u227F':'scsim','\u227F\u0338':'NotSucceedsTilde','\u2282':'sub','\u2284':'nsub','\u2282\u20D2':'vnsub','\u2283':'sup','\u2285':'nsup','\u2283\u20D2':'vnsup','\u2286':'sube','\u2288':'nsube','\u2287':'supe','\u2289':'nsupe','\u228A\uFE00':'vsubne','\u228A':'subne','\u228B\uFE00':'vsupne','\u228B':'supne','\u228D':'cupdot','\u228E':'uplus','\u228F':'sqsub','\u228F\u0338':'NotSquareSubset','\u2290':'sqsup','\u2290\u0338':'NotSquareSuperset','\u2291':'sqsube','\u22E2':'nsqsube','\u2292':'sqsupe','\u22E3':'nsqsupe','\u2293':'sqcap','\u2293\uFE00':'sqcaps','\u2294':'sqcup','\u2294\uFE00':'sqcups','\u2295':'oplus','\u2296':'ominus','\u2297':'otimes','\u2298':'osol','\u2299':'odot','\u229A':'ocir','\u229B':'oast','\u229D':'odash','\u229E':'plusb','\u229F':'minusb','\u22A0':'timesb','\u22A1':'sdotb','\u22A2':'vdash','\u22AC':'nvdash','\u22A3':'dashv','\u22A4':'top','\u22A5':'bot','\u22A7':'models','\u22A8':'vDash','\u22AD':'nvDash','\u22A9':'Vdash','\u22AE':'nVdash','\u22AA':'Vvdash','\u22AB':'VDash','\u22AF':'nVDash','\u22B0':'prurel','\u22B2':'vltri','\u22EA':'nltri','\u22B3':'vrtri','\u22EB':'nrtri','\u22B4':'ltrie','\u22EC':'nltrie','\u22B4\u20D2':'nvltrie','\u22B5':'rtrie','\u22ED':'nrtrie','\u22B5\u20D2':'nvrtrie','\u22B6':'origof','\u22B7':'imof','\u22B8':'mumap','\u22B9':'hercon','\u22BA':'intcal','\u22BB':'veebar','\u22BD':'barvee','\u22BE':'angrtvb','\u22BF':'lrtri','\u22C0':'Wedge','\u22C1':'Vee','\u22C2':'xcap','\u22C3':'xcup','\u22C4':'diam','\u22C5':'sdot','\u22C6':'Star','\u22C7':'divonx','\u22C8':'bowtie','\u22C9':'ltimes','\u22CA':'rtimes','\u22CB':'lthree','\u22CC':'rthree','\u22CD':'bsime','\u22CE':'cuvee','\u22CF':'cuwed','\u22D0':'Sub','\u22D1':'Sup','\u22D2':'Cap','\u22D3':'Cup','\u22D4':'fork','\u22D5':'epar','\u22D6':'ltdot','\u22D7':'gtdot','\u22D8':'Ll','\u22D8\u0338':'nLl','\u22D9':'Gg','\u22D9\u0338':'nGg','\u22DA\uFE00':'lesg','\u22DA':'leg','\u22DB':'gel','\u22DB\uFE00':'gesl','\u22DE':'cuepr','\u22DF':'cuesc','\u22E6':'lnsim','\u22E7':'gnsim','\u22E8':'prnsim','\u22E9':'scnsim','\u22EE':'vellip','\u22EF':'ctdot','\u22F0':'utdot','\u22F1':'dtdot','\u22F2':'disin','\u22F3':'isinsv','\u22F4':'isins','\u22F5':'isindot','\u22F5\u0338':'notindot','\u22F6':'notinvc','\u22F7':'notinvb','\u22F9':'isinE','\u22F9\u0338':'notinE','\u22FA':'nisd','\u22FB':'xnis','\u22FC':'nis','\u22FD':'notnivc','\u22FE':'notnivb','\u2305':'barwed','\u2306':'Barwed','\u230C':'drcrop','\u230D':'dlcrop','\u230E':'urcrop','\u230F':'ulcrop','\u2310':'bnot','\u2312':'profline','\u2313':'profsurf','\u2315':'telrec','\u2316':'target','\u231C':'ulcorn','\u231D':'urcorn','\u231E':'dlcorn','\u231F':'drcorn','\u2322':'frown','\u2323':'smile','\u232D':'cylcty','\u232E':'profalar','\u2336':'topbot','\u233D':'ovbar','\u233F':'solbar','\u237C':'angzarr','\u23B0':'lmoust','\u23B1':'rmoust','\u23B4':'tbrk','\u23B5':'bbrk','\u23B6':'bbrktbrk','\u23DC':'OverParenthesis','\u23DD':'UnderParenthesis','\u23DE':'OverBrace','\u23DF':'UnderBrace','\u23E2':'trpezium','\u23E7':'elinters','\u2423':'blank','\u2500':'boxh','\u2502':'boxv','\u250C':'boxdr','\u2510':'boxdl','\u2514':'boxur','\u2518':'boxul','\u251C':'boxvr','\u2524':'boxvl','\u252C':'boxhd','\u2534':'boxhu','\u253C':'boxvh','\u2550':'boxH','\u2551':'boxV','\u2552':'boxdR','\u2553':'boxDr','\u2554':'boxDR','\u2555':'boxdL','\u2556':'boxDl','\u2557':'boxDL','\u2558':'boxuR','\u2559':'boxUr','\u255A':'boxUR','\u255B':'boxuL','\u255C':'boxUl','\u255D':'boxUL','\u255E':'boxvR','\u255F':'boxVr','\u2560':'boxVR','\u2561':'boxvL','\u2562':'boxVl','\u2563':'boxVL','\u2564':'boxHd','\u2565':'boxhD','\u2566':'boxHD','\u2567':'boxHu','\u2568':'boxhU','\u2569':'boxHU','\u256A':'boxvH','\u256B':'boxVh','\u256C':'boxVH','\u2580':'uhblk','\u2584':'lhblk','\u2588':'block','\u2591':'blk14','\u2592':'blk12','\u2593':'blk34','\u25A1':'squ','\u25AA':'squf','\u25AB':'EmptyVerySmallSquare','\u25AD':'rect','\u25AE':'marker','\u25B1':'fltns','\u25B3':'xutri','\u25B4':'utrif','\u25B5':'utri','\u25B8':'rtrif','\u25B9':'rtri','\u25BD':'xdtri','\u25BE':'dtrif','\u25BF':'dtri','\u25C2':'ltrif','\u25C3':'ltri','\u25CA':'loz','\u25CB':'cir','\u25EC':'tridot','\u25EF':'xcirc','\u25F8':'ultri','\u25F9':'urtri','\u25FA':'lltri','\u25FB':'EmptySmallSquare','\u25FC':'FilledSmallSquare','\u2605':'starf','\u2606':'star','\u260E':'phone','\u2640':'female','\u2642':'male','\u2660':'spades','\u2663':'clubs','\u2665':'hearts','\u2666':'diams','\u266A':'sung','\u2713':'check','\u2717':'cross','\u2720':'malt','\u2736':'sext','\u2758':'VerticalSeparator','\u27C8':'bsolhsub','\u27C9':'suphsol','\u27F5':'xlarr','\u27F6':'xrarr','\u27F7':'xharr','\u27F8':'xlArr','\u27F9':'xrArr','\u27FA':'xhArr','\u27FC':'xmap','\u27FF':'dzigrarr','\u2902':'nvlArr','\u2903':'nvrArr','\u2904':'nvHarr','\u2905':'Map','\u290C':'lbarr','\u290D':'rbarr','\u290E':'lBarr','\u290F':'rBarr','\u2910':'RBarr','\u2911':'DDotrahd','\u2912':'UpArrowBar','\u2913':'DownArrowBar','\u2916':'Rarrtl','\u2919':'latail','\u291A':'ratail','\u291B':'lAtail','\u291C':'rAtail','\u291D':'larrfs','\u291E':'rarrfs','\u291F':'larrbfs','\u2920':'rarrbfs','\u2923':'nwarhk','\u2924':'nearhk','\u2925':'searhk','\u2926':'swarhk','\u2927':'nwnear','\u2928':'toea','\u2929':'tosa','\u292A':'swnwar','\u2933':'rarrc','\u2933\u0338':'nrarrc','\u2935':'cudarrr','\u2936':'ldca','\u2937':'rdca','\u2938':'cudarrl','\u2939':'larrpl','\u293C':'curarrm','\u293D':'cularrp','\u2945':'rarrpl','\u2948':'harrcir','\u2949':'Uarrocir','\u294A':'lurdshar','\u294B':'ldrushar','\u294E':'LeftRightVector','\u294F':'RightUpDownVector','\u2950':'DownLeftRightVector','\u2951':'LeftUpDownVector','\u2952':'LeftVectorBar','\u2953':'RightVectorBar','\u2954':'RightUpVectorBar','\u2955':'RightDownVectorBar','\u2956':'DownLeftVectorBar','\u2957':'DownRightVectorBar','\u2958':'LeftUpVectorBar','\u2959':'LeftDownVectorBar','\u295A':'LeftTeeVector','\u295B':'RightTeeVector','\u295C':'RightUpTeeVector','\u295D':'RightDownTeeVector','\u295E':'DownLeftTeeVector','\u295F':'DownRightTeeVector','\u2960':'LeftUpTeeVector','\u2961':'LeftDownTeeVector','\u2962':'lHar','\u2963':'uHar','\u2964':'rHar','\u2965':'dHar','\u2966':'luruhar','\u2967':'ldrdhar','\u2968':'ruluhar','\u2969':'rdldhar','\u296A':'lharul','\u296B':'llhard','\u296C':'rharul','\u296D':'lrhard','\u296E':'udhar','\u296F':'duhar','\u2970':'RoundImplies','\u2971':'erarr','\u2972':'simrarr','\u2973':'larrsim','\u2974':'rarrsim','\u2975':'rarrap','\u2976':'ltlarr','\u2978':'gtrarr','\u2979':'subrarr','\u297B':'suplarr','\u297C':'lfisht','\u297D':'rfisht','\u297E':'ufisht','\u297F':'dfisht','\u299A':'vzigzag','\u299C':'vangrt','\u299D':'angrtvbd','\u29A4':'ange','\u29A5':'range','\u29A6':'dwangle','\u29A7':'uwangle','\u29A8':'angmsdaa','\u29A9':'angmsdab','\u29AA':'angmsdac','\u29AB':'angmsdad','\u29AC':'angmsdae','\u29AD':'angmsdaf','\u29AE':'angmsdag','\u29AF':'angmsdah','\u29B0':'bemptyv','\u29B1':'demptyv','\u29B2':'cemptyv','\u29B3':'raemptyv','\u29B4':'laemptyv','\u29B5':'ohbar','\u29B6':'omid','\u29B7':'opar','\u29B9':'operp','\u29BB':'olcross','\u29BC':'odsold','\u29BE':'olcir','\u29BF':'ofcir','\u29C0':'olt','\u29C1':'ogt','\u29C2':'cirscir','\u29C3':'cirE','\u29C4':'solb','\u29C5':'bsolb','\u29C9':'boxbox','\u29CD':'trisb','\u29CE':'rtriltri','\u29CF':'LeftTriangleBar','\u29CF\u0338':'NotLeftTriangleBar','\u29D0':'RightTriangleBar','\u29D0\u0338':'NotRightTriangleBar','\u29DC':'iinfin','\u29DD':'infintie','\u29DE':'nvinfin','\u29E3':'eparsl','\u29E4':'smeparsl','\u29E5':'eqvparsl','\u29EB':'lozf','\u29F4':'RuleDelayed','\u29F6':'dsol','\u2A00':'xodot','\u2A01':'xoplus','\u2A02':'xotime','\u2A04':'xuplus','\u2A06':'xsqcup','\u2A0D':'fpartint','\u2A10':'cirfnint','\u2A11':'awint','\u2A12':'rppolint','\u2A13':'scpolint','\u2A14':'npolint','\u2A15':'pointint','\u2A16':'quatint','\u2A17':'intlarhk','\u2A22':'pluscir','\u2A23':'plusacir','\u2A24':'simplus','\u2A25':'plusdu','\u2A26':'plussim','\u2A27':'plustwo','\u2A29':'mcomma','\u2A2A':'minusdu','\u2A2D':'loplus','\u2A2E':'roplus','\u2A2F':'Cross','\u2A30':'timesd','\u2A31':'timesbar','\u2A33':'smashp','\u2A34':'lotimes','\u2A35':'rotimes','\u2A36':'otimesas','\u2A37':'Otimes','\u2A38':'odiv','\u2A39':'triplus','\u2A3A':'triminus','\u2A3B':'tritime','\u2A3C':'iprod','\u2A3F':'amalg','\u2A40':'capdot','\u2A42':'ncup','\u2A43':'ncap','\u2A44':'capand','\u2A45':'cupor','\u2A46':'cupcap','\u2A47':'capcup','\u2A48':'cupbrcap','\u2A49':'capbrcup','\u2A4A':'cupcup','\u2A4B':'capcap','\u2A4C':'ccups','\u2A4D':'ccaps','\u2A50':'ccupssm','\u2A53':'And','\u2A54':'Or','\u2A55':'andand','\u2A56':'oror','\u2A57':'orslope','\u2A58':'andslope','\u2A5A':'andv','\u2A5B':'orv','\u2A5C':'andd','\u2A5D':'ord','\u2A5F':'wedbar','\u2A66':'sdote','\u2A6A':'simdot','\u2A6D':'congdot','\u2A6D\u0338':'ncongdot','\u2A6E':'easter','\u2A6F':'apacir','\u2A70':'apE','\u2A70\u0338':'napE','\u2A71':'eplus','\u2A72':'pluse','\u2A73':'Esim','\u2A77':'eDDot','\u2A78':'equivDD','\u2A79':'ltcir','\u2A7A':'gtcir','\u2A7B':'ltquest','\u2A7C':'gtquest','\u2A7D':'les','\u2A7D\u0338':'nles','\u2A7E':'ges','\u2A7E\u0338':'nges','\u2A7F':'lesdot','\u2A80':'gesdot','\u2A81':'lesdoto','\u2A82':'gesdoto','\u2A83':'lesdotor','\u2A84':'gesdotol','\u2A85':'lap','\u2A86':'gap','\u2A87':'lne','\u2A88':'gne','\u2A89':'lnap','\u2A8A':'gnap','\u2A8B':'lEg','\u2A8C':'gEl','\u2A8D':'lsime','\u2A8E':'gsime','\u2A8F':'lsimg','\u2A90':'gsiml','\u2A91':'lgE','\u2A92':'glE','\u2A93':'lesges','\u2A94':'gesles','\u2A95':'els','\u2A96':'egs','\u2A97':'elsdot','\u2A98':'egsdot','\u2A99':'el','\u2A9A':'eg','\u2A9D':'siml','\u2A9E':'simg','\u2A9F':'simlE','\u2AA0':'simgE','\u2AA1':'LessLess','\u2AA1\u0338':'NotNestedLessLess','\u2AA2':'GreaterGreater','\u2AA2\u0338':'NotNestedGreaterGreater','\u2AA4':'glj','\u2AA5':'gla','\u2AA6':'ltcc','\u2AA7':'gtcc','\u2AA8':'lescc','\u2AA9':'gescc','\u2AAA':'smt','\u2AAB':'lat','\u2AAC':'smte','\u2AAC\uFE00':'smtes','\u2AAD':'late','\u2AAD\uFE00':'lates','\u2AAE':'bumpE','\u2AAF':'pre','\u2AAF\u0338':'npre','\u2AB0':'sce','\u2AB0\u0338':'nsce','\u2AB3':'prE','\u2AB4':'scE','\u2AB5':'prnE','\u2AB6':'scnE','\u2AB7':'prap','\u2AB8':'scap','\u2AB9':'prnap','\u2ABA':'scnap','\u2ABB':'Pr','\u2ABC':'Sc','\u2ABD':'subdot','\u2ABE':'supdot','\u2ABF':'subplus','\u2AC0':'supplus','\u2AC1':'submult','\u2AC2':'supmult','\u2AC3':'subedot','\u2AC4':'supedot','\u2AC5':'subE','\u2AC5\u0338':'nsubE','\u2AC6':'supE','\u2AC6\u0338':'nsupE','\u2AC7':'subsim','\u2AC8':'supsim','\u2ACB\uFE00':'vsubnE','\u2ACB':'subnE','\u2ACC\uFE00':'vsupnE','\u2ACC':'supnE','\u2ACF':'csub','\u2AD0':'csup','\u2AD1':'csube','\u2AD2':'csupe','\u2AD3':'subsup','\u2AD4':'supsub','\u2AD5':'subsub','\u2AD6':'supsup','\u2AD7':'suphsub','\u2AD8':'supdsub','\u2AD9':'forkv','\u2ADA':'topfork','\u2ADB':'mlcp','\u2AE4':'Dashv','\u2AE6':'Vdashl','\u2AE7':'Barv','\u2AE8':'vBar','\u2AE9':'vBarv','\u2AEB':'Vbar','\u2AEC':'Not','\u2AED':'bNot','\u2AEE':'rnmid','\u2AEF':'cirmid','\u2AF0':'midcir','\u2AF1':'topcir','\u2AF2':'nhpar','\u2AF3':'parsim','\u2AFD':'parsl','\u2AFD\u20E5':'nparsl','\u266D':'flat','\u266E':'natur','\u266F':'sharp','\xA4':'curren','\xA2':'cent','$':'dollar','\xA3':'pound','\xA5':'yen','\u20AC':'euro','\xB9':'sup1','\xBD':'half','\u2153':'frac13','\xBC':'frac14','\u2155':'frac15','\u2159':'frac16','\u215B':'frac18','\xB2':'sup2','\u2154':'frac23','\u2156':'frac25','\xB3':'sup3','\xBE':'frac34','\u2157':'frac35','\u215C':'frac38','\u2158':'frac45','\u215A':'frac56','\u215D':'frac58','\u215E':'frac78','\uD835\uDCB6':'ascr','\uD835\uDD52':'aopf','\uD835\uDD1E':'afr','\uD835\uDD38':'Aopf','\uD835\uDD04':'Afr','\uD835\uDC9C':'Ascr','\xAA':'ordf','\xE1':'aacute','\xC1':'Aacute','\xE0':'agrave','\xC0':'Agrave','\u0103':'abreve','\u0102':'Abreve','\xE2':'acirc','\xC2':'Acirc','\xE5':'aring','\xC5':'angst','\xE4':'auml','\xC4':'Auml','\xE3':'atilde','\xC3':'Atilde','\u0105':'aogon','\u0104':'Aogon','\u0101':'amacr','\u0100':'Amacr','\xE6':'aelig','\xC6':'AElig','\uD835\uDCB7':'bscr','\uD835\uDD53':'bopf','\uD835\uDD1F':'bfr','\uD835\uDD39':'Bopf','\u212C':'Bscr','\uD835\uDD05':'Bfr','\uD835\uDD20':'cfr','\uD835\uDCB8':'cscr','\uD835\uDD54':'copf','\u212D':'Cfr','\uD835\uDC9E':'Cscr','\u2102':'Copf','\u0107':'cacute','\u0106':'Cacute','\u0109':'ccirc','\u0108':'Ccirc','\u010D':'ccaron','\u010C':'Ccaron','\u010B':'cdot','\u010A':'Cdot','\xE7':'ccedil','\xC7':'Ccedil','\u2105':'incare','\uD835\uDD21':'dfr','\u2146':'dd','\uD835\uDD55':'dopf','\uD835\uDCB9':'dscr','\uD835\uDC9F':'Dscr','\uD835\uDD07':'Dfr','\u2145':'DD','\uD835\uDD3B':'Dopf','\u010F':'dcaron','\u010E':'Dcaron','\u0111':'dstrok','\u0110':'Dstrok','\xF0':'eth','\xD0':'ETH','\u2147':'ee','\u212F':'escr','\uD835\uDD22':'efr','\uD835\uDD56':'eopf','\u2130':'Escr','\uD835\uDD08':'Efr','\uD835\uDD3C':'Eopf','\xE9':'eacute','\xC9':'Eacute','\xE8':'egrave','\xC8':'Egrave','\xEA':'ecirc','\xCA':'Ecirc','\u011B':'ecaron','\u011A':'Ecaron','\xEB':'euml','\xCB':'Euml','\u0117':'edot','\u0116':'Edot','\u0119':'eogon','\u0118':'Eogon','\u0113':'emacr','\u0112':'Emacr','\uD835\uDD23':'ffr','\uD835\uDD57':'fopf','\uD835\uDCBB':'fscr','\uD835\uDD09':'Ffr','\uD835\uDD3D':'Fopf','\u2131':'Fscr','\uFB00':'fflig','\uFB03':'ffilig','\uFB04':'ffllig','\uFB01':'filig','fj':'fjlig','\uFB02':'fllig','\u0192':'fnof','\u210A':'gscr','\uD835\uDD58':'gopf','\uD835\uDD24':'gfr','\uD835\uDCA2':'Gscr','\uD835\uDD3E':'Gopf','\uD835\uDD0A':'Gfr','\u01F5':'gacute','\u011F':'gbreve','\u011E':'Gbreve','\u011D':'gcirc','\u011C':'Gcirc','\u0121':'gdot','\u0120':'Gdot','\u0122':'Gcedil','\uD835\uDD25':'hfr','\u210E':'planckh','\uD835\uDCBD':'hscr','\uD835\uDD59':'hopf','\u210B':'Hscr','\u210C':'Hfr','\u210D':'Hopf','\u0125':'hcirc','\u0124':'Hcirc','\u210F':'hbar','\u0127':'hstrok','\u0126':'Hstrok','\uD835\uDD5A':'iopf','\uD835\uDD26':'ifr','\uD835\uDCBE':'iscr','\u2148':'ii','\uD835\uDD40':'Iopf','\u2110':'Iscr','\u2111':'Im','\xED':'iacute','\xCD':'Iacute','\xEC':'igrave','\xCC':'Igrave','\xEE':'icirc','\xCE':'Icirc','\xEF':'iuml','\xCF':'Iuml','\u0129':'itilde','\u0128':'Itilde','\u0130':'Idot','\u012F':'iogon','\u012E':'Iogon','\u012B':'imacr','\u012A':'Imacr','\u0133':'ijlig','\u0132':'IJlig','\u0131':'imath','\uD835\uDCBF':'jscr','\uD835\uDD5B':'jopf','\uD835\uDD27':'jfr','\uD835\uDCA5':'Jscr','\uD835\uDD0D':'Jfr','\uD835\uDD41':'Jopf','\u0135':'jcirc','\u0134':'Jcirc','\u0237':'jmath','\uD835\uDD5C':'kopf','\uD835\uDCC0':'kscr','\uD835\uDD28':'kfr','\uD835\uDCA6':'Kscr','\uD835\uDD42':'Kopf','\uD835\uDD0E':'Kfr','\u0137':'kcedil','\u0136':'Kcedil','\uD835\uDD29':'lfr','\uD835\uDCC1':'lscr','\u2113':'ell','\uD835\uDD5D':'lopf','\u2112':'Lscr','\uD835\uDD0F':'Lfr','\uD835\uDD43':'Lopf','\u013A':'lacute','\u0139':'Lacute','\u013E':'lcaron','\u013D':'Lcaron','\u013C':'lcedil','\u013B':'Lcedil','\u0142':'lstrok','\u0141':'Lstrok','\u0140':'lmidot','\u013F':'Lmidot','\uD835\uDD2A':'mfr','\uD835\uDD5E':'mopf','\uD835\uDCC2':'mscr','\uD835\uDD10':'Mfr','\uD835\uDD44':'Mopf','\u2133':'Mscr','\uD835\uDD2B':'nfr','\uD835\uDD5F':'nopf','\uD835\uDCC3':'nscr','\u2115':'Nopf','\uD835\uDCA9':'Nscr','\uD835\uDD11':'Nfr','\u0144':'nacute','\u0143':'Nacute','\u0148':'ncaron','\u0147':'Ncaron','\xF1':'ntilde','\xD1':'Ntilde','\u0146':'ncedil','\u0145':'Ncedil','\u2116':'numero','\u014B':'eng','\u014A':'ENG','\uD835\uDD60':'oopf','\uD835\uDD2C':'ofr','\u2134':'oscr','\uD835\uDCAA':'Oscr','\uD835\uDD12':'Ofr','\uD835\uDD46':'Oopf','\xBA':'ordm','\xF3':'oacute','\xD3':'Oacute','\xF2':'ograve','\xD2':'Ograve','\xF4':'ocirc','\xD4':'Ocirc','\xF6':'ouml','\xD6':'Ouml','\u0151':'odblac','\u0150':'Odblac','\xF5':'otilde','\xD5':'Otilde','\xF8':'oslash','\xD8':'Oslash','\u014D':'omacr','\u014C':'Omacr','\u0153':'oelig','\u0152':'OElig','\uD835\uDD2D':'pfr','\uD835\uDCC5':'pscr','\uD835\uDD61':'popf','\u2119':'Popf','\uD835\uDD13':'Pfr','\uD835\uDCAB':'Pscr','\uD835\uDD62':'qopf','\uD835\uDD2E':'qfr','\uD835\uDCC6':'qscr','\uD835\uDCAC':'Qscr','\uD835\uDD14':'Qfr','\u211A':'Qopf','\u0138':'kgreen','\uD835\uDD2F':'rfr','\uD835\uDD63':'ropf','\uD835\uDCC7':'rscr','\u211B':'Rscr','\u211C':'Re','\u211D':'Ropf','\u0155':'racute','\u0154':'Racute','\u0159':'rcaron','\u0158':'Rcaron','\u0157':'rcedil','\u0156':'Rcedil','\uD835\uDD64':'sopf','\uD835\uDCC8':'sscr','\uD835\uDD30':'sfr','\uD835\uDD4A':'Sopf','\uD835\uDD16':'Sfr','\uD835\uDCAE':'Sscr','\u24C8':'oS','\u015B':'sacute','\u015A':'Sacute','\u015D':'scirc','\u015C':'Scirc','\u0161':'scaron','\u0160':'Scaron','\u015F':'scedil','\u015E':'Scedil','\xDF':'szlig','\uD835\uDD31':'tfr','\uD835\uDCC9':'tscr','\uD835\uDD65':'topf','\uD835\uDCAF':'Tscr','\uD835\uDD17':'Tfr','\uD835\uDD4B':'Topf','\u0165':'tcaron','\u0164':'Tcaron','\u0163':'tcedil','\u0162':'Tcedil','\u2122':'trade','\u0167':'tstrok','\u0166':'Tstrok','\uD835\uDCCA':'uscr','\uD835\uDD66':'uopf','\uD835\uDD32':'ufr','\uD835\uDD4C':'Uopf','\uD835\uDD18':'Ufr','\uD835\uDCB0':'Uscr','\xFA':'uacute','\xDA':'Uacute','\xF9':'ugrave','\xD9':'Ugrave','\u016D':'ubreve','\u016C':'Ubreve','\xFB':'ucirc','\xDB':'Ucirc','\u016F':'uring','\u016E':'Uring','\xFC':'uuml','\xDC':'Uuml','\u0171':'udblac','\u0170':'Udblac','\u0169':'utilde','\u0168':'Utilde','\u0173':'uogon','\u0172':'Uogon','\u016B':'umacr','\u016A':'Umacr','\uD835\uDD33':'vfr','\uD835\uDD67':'vopf','\uD835\uDCCB':'vscr','\uD835\uDD19':'Vfr','\uD835\uDD4D':'Vopf','\uD835\uDCB1':'Vscr','\uD835\uDD68':'wopf','\uD835\uDCCC':'wscr','\uD835\uDD34':'wfr','\uD835\uDCB2':'Wscr','\uD835\uDD4E':'Wopf','\uD835\uDD1A':'Wfr','\u0175':'wcirc','\u0174':'Wcirc','\uD835\uDD35':'xfr','\uD835\uDCCD':'xscr','\uD835\uDD69':'xopf','\uD835\uDD4F':'Xopf','\uD835\uDD1B':'Xfr','\uD835\uDCB3':'Xscr','\uD835\uDD36':'yfr','\uD835\uDCCE':'yscr','\uD835\uDD6A':'yopf','\uD835\uDCB4':'Yscr','\uD835\uDD1C':'Yfr','\uD835\uDD50':'Yopf','\xFD':'yacute','\xDD':'Yacute','\u0177':'ycirc','\u0176':'Ycirc','\xFF':'yuml','\u0178':'Yuml','\uD835\uDCCF':'zscr','\uD835\uDD37':'zfr','\uD835\uDD6B':'zopf','\u2128':'Zfr','\u2124':'Zopf','\uD835\uDCB5':'Zscr','\u017A':'zacute','\u0179':'Zacute','\u017E':'zcaron','\u017D':'Zcaron','\u017C':'zdot','\u017B':'Zdot','\u01B5':'imped','\xFE':'thorn','\xDE':'THORN','\u0149':'napos','\u03B1':'alpha','\u0391':'Alpha','\u03B2':'beta','\u0392':'Beta','\u03B3':'gamma','\u0393':'Gamma','\u03B4':'delta','\u0394':'Delta','\u03B5':'epsi','\u03F5':'epsiv','\u0395':'Epsilon','\u03DD':'gammad','\u03DC':'Gammad','\u03B6':'zeta','\u0396':'Zeta','\u03B7':'eta','\u0397':'Eta','\u03B8':'theta','\u03D1':'thetav','\u0398':'Theta','\u03B9':'iota','\u0399':'Iota','\u03BA':'kappa','\u03F0':'kappav','\u039A':'Kappa','\u03BB':'lambda','\u039B':'Lambda','\u03BC':'mu','\xB5':'micro','\u039C':'Mu','\u03BD':'nu','\u039D':'Nu','\u03BE':'xi','\u039E':'Xi','\u03BF':'omicron','\u039F':'Omicron','\u03C0':'pi','\u03D6':'piv','\u03A0':'Pi','\u03C1':'rho','\u03F1':'rhov','\u03A1':'Rho','\u03C3':'sigma','\u03A3':'Sigma','\u03C2':'sigmaf','\u03C4':'tau','\u03A4':'Tau','\u03C5':'upsi','\u03A5':'Upsilon','\u03D2':'Upsi','\u03C6':'phi','\u03D5':'phiv','\u03A6':'Phi','\u03C7':'chi','\u03A7':'Chi','\u03C8':'psi','\u03A8':'Psi','\u03C9':'omega','\u03A9':'ohm','\u0430':'acy','\u0410':'Acy','\u0431':'bcy','\u0411':'Bcy','\u0432':'vcy','\u0412':'Vcy','\u0433':'gcy','\u0413':'Gcy','\u0453':'gjcy','\u0403':'GJcy','\u0434':'dcy','\u0414':'Dcy','\u0452':'djcy','\u0402':'DJcy','\u0435':'iecy','\u0415':'IEcy','\u0451':'iocy','\u0401':'IOcy','\u0454':'jukcy','\u0404':'Jukcy','\u0436':'zhcy','\u0416':'ZHcy','\u0437':'zcy','\u0417':'Zcy','\u0455':'dscy','\u0405':'DScy','\u0438':'icy','\u0418':'Icy','\u0456':'iukcy','\u0406':'Iukcy','\u0457':'yicy','\u0407':'YIcy','\u0439':'jcy','\u0419':'Jcy','\u0458':'jsercy','\u0408':'Jsercy','\u043A':'kcy','\u041A':'Kcy','\u045C':'kjcy','\u040C':'KJcy','\u043B':'lcy','\u041B':'Lcy','\u0459':'ljcy','\u0409':'LJcy','\u043C':'mcy','\u041C':'Mcy','\u043D':'ncy','\u041D':'Ncy','\u045A':'njcy','\u040A':'NJcy','\u043E':'ocy','\u041E':'Ocy','\u043F':'pcy','\u041F':'Pcy','\u0440':'rcy','\u0420':'Rcy','\u0441':'scy','\u0421':'Scy','\u0442':'tcy','\u0422':'Tcy','\u045B':'tshcy','\u040B':'TSHcy','\u0443':'ucy','\u0423':'Ucy','\u045E':'ubrcy','\u040E':'Ubrcy','\u0444':'fcy','\u0424':'Fcy','\u0445':'khcy','\u0425':'KHcy','\u0446':'tscy','\u0426':'TScy','\u0447':'chcy','\u0427':'CHcy','\u045F':'dzcy','\u040F':'DZcy','\u0448':'shcy','\u0428':'SHcy','\u0449':'shchcy','\u0429':'SHCHcy','\u044A':'hardcy','\u042A':'HARDcy','\u044B':'ycy','\u042B':'Ycy','\u044C':'softcy','\u042C':'SOFTcy','\u044D':'ecy','\u042D':'Ecy','\u044E':'yucy','\u042E':'YUcy','\u044F':'yacy','\u042F':'YAcy','\u2135':'aleph','\u2136':'beth','\u2137':'gimel','\u2138':'daleth'};

	var regexEscape = /["&'<>`]/g;
	var escapeMap = {
		'"': '&quot;',
		'&': '&amp;',
		'\'': '&#x27;',
		'<': '&lt;',
		// See https://mathiasbynens.be/notes/ambiguous-ampersands: in HTML, the
		// following is not strictly necessary unless it’s part of a tag or an
		// unquoted attribute value. We’re only escaping it to support those
		// situations, and for XML support.
		'>': '&gt;',
		// In Internet Explorer ≤ 8, the backtick character can be used
		// to break out of (un)quoted attribute values or HTML comments.
		// See http://html5sec.org/#102, http://html5sec.org/#108, and
		// http://html5sec.org/#133.
		'`': '&#x60;'
	};

	var regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
	var regexInvalidRawCodePoint = /[\0-\x08\x0B\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
	var regexDecode = /&(CounterClockwiseContourIntegral|DoubleLongLeftRightArrow|ClockwiseContourIntegral|NotNestedGreaterGreater|NotSquareSupersetEqual|DiacriticalDoubleAcute|NotRightTriangleEqual|NotSucceedsSlantEqual|NotPrecedesSlantEqual|CloseCurlyDoubleQuote|NegativeVeryThinSpace|DoubleContourIntegral|FilledVerySmallSquare|CapitalDifferentialD|OpenCurlyDoubleQuote|EmptyVerySmallSquare|NestedGreaterGreater|DoubleLongRightArrow|NotLeftTriangleEqual|NotGreaterSlantEqual|ReverseUpEquilibrium|DoubleLeftRightArrow|NotSquareSubsetEqual|NotDoubleVerticalBar|RightArrowLeftArrow|NotGreaterFullEqual|NotRightTriangleBar|SquareSupersetEqual|DownLeftRightVector|DoubleLongLeftArrow|leftrightsquigarrow|LeftArrowRightArrow|NegativeMediumSpace|blacktriangleright|RightDownVectorBar|PrecedesSlantEqual|RightDoubleBracket|SucceedsSlantEqual|NotLeftTriangleBar|RightTriangleEqual|SquareIntersection|RightDownTeeVector|ReverseEquilibrium|NegativeThickSpace|longleftrightarrow|Longleftrightarrow|LongLeftRightArrow|DownRightTeeVector|DownRightVectorBar|GreaterSlantEqual|SquareSubsetEqual|LeftDownVectorBar|LeftDoubleBracket|VerticalSeparator|rightleftharpoons|NotGreaterGreater|NotSquareSuperset|blacktriangleleft|blacktriangledown|NegativeThinSpace|LeftDownTeeVector|NotLessSlantEqual|leftrightharpoons|DoubleUpDownArrow|DoubleVerticalBar|LeftTriangleEqual|FilledSmallSquare|twoheadrightarrow|NotNestedLessLess|DownLeftTeeVector|DownLeftVectorBar|RightAngleBracket|NotTildeFullEqual|NotReverseElement|RightUpDownVector|DiacriticalTilde|NotSucceedsTilde|circlearrowright|NotPrecedesEqual|rightharpoondown|DoubleRightArrow|NotSucceedsEqual|NonBreakingSpace|NotRightTriangle|LessEqualGreater|RightUpTeeVector|LeftAngleBracket|GreaterFullEqual|DownArrowUpArrow|RightUpVectorBar|twoheadleftarrow|GreaterEqualLess|downharpoonright|RightTriangleBar|ntrianglerighteq|NotSupersetEqual|LeftUpDownVector|DiacriticalAcute|rightrightarrows|vartriangleright|UpArrowDownArrow|DiacriticalGrave|UnderParenthesis|EmptySmallSquare|LeftUpVectorBar|leftrightarrows|DownRightVector|downharpoonleft|trianglerighteq|ShortRightArrow|OverParenthesis|DoubleLeftArrow|DoubleDownArrow|NotSquareSubset|bigtriangledown|ntrianglelefteq|UpperRightArrow|curvearrowright|vartriangleleft|NotLeftTriangle|nleftrightarrow|LowerRightArrow|NotHumpDownHump|NotGreaterTilde|rightthreetimes|LeftUpTeeVector|NotGreaterEqual|straightepsilon|LeftTriangleBar|rightsquigarrow|ContourIntegral|rightleftarrows|CloseCurlyQuote|RightDownVector|LeftRightVector|nLeftrightarrow|leftharpoondown|circlearrowleft|SquareSuperset|OpenCurlyQuote|hookrightarrow|HorizontalLine|DiacriticalDot|NotLessGreater|ntriangleright|DoubleRightTee|InvisibleComma|InvisibleTimes|LowerLeftArrow|DownLeftVector|NotSubsetEqual|curvearrowleft|trianglelefteq|NotVerticalBar|TildeFullEqual|downdownarrows|NotGreaterLess|RightTeeVector|ZeroWidthSpace|looparrowright|LongRightArrow|doublebarwedge|ShortLeftArrow|ShortDownArrow|RightVectorBar|GreaterGreater|ReverseElement|rightharpoonup|LessSlantEqual|leftthreetimes|upharpoonright|rightarrowtail|LeftDownVector|Longrightarrow|NestedLessLess|UpperLeftArrow|nshortparallel|leftleftarrows|leftrightarrow|Leftrightarrow|LeftRightArrow|longrightarrow|upharpoonleft|RightArrowBar|ApplyFunction|LeftTeeVector|leftarrowtail|NotEqualTilde|varsubsetneqq|varsupsetneqq|RightTeeArrow|SucceedsEqual|SucceedsTilde|LeftVectorBar|SupersetEqual|hookleftarrow|DifferentialD|VerticalTilde|VeryThinSpace|blacktriangle|bigtriangleup|LessFullEqual|divideontimes|leftharpoonup|UpEquilibrium|ntriangleleft|RightTriangle|measuredangle|shortparallel|longleftarrow|Longleftarrow|LongLeftArrow|DoubleLeftTee|Poincareplane|PrecedesEqual|triangleright|DoubleUpArrow|RightUpVector|fallingdotseq|looparrowleft|PrecedesTilde|NotTildeEqual|NotTildeTilde|smallsetminus|Proportional|triangleleft|triangledown|UnderBracket|NotHumpEqual|exponentiale|ExponentialE|NotLessTilde|HilbertSpace|RightCeiling|blacklozenge|varsupsetneq|HumpDownHump|GreaterEqual|VerticalLine|LeftTeeArrow|NotLessEqual|DownTeeArrow|LeftTriangle|varsubsetneq|Intersection|NotCongruent|DownArrowBar|LeftUpVector|LeftArrowBar|risingdotseq|GreaterTilde|RoundImplies|SquareSubset|ShortUpArrow|NotSuperset|quaternions|precnapprox|backepsilon|preccurlyeq|OverBracket|blacksquare|MediumSpace|VerticalBar|circledcirc|circleddash|CircleMinus|CircleTimes|LessGreater|curlyeqprec|curlyeqsucc|diamondsuit|UpDownArrow|Updownarrow|RuleDelayed|Rrightarrow|updownarrow|RightVector|nRightarrow|nrightarrow|eqslantless|LeftCeiling|Equilibrium|SmallCircle|expectation|NotSucceeds|thickapprox|GreaterLess|SquareUnion|NotPrecedes|NotLessLess|straightphi|succnapprox|succcurlyeq|SubsetEqual|sqsupseteq|Proportion|Laplacetrf|ImaginaryI|supsetneqq|NotGreater|gtreqqless|NotElement|ThickSpace|TildeEqual|TildeTilde|Fouriertrf|rmoustache|EqualTilde|eqslantgtr|UnderBrace|LeftVector|UpArrowBar|nLeftarrow|nsubseteqq|subsetneqq|nsupseteqq|nleftarrow|succapprox|lessapprox|UpTeeArrow|upuparrows|curlywedge|lesseqqgtr|varepsilon|varnothing|RightFloor|complement|CirclePlus|sqsubseteq|Lleftarrow|circledast|RightArrow|Rightarrow|rightarrow|lmoustache|Bernoullis|precapprox|mapstoleft|mapstodown|longmapsto|dotsquare|downarrow|DoubleDot|nsubseteq|supsetneq|leftarrow|nsupseteq|subsetneq|ThinSpace|ngeqslant|subseteqq|HumpEqual|NotSubset|triangleq|NotCupCap|lesseqgtr|heartsuit|TripleDot|Leftarrow|Coproduct|Congruent|varpropto|complexes|gvertneqq|LeftArrow|LessTilde|supseteqq|MinusPlus|CircleDot|nleqslant|NotExists|gtreqless|nparallel|UnionPlus|LeftFloor|checkmark|CenterDot|centerdot|Mellintrf|gtrapprox|bigotimes|OverBrace|spadesuit|therefore|pitchfork|rationals|PlusMinus|Backslash|Therefore|DownBreve|backsimeq|backprime|DownArrow|nshortmid|Downarrow|lvertneqq|eqvparsl|imagline|imagpart|infintie|integers|Integral|intercal|LessLess|Uarrocir|intlarhk|sqsupset|angmsdaf|sqsubset|llcorner|vartheta|cupbrcap|lnapprox|Superset|SuchThat|succnsim|succneqq|angmsdag|biguplus|curlyvee|trpezium|Succeeds|NotTilde|bigwedge|angmsdah|angrtvbd|triminus|cwconint|fpartint|lrcorner|smeparsl|subseteq|urcorner|lurdshar|laemptyv|DDotrahd|approxeq|ldrushar|awconint|mapstoup|backcong|shortmid|triangle|geqslant|gesdotol|timesbar|circledR|circledS|setminus|multimap|naturals|scpolint|ncongdot|RightTee|boxminus|gnapprox|boxtimes|andslope|thicksim|angmsdaa|varsigma|cirfnint|rtriltri|angmsdab|rppolint|angmsdac|barwedge|drbkarow|clubsuit|thetasym|bsolhsub|capbrcup|dzigrarr|doteqdot|DotEqual|dotminus|UnderBar|NotEqual|realpart|otimesas|ulcorner|hksearow|hkswarow|parallel|PartialD|elinters|emptyset|plusacir|bbrktbrk|angmsdad|pointint|bigoplus|angmsdae|Precedes|bigsqcup|varkappa|notindot|supseteq|precneqq|precnsim|profalar|profline|profsurf|leqslant|lesdotor|raemptyv|subplus|notnivb|notnivc|subrarr|zigrarr|vzigzag|submult|subedot|Element|between|cirscir|larrbfs|larrsim|lotimes|lbrksld|lbrkslu|lozenge|ldrdhar|dbkarow|bigcirc|epsilon|simrarr|simplus|ltquest|Epsilon|luruhar|gtquest|maltese|npolint|eqcolon|npreceq|bigodot|ddagger|gtrless|bnequiv|harrcir|ddotseq|equivDD|backsim|demptyv|nsqsube|nsqsupe|Upsilon|nsubset|upsilon|minusdu|nsucceq|swarrow|nsupset|coloneq|searrow|boxplus|napprox|natural|asympeq|alefsym|congdot|nearrow|bigstar|diamond|supplus|tritime|LeftTee|nvinfin|triplus|NewLine|nvltrie|nvrtrie|nwarrow|nexists|Diamond|ruluhar|Implies|supmult|angzarr|suplarr|suphsub|questeq|because|digamma|Because|olcross|bemptyv|omicron|Omicron|rotimes|NoBreak|intprod|angrtvb|orderof|uwangle|suphsol|lesdoto|orslope|DownTee|realine|cudarrl|rdldhar|OverBar|supedot|lessdot|supdsub|topfork|succsim|rbrkslu|rbrksld|pertenk|cudarrr|isindot|planckh|lessgtr|pluscir|gesdoto|plussim|plustwo|lesssim|cularrp|rarrsim|Cayleys|notinva|notinvb|notinvc|UpArrow|Uparrow|uparrow|NotLess|dwangle|precsim|Product|curarrm|Cconint|dotplus|rarrbfs|ccupssm|Cedilla|cemptyv|notniva|quatint|frac35|frac38|frac45|frac56|frac58|frac78|tridot|xoplus|gacute|gammad|Gammad|lfisht|lfloor|bigcup|sqsupe|gbreve|Gbreve|lharul|sqsube|sqcups|Gcedil|apacir|llhard|lmidot|Lmidot|lmoust|andand|sqcaps|approx|Abreve|spades|circeq|tprime|divide|topcir|Assign|topbot|gesdot|divonx|xuplus|timesd|gesles|atilde|solbar|SOFTcy|loplus|timesb|lowast|lowbar|dlcorn|dlcrop|softcy|dollar|lparlt|thksim|lrhard|Atilde|lsaquo|smashp|bigvee|thinsp|wreath|bkarow|lsquor|lstrok|Lstrok|lthree|ltimes|ltlarr|DotDot|simdot|ltrPar|weierp|xsqcup|angmsd|sigmav|sigmaf|zeetrf|Zcaron|zcaron|mapsto|vsupne|thetav|cirmid|marker|mcomma|Zacute|vsubnE|there4|gtlPar|vsubne|bottom|gtrarr|SHCHcy|shchcy|midast|midcir|middot|minusb|minusd|gtrdot|bowtie|sfrown|mnplus|models|colone|seswar|Colone|mstpos|searhk|gtrsim|nacute|Nacute|boxbox|telrec|hairsp|Tcedil|nbumpe|scnsim|ncaron|Ncaron|ncedil|Ncedil|hamilt|Scedil|nearhk|hardcy|HARDcy|tcedil|Tcaron|commat|nequiv|nesear|tcaron|target|hearts|nexist|varrho|scedil|Scaron|scaron|hellip|Sacute|sacute|hercon|swnwar|compfn|rtimes|rthree|rsquor|rsaquo|zacute|wedgeq|homtht|barvee|barwed|Barwed|rpargt|horbar|conint|swarhk|roplus|nltrie|hslash|hstrok|Hstrok|rmoust|Conint|bprime|hybull|hyphen|iacute|Iacute|supsup|supsub|supsim|varphi|coprod|brvbar|agrave|Supset|supset|igrave|Igrave|notinE|Agrave|iiiint|iinfin|copysr|wedbar|Verbar|vangrt|becaus|incare|verbar|inodot|bullet|drcorn|intcal|drcrop|cularr|vellip|Utilde|bumpeq|cupcap|dstrok|Dstrok|CupCap|cupcup|cupdot|eacute|Eacute|supdot|iquest|easter|ecaron|Ecaron|ecolon|isinsv|utilde|itilde|Itilde|curarr|succeq|Bumpeq|cacute|ulcrop|nparsl|Cacute|nprcue|egrave|Egrave|nrarrc|nrarrw|subsup|subsub|nrtrie|jsercy|nsccue|Jsercy|kappav|kcedil|Kcedil|subsim|ulcorn|nsimeq|egsdot|veebar|kgreen|capand|elsdot|Subset|subset|curren|aacute|lacute|Lacute|emptyv|ntilde|Ntilde|lagran|lambda|Lambda|capcap|Ugrave|langle|subdot|emsp13|numero|emsp14|nvdash|nvDash|nVdash|nVDash|ugrave|ufisht|nvHarr|larrfs|nvlArr|larrhk|larrlp|larrpl|nvrArr|Udblac|nwarhk|larrtl|nwnear|oacute|Oacute|latail|lAtail|sstarf|lbrace|odblac|Odblac|lbrack|udblac|odsold|eparsl|lcaron|Lcaron|ograve|Ograve|lcedil|Lcedil|Aacute|ssmile|ssetmn|squarf|ldquor|capcup|ominus|cylcty|rharul|eqcirc|dagger|rfloor|rfisht|Dagger|daleth|equals|origof|capdot|equest|dcaron|Dcaron|rdquor|oslash|Oslash|otilde|Otilde|otimes|Otimes|urcrop|Ubreve|ubreve|Yacute|Uacute|uacute|Rcedil|rcedil|urcorn|parsim|Rcaron|Vdashl|rcaron|Tstrok|percnt|period|permil|Exists|yacute|rbrack|rbrace|phmmat|ccaron|Ccaron|planck|ccedil|plankv|tstrok|female|plusdo|plusdu|ffilig|plusmn|ffllig|Ccedil|rAtail|dfisht|bernou|ratail|Rarrtl|rarrtl|angsph|rarrpl|rarrlp|rarrhk|xwedge|xotime|forall|ForAll|Vvdash|vsupnE|preceq|bigcap|frac12|frac13|frac14|primes|rarrfs|prnsim|frac15|Square|frac16|square|lesdot|frac18|frac23|propto|prurel|rarrap|rangle|puncsp|frac25|Racute|qprime|racute|lesges|frac34|abreve|AElig|eqsim|utdot|setmn|urtri|Equal|Uring|seArr|uring|searr|dashv|Dashv|mumap|nabla|iogon|Iogon|sdote|sdotb|scsim|napid|napos|equiv|natur|Acirc|dblac|erarr|nbump|iprod|erDot|ucirc|awint|esdot|angrt|ncong|isinE|scnap|Scirc|scirc|ndash|isins|Ubrcy|nearr|neArr|isinv|nedot|ubrcy|acute|Ycirc|iukcy|Iukcy|xutri|nesim|caret|jcirc|Jcirc|caron|twixt|ddarr|sccue|exist|jmath|sbquo|ngeqq|angst|ccaps|lceil|ngsim|UpTee|delta|Delta|rtrif|nharr|nhArr|nhpar|rtrie|jukcy|Jukcy|kappa|rsquo|Kappa|nlarr|nlArr|TSHcy|rrarr|aogon|Aogon|fflig|xrarr|tshcy|ccirc|nleqq|filig|upsih|nless|dharl|nlsim|fjlig|ropar|nltri|dharr|robrk|roarr|fllig|fltns|roang|rnmid|subnE|subne|lAarr|trisb|Ccirc|acirc|ccups|blank|VDash|forkv|Vdash|langd|cedil|blk12|blk14|laquo|strns|diams|notin|vDash|larrb|blk34|block|disin|uplus|vdash|vBarv|aelig|starf|Wedge|check|xrArr|lates|lbarr|lBarr|notni|lbbrk|bcong|frasl|lbrke|frown|vrtri|vprop|vnsup|gamma|Gamma|wedge|xodot|bdquo|srarr|doteq|ldquo|boxdl|boxdL|gcirc|Gcirc|boxDl|boxDL|boxdr|boxdR|boxDr|TRADE|trade|rlhar|boxDR|vnsub|npart|vltri|rlarr|boxhd|boxhD|nprec|gescc|nrarr|nrArr|boxHd|boxHD|boxhu|boxhU|nrtri|boxHu|clubs|boxHU|times|colon|Colon|gimel|xlArr|Tilde|nsime|tilde|nsmid|nspar|THORN|thorn|xlarr|nsube|nsubE|thkap|xhArr|comma|nsucc|boxul|boxuL|nsupe|nsupE|gneqq|gnsim|boxUl|boxUL|grave|boxur|boxuR|boxUr|boxUR|lescc|angle|bepsi|boxvh|varpi|boxvH|numsp|Theta|gsime|gsiml|theta|boxVh|boxVH|boxvl|gtcir|gtdot|boxvL|boxVl|boxVL|crarr|cross|Cross|nvsim|boxvr|nwarr|nwArr|sqsup|dtdot|Uogon|lhard|lharu|dtrif|ocirc|Ocirc|lhblk|duarr|odash|sqsub|Hacek|sqcup|llarr|duhar|oelig|OElig|ofcir|boxvR|uogon|lltri|boxVr|csube|uuarr|ohbar|csupe|ctdot|olarr|olcir|harrw|oline|sqcap|omacr|Omacr|omega|Omega|boxVR|aleph|lneqq|lnsim|loang|loarr|rharu|lobrk|hcirc|operp|oplus|rhard|Hcirc|orarr|Union|order|ecirc|Ecirc|cuepr|szlig|cuesc|breve|reals|eDDot|Breve|hoarr|lopar|utrif|rdquo|Umacr|umacr|efDot|swArr|ultri|alpha|rceil|ovbar|swarr|Wcirc|wcirc|smtes|smile|bsemi|lrarr|aring|parsl|lrhar|bsime|uhblk|lrtri|cupor|Aring|uharr|uharl|slarr|rbrke|bsolb|lsime|rbbrk|RBarr|lsimg|phone|rBarr|rbarr|icirc|lsquo|Icirc|emacr|Emacr|ratio|simne|plusb|simlE|simgE|simeq|pluse|ltcir|ltdot|empty|xharr|xdtri|iexcl|Alpha|ltrie|rarrw|pound|ltrif|xcirc|bumpe|prcue|bumpE|asymp|amacr|cuvee|Sigma|sigma|iiint|udhar|iiota|ijlig|IJlig|supnE|imacr|Imacr|prime|Prime|image|prnap|eogon|Eogon|rarrc|mdash|mDDot|cuwed|imath|supne|imped|Amacr|udarr|prsim|micro|rarrb|cwint|raquo|infin|eplus|range|rangd|Ucirc|radic|minus|amalg|veeeq|rAarr|epsiv|ycirc|quest|sharp|quot|zwnj|Qscr|race|qscr|Qopf|qopf|qint|rang|Rang|Zscr|zscr|Zopf|zopf|rarr|rArr|Rarr|Pscr|pscr|prop|prod|prnE|prec|ZHcy|zhcy|prap|Zeta|zeta|Popf|popf|Zdot|plus|zdot|Yuml|yuml|phiv|YUcy|yucy|Yscr|yscr|perp|Yopf|yopf|part|para|YIcy|Ouml|rcub|yicy|YAcy|rdca|ouml|osol|Oscr|rdsh|yacy|real|oscr|xvee|andd|rect|andv|Xscr|oror|ordm|ordf|xscr|ange|aopf|Aopf|rHar|Xopf|opar|Oopf|xopf|xnis|rhov|oopf|omid|xmap|oint|apid|apos|ogon|ascr|Ascr|odot|odiv|xcup|xcap|ocir|oast|nvlt|nvle|nvgt|nvge|nvap|Wscr|wscr|auml|ntlg|ntgl|nsup|nsub|nsim|Nscr|nscr|nsce|Wopf|ring|npre|wopf|npar|Auml|Barv|bbrk|Nopf|nopf|nmid|nLtv|beta|ropf|Ropf|Beta|beth|nles|rpar|nleq|bnot|bNot|nldr|NJcy|rscr|Rscr|Vscr|vscr|rsqb|njcy|bopf|nisd|Bopf|rtri|Vopf|nGtv|ngtr|vopf|boxh|boxH|boxv|nges|ngeq|boxV|bscr|scap|Bscr|bsim|Vert|vert|bsol|bull|bump|caps|cdot|ncup|scnE|ncap|nbsp|napE|Cdot|cent|sdot|Vbar|nang|vBar|chcy|Mscr|mscr|sect|semi|CHcy|Mopf|mopf|sext|circ|cire|mldr|mlcp|cirE|comp|shcy|SHcy|vArr|varr|cong|copf|Copf|copy|COPY|malt|male|macr|lvnE|cscr|ltri|sime|ltcc|simg|Cscr|siml|csub|Uuml|lsqb|lsim|uuml|csup|Lscr|lscr|utri|smid|lpar|cups|smte|lozf|darr|Lopf|Uscr|solb|lopf|sopf|Sopf|lneq|uscr|spar|dArr|lnap|Darr|dash|Sqrt|LJcy|ljcy|lHar|dHar|Upsi|upsi|diam|lesg|djcy|DJcy|leqq|dopf|Dopf|dscr|Dscr|dscy|ldsh|ldca|squf|DScy|sscr|Sscr|dsol|lcub|late|star|Star|Uopf|Larr|lArr|larr|uopf|dtri|dzcy|sube|subE|Lang|lang|Kscr|kscr|Kopf|kopf|KJcy|kjcy|KHcy|khcy|DZcy|ecir|edot|eDot|Jscr|jscr|succ|Jopf|jopf|Edot|uHar|emsp|ensp|Iuml|iuml|eopf|isin|Iscr|iscr|Eopf|epar|sung|epsi|escr|sup1|sup2|sup3|Iota|iota|supe|supE|Iopf|iopf|IOcy|iocy|Escr|esim|Esim|imof|Uarr|QUOT|uArr|uarr|euml|IEcy|iecy|Idot|Euml|euro|excl|Hscr|hscr|Hopf|hopf|TScy|tscy|Tscr|hbar|tscr|flat|tbrk|fnof|hArr|harr|half|fopf|Fopf|tdot|gvnE|fork|trie|gtcc|fscr|Fscr|gdot|gsim|Gscr|gscr|Gopf|gopf|gneq|Gdot|tosa|gnap|Topf|topf|geqq|toea|GJcy|gjcy|tint|gesl|mid|Sfr|ggg|top|ges|gla|glE|glj|geq|gne|gEl|gel|gnE|Gcy|gcy|gap|Tfr|tfr|Tcy|tcy|Hat|Tau|Ffr|tau|Tab|hfr|Hfr|ffr|Fcy|fcy|icy|Icy|iff|ETH|eth|ifr|Ifr|Eta|eta|int|Int|Sup|sup|ucy|Ucy|Sum|sum|jcy|ENG|ufr|Ufr|eng|Jcy|jfr|els|ell|egs|Efr|efr|Jfr|uml|kcy|Kcy|Ecy|ecy|kfr|Kfr|lap|Sub|sub|lat|lcy|Lcy|leg|Dot|dot|lEg|leq|les|squ|div|die|lfr|Lfr|lgE|Dfr|dfr|Del|deg|Dcy|dcy|lne|lnE|sol|loz|smt|Cup|lrm|cup|lsh|Lsh|sim|shy|map|Map|mcy|Mcy|mfr|Mfr|mho|gfr|Gfr|sfr|cir|Chi|chi|nap|Cfr|vcy|Vcy|cfr|Scy|scy|ncy|Ncy|vee|Vee|Cap|cap|nfr|scE|sce|Nfr|nge|ngE|nGg|vfr|Vfr|ngt|bot|nGt|nis|niv|Rsh|rsh|nle|nlE|bne|Bfr|bfr|nLl|nlt|nLt|Bcy|bcy|not|Not|rlm|wfr|Wfr|npr|nsc|num|ocy|ast|Ocy|ofr|xfr|Xfr|Ofr|ogt|ohm|apE|olt|Rho|ape|rho|Rfr|rfr|ord|REG|ang|reg|orv|And|and|AMP|Rcy|amp|Afr|ycy|Ycy|yen|yfr|Yfr|rcy|par|pcy|Pcy|pfr|Pfr|phi|Phi|afr|Acy|acy|zcy|Zcy|piv|acE|acd|zfr|Zfr|pre|prE|psi|Psi|qfr|Qfr|zwj|Or|ge|Gg|gt|gg|el|oS|lt|Lt|LT|Re|lg|gl|eg|ne|Im|it|le|DD|wp|wr|nu|Nu|dd|lE|Sc|sc|pi|Pi|ee|af|ll|Ll|rx|gE|xi|pm|Xi|ic|pr|Pr|in|ni|mp|mu|ac|Mu|or|ap|Gt|GT|ii);|&(Aacute|Agrave|Atilde|Ccedil|Eacute|Egrave|Iacute|Igrave|Ntilde|Oacute|Ograve|Oslash|Otilde|Uacute|Ugrave|Yacute|aacute|agrave|atilde|brvbar|ccedil|curren|divide|eacute|egrave|frac12|frac14|frac34|iacute|igrave|iquest|middot|ntilde|oacute|ograve|oslash|otilde|plusmn|uacute|ugrave|yacute|AElig|Acirc|Aring|Ecirc|Icirc|Ocirc|THORN|Ucirc|acirc|acute|aelig|aring|cedil|ecirc|icirc|iexcl|laquo|micro|ocirc|pound|raquo|szlig|thorn|times|ucirc|Auml|COPY|Euml|Iuml|Ouml|QUOT|Uuml|auml|cent|copy|euml|iuml|macr|nbsp|ordf|ordm|ouml|para|quot|sect|sup1|sup2|sup3|uuml|yuml|AMP|ETH|REG|amp|deg|eth|not|reg|shy|uml|yen|GT|LT|gt|lt)(?!;)([=a-zA-Z0-9]?)|&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+)/g;
	var decodeMap = {'aacute':'\xE1','Aacute':'\xC1','abreve':'\u0103','Abreve':'\u0102','ac':'\u223E','acd':'\u223F','acE':'\u223E\u0333','acirc':'\xE2','Acirc':'\xC2','acute':'\xB4','acy':'\u0430','Acy':'\u0410','aelig':'\xE6','AElig':'\xC6','af':'\u2061','afr':'\uD835\uDD1E','Afr':'\uD835\uDD04','agrave':'\xE0','Agrave':'\xC0','alefsym':'\u2135','aleph':'\u2135','alpha':'\u03B1','Alpha':'\u0391','amacr':'\u0101','Amacr':'\u0100','amalg':'\u2A3F','amp':'&','AMP':'&','and':'\u2227','And':'\u2A53','andand':'\u2A55','andd':'\u2A5C','andslope':'\u2A58','andv':'\u2A5A','ang':'\u2220','ange':'\u29A4','angle':'\u2220','angmsd':'\u2221','angmsdaa':'\u29A8','angmsdab':'\u29A9','angmsdac':'\u29AA','angmsdad':'\u29AB','angmsdae':'\u29AC','angmsdaf':'\u29AD','angmsdag':'\u29AE','angmsdah':'\u29AF','angrt':'\u221F','angrtvb':'\u22BE','angrtvbd':'\u299D','angsph':'\u2222','angst':'\xC5','angzarr':'\u237C','aogon':'\u0105','Aogon':'\u0104','aopf':'\uD835\uDD52','Aopf':'\uD835\uDD38','ap':'\u2248','apacir':'\u2A6F','ape':'\u224A','apE':'\u2A70','apid':'\u224B','apos':'\'','ApplyFunction':'\u2061','approx':'\u2248','approxeq':'\u224A','aring':'\xE5','Aring':'\xC5','ascr':'\uD835\uDCB6','Ascr':'\uD835\uDC9C','Assign':'\u2254','ast':'*','asymp':'\u2248','asympeq':'\u224D','atilde':'\xE3','Atilde':'\xC3','auml':'\xE4','Auml':'\xC4','awconint':'\u2233','awint':'\u2A11','backcong':'\u224C','backepsilon':'\u03F6','backprime':'\u2035','backsim':'\u223D','backsimeq':'\u22CD','Backslash':'\u2216','Barv':'\u2AE7','barvee':'\u22BD','barwed':'\u2305','Barwed':'\u2306','barwedge':'\u2305','bbrk':'\u23B5','bbrktbrk':'\u23B6','bcong':'\u224C','bcy':'\u0431','Bcy':'\u0411','bdquo':'\u201E','becaus':'\u2235','because':'\u2235','Because':'\u2235','bemptyv':'\u29B0','bepsi':'\u03F6','bernou':'\u212C','Bernoullis':'\u212C','beta':'\u03B2','Beta':'\u0392','beth':'\u2136','between':'\u226C','bfr':'\uD835\uDD1F','Bfr':'\uD835\uDD05','bigcap':'\u22C2','bigcirc':'\u25EF','bigcup':'\u22C3','bigodot':'\u2A00','bigoplus':'\u2A01','bigotimes':'\u2A02','bigsqcup':'\u2A06','bigstar':'\u2605','bigtriangledown':'\u25BD','bigtriangleup':'\u25B3','biguplus':'\u2A04','bigvee':'\u22C1','bigwedge':'\u22C0','bkarow':'\u290D','blacklozenge':'\u29EB','blacksquare':'\u25AA','blacktriangle':'\u25B4','blacktriangledown':'\u25BE','blacktriangleleft':'\u25C2','blacktriangleright':'\u25B8','blank':'\u2423','blk12':'\u2592','blk14':'\u2591','blk34':'\u2593','block':'\u2588','bne':'=\u20E5','bnequiv':'\u2261\u20E5','bnot':'\u2310','bNot':'\u2AED','bopf':'\uD835\uDD53','Bopf':'\uD835\uDD39','bot':'\u22A5','bottom':'\u22A5','bowtie':'\u22C8','boxbox':'\u29C9','boxdl':'\u2510','boxdL':'\u2555','boxDl':'\u2556','boxDL':'\u2557','boxdr':'\u250C','boxdR':'\u2552','boxDr':'\u2553','boxDR':'\u2554','boxh':'\u2500','boxH':'\u2550','boxhd':'\u252C','boxhD':'\u2565','boxHd':'\u2564','boxHD':'\u2566','boxhu':'\u2534','boxhU':'\u2568','boxHu':'\u2567','boxHU':'\u2569','boxminus':'\u229F','boxplus':'\u229E','boxtimes':'\u22A0','boxul':'\u2518','boxuL':'\u255B','boxUl':'\u255C','boxUL':'\u255D','boxur':'\u2514','boxuR':'\u2558','boxUr':'\u2559','boxUR':'\u255A','boxv':'\u2502','boxV':'\u2551','boxvh':'\u253C','boxvH':'\u256A','boxVh':'\u256B','boxVH':'\u256C','boxvl':'\u2524','boxvL':'\u2561','boxVl':'\u2562','boxVL':'\u2563','boxvr':'\u251C','boxvR':'\u255E','boxVr':'\u255F','boxVR':'\u2560','bprime':'\u2035','breve':'\u02D8','Breve':'\u02D8','brvbar':'\xA6','bscr':'\uD835\uDCB7','Bscr':'\u212C','bsemi':'\u204F','bsim':'\u223D','bsime':'\u22CD','bsol':'\\','bsolb':'\u29C5','bsolhsub':'\u27C8','bull':'\u2022','bullet':'\u2022','bump':'\u224E','bumpe':'\u224F','bumpE':'\u2AAE','bumpeq':'\u224F','Bumpeq':'\u224E','cacute':'\u0107','Cacute':'\u0106','cap':'\u2229','Cap':'\u22D2','capand':'\u2A44','capbrcup':'\u2A49','capcap':'\u2A4B','capcup':'\u2A47','capdot':'\u2A40','CapitalDifferentialD':'\u2145','caps':'\u2229\uFE00','caret':'\u2041','caron':'\u02C7','Cayleys':'\u212D','ccaps':'\u2A4D','ccaron':'\u010D','Ccaron':'\u010C','ccedil':'\xE7','Ccedil':'\xC7','ccirc':'\u0109','Ccirc':'\u0108','Cconint':'\u2230','ccups':'\u2A4C','ccupssm':'\u2A50','cdot':'\u010B','Cdot':'\u010A','cedil':'\xB8','Cedilla':'\xB8','cemptyv':'\u29B2','cent':'\xA2','centerdot':'\xB7','CenterDot':'\xB7','cfr':'\uD835\uDD20','Cfr':'\u212D','chcy':'\u0447','CHcy':'\u0427','check':'\u2713','checkmark':'\u2713','chi':'\u03C7','Chi':'\u03A7','cir':'\u25CB','circ':'\u02C6','circeq':'\u2257','circlearrowleft':'\u21BA','circlearrowright':'\u21BB','circledast':'\u229B','circledcirc':'\u229A','circleddash':'\u229D','CircleDot':'\u2299','circledR':'\xAE','circledS':'\u24C8','CircleMinus':'\u2296','CirclePlus':'\u2295','CircleTimes':'\u2297','cire':'\u2257','cirE':'\u29C3','cirfnint':'\u2A10','cirmid':'\u2AEF','cirscir':'\u29C2','ClockwiseContourIntegral':'\u2232','CloseCurlyDoubleQuote':'\u201D','CloseCurlyQuote':'\u2019','clubs':'\u2663','clubsuit':'\u2663','colon':':','Colon':'\u2237','colone':'\u2254','Colone':'\u2A74','coloneq':'\u2254','comma':',','commat':'@','comp':'\u2201','compfn':'\u2218','complement':'\u2201','complexes':'\u2102','cong':'\u2245','congdot':'\u2A6D','Congruent':'\u2261','conint':'\u222E','Conint':'\u222F','ContourIntegral':'\u222E','copf':'\uD835\uDD54','Copf':'\u2102','coprod':'\u2210','Coproduct':'\u2210','copy':'\xA9','COPY':'\xA9','copysr':'\u2117','CounterClockwiseContourIntegral':'\u2233','crarr':'\u21B5','cross':'\u2717','Cross':'\u2A2F','cscr':'\uD835\uDCB8','Cscr':'\uD835\uDC9E','csub':'\u2ACF','csube':'\u2AD1','csup':'\u2AD0','csupe':'\u2AD2','ctdot':'\u22EF','cudarrl':'\u2938','cudarrr':'\u2935','cuepr':'\u22DE','cuesc':'\u22DF','cularr':'\u21B6','cularrp':'\u293D','cup':'\u222A','Cup':'\u22D3','cupbrcap':'\u2A48','cupcap':'\u2A46','CupCap':'\u224D','cupcup':'\u2A4A','cupdot':'\u228D','cupor':'\u2A45','cups':'\u222A\uFE00','curarr':'\u21B7','curarrm':'\u293C','curlyeqprec':'\u22DE','curlyeqsucc':'\u22DF','curlyvee':'\u22CE','curlywedge':'\u22CF','curren':'\xA4','curvearrowleft':'\u21B6','curvearrowright':'\u21B7','cuvee':'\u22CE','cuwed':'\u22CF','cwconint':'\u2232','cwint':'\u2231','cylcty':'\u232D','dagger':'\u2020','Dagger':'\u2021','daleth':'\u2138','darr':'\u2193','dArr':'\u21D3','Darr':'\u21A1','dash':'\u2010','dashv':'\u22A3','Dashv':'\u2AE4','dbkarow':'\u290F','dblac':'\u02DD','dcaron':'\u010F','Dcaron':'\u010E','dcy':'\u0434','Dcy':'\u0414','dd':'\u2146','DD':'\u2145','ddagger':'\u2021','ddarr':'\u21CA','DDotrahd':'\u2911','ddotseq':'\u2A77','deg':'\xB0','Del':'\u2207','delta':'\u03B4','Delta':'\u0394','demptyv':'\u29B1','dfisht':'\u297F','dfr':'\uD835\uDD21','Dfr':'\uD835\uDD07','dHar':'\u2965','dharl':'\u21C3','dharr':'\u21C2','DiacriticalAcute':'\xB4','DiacriticalDot':'\u02D9','DiacriticalDoubleAcute':'\u02DD','DiacriticalGrave':'`','DiacriticalTilde':'\u02DC','diam':'\u22C4','diamond':'\u22C4','Diamond':'\u22C4','diamondsuit':'\u2666','diams':'\u2666','die':'\xA8','DifferentialD':'\u2146','digamma':'\u03DD','disin':'\u22F2','div':'\xF7','divide':'\xF7','divideontimes':'\u22C7','divonx':'\u22C7','djcy':'\u0452','DJcy':'\u0402','dlcorn':'\u231E','dlcrop':'\u230D','dollar':'$','dopf':'\uD835\uDD55','Dopf':'\uD835\uDD3B','dot':'\u02D9','Dot':'\xA8','DotDot':'\u20DC','doteq':'\u2250','doteqdot':'\u2251','DotEqual':'\u2250','dotminus':'\u2238','dotplus':'\u2214','dotsquare':'\u22A1','doublebarwedge':'\u2306','DoubleContourIntegral':'\u222F','DoubleDot':'\xA8','DoubleDownArrow':'\u21D3','DoubleLeftArrow':'\u21D0','DoubleLeftRightArrow':'\u21D4','DoubleLeftTee':'\u2AE4','DoubleLongLeftArrow':'\u27F8','DoubleLongLeftRightArrow':'\u27FA','DoubleLongRightArrow':'\u27F9','DoubleRightArrow':'\u21D2','DoubleRightTee':'\u22A8','DoubleUpArrow':'\u21D1','DoubleUpDownArrow':'\u21D5','DoubleVerticalBar':'\u2225','downarrow':'\u2193','Downarrow':'\u21D3','DownArrow':'\u2193','DownArrowBar':'\u2913','DownArrowUpArrow':'\u21F5','DownBreve':'\u0311','downdownarrows':'\u21CA','downharpoonleft':'\u21C3','downharpoonright':'\u21C2','DownLeftRightVector':'\u2950','DownLeftTeeVector':'\u295E','DownLeftVector':'\u21BD','DownLeftVectorBar':'\u2956','DownRightTeeVector':'\u295F','DownRightVector':'\u21C1','DownRightVectorBar':'\u2957','DownTee':'\u22A4','DownTeeArrow':'\u21A7','drbkarow':'\u2910','drcorn':'\u231F','drcrop':'\u230C','dscr':'\uD835\uDCB9','Dscr':'\uD835\uDC9F','dscy':'\u0455','DScy':'\u0405','dsol':'\u29F6','dstrok':'\u0111','Dstrok':'\u0110','dtdot':'\u22F1','dtri':'\u25BF','dtrif':'\u25BE','duarr':'\u21F5','duhar':'\u296F','dwangle':'\u29A6','dzcy':'\u045F','DZcy':'\u040F','dzigrarr':'\u27FF','eacute':'\xE9','Eacute':'\xC9','easter':'\u2A6E','ecaron':'\u011B','Ecaron':'\u011A','ecir':'\u2256','ecirc':'\xEA','Ecirc':'\xCA','ecolon':'\u2255','ecy':'\u044D','Ecy':'\u042D','eDDot':'\u2A77','edot':'\u0117','eDot':'\u2251','Edot':'\u0116','ee':'\u2147','efDot':'\u2252','efr':'\uD835\uDD22','Efr':'\uD835\uDD08','eg':'\u2A9A','egrave':'\xE8','Egrave':'\xC8','egs':'\u2A96','egsdot':'\u2A98','el':'\u2A99','Element':'\u2208','elinters':'\u23E7','ell':'\u2113','els':'\u2A95','elsdot':'\u2A97','emacr':'\u0113','Emacr':'\u0112','empty':'\u2205','emptyset':'\u2205','EmptySmallSquare':'\u25FB','emptyv':'\u2205','EmptyVerySmallSquare':'\u25AB','emsp':'\u2003','emsp13':'\u2004','emsp14':'\u2005','eng':'\u014B','ENG':'\u014A','ensp':'\u2002','eogon':'\u0119','Eogon':'\u0118','eopf':'\uD835\uDD56','Eopf':'\uD835\uDD3C','epar':'\u22D5','eparsl':'\u29E3','eplus':'\u2A71','epsi':'\u03B5','epsilon':'\u03B5','Epsilon':'\u0395','epsiv':'\u03F5','eqcirc':'\u2256','eqcolon':'\u2255','eqsim':'\u2242','eqslantgtr':'\u2A96','eqslantless':'\u2A95','Equal':'\u2A75','equals':'=','EqualTilde':'\u2242','equest':'\u225F','Equilibrium':'\u21CC','equiv':'\u2261','equivDD':'\u2A78','eqvparsl':'\u29E5','erarr':'\u2971','erDot':'\u2253','escr':'\u212F','Escr':'\u2130','esdot':'\u2250','esim':'\u2242','Esim':'\u2A73','eta':'\u03B7','Eta':'\u0397','eth':'\xF0','ETH':'\xD0','euml':'\xEB','Euml':'\xCB','euro':'\u20AC','excl':'!','exist':'\u2203','Exists':'\u2203','expectation':'\u2130','exponentiale':'\u2147','ExponentialE':'\u2147','fallingdotseq':'\u2252','fcy':'\u0444','Fcy':'\u0424','female':'\u2640','ffilig':'\uFB03','fflig':'\uFB00','ffllig':'\uFB04','ffr':'\uD835\uDD23','Ffr':'\uD835\uDD09','filig':'\uFB01','FilledSmallSquare':'\u25FC','FilledVerySmallSquare':'\u25AA','fjlig':'fj','flat':'\u266D','fllig':'\uFB02','fltns':'\u25B1','fnof':'\u0192','fopf':'\uD835\uDD57','Fopf':'\uD835\uDD3D','forall':'\u2200','ForAll':'\u2200','fork':'\u22D4','forkv':'\u2AD9','Fouriertrf':'\u2131','fpartint':'\u2A0D','frac12':'\xBD','frac13':'\u2153','frac14':'\xBC','frac15':'\u2155','frac16':'\u2159','frac18':'\u215B','frac23':'\u2154','frac25':'\u2156','frac34':'\xBE','frac35':'\u2157','frac38':'\u215C','frac45':'\u2158','frac56':'\u215A','frac58':'\u215D','frac78':'\u215E','frasl':'\u2044','frown':'\u2322','fscr':'\uD835\uDCBB','Fscr':'\u2131','gacute':'\u01F5','gamma':'\u03B3','Gamma':'\u0393','gammad':'\u03DD','Gammad':'\u03DC','gap':'\u2A86','gbreve':'\u011F','Gbreve':'\u011E','Gcedil':'\u0122','gcirc':'\u011D','Gcirc':'\u011C','gcy':'\u0433','Gcy':'\u0413','gdot':'\u0121','Gdot':'\u0120','ge':'\u2265','gE':'\u2267','gel':'\u22DB','gEl':'\u2A8C','geq':'\u2265','geqq':'\u2267','geqslant':'\u2A7E','ges':'\u2A7E','gescc':'\u2AA9','gesdot':'\u2A80','gesdoto':'\u2A82','gesdotol':'\u2A84','gesl':'\u22DB\uFE00','gesles':'\u2A94','gfr':'\uD835\uDD24','Gfr':'\uD835\uDD0A','gg':'\u226B','Gg':'\u22D9','ggg':'\u22D9','gimel':'\u2137','gjcy':'\u0453','GJcy':'\u0403','gl':'\u2277','gla':'\u2AA5','glE':'\u2A92','glj':'\u2AA4','gnap':'\u2A8A','gnapprox':'\u2A8A','gne':'\u2A88','gnE':'\u2269','gneq':'\u2A88','gneqq':'\u2269','gnsim':'\u22E7','gopf':'\uD835\uDD58','Gopf':'\uD835\uDD3E','grave':'`','GreaterEqual':'\u2265','GreaterEqualLess':'\u22DB','GreaterFullEqual':'\u2267','GreaterGreater':'\u2AA2','GreaterLess':'\u2277','GreaterSlantEqual':'\u2A7E','GreaterTilde':'\u2273','gscr':'\u210A','Gscr':'\uD835\uDCA2','gsim':'\u2273','gsime':'\u2A8E','gsiml':'\u2A90','gt':'>','Gt':'\u226B','GT':'>','gtcc':'\u2AA7','gtcir':'\u2A7A','gtdot':'\u22D7','gtlPar':'\u2995','gtquest':'\u2A7C','gtrapprox':'\u2A86','gtrarr':'\u2978','gtrdot':'\u22D7','gtreqless':'\u22DB','gtreqqless':'\u2A8C','gtrless':'\u2277','gtrsim':'\u2273','gvertneqq':'\u2269\uFE00','gvnE':'\u2269\uFE00','Hacek':'\u02C7','hairsp':'\u200A','half':'\xBD','hamilt':'\u210B','hardcy':'\u044A','HARDcy':'\u042A','harr':'\u2194','hArr':'\u21D4','harrcir':'\u2948','harrw':'\u21AD','Hat':'^','hbar':'\u210F','hcirc':'\u0125','Hcirc':'\u0124','hearts':'\u2665','heartsuit':'\u2665','hellip':'\u2026','hercon':'\u22B9','hfr':'\uD835\uDD25','Hfr':'\u210C','HilbertSpace':'\u210B','hksearow':'\u2925','hkswarow':'\u2926','hoarr':'\u21FF','homtht':'\u223B','hookleftarrow':'\u21A9','hookrightarrow':'\u21AA','hopf':'\uD835\uDD59','Hopf':'\u210D','horbar':'\u2015','HorizontalLine':'\u2500','hscr':'\uD835\uDCBD','Hscr':'\u210B','hslash':'\u210F','hstrok':'\u0127','Hstrok':'\u0126','HumpDownHump':'\u224E','HumpEqual':'\u224F','hybull':'\u2043','hyphen':'\u2010','iacute':'\xED','Iacute':'\xCD','ic':'\u2063','icirc':'\xEE','Icirc':'\xCE','icy':'\u0438','Icy':'\u0418','Idot':'\u0130','iecy':'\u0435','IEcy':'\u0415','iexcl':'\xA1','iff':'\u21D4','ifr':'\uD835\uDD26','Ifr':'\u2111','igrave':'\xEC','Igrave':'\xCC','ii':'\u2148','iiiint':'\u2A0C','iiint':'\u222D','iinfin':'\u29DC','iiota':'\u2129','ijlig':'\u0133','IJlig':'\u0132','Im':'\u2111','imacr':'\u012B','Imacr':'\u012A','image':'\u2111','ImaginaryI':'\u2148','imagline':'\u2110','imagpart':'\u2111','imath':'\u0131','imof':'\u22B7','imped':'\u01B5','Implies':'\u21D2','in':'\u2208','incare':'\u2105','infin':'\u221E','infintie':'\u29DD','inodot':'\u0131','int':'\u222B','Int':'\u222C','intcal':'\u22BA','integers':'\u2124','Integral':'\u222B','intercal':'\u22BA','Intersection':'\u22C2','intlarhk':'\u2A17','intprod':'\u2A3C','InvisibleComma':'\u2063','InvisibleTimes':'\u2062','iocy':'\u0451','IOcy':'\u0401','iogon':'\u012F','Iogon':'\u012E','iopf':'\uD835\uDD5A','Iopf':'\uD835\uDD40','iota':'\u03B9','Iota':'\u0399','iprod':'\u2A3C','iquest':'\xBF','iscr':'\uD835\uDCBE','Iscr':'\u2110','isin':'\u2208','isindot':'\u22F5','isinE':'\u22F9','isins':'\u22F4','isinsv':'\u22F3','isinv':'\u2208','it':'\u2062','itilde':'\u0129','Itilde':'\u0128','iukcy':'\u0456','Iukcy':'\u0406','iuml':'\xEF','Iuml':'\xCF','jcirc':'\u0135','Jcirc':'\u0134','jcy':'\u0439','Jcy':'\u0419','jfr':'\uD835\uDD27','Jfr':'\uD835\uDD0D','jmath':'\u0237','jopf':'\uD835\uDD5B','Jopf':'\uD835\uDD41','jscr':'\uD835\uDCBF','Jscr':'\uD835\uDCA5','jsercy':'\u0458','Jsercy':'\u0408','jukcy':'\u0454','Jukcy':'\u0404','kappa':'\u03BA','Kappa':'\u039A','kappav':'\u03F0','kcedil':'\u0137','Kcedil':'\u0136','kcy':'\u043A','Kcy':'\u041A','kfr':'\uD835\uDD28','Kfr':'\uD835\uDD0E','kgreen':'\u0138','khcy':'\u0445','KHcy':'\u0425','kjcy':'\u045C','KJcy':'\u040C','kopf':'\uD835\uDD5C','Kopf':'\uD835\uDD42','kscr':'\uD835\uDCC0','Kscr':'\uD835\uDCA6','lAarr':'\u21DA','lacute':'\u013A','Lacute':'\u0139','laemptyv':'\u29B4','lagran':'\u2112','lambda':'\u03BB','Lambda':'\u039B','lang':'\u27E8','Lang':'\u27EA','langd':'\u2991','langle':'\u27E8','lap':'\u2A85','Laplacetrf':'\u2112','laquo':'\xAB','larr':'\u2190','lArr':'\u21D0','Larr':'\u219E','larrb':'\u21E4','larrbfs':'\u291F','larrfs':'\u291D','larrhk':'\u21A9','larrlp':'\u21AB','larrpl':'\u2939','larrsim':'\u2973','larrtl':'\u21A2','lat':'\u2AAB','latail':'\u2919','lAtail':'\u291B','late':'\u2AAD','lates':'\u2AAD\uFE00','lbarr':'\u290C','lBarr':'\u290E','lbbrk':'\u2772','lbrace':'{','lbrack':'[','lbrke':'\u298B','lbrksld':'\u298F','lbrkslu':'\u298D','lcaron':'\u013E','Lcaron':'\u013D','lcedil':'\u013C','Lcedil':'\u013B','lceil':'\u2308','lcub':'{','lcy':'\u043B','Lcy':'\u041B','ldca':'\u2936','ldquo':'\u201C','ldquor':'\u201E','ldrdhar':'\u2967','ldrushar':'\u294B','ldsh':'\u21B2','le':'\u2264','lE':'\u2266','LeftAngleBracket':'\u27E8','leftarrow':'\u2190','Leftarrow':'\u21D0','LeftArrow':'\u2190','LeftArrowBar':'\u21E4','LeftArrowRightArrow':'\u21C6','leftarrowtail':'\u21A2','LeftCeiling':'\u2308','LeftDoubleBracket':'\u27E6','LeftDownTeeVector':'\u2961','LeftDownVector':'\u21C3','LeftDownVectorBar':'\u2959','LeftFloor':'\u230A','leftharpoondown':'\u21BD','leftharpoonup':'\u21BC','leftleftarrows':'\u21C7','leftrightarrow':'\u2194','Leftrightarrow':'\u21D4','LeftRightArrow':'\u2194','leftrightarrows':'\u21C6','leftrightharpoons':'\u21CB','leftrightsquigarrow':'\u21AD','LeftRightVector':'\u294E','LeftTee':'\u22A3','LeftTeeArrow':'\u21A4','LeftTeeVector':'\u295A','leftthreetimes':'\u22CB','LeftTriangle':'\u22B2','LeftTriangleBar':'\u29CF','LeftTriangleEqual':'\u22B4','LeftUpDownVector':'\u2951','LeftUpTeeVector':'\u2960','LeftUpVector':'\u21BF','LeftUpVectorBar':'\u2958','LeftVector':'\u21BC','LeftVectorBar':'\u2952','leg':'\u22DA','lEg':'\u2A8B','leq':'\u2264','leqq':'\u2266','leqslant':'\u2A7D','les':'\u2A7D','lescc':'\u2AA8','lesdot':'\u2A7F','lesdoto':'\u2A81','lesdotor':'\u2A83','lesg':'\u22DA\uFE00','lesges':'\u2A93','lessapprox':'\u2A85','lessdot':'\u22D6','lesseqgtr':'\u22DA','lesseqqgtr':'\u2A8B','LessEqualGreater':'\u22DA','LessFullEqual':'\u2266','LessGreater':'\u2276','lessgtr':'\u2276','LessLess':'\u2AA1','lesssim':'\u2272','LessSlantEqual':'\u2A7D','LessTilde':'\u2272','lfisht':'\u297C','lfloor':'\u230A','lfr':'\uD835\uDD29','Lfr':'\uD835\uDD0F','lg':'\u2276','lgE':'\u2A91','lHar':'\u2962','lhard':'\u21BD','lharu':'\u21BC','lharul':'\u296A','lhblk':'\u2584','ljcy':'\u0459','LJcy':'\u0409','ll':'\u226A','Ll':'\u22D8','llarr':'\u21C7','llcorner':'\u231E','Lleftarrow':'\u21DA','llhard':'\u296B','lltri':'\u25FA','lmidot':'\u0140','Lmidot':'\u013F','lmoust':'\u23B0','lmoustache':'\u23B0','lnap':'\u2A89','lnapprox':'\u2A89','lne':'\u2A87','lnE':'\u2268','lneq':'\u2A87','lneqq':'\u2268','lnsim':'\u22E6','loang':'\u27EC','loarr':'\u21FD','lobrk':'\u27E6','longleftarrow':'\u27F5','Longleftarrow':'\u27F8','LongLeftArrow':'\u27F5','longleftrightarrow':'\u27F7','Longleftrightarrow':'\u27FA','LongLeftRightArrow':'\u27F7','longmapsto':'\u27FC','longrightarrow':'\u27F6','Longrightarrow':'\u27F9','LongRightArrow':'\u27F6','looparrowleft':'\u21AB','looparrowright':'\u21AC','lopar':'\u2985','lopf':'\uD835\uDD5D','Lopf':'\uD835\uDD43','loplus':'\u2A2D','lotimes':'\u2A34','lowast':'\u2217','lowbar':'_','LowerLeftArrow':'\u2199','LowerRightArrow':'\u2198','loz':'\u25CA','lozenge':'\u25CA','lozf':'\u29EB','lpar':'(','lparlt':'\u2993','lrarr':'\u21C6','lrcorner':'\u231F','lrhar':'\u21CB','lrhard':'\u296D','lrm':'\u200E','lrtri':'\u22BF','lsaquo':'\u2039','lscr':'\uD835\uDCC1','Lscr':'\u2112','lsh':'\u21B0','Lsh':'\u21B0','lsim':'\u2272','lsime':'\u2A8D','lsimg':'\u2A8F','lsqb':'[','lsquo':'\u2018','lsquor':'\u201A','lstrok':'\u0142','Lstrok':'\u0141','lt':'<','Lt':'\u226A','LT':'<','ltcc':'\u2AA6','ltcir':'\u2A79','ltdot':'\u22D6','lthree':'\u22CB','ltimes':'\u22C9','ltlarr':'\u2976','ltquest':'\u2A7B','ltri':'\u25C3','ltrie':'\u22B4','ltrif':'\u25C2','ltrPar':'\u2996','lurdshar':'\u294A','luruhar':'\u2966','lvertneqq':'\u2268\uFE00','lvnE':'\u2268\uFE00','macr':'\xAF','male':'\u2642','malt':'\u2720','maltese':'\u2720','map':'\u21A6','Map':'\u2905','mapsto':'\u21A6','mapstodown':'\u21A7','mapstoleft':'\u21A4','mapstoup':'\u21A5','marker':'\u25AE','mcomma':'\u2A29','mcy':'\u043C','Mcy':'\u041C','mdash':'\u2014','mDDot':'\u223A','measuredangle':'\u2221','MediumSpace':'\u205F','Mellintrf':'\u2133','mfr':'\uD835\uDD2A','Mfr':'\uD835\uDD10','mho':'\u2127','micro':'\xB5','mid':'\u2223','midast':'*','midcir':'\u2AF0','middot':'\xB7','minus':'\u2212','minusb':'\u229F','minusd':'\u2238','minusdu':'\u2A2A','MinusPlus':'\u2213','mlcp':'\u2ADB','mldr':'\u2026','mnplus':'\u2213','models':'\u22A7','mopf':'\uD835\uDD5E','Mopf':'\uD835\uDD44','mp':'\u2213','mscr':'\uD835\uDCC2','Mscr':'\u2133','mstpos':'\u223E','mu':'\u03BC','Mu':'\u039C','multimap':'\u22B8','mumap':'\u22B8','nabla':'\u2207','nacute':'\u0144','Nacute':'\u0143','nang':'\u2220\u20D2','nap':'\u2249','napE':'\u2A70\u0338','napid':'\u224B\u0338','napos':'\u0149','napprox':'\u2249','natur':'\u266E','natural':'\u266E','naturals':'\u2115','nbsp':'\xA0','nbump':'\u224E\u0338','nbumpe':'\u224F\u0338','ncap':'\u2A43','ncaron':'\u0148','Ncaron':'\u0147','ncedil':'\u0146','Ncedil':'\u0145','ncong':'\u2247','ncongdot':'\u2A6D\u0338','ncup':'\u2A42','ncy':'\u043D','Ncy':'\u041D','ndash':'\u2013','ne':'\u2260','nearhk':'\u2924','nearr':'\u2197','neArr':'\u21D7','nearrow':'\u2197','nedot':'\u2250\u0338','NegativeMediumSpace':'\u200B','NegativeThickSpace':'\u200B','NegativeThinSpace':'\u200B','NegativeVeryThinSpace':'\u200B','nequiv':'\u2262','nesear':'\u2928','nesim':'\u2242\u0338','NestedGreaterGreater':'\u226B','NestedLessLess':'\u226A','NewLine':'\n','nexist':'\u2204','nexists':'\u2204','nfr':'\uD835\uDD2B','Nfr':'\uD835\uDD11','nge':'\u2271','ngE':'\u2267\u0338','ngeq':'\u2271','ngeqq':'\u2267\u0338','ngeqslant':'\u2A7E\u0338','nges':'\u2A7E\u0338','nGg':'\u22D9\u0338','ngsim':'\u2275','ngt':'\u226F','nGt':'\u226B\u20D2','ngtr':'\u226F','nGtv':'\u226B\u0338','nharr':'\u21AE','nhArr':'\u21CE','nhpar':'\u2AF2','ni':'\u220B','nis':'\u22FC','nisd':'\u22FA','niv':'\u220B','njcy':'\u045A','NJcy':'\u040A','nlarr':'\u219A','nlArr':'\u21CD','nldr':'\u2025','nle':'\u2270','nlE':'\u2266\u0338','nleftarrow':'\u219A','nLeftarrow':'\u21CD','nleftrightarrow':'\u21AE','nLeftrightarrow':'\u21CE','nleq':'\u2270','nleqq':'\u2266\u0338','nleqslant':'\u2A7D\u0338','nles':'\u2A7D\u0338','nless':'\u226E','nLl':'\u22D8\u0338','nlsim':'\u2274','nlt':'\u226E','nLt':'\u226A\u20D2','nltri':'\u22EA','nltrie':'\u22EC','nLtv':'\u226A\u0338','nmid':'\u2224','NoBreak':'\u2060','NonBreakingSpace':'\xA0','nopf':'\uD835\uDD5F','Nopf':'\u2115','not':'\xAC','Not':'\u2AEC','NotCongruent':'\u2262','NotCupCap':'\u226D','NotDoubleVerticalBar':'\u2226','NotElement':'\u2209','NotEqual':'\u2260','NotEqualTilde':'\u2242\u0338','NotExists':'\u2204','NotGreater':'\u226F','NotGreaterEqual':'\u2271','NotGreaterFullEqual':'\u2267\u0338','NotGreaterGreater':'\u226B\u0338','NotGreaterLess':'\u2279','NotGreaterSlantEqual':'\u2A7E\u0338','NotGreaterTilde':'\u2275','NotHumpDownHump':'\u224E\u0338','NotHumpEqual':'\u224F\u0338','notin':'\u2209','notindot':'\u22F5\u0338','notinE':'\u22F9\u0338','notinva':'\u2209','notinvb':'\u22F7','notinvc':'\u22F6','NotLeftTriangle':'\u22EA','NotLeftTriangleBar':'\u29CF\u0338','NotLeftTriangleEqual':'\u22EC','NotLess':'\u226E','NotLessEqual':'\u2270','NotLessGreater':'\u2278','NotLessLess':'\u226A\u0338','NotLessSlantEqual':'\u2A7D\u0338','NotLessTilde':'\u2274','NotNestedGreaterGreater':'\u2AA2\u0338','NotNestedLessLess':'\u2AA1\u0338','notni':'\u220C','notniva':'\u220C','notnivb':'\u22FE','notnivc':'\u22FD','NotPrecedes':'\u2280','NotPrecedesEqual':'\u2AAF\u0338','NotPrecedesSlantEqual':'\u22E0','NotReverseElement':'\u220C','NotRightTriangle':'\u22EB','NotRightTriangleBar':'\u29D0\u0338','NotRightTriangleEqual':'\u22ED','NotSquareSubset':'\u228F\u0338','NotSquareSubsetEqual':'\u22E2','NotSquareSuperset':'\u2290\u0338','NotSquareSupersetEqual':'\u22E3','NotSubset':'\u2282\u20D2','NotSubsetEqual':'\u2288','NotSucceeds':'\u2281','NotSucceedsEqual':'\u2AB0\u0338','NotSucceedsSlantEqual':'\u22E1','NotSucceedsTilde':'\u227F\u0338','NotSuperset':'\u2283\u20D2','NotSupersetEqual':'\u2289','NotTilde':'\u2241','NotTildeEqual':'\u2244','NotTildeFullEqual':'\u2247','NotTildeTilde':'\u2249','NotVerticalBar':'\u2224','npar':'\u2226','nparallel':'\u2226','nparsl':'\u2AFD\u20E5','npart':'\u2202\u0338','npolint':'\u2A14','npr':'\u2280','nprcue':'\u22E0','npre':'\u2AAF\u0338','nprec':'\u2280','npreceq':'\u2AAF\u0338','nrarr':'\u219B','nrArr':'\u21CF','nrarrc':'\u2933\u0338','nrarrw':'\u219D\u0338','nrightarrow':'\u219B','nRightarrow':'\u21CF','nrtri':'\u22EB','nrtrie':'\u22ED','nsc':'\u2281','nsccue':'\u22E1','nsce':'\u2AB0\u0338','nscr':'\uD835\uDCC3','Nscr':'\uD835\uDCA9','nshortmid':'\u2224','nshortparallel':'\u2226','nsim':'\u2241','nsime':'\u2244','nsimeq':'\u2244','nsmid':'\u2224','nspar':'\u2226','nsqsube':'\u22E2','nsqsupe':'\u22E3','nsub':'\u2284','nsube':'\u2288','nsubE':'\u2AC5\u0338','nsubset':'\u2282\u20D2','nsubseteq':'\u2288','nsubseteqq':'\u2AC5\u0338','nsucc':'\u2281','nsucceq':'\u2AB0\u0338','nsup':'\u2285','nsupe':'\u2289','nsupE':'\u2AC6\u0338','nsupset':'\u2283\u20D2','nsupseteq':'\u2289','nsupseteqq':'\u2AC6\u0338','ntgl':'\u2279','ntilde':'\xF1','Ntilde':'\xD1','ntlg':'\u2278','ntriangleleft':'\u22EA','ntrianglelefteq':'\u22EC','ntriangleright':'\u22EB','ntrianglerighteq':'\u22ED','nu':'\u03BD','Nu':'\u039D','num':'#','numero':'\u2116','numsp':'\u2007','nvap':'\u224D\u20D2','nvdash':'\u22AC','nvDash':'\u22AD','nVdash':'\u22AE','nVDash':'\u22AF','nvge':'\u2265\u20D2','nvgt':'>\u20D2','nvHarr':'\u2904','nvinfin':'\u29DE','nvlArr':'\u2902','nvle':'\u2264\u20D2','nvlt':'<\u20D2','nvltrie':'\u22B4\u20D2','nvrArr':'\u2903','nvrtrie':'\u22B5\u20D2','nvsim':'\u223C\u20D2','nwarhk':'\u2923','nwarr':'\u2196','nwArr':'\u21D6','nwarrow':'\u2196','nwnear':'\u2927','oacute':'\xF3','Oacute':'\xD3','oast':'\u229B','ocir':'\u229A','ocirc':'\xF4','Ocirc':'\xD4','ocy':'\u043E','Ocy':'\u041E','odash':'\u229D','odblac':'\u0151','Odblac':'\u0150','odiv':'\u2A38','odot':'\u2299','odsold':'\u29BC','oelig':'\u0153','OElig':'\u0152','ofcir':'\u29BF','ofr':'\uD835\uDD2C','Ofr':'\uD835\uDD12','ogon':'\u02DB','ograve':'\xF2','Ograve':'\xD2','ogt':'\u29C1','ohbar':'\u29B5','ohm':'\u03A9','oint':'\u222E','olarr':'\u21BA','olcir':'\u29BE','olcross':'\u29BB','oline':'\u203E','olt':'\u29C0','omacr':'\u014D','Omacr':'\u014C','omega':'\u03C9','Omega':'\u03A9','omicron':'\u03BF','Omicron':'\u039F','omid':'\u29B6','ominus':'\u2296','oopf':'\uD835\uDD60','Oopf':'\uD835\uDD46','opar':'\u29B7','OpenCurlyDoubleQuote':'\u201C','OpenCurlyQuote':'\u2018','operp':'\u29B9','oplus':'\u2295','or':'\u2228','Or':'\u2A54','orarr':'\u21BB','ord':'\u2A5D','order':'\u2134','orderof':'\u2134','ordf':'\xAA','ordm':'\xBA','origof':'\u22B6','oror':'\u2A56','orslope':'\u2A57','orv':'\u2A5B','oS':'\u24C8','oscr':'\u2134','Oscr':'\uD835\uDCAA','oslash':'\xF8','Oslash':'\xD8','osol':'\u2298','otilde':'\xF5','Otilde':'\xD5','otimes':'\u2297','Otimes':'\u2A37','otimesas':'\u2A36','ouml':'\xF6','Ouml':'\xD6','ovbar':'\u233D','OverBar':'\u203E','OverBrace':'\u23DE','OverBracket':'\u23B4','OverParenthesis':'\u23DC','par':'\u2225','para':'\xB6','parallel':'\u2225','parsim':'\u2AF3','parsl':'\u2AFD','part':'\u2202','PartialD':'\u2202','pcy':'\u043F','Pcy':'\u041F','percnt':'%','period':'.','permil':'\u2030','perp':'\u22A5','pertenk':'\u2031','pfr':'\uD835\uDD2D','Pfr':'\uD835\uDD13','phi':'\u03C6','Phi':'\u03A6','phiv':'\u03D5','phmmat':'\u2133','phone':'\u260E','pi':'\u03C0','Pi':'\u03A0','pitchfork':'\u22D4','piv':'\u03D6','planck':'\u210F','planckh':'\u210E','plankv':'\u210F','plus':'+','plusacir':'\u2A23','plusb':'\u229E','pluscir':'\u2A22','plusdo':'\u2214','plusdu':'\u2A25','pluse':'\u2A72','PlusMinus':'\xB1','plusmn':'\xB1','plussim':'\u2A26','plustwo':'\u2A27','pm':'\xB1','Poincareplane':'\u210C','pointint':'\u2A15','popf':'\uD835\uDD61','Popf':'\u2119','pound':'\xA3','pr':'\u227A','Pr':'\u2ABB','prap':'\u2AB7','prcue':'\u227C','pre':'\u2AAF','prE':'\u2AB3','prec':'\u227A','precapprox':'\u2AB7','preccurlyeq':'\u227C','Precedes':'\u227A','PrecedesEqual':'\u2AAF','PrecedesSlantEqual':'\u227C','PrecedesTilde':'\u227E','preceq':'\u2AAF','precnapprox':'\u2AB9','precneqq':'\u2AB5','precnsim':'\u22E8','precsim':'\u227E','prime':'\u2032','Prime':'\u2033','primes':'\u2119','prnap':'\u2AB9','prnE':'\u2AB5','prnsim':'\u22E8','prod':'\u220F','Product':'\u220F','profalar':'\u232E','profline':'\u2312','profsurf':'\u2313','prop':'\u221D','Proportion':'\u2237','Proportional':'\u221D','propto':'\u221D','prsim':'\u227E','prurel':'\u22B0','pscr':'\uD835\uDCC5','Pscr':'\uD835\uDCAB','psi':'\u03C8','Psi':'\u03A8','puncsp':'\u2008','qfr':'\uD835\uDD2E','Qfr':'\uD835\uDD14','qint':'\u2A0C','qopf':'\uD835\uDD62','Qopf':'\u211A','qprime':'\u2057','qscr':'\uD835\uDCC6','Qscr':'\uD835\uDCAC','quaternions':'\u210D','quatint':'\u2A16','quest':'?','questeq':'\u225F','quot':'"','QUOT':'"','rAarr':'\u21DB','race':'\u223D\u0331','racute':'\u0155','Racute':'\u0154','radic':'\u221A','raemptyv':'\u29B3','rang':'\u27E9','Rang':'\u27EB','rangd':'\u2992','range':'\u29A5','rangle':'\u27E9','raquo':'\xBB','rarr':'\u2192','rArr':'\u21D2','Rarr':'\u21A0','rarrap':'\u2975','rarrb':'\u21E5','rarrbfs':'\u2920','rarrc':'\u2933','rarrfs':'\u291E','rarrhk':'\u21AA','rarrlp':'\u21AC','rarrpl':'\u2945','rarrsim':'\u2974','rarrtl':'\u21A3','Rarrtl':'\u2916','rarrw':'\u219D','ratail':'\u291A','rAtail':'\u291C','ratio':'\u2236','rationals':'\u211A','rbarr':'\u290D','rBarr':'\u290F','RBarr':'\u2910','rbbrk':'\u2773','rbrace':'}','rbrack':']','rbrke':'\u298C','rbrksld':'\u298E','rbrkslu':'\u2990','rcaron':'\u0159','Rcaron':'\u0158','rcedil':'\u0157','Rcedil':'\u0156','rceil':'\u2309','rcub':'}','rcy':'\u0440','Rcy':'\u0420','rdca':'\u2937','rdldhar':'\u2969','rdquo':'\u201D','rdquor':'\u201D','rdsh':'\u21B3','Re':'\u211C','real':'\u211C','realine':'\u211B','realpart':'\u211C','reals':'\u211D','rect':'\u25AD','reg':'\xAE','REG':'\xAE','ReverseElement':'\u220B','ReverseEquilibrium':'\u21CB','ReverseUpEquilibrium':'\u296F','rfisht':'\u297D','rfloor':'\u230B','rfr':'\uD835\uDD2F','Rfr':'\u211C','rHar':'\u2964','rhard':'\u21C1','rharu':'\u21C0','rharul':'\u296C','rho':'\u03C1','Rho':'\u03A1','rhov':'\u03F1','RightAngleBracket':'\u27E9','rightarrow':'\u2192','Rightarrow':'\u21D2','RightArrow':'\u2192','RightArrowBar':'\u21E5','RightArrowLeftArrow':'\u21C4','rightarrowtail':'\u21A3','RightCeiling':'\u2309','RightDoubleBracket':'\u27E7','RightDownTeeVector':'\u295D','RightDownVector':'\u21C2','RightDownVectorBar':'\u2955','RightFloor':'\u230B','rightharpoondown':'\u21C1','rightharpoonup':'\u21C0','rightleftarrows':'\u21C4','rightleftharpoons':'\u21CC','rightrightarrows':'\u21C9','rightsquigarrow':'\u219D','RightTee':'\u22A2','RightTeeArrow':'\u21A6','RightTeeVector':'\u295B','rightthreetimes':'\u22CC','RightTriangle':'\u22B3','RightTriangleBar':'\u29D0','RightTriangleEqual':'\u22B5','RightUpDownVector':'\u294F','RightUpTeeVector':'\u295C','RightUpVector':'\u21BE','RightUpVectorBar':'\u2954','RightVector':'\u21C0','RightVectorBar':'\u2953','ring':'\u02DA','risingdotseq':'\u2253','rlarr':'\u21C4','rlhar':'\u21CC','rlm':'\u200F','rmoust':'\u23B1','rmoustache':'\u23B1','rnmid':'\u2AEE','roang':'\u27ED','roarr':'\u21FE','robrk':'\u27E7','ropar':'\u2986','ropf':'\uD835\uDD63','Ropf':'\u211D','roplus':'\u2A2E','rotimes':'\u2A35','RoundImplies':'\u2970','rpar':')','rpargt':'\u2994','rppolint':'\u2A12','rrarr':'\u21C9','Rrightarrow':'\u21DB','rsaquo':'\u203A','rscr':'\uD835\uDCC7','Rscr':'\u211B','rsh':'\u21B1','Rsh':'\u21B1','rsqb':']','rsquo':'\u2019','rsquor':'\u2019','rthree':'\u22CC','rtimes':'\u22CA','rtri':'\u25B9','rtrie':'\u22B5','rtrif':'\u25B8','rtriltri':'\u29CE','RuleDelayed':'\u29F4','ruluhar':'\u2968','rx':'\u211E','sacute':'\u015B','Sacute':'\u015A','sbquo':'\u201A','sc':'\u227B','Sc':'\u2ABC','scap':'\u2AB8','scaron':'\u0161','Scaron':'\u0160','sccue':'\u227D','sce':'\u2AB0','scE':'\u2AB4','scedil':'\u015F','Scedil':'\u015E','scirc':'\u015D','Scirc':'\u015C','scnap':'\u2ABA','scnE':'\u2AB6','scnsim':'\u22E9','scpolint':'\u2A13','scsim':'\u227F','scy':'\u0441','Scy':'\u0421','sdot':'\u22C5','sdotb':'\u22A1','sdote':'\u2A66','searhk':'\u2925','searr':'\u2198','seArr':'\u21D8','searrow':'\u2198','sect':'\xA7','semi':';','seswar':'\u2929','setminus':'\u2216','setmn':'\u2216','sext':'\u2736','sfr':'\uD835\uDD30','Sfr':'\uD835\uDD16','sfrown':'\u2322','sharp':'\u266F','shchcy':'\u0449','SHCHcy':'\u0429','shcy':'\u0448','SHcy':'\u0428','ShortDownArrow':'\u2193','ShortLeftArrow':'\u2190','shortmid':'\u2223','shortparallel':'\u2225','ShortRightArrow':'\u2192','ShortUpArrow':'\u2191','shy':'\xAD','sigma':'\u03C3','Sigma':'\u03A3','sigmaf':'\u03C2','sigmav':'\u03C2','sim':'\u223C','simdot':'\u2A6A','sime':'\u2243','simeq':'\u2243','simg':'\u2A9E','simgE':'\u2AA0','siml':'\u2A9D','simlE':'\u2A9F','simne':'\u2246','simplus':'\u2A24','simrarr':'\u2972','slarr':'\u2190','SmallCircle':'\u2218','smallsetminus':'\u2216','smashp':'\u2A33','smeparsl':'\u29E4','smid':'\u2223','smile':'\u2323','smt':'\u2AAA','smte':'\u2AAC','smtes':'\u2AAC\uFE00','softcy':'\u044C','SOFTcy':'\u042C','sol':'/','solb':'\u29C4','solbar':'\u233F','sopf':'\uD835\uDD64','Sopf':'\uD835\uDD4A','spades':'\u2660','spadesuit':'\u2660','spar':'\u2225','sqcap':'\u2293','sqcaps':'\u2293\uFE00','sqcup':'\u2294','sqcups':'\u2294\uFE00','Sqrt':'\u221A','sqsub':'\u228F','sqsube':'\u2291','sqsubset':'\u228F','sqsubseteq':'\u2291','sqsup':'\u2290','sqsupe':'\u2292','sqsupset':'\u2290','sqsupseteq':'\u2292','squ':'\u25A1','square':'\u25A1','Square':'\u25A1','SquareIntersection':'\u2293','SquareSubset':'\u228F','SquareSubsetEqual':'\u2291','SquareSuperset':'\u2290','SquareSupersetEqual':'\u2292','SquareUnion':'\u2294','squarf':'\u25AA','squf':'\u25AA','srarr':'\u2192','sscr':'\uD835\uDCC8','Sscr':'\uD835\uDCAE','ssetmn':'\u2216','ssmile':'\u2323','sstarf':'\u22C6','star':'\u2606','Star':'\u22C6','starf':'\u2605','straightepsilon':'\u03F5','straightphi':'\u03D5','strns':'\xAF','sub':'\u2282','Sub':'\u22D0','subdot':'\u2ABD','sube':'\u2286','subE':'\u2AC5','subedot':'\u2AC3','submult':'\u2AC1','subne':'\u228A','subnE':'\u2ACB','subplus':'\u2ABF','subrarr':'\u2979','subset':'\u2282','Subset':'\u22D0','subseteq':'\u2286','subseteqq':'\u2AC5','SubsetEqual':'\u2286','subsetneq':'\u228A','subsetneqq':'\u2ACB','subsim':'\u2AC7','subsub':'\u2AD5','subsup':'\u2AD3','succ':'\u227B','succapprox':'\u2AB8','succcurlyeq':'\u227D','Succeeds':'\u227B','SucceedsEqual':'\u2AB0','SucceedsSlantEqual':'\u227D','SucceedsTilde':'\u227F','succeq':'\u2AB0','succnapprox':'\u2ABA','succneqq':'\u2AB6','succnsim':'\u22E9','succsim':'\u227F','SuchThat':'\u220B','sum':'\u2211','Sum':'\u2211','sung':'\u266A','sup':'\u2283','Sup':'\u22D1','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','supdot':'\u2ABE','supdsub':'\u2AD8','supe':'\u2287','supE':'\u2AC6','supedot':'\u2AC4','Superset':'\u2283','SupersetEqual':'\u2287','suphsol':'\u27C9','suphsub':'\u2AD7','suplarr':'\u297B','supmult':'\u2AC2','supne':'\u228B','supnE':'\u2ACC','supplus':'\u2AC0','supset':'\u2283','Supset':'\u22D1','supseteq':'\u2287','supseteqq':'\u2AC6','supsetneq':'\u228B','supsetneqq':'\u2ACC','supsim':'\u2AC8','supsub':'\u2AD4','supsup':'\u2AD6','swarhk':'\u2926','swarr':'\u2199','swArr':'\u21D9','swarrow':'\u2199','swnwar':'\u292A','szlig':'\xDF','Tab':'\t','target':'\u2316','tau':'\u03C4','Tau':'\u03A4','tbrk':'\u23B4','tcaron':'\u0165','Tcaron':'\u0164','tcedil':'\u0163','Tcedil':'\u0162','tcy':'\u0442','Tcy':'\u0422','tdot':'\u20DB','telrec':'\u2315','tfr':'\uD835\uDD31','Tfr':'\uD835\uDD17','there4':'\u2234','therefore':'\u2234','Therefore':'\u2234','theta':'\u03B8','Theta':'\u0398','thetasym':'\u03D1','thetav':'\u03D1','thickapprox':'\u2248','thicksim':'\u223C','ThickSpace':'\u205F\u200A','thinsp':'\u2009','ThinSpace':'\u2009','thkap':'\u2248','thksim':'\u223C','thorn':'\xFE','THORN':'\xDE','tilde':'\u02DC','Tilde':'\u223C','TildeEqual':'\u2243','TildeFullEqual':'\u2245','TildeTilde':'\u2248','times':'\xD7','timesb':'\u22A0','timesbar':'\u2A31','timesd':'\u2A30','tint':'\u222D','toea':'\u2928','top':'\u22A4','topbot':'\u2336','topcir':'\u2AF1','topf':'\uD835\uDD65','Topf':'\uD835\uDD4B','topfork':'\u2ADA','tosa':'\u2929','tprime':'\u2034','trade':'\u2122','TRADE':'\u2122','triangle':'\u25B5','triangledown':'\u25BF','triangleleft':'\u25C3','trianglelefteq':'\u22B4','triangleq':'\u225C','triangleright':'\u25B9','trianglerighteq':'\u22B5','tridot':'\u25EC','trie':'\u225C','triminus':'\u2A3A','TripleDot':'\u20DB','triplus':'\u2A39','trisb':'\u29CD','tritime':'\u2A3B','trpezium':'\u23E2','tscr':'\uD835\uDCC9','Tscr':'\uD835\uDCAF','tscy':'\u0446','TScy':'\u0426','tshcy':'\u045B','TSHcy':'\u040B','tstrok':'\u0167','Tstrok':'\u0166','twixt':'\u226C','twoheadleftarrow':'\u219E','twoheadrightarrow':'\u21A0','uacute':'\xFA','Uacute':'\xDA','uarr':'\u2191','uArr':'\u21D1','Uarr':'\u219F','Uarrocir':'\u2949','ubrcy':'\u045E','Ubrcy':'\u040E','ubreve':'\u016D','Ubreve':'\u016C','ucirc':'\xFB','Ucirc':'\xDB','ucy':'\u0443','Ucy':'\u0423','udarr':'\u21C5','udblac':'\u0171','Udblac':'\u0170','udhar':'\u296E','ufisht':'\u297E','ufr':'\uD835\uDD32','Ufr':'\uD835\uDD18','ugrave':'\xF9','Ugrave':'\xD9','uHar':'\u2963','uharl':'\u21BF','uharr':'\u21BE','uhblk':'\u2580','ulcorn':'\u231C','ulcorner':'\u231C','ulcrop':'\u230F','ultri':'\u25F8','umacr':'\u016B','Umacr':'\u016A','uml':'\xA8','UnderBar':'_','UnderBrace':'\u23DF','UnderBracket':'\u23B5','UnderParenthesis':'\u23DD','Union':'\u22C3','UnionPlus':'\u228E','uogon':'\u0173','Uogon':'\u0172','uopf':'\uD835\uDD66','Uopf':'\uD835\uDD4C','uparrow':'\u2191','Uparrow':'\u21D1','UpArrow':'\u2191','UpArrowBar':'\u2912','UpArrowDownArrow':'\u21C5','updownarrow':'\u2195','Updownarrow':'\u21D5','UpDownArrow':'\u2195','UpEquilibrium':'\u296E','upharpoonleft':'\u21BF','upharpoonright':'\u21BE','uplus':'\u228E','UpperLeftArrow':'\u2196','UpperRightArrow':'\u2197','upsi':'\u03C5','Upsi':'\u03D2','upsih':'\u03D2','upsilon':'\u03C5','Upsilon':'\u03A5','UpTee':'\u22A5','UpTeeArrow':'\u21A5','upuparrows':'\u21C8','urcorn':'\u231D','urcorner':'\u231D','urcrop':'\u230E','uring':'\u016F','Uring':'\u016E','urtri':'\u25F9','uscr':'\uD835\uDCCA','Uscr':'\uD835\uDCB0','utdot':'\u22F0','utilde':'\u0169','Utilde':'\u0168','utri':'\u25B5','utrif':'\u25B4','uuarr':'\u21C8','uuml':'\xFC','Uuml':'\xDC','uwangle':'\u29A7','vangrt':'\u299C','varepsilon':'\u03F5','varkappa':'\u03F0','varnothing':'\u2205','varphi':'\u03D5','varpi':'\u03D6','varpropto':'\u221D','varr':'\u2195','vArr':'\u21D5','varrho':'\u03F1','varsigma':'\u03C2','varsubsetneq':'\u228A\uFE00','varsubsetneqq':'\u2ACB\uFE00','varsupsetneq':'\u228B\uFE00','varsupsetneqq':'\u2ACC\uFE00','vartheta':'\u03D1','vartriangleleft':'\u22B2','vartriangleright':'\u22B3','vBar':'\u2AE8','Vbar':'\u2AEB','vBarv':'\u2AE9','vcy':'\u0432','Vcy':'\u0412','vdash':'\u22A2','vDash':'\u22A8','Vdash':'\u22A9','VDash':'\u22AB','Vdashl':'\u2AE6','vee':'\u2228','Vee':'\u22C1','veebar':'\u22BB','veeeq':'\u225A','vellip':'\u22EE','verbar':'|','Verbar':'\u2016','vert':'|','Vert':'\u2016','VerticalBar':'\u2223','VerticalLine':'|','VerticalSeparator':'\u2758','VerticalTilde':'\u2240','VeryThinSpace':'\u200A','vfr':'\uD835\uDD33','Vfr':'\uD835\uDD19','vltri':'\u22B2','vnsub':'\u2282\u20D2','vnsup':'\u2283\u20D2','vopf':'\uD835\uDD67','Vopf':'\uD835\uDD4D','vprop':'\u221D','vrtri':'\u22B3','vscr':'\uD835\uDCCB','Vscr':'\uD835\uDCB1','vsubne':'\u228A\uFE00','vsubnE':'\u2ACB\uFE00','vsupne':'\u228B\uFE00','vsupnE':'\u2ACC\uFE00','Vvdash':'\u22AA','vzigzag':'\u299A','wcirc':'\u0175','Wcirc':'\u0174','wedbar':'\u2A5F','wedge':'\u2227','Wedge':'\u22C0','wedgeq':'\u2259','weierp':'\u2118','wfr':'\uD835\uDD34','Wfr':'\uD835\uDD1A','wopf':'\uD835\uDD68','Wopf':'\uD835\uDD4E','wp':'\u2118','wr':'\u2240','wreath':'\u2240','wscr':'\uD835\uDCCC','Wscr':'\uD835\uDCB2','xcap':'\u22C2','xcirc':'\u25EF','xcup':'\u22C3','xdtri':'\u25BD','xfr':'\uD835\uDD35','Xfr':'\uD835\uDD1B','xharr':'\u27F7','xhArr':'\u27FA','xi':'\u03BE','Xi':'\u039E','xlarr':'\u27F5','xlArr':'\u27F8','xmap':'\u27FC','xnis':'\u22FB','xodot':'\u2A00','xopf':'\uD835\uDD69','Xopf':'\uD835\uDD4F','xoplus':'\u2A01','xotime':'\u2A02','xrarr':'\u27F6','xrArr':'\u27F9','xscr':'\uD835\uDCCD','Xscr':'\uD835\uDCB3','xsqcup':'\u2A06','xuplus':'\u2A04','xutri':'\u25B3','xvee':'\u22C1','xwedge':'\u22C0','yacute':'\xFD','Yacute':'\xDD','yacy':'\u044F','YAcy':'\u042F','ycirc':'\u0177','Ycirc':'\u0176','ycy':'\u044B','Ycy':'\u042B','yen':'\xA5','yfr':'\uD835\uDD36','Yfr':'\uD835\uDD1C','yicy':'\u0457','YIcy':'\u0407','yopf':'\uD835\uDD6A','Yopf':'\uD835\uDD50','yscr':'\uD835\uDCCE','Yscr':'\uD835\uDCB4','yucy':'\u044E','YUcy':'\u042E','yuml':'\xFF','Yuml':'\u0178','zacute':'\u017A','Zacute':'\u0179','zcaron':'\u017E','Zcaron':'\u017D','zcy':'\u0437','Zcy':'\u0417','zdot':'\u017C','Zdot':'\u017B','zeetrf':'\u2128','ZeroWidthSpace':'\u200B','zeta':'\u03B6','Zeta':'\u0396','zfr':'\uD835\uDD37','Zfr':'\u2128','zhcy':'\u0436','ZHcy':'\u0416','zigrarr':'\u21DD','zopf':'\uD835\uDD6B','Zopf':'\u2124','zscr':'\uD835\uDCCF','Zscr':'\uD835\uDCB5','zwj':'\u200D','zwnj':'\u200C'};
	var decodeMapLegacy = {'aacute':'\xE1','Aacute':'\xC1','acirc':'\xE2','Acirc':'\xC2','acute':'\xB4','aelig':'\xE6','AElig':'\xC6','agrave':'\xE0','Agrave':'\xC0','amp':'&','AMP':'&','aring':'\xE5','Aring':'\xC5','atilde':'\xE3','Atilde':'\xC3','auml':'\xE4','Auml':'\xC4','brvbar':'\xA6','ccedil':'\xE7','Ccedil':'\xC7','cedil':'\xB8','cent':'\xA2','copy':'\xA9','COPY':'\xA9','curren':'\xA4','deg':'\xB0','divide':'\xF7','eacute':'\xE9','Eacute':'\xC9','ecirc':'\xEA','Ecirc':'\xCA','egrave':'\xE8','Egrave':'\xC8','eth':'\xF0','ETH':'\xD0','euml':'\xEB','Euml':'\xCB','frac12':'\xBD','frac14':'\xBC','frac34':'\xBE','gt':'>','GT':'>','iacute':'\xED','Iacute':'\xCD','icirc':'\xEE','Icirc':'\xCE','iexcl':'\xA1','igrave':'\xEC','Igrave':'\xCC','iquest':'\xBF','iuml':'\xEF','Iuml':'\xCF','laquo':'\xAB','lt':'<','LT':'<','macr':'\xAF','micro':'\xB5','middot':'\xB7','nbsp':'\xA0','not':'\xAC','ntilde':'\xF1','Ntilde':'\xD1','oacute':'\xF3','Oacute':'\xD3','ocirc':'\xF4','Ocirc':'\xD4','ograve':'\xF2','Ograve':'\xD2','ordf':'\xAA','ordm':'\xBA','oslash':'\xF8','Oslash':'\xD8','otilde':'\xF5','Otilde':'\xD5','ouml':'\xF6','Ouml':'\xD6','para':'\xB6','plusmn':'\xB1','pound':'\xA3','quot':'"','QUOT':'"','raquo':'\xBB','reg':'\xAE','REG':'\xAE','sect':'\xA7','shy':'\xAD','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','szlig':'\xDF','thorn':'\xFE','THORN':'\xDE','times':'\xD7','uacute':'\xFA','Uacute':'\xDA','ucirc':'\xFB','Ucirc':'\xDB','ugrave':'\xF9','Ugrave':'\xD9','uml':'\xA8','uuml':'\xFC','Uuml':'\xDC','yacute':'\xFD','Yacute':'\xDD','yen':'\xA5','yuml':'\xFF'};
	var decodeMapNumeric = {'0':'\uFFFD','128':'\u20AC','130':'\u201A','131':'\u0192','132':'\u201E','133':'\u2026','134':'\u2020','135':'\u2021','136':'\u02C6','137':'\u2030','138':'\u0160','139':'\u2039','140':'\u0152','142':'\u017D','145':'\u2018','146':'\u2019','147':'\u201C','148':'\u201D','149':'\u2022','150':'\u2013','151':'\u2014','152':'\u02DC','153':'\u2122','154':'\u0161','155':'\u203A','156':'\u0153','158':'\u017E','159':'\u0178'};
	var invalidReferenceCodePoints = [1,2,3,4,5,6,7,8,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,64976,64977,64978,64979,64980,64981,64982,64983,64984,64985,64986,64987,64988,64989,64990,64991,64992,64993,64994,64995,64996,64997,64998,64999,65000,65001,65002,65003,65004,65005,65006,65007,65534,65535,131070,131071,196606,196607,262142,262143,327678,327679,393214,393215,458750,458751,524286,524287,589822,589823,655358,655359,720894,720895,786430,786431,851966,851967,917502,917503,983038,983039,1048574,1048575,1114110,1114111];

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	var object = {};
	var hasOwnProperty = object.hasOwnProperty;
	var has = function(object, propertyName) {
		return hasOwnProperty.call(object, propertyName);
	};

	var contains = function(array, value) {
		var index = -1;
		var length = array.length;
		while (++index < length) {
			if (array[index] == value) {
				return true;
			}
		}
		return false;
	};

	var merge = function(options, defaults) {
		if (!options) {
			return defaults;
		}
		var result = {};
		var key;
		for (key in defaults) {
			// A `hasOwnProperty` check is not needed here, since only recognized
			// option names are used anyway. Any others are ignored.
			result[key] = has(options, key) ? options[key] : defaults[key];
		}
		return result;
	};

	// Modified version of `ucs2encode`; see https://mths.be/punycode.
	var codePointToSymbol = function(codePoint, strict) {
		var output = '';
		if ((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF) {
			// See issue #4:
			// “Otherwise, if the number is in the range 0xD800 to 0xDFFF or is
			// greater than 0x10FFFF, then this is a parse error. Return a U+FFFD
			// REPLACEMENT CHARACTER.”
			if (strict) {
				parseError('character reference outside the permissible Unicode range');
			}
			return '\uFFFD';
		}
		if (has(decodeMapNumeric, codePoint)) {
			if (strict) {
				parseError('disallowed character reference');
			}
			return decodeMapNumeric[codePoint];
		}
		if (strict && contains(invalidReferenceCodePoints, codePoint)) {
			parseError('disallowed character reference');
		}
		if (codePoint > 0xFFFF) {
			codePoint -= 0x10000;
			output += stringFromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
			codePoint = 0xDC00 | codePoint & 0x3FF;
		}
		output += stringFromCharCode(codePoint);
		return output;
	};

	var hexEscape = function(codePoint) {
		return '&#x' + codePoint.toString(16).toUpperCase() + ';';
	};

	var decEscape = function(codePoint) {
		return '&#' + codePoint + ';';
	};

	var parseError = function(message) {
		throw Error('Parse error: ' + message);
	};

	/*--------------------------------------------------------------------------*/

	var encode = function(string, options) {
		options = merge(options, encode.options);
		var strict = options.strict;
		if (strict && regexInvalidRawCodePoint.test(string)) {
			parseError('forbidden code point');
		}
		var encodeEverything = options.encodeEverything;
		var useNamedReferences = options.useNamedReferences;
		var allowUnsafeSymbols = options.allowUnsafeSymbols;
		var escapeCodePoint = options.decimal ? decEscape : hexEscape;

		var escapeBmpSymbol = function(symbol) {
			return escapeCodePoint(symbol.charCodeAt(0));
		};

		if (encodeEverything) {
			// Encode ASCII symbols.
			string = string.replace(regexAsciiWhitelist, function(symbol) {
				// Use named references if requested & possible.
				if (useNamedReferences && has(encodeMap, symbol)) {
					return '&' + encodeMap[symbol] + ';';
				}
				return escapeBmpSymbol(symbol);
			});
			// Shorten a few escapes that represent two symbols, of which at least one
			// is within the ASCII range.
			if (useNamedReferences) {
				string = string
					.replace(/&gt;\u20D2/g, '&nvgt;')
					.replace(/&lt;\u20D2/g, '&nvlt;')
					.replace(/&#x66;&#x6A;/g, '&fjlig;');
			}
			// Encode non-ASCII symbols.
			if (useNamedReferences) {
				// Encode non-ASCII symbols that can be replaced with a named reference.
				string = string.replace(regexEncodeNonAscii, function(string) {
					// Note: there is no need to check `has(encodeMap, string)` here.
					return '&' + encodeMap[string] + ';';
				});
			}
			// Note: any remaining non-ASCII symbols are handled outside of the `if`.
		} else if (useNamedReferences) {
			// Apply named character references.
			// Encode `<>"'&` using named character references.
			if (!allowUnsafeSymbols) {
				string = string.replace(regexEscape, function(string) {
					return '&' + encodeMap[string] + ';'; // no need to check `has()` here
				});
			}
			// Shorten escapes that represent two symbols, of which at least one is
			// `<>"'&`.
			string = string
				.replace(/&gt;\u20D2/g, '&nvgt;')
				.replace(/&lt;\u20D2/g, '&nvlt;');
			// Encode non-ASCII symbols that can be replaced with a named reference.
			string = string.replace(regexEncodeNonAscii, function(string) {
				// Note: there is no need to check `has(encodeMap, string)` here.
				return '&' + encodeMap[string] + ';';
			});
		} else if (!allowUnsafeSymbols) {
			// Encode `<>"'&` using hexadecimal escapes, now that they’re not handled
			// using named character references.
			string = string.replace(regexEscape, escapeBmpSymbol);
		}
		return string
			// Encode astral symbols.
			.replace(regexAstralSymbols, function($0) {
				// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
				var high = $0.charCodeAt(0);
				var low = $0.charCodeAt(1);
				var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
				return escapeCodePoint(codePoint);
			})
			// Encode any remaining BMP symbols that are not printable ASCII symbols
			// using a hexadecimal escape.
			.replace(regexBmpWhitelist, escapeBmpSymbol);
	};
	// Expose default options (so they can be overridden globally).
	encode.options = {
		'allowUnsafeSymbols': false,
		'encodeEverything': false,
		'strict': false,
		'useNamedReferences': false,
		'decimal' : false
	};

	var decode = function(html, options) {
		options = merge(options, decode.options);
		var strict = options.strict;
		if (strict && regexInvalidEntity.test(html)) {
			parseError('malformed character reference');
		}
		return html.replace(regexDecode, function($0, $1, $2, $3, $4, $5, $6, $7, $8) {
			var codePoint;
			var semicolon;
			var decDigits;
			var hexDigits;
			var reference;
			var next;

			if ($1) {
				reference = $1;
				// Note: there is no need to check `has(decodeMap, reference)`.
				return decodeMap[reference];
			}

			if ($2) {
				// Decode named character references without trailing `;`, e.g. `&amp`.
				// This is only a parse error if it gets converted to `&`, or if it is
				// followed by `=` in an attribute context.
				reference = $2;
				next = $3;
				if (next && options.isAttributeValue) {
					if (strict && next == '=') {
						parseError('`&` did not start a character reference');
					}
					return $0;
				} else {
					if (strict) {
						parseError(
							'named character reference was not terminated by a semicolon'
						);
					}
					// Note: there is no need to check `has(decodeMapLegacy, reference)`.
					return decodeMapLegacy[reference] + (next || '');
				}
			}

			if ($4) {
				// Decode decimal escapes, e.g. `&#119558;`.
				decDigits = $4;
				semicolon = $5;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				codePoint = parseInt(decDigits, 10);
				return codePointToSymbol(codePoint, strict);
			}

			if ($6) {
				// Decode hexadecimal escapes, e.g. `&#x1D306;`.
				hexDigits = $6;
				semicolon = $7;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				codePoint = parseInt(hexDigits, 16);
				return codePointToSymbol(codePoint, strict);
			}

			// If we’re still here, `if ($7)` is implied; it’s an ambiguous
			// ampersand for sure. https://mths.be/notes/ambiguous-ampersands
			if (strict) {
				parseError(
					'named character reference was not terminated by a semicolon'
				);
			}
			return $0;
		});
	};
	// Expose default options (so they can be overridden globally).
	decode.options = {
		'isAttributeValue': false,
		'strict': false
	};

	var escape = function(string) {
		return string.replace(regexEscape, function($0) {
			// Note: there is no need to check `has(escapeMap, $0)` here.
			return escapeMap[$0];
		});
	};

	/*--------------------------------------------------------------------------*/

	var he = {
		'version': '1.2.0',
		'encode': encode,
		'decode': decode,
		'escape': escape,
		'unescape': decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = he;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in he) {
				has(he, key) && (freeExports[key] = he[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.he = he;
	}

}(commonjsGlobal));
});

var status = {
  // not modified
  304: res => {
    res.statusCode = 304;
    res.end();
  },

  // access denied
  403: (res, next) => {
    res.statusCode = 403;
    if (typeof next === "function") {
      next();
    } else if (res.writable) {
      res.setHeader("content-type", "text/plain");
      res.end("ACCESS DENIED");
    }
  },

  // disallowed method
  405: (res, next, opts) => {
    res.statusCode = 405;
    if (typeof next === "function") {
      next();
    } else {
      res.setHeader("allow", (opts && opts.allow) || "GET, HEAD");
      res.end();
    }
  },

  // not found
  404: (res, next) => {
    res.statusCode = 404;
    if (typeof next === "function") {
      next();
    } else if (res.writable) {
      res.setHeader("content-type", "text/plain");
      res.end("File not found. :(");
    }
  },

  // range error
  416: (res, next) => {
    res.statusCode = 416;
    if (typeof next === "function") {
      next();
    } else if (res.writable) {
      res.setHeader("content-type", "text/plain");
      res.end("Requested range not satisfiable");
    }
  },

  // flagrant error
  500: (res, next, opts) => {
    res.statusCode = 500;

    if (!opts.handleError && next) {
      next(opts.error);
      return;
    }

    if (res.headersSent) {
      res.destroy();
      return;
    }

    res.setHeader("content-type", "text/html");
    const error = String(
      opts.error.stack || opts.error || "No specified error"
    );
    const html = `${[
      "<!doctype html>",
      "<html>",
      "  <head>",
      '    <meta charset="utf-8">',
      "    <title>500 Internal Server Error</title>",
      "  </head>",
      "  <body>",
      "    <p>",
      `      ${he.encode(error)}`,
      "    </p>",
      "  </body>",
      "</html>"
    ].join("\n")}\n`;
    res.end(html);
  },

  // bad request
  400: (res, next, opts) => {
    res.statusCode = 400;
    if (typeof next === "function") {
      next();
    } else {
      res.setHeader("content-type", "text/html");
      const error =
        opts && opts.error ? String(opts.error) : "Malformed request.";
      const html = `${[
        "<!doctype html>",
        "<html>",
        "  <head>",
        '    <meta charset="utf-8">',
        "    <title>400 Bad Request</title>",
        "  </head>",
        "  <body>",
        "    <p>",
        `      ${he.encode(error)}`,
        "    </p>",
        "  </body>",
        "</html>"
      ].join("\n")}\n`;
      res.end(html);
    }
  }
};

var generateEtag = (stat, weakEtag) => {
  let etag = `"${[stat.ino, stat.size, stat.mtime.toISOString()].join('-')}"`;
  if (weakEtag) {
    etag = `W/${etag}`;
  }
  return etag;
};

var _blank = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAWBJREFUeNqEUj1LxEAQnd1MVA4lyIEWx6UIKEGUExGsbC3tLfwJ/hT/g7VlCnubqxXBwg/Q4hQP/LhKL5nZuBsvuGfW5MGyuzM7jzdvVuR5DgYnZ+f99ai7Vt5t9K9unu4HLweI3qWYxI6PDosdy0fhcntxO44CcOBzPA7mfEyuHwf7ntQk4jcnywOxIlfxOCNYaLVgb6cXbkTdhJXq2SIlNMC0xIqhHczDbi8OVzpLSUa0WebRfmigLHqj1EcPZnwf7gbDIrYVRyEinurj6jTBHyI7pqVrFQqEbt6TEmZ9v1NRAJNC1xTYxIQh/MmRUlmFQE3qWOW1nqB2TWk1/3tgJV0waVvkFIEeZbHq4ElyKzAmEXOx6gnEVJuWBzmkRJBRPYGZBDsVaOlpSgVJE2yVaAe/0kx/3azBRO0VsbMFZE3CDSZKweZfYIVg+DZ6v7h9GDVOwZPw/PoxKu/fAgwALbDAXf7DdQkAAAAASUVORK5CYII=";
var _page = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmhJREFUeNpsUztv01AYPfdhOy/XTZ80VV1VoCqlA2zQqUgwMEErWBALv4GJDfEDmOEHsFTqVCTExAiiSI2QEKJKESVFFBWo04TESRzfy2c7LY/kLtf2d8+555zvM9NaI1ora5svby9OnbUEBxgDlIKiWjXQeLy19/X17sEtcPY2rtHS96/Hu0RvXXLz+cUzM87zShsI29DpHCYt4E6Box4IZzTnbDx7V74GjhOSfwgE0H2638K9h08A3iHGVbjTw7g6YmAyw/BgecHNGGJjvfQhIfmfIFDAXJpjuugi7djIFVI4P0plctgJQ0xnFe5eOO02OwEp2VkhSCnC8WOCdqgwnzFx4/IyppwRVN+XYXsecqZA1pB48ekAnw9/4GZx3L04N/GoTwEjX4cNH5vlPfjtAIYp8cWrQutxrC5Mod3VsXVTMFSqtaE+gl9dhaUxE2tXZiF7nYiiatJ3v5s8R/1yOCNLOuwjkELiTbmC9dJHpIaGASsDkoFQGJQwHWMcHWJYOmUj1OjvQotuytt5nHMLEGkCyx6QU384jwkUAd2sxJbS/QShZtg/8rHzzQOzSaFhxQrA6YgQMQHojCUlgnCAAvKFBoXXaHfArSCZDE0gyWJgFIKmvUFKO4MUNIk2a4+hODtDUVuJ/J732AKS6ZtImdTyAQQB3bZN8l9t75IFh0JMUdVKsohsUPqRgnka0tYgggYpCHkKGTsHI5NOMojB4iTICCepvX53AIEfQta1iUCmoTiBmdEri2RgddKFhuJoqb/af/yw/d3zTNM6UkaOfis62aUgddAbnz+rXuPY+Vnzjt9/CzAAbmLjCrfBiRgAAAAASUVORK5CYII=";
var aac = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnhJREFUeNp0Uk1PE0EYftruVlvAUkhVEPoBcsEoLRJBY01MPHjCs3cvogcT/4qJJN5NvHhoohcOnPw4YEGIkCh+oLGBKm3Z7nZ3dme2vjOhTcjiJJvZzPvOM8/HG2q325Dr3kLp7Y1ibpIxjs4KhQBZfvV6s7K5Vb0bjeof5ZlcGysP1a51mifODybvzE8mzCbrAoTDIThMoGXZiZ4YSiurf+Z1XeuCqJ7Oj+sK3jQcNAmg8xkGQ71mYejcAB49vpmeuzJccl0+dUj6KIAvfHCPg3N+uAv4vg9BOxcCmfEzuP/genpmeqhEMgude10Jwm+DuUIyUdTlqu2byoMfX/dRermBeExHsTiWNi3+lMpzRwDki8zxCIATmzbevfmClukiP5NFhJgwkjeRTeLShdOoVJqnAgwkgCAZ6+UdLC9twjQZ8pdzioFkZBHY3q6B3l4dJEEEPOCeD4cYVH7Xsf15F+FImC775INAJBJSkVoWo0QY9YqgiR4ZZzRaGBkdwK3bFxGLRZUfB3Rm2x4x9CGtsUxH9QYkKICDFuLxKAozGZwdTqBRs2FbLlXbiPdECMCHadj/AaDXZNFqedCIvnRcS4UpRo7+hC5zUmw8Ope9wUFinvpmZ7NKt2RTmB4hKZo6n8qP4Oq1HBkKlVYAQBrUlziB0XQSif4YmQhksgNIJk9iaLhPaV9b/Um+uJSCdzyDbGZQRSkvjo+n4JNxubGUSsCj+ZCpODYjkGMAND2k7exUsfhkCd+29yguB88Wl7FW/o6tT7/gcXqAgGv7hhx1LWBireHVn79YP6ChQ3njb/eFlfWqGqT3H3ZlGIhGI2i2UO/U/wkwAAmoalcxlNA1AAAAAElFTkSuQmCC";
var ai = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAk5JREFUeNpsU01vElEUPTPzZqBAQaSFQiJYUmlKYhoTF41L3Tbu/Q/+AvsX3Bp/gPsuWLrqyqQ7TUxMtAvF1tYGoXwNw7wv7zwYgtKX3Lw379575p5z77O01ohW+/DVh8zj7aYKhflGdG9ZsGwLNydffgVfr19YHvsEa+Zu/nxndob5StQK+dyzvZzyw/gKlmMj7IygFM+xvNcanp4/t5dAomXHBy2UUBOO2MAl/B9/cPb6PULuoHx0WM0e3GvpUOxD3wZAJWutZqYUYmqpSg5OMgH3YQObL59W0/ullpryR3HegkKEqiWBSGV4R3vQ7sIhScTZFTpHx3A215B5sluVY/WWMg7+ATB/lcLsKpTonHzD+OMFEuTz8ikkt9Kwt9YJZB38cpBdoQAZJdLvCGByfoPB6Xdk90pYy6Xg3c/DaWwArg09DaG5lCsUFN0pckZAojdC8m4auBqaALuSgez7VB1RtDSUWOQvUaBLFUzJBMJ2DwmPgd1Jwm0WoSgJfjDvrTKxtwAIyEkAOQ5hU//Zdg5uowDlUNMnwZLW0sSuUuACYhwQRwFvJxupCjEYUUccOkoaKmdOlZnY1TkgAcXAhxhOwLsDsHoN3u4O5JTDfVCH6I9nfjId3gIgSUATFJk/hVevGtOMwS0XwQ3AzB/FrlKg8Q27I2javVoZrFgwD4qVipAEyMlnaFArzaj/D0DiMXlJAFQyK2r8fnMMRZp4lQ1MaSL5tU/1kqAkMCh2tYI+7+kh70cjPbr4bEZ51jZr8TJnB9PJXpz3V4ABAPOQVJn2Q60GAAAAAElFTkSuQmCC";
var aiff = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAohJREFUeNpkU9tqE1EUXZmZpE3aTBLbJFPTtFURtSCthr7UCyKKFJ/9An3og6Ag/oXfoUj7og9asCBYKT6UIPHaWtpq7NU2aZK5z5wZ9xxMpMwZDuewz9prr32ZiO/7CNaDx3OLt6fOjBqGg/aKRCIInp8+KzfKH7fudnVF58nE16el+/yU2mBFSWZKpWJKVc0OgUBo02K4NDmU6o75Mx+Wdu9IUXFeiOA/pn1xHeYaugVDdzpbp91qGlAKGTx8dC19/Wpxhjnsxj/RRwk85hGJC9d1O6fneWAuoztDYSSLe9OT6SuXB2ccx73Z9uukwDwfls1g0xZIY/Ad/Gnyt/XVfbyYrSDRE8PExHB6/8B6QuaxIwRBFMt0iIAiMx+LCys8jfGJEUik2WpZOD2SQf9oDtVqQwopCAiY66FS/om3b75CVS2MlU7AJ2WiJBCZjZ2dJuRkDJZFwFAR7UCBja3fNfxY2YEoCtRCj9em3Tpds6FpJseGCBxS0GgYGBzqw62p84gnYnAI2CSbSbPhEpFAaE2zODaUAlWWwDoS5DheGqbWpVE/0CmqCY9qkEyINBceb2uADRNQ8bSWAVVzIFKomCQim+0luS4yKYlsHlRyZo7EsSEC23K5vAsXh/H92zZkuRvxeBS5nEx2yp2KqhxPoV5TYS/8CtdApylM9sZQKKSQzyeRTseRV2QoAzIYY8jme5DN9fI0dQoUIjANGydP9VM7PZw9p/AiBpNYrdbw/t0yTJqRtdU9UrfJCUMpSJIgbWzsYe51BcViHzLHeqCRqhZ1YX1tFwNfZBxS9O3NWkAcHqR606k/n/3coKAoV/Y7vQ/OYCZevlrmv3c0GsFh06u3/f4KMABvSWfDHmbK2gAAAABJRU5ErkJggg==";
var avi = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAm1JREFUeNpsU8tu00AUPXZcN0nzTpq2KQ3pAwkIAnWHqCoeexBb+AQ+ABZ8A2s+AIkdm266QUJIFWKBkHg1KpRHi5omJGkbJ3bGHj+4M1EQrTvSyGPPueeec++1EgQBxHp+/9mbyuriRZdxjJaiKBD3W+u1+p9a856max+gDO8ebT+WT20Ezi9NZi/crqadvn2MQBAGfpCOpqNru2937vxPIpY6Onjccx3Twck9MBiSU0ncfHirXFmZX3Md9wqCUwiEVN/zaQfHt0vfbBe5uQyuPVgpl5Zn11ybL4/i/lkICOw5niQRGQShoiqI6Bo43W2ub8n3hRtLZT7gTynk6gkCX9gAOxpAnxhHZDwC1/aI1EViJolu/QhKRMHZ1UX0Gr1USIEn5FPWHy+/wTokkrQOq2vBaHZBN4hmY9Jwfr4An/teiEB45ZZDwDiMhoExT0N+sYDCuUkkplLIlXP4/XEXdo+RUhdhBSSfUwtVTUG8MIHK9QVqI7D/uY6vr2pwmCPrkz+Tk9gwARWQ9WxppbXZhNnpw+ya4A5HZi6L4lIR8WyCcL6sTZiAWjWgAmpxkn5+kqTamK6WkCwmERmLDLvjB0ML9ikWXPLFuozYOap3L8HYN6DHdbS/d5CeTVBndBz87FCBLYkNTyIjBQemnIEsSY5lYrK1+UoWcToLMjEHAyIQ2BCBSx/NVh+ZUhrqmEqBebS3WyhdLg0zt/ugAaIklsSGLHCLa6zDMGhZ2HjyGsnpFPqNHnY2fmHv3R5SMymYbROszSQ2ROAY9qHiofvlxSc5xsKKqqnY3diRE9h4X5d/pzg7lnM4ivsrwADe9Wg/CQJgFAAAAABJRU5ErkJggg==";
var bmp = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmZJREFUeNp0U+1rUlEY/13v9YV0vq2wttI5CdpL9aEGBZUDv0df668I6n+or0UQ/RuuD0EgVDAZrsKF4AR1a6COKW5qXvXec27PuVeda3bgcF6e8/ye5/d7niMZhgExnK9fbTrm5pbBGMZDkgCyq+VyhTUaT6Eo2ZHJePPWXJXRhez3B1yxmM/QdctXUSCgtV4Py4CvY3cky4e1x5DlLCaGbbzjXDcousG5OQe5HPRSCQPK4PpsEM/XH4WvhS4noeu3JwHGGRiULhsMoKZS4I0GtEIB9mgULJGA0+9DPBpBT7sffvf1W/Lg6OgJufw8C0CRGEXWazUwiiyFQjA8bsjVKjaJzovMD/Q5gxyJhG2cvyeXe2cAuADQNGBmBvLaGuTFRaDfh31lBTWi9pumjbK0B4JQul3vOQpM8JdskOLrdCvDcDjAsjtg5TIkoiKLaokMNR2cnZbqNAMycqG7XbHKR2fMzwO/dsxSwu0BiBJsNsv2LwAJAJCI5ux2gXYbqNetcz5PoORI1cDS0n8AxGW7A+zvEYBKZ2ZlcsEtJLbedMjePBaCTQMghx45ulyWkzxMVUQ2RMQhLfFO16YAqCrixPnm6iqKrRb2W23EfF4cUNSrHg90cr7hDyB33MTnSmUKALVs4uIlROjxg+AsPhGVl3fuIl2tIOB0Ya91gkOi9mxhAal0ekork1ic/kGLBORMxy2K1qS9V1ZQbNThIj2EGh+2tsyOnSai8r1UxMNIBB+LRTTULr4Uds0K1tU/uOLxIrmbNz8XXSrnASSpubG9fbKRyVh1n/zSw29t9oC1b47MfwUYAAUsLiWr4QUJAAAAAElFTkSuQmCC";
var c = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAcxJREFUeNqEUk1rE0EYfmZnkgoJCaGNCehuJTalhJZSUZB66a0HwXsP/Qn+FM+9+hty0LNYCr2I7UVLIW0Fc0hpQpSS7O7MrO9MspuvVV8YMnk/nn2e5x0WRRFMvP/w6WSz5jbi/9NxfP693Wp3DrJCnMW5d28P7a+IE15lufR8o1ZEStwPhkWHsWbrZ+eNEPxsuubEF6m0TBv2Q4liPofXuzveulttSqW2UwH+GjqC0horpSL2njU89+FyMwjlTlxOJMTa9ZQHzDQIjgwdom9zLzfXPc75kbnOAswBJTlC2XrqQRMLxhi442DgB4UFBhgPpm3B5pgBHNUUxQKAHs8pHf3TEuFMetM9IKr/i2mWMwC0SnuSFTG2YKyppwKYVdGO7TFhzBqGIenVeLCUtfURgErucx5ECKREKBU4d3B718PHz6cICGT/1Qs8qpQtGOdyhtGEARWDQFqQJSeDL98u4VbLaKw9IRAJPwjtoJGlVAoDQ800+fRFTTYXcjlcXN2g++s36p5Lzzlve1iEROa8BGH1EbrSAeqrjxEqicHQt8/YSDHMpaNs7wJAp9vvfb287idboAVkRAa5fBYXP9rxO4Mgf0xvPPdHgAEA8OoGd40i1j0AAAAASUVORK5CYII=";
var cpp = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAfJJREFUeNqEUs9PE0EU/mZ2WgqpXX+QIDFdalVslh8NlAOQaOKFAwfvHvwT/FM8e/U/MOnBmwcj8WD0ACEGghIkbU0baaEthe3OTJ0ZWV26q37JZt68ee/b9733yGAwgMbL12/fz+azbnAPY2Nrt7Zfqz9JMrYZ+J4/e2pOFjiciRvXlgp5GzHonXk2o6S8V6k/TjBrM/xGA4MLyeOSPZ8jkx7D+uqCU3Amy1yIYizB36AlCSkwfjWDR4uu40yMl/s+XwjeWThQQ4Z6QNSnSkYykcDXasP4lmfvOZTSF9q8TDBEFPbN5bOqCglCCCxK0TvvZyIV4CIxbgpC+4gm/PUmFCIE8iJPyME/e8Lon9j4HvyHYLjKSwRCSEUgf9+15mFbx8QS6CZJMzJ9SlBCwX3fJDLG4PX7ykcwkmQmJtpEhWa7g1dvNlSwjwelebz7tAXLolh0p/Fxe9fErK2WDFGEgKjxfNjegX0lDTc/heNuF99/HGEslcKXwyoazWNDdlCr6+DoJgrBzdI0T9rYO6yg2zszMlaKM3Dv5OBzbuyZuzm1B16U4Nzz2f3cFOx0Gq12F9cztpExncsqYoaHpSIKtx0zJdVIFpHQ6py29muNk1uTN829o/6SHEnh80HFaE6NjmLnWxUJy1LyTltB3k8BBgBeEeQTiWRskAAAAABJRU5ErkJggg==";
var css = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAk1JREFUeNpsUktvUlEQ/u5DoCLl/RAKKKUvWmIxjYntQtcu3LvwJ/hTXLt16coFC2PsojEaMKZtCqFaTdGmjbS0CG3By+vei3OOBSGXSU7uzNyZ78z3zRF6vR6YvXzzPrMUCyf68bB9zO+VfpROn5hkOdfPPX/2lH/lfiLidztX5mN2jLGG0rKLENIE8liWpdzwP7HvqJqujmvudFU4bFY8Wk1FZsOBtKppd8YCDNu77CZevd3gflfTUFcUhP0ePLibiIR9rjSBpgwAfe4dVcV6dhtep4PH5msylGYLrzeybErcT85FYiH/CyPAf74gObC2vMhzsiRhPhpC6eQUM+EA1pJzILEnjRSuJsju7MJqsUCSRei6Dp3yXqcdGlHZ/rLPazQWGCn8+6YW4pAkEW0SjzUzanWlCa/LgcR0lNfovTEi6lcIkzesnM/R8RlN0INGp3h4DHoDsE5YRvQyiKiRSMzikRAOS2WoqoZWu41K7RwzlOOAVDMMMHhIGvFlRxJFrKYW0ep0IYgC3SDh4b1lTJjNfENsrazOAMAw680mPuW+8lFno1P4XDigRhOiwQAyJK7TbsNS/PaA7giAIAhYz2yRgBIfsVA8wIetPG6FAqhdNrC5u0f+TUyHgyMTDDToEt/ftQsEvW4EPG5OZcrvw0mlimarTXkPfpXPcNlQoGtjACgpryQXsPNtH/nvRXqBJpoKHMzGNkNB0Odls7LNyAYKpUq1dt1iuvB7fRDp9kr9D1xOFwkpoksXusmXaZWFn0coV89r/b6/AgwAkUENaQaRxswAAAAASUVORK5CYII=";
var dat = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAfVJREFUeNqMU01PE1EUPe/Na0uptmlASg3MoiZgCA3hQ8PHAjbqwsS9C3+CP8W1W/+BSReyYUPwI4QAVkAgUEgIbVIg1FZb2pl5b3zv2cHBjsaTTOa+e989OffcGeK6LhTevFv+OJoZHPHOfrz/sl86KpWfhxnLe7lXL1/oN/MSZqonOXU/k0AA6lfNhEFIrlAsP2PMyPtr1AscLpyg5pbtIHErhqez4+awmc45nI8FEvwNaiQuBHqTcSxMjJhmX0/Osp1xr878FxWEzwMinxAzEA4xFIpnOjedHTKpYbxW4U2CP4j8uWxmUKsghMCgFI2mFe9QgHZj0Ba4yhFF+KvGJToIRLuPC/efnjD6+26wB1Lq/xgbSCBXKeWJG/OTdky8cWTdT3C9RmWSGk2XCLlWo4xTNbfN5qh7PpXM72GjZeHt0gpq9QbmH4whGb+NpU/reDQ7hcWVVXxvXOHxzCQopQEKXKEbL6o1ZIcy+LC5g62DY2zsHeC0fA4zndIrHOjvg2XbAQRSfsuy9XxC2qzi/H5B6/68W0AsGkW0KyJPBLbDO0fg3JX/CUM81i0bD6WKe6j9qOPJ3EMcF0tSNsFA6g6alqW+VtZBUL78Vtk+Oqne7U9rs5qOQCjSheJFBeFIFOfVujSUYu3rIc4uqxWv76cAAwCwbvRb3SgYxQAAAABJRU5ErkJggg==";
var dmg = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAn9JREFUeNpsU01rE1EUPe9lkk47yWTStCmtNhFSWxos2EXVhSsRcasuxYV05V8Qf4DgD/AvCK5EV1oFI7iUBqmCNdDvppq2mWSSzEzy3vPOpFFq+uDNfR/3nnvueXeYUgrBWH1/9/NE7k5BKRnuRcfF2qdnmJq9DeF9tQ+2isuMsxXGWHh/a1mEVsPJSI5fSU3OPEj291IIlN49RXz0KqzEQjIeZS/L5Y/3wPGhDxIM/i/A7fZWgVG0t5EaG0ZUa0JGM8gvPrZmLt58QYwv91mfAqCIE0sAqgumBFITGQzpUYhuF0KfRa7waDyXXXolpVrsh/0tgSLDr5I+wUZo1UHCSkAficPzY6juFSmbRPrC/azjq+fkcO00gAqoU7B0ETKkfWbuCTjTYeq5oESAauexcTScX+ZACWFm0YQSLZKhHdr67+/wW0e0dgjYo3sCEXXybYtBDVSHLp2es3IpsILS24c42lkBg6DzRjgRzCDZ/xr0GNRJwwYiWgzt+hYMawleu0V3wbkT+kUirOc7IGJAz68R/Qak1BAlx3hqASPGBJRXpXOv58dkz3eAgQoOm4hyj57NgZm0MHvpBmK6QdUdg/DAg9cRkhicBSDaKJdeo1bdxmR2DtWDDUxl51HZ+QHTysD3XdQO95Gfv06aeGcAdBrY3Chi8lwO3768QWX7J5q1XWyVSxgajiOXLyBG2hzurRKV9lmt7ISNkkjo6HhNyjoK+2gXRsKE57ZIE2ot10Z1fz0Ue4ABVw3NMjnW14rInh8jTYywoTg3EOFpOM4mXNfH9PQUfGlrAwBOs3I8ljbtuMWhRWzIIPrkn+GcYcgIWEowbZ+0qB334/4IMADESjqbnHbH0gAAAABJRU5ErkJggg==";
var doc = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAppJREFUeNpsU79PFEEU/mZ39vZu77g7DokcP04BBSUmiEKCSCxs7Ei00JAYO2NlTKyMrX+CJhaGwopSQ0dMtFEsbDRBgiZEQIF4IHcg+2t2Z8eZ5QDlnM1mZ9+8973vfe8NEUJArfSNhzPG0VIfeIiDRSDkw1cWVt3N8rhG6SdSO2Gvn8dfuueqZwuNZqk3Jxg7iNcIfBbgXD6ZC8u5qffzX8eoYeyDxC77uygKhcouovgVUQj1H4YB2ovNuD9+tTTU0zMVBmG/+C8AIYh8F361DL/yE5HnADKYlVdg6MDAmW7cuz5WGuw+PsWDYGAvbL8ECFUt4K7/AHd/I9c7BLaxinD2Ld5Zo7g78RLuRhlBS2cpWbGfStfhfwCEpK0nUjCbWuGsLciSOELPhkq/YgdY3l6HsLfRcLYf+pHNbH0JigEPkLAyMsiEJ7NrqQzM1i7wyhoMZqOhvQs6Z0ovXgdAJACRoulEg5HOwrOroKk0zOY2BDtVpTF0CU6kLkQJXa+BNEoG0lMSsBBKQXWNQktmoGcaYeSaQCIVWOvUYQAiWZFQtk5mSMoSzEILtBrTfEcviC5bwVwQmoh96wA0ic5dB57ngeoaTIPCdb34zDITYNLOOIeVSsW+dQC+7+NSWx6jJ4tY/rWNV7PfcGv0tBoPTM7M4eKJVgx2FTE9u4QPS6x+kHzfw/mOAjarW2hJG3hy8zIceweuY+PRtREMdzbjzcd5WBqPB6xeRGUMGRzHjWvMmxQ7tiOF1JBN6FiTd6Sy9RuFbHpX7MMMqOD088Ii+op5OUAO7jyeRGfBwrF8Cg8mXuDL4neMXzgFwhwZz+hf7a9d5yu3Z6DTPjVQIY9k7erO7Y63Lvc8ErEeyq6JaM6efjai4v4IMABI0DEPqPKkigAAAABJRU5ErkJggg==";
var dotx = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAndJREFUeNpsU01rE1EUPTPzJk0y+WhMStW2qdVWxUVEQUF0I+4ELQiC7lz4N9z0T+hG9wrdZKUgLqulhrbSag1CKpT0g7RpYjqZmffle5NEKdMHlzfvvXvPPffcO4aUEno9f3Vt4dTp+BXOe+fB0u/NbVpv7h89NU1j1TCM8H7+xY9wJwPHZMbOjRadLAvE/2gToJTiTPx89k+OlVd/LT+0TPIPpO/SzyQk40xCMxBSZ9Z3CoAx5DOjeHT7SbE0XSpzwa8OWB9jINELolQg8AR0EgUKn1PIlIWpkUt4cPNxkTOU12trs8p95RiAXpqaztqou8q6SKQJJmZSqGwsodFsIJk1kcyLYv7IeafcLx4HUNkFF4jFTExMZ0B9DrfD4HUEusYhWs4GPEJg5wly/tBYRIOeDhpEwlS34xcyajdQr3UwOT2MlJOEBRuGNHWp9AQRVXDfQiFV/U5GBSiQ5p6ngBEa5z3fiIhC6g6IMDBwOdoHPkYnHPVyhN0tF7E4QSpr94CEOKELffq+y9Bq+DCJ7rWBoQQBVbPR2O6G4OlsLASJMtCZfQqm0NP5IVWnamdAkUxbyuIYtD7wWegb0YAzAVMkkI6NwPM9xEwHloyDGAmk7AKS9rAS0FKOdugbYeAHPu7OPEM+MY7q3hIKqTFQHmC3XcONc/fxdfMDrk/ew/edzyhvvTmBAddocVRqH3Frahau56qpZDho7+PnTgXffi/gbHYmLEvPSIQBp5JU62sYz13G609zKBXvoOMdYn2zgm7Xg2MVML/4Eu3uPgxhk2gXmNl8v/i2pcXTP8tKdTEcbWLZqDQXwu/l6pfwbEnSGsT9FWAA4mdHv2/9YJ4AAAAASUVORK5CYII=";
var dwg = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAoFJREFUeNpsU0tPE2EUPfOg006hD4rQh8WgbCSwkKgbF2owujaCiQsXxpX+D6MmbtXEsHCLmIAbE6NLo8YlGIxREIshIqVl+mQ6j8/zFVCb4UtuZua795577rl3FCEE5Bl79vPd5LHYiOP7cH1AUWi85ytmvlas1bJ9E5ryBntH3BpuP/X9i7ovkluuiE8N9SDepaLpCcRCCqa/VDCaMuIjSWP25Upl6n+QDoCz6Yh7KKzh3sI2LuUimPtRRyaqodj0MDloYiITSTi+mH29Wu0AUf9CsZPJoW5czJl48LmCc5kIKo5Al67B9gUGYxrun+5NnMlFZ+GKiQADj2a7AquseLIvjMv5KMaSBu4sWVir+3i8VIVKYSby0UTdFU8Znu8AYBHQgVOJEN5uOXi4UsdawwU0FSf6TaSoyw6DRvukPkgGWpDKy4F8a3jImCrqFDFn6rhKPR4VGnhvOTAY3WLcjifcQAsqRfhUc/Gq1MKNbBh9nIAMDjEppocxs9HCMktfGTCwP/oOBkUKNk/qF3pDYC6Ktk8RfWzyaaoKrqdDaBDwya8W1m0/CPCR3kFy7CcnmWQRUJqcRJFUKtTnPCeR71LwoeYF92CYyVnCFZpCTrRtCv5to2St8SOrKxiPqEEA4fkYT+mI0rdoeUiH1XZVuQPpsIKqw2QmfifTsnOABiWySlH9uU0Hh2MqjsZV5LtpPSoGeN9rKnhBX7ehoOSLIIPfnGONXGMMWN7xUfVldYDbjM3mrh5HCDgS17DhHgDQcIU+XbBxnDTn1x1UuQcJ9iv7l5Q5e1zLGri92EDJFnoAgHtcfr6wbbVXUqq193+0z97n3UJt1+d51n7aHwEGAAHXJoAuZNlzAAAAAElFTkSuQmCC";
var dxf = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAo5JREFUeNpsU0trE1EYPfNMmtdoH2kDNmJbaVFcaBVFpAsREQpFwY0bu3HjQnTj1mVd+ANcuC3qQixmry6E0kWFVIQ+bKy2tbFJm3emyXTujGca+4DkwsedfLnn3POd77uS67rw1vC79ek7fZEzpu3AYUqS9tKQGZPLpa3VXP0uFCmJ/8t9OLC3q/uJbcs5bkIybvdHoMsSbLKENRmvU2WcNnTjRFD7ML1WGSPJHI6sA4KRWMAWVDPxLYex3iCmfpuIh1QsFSyMxQO4GvXHHwOJ6XWSyIck8v6HQsnjAxFc7vTj2VwBg4aG78VdBHQFCk+dbVcxMdwev9gTSEC455sIBOu2KLsoJFzqasP9vjCeDBlYqzn4VXXwarGKZN7Crd5QfLDT/7KpBM84c9fFUFjFp2wdk6smflRsKKqMa7EgfJJ3Ac2OKlit2pEmBTQfngdpnupoU7BUtRGiiTe7fXiRqmK+KuDn6TpvYogmBRJcrOwIJLIWxmM+dOsyLKryQAaJpjJ1/AxrGO3SqdZt7kKZJrzJWBg5piHENuY8vV6e0UOye1TyftvC5l+gZB8SHJTwpSx4q4JeTUKaxhXoR57h7Rn+3iFolJ3xvPhab6HgJG/pJ7jsNP4sUX+jZiCgEsWd/DjH5IrSYpBUAr0yHpzSoXKOP25a6OBhndh0zcX1qIYM2RIbu6i0KiHD5B/GTMHG03kTGpEL7H80wHFOWwhqDZ+SpkBOtCDYJDhZE4gRcKNbYynAqbCMbXpwpVPFbEng0aKJGbYzK1p4wIegLlcEPmdt+DjXbzcsxFlCynRwwVAwW6hjqeg0Zt521SYCWCJvbe0Un29UDx7Hgrs3IEitHXkw3jOv2fl92D8BBgAJeyqBh90ENQAAAABJRU5ErkJggg==";
var eps = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmlJREFUeNp0U01vElEUPfMFCEVArdoSqEA0KV246UJdUJM2Lo2JK/9FjXu3utJqTNz4D9worrsQExbFpAFT0TYp0CZ8pIAiyMfMvBnvm2Foa9uX3Lw7c98979x77hNM0wRf7ufPsq7Z2SQYw2QJAkDxQalUZa3WI8hy3gmZr15bu+z8kILBkCeRCJi6bufKMji0NhwiCQR6iitdatTvQ5LyOLLEiWcYukm3m4Zhmbq1BX13FyoxuH7xAlbvpqKRK1fT0PWbRwEmDEyiy1QVg/V1GO02tO1tKLEY2PIy3KEAlmJRDLXb0TeZL+n9g4MHlLJ5HIBuYnSzXq+DlcsQLk/D9Hoh1WrIUjlPcpsYGQzS3LWoaBhvKeXWMQCDA1D9pt8PaXERUjwOjEZQFhZQp9L2yERiqYRCkPt/z58ogTGqHQLE1BLgUmC6XGD5AlipBIFKkbhanKHGYLBDqQ4ZED0OAbfLlo8OIxwGvhVgyTHlA3xkomjH/gegBgDURMv6faDbBZpN+/tHkUApkdTA/PwZAPxntwdUyjYA/+ZMqJHjLgM9iv/6zRt2GgMaIE21aVIjnSm0DGPfmhzyde0UAE2Dj+p7urKCPvkZku9eJILOSMUnkvVhIo7GYIB3xSKYdhoA1erXGVKXpvFxZwdBonnD68PQ7YEwM4O4xwMPxc8RYE87g4FIcz+kvfmnA0YzIJIy77/m0OCqsTkkCTysKPjJG3viLei63Gm3kCO6UWqcMejjxecMPmxsoFKtYop6UNirYL9Wtc5OHqzznIXHq1na7OfMJROcK8a6O7MjW7nfzZdrd7jzT4ABACh3NGsh3GcdAAAAAElFTkSuQmCC";
var exe = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAo1JREFUeNp0k8tPE1EUxr+ZzvRJO62lUAQaKIQ0FVJFjBBdoIkrDDHuXJi4NnHtX+HCjW408Q/QmHTRaCRRohIJifgiiBICTQu29mHfnc7MHc+MlECKdxZz595zf+c737nD6boOYzxJLC6Nhwej7e/24HkO779s7G6mMjcEwfKZ21+/d+em+RbagaFev28qEpZwzKg3ZckqCPH1nfS8hScIdyhBe6JqTG3PfyTTeLrwFhvbKdy9/xi5QglXL0yGJsKDccZY7LDIAwWHpSferWBh+RN8ni4UylVER8MY6PHj0uSpUK0hxzfTmWsUtnoEwO3rer64jEyxim6/Hy67DXaHExvJX3jw7CX8XjfORUdDlOohhU4fAVjILCPbm9V1yIqK2FgYt+ZmsZcv4lH8Nb5upXD7+hVMjIRQa8qeDg8UTYPU5cTcxSk4nS709XTD53ZhpD+IYMAPj+TBz93fZiz5oHV4AP1fGdlyHZIkIZkrI7GyhnK9CZXy+Aig6p1+HQAY003AcF8AVtGGfLWG9XTO4MLZ5cL0WAixoT4zVmPHADSiMo3hzHA/xgeDWFjbNg8H3A7kKnX0koEcPdTu/ylgRGZgOjNv38zoSXC8BZJDRKOlwGEV0VJVGM0y4joAPO1spXbx6sNHeD1uRIYGUCxVSRlDt1fC8rfvcDnsmJ+dOaLgoAs6AVLZPJJ7WdhEkUyT8GJpBflSBcVKDTvpDBw2GzQqQT1OgaZqUOhtFQUTUKnVTVWNpgy51YLVKph7sqKYkA4A1ScEfT66vm5kC3+ofh6Xz59FQ5bpkvE4QW3M5Apoyorhl9ABIKnFgNdTOh2NkJG6WSf9eRBJtmFwLDJmriUzeaOkYvvcXwEGAIVNH6cDA1DkAAAAAElFTkSuQmCC";
var flv = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmtJREFUeNpsUl1PE0EUPbssLYUCXdpaC9gWoSTgAyFigiRGY+KjvuuTr/4A44MP/gx/gMYfwIsan0RjIjGiJIZgSIGFIoXSD0t3Z3dnd70zpITazuZmJzP3nnvumaMEQQCx3jx69SV3a3KWMxetpSgKxP3m242Do43SQy2k/YRydvds67n8a63k+FRSn7l/bdg5tdsAuM3he/5weDC8vLdqPLgIIpba2niux52mg//DqlsYSg3iztO7mczN3DJ3+ByCLgCBH4hOFEF7cDpzPCRyOpaeLGXSc2PL3HbnW3XaRQCPEgWI2MsRVAVqrwbX9bHxbhOKpiJ/bzpDOr2k68V2BtRNzMtqDEqPejY/4zSGjb54BM0mQ8k4xsDoIMauXxnqYOD7PmwScP31d0SS/eAuh1lrolFpIBQNQw2pqJdqsAlIceB1AJCIkkE/FZskXDQVRXw6IYHiE0nBEcaPXSSvJnGwWkQXAE4acAhbxPMJpOdHweoMhc9b2F8zwKizbdlyPLVH7QLg+JKBYzoorxzjz3oRzUoToaEw9KyO8XQW5AE5jrFT6AbAYVVNxCZ0Ka3So+DSTAoDiej5ywTySbls1OEDobhFlMcXxrHw+AbINEjNXgb7y6BndLhk8cRkHHbD7g4gEhiJFxsdhrDqaamBaDKKerGGSKwPI9kR9EZCaNA5ubE7A5s8IFhsrxQkgJhZoa/06xC5xRz2v+3BOjFlbqcGlquxsondT9vY+2pAJdeZR6fI355CgQCN2A4O1w7gkQ7cdLUOAKdhV6uFSv3kd/n8mT68eC8dKWLnY4FsfeZQh7nVVt0/AQYAsf5g+SvepeQAAAAASUVORK5CYII=";
var gif = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmVJREFUeNp0U0tPE1EU/trplAqlL0laiw40xASByEJIZFGVnSvj1j+gWxNXJq7VrbrwF7h10cSNhMRHojEuACVBKmH6SJQyJeXRxzzv9dyZPiCtN5lMe8853znf953xcc4hztDzZ1+C6fQMHAfd4/MBFG+p6h/n4OAeAoGNToi/eOm+A50LKRaLh6amoty2vVpZdotNXccMEK3LwZxa2bsDSdrAqePv/mLM5tSdMwYBYqyvw9zdhUn/L59P4OGtG8qlZCoH254/DdCdQBCxqZu+ugqnWoW9swN5ehp2NotgIo6bGQWGtaS8+vQ5V9a0u5S+1gfABEilAqdUgm98HDwUQkDT8JXoPPq+BoM5kCYmFT9jryn1+hkAt7heBx8dhbSwACmTAUwTgdlZ/CVKJaLnI1GD8TikZiPSR8Gxib8chH95mZTxgwWHwH7+gFMswqcokIRbjMO2HDCnZ1VvArpjEmnKZc8+cZJJYGsLsMiZ8AgwEqaY6Mb6RQR33JFhGECzCRyfAFXNu9v+RVNRZWIMuDJNuYMAaDycUFGhCOgtuAtFVDA83G5A8TrFDw+F5QMAxAKJJxz2xnW3RPJGbm+rCyjotZetH4DGzaSSeDA3h4Zl4R0JOEZWTpIzF4n/m995bNdqZwB6m0gFft3Ak6vz+KYWwFsGlqIxXItEcDt1ARMEtKdVgZb+fwA0G2C2hXM0ZTZNRcSf0b1pmXi7uYnjI+Lfanm5fRQsK8BIxKcrK7i/uIgP+Tw+FlREqHN5fx/vyU4uHBE6UO4gDWqk/JFaLuMxcXeFk6TuJ90V0HOk1in7J8AAjmgkPfjU+isAAAAASUVORK5CYII=";
var h = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAbRJREFUeNqMUk1Lw0AQnf0woK0ttVqp0hwqVCl+UBERT94F7x78Cf4Uz179DT14F8WbYHtRkBYRLNqDtdaPZLObuLs1NGlXcWDJZGbey+x7QUEQgIqT07PL5WKhHL5H46J+22q22vsWpbWwdnR4oJ80LNiz2czGUjENhvj4ctIE4Wrj8XmPUlKL9nCYcOFzE9j1OKSTCdjdrtiLdr7KhVgzEvwW6krC92E6k4Kd9bJt57JV5vFK2KfRQRV+RAMkzxglYI1RaDy2dW1rpWRjQo5VGicYIorWVooFvQVCCAjG8Omw1MgG8AM0uSBUDSnCfk/IGCHwf3DCD/7UhOLBrFkDuep/hDUSSCv1iYo4rIfqGwmUSNJjfYbBcQKhZw0aBMA4B48LwBhBt/cON80HmM9NQ6fXg/Wlku4TwmNWDzaQqzHG+0PSKod5cH5Vh2RiAhYKc8DlV1UPSyuFMGygVlMg1/P6BC6DqXQK8jNZDXAYA1f21V34wMXYFaiyVw0rJyzLgs3VMkxOjGtix/V0XWChZ0cI2i/dzvXdfTd0Qf91BMPrhyNzgKfOmxaWypqaDXHfAgwAtCL8XOfF47gAAAAASUVORK5CYII=";
var hpp = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAehJREFUeNqEUk1v00AUHK/XKf1yZdESVRBXjRSRFqMQVBA5Ic5I3DnwE/gpnLnyG3LgXglx4UDDLZS0RWkDLiRxSusk9u6GXSembmLgWZbX7+2bnZl92mg0goo3b3ffO/ncdvyfjHef6q2Dlvs8Q2ktzr16+SL60jhhZ69bO8X8ClLC7w9XdKJVG8fuM0r1WrJG4gXjgqU1D0MGc2kBTytl+7a9XmWcl1IB/hZKEhccq5aJJ/e3bTu7Wg1CVo7rNLlRhUh4oMnXoDoyhoHGyWmUe+QUbELIa7W8CjAFlMzdzeckCwFN06ATAn8QmDMMMGlMuwWucpoCHNe4jBkAMenjYvRPTyi53JvuwX8AplleAeBcRFrH6rXIxLim9I/pi3QA1RhKaYxdjkN8IwalCMIwWs9ljMkh0wzk+9M7w179C3LZNXxve2h+c3Hu91HeKmD/6zHOLnw83ilB1/V0CeqU3Q81LC/O41b2Btx2N2JVP2riR8eTUxmi0TzBwrKZMsqMoz8MsDh/DWuWhUBKURLKxQIeOMWoptYPnS1c+INZBkwISomOSsmBZS7B+3WOzZvrKGzkMAiGqNy7g+LmRkRfekBnANy2163PZXrSbrQ6vch19Xz8fPDHyL39QzkHBKedXjfu+y3AAGU37INBJto1AAAAAElFTkSuQmCC";
var html = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmBJREFUeNqEUktPE1EU/mY605a+hhZTBNKRDApNrWIRA4nEBUZdmCgLNi4MK5f+FNdu3bFv1J1EXODCR1JJSMTwpqUP6NiCpe10Zjz3hj5Mm3iSybl37jnf+c53jmDbNpi9eb+6Ftcisea909bWNzNb6dwzSXKkhIt/r14+515qBqmDA8HpqKagh53XaopblpIbe+knDpFAhPab2Dw0TKvRK7lmNODzePBgZlK9oUWSpmVNdpIU8T+jaMsyMaD4MDcZVa+NhJMN00w0n6V2nN3yQgdHWZag+LzYPTomIAtT0THVtPGanmb/BbjwLFkvn2IttYGYplKyDzsHh7gdmyAWfh5zVq0Guhg4RAHFUhmfvq3j134aXo8bd+ITnMFOOovU5jbGRoZwNxFn1cxuAIcDW/sZDjA/c4u+BNxOJyxqaenpI3z88gMfPn9Hv98HQZS6RazW6kjExvFi8TGdDSy/W0Emf4LS6R8sv11BmfzSwkPcm74Jo9Ei0GZgmkw8QCOao8OXcaz/5vSZnPdnp3ApqBBLkWJE0Ci7ASzbIhCLLQ1E0iOkBDh9NpUgiUejo8oNuJwyn0YPABtn51UYFFivG3yBGCNZkuDtc/MW+ZQI3OrYpBaARCKufk3B5XIiWyhiL5ODp8+FfFHH+KiKSqWKUL8fC/NznGlPBmz+24dZjKnD0CJDcMoyW0SqXuMtHBFw7rhIAD1ErNUNafxKBNevapwu65NpEQ4FqXIA+RMd6VwBP3cPSERb6gLIFIq61+UqGWaFdcrVt/lmAuWjAi2aiMFwmOYuIJ/N6M28vwIMAMoNDyg4rcU9AAAAAElFTkSuQmCC";
var ics = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAhRJREFUeNqEUkFPE0EU/mZ2dra7bLNpi2AxQFKalkJrohICiYkXPagXrx78Df4K48GDBzmQePLMhUODNxQ5ciEkJVqDtJGmMWrCATRbd2ecoS5u3aovmezsvu9973vfPiKlhI4XL7c2r5YL81LIELEghLA3u/udxmHnPmfGW/Wuv+LpwwdneRYBx7PeWK0wOYYhcXxyckGV1fdbnbuMsXcklqPRJQxFMKz4RxDCtVO4s3xlRjWoB0FYjlQPEEBieChwKCRGMx5uLtaKs1P5ei8IKlGa/YkXMXYtlTEDlsnw/mMXhBJcqxSK6vlcpa4PEpCooUyIqs5M6hG1o2CUwqA091cFcYLf/sjzcX75EiQIojI9779CTYR4jwTBf+r7GAwh0AxCiL6JMT/04vQ79u8aI2O/7Jzg69o6Go8ewycUahtBpADhHKLnK/eVbkMdtROWIv80NQ2sPhncA9Htwn+9hZG0rY6DzFwJl+7dhs0ZstUy8rduwPS/wd/ehmi3kwq4zTHiWUgXp+EuL8FvNvFl5Rn4xAS86iyI2kY3n0Mv48ByrOQmancdi8I0Kcj3U5iuA29xAelKCUHrEIayzltagG2E4IwkFaQgSC6lYI09iN0d8It5uNV5nG5sgJdKYC0G8WoTOZvBISFNEBxnsuzD3GX4vfDsszzqAu0jkJQDedCGbB6AWg54pYbPo+NGVPdTgAEAqQq70PytIL0AAAAASUVORK5CYII=";
var iso = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAjlJREFUeNp0kstrU0EUxr/k5qbJzdPYpGkpsUJoA2q1oLjTdiGiIC5cuXHlxv9BEOrStTvBnQvRrSAIsejCrlqpsURq2hCJNQ+TNLm5uc/x3MmzJh34mDNnvvnNzOE4GGOwx8+t9XQkfn0VE0Y5/7Z+kHm+dvOhtd3P9c/xwNZh7nWaMYtNUmX/Fct/vlN7/8J5aRRgyzm8xzpRDjGE2aVH4VTqdnoUYg/XkEhmy+Cx3DhA5tMzdFolvg5Mx3Fx9SmH0JIg79Zo3j4GADMIokJTKtjbfAKXU4Y/2NvSfyH75TFOxa9Cmr0XnlPFl5ReOQ6wNMDsoFX6AElqQlNV1KsOuNwS/AGFjEUIDhmn5+/DMM16/9igBowAzFKIswPJr6MjlxFP3sV04gaP7RzMPe6xvWM1gNUBM2UKYlBau3QghGphg29J3gDlLLilWNdD3gkvIIDRhD9yGe2mCV0V4HFXuCxT5Dlv8Dz3sIkAs03FalDxBMQSt9BRBMhNncuO7dyU28c9tnf8C/Q0ZtR4GImeQSj8APLRH772BWcgiFODffCv/t8H9tO0v3RjV7VqkeeXLlzDfvYjj88uXhl4JwIsrYxmLY/M1gYclIvGE9jZfNPrSCD3/QgLyeWTADV6wW9AryIcCkB0u1Aq/oCPumlufoF72vIheaLDr4wCLIOqrYnULA14PSoqpSJEAUilZrD77Sv3LK+cI0+Be8cAbbmAOrob0agtD491LYfkoqvnyZLsWRkA/gkwABL4S3L78XYyAAAAAElFTkSuQmCC";
var java = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAjxJREFUeNp8U01v00AUnNiOEyepQyhQobRBSlVIoRCBEPTAjQsSEneE+An8FM5cuXLNoQduIAE3qopKNJAIIppA2jrOR93aa6/N8yZuUxyxkrXr3ffmzczbTQRBgHC83nj3ca28dD36nx6fvnzrNNrdp4oibyUmey9fPBezEgWVFuYLdyvlPGaMY4fl1aRS+9pqP5ElAkmcnknRwuO+Nyt5u/ETYfyj9WrpZnmpxn2/Ok1Swn/GvtnH5k4TLue4kNfxoFoprRQv1TzOb8cAIu3+ZD7oD/Hm7XuxzqRUNDtdkuLiTmW5tFxceBXlnXgQTAORSMt2oGezUJJJrK9dFWdEH7Ik4dB29LiESeUEJXd7/dAT3L+1ivlCHr8NEzutXTBvbJPPSdO/AH5wysChwM/1HzCGlmAzOrKxu2eCud6Z2Jke2MwThpUXL6Nn2ZAVFTlNw70bK0iRnGAq9qwHtOmTRpsx1NsHyKRVnNPnoMoK9kc2BjbD4vk5JGV5NkBoEPM4FFnCteJFWOS4ntHEfphQyKaFTWFLw704AJ26ZFx/ZEEi3YyY0O1Dmr4EKTUHA8hUnS6siI0DEHLYog+b28RCRuNXR/iQUpPUEQ+NVht6Lodnjx+GXYgDSFRnq97Ed2pXSlXhUSeGhxYc5sKlNXM5DGLR2TMwfZVPAIi+otGNWy1fEZUKeo4qc4ysI+F8VksLIJfYcD9QYgB/DNPMptWBlsnBIS86xmDMTBo/PWd0LB6VZfdEbJT3V4ABAA5HIzlv9dtdAAAAAElFTkSuQmCC";
var jpg = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmlJREFUeNpsU8luUlEY/s4dmMpkWxRopGJNNbiwhk1tItbGtXHr0hcwmvgOdWld6Bu4coXumtREE3ZKu8FgOlC1kIoXtC3jPfdc/8PUIpzkBM7wf+f/hsts24YczuerGUc0moBlYTAYA+i8sbdXtAzjITRtq39kr73s/Gr9DTUYPOeamwvYnHdrdR0SnDebuCbswJGqpX+Uf92Hqm7hzFAG/4TgNr1uCwEJ0trcBC8U0Kb1/PQkHt9JxSLnL6TB+Y2zAIMOJBGLXmtsbEAYBsx8HnqCGKVScAX8uHf5EpqmGXv18VO6VDEe0PXsKABN8+AAgiabmYFNNJTDQ2RUFc8+Z9G0OPR4PKYwvKari0MAgiY/OQGCAajhMNR4nDZMaInrKBGl70SPMScck1NQG3X/CAWLE3/dAWV5hRRVIJxOWNksrP19sFgMqqAebUGYHMI6teq0A9oTVAhqu2sfbYYjsL7lCZ3683gA70T3TK7/B4BNoO020GwB9TpwfAz8LgMtWn/NkV8EHgoB81c7nYwCyBZlEVkHcqMTKFnkmehJTOPvEfCnKi0fAyADJKfXC/h83TaZTJjaa5lANLpOFqAXtlEAorAwO9u5syT5UxLfU0e3o1FMu1x4u7ODYq02BKAMAVSrSNLrK1MhLPj8mNF0vFm+C1ZvwKBwXXE4AGn1WAASazESwUW3BzUSMeJ2o1Aq4sPurvQYSRLwlhRR6mSaYyi0WlpAJrFRx3ouh5/lMt5lv8BLwXp0M4lSpYL17e2uK5wP6lj/c2ZPn2RI+YT8fDvqoyegVLyfG5kBKaQQOfvF2pLc+ifAABiQH3PEc1i/AAAAAElFTkSuQmCC";
var js = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RUQ5ODY5Q0NGMTE4MTFFMTlDRjlDN0VBQTY3QTk0MTEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RUQ5ODY5Q0RGMTE4MTFFMTlDRjlDN0VBQTY3QTk0MTEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFRDk4NjlDQUYxMTgxMUUxOUNGOUM3RUFBNjdBOTQxMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFRDk4NjlDQkYxMTgxMUUxOUNGOUM3RUFBNjdBOTQxMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PoT8zQ8AAAJdSURBVHjadFNbTxNREP52t7S0bktbKFAvTUVaw60YqkExUTD6oD74qC/yD/wp/gh885XEEI0RAyYQUiMpIBGMkYR6o23abi+73e2uc04v1LROMtnZPTPffvPNHMGyLDB7sbJ2ciUSli3U35smkK9t7x9v7n2dD/g8KUkUwWqeP3vKz23NxJGzgwOx0RC6mSgIo+WKuvP56MeUzy2nJEk8PWsGJVVTuhWbpgmHw47FB7d98Wg4mVWK52o1sxOg3Va3PmFp+Q2PdUquaFUM9/vw+O6cP3bxwm46Xwh1ALR3/vL1e+hGjcc9koScUsTSq3coVDQsXJ3wzo5HEs3clgZNMTVdx1T0Ep7cn6//QRQwMhzA6uZHLD5cIFEFSKIU+G8LK+tb0KsGZKcTJoEyP08AbpcLy6sbPKdQrigdAGaDwWxsDH1uGbliCYIgcM8WFPg8Mq5Pjzdyu4jYbCE44EepXMHuwXe+A8x3KKYxYsjvbUzmlPGpBmYdgI1oYjSMbL4Ao1YXMkcM2Dd2xnbAamPQAqg1GORLZdycmYTdJqFKk2DPR3fmwI4zBDrg9RADqxPAbPBif2WTSB584/3/TGegEOit+DRcvQ4OZJi1LgwIQKVCg2i6nb1I7H3Br3QWqT9pBAP9uDY5xjdSM3RqxeoUkfVnEOW8UkLykERTNXjkM7h3Iw6NNvHw6JjuhAhVrba0+QeALozcI9nQR0VvNxJc/ZmxCNGvIBQcpDG6udA22kyW29HC72wu8yG579ZoiSYuR/ly2+y9CA4NceWLmo717T1i5ULqJNtapL8CDACskxPFZRxLwQAAAABJRU5ErkJggg==";
var key = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAlZJREFUeNpsU11PE0EUPbM7u/2AtJUWU6qiiSYYo5EmmPDCD9AH46sx8cEnja/+CB989z+Y+MKPgMiDsYQACcbaWBBogYD92t2Zud7ZlQZsbzKZ3bl3zj3n3IwgItjYeDO3MlWme0bjUth8e8/fO2tHzx3XqUEk50uft+Ndnhdmc3SlfNPkVZT8Cy600DoIISvVfKYtlvfX1p66XmoIYsMZdjJQWvEFbbsC/S5g2QhSkKUK7rx6OzvzqLpsovAhaAxA3DUBQn2TUFsl7KwTfm4Z9DoO5LW7uPXi9Wxpfn7ZKF09vyPxX2iWcNRkKGZz0mQWKoNs8AVB6x1yRY2pYnc2LLofuXTxMgAlmlXIfngCxNxEzM+DPv6NQa2BygLgZyX6JT83ngHTN5GAL0WSoUQkSQnXkyBh/k0GegTAaldM20sTKvet+yyhIZApECamL0jUSe3oFChx3TopM4TeEQP2gc6BgGIwb4KGNXRhCkMGxgg2kJeybRiZM45D8W61qEAknSmpHStBhywu0nFVupSCTAcM4ECwqapv+NQ6LS9JGALoMIIoPYDjZiEL1xHtbyO39AQUDaA7R1AH23DSeSA4hv5RG/VAhxomPYP8sw9A4TaC9iHkjUWmrtGvbyC18BLe3GP0m3WW4I5hEBEnPIStXzyuFIxb4EkMEJ79Qa/xHbKxCdM7xeCwzUZOjgEwnuzt7qLz6T3cySmQP43uzjeIiTJM6io6W19B/NLCKMVGCzkCoLR/0lrfOI2fNy/huKC1FTsK/rbGNeMRC8dHpHByfu+vAAMAL/0jvAVZQl0AAAAASUVORK5CYII=";
var less = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjZERjZENTJGMTE4MTFFMUIwOEVERjQ5MTZEMkVBREUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjZERjZENTNGMTE4MTFFMUIwOEVERjQ5MTZEMkVBREUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGNkRGNkQ1MEYxMTgxMUUxQjA4RURGNDkxNkQyRUFERSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNkRGNkQ1MUYxMTgxMUUxQjA4RURGNDkxNkQyRUFERSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pl1w97IAAAJhSURBVHjahJNLbxJRFMf/wPAIMIxMkUI7tS0VYqlGDLGhjdKkqyZ24cJFN925de+XcONHaHRj4k7TND6SGo1VWwmp2kSLhlqMDbQ87gzPYcY7k4GgoJ6bmdw598zvnvM/95pUVYVma+svcovx8yMnFZHAMJPJBJfDzq5vpX6+/vD5qo/z7DOMBdo/d26t6jFMJ3iY51jBz4M+LP6wxEw40Gy23qYzB3HO7fpmpZCOmfEfa7Xb4NxOrC4lvbPToe2yKE3K1PdPwNOtHdx79ESfq4qKkijB5/XgevIyHxEC24USmewDqD2ABxubaLRkfW6zMqjWGlh7/ByyAtxYnOPnL0Q2+gGGmKRaw8zUBJaTiS5QOO1FJnuIAM8hciaIWHgi8NcSNt+loVDY8JBXh2ojJAR1HbTSNFMUpV8Dxcjg0nSYBrtBxdLbqI1iheCUh9XXNGurAwCdEkb9QyBSFam9TDfoPZ1LUg1BH28IiwEARTVAQOzcFKRaHZpLoa9avY6L1Gfs0c32t4PU6W2lWsV8LAorw0Cs1nXftYWE3qZGqwWHzYp2zzlgetuolVFvtiDLbRRKFTAWCxx2G/KlMtXFhWPqOzsWHJwBx7rxKv2R7mwFz3lw9/5DLC/M4Us2RwV0g3U58XJnF7dvrsBOoX0Abbej/DFKRMKI30fTVGC32WA2m5H9cQQvhYi0vE/7Wdgczn6ARA9QPBrBszcp/XvpyqxebzQ0Tlsq6llxLhe9bD4cFMr9XdjLHpLv+SLGBYHAYiVu1kNOpAaRTWbCejgiw0zGhFGSK1aw+zXbvfK/BBgAPwADAs5GpGsAAAAASUVORK5CYII=";
var mid = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnhJREFUeNpsU01PE1EUPdOZKWUotKUKFLEWkQ1EASGGxGBi4sIVrt27IixN/Cn+CxfVnQsXJiz8IAoqRBGEaMUUWzofnXkz781436QDkjKTyXuZe96595x3rxJFEeTzaKW6dmdpfIoxjuRRFECGn7/4Utvarj/syWgflU5s891qvGoJePJasfBgeSpnW+yEIJVS4DEBx3FzGT2qfvh0tJxOE4mCU0yy8X3BLdODRQTJZ5oMzYaD0UuDePzkbnnx1mjV9/lMp+izBKEIwQMOzvnJGoYhhBDgFKtMjmBl9XZ54WapSjLnknMnEkQYgflCVhKXLt+/dRMy2d5OHdVnPoxeHUtLV8u2w5/S78UzBJwLMC8gAsosIqy9/ga37WNmvgKVKmEkb7JSwI3pIdRq1kBXBZJAUKkb6wd49fIzbJthdn6cIhE0XUWbyP4cmshmdZAE0eUBD6gCN0DtZwM7Xw+RUlVEJCui7CmyPaS94zC06ZMedREERNA6djBWHsS9+9fRS3p9AraOXbhELMlUQju2G2O7JAQENk0XhpHG3MIVlEZzaDbdOKO8jWy/TraGsMmL4L8KTgnIfcfy4JBWeQNp0j10MQtB4EJOg6qFMI/bEH3pGNtF4LOAjHMxO1dGvW4jXzDi7Iw60TB0jJRyONhv4MdunbDneMA6BMPDA6iMFzExcQH9AxkUiwby+QzevtnF2OU8lBT1i8fOa2UO1/FwdGTHE2STHM/14+vlPOz0RxibKPfn9AHXZHBzYx866ZdTKkuVndhHuqenS1h/v4ffvxqyvbUuAtPizZ0Dp7X1fTs+FA9cMnWd4ZG90NOjomVFzeTcPwEGACDGeYddZX86AAAAAElFTkSuQmCC";
var mp3 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnxJREFUeNp0U89PE0EU/ra7XWxpSsFYIbVQf9REFBHkYBRIPJh4wrN3DsZ4MPGP8b/wUCIHEw5EY0w04o9ILcREGmwVgaXbbXdnd2bXNxPahGyczebtzrz3ve99740WRRHkWn5cebu4cH6SMY7e0jRAHr9c3WxsVvcemmbys9yT6+uHJ8oaPefypdPDD5Ymh5w26wMkEho8JtDtuEOZFCrvN/4uJZNGH0T59D58X/C27aFNAL3Xthmsww5GCyN4+uzu+OLtQsUPxPQx6ZMAoQjBAw7O+bEVCMMQgqygs+LFs1h+dGd8bna0QmXO9OL6JYgwAvOFZKKoy3V44CgNfv7Yx8oLH+lUEgvzF8Ydhz+n41snAGRG5gUEwClzhHdvttFxfNyYK0EnJozKK5eGcf1qHo1GOxtjwI+pfvm4g/W1qtJgerYE2SXJSIL9+W0jk0mCShAxDXgQKgbNXxZq35vQKCiKQkSUXdc1+gcch1FHGPmKuIgBCdc66qJQHMG9+1NIpUylxxHtuW6gEiTIu+N4yjdWgty0yTmdNjFzcwKjY0MU7MLt+IjoSad16FoIx3b/A0DZ7FYXnsdpAjUMDOjI5zPgfoBsRodhhGhZHfBBU/nGAGRtxWIOg5lT2NtrI5dL0SB5KJzLodloqXaOEatPGztKq5gG3S5DNjuAK5NjKJfPYKI0okBkSdemCiSgS/rkQNLSePtxBj4LSCwfFtE0krqqX7ZVMnu9XlMXy2l7ME0dzA3iANQyY6vWxC61UY41zTyNcYh6/QCNXQvzi5dR39nHVq1BUyuMGAARsF6tbbe4iKD1r7Om5iFBdmW1SsDflLiuB6sX90+AAQDHAW7dW0YnzgAAAABJRU5ErkJggg==";
var mp4 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnBJREFUeNpsk99r01AUx79psrTrujVtbceabnZs4DYRHSoMh6Dgq77rn+AfoA/+If4Bok+C0CfxVRDBh+I2NqZzrpS1DVvbtU3SJPcm8SSlsJlecsn9dT73nO85V/B9H0H78OLdt/LDlQ1uMYybIAgI9n99OWxoe83nkiz9hDDae330JvxL48O51Xxm/enNtKPbVwAh0Ec6kYpXat9Pnl2GBC02HrjM5Y7h4P8+7FtIFVJ49OrxUnl7ucIdfhv+BIDv+fBcj7p/tXMPrs2RXVTw4OX2UnFTrXCbbY7tpMsA13FDSDAOQ4gJEGUJLs0PPh9CkESsPrmxxEz2lra3rnpAt3G6adgdQhBpmeLkFodNmsjpOPoXBrQTDcmFFNS7i3MRDzzPCw/vva8ikU+COQxm14BBhvJcHLGpGPTOAJxxeLbrRgAkYujBdH4G5oWJWXUW19YL4XqunAMFhnq1BqWYgaY1MAHASQOiU96zKzkU76mwehaOvx6h9uMv7KFN3RopL4oTAI4HRh4wSl399xla+00YbR3yrIzM9SzSqgJJnoKcklGrH08CcJjnBtLLCsSEGGpSWJvHtDKNoFippsJ0ulIsDDUCCATMlBQkNuahEyiZTcLsmFBKaQxaOk53TlHeKkM70AjAooCghBOk9sKtIvqtPqS4FBaRnJSRX8tj2DOh3lFB5Qw2ZNFK5LRo6w4sKt2ggAzywidAMN/9uIPSZglBLDO5FF3mRD3wHE9qVRvoHrUpfn+UEQK0/7ShtwboHJ6jdH8RZxSC57hSVETb7e5/2u0FxqPHJow+8iZ4lYY2QGu3idhIxO7Y7p8AAwALCGZKEPBGCgAAAABJRU5ErkJggg==";
var mpg = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnxJREFUeNpsU0tPE1EU/ubRdlqmnUBboa0UeUQDiUGCC1+JmrhxoXt/gBvXJi74If4AV0Y3sNKF0YUaICqoIfjgVShEiGF4tDOdO/fOeOaSKtie5GZu7pzz3e/c7ztKGIaI4vn9p+/P3h4e4a6Pv6EoQBDiy7P5rc1P1Xt6XP8M5ejXo6UJ+dWbuemeTGdpvNdiNe9YvQLe4Bi4PmTpRmyq8m71rp74BxKF2twIHvAo+f/l1T2Yp0zceHizfOZa/xRnfBRhG4CQqAYioBWeXDyA8Di6ei1ceXC1XBwrTXHPH2vW6ccBBBMI6BsSUEQzakGL6xB0tvjyBxRNxdCtc2Xf8R9TyaWTDOg2TjfVdw6hqIoE9B2GxkEDWlLH7s4ette2kSp0oDRezrQwCIIA3oGHr0/mKMmE53qo23W4+w5S+Q5ohob9X3tgHgO8ULQACC7gMx9mKQP30EW6mEHpYi8xcJEdzMucjfkKcrTfmqmiFYBxCF/Id+gayKJwoQjHdrA5v4HK7Cq44KjZNWpagaqp7QACks0H9znW365ia24DzoEDozOJbH8eVtGShXHTwNracnsG7q6LzsEuaAlNPm9h7DSSVjLyCMkppDI+GS2StQWA1RlKo0X56n2X+6QHkmkDakxF9WMVqWyK+s/BrthYfvWz1Ug+zUDcjMPMm0h3pxEjFma3CbIuCud7oMc0LL1ZgmElpGJtW3B+15HIGNITrMYIlOH7i0U41NrInREylYbu4R5qQbQBaAh95fVKZCnpQCnb9DrWZyrRERS6NDeUw+yHaXh7rt4C4B8y+9vkwn7kwKNRpDoa9aiFKBYnF+RcREqQ2e1m3R8BBgAy9kz9ysCE6QAAAABJRU5ErkJggg==";
var odf = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAi5JREFUeNp0UktrU0EU/mbu3FfE1KRRUpWYheALNBURUVy7cy9UkO6KW/+Lbt0IPsFui4gLBbUqFaUuXETUKCYa0jS5yZ2ZO557b5MmTXpgmDPnfOc7jznMGINYPi0de5UvmpORxpjE/kbNqW005DVu8TWw1H758ZfkFgNgJmtyxSPRjJIj0QTW/RDiYGXGb7Dl32/eXrVsd0gSCx9miqC0ooCdp69g5Q/h6OLN0ty5ynIkwzMwUwh2FwMdcbDiCZQXlkqFCpEoPT/wih1YjLInANcD+/Ua9bu3wJlGvrBZCmet2+S6ME5g4oGlZ9A/I70XCDhhDexPNTFmswJBwcnuXkF86VSNZxVu0ukLSGnBcqlnN4HoCQIaIuIv7LUooMOgQ7q75LAAb59B9gCBHSKgqemRr94mMKmD24CfM8nb7THYGQNLpAkUkcb66JyGBFFEWRVL57gFEH5qj8Lxwca2qS3EZaugmzAw24dR/XQgwtsCSBjPIdWbUoE2UJLBnV8Ac/ciWHsK9/glWLnD6K2vgPszsOdOQdfeQ1c/ThKoTgDn9A3KUED/52d45xchZsvorD6Bf/Z60riV3Q9Z/0bbGU1uopYGkfERSQ3VbsMwl0qlqoIARmSoPYXWy0dor79LfBMEEd8jGs/uQ3Yl7PJFNFbuEXiV2riCf88fovXhBbo/vqP3t02/ZYmJFqTkzY160Go9uEMbFK8hR/NrdXtFuUVmnmySVGgO4v4LMAAjRgmO+SJJiQAAAABJRU5ErkJggg==";
var ods = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAetJREFUeNqMUj1IHEEU/i7u7Z23e8tGgneGQPw3hZDkkhQiSuwMQREba4uUgpVlCrvEQhurkCoWqcQQ0oTAaYKNqJygGEwgHCSB6Knn7eXcdX/GmdHVPWYFP3gw78173/vmvYkQQsAwNvckq96UnyIEh7/d4t7uUd/8y+85P+bXSX4grkhI6nJYPW7LrXpBK2YxiSoShhu4Buq1NPofDeqdrZ3Z4cl7D4J3UtA5VyVAlmJoru9Af2ZAp1lcCQ3nqgiuKmbY3l/BH+MnHM9GVLP0Ww3KNA33CQoQQnL834Fj74PUGkANEIkCSSsa8gQqgYTIcB0PVsXB318GInRiCVWCkpRFAs+j5gKlA4t29Ggh4d0t04FKt9PQqF4UFgumSEA8ApeaElilWbYRVy/lsns/N1QBkxtENF4jxPxcgcB1CZVOrvMteK5IQDtJJIGh++PcX9iYwWjXK37+vP0WdYk0Ht99jtX8JywWFkQChw4tc+cZcvlF7rMze+ubbxN40fMalRMDP/6twaiUeK7wlZ0TD0a5hLTWxo2d45KKprqHKJslTsy209s2wnMFBTYNZjc/oLt9gPvLOx+hxVJIKS2YW5pCbSyJTGMK775O8VyBwDJd2LTDl/X5i8v3S7NVw9vJb51tITDEUwEGANCx2/rXEEFFAAAAAElFTkSuQmCC";
var odt = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAepJREFUeNqMkz1II1EQx/+7Ca6JkqyYiJ8cKEpAQbBQFDm0sVOsFBS9wt5KOTgEG5twxVlZ+XEnKNiIghYKxx5nwEpIIXaiSAgKGmMi0d23u8+3T7OaZJEMLG9mmPnN/w1vBUopLPNNhRWXHOyDg0nx82TiJtZPlPVoNpftc2cTotcHtxx06kdXpSQ/BvzKESZzIDmAz6y+NojOjpDMZiqRPIgNoFyWM8DrKUV7axO+gcp4g7AzmquAdVNqOgL2z2I4id1B0wgeygOyt/rLL5buLwAIDgA9dY+L+DkuDQOCrkMgBsRglcMOqAGwIstMg8AkGsuZMNUMRMkLqE+QGloglvlA7uIOAKvZajR0qJkUj/XHe0BTIclVKKlrfKsj9qA8gA6wqSJzPaXlr7ky//tdLEUfawsBjExUFGVWbT7AxSa42H2LMfODmvd3wKb7RAMLYwM8nts8xJ/pEe7/3PmP2eGv3D+9usb35W0bINoA7RmjXSHsH0f5Z/mUSZ0Ir2JmsBtD80s8/rGyzWsLFTD5yUQCbfUBHl9d38LvkdDTXIuHVBo0k+bbt06qO+yAPGXwe/cA4wO9PN44jKDG70GougIzi2tQ00ms7/3lpwnBBgjZ37Kkd1Shht5XzBIFl/ufFtniT/lFgAEAU//g6kvdGBMAAAAASUVORK5CYII=";
var otp = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAcJJREFUeNqMkssvA1EUxr+ZjkdbrfFKVD12ErYSRELY2fkH+BMsLcQaSwsrSzZi47EjJEQkEhYkFlhYSVtFpdqOqpk717l3jKZmiC+5mZlzv/s795wzCuccQncz3YeRBj4KHz0/RrOZe2NsZPP20o255zQ3EAxzEAC+6uzTw13G4TFQAakA/CWtIYbY0KBOrx7IvwDQqlHV1o3YxKTOvyAUvfQCfqmA3e4ikyS/zRAKvOot7eoSHEgZIHrCfQAfBqBaKQQDKScQAExd8emBANg+2U2CvNMkkgSqBmrCxFB8mujeoJBWwEqARcssKTAJEGrmaGrjqK1zvNknH4BtyxKl2VUpRxmj5W+x73q9AEaZrR/ND1EJluIpS3i9JQiA+a+hSq8HwJjTsLrRaWitPTCOlhEZn5N75sM1qigmlN+dB3u++Qao5W4TtbEXXIsiszGL4PA00itTsu6XnQWo0TjMTAJqfMDx/ryBJcaVzSNSH4fW0Q+rkIf5rsjRiid7yyN7uoXS3Zn0egE0NiORAN9bQ017D1Lri7CLlP2EDr3Rf7C/itzV2bfXA/igLDaRixfngFhSCooH2xVPCWBlwKcAAwBX1suA6te+hAAAAABJRU5ErkJggg==";
var ots = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAfZJREFUeNqMUk1rE1EUPS8zmabJdDKB2glEwY9ExJYiBUEQpV25qgtBXfgbpEtXuujKf+AfEKRddOdOGHClbYVCvyKWaijT2mhjphk7Sd7Me76ZONp0EsiBYWbOvfe88+69hHOOAE9f3zTVnDKNHvhlsfqPw/rM0ovyWsRFdXJEpDIyRnSlVz0KSkmvabaJeXSJBEhgAJzTDNybmtUnS5Pmg/lrN07H5NM/f13FoMgpXDSuhiIiK3Qi6LUugX7FAbaPPsJqfIHHKCStqRsXVFPQuZgD9BBxjikSiRq41AAkgCQBzVf0+BWEBX7GBm0xgHHUqk1UbBuEcIydzyCZlOI9YEGuDxwduCCitS3Xh3viCZ4jrcq4PJ6DLHd67tjtuAAXib54dCPVEfQ5XIcik/0/2iDeOYz3ceCxrisMi904y0XiMQFfkB7lg6xFHwFxEqUMV0anUNBLWKm8xd3i4zBWOzmASx0UsiW831mA59Xjm+h7HCOygduXHqJatzA7Poey9QnXjTuoVD/j/sRcmDOWLgqnLC5A2wwST+Pn8T629lahSCo291bwu9XA7vcy3m2+gTaUR14thrk9BXasbdiOjSe3nmPpwys0xSi/HpbDd3bIQC6dx/q3ZbRb/j8BEi3Po5cTJpHI9CBNDEa++GyDBN9/BBgAwfDlCVUQaNAAAAAASUVORK5CYII=";
var ott = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAdFJREFUeNqMU89r02AYfpJ0iVm7EqhVOxw7dDBEdpiCE1RoEZRddvUgbIex/Rs7eehppyF4LOzQu4MxwYp0HgShIuwwUVSCVtl0s13afl+SzzcpyZYmyF74eN583/s+PO+PSEIIeJZdrtQVI19Cgmk/Ph39bpllXq82g7sgLxVcyKNZpIx8Uj5u5zSjc9Gov8ZihCRC8D+7On4JczevGeTGSEIC4ctKJtB1DTPXi1iCCEkIm1EFlC2Em0iwtWfinXkIzjiO0jljtDC5TtflGIGUQMB+mfja/oPv2Rx9MMjpMdJxOXyXTwkcwIkewfqQ1QtQNB385zcI14FrtQexsSb6SRysZ4Fbf+F6eHwATc9gJGNAm5iCTL5n/LCVRGADNoeaGoHqyaXj5gqQlTODovcwNk5Aj6wXqV8eCo7EDhMonEHpW+dZC7gUG98D3geo7vkb01h9cAvPdt76OGy1xntUd3bjUxAk3+l2sHJ/FgtrT0MUJNfDSm0bjQ/72Hzxxo+NK+h3B7XRNO4UrwymQtMIkdTBU0m+sBOayLsn8Ka78mQDjx/e87HXPkb1+UsfP37+AmZ1fP/suknBb6nefVQXjl06TxMlJfWKNWr+Kv8TYAAkUueexJF47QAAAABJRU5ErkJggg==";
var pdf = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmhJREFUeNp0U0trU0EYPTP35qYxaW6TlDapNKWGbgo2FkF8rARB6rboXusf0F/hyq2U4krFqugqSBeuAyL4SERBstHa0iR9JKZJ7mvu+M0tqZGkH3x8987jzDnnm2FSSqh4ns0VU1ybFzj674Wa3uWiWbfsFQb+jrGj8Xvbm0HlvYVRxhJprpmTlGmum+OMm5uNPZNbtjk3l82ey8++8oW4Jv/H/wdA456g2kvH99FyHNiuAz2dwflbN8YW8zMK5Go/CMfQkAhpGsyQgRCtlpE4jIULyC9fHzu7MPPEl/5ib6WOE0JJNRiHHg6j86mMjw/2gG4bkbY4PW4Yj2j64skA5FTHdaEMPiAJszt1sK0d4suJmY4k0+IDDGRfqmh0u5gejQc+fG8eYCIahRQCEfgQnIuhEkgtONE+dGxYxEDj1DhiEycZ+1YXdUpHCqTMJIYyEES5aXXQsi2kYlGEia5GtHVKn+amPBeCutPgfLALPuVu+xDVPw2EQyFEjHDghbpYNm1yKVVnYjTOerepn4E6XQmLGSPkPkOXWATMSDcjQEkAaqOu6+i/rccALtFL53LI3r0Nq1ZD4/MXZJaWYFer+PXiJc6s3IEgY3+uPYZHTAcAHM+DTE8gnM1CSyaCulv+GrRy8uYyElcu4XfhLVpkpNtn/DGA5Uu0abFH36WnzzCayWAkmYJvWeCkfb9SwY+NDbSoOx4bYqJF8rZqVRRXV/HhzWtUSmWwmWl0RmN4v76OUqGASrmMOkntSHF8MOs954dT08W248wzYsJDOujRBAaqqikTpRo/qqd0/dv97c3Lat9fAQYA4z8bX9nTsb8AAAAASUVORK5CYII=";
var php = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAhNJREFUeNqMkltrE0EUx//ZbDaXNrvZzdIkbYOXGgxYQlCK2IIY6EufxGdB8Av44AdR8AP44JOPBR+Ego0PClUKTTXQSmkTYtOkmubSJrQ1e3H2yJSEJNIDs3PmP+f89pyZcdm2DcdWvn7LzkxFHmCIra7nm9ulg8yLZ09yXON55Dgjt1PM2iPs0+aW/frdh8bzV2/SvQBnCLiEqcFxLKSSodlrU9leiGPihWePBkgeEZO6ShC2dCAZNuf6ADb+ldQ5PUPx4BCFcgXfdwq4Ph1Dtd5CZi4Nw7SQiMdCXkl6yVIy/QBWgcU+yx/XsLK2cdHndqlK/lZxH/OpJO7fnsWY3z/YAq+g0TmHpoUH2vB5PXi8RD9Fo10aAmDJTgWyIuOupmK38rsPcOvqJO33XWEvwLJsmKxHRVEwf/MKWl/yUMf8mIloWN8rw+sP0D6PHQmYuzGNgCRiMZVA17IQV4OIaTI8buH/AJMFd02Tkp05PO4jnWvc57EDAINt7u1X8Pb9KgI+Lxbv3cFR8xjx6AQ+b+Txs/qL9KePlih2CMBCq92hg2qzt1AoV7H5YxdhdqhHzRbgcpFeqdUplpvQW4FhmAixZ/sws4BoWCM/qmsE5XqE3dDQCrqGAYWdejqZgK6GUD8+IV9VghBFN1RZJv3sT5diBwC15gncggCPJKF0WCPN8dun55jQdVpz3Ynl9leAAQAJhiGatD9AOgAAAABJRU5ErkJggg==";
var png = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmtJREFUeNpsU9tOE1EUXXPp0CAUWmJbC04xBANNTF+kKhG8fID6aqL/gPEj9E0lIf6Dj30HL03wxQtVIC0QKrWxNG1Dk9Z2Oj1zxn1m0oIZTnIyZ8/ee+211z5Hsm0bYg29fLGpxWIJWBYGS5IA8ncKhT9Wvf4Yqprtu+w3q85X7f9QxseD/pmZMZsxN9fnc5JNw0ACGGv6tPSvyvEDKEoWZ5Y8OHHObKpucw4B0t3agnl4CJPs2YkQVu4s61ORaBqMJc8CDBiIRhhVM9bXYdVqYAcH8M3NgS0tQQsFcfdKHEbvlr6WyaR/V6uPKPy7B4DT7lUq4MUipMlJ2MPDUKtVfKZ2nn/5BoNbkONxXeb8LYXe/A9AJLNWCxgdhZJagDI9DZg9qIkEytRSkdqTSFQtGILSbgc8LViM+tc0yPfukzIyOJ359k9YR0eQdB2KmBbpwXoM3Dod1SkD+scpEapCI5DdpsJhIJcjajQZagcjI+5oLe4VkeQnyiZgdIH2X6BJ7dSqQLfrggjw0AQwP+/GegCIHppNoFAgEMO1RZKo7BQgRi3yN05cnwdA0BQMAgF3C6pnbuNg92M9AFT1diSCh6kb+FGvo2MxnBB9ocZxp4Mns1cde213B81e7xwAcl4jkaa0IUSjUdLJwkL0Ej6VSvArCt7l81iku6GrKnYEU89VJlSJRmR0Dax+fI9suYxSo4HlWIw6M3FBlnD9YhiXabyOsOeIqG7TzDeIYo6EDGp+ZPb2kKKqH8h+mkxiI5/D1/19J3bwYPvPWXq2skkiJVxesqt0XzghpKM8nRVV2Lv2q9eLIvSfAAMAaacnllcFBmYAAAAASUVORK5CYII=";
var ppt = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAkhJREFUeNpsU11rE0EUPTM7ySZpmzT9DNamWAtFfSiCigr+AxF9zKtv/hvf/Aki+FEi6ov4ItWHPGiwiBUKoUqqTUJImmR3M7Mz3t0kNe1m4LIwc+65595zlxljEJzdR5uf5nLmsvZx6gSvtd9W9bjhF7jg5dH9nRc/wq8YXaTSJptb0xklx7IZoKUEz1zJ2DUU69/37vFYrDxegJ9U0lC+AoIIVGg9CL+vIObP48KDQn7x0sWiVnJrnEDg7KGk+i/Ac4iUM/R7BsmrSSxtXMfa3X7el8+Kjf3KfUJ+iRJQw4w0Tc8BRyWGRAZY3rBR/VlC+XED2ayDhZyXl03+hNA3TxNQshlGLAnE44zCIL1goXZwiMNvB1i6zbC0KuAsxNITWwgNMYPeLVJiFEO9ArjHAivrAjNzBr4f4vwIgdGD4YUACsZCE8AtYGWT5jCsGQw5wEYJzP/pj5RwYTA1b07eQmfZ8P0sgdaM2FlYwWkMgMpl6NQAO33GKM0wsQWflkh1uqGVmVWblsiDkQyqxwfag35SqcktaEWTUTHYNx4iGU/C29+BvX4Lpu/C7zYgFjegSY63WySsHyXwpYHU00ieu0bAOuJbBTArBkiXKiaAmTzcvRJUV9E8rOgqBwqlY8ASs/AadbRLb8CzeTjVClqft6FdB17tL7yeCbFRBYoLr6vR/PiSEl5BZJaBD0/R2nkOZqfQ2fsKt+0SEQ+GLSIEUvJm+6jbah2+pS2aon+4g/afd4SYJVuA7vvXdC/IHQtSoTnK+yfAAIEaId1m+vudAAAAAElFTkSuQmCC";
var psd = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAqxJREFUeNpsU01ME0EYfbtdKKWGtoItRWgJHApCBE2I0YuoiSaaeDJeOJh41YN3TfTixcRwMfEk8eDJGA+Eg0YTTRRMg02KKFooCBbTlkJLS7f7P+u3K9Xo8iWT3Zn55s173/uGM00TVlwZfzJztD92iKO5ouvQGQPHcQDN380vlDPr65fdLj4Oa41i9sFt+ytgN7o7woGOrqgvvpLBaF8vWj1NUAwGTVNRM3mf5vU/zaU+XySQuTqIFXz9hxmGLkoS7r+YxvVnrzGzlgXPDOzUZPT4m3Dt/KlIuH9oUjXYEHZZ/wOgGQZi4TZcGI5hLb+FO++TSOSKcLtcMA0dI0EPrp4+HtnfG5skiUecDGwQE2MjAwiGWlFVNDz+tIyCokJhPKYSX7Gdz2I01hOJdnY9rJ/7UwPGTEiqjtbmJtw4MYx78S/4Wa3h5UoOYwPdIOp2Xi/t18rlFgcDw6o+ydiWVRwOBnCpL0oOAMmNEhLZIgSeoxwGSWcERon/M9DoBknTIdNQNAMnO4PIVGpIFXcwndlA2OtGc4MAxml27p4AIulWSIa9QVadiYSoJxhqBJivKgh5ad3k9gaw6JdlDaqq7q5wINY4F22HaLHSDZQkBW72O9cBYFEviBIURQH7a7MN0uDisUW12ZZcaGlmdq4DwCqeTo1zNtZuW7hUqGIw7MNqSUS2ImNsKEpSdEwt5lGhfQdAkQBEoub3NNrDJfAIeBuRrcrY5xGQ2RFJAjl00I8PCckJUCB9q1URBnk38XEJEuk41tmGwZAf66s1VOh2keqwoUnYpFxHH4iKIixkN3HzVQKP3iQR/5GDKMuYmE3h+fx3MHqh1sMafztHLuiCg0FAk0uFdLqcpGY5QEXbTC/j7mIaVjc18DxufUtBJ/vcggs+3ijVz/0SYABsJHPUtu/OYwAAAABJRU5ErkJggg==";
var py = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAlVJREFUeNpsUktvEmEUPTPzTUFmgJK2UqXQFG3pA6OBLrQxamJcaYwuu3Dp0l9iXLvVtRuDpgt3JIYaTVSaxtRHsJq2xEJBHgXmifebMhECXzKZme+ee+65516h2+2Cn2cb2VwyHl12//vP2/zOQaF4uD7GWN69e/LogfNm7kUsPBFaXYwHMeK0OlpQEJApHJTuykzK98dE98O0bLM/UNgr4v32Dj1fwSQRt9dSsfmZcMa0rIv9ODaqYrPVxuPnL1Cu1aEbJu7fvIZUIo4bqeVYRzcyv/8c3SPYpwECt/dmu4ON3Ed4TymI+hQc1ZqoE+F+uQLDsnHlwkKMscJTgl4eJOi9fxZLePNhGx6ZQRRFqH4VjZaGSv0Y6cQcJLpra0ZguIWegqDiw7lYBBZV6xiGk9DQDLzK5bEyF4Hi9VLMsoYI7J6Es5PjeHjnOl5ubqHaaJGBEkzbxplQAKIgDmBHekDTgI+qKKqKLvNApgmEgyquLs1CoFn2Y4cIeLJpkjoCLkWnUSIF3JxISIUsCjAoxhWNJLBIJs3YeXj/08oYZkOKY65HllE/bkMmY504YUd40HUq2JSSyW6iVPmLiXE/ZMYQCU+hXK3h1toqdNN0sEObyKtqtDQ6kXDwcadDS2TBryp4nX2HxXjsJK6bDnZIAZem6Tp5YMMmicn5OC4lztNWtvB9cg+hQABtWjKL2jH/T3GgBcYDXEE6mcDM6SlaJAGMWkivLBC54ZgniZaDHSI4rNSqn7/t1vgkGJPwZXffSeCjk2iUWz9+nSTQN8e6ef8EGAClUi/qoiOc3wAAAABJRU5ErkJggg==";
var qt = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnVJREFUeNpsU8tu00AUPU5sp41NkzRxpfSZqi0VIIQqEEJUZYXECvbwCWxYsuBD+ABUFrDrCnWBQEJdIWigBSr6pqRJ1ebhxrE9M7aZmSrQ4o505fHMnXPPPWdGiaIIYrx89GKpNDdxmXkU3aEoCsT+z8W1Sm21+jCpJctQTvaerj+TX7WbnJ+0cpfuX8mQtn8GgJ4AZtIFY2Hz3foDVRcgyt+cRHcS0IARh+D/8G0PpmVi7smd0dLs+AIjwTVEiANEYYQwCHlEZyJgIQKfoX84g9uPZ0cHZ4YWmE9nuufU0wABCSSImMsWEgqSuoqA/39/swZFTWLy7vQo7dDnfPvWWQa8GuOV3IYLJXmyzDzG2/ChZ3pwbHdQ267BKJoYuj7SF2MQhiF8LuDK/Gf0DKTBKINz1IbTbEMzU1ANDW7LAfEIQKIgBsBFlAx6LYOz6MAcvoDCtAVGGPKlAiIu/F55F33FDA6W93EOAOMaMOl7biKPwRtD8Foetj5sYPfTDtxjl1f3Ubo5jkQieQ4ACSUD2iE4XDpAdbUiW9D7UsiN9WNkZgxajwbd0LGzt3keAJPUc1N5SVeENT0Ao2BKV6QzwlZeRBSKAYhe3aYHcZWn7l1EfjyPypcK9LQGa8qCvW9j9+MvaasQOHaRhGWdhsNLR8hwodYWf6B4tYjDjSOovRqq32rSYq/lytw4A77o1V2ERiAtzY5kkUrrsH+3QF2KY87ArTtQuQ6nAf4x6FCV1D001+vYersBM2vA4y1Rm2D7/Rac/TZIw4d/6MrcGAPf9htN0miJh7Lyuoyvr8rQeP9iVJcrSKgJ+TrFcyYebXTP/RFgAFQobmIOBxbsAAAAAElFTkSuQmCC";
var rar = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnpJREFUeNpsUktPE1EU/u68OgylZXi0hZACQU1LEKKCMcat7jTRnQsXxsQtv4E/4M74P1iriUaNCw1FgxpjCJQKKAU60+m8mJnrmSll4XCTc8+959zz3e88GOcc8aq9evChOHl/lvMoubvWX/z4+BwTlbvw7bXdg8b7h6LE1gGW+O88CRMt4XTlR6/rYxce5Xv3jlHH19fPkBu+gWy5mlcFb3Wn/umeKOEMJF5C7xCFbtA9dRXjFoYKGiTRAlPGUV1aKU9O3VwNQ74A8DQAIZxqAuAhBPIMFYpQVAVB4CPSZjEzv1weH5tbDQN+JQ2Abu488mnzIbAAA3o/VK2PwDJo7r5Fy7ZRuvi4PFS6+qIXdVYD8Jg6BUcuOD8BozSLlRWyicgVKkTMQWwUlFF0Ooe5FIPk57BD7G0SiywyjD8bCDyHsOkeeeR3SUxEkROmU6BfQYFJMHfhWXV8efkUrb13VPMTsrcTQSzxZ/+n0GVA6EGbSGdgG9vo15fg2nFgbO8k70SRdd+mahDT81vUxTZRlJBRMsjq89C0EXCvSf7TIBZ136YZUJEiE7LgJ2dN01BZuE0dkIhxE7KcQTK1QUj+cwAEyrPZ+IydzRoyah+mLy2isbWBweESJEnB9q+1RM9Ub9GQOWkABg8HjRr2d9Yh0hTlBlRsfn+D4vg0BvUC9rZqECUJuk7Tzr1zahCYlB6HJAREPwfbbMBzLBzsbUKVI0qBgQkc+SxgWUYaIAqOpKwKXJ6bgGlaaDV/YvHaFNrtDsKTfVSrJeqIg/bRNwjclFIALeP3saybhu8SC4VBHwnhBXXIKocYRXD9QzBi4Xgchmkd9+L+CTAAMqwy+ZzluBgAAAAASUVORK5CYII=";
var rb = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAixJREFUeNqEUktvElEU/mag5f2yJhXLwxIt0kiqsVEXujP+A925cu1Pce3WtXVtYuJCF7KtTY0NrVQIpRVKeXTkMcO9F8+9ZVooJJ5kcmbmfOe733fO1YbDIWS8+/g1dycVX7W/xyO3vdsuVKqvnE7HZ230783rlyo7bVBicSGyfjsVwozomVbIPe/c+FmsPHfoRKJd1HT7hXHBZjVbA4aA14NnD9bC2VR8gwuxPi5Sx39Cp+M0XUP0ahhP1jLhW7HFD4zze3b93ILtXYyyVKlR8/5hFbnvO9gtlrGSjOF+OpXkYviWyo8mCS4R6bqO4p86vm3v4fC4DrPfw4unj1XN6JvBaQtjChzUXK43sVU4wNFJA43Tv/B73edQwTmfIhAjCVL6UdPAj1IVFSKhCdAcAI9rnjBiAjtBYEu3GEeh1sKJ0YXR68sVIujzIhzwY8DEBHZqiLRKkicQDfvABxaiQTc4Y/C65pCOXwcjcmlvJgHtlwi4epYifiQWgmoLZwPW6HQG07LgcOgKO0UglAKOTt/E+09fwAiUWU7QAE9xUK3jbvomsispZVHMVEDSZdHo9rCZ/4VIMKAu0XGjpU7d2S8hk0pCELHEzrjKnCQOYJoD+Dxu1RyiwUm5LaMDo9NFt2cqDLvY4oQFp/QpfT/MrmI5FkWebt+NpWto0j2QmQkOjZ9hpwhqjXZzM/+7LU+cc7lRrjXh8/lVLRK5ovLWXglOsiOxdt8/AQYAzv8qbmu6vgEAAAAASUVORK5CYII=";
var rtf = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAe5JREFUeNqEU01PE0EYfnZmd5FSvgLYFuwWt9EgHyEaox68eDJevHvwJ/hTPHv1N/QgZ2NC4g3kUAQKFKGhjVKqRrvbnRlnht262FHfy+y8877PPM8z71pCCKh4/ebt+rJfXEz26Vjf2mnsN5rPKKWbVpx7+eK5Xu2kyMtNTd5d8MdhiJ9BOO7atFI9ajy1UyAqSPIRMR6ZmoNehNHMMB7fX/UWvEKFMbYKE8DfQnAhwRmmJkbx6M6S5+WmK2Evup2c9yUk2nnKA0XVcSiGXAe1k5beP1i+4RFCXqnPywB/AKVzK34RjHNYlgVKCH50w7EBBogbTa/AVM5SgBdn0gc2AMDjPsbFPz2xye9asweS6n+NTbG8BCCfUtLjff2WoVnVpAH6z6hMUtJE3EykYfpF4vUiL3QNS7FMeSAQRBHW3r1Hq91B+VoBQRji4+ExFsvz6Hz7jm7Yw5OH92AcJKW9G4SoHhzhy/lXbB98Qmm2oCXN5WawsV2TACEoJXqwTKOsb3BtR2ucmZxANpPB8JUhyPnHWDaDpfJ1eZFALzJJ4MKO5MEtv4TSXB7V/br8iQLMz+almRZWbvoo5q9qRlxwewCgeXbe3qrVO5ZkUD/9jJGRLPaOm6COi92TU1DbxYe9umRD0DrrtJO+XwIMABWp9nS+FgaoAAAAAElFTkSuQmCC";
var sass = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDNDMTBBM0JGMTE5MTFFMTg3N0NFOTIyMTQ2QzhBNkQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDNDMTBBM0NGMTE5MTFFMTg3N0NFOTIyMTQ2QzhBNkQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowM0MxMEEzOUYxMTkxMUUxODc3Q0U5MjIxNDZDOEE2RCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowM0MxMEEzQUYxMTkxMUUxODc3Q0U5MjIxNDZDOEE2RCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Po72XUcAAAJcSURBVHjahFJdTxNBFD1bykc/ttvdtttWGgI0bYrUgDZoNYqRJ014kMRXHvwB/hQTH/wFhMREJfFBQxBjhMRIFEQSCAlQxKYGggiU3e3HbnfX2bFt1EU9k9m9mblz5p4zlzFNExYmpue/jmTSZw5PZAl1MAwDT0c7O72wvPdudeNakPNtOZ0tsM7cvzdOc5yN5LDAsTFRAJks/kC2PxFRVe39Si6f4byez62EpAEH/gNN18F53Ri/Ocxf7OtdLMpKT42s/ZPg1cISJp/P0tg0TBzLCoK8D7eHh4RkLLJ4cCz12AjMXwgez8yhqtVo3NbqRKlcxcSL16gZwJ2Ry8KVc8kZO0HdTKlURn+8G6PD2SZhLMQj96WAiMAh2RXFYKI78lcJcx9WYBCycICnpNbojUWpD5Y0C4Zh2D0w6hWc70uQZC+IWfQZrXF0IsHvY+meBd08haAhoVMMQFJKWF7PNZM+klhRyogGhbqxOIXAMOtEwGAqDqVcgbVkkE+5UsEAWavf0az2t0ZqvK2qabh6IU3joizDwTgwej1LdVfJXkdbK8mt2QkayO99A0/0trQ46I1lVcX+UREhnsP34yLp1AD1xibBMuntpzU8mJyi3Tc1O4+l9U06n7x8Q/8PHz1DrrALt8tlr0CrkbJMHTop9Sk5sLa1g8L+ARJdnShKClY3tunN69t5iGLYTlCtakjFY7gxNABdN3B37BaqqoYT8pyX0in4ORbRkIA46YlDRbUTbBZ2Jb/Pw4qiKFnapcpPo9pdbrg8DjAOBsFgELJmsGs7eWkkc5bu/xBgAHkWC6UPADTOAAAAAElFTkSuQmCC";
var scss = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RkM4QjYyNDVGMTE4MTFFMTlBREZCNDNEM0ExMTk0MUIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RkM4QjYyNDZGMTE4MTFFMTlBREZCNDNEM0ExMTk0MUIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGQzhCNjI0M0YxMTgxMUUxOUFERkI0M0QzQTExOTQxQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGQzhCNjI0NEYxMTgxMUUxOUFERkI0M0QzQTExOTQxQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pkf1yeMAAAJbSURBVHjahFNdTxNBFD0tLULpB91uodVWPmorUIxo0VSiNSExMYYHE33l0Ud/in+C+OSjYgjRGDBRCKJIUkIEWi0WKlja0ul22+5219lJ26gLeiezuXvn7rnnnrlrUFUVms3Mvd2bjIyezRVLBA0zGAzo6jhjm1te+7EU37rFO+w7JlMbtG+ePJ5mOaZmci/nsPl6ONBtw18WDQc9tZq0sp7YjTisXV/NFKRpRvzHpHodDqsF03djzuvDg6vHJWFAprF/Arxe/oins6+YryoqCiUBvNOO+7FrXMjnWc0WyIAOQP0N4Nn8IqqSzPx2swllsYqZl28gK8DDyRvcxKXQvB6gISYpiwgH+jEVi7YAfW4nEqk0PJwDofNejAX7Pae2sPhhHQoF63U5Gai2Bn1epoPWmmaKoug1UBoMrgwHabIVVCx2jdrKFwm67TZ2plldPQGg2cK5HheIUMbaZqKV9In6giDCy3MNYXECgKI2gICxoQAEsQItpNCHWKngMo01arTY/jFIzbutShJuXh1Fm9FImYiM7tTtKOtbO+toN9Nc+fQ5SGUOIVYl7HzPIH2YRZ0y2KZ+sVzBHn2v1mpMGx0DTaR3nzfwfGEJdybGkdo/wEigDyvxLzg4yiESvojZhfd49OAeLJ2degaSLIPOO6vwgiYaaRErTRREEdn8MeJbSVZ5M7nLdNExqFLaQwEfFfACQn1+HBWKSKb3MT4Sgstuh9vVDa+bQ4DORE6o6RlspzMk9TOPfr+fiLJCLFYr3TZSKNcI7+aJwWQmPM+TkqRg49tu65f/JcAAMwMas6WUKd8AAAAASUVORK5CYII=";
var sql = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAh5JREFUeNp8kctrE1EUxr+ZyXMkoa1NBROaSkpTBE23PhZ25cql2y5duvAPUdGFS1FxIRRBXZlFQ9GVdDENIhGJxkDsw2mneZnM83ruNZlOmNoDhzlzz3d/9zv3Sowx8Ch/qlYK2XM3cEJsbH0+qjV/rd6/u6aN18b7RMFT+9aosP/Ex+0ae/puw7j36PlKEMAzctKJ3aGFamMHjV0d+wcGitkMrpWWp6hVIciEk2MAOwbUWjosx0UiFoWqJpGMx5DNzODq5aIPoa82AWBg/lyKLMH1PMp/a9XvLXLzG1cuFlBaWpiKxaIPSLY6CaC93ggQjyiQZRkeQSzLRovGaPciWLt5faSWEBoh6KBvOhiaNga0+Y9pwaFxvu7rfp8F5pWDt+qNMp2IijHGwddWCvN+33/CoAOP5nVdT9SdoQ1JkggiQ6Yvr7V60+9z7akA2gfH9cRF8hO5F5Ve4lQAF9uuK+qFsylkzsQxrcaQm04hdWkR83Mzfp9rQ3fAFzu9Ph6+WMfjl6/pGBdb2jbKmx8QlRjWy5vkyhUZBPgOeGNHN9AbDLGUz6He2hVj3Ll9C8/evsdgaMK0HV8bcmDTU0UUBYXcedR+NLGnH0I3jvDk1Rsy46FP4C/1BtrdntCGHNiOAzWZgEKQ5Qt5lIqLojbaXSQTcRy2OwT4SZqk0IYAOgkVWUE+lxX/zb0DpFNpkTzmZmfFtzewhHYcfwUYAMZmVaZQlLFHAAAAAElFTkSuQmCC";
var tga = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnxJREFUeNp0U89PE0EU/ra725K22ILRGipb22pMG6JcSEQTbUIwnozxpBcvepeEP0KPogcT/wlNT17kIKbEmChFUYKGVtL0R2gLtNCl3Z1Z3+zSAlonmezOe/O+973vvZEsy4JYnqdPMu6RkSQYQ29JEkB+PZcrslrtPhQl23VZc8/tr9I1yMHg0EA8HrBM04lVFAhoY38fSSDQVN3pfKV8G7KcxZHl6v1xblqU3eLc3p2VFZjr6+gQgwsnhzGTuq6Nhs6kYZqXjwL0GFhEl3U60OfnwWs1GGtrUKNRsKkpeIIBpKIRtI1J7cX7hXRhc/MOhXw5DkCZGG2zXAajzFIoBMvng1ypIKOqmP30GW3OIEcimovzlxRy5RgAFwDEAIODkCcmIMdiQLsNdWwMZdJlg8pzEUt1aBhKq3XinxKYqF9yQbqRIqsMy+0Gyy47bKgUWXSLtDENE5wdtuqQATm50F1VnPbRGeEw8HXZbiV8fsDvI9ldju9vADAyihLEbrWAZhOoVp3z6iqBUiB1A4nEfwCEsbkL/M4TgE5n5jDx+oTEzp1d8m9tC8H6MaAB0imzx0NU/WKUYE+loEyawDBo2ui6TGfT6ANAxrvx87gYCGCxXEKVJvCWFsG3eh1vN/J4OD6Od4UC8o0G3TX7TGLHwI9iEQmvF9X6Fh7F4/iYy+GcLOMSlfEgGsP0qdNOmX0BiGKpVkV1bw/1nW2b/gCpf1PTcI+Y7eg6ps+G4bG4PR99SjAVo9HE4q+fKNE0vl5awuSohjeijbRefVjAtUgEQRK7Yhi9OKn7nKWZxxlSPWl3QwgnaIrW8QMhD542vUbx/W49m7sq4v4IMABOqi3Ej7bAEAAAAABJRU5ErkJggg==";
var tgz = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnhJREFUeNpsU1trE0EYPbMzSTfdtInFtkkpiaXVWou2FRUEn/so6JugL/oH/Af+B1988if40jcFERQURNBSQdDWlLQN2lsue8neZsZvc7FoOrDszM75znfOmVmmtUYyvry++36yfOeS1qqzDtvH2P76ApPlW3Drb2sHex/uccHWAdbZX30kO2+B3siN3zhTnHuQ66+95i423jzFzOVljBdKOZNHazvVT7e5wF+SZBj9iZJ+3J11mbW2kR8T4LwFli5i4fqTUvnczTUp9RLtDhKgJx0q4dEwWAxrREKICHEsoYYXMXvlcWmquLgmY71yCkG/c0AkARgLMZpnMDMpGNzEYe0dGp6HwvmHpbHC1Wf9MnFCkHQOyYEPzSJwQ2B65Tm5NZG3Fshim6wbMNJn4bpHowMKtIqo2COgR2IcAptwjvcgo6i77igjEmVDqbY8xQJ1VwRULhiBI6+G9Zf3cbTziuzIDkmHSNqECTFgQScEcYuc2NA8TcdYwXD+GkK/TYVN+u72WrIudiAD8o6oAR2RRCmQMjis3CIy1iSpPySCXhFTXeyAgh4BR+JVw8pauLi0Cp4yCX9A90FQhnSBYtnF/k+Q+HYam9itfIZB3QvT8zj8XSW5EhNTs9ivbSLwPUzPLNPJBIMEKnaQYg6aB9+RGR5F5VsNgnNKXMI1NdJGG5WfHzFVLJ7k8c8xUngpVodlDSGbFYj8Y4yMpOG09lHf3yIFPzA3fwHZTAQVtU4JUTeFDrdgDdlI8wAz5Qy2KxswReI7QODZcOr0ZH3q2hIDBI7zq16tuk3FNPxAI4wN+pkoccYoE4YJU5EdUtM4Qst26v26PwIMAKj3P/2YUKgYAAAAAElFTkSuQmCC";
var tiff = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmRJREFUeNp0UktPE1EU/qYzHWstlrYJNcWUElyUJsaNGh9B0g1Lo0v9Ey78EbrVxBhXuHShm25YGBJRQpAYBDEWpaEPEhksdVpbyjzveO4MfZDCTWbauefc736PIziOA77OPH2yJCcSGdg2uksQAKofFou/7VrtASRpvVNynj13f6XOhjg8HAlMTIQdy/LO+v3uYUPTkAHCTb+cK+0pdyGK6+hbvu4/xiyHbncYAwfR19ZgbG/DoO9LsSgeTd9JXoxfyMG2rvQDdBlwIZauQ5ufh12twioU4E+nYU1NIRCNIDs+Bt28mXzx8VNuZ796j9q/DgAwomwqClilAmF0FE4wCInAlkjO4y+r0JgNX2os6XPYS2q/cQyAcQatFjA0BPH6NYipccAwIGUy2CVJFZInkKlyJAqx3T4/IMGmJkeWIWSz5KgI5pdhb3yDXS5DSCYh8rTID8s0wexeVD0GtMd85KkkefFxUfE47M1NokbJkByEQl6tL+ouAI+MUwbFhnYbaJKc/Sqg0x4H4eDRGDA56fUOABA9/GsCpaIHwr8FOhQ823O5RfW66tUGADhNy3RNRDjcN41HLxdQ8J6jYTsOQLfOJBK4f+s2/uoathoNGKT1MtFeVHZxdWTEZfEq/wMKl3rCJOIzTV6ADs2R5ulYDDNkYjp0DhrF+zCVgkw31+v1UxjQZkNV0SADd2o1MIuc9gmY+/kLxb0/UFoHePd9A1qzeUoKpilx9xcLWzgg+u/zeVfuQqkM9bCN1ysrWKXxdtPgvScwUAm58XZ52W16QyPtifRUzi588GbEi1ztHPsvwAC4uC9qhnsZvwAAAABJRU5ErkJggg==";
var txt = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAeJJREFUeNp8UrtOG1EQPfsyXiyzBguIJSyChZBBEFCKpKHLo6egpErNn8CHgH8gkZIiTSIXLhJAWCgkoMgRMSiRBSK29z4y9+I1d/HCrFb3MTPnnjkzlpQSynY+fP70fGF2gQuByCz6lfdd9Uurfvrrjes6762eb3tzQ69uFJwPsqOPC+MBEmxxphi4tlU5OGmsOzaBWLc+O9oIIVhScidkyGZ8vH62nHtSKlaI4cse6TjAfSaFBBcco0EWqyvzubmpyQrj/FXk75cQaSEMeMXU8xykPA/Hjd/6/LRcyjEpt2i7HAe4A2TeLZWKUOJaVLxj27j813EHGKCXaAJExu/4BOdiAED08riQD2riOrexyRoYc3CvsAbLGAAjZga7vgZG23WMCdBvoxKJc36TRBlMiaa2JByjNqqD8qkYc1pjDK7abey+/YhrWlfKswhpiCR96aEU9o5+QE3g2ovVWDm2Sc22bBQm8vrVpbkS9r+doPr1EOWZaQ0yFoxg2PcREosEAI4uvZhJpzFMP+cSXRbq+043RManez+tNWKMI6GN0g0Z04HFR+NoNC/0yx717efZOSbzY3AcR4Op2AGA5p/W31r9e0vNgSrh9OwCrpeCkqvZuqTybnpRqx/r2CjvvwADAJC/7lzAzQmwAAAAAElFTkSuQmCC";
var wav = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAApFJREFUeNpsU1tPE0EYPXtpKbX0wqUQKVQMFdIXQBNCQBs06KP+B8ODGh+Mf4b/4IsGE54kxhcMBrkp7YOQgBRvSKG73fvsrt8Otoask0xmd+b7zpxzvm8E3/cRjPkniyulW0NFy2JoDkEAguOlpXJ9p3L8MBqVl4O9YHxae8pXuRlcGO7KPLhfTDVUqwUgigJMy4Whm6lEXHjxYf3XnByRN0QB/2KaH7btMlUxoRJAcyqKhdOaht7+DJ49n+2cvTnwynXcsb+kLwJ4rgfmMDDGWqvneXCZS9ND7mov5h9ND85M9y86Dpto5rUkuJ4Py3YDJpy6QGJPayqB+Njf+43XL220t0cwOZkfrNXsBUqZugDA6CbLdAiAwaek1ZU9LmP8Rh6S78GsGxjOp9FdzKJaVZIhBgGASzK21w/wbrnCk8euX+EMAjaaZuPHdwUdHVFYluuGPGCORwwYjg5rqOwccRk+3Ux0IEvntmsNG4ZmUayL/wAwKHUNfZfTKN0ZRaw9Cof8qJ/pMAyHy5KkAMTksSEJtnMenM7EMVMawbejMzJRh67bXEYiIXEAVTW50SEAhzqwfqrBcXx4VOhYm4RsNgHbsJFOyZTsQ1MN+hcohoUlkFiMT+TQFpMwXOjGpXgE+XwGk1N5pFJtKNCequgYGupCRBbCDOp0KBJc4VoP3dyBONW8uydBgBHUThqQKCk3mEZ/LoUG+RBioJO7VarAwEAntjYPiUUW9Hh4b2R7k9j98hN37xWx8fGAt3eIAdVMLn+uUv+b2KReSCZjZJiB9bV9jIz2ofr1BKvvd7G9dRC80lae0HzOt+cWVnrSKDrMJykifwNBpCgE/UAllEXufmDu8Zlffvvm8XSQ90eAAQA0pF7c08o4PAAAAABJRU5ErkJggg==";
var xls = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmxJREFUeNpsU0trFEEQ/mamZ3Y2+0zIC2MmITEkUYgERFQErx5E8KTi1b/h79A/4SW3nCNeYggBYZVEMU/y3N3Z7M7OTD/G6lk2ruw20zRdU/XV91VVG0mSQK/3n1a/jky6d6Xs3G8WXS+Pw5N6LXjLLGuna/78oZKerGsYKtrDE16uJGL1L9gEOOcYd2dL1fNwrbL//aXN7J1efPMmkUqEFAk0A0VZNbFEaQCBscIkXj975y3NLq9xye8PBkAniHOFph+j2eC4rsdoB4LsFubGl/Hq8RtvYWpxTQi52o1jvWiGYaRZL0/auDgOkC/Z8BYL2Pqxidp1FZkhoDxpeaXA/Ujuj/4HoOxKKjiOiek7RUShRNQWaNYFQuMafrYCxiw4ozZKfqbYJ0EvRdl1DQyyTs8XCNTA6UELMwvDyLpZWIZNNlNLlQOK2LMJRJ+5AkuZ1S7CFFzJzk56GnUjQWlYkqCoBWFbonEVYcLLA4dNnB624GQsDBWIgfZJEgxkoChzSFWvn4VpQemDm2VwXQsXJwF1h6c+gxlQ5jgSiEUEt0wdIe7tMES+nEG2aCLiJMOIIWIr9e0DEELAMUrwRuchVAyTKimUwO75Jm6VF3Bv7imOaj+xd7UFKVS/BPJF1b/E4tgTrE49J60O5kceoNqowiuuYKa8ghHXA48U9MT2AQgyRvTThE30bQiaSGa4yLMJNFo+Dq/2cHt4CYlwyFf2S6BHwwrMw/avDbR5C1k7h1YQ4KH3Amf+AcZyEbZPv9CItzQD1l9EbtYOjv74v/d3O9RMPTDrsEwGIWN8q2yk7XNYRs9JrRv3V4ABADSGR6eQ0/NQAAAAAElFTkSuQmCC";
var xlsx = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmlJREFUeNpsU8tqFEEUPVXdPY/ueWZIoiYZiSYKYhJc6EbduHOhgijo3t/wH1z6B0JAhOyMILhxo4kJGk1ASTAxwWF0Mpp5dHc9vFUzYwidaoqmq+8959xzbzGtNcx69PTS26ETmQtS9r4Hy/xv7MW7jV+th5yzVcaYPX/++It9u4NAv+CVR6tBUUTqMJsDcRzjZOZM8W9ZLKx+/XDb4e5/kH5In0lpIYWGUaC0YTZnBCAEKoVR3L36oDo7NbsglZwbqD6iQKOXFMcKUVfBkBAoQhlD5xxMDp/HrSv3q1JgYW3z0x0KXzkCYJaRZljru23aHWTzLiamAyytv0O9UYdf5PArqlppBfMUfu4oALErqZBKcUxMFRCHEp0DgW5Lo4N9NIN1dF0XXsVFOUyPJTzo+WBANDidjp8tgHGG3c0DnJ4uIRf4cOCBaW5KjY8xkZL72xpJ9QcFz5bVqHUJGHZL2YtNmKi06YCyiVFb4s/vEKMTAf1p4edOG6mMi1zR6wEpdUwX+vLDtkCzHoK7ptcM6ayLmGajvtex4PliyoIkFRjmUEASelB2rXQRSfjUCT9PlWpmW21iTGzCAyEkUixPRqXhe2V4zKczbdmybgkpJ0cGOuA6Y2MTCsKoi5HsNK7N3MN+uwYaWbxYfoLLkzdxcew6lrYWaZhm8PHHG3zffp1UwJSHz9vvkU8PodbcQYYYS5lxYkxTkGdVDQdV1Js1qPgYD6JIuIE7gsXVefIhIuM05k7dwMbeMmh87a18ufIMaVYyprrJLgje2Nr+1tzYXANnDnr3zRhHj37Vvy2wpXHtNAd5/wQYAD6WMuT2CwoVAAAAAElFTkSuQmCC";
var xml = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAilJREFUeNqMks1PE0EYxh+g3W2t1G0sEqyISynUFJsSOShNwCamiYZED3LgIkcuxoN/iCZePZiYGD2aGD+i0F5KMChxlVaakAK2ykcAt+WzdLu7zkxo3WZL4pu8mXfmeeY3885ug67roPFh5nvc62m9hjoR+5LMp7MrkYf370qVtco+VtCUFpbj+jGR+JbWn76OyQ8ePwsZATQb8R/hanZgINgj9IqeuBFCw1Kt9OMBnNWCs24XwkG/QKYUEiGjVAPQof/rq0783pShET3ULQo8xz0iS5FaANmrHQH2DoqY+DSLSz6RzecWlnD9ymU47LYjd4O5BXqDTG4FM3NpTEkpdJ5rw0AowLRMbhUfp58gTOaD/UHmNQPI6YmvKWRX1zESHUJ/oBs2nmPa+Mgw0ZIM3tZyGoJwygzQNB2jNyJIZX7iB0lpPoM70UGmPX8zCU+rG8NDVxHwdiC5mKsPUFUN/gvtLLf39sFzVqaN3YrC6TjBauqhXhNA1TQoqloV7Da+pjZq1FsXUCamF29j6LvYhf3iISamZ3Fv9DZevouhRzzPfOG+3hpA9U9UyioOlTJ7pFeTCQS6RGzIebyf+oz5pSzWtmSW1EO9phvQ00slBRt/8qR3DoWdXbiczUiTzd52D+tdLmyTB14mx1rMAKVcRpEATjrsuElee/HXGmnFRyBOGD30C/nEDjNgs7CDpsYmnHG3YPegBCvHs9oYfm8nG9dJa5X4K8AAQzQX4KSN3wcAAAAASUVORK5CYII=";
var yml = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAdxJREFUeNqMUl1rE0EUPbM7m5Y0Zptu21AwWwhYpfSDFh+kvvRd8N0Hf4I/xWdf/Q158F0QoQ+CVsFKaLSQpt/dpmvztTOzzky6cetOpWcZZvbO3MO5514SxzEU3r57/3GpWllM/tP4sL3TarROXuSo/SWJvX71Uu80Cfhlr/T4UdWFAVfdnmsTUtvdP35OUyQKVnJgXDBTcj9icAsTeLax7j/052qM81UjwW1QJXEhMF0qYnN90fdnvdogYmvJPU0/VBApD4hcDrWRcyikfB17srzgW7b9Rh1vEvxDlI4tVytaBSEEtmWh0xsUMwpwnWjqAlcxogiHd1wiQyCu87iI/+sJtf6+NXsgpd7FWCMB50KvkYMGMbLdZgLlfj+K9K4+FnFQ2x7WntIs50AbmiGwLILt+k+EvzvSNIHzdigdJ/AmXQRhiHv5POSwYmG+cqPVo0HqDxj8uTK2vn1Hfa+JmdIkvtZ/4fOPXU3WPDpFeNWVyUKryCiIGMN4zsH98gym3CIcOTwT+XHdXrdQQHAZotE8kBPpSqPNHtBOr48HUmLOcXRJT9dWNMGYJFby91pHOAvaykSaITg+bwefdhrteDRTMSwyrFCgI88E056Hy+4Ah2cXQZL3R4ABALUe7fqXWFN6AAAAAElFTkSuQmCC";
var zip = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAm9JREFUeNpsk0tv00AUhc+MY6dOmgeFJg1FoVVpUWlFC0s2IFF1jxBbhKj4BSxYdscPYcEmQmIDq0gsERIViy4TpD7VFzF1Ho5je2a4thOqNhlp5Mz4zudzzp0wpRTC8fPrk0/TC6+fDtYicLH97T1Kc2vQDcs+rH3eUAxVznn0fn1DRM8E+iOdv5ct3XmZG6yVlNj6solUbgVTt0q5FGtX6vXqC6VklTE+KAO/OODHSIQPRQpsXC+kkEz2ELA0ystv84tLzyucsbWByisAGf+QAS2CCDRRLMJMmxC+i8C4jdLCm/zM7OOKFGptcO6/BTpJ0yeQB0Y+mfKQuZZG0jQgeRbW8Xdomobs9LN8scc+UPHNy4Dwq8IljotIIQEm59/RoSyM1CKkXKZNBm7kIVgyM6wgAnSgRK9vqQfHPiMFDHqyFVsLR9Cm0o4YzoAASrSjCelQfRPb1Vc4qn0EY5L2W9GEaBLcxQgFHpGbkMIDJ69e+wjJ8VXqRgKid0r7ftQdxkRs9SqA2kgAm14SSIQh9uhuLGPMnKJs/5KquL1x0N0RCsizigoDaLqBdHoMiyvrlBsHVx1wphD4BCewoqxGKKDwAgtOy8JufYuk+5golGGaGZwc1sIGoDz3AOPZSVLaHgVwydoJDM1H4DbQODughB3YpOD44HfoHgnu4e7So0uAi0stHLJ3Aud8B9bpHu6vPoSu9TtDl6tUuoFiIYOgu0+158MKmOxomtyD3Qi/3MTR7i8K0EDG1GHO5DE3X4DvNahZlJOwEkOATvdPc2//hx3mXJ5lFJaF8K8bStd0YGfnOJbMGex21x6c+yfAAOlIPDJzr7cLAAAAAElFTkSuQmCC";
var supportedIcons = {
	_blank: _blank,
	_page: _page,
	aac: aac,
	ai: ai,
	aiff: aiff,
	avi: avi,
	bmp: bmp,
	c: c,
	cpp: cpp,
	css: css,
	dat: dat,
	dmg: dmg,
	doc: doc,
	dotx: dotx,
	dwg: dwg,
	dxf: dxf,
	eps: eps,
	exe: exe,
	flv: flv,
	gif: gif,
	h: h,
	hpp: hpp,
	html: html,
	ics: ics,
	iso: iso,
	java: java,
	jpg: jpg,
	js: js,
	key: key,
	less: less,
	mid: mid,
	mp3: mp3,
	mp4: mp4,
	mpg: mpg,
	odf: odf,
	ods: ods,
	odt: odt,
	otp: otp,
	ots: ots,
	ott: ott,
	pdf: pdf,
	php: php,
	png: png,
	ppt: ppt,
	psd: psd,
	py: py,
	qt: qt,
	rar: rar,
	rb: rb,
	rtf: rtf,
	sass: sass,
	scss: scss,
	sql: sql,
	tga: tga,
	tgz: tgz,
	tiff: tiff,
	txt: txt,
	wav: wav,
	xls: xls,
	xlsx: xlsx,
	xml: xml,
	yml: yml,
	zip: zip
};

const IMG_SIZE = 16;

let css$1 = `i.icon { display: block; height: ${IMG_SIZE}px; width: ${IMG_SIZE}px; }\n`;
css$1 += 'table tr { white-space: nowrap; }\n';
css$1 += 'td.perms {}\n';
css$1 += 'td.file-size { text-align: right; padding-left: 1em; }\n';
css$1 += 'td.display-name { padding-left: 1em; }\n';

Object.keys(supportedIcons).forEach((key) => {
  css$1 += `i.icon-${key} {\n`;
  css$1 += `  background-image: url("data:image/png;base64,${supportedIcons[key]}");\n`;
  css$1 += '}\n\n';
});

function permsToString(stat) {
  if (!stat.isDirectory || !stat.mode) {
    return '???!!!???';
  }

  const dir = stat.isDirectory() ? 'd' : '-';
  const mode = stat.mode.toString(8);

  return dir + mode.slice(-3).split('').map(n => [
    '---',
    '--x',
    '-w-',
    '-wx',
    'r--',
    'r-x',
    'rw-',
    'rwx',
  ][parseInt(n, 10)]).join('');
}

// given a file's stat, return the size of it in string
// humanReadable: (boolean) whether to result is human readable
// si: (boolean) whether to use si (1k = 1000), otherwise 1k = 1024
// adopted from http://stackoverflow.com/a/14919494/665507
function sizeToString(stat, humanReadable, si) {
  if (stat.isDirectory && stat.isDirectory()) {
    return '';
  }

  let bytes = stat.size;
  const threshold = si ? 1000 : 1024;

  if (!humanReadable || bytes < threshold) {
    return `${bytes}B`;
  }

  const units = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  let u = -1;
  do {
    bytes /= threshold;
    u += 1;
  } while (bytes >= threshold);

  let b = bytes.toFixed(1);
  if (isNaN(b)) b = '??';

  return b + units[u];
}

function sortByIsDirectory(dir, paths, cb) {
  // take the listing file names in `dir`
  // returns directory and file array, each entry is
  // of the array a [name, stat] tuple
  let pending = paths.length;
  const errs = [];
  const dirs = [];
  const files = [];

  if (!pending) {
    cb(errs, dirs, files);
    return;
  }

  paths.forEach((file) => {
    fs.stat(path.join(dir, file), (err, s) => {
      if (err) {
        errs.push([file, err]);
      } else if (s.isDirectory()) {
        dirs.push([file, s]);
      } else {
        files.push([file, s]);
      }

      pending -= 1;
      if (pending === 0) {
        cb(errs, dirs, files);
      }
    });
  });
}

var showDir$1 = (opts) => {
  // opts are parsed by opts.js, defaults already applied
  const cache = opts.cache;
  const root = path.resolve(opts.root);
  const baseDir = opts.baseDir;
  const humanReadable = opts.humanReadable;
  const hidePermissions = opts.hidePermissions;
  const handleError = opts.handleError;
  const showDotfiles = opts.showDotfiles;
  const si = opts.si;
  const weakEtags = opts.weakEtags;

  return function middleware(req, res, next) {
    // Figure out the path for the file from the given url
    const parsed = url.parse(req.url);
    const pathname = decodeURIComponent(parsed.pathname);
    const dir = path.normalize(
      path.join(
        root,
        path.relative(
          path.join('/', baseDir),
          pathname
        )
      )
    );

    fs.stat(dir, (statErr, stat) => {
      if (statErr) {
        status[500](res, next, { error: statErr, handleError });
        return;
      }

      // files are the listing of dir
      fs.readdir(dir, (readErr, _files) => {
        let files = _files;

        if (readErr) {
          status[500](res, next, { error: readErr, handleError });
          return;
        }

        // Optionally exclude dotfiles from directory listing.
        if (!showDotfiles) {
          files = files.filter(filename => filename.slice(0, 1) !== '.');
        }

        res.setHeader('content-type', 'text/html');
        res.setHeader('etag', generateEtag(stat, weakEtags));
        res.setHeader('last-modified', (new Date(stat.mtime)).toUTCString());
        res.setHeader('cache-control', cache);

        function render(dirs, renderFiles, lolwuts) {
          // each entry in the array is a [name, stat] tuple

          let html = `${[
            '<!doctype html>',
            '<html>',
            '  <head>',
            '    <meta charset="utf-8">',
            '    <meta name="viewport" content="width=device-width">',
            `    <title>Index of ${he.encode(pathname)}</title>`,
            `    <style type="text/css">${css$1}</style>`,
            '  </head>',
            '  <body>',
            `<h1>Index of ${he.encode(pathname)}</h1>`,
          ].join('\n')}\n`;

          html += '<table>';
          const writeRow = (file) => {
            // render a row given a [name, stat] tuple
            const isDir = file[1].isDirectory && file[1].isDirectory();
            let href = `${parsed.pathname.replace(/\/$/, '')}/${encodeURIComponent(file[0])}`;

            // append trailing slash and query for dir entry
            if (isDir) {
              href += `/${he.encode((parsed.search) ? parsed.search : '')}`;
            }

            const displayName = he.encode(file[0]) + ((isDir) ? '/' : '');
            const ext = file[0].split('.').pop();
            const classForNonDir = supportedIcons[ext] ? ext : '_page';
            const iconClass = `icon-${isDir ? '_blank' : classForNonDir}`;

            // TODO: use stylessheets?
            html += `${'<tr>' +
              '<td><i class="icon '}${iconClass}"></i></td>`;
            if (!hidePermissions) {
              html += `<td class="perms"><code>(${permsToString(file[1])})</code></td>`;
            }
            html +=
              `<td class="file-size"><code>${sizeToString(file[1], humanReadable, si)}</code></td>` +
              `<td class="display-name"><a href="${href}">${displayName}</a></td>` +
              '</tr>\n';
          };

          dirs.sort((a, b) => a[0].toString().localeCompare(b[0].toString())).forEach(writeRow);
          renderFiles.sort((a, b) => a.toString().localeCompare(b.toString())).forEach(writeRow);
          lolwuts.sort((a, b) => a[0].toString().localeCompare(b[0].toString())).forEach(writeRow);

          html += '</table>\n';
          html += `<br><address>Node.js
            ${process.version}
            / <a href="https://github.com/jfhbrook/node-ecstatic">strat</a> ` +
            `server running @
            ${he.encode(req.headers.host || '')}
            </address>\n` +
            '</body></html>'
          ;

          {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
          }
        }

        sortByIsDirectory(dir, files, (lolwuts, dirs, sortedFiles) => {
          // It's possible to get stat errors for all sorts of reasons here.
          // Unfortunately, our two choices are to either bail completely,
          // or just truck along as though everything's cool. In this case,
          // I decided to just tack them on as "??!?" items along with dirs
          // and files.
          //
          // Whatever.

          // if it makes sense to, add a .. link
          if (path.resolve(dir, '..').slice(0, root.length) === root) {
            fs.stat(path.join(dir, '..'), (err, s) => {
              if (err) {
                status[500](res, next, { error: err, handleError });
                return;
              }
              dirs.unshift(['..', s]);
              render(dirs, sortedFiles, lolwuts);
            });
          } else {
            render(dirs, sortedFiles, lolwuts);
          }
        });
      });
    });
  };
};

var autoIndex$1 = true;
var showDir$1$1 = true;
var showDotfiles$1 = true;
var humanReadable$1 = true;
var hidePermissions$1 = false;
var si$1 = false;
var cache$1 = "max-age=3600";
var cors$1 = false;
var gzip$1 = true;
var brotli$1 = false;
var defaultExt$1 = ".html";
var handleError$1 = true;
var serverHeader$1 = true;
var contentType$1 = "application/octet-stream";
var weakEtags$1 = true;
var weakCompare$1 = true;
var handleOptionsMethod$1 = false;
var defaults$1 = {
	autoIndex: autoIndex$1,
	showDir: showDir$1$1,
	showDotfiles: showDotfiles$1,
	humanReadable: humanReadable$1,
	hidePermissions: hidePermissions$1,
	si: si$1,
	cache: cache$1,
	cors: cors$1,
	gzip: gzip$1,
	brotli: brotli$1,
	defaultExt: defaultExt$1,
	handleError: handleError$1,
	serverHeader: serverHeader$1,
	contentType: contentType$1,
	weakEtags: weakEtags$1,
	weakCompare: weakCompare$1,
	handleOptionsMethod: handleOptionsMethod$1
};

var autoIndex$1$1 = [
	"autoIndex",
	"autoindex"
];
var showDir$2 = [
	"showDir",
	"showdir"
];
var showDotfiles$1$1 = [
	"showDotfiles",
	"showdotfiles"
];
var humanReadable$1$1 = [
	"humanReadable",
	"humanreadable",
	"human-readable"
];
var hidePermissions$1$1 = [
	"hidePermissions",
	"hidepermissions",
	"hide-permissions"
];
var si$1$1 = [
	"si",
	"index"
];
var handleError$1$1 = [
	"handleError",
	"handleerror"
];
var cors$1$1 = [
	"cors",
	"CORS"
];
var headers = [
	"H",
	"header",
	"headers"
];
var serverHeader$1$1 = [
	"serverHeader",
	"serverheader",
	"server-header"
];
var contentType$1$1 = [
	"contentType",
	"contenttype",
	"content-type"
];
var mimeType = [
	"mimetype",
	"mimetypes",
	"mimeType",
	"mimeTypes",
	"mime-type",
	"mime-types",
	"mime-Type",
	"mime-Types"
];
var weakEtags$1$1 = [
	"weakEtags",
	"weaketags",
	"weak-etags"
];
var weakCompare$1$1 = [
	"weakcompare",
	"weakCompare",
	"weak-compare",
	"weak-Compare"
];
var handleOptionsMethod$1$1 = [
	"handleOptionsMethod",
	"handleoptionsmethod",
	"handle-options-method"
];
var aliases = {
	autoIndex: autoIndex$1$1,
	showDir: showDir$2,
	showDotfiles: showDotfiles$1$1,
	humanReadable: humanReadable$1$1,
	hidePermissions: hidePermissions$1$1,
	si: si$1$1,
	handleError: handleError$1$1,
	cors: cors$1$1,
	headers: headers,
	serverHeader: serverHeader$1$1,
	contentType: contentType$1$1,
	mimeType: mimeType,
	weakEtags: weakEtags$1$1,
	weakCompare: weakCompare$1$1,
	handleOptionsMethod: handleOptionsMethod$1$1
};

// This is so you can have options aliasing and defaults in one place.

var optsParser = (opts) => {
  let autoIndex = defaults$1.autoIndex;
  let showDir = defaults$1.showDir;
  let showDotfiles = defaults$1.showDotfiles;
  let humanReadable = defaults$1.humanReadable;
  let hidePermissions = defaults$1.hidePermissions;
  let si = defaults$1.si;
  let cache = defaults$1.cache;
  let gzip = defaults$1.gzip;
  let brotli = defaults$1.brotli;
  let defaultExt = defaults$1.defaultExt;
  let handleError = defaults$1.handleError;
  const headers = {};
  let serverHeader = defaults$1.serverHeader;
  let contentType = defaults$1.contentType;
  let mimeTypes;
  let weakEtags = defaults$1.weakEtags;
  let weakCompare = defaults$1.weakCompare;
  let handleOptionsMethod = defaults$1.handleOptionsMethod;

  function isDeclared(k) {
    return typeof opts[k] !== 'undefined' && opts[k] !== null;
  }

  function setHeader(str) {
    const m = /^(.+?)\s*:\s*(.*)$/.exec(str);
    if (!m) {
      headers[str] = true;
    } else {
      headers[m[1]] = m[2];
    }
  }


  if (opts) {
    aliases.autoIndex.some((k) => {
      if (isDeclared(k)) {
        autoIndex = opts[k];
        return true;
      }
      return false;
    });

    aliases.showDir.some((k) => {
      if (isDeclared(k)) {
        showDir = opts[k];
        return true;
      }
      return false;
    });

    aliases.showDotfiles.some((k) => {
      if (isDeclared(k)) {
        showDotfiles = opts[k];
        return true;
      }
      return false;
    });

    aliases.humanReadable.some((k) => {
      if (isDeclared(k)) {
        humanReadable = opts[k];
        return true;
      }
      return false;
    });

    aliases.hidePermissions.some((k) => {
      if (isDeclared(k)) {
        hidePermissions = opts[k];
        return true;
      }
      return false;
    });

    aliases.si.some((k) => {
      if (isDeclared(k)) {
        si = opts[k];
        return true;
      }
      return false;
    });

    if (opts.defaultExt && typeof opts.defaultExt === 'string') {
      defaultExt = opts.defaultExt;
    }

    if (typeof opts.cache !== 'undefined' && opts.cache !== null) {
      if (typeof opts.cache === 'string') {
        cache = opts.cache;
      } else if (typeof opts.cache === 'number') {
        cache = `max-age=${opts.cache}`;
      } else if (typeof opts.cache === 'function') {
        cache = opts.cache;
      }
    }

    if (typeof opts.gzip !== 'undefined' && opts.gzip !== null) {
      gzip = opts.gzip;
    }

    if (typeof opts.brotli !== 'undefined' && opts.brotli !== null) {
      brotli = opts.brotli;
    }

    aliases.handleError.some((k) => {
      if (isDeclared(k)) {
        handleError = opts[k];
        return true;
      }
      return false;
    });

    aliases.cors.forEach((k) => {
      if (isDeclared(k) && opts[k]) {
        handleOptionsMethod = true;
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since';
      }
    });

    aliases.headers.forEach((k) => {
      if (isDeclared(k)) {
        if (Array.isArray(opts[k])) {
          opts[k].forEach(setHeader);
        } else if (opts[k] && typeof opts[k] === 'object') {
          Object.keys(opts[k]).forEach((key) => {
            headers[key] = opts[k][key];
          });
        } else {
          setHeader(opts[k]);
        }
      }
    });

    aliases.serverHeader.some((k) => {
      if (isDeclared(k)) {
        serverHeader = opts[k];
        return true;
      }
      return false;
    });

    aliases.contentType.some((k) => {
      if (isDeclared(k)) {
        contentType = opts[k];
        return true;
      }
      return false;
    });

    aliases.mimeType.some((k) => {
      if (isDeclared(k)) {
        mimeTypes = opts[k];
        return true;
      }
      return false;
    });

    aliases.weakEtags.some((k) => {
      if (isDeclared(k)) {
        weakEtags = opts[k];
        return true;
      }
      return false;
    });

    aliases.weakCompare.some((k) => {
      if (isDeclared(k)) {
        weakCompare = opts[k];
        return true;
      }
      return false;
    });

    aliases.handleOptionsMethod.some((k) => {
      if (isDeclared(k)) {
        handleOptionsMethod = handleOptionsMethod || opts[k];
        return true;
      }
      return false;
    });
  }

  return {
    cache,
    autoIndex,
    showDir,
    showDotfiles,
    humanReadable,
    hidePermissions,
    si,
    defaultExt,
    baseDir: (opts && opts.baseDir) || '/',
    gzip,
    brotli,
    handleError,
    headers,
    serverHeader,
    contentType,
    mimeTypes,
    weakEtags,
    weakCompare,
    handleOptionsMethod,
  };
};

const version = '{{VERSION}}';

// See: https://github.com/humanchimp/strat/issues/109
function decodePathname(pathname) {
  const pieces = pathname.replace(/\\/g, '/').split('/');

  return path.normalize(pieces.map((rawPiece) => {
    const piece = decodeURIComponent(rawPiece);

    if (process.platform === 'win32' && /\\/.test(piece)) {
      throw new Error('Invalid forward slash character');
    }

    return piece;
  }).join('/'));
}


// Check to see if we should try to compress a file with gzip.
function shouldCompressGzip(req) {
  const headers = req.headers;

  return headers && headers['accept-encoding'] &&
    headers['accept-encoding']
      .split(',')
      .some(el => ['*', 'compress', 'gzip', 'deflate'].indexOf(el.trim()) !== -1)
  ;
}

function shouldCompressBrotli(req) {
  const headers = req.headers;

  return headers && headers['accept-encoding'] &&
    headers['accept-encoding']
      .split(',')
      .some(el => ['*', 'br'].indexOf(el.trim()) !== -1)
  ;
}

function hasGzipId12(gzipped, cb) {
  const stream = fs.createReadStream(gzipped, { start: 0, end: 1 });
  let buffer = Buffer.from('');
  let hasBeenCalled = false;

  stream.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk], 2);
  });

  stream.on('error', (err) => {
    if (hasBeenCalled) {
      throw err;
    }

    hasBeenCalled = true;
    cb(err);
  });

  stream.on('close', () => {
    if (hasBeenCalled) {
      return;
    }

    hasBeenCalled = true;
    cb(null, buffer[0] === 31 && buffer[1] === 139);
  });
}


function createMiddleware(_dir, _options) {
  let dir;
  let options;

  if (typeof _dir === 'string') {
    dir = _dir;
    options = _options;
  } else {
    options = _dir;
    dir = options.root;
  }

  const root = path.join(path.resolve(dir), '/');
  const opts = optsParser(options);
  const cache = opts.cache;
  const autoIndex = opts.autoIndex;
  const baseDir = opts.baseDir;
  let defaultExt = opts.defaultExt;
  const handleError = opts.handleError;
  const headers = opts.headers;
  const serverHeader = opts.serverHeader;
  const weakEtags = opts.weakEtags;
  const handleOptionsMethod = opts.handleOptionsMethod;

  opts.root = dir;
  if (defaultExt && /^\./.test(defaultExt)) {
    defaultExt = defaultExt.replace(/^\./, '');
  }

  if (opts.mimeTypes) {
    try {
      // You can pass a JSON blob here---useful for CLI use
      opts.mimeTypes = JSON.parse(opts.mimeTypes);
    } catch (e) {
      // swallow parse errors, treat this as a string mimetype input
    }
    if (typeof opts.mimeTypes === 'object') {
      define(opts.mimeTypes);
    }
    if (typeof opts.mimeTypes === 'function') {
      setCustomGetType(opts.mimeTypes);
    }
  }

  function shouldReturn304(req, serverLastModified, serverEtag) {
    if (!req || !req.headers) {
      return false;
    }

    const clientModifiedSince = req.headers['if-modified-since'];
    const clientEtag = req.headers['if-none-match'];
    let clientModifiedDate;

    if (!clientModifiedSince && !clientEtag) {
      // Client did not provide any conditional caching headers
      return false;
    }

    if (clientModifiedSince) {
      // Catch "illegal access" dates that will crash v8
      // https://github.com/jfhbrook/node-ecstatic/pull/179
      try {
        clientModifiedDate = new Date(Date.parse(clientModifiedSince));
      } catch (err) {
        return false;
      }

      if (clientModifiedDate.toString() === 'Invalid Date') {
        return false;
      }
      // If the client's copy is older than the server's, don't return 304
      if (clientModifiedDate < new Date(serverLastModified)) {
        return false;
      }
    }

    if (clientEtag) {
      // Do a strong or weak etag comparison based on setting
      // https://www.ietf.org/rfc/rfc2616.txt Section 13.3.3
      if (opts.weakCompare && clientEtag !== serverEtag
        && clientEtag !== `W/${serverEtag}` && `W/${clientEtag}` !== serverEtag) {
        return false;
      } else if (!opts.weakCompare && (clientEtag !== serverEtag || clientEtag.indexOf('W/') === 0)) {
        return false;
      }
    }

    return true;
  }

  return function middleware(req, res, next) {
    // Figure out the path for the file from the given url
    const parsed = url.parse(req.url);
    let pathname = null;
    let file = null;
    let gzippedFile = null;
    let brotliFile = null;

    // Strip any null bytes from the url
    // This was at one point necessary because of an old bug in url.parse
    //
    // See: https://github.com/jfhbrook/node-ecstatic/issues/16#issuecomment-3039914
    // See: https://github.com/jfhbrook/node-ecstatic/commit/43f7e72a31524f88f47e367c3cc3af710e67c9f4
    //
    // But this opens up a regex dos attack vector! D:
    //
    // Based on some research (ie asking #node-dev if this is still an issue),
    // it's *probably* not an issue. :)
    /*
    while (req.url.indexOf('%00') !== -1) {
      req.url = req.url.replace(/\%00/g, '');
    }
    */

    try {
      decodeURIComponent(req.url); // check validity of url
      pathname = decodePathname(parsed.pathname);
    } catch (err) {
      status[400](res, next, { error: err });
      return;
    }

    file = path.normalize(
      path.join(
        root,
        path.relative(path.join('/', baseDir), pathname)
      )
    );
    // determine compressed forms if they were to exist
    gzippedFile = `${file}.gz`;
    brotliFile = `${file}.br`;

    if (serverHeader !== false) {
      // Set common headers.
      res.setHeader('server', `strat-${version}`);
    }

    Object.keys(headers).forEach((key) => {
      res.setHeader(key, headers[key]);
    });

    if (req.method === 'OPTIONS' && handleOptionsMethod) {
      res.end();
      return;
    }

    // TODO: This check is broken, which causes the 403 on the
    // expected 404.
    if (file.slice(0, root.length) !== root) {
      status[403](res, next);
      return;
    }

    if (req.method && (req.method !== 'GET' && req.method !== 'HEAD')) {
      status[405](res, next);
      return;
    }


    function serve(stat) {
      if (onFinished_1.isFinished(res)) {
        return;
      }

      // Do a MIME lookup, fall back to octet-stream and handle gzip
      // and brotli special case.
      const defaultType = opts.contentType || 'application/octet-stream';

      let contentType = getType(file, defaultType);
      let charSet;
      const range = (req.headers && req.headers.range);
      const lastModified = (new Date(stat.mtime)).toUTCString();
      const etag = generateEtag(stat, weakEtags);
      let cacheControl = cache;
      if (contentType) {
        charSet = lookupCharset(contentType);
        if (charSet) {
          contentType += `; charset=${charSet}`;
        }
      }

      if (file === gzippedFile) { // is .gz picked up
        res.setHeader('Content-Encoding', 'gzip');
        // strip gz ending and lookup mime type
        contentType = getType(path.basename(file, '.gz'), defaultType);
      } else if (file === brotliFile) { // is .br picked up
        res.setHeader('Content-Encoding', 'br');
        // strip br ending and lookup mime type
        contentType = getType(path.basename(file, '.br'), defaultType);
      }

      if (typeof cacheControl === 'function') {
        cacheControl = cache(pathname);
      }
      if (typeof cacheControl === 'number') {
        cacheControl = `max-age=${cacheControl}`;
      }

      if (range) {
        const total = stat.size;
        const parts = range.trim().replace(/bytes=/, '').split('-');
        const partialstart = parts[0];
        const partialend = parts[1];
        const start = parseInt(partialstart, 10);
        const end = Math.min(
          total - 1,
          partialend ? parseInt(partialend, 10) : total - 1
        );
        const chunksize = (end - start) + 1;

        if (start > end || isNaN(start) || isNaN(end)) {
          status['416'](res, next);
          return;
        }

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
          'cache-control': cacheControl,
          'last-modified': lastModified,
          etag,
        });

        const stream = fs
          .createReadStream(file, { start, end })
          .on('error', (err) => {
            status['500'](res, next, { error: err });
          })
          .pipe(res);
        onFinished_1(res, () => {
          stream.destroy();
        });
        return;
      }

      // TODO: Helper for this, with default headers.
      res.setHeader('cache-control', cacheControl);
      res.setHeader('last-modified', lastModified);
      res.setHeader('etag', etag);

      // Return a 304 if necessary
      if (shouldReturn304(req, lastModified, etag)) {
        status[304](res, next);
        return;
      }

      res.setHeader('content-length', stat.size);
      res.setHeader('content-type', contentType);

      // set the response statusCode if we have a request statusCode.
      // This only can happen if we have a 404 with some kind of 404.html
      // In all other cases where we have a file we serve the 200
      res.statusCode = req.statusCode || 200;

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      const stream = fs
        .createReadStream(file)
        .on('error', (err) => {
          status['500'](res, next, { error: err });
        })
        .pipe(res);
      onFinished_1(res, () => {
        stream.destroy();
      });
      res.on('close', () => {
        stream.destroy();
      });
    }


    function statFile() {
      fs.stat(file, (err, stat) => {
        if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) {
          if (req.statusCode === 404) {
            // This means we're already trying ./404.html and can not find it.
            // So send plain text response with 404 status code
            status[404](res, next);
          } else if (!path.extname(parsed.pathname).length && defaultExt) {
            // If there is no file extension in the path and we have a default
            // extension try filename and default extension combination before rendering 404.html.
            middleware({
              url: `${parsed.pathname}.${defaultExt}${(parsed.search) ? parsed.search : ''}`,
              headers: req.headers,
            }, res, next);
          } else {
            // Try to serve default ./404.html
            middleware({
              url: (handleError ? `/${path.join(baseDir, `404.${defaultExt}`)}` : req.url),
              headers: req.headers,
              statusCode: 404,
            }, res, next);
          }
        } else if (err) {
          status[500](res, next, { error: err });
        } else if (stat.isDirectory()) {
          if (!autoIndex && !opts.showDir) {
            status[404](res, next);
            return;
          }


          // 302 to / if necessary
          if (!pathname.match(/\/$/)) {
            res.statusCode = 302;
            const q = parsed.query ? `?${parsed.query}` : '';
            res.setHeader('location', `${parsed.pathname}/${q}`);
            res.end();
            return;
          }

          if (autoIndex) {
            middleware({
              url: urlJoin(
                encodeURIComponent(pathname),
                `/index.${defaultExt}`
              ),
              headers: req.headers,
            }, res, (autoIndexError) => {
              if (autoIndexError) {
                status[500](res, next, { error: autoIndexError });
                return;
              }
              if (opts.showDir) {
                showDir$1(opts)(req, res);
                return;
              }

              status[403](res, next);
            });
            return;
          }

          if (opts.showDir) {
            showDir$1(opts)(req, res);
          }
        } else {
          serve(stat);
        }
      });
    }

    // serve gzip file if exists and is valid
    function tryServeWithGzip() {
      fs.stat(gzippedFile, (err, stat) => {
        if (!err && stat.isFile()) {
          hasGzipId12(gzippedFile, (gzipErr, isGzip) => {
            if (!gzipErr && isGzip) {
              file = gzippedFile;
              serve(stat);
            } else {
              statFile();
            }
          });
        } else {
          statFile();
        }
      });
    }

    // serve brotli file if exists, otherwise try gzip
    function tryServeWithBrotli(shouldTryGzip) {
      fs.stat(brotliFile, (err, stat) => {
        if (!err && stat.isFile()) {
          file = brotliFile;
          serve(stat);
        } else if (shouldTryGzip) {
          tryServeWithGzip();
        } else {
          statFile();
        }
      });
    }

    const shouldTryBrotli = opts.brotli && shouldCompressBrotli(req);
    const shouldTryGzip = opts.gzip && shouldCompressGzip(req);
    // always try brotli first, next try gzip, finally serve without compression
    if (shouldTryBrotli) {
      tryServeWithBrotli(shouldTryGzip);
    } else if (shouldTryGzip) {
      tryServeWithGzip();
    } else {
      statFile();
    }
  };
}

createMiddleware.version = version;
createMiddleware.showDir = showDir$1;
createMiddleware.mime = mime$1;
//# sourceMappingURL=strat.js.map

var minimist = function (args, opts) {
    if (!opts) opts = {};
    
    var flags = { bools : {}, strings : {}, unknownFn: null };

    if (typeof opts['unknown'] === 'function') {
        flags.unknownFn = opts['unknown'];
    }

    if (typeof opts['boolean'] === 'boolean' && opts['boolean']) {
      flags.allBools = true;
    } else {
      [].concat(opts['boolean']).filter(Boolean).forEach(function (key) {
          flags.bools[key] = true;
      });
    }
    
    var aliases = {};
    Object.keys(opts.alias || {}).forEach(function (key) {
        aliases[key] = [].concat(opts.alias[key]);
        aliases[key].forEach(function (x) {
            aliases[x] = [key].concat(aliases[key].filter(function (y) {
                return x !== y;
            }));
        });
    });

    [].concat(opts.string).filter(Boolean).forEach(function (key) {
        flags.strings[key] = true;
        if (aliases[key]) {
            flags.strings[aliases[key]] = true;
        }
     });

    var defaults = opts['default'] || {};
    
    var argv = { _ : [] };
    Object.keys(flags.bools).forEach(function (key) {
        setArg(key, defaults[key] === undefined ? false : defaults[key]);
    });
    
    var notFlags = [];

    if (args.indexOf('--') !== -1) {
        notFlags = args.slice(args.indexOf('--')+1);
        args = args.slice(0, args.indexOf('--'));
    }

    function argDefined(key, arg) {
        return (flags.allBools && /^--[^=]+$/.test(arg)) ||
            flags.strings[key] || flags.bools[key] || aliases[key];
    }

    function setArg (key, val, arg) {
        if (arg && flags.unknownFn && !argDefined(key, arg)) {
            if (flags.unknownFn(arg) === false) return;
        }

        var value = !flags.strings[key] && isNumber(val)
            ? Number(val) : val
        ;
        setKey(argv, key.split('.'), value);
        
        (aliases[key] || []).forEach(function (x) {
            setKey(argv, x.split('.'), value);
        });
    }

    function setKey (obj, keys, value) {
        var o = obj;
        keys.slice(0,-1).forEach(function (key) {
            if (o[key] === undefined) o[key] = {};
            o = o[key];
        });

        var key = keys[keys.length - 1];
        if (o[key] === undefined || flags.bools[key] || typeof o[key] === 'boolean') {
            o[key] = value;
        }
        else if (Array.isArray(o[key])) {
            o[key].push(value);
        }
        else {
            o[key] = [ o[key], value ];
        }
    }
    
    function aliasIsBoolean(key) {
      return aliases[key].some(function (x) {
          return flags.bools[x];
      });
    }

    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        
        if (/^--.+=/.test(arg)) {
            // Using [\s\S] instead of . because js doesn't support the
            // 'dotall' regex modifier. See:
            // http://stackoverflow.com/a/1068308/13216
            var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
            var key = m[1];
            var value = m[2];
            if (flags.bools[key]) {
                value = value !== 'false';
            }
            setArg(key, value, arg);
        }
        else if (/^--no-.+/.test(arg)) {
            var key = arg.match(/^--no-(.+)/)[1];
            setArg(key, false, arg);
        }
        else if (/^--.+/.test(arg)) {
            var key = arg.match(/^--(.+)/)[1];
            var next = args[i + 1];
            if (next !== undefined && !/^-/.test(next)
            && !flags.bools[key]
            && !flags.allBools
            && (aliases[key] ? !aliasIsBoolean(key) : true)) {
                setArg(key, next, arg);
                i++;
            }
            else if (/^(true|false)$/.test(next)) {
                setArg(key, next === 'true', arg);
                i++;
            }
            else {
                setArg(key, flags.strings[key] ? '' : true, arg);
            }
        }
        else if (/^-[^-]+/.test(arg)) {
            var letters = arg.slice(1,-1).split('');
            
            var broken = false;
            for (var j = 0; j < letters.length; j++) {
                var next = arg.slice(j+2);
                
                if (next === '-') {
                    setArg(letters[j], next, arg);
                    continue;
                }
                
                if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
                    setArg(letters[j], next.split('=')[1], arg);
                    broken = true;
                    break;
                }
                
                if (/[A-Za-z]/.test(letters[j])
                && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                    setArg(letters[j], next, arg);
                    broken = true;
                    break;
                }
                
                if (letters[j+1] && letters[j+1].match(/\W/)) {
                    setArg(letters[j], arg.slice(j+2), arg);
                    broken = true;
                    break;
                }
                else {
                    setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
                }
            }
            
            var key = arg.slice(-1)[0];
            if (!broken && key !== '-') {
                if (args[i+1] && !/^(-|--)[^-]/.test(args[i+1])
                && !flags.bools[key]
                && (aliases[key] ? !aliasIsBoolean(key) : true)) {
                    setArg(key, args[i+1], arg);
                    i++;
                }
                else if (args[i+1] && /true|false/.test(args[i+1])) {
                    setArg(key, args[i+1] === 'true', arg);
                    i++;
                }
                else {
                    setArg(key, flags.strings[key] ? '' : true, arg);
                }
            }
        }
        else {
            if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
                argv._.push(
                    flags.strings['_'] || !isNumber(arg) ? arg : Number(arg)
                );
            }
            if (opts.stopEarly) {
                argv._.push.apply(argv._, args.slice(i + 1));
                break;
            }
        }
    }
    
    Object.keys(defaults).forEach(function (key) {
        if (!hasKey(argv, key.split('.'))) {
            setKey(argv, key.split('.'), defaults[key]);
            
            (aliases[key] || []).forEach(function (x) {
                setKey(argv, x.split('.'), defaults[key]);
            });
        }
    });
    
    if (opts['--']) {
        argv['--'] = new Array();
        notFlags.forEach(function(key) {
            argv['--'].push(key);
        });
    }
    else {
        notFlags.forEach(function(key) {
            argv._.push(key);
        });
    }

    return argv;
};

function hasKey (obj, keys) {
    var o = obj;
    keys.slice(0,-1).forEach(function (key) {
        o = (o[key] || {});
    });

    var key = keys[keys.length - 1];
    return key in o;
}

function isNumber (x) {
    if (typeof x === 'number') return true;
    if (/^0x[0-9a-f]+$/i.test(x)) return true;
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}

var autoIndex$2 = [
	"autoIndex",
	"autoindex"
];
var showDir$3 = [
	"showDir",
	"showdir"
];
var showDotfiles$2 = [
	"showDotfiles",
	"showdotfiles"
];
var humanReadable$2 = [
	"humanReadable",
	"humanreadable",
	"human-readable"
];
var hidePermissions$2 = [
	"hidePermissions",
	"hidepermissions",
	"hide-permissions"
];
var si$2 = [
	"si",
	"index"
];
var handleError$2 = [
	"handleError",
	"handleerror"
];
var cors$2 = [
	"cors",
	"CORS"
];
var headers$1 = [
	"H",
	"header",
	"headers"
];
var serverHeader$2 = [
	"serverHeader",
	"serverheader",
	"server-header"
];
var contentType$2 = [
	"contentType",
	"contenttype",
	"content-type"
];
var mimeType$1 = [
	"mimetype",
	"mimetypes",
	"mimeType",
	"mimeTypes",
	"mime-type",
	"mime-types",
	"mime-Type",
	"mime-Types"
];
var weakEtags$2 = [
	"weakEtags",
	"weaketags",
	"weak-etags"
];
var weakCompare$2 = [
	"weakcompare",
	"weakCompare",
	"weak-compare",
	"weak-Compare"
];
var handleOptionsMethod$2 = [
	"handleOptionsMethod",
	"handleoptionsmethod",
	"handle-options-method"
];
var aliases$1 = {
	autoIndex: autoIndex$2,
	showDir: showDir$3,
	showDotfiles: showDotfiles$2,
	humanReadable: humanReadable$2,
	hidePermissions: hidePermissions$2,
	si: si$2,
	handleError: handleError$2,
	cors: cors$2,
	headers: headers$1,
	serverHeader: serverHeader$2,
	contentType: contentType$2,
	mimeType: mimeType$1,
	weakEtags: weakEtags$2,
	weakCompare: weakCompare$2,
	handleOptionsMethod: handleOptionsMethod$2
};

const opts = minimist(process.argv.slice(2), {
  alias: aliases$1,
  default: defaults,
  boolean: Object.keys(defaults).filter(
    key => typeof defaults[key] === 'boolean'
  ),
});
const envPORT = parseInt(process.env.PORT, 10);
const port = envPORT > 1024 && envPORT <= 65536 ? envPORT : opts.port || opts.p || 8000;
const host = process.env.HOST || opts.host || '0.0.0.0';
const dir = opts.root || opts._[0] || process.cwd();

if (opts.help || opts.h) {
  console.error('usage: strat [dir] {options} --port PORT');
  console.error('see https://npm.im/strat for more docs');
} else {
  const server = http.createServer(createMiddleware(dir, opts))
    .listen(port, host, () => {
      const bind = server.address();
      console.log(`strat serving ${dir} at http://${bind.address}:${bind.port}`);
    })
  ;
}
//# sourceMappingURL=lib.js.map
