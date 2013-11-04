window.app.socket = io.connect('127.0.0.1:4444');
//var currentUser;
var currentDir;
var currentDirString;
var dirMode = 'owned';
var newfiletype = 'doc';
var docshowfilter = function(o){ return true; };
var filelist;
var memberlist;
var memberlistdoc;
var movehandler;
var doccallback;
var currentsharedoc;
var filelisterror = function(){;};
var deleteconfirm = function(){;};
var rename = function(){;};
var firsttofilelist = true;
var registerLock = false;
var operationLock = false;
var expressionlist;
var filecontrolscope = null;
var contributions = [];
var sharedocs = [];

/*ST*/
var viewswitchLock = false;
var chatstate = false;
var runable = true;
var runableext = [
	'c', 'cpp', 'js', 'py', 'pl', 'rb', 'lua', 'java'
];

var debugable = true;
var debugableext = [
	'c', 'cpp'
];
var runLock = false;
var debugLock = false;
var lock = false;
var issaving = false;
var consoleopen = true;
var editor;
var doc;
var docobj;
var ext;
var expressionlist;
var filelist;
var currentDirString;
var filelisterror = function(){;};
var waiting = false;
var novoice = false;
var savetimestamp;
var savetimeout = 500;
var Browser = {};
var ua = navigator.userAgent.toLowerCase();
var s;
var buffertext = "";
var bufferfrom = -1;
var bufferto = -1;
var buffertimeout = SAVE_TIME_OUT;
var timer = null;
var runLock = false;
var debugLock = false;
var waiting = false;
var q = [];
var bq = [];
var bps = "";
var runningline = -1;
var cursors = {};
var old_text;
var old_bps;
var oldscrolltop = 0;
var gutterclick;
var oldwidth;
var dochandler;
var thisPage = "";
var thisFileState = "owned";
var selected = -1;
var filenumber = -1;
var alluserlists = [];
var userlist;

(s = ua.match(/msie ([\d.]+)/)) ? Browser.ie = s[1] :
(s = ua.match(/firefox\/([\d.]+)/)) ? Browser.firefox = s[1] :
(s = ua.match(/chrome\/([\d.]+)/)) ? Browser.chrome = s[1] :
(s = ua.match(/opera.([\d.]+)/)) ? Browser.opera = s[1] :
(s = ua.match(/version\/([\d.]+).*safari/)) ? Browser.safari = s[1] : 0;
var languagemap = { 
	'c':		'clike',
	'clj':		'clojure',
	'coffee':	'coffeescript',
	'cpp':		'clike',
	'cs':		'clike',
	'css':		'css',
	'go':		'go',
	'h':		'clike',
	'htm':		'htmlmixed',
	'html':		'htmlmixed',
	'hpp':		'clike',
	'java':		'clike',
	'js':		'javascript',
	'json':		'javascript',
	'lisp':		'commonlisp',
	'lua':		'lua',
	'md':		'markdown',
	'pas':		'pascal',
	'php':		'php',
	'pl':		'perl',
	'py':		'python',
	'rb':		'ruby',
	'sql':		'sql',
	'tex':		'stex',
	'vbs':		'vb',
	'xml':		'xml',
	};


var modemap = {
	'c':		'text/x-csrc',
	'clj':		'text/x-clojure',
	'coffee':	'text/x-coffeescript',
	'cpp':		'text/x-c++src',
	'cs':		'text/x-csharp',
	'css':		'text/css',
	'go':		'text/x-go',
	'h':		'text/x-csrc',
	'htm':		'text/html',
	'html':		'text/html',
	'hpp':		'text/x-c++src',
	'java':		'text/x-java',
	'js':		'text/javascript',
	'json':		'application/json',
	'lisp':		'text/x-common-lisp',
	'lua':		'text/x-lua',
	'md':		'text/x-markdown',
	'pas':		'text/x-pascal',
	'php':		'application/x-httpd-php',
	'pl':		'text/x-perl',
	'py':		'text/x-python',
	'rb':		'text/x-ruby',
	'sql':		'text/x-sql',
	'tex':		'text/x-latex',
	'vbs':		'text/x-vb',
	'xml':		'application/xml',
	};

function htmlescape(text) {
	return text.
	replace(/&/gm, '&amp;').
	replace(/</gm, '&lt;').
	replace(/>/gm, '&gt;').
	replace(/ /gm, '&nbsp;').
	replace(/\n/gm, '<br />');
};

function getdirlink(before) {
	var s = '';
	if (!before) {
		before = '';
	}
	for (var i = 0, j = currentDir.length - 1; i < currentDir.length; i++, j--) {
		var t = currentDir[i];
		var p = t.split('/');
		if (p.length > 1)
			t = p[1] + '@' + p[0];
		if (i == 0 && dirMode == 'shared')
			s += ' / <a href="javascript:;" onclick="' + before + 'backto(' + j + ');">shared@' + htmlescape(t) + '</a>';
		else
			s += ' / <a href="javascript:;" onclick="' + before + 'backto(' + j + ');">' + htmlescape(t) + '</a>';
	}
	return s;
};
function translate() {
	lang = (localStorage.getItem('lang') == 'us-en' ? 'zh-cn' : 'us-en');
	transinto[lang]();
	localStorage.setItem('lang', lang);

	$('[localization]').html(function(index, old) {
		if(strings[$(this).attr('str')])
			return strings[$(this).attr('str')];
		return old;
	});
	
	$('[title]').attr('title', function(index, old) {
		if(strings[$(this).attr('str')])
			return strings[$(this).attr('str')];
		return old;
	});

	if((!Browser.chrome || parseInt(Browser.chrome) < 18) &&
		(!Browser.opera || parseInt(Browser.opera) < 12)) {
		$('#voice-on').removeAttr('title');
		$('#voice-on').attr('data-content', strings['novoice']);
	}
}
var filecontrolscope = null;
function backto(n) {
	if(operationLock)
		return;
	operationLock = true;
	var temp = [];
	for(var i=0; i<n; i++) {
		temp.push(currentDir.pop());
	}
	currentDirString = filecontrolscope.getdirstring();
	filecontrolscope.refreshfilelist(function() {
		for(var i=0; i<n; i++) {
			currentDir.push(temp.pop());
		}
		currentDirString = window.filecontrolscope.getdirstring();
	});
}

function isFullScreen(){
	return /\bCodeMirror-fullscreen\b/.test(editor.getWrapperElement().className);
}

function resize(){
	var w;
	var h = $(window).height();
	if(h < 100)
		h = 100;
	var cbh = h-$('#member-list-doc').height()-138;
	var cbhexp = cbh > 100 ? 0 : 100 - cbh;
	if(cbh < 100)
		cbh = 100;
	$('#chat-show').css('height', cbh + 'px');
	$('#chatbox').css('height', (h-83+cbhexp) + 'px');
	w = $('#editormain').parent().width();
	$('#editormain').css('width', w);
	var underh = h > 636 ? 212 : h/3;
	if(!consoleopen)
		underh = 0;
	$('#under-editor').css('height', underh + 'px');
	$('#console').css('width', (w-w/3-2) + 'px');
	$('#varlist').css('width', (w/3-1) + 'px');
	$('#console').css('height', (underh-12) + 'px');
	$('#varlist').css('height', (underh-12) + 'px');
	$('#varlistreal').css('height', (underh-42) + 'px');
	$('#console-inner').css('height', (underh-81) + 'px');
	$('#console-input').css('width', (w-w/3-14) + 'px');
	if(isFullScreen())
		$('.CodeMirror').css('height', (h-underh-$('#over-editor').height()-90) + 'px');

	w = $('#chat-show').width();
	if(w != 0)
		$('#chat-input').css('width', (w-70) + 'px');
	
	$('#file-list .span10').css('min-height', (h-235) + 'px');
	
	w = $('#login-box').parent('*').width();
	$('#login-box').css('left', ((w-420)/2-30) + 'px');
	w = $('#register-box').parent('*').width();
	$('#register-box').css('left', ((w-420)/2-30) + 'px');
	$('#fullscreentip').css('left', (($(window).width()-$('#fullscreentip').width())/2) + 'px');

	$('#editormain-inner').css('left', (-$(window).scrollLeft()) + 'px');

	editor.refresh();
}
