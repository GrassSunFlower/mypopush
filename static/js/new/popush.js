window.app.socket = io.connect('127.0.0.1:4444');	//连接

/* 全局变量和函数 */
var currentDir;				//当前目录
var currentDirString;		//当前目录的字符串
var dirMode = 'owned';		//目录的模式
var newfiletype = 'doc';	//新建文件的类型
var filelist;				//文件列表
var memberlist;				//文件的共享用户列表
var memberlistdoc;			//共享用户列表文档
var movehandler;			//移动处理器
var doccallback;			//文档回调函数
var expressionlist;			//调试时的变量名
var currentsharedoc;		//当前共享文档
var editor;					//编辑器	
var doc;					//文档
var docobj;					//文档对象
var ext;
var savetimestamp;			//存储时间标记
var savetimeout = 500;		//存储超时时间
var Browser = {};			//浏览器
var s;						//浏览器版本号
var buffertext = "";		//文本缓存
var bufferfrom = -1;		//缓存来源
var bufferto = -1;			//缓存去向
var buffertimeout = SAVE_TIME_OUT;//缓存超时
var timer = null;			//计时器
var bps = "";				//断点集
var runningline = -1;		//运行行数
var cursors = {};			//光标
var old_text;				//旧文本
var old_bps;				//旧断点
var oldscrolltop = 0;		//旧翻转
var gutterclick;			
var oldwidth;				//旧宽度
var dochandler;				//文档处理器
var thisPage = "";			//前一个页面
var thisFileState = "owned";//当前文件状态
var selected = -1;			//已选择
var filenumber = -1;		//文件数量
var userlist;				//用户列表
var filecontrolscope = null;

var alluserlists = [];		//所有用户列表
var q = [];
var bq = [];				//断点
var contributions = [];		//共享度
var sharedocs = [];			//共享文档
var runableext = [
	'c', 'cpp', 'js', 'py', 'pl', 'rb', 'lua', 'java'
];
var debugableext = [
	'c', 'cpp'
];

/* 判断 */
var firsttofilelist = true;	//判断是否需要刷新文件列表
var chatstate = false;		//聊天状态
var runable = true;			//可执行
var debugable = true;		//可调试
var issaving = false;		//正在储存
var consoleopen = false;	//开启运行窗口
var novoice = false;		//无声音
var waiting = false;		//等待
var registerLock = false;	//注册锁
var operationLock = false;	//操作锁
var viewswitchLock = false;	//切换页面锁
var runLock = false;		//运行锁
var debugLock = false;		//调试锁
var lock = false;			//锁


var filelisterror = function(){;};					//文件列表错误
var deleteconfirm = function(){;};					//确认删除
var rename = function(){;};							//重命名
var docshowfilter = function(o){ return true; };	//文件展示过滤器
var ua = navigator.userAgent.toLowerCase();
var filelisterror = function(){;};

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
// 翻译
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
