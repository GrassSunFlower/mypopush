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

$(function() {
	var popush = {};

	(function(popush) {
		var router;
		window.app = window.app || {};
	
		var UserModel = Backbone.Model.extend({
			initialize:function(){
				user = '';
				passwd = '';
			},
			defaluts:{

			}
		});
		var UserList = Backbone.Collection.extend({
			model:UserModel,
			clear: function(div) {
				($(div)).html('');
				for (var i = this.length - 1; i >= 0; i--) {
					this.pop();
				};
				selected = -1;
				filenumber = -1;
			},
			
			myadd: function(user, div) {
				n = alluserlists.length;
				i = this.length;
				($(div)).append(
					'<li><a id = "' + n * i + '">'+
					'<img class="userlistimg user-' + user.name + '" height="32" width="32" src="' + user.avatar + '">' + user.name + '</a></li>'
				);
				var currentdiv = '#' + n * i;
				($(currentdiv)).click(function(event){
					var m = $(this).attr("id");
					($("#share-user-list")).find('li').removeClass('active');
					($("#share-user-list")).find('li:eq('+ m / n+')').addClass('active');
					filenumber = n;
					selected = m / n;
				});
				this.add([{
					'name':user.name,
					'avatar':user.avatar,
				}]);
			},
			
			fromusers: function(users, div) {
				this.clear(div);
				users.sort(function(a,b) {
					return a.name>b.name?1:-1;
				});
				for(var i=0; i<users.length; i++) {
					userlist.myadd(users[i], div);
				}
			}
		});
		var testUser = new UserModel();
		userlist = new UserList();
		var appView = Backbone.View.extend({
			loadDone: false,
			failed: false,
			loadings: {},
			firstconnect: true,
			loginLock: false
		});
		window.app.va = new appView();
		var SocketView = Backbone.View.extend({
			initialize: function() {
				this.__initialize();
			},
			__initialize: function() {
				if (this.socket_events && _.size(this.socket_events) > 0) {
					this.delegateSocketEvents(this.socket_events);
				}
			},
			delegateSocketEvents: function(events) {
				for (var key in events) {
					var method = events[key];
					if (!_.isFunction(method)) {
						method = this[events[key]];
					}
					if (!method) {
						throw new Error('Method "' + events[key] + '" does not exist');
					}
					method = _.bind(method, this);
					window.app.socket.on(key, method);
				};
			}
		});
		var commonView = SocketView.extend({
			initialize: function() {
				this.__initialize();

			},
			va: window.app.va,
			socket_events: {
				'version': 'verFunc',
				'connect': 'connFunc',
				'login': 'loginFunc',
				'register': 'regFunc',
				'doc': 'docFunc',
				'new': 'newFunc',
				'password': 'passwordFunc',
				'delete': 'deleteFunc',
				'move': 'moveFunc',
				'share': 'shareFunc',
				'unshare': 'unshareFunc',
				'avatar': 'avatarFunc',
				'set':'setFunc',
				'join':'joinFunc',
				'unauthorized':'unauthorizedFunc',
				'bps':'bpsFunc',
				'bpsok':'bpsokFunc',
				'ok':'okFunc',
				'change':'changeFunc',
				'chat':'chatFunc',
				'leave':'leaveFunc',
				'stdin':'stdinFunc',
				'run':'runFunc',
				'stdout':'stdoutFunc',
				'stderr':'stderrFunc',
				'exit':'exitFunc',
				'debug':'debugFunc',
				'running':'runningFunc',
				'waiting':'waitingFunc',
				'leave':'leaveFunc',		
				'rm-expr':'rmexprFunc',
				'add-expr':'addexprFunc',
				'getcontribution':'getcontriFunc'
			},
			getcontriFunc: function(data) {
				contributions = data.contribution;
			},
			allselffilter: function(o) {
				return currentDir.length > 1 || o.owner.name == testUser.get('name');
			},
			verFunc: function(data) {
				if (data.version != VERSION) {
					location.reload('Refresh');
				}
				if (this.va.failed)
					return;
				if (!this.va.firstconnect) {
					this.backtologin();
				}
				this.va.firstconnect = false;
				$('#loading-init').remove();
				this.cleanloading();
				if ($.cookie('sid')) {
					window.app.socket.emit('relogin', {
						sid: $.cookie('sid')
					});
					this.loading('login-control');
					this.va.loginLock = true;
				} else {
					$('#login-control').fadeIn('fast');
				}
				this.va.loadDone = true;
			},
			connFunc: function(data) {
				window.app.socket.emit('version', {});
			},
			loginFunc: function(data) {
				if(data.err) {
					if (data.err == 'expired') {
						$.removeCookie('sid');
					} else {
						$('#login-error').attr('str', data.err);
						this.showmessage('login-message', data.err, 'error');
					}
				} else {
					operationLock = false;
					//currentUser = data.user;
					//testUser.clear({silent : true});
					testUser.set(data.user,{silent:true});
					router.navigate('filelist', { trigger: true });
					//$('#ownedfile').show();
					// $('#ownedfileex').hide();
					// $('#sharedfile').removeClass('active');
					// $('#share-manage-link').hide();
					// $('#nav-head').fadeIn('fast');
					// $('#filecontrol').fadeIn('fast');
					//$('#nav-user-name').text(data.user.name);
					//$('#nav-avatar').attr('src', data.user.avatar);

					$.cookie('sid', data.sid, {
						expires: 7
					});
					
					dirMode = 'owned';
					docshowfilter = this.allselffilter;

					currentDir = [data.user.name];
					currentDirString = this.getdirstring();
					$('#current-dir').html(getdirlink());
					filelist.setmode(3);
		
					window.app.socket.emit('getcontribution', {
						docs:data.user.docs
					});
					setTimeout(function(){
						sharedocs = data.user.docs;
						for(var i = 0; i < sharedocs.length; i++) {
							sharedocs[i].score = contributions[i];
						}
					}, 1500);
					filelist.formdocs(data.user.docs, docshowfilter);
					
					memberlist.clear();
					// memberlist.add(data.user);
					memberlist.add(testUser.toJSON());
				}
				this.cleanloading();
				this.va.loginLock = false;
			},
			regFunc: function(data) {
				if (data.err) {
					$('#register-error').attr('str', data.err);
					this.showmessage('register-message', data.err, 'error');
				} else {
					$('#register-error').attr('str', 'registerok');
					this.showmessage('register-message', 'registerok');
					$('#register-inputName').val('');
					$('#register-inputPassword').val('');
					$('#register-confirmPassword').val('');
				}
				testUser.clear({silent:true});
				this.removeloading('register-control');
				this.va.registerLock = false;
				localStorage.setItem('fisrtreg', 0);
			},
			docFunc: function(data) {
				dochandler(data);
			},
			newFunc: function(data) {
				if (data.err) {
					this.showmessageindialog('newfile', data.err);
				} else {
					$('#newfile').modal('hide');
					if(newfiletype == 'doc')
						this.showmessagebox('newfile', 'createfilesuccess', 1);
					else
						this.showmessagebox('newfolder', 'createfoldersuccess', 1);
				}
				this.removeloading('newfile-buttons');
				operationLock = false;
				this.refreshfilelist(function() {;});
			},
			passwordFunc: function(data) {
				if (data.err) {
					this.showmessageindialog('changepassword', data.err, 0);
				} else {
					$('#changepassword').modal('hide');
					this.showmessagebox('changepassword', 'changepassworddone', 1);
				}
				this.removeloading('changepassword-buttons');
				operationLock = false;
			},
			deleteFunc: function(data) {
				$('#delete').modal('hide');
				if (data.err) {
					this.showmessagebox('delete', data.err, 1);
					operationLock = false;
				} else {
					operationLock = false;
					this.refreshfilelist(function() {;});
				}
				this.removeloading('delete-buttons');
			},
			moveFunc: function(data) {
				movehandler(data);
			},
			sharedone: function(data){
				if(!data.err){
					userlist.fromusers(data.doc.members, '#share-user-list');
				}
				$('#share-message').hide();
				this.removeloading('share-buttons');
				operationLock = false;
			},
			shareFunc: function(data) {
				if (data.err) {
					$('#share-error').attr('str', data.err);
					this.showmessage('share-message', data.err, 'error');
					operationLock = false;
					this.removeloading('share-buttons');
				} else {
					dochandler =  jQuery.proxy(this,"sharedone");
					window.app.socket.emit('doc', {
						path: currentsharedoc.path
					});
				}
			},
			unshareFunc: function(data){
				if (data.err) {
					$('#share-error').attr('str', data.err);
					this.showmessage('share-message', data.err, 'error');
					operationLock = false;
					this.removeloading('share-buttons');
				} else {
					dochandler =  jQuery.proxy(this,"sharedone");
					window.app.socket.emit('doc', {
						path: currentsharedoc.path
					});
				}
			},
			avatarFunc: function(data){
				if (data.err) {
					$('#changeavatar-error').attr('str', data.err);
					this.showmessage('changeavatar-message', data.err, 'error');
				} else {
					//currentUser.avatar = data.url;
					testUser.set({avatar:data.url});
					// $('#nav-avatar').attr('src', currentUser.avatar);
					// $('#changeavatar-img').attr('src', currentUser.avatar);
					// $('img.user-' + currentUser.name).attr('src', currentUser.avatar);
					$('#nav-avatar').attr('src', testUser.get('avatar'));
					$('#changeavatar-img').attr('src', testUser.get('avatar'));
					$('img.user-' + testUser.get('name')).attr('src', testUser.get('avatar'));
					// memberlist.refreshpopover(currentUser);
					// memberlistdoc.refreshpopover(currentUser);
					memberlist.refreshpopover(testUser.toJSON());
					memberlistdoc.refreshpopover(testUser.toJSON());
					$('#changeavatar-error').attr('str', 'changeavatarok');
					this.showmessage('changeavatar-message', 'changeavatarok');
				}
				operationLock = false;
			},
			setFunc:function(data){
				savetimestamp = 1;
				this.setsavedthen(1);

				q.length = 0;
				bq.length = 0;
				lock = false;

				$('#editor-run').html('<i class="icon-play"></i>');
				$('#editor-run').attr('title', strings['run-title']);
				runLock = false;
				debugLock = false;
				waiting = false;

				$('#current-doc').html(htmlescape(docobj.showname));
				$('#chat-input').val('');
				$('#chat-show-inner').text('');
				$('#editor').show();
				$('#filecontrol').hide();
				$('#footer').hide();
				var filepart = docobj.name.split('.');
				ext = filepart[filepart.length - 1];
				this.changelanguage(ext);
				this.checkrunanddebug(ext);

				editor.refresh();
				
				if(currentDir.length == 1) {
					memberlistdoc.fromdoc(docobj);
				}
				memberlistdoc.setalloffline();
				memberlistdoc.setonline(testUser.get('name'), true);

				for(var k in cursors) {
					$(cursors[k].element).remove();
				}

				cursors = {};
				
				oldscrolltop = $('body').scrollTop();
				
				window.voiceon = false;
				window.voiceLock = false;
				window.userArray = [];
				window.audioArray = {};
				window.joinedARoom = false;
				window.peerArray = {};
				window.peerUserArray = [];

				$('#voice-on').removeClass('active');
				
				operationLock = false;

				lock = true;
				doc = data;
				editor.setValue(doc.text);
				editor.clearHistory();
				editor.setOption('readOnly', false);
				this.initbreakpoints(data.bps);
				for(var i in data.users) {
					memberlistdoc.setonline(i, true);
					if(i == testUser.get('name'))
						continue;
					var cursor = newcursor(i);
					if(cursors[i] && cursors[i].element)
						$(cursors[i].element).remove();
					cursors[i] = { element:cursor, pos:0 };
				}
				memberlistdoc.sort();

				filelist.removeloading();
				$('#console-inner').html('');
				this.closeconsole();
				expressionlist.clear();
				for(var k in data.exprs) {
					expressionlist.addExpression(k);
					expressionlist.setValue(k, data.exprs[k]);
				}
				
				$('#console-title').text(strings['console']);
				
				resize();
				$('body').scrollTop(99999);
				
				if(data.running) {
					this.setrun();
				}
				if(data.debugging) {
					this.setdebug();
					editor.setOption('readOnly', true);
					old_text = data.text;
					old_bps = data.bps;
					if(data.state == 'waiting') {
						waiting = true;
						this.runtoline(data.line - 1);
						$('.debugandwait').removeClass('disabled');
						if(data.line !== null)
							$('#console-title').text(strings['console'] + strings['waiting']);
						else
							$('#console-title').text(strings['console'] + strings['waiting'] + strings['nosource']);
					}
				}
				this.setrunanddebugstate();

				delete data.running;
				delete data.debugging;
				delete data.state;
			},
			joinFunc:function(data){
				if(data.err) {
					showmessageindialog('openeditor', data.err);
					$('#editor').slideUp('fast');
					$('#filecontrol').slideDown('fast');
				} else {
					memberlistdoc.setonline(data.name, true);
					memberlistdoc.sort();
					this.appendtochatbox(strings['systemmessage'], 'system', data.name + '&nbsp;' + strings['join'], new Date(data.time));
					var cursor = newcursor(data.name);
					if(cursors[data.name] && cursors[data.name].element)
						$(cursors[data.name].element).remove();
					cursors[data.name] = { element:cursor, pos:0 };
				}
			},
			unauthorizedFunc:function(data){
				this.backtologin();
				$('#login-error').attr('str', 'needrelogin');
				this.showmessage('login-message', 'needrelogin', 'error');

				if(!window.joinedARoom){
					return;
				}
				window.joinedARoom = false;
				window.voiceConnection.myLocalStream.stop();
				window.voiceConnection.leave();
				while(window.userArray.length > 0){
					$(window.audioArray[window.userArray.shift()]).remove();
				}
				delete window.voiceConnection;
			},
			bpsokFunc:function(data){
				var chg = bq.shift();
				if (!chg)
					return;
				bps = bps.substr(0, chg.from) + chg.text + bps.substr(chg.to);
				if(debugLock)
					old_bps = old_bps.substr(0, chg.from) + chg.text + old_bps.substr(chg.to);
				doc.version++;
				doc.version = doc.version % 65536;
				for(var i = 0; i < q.length; i++){
					q[i].version++;
					q[i].version = q[i].version % 65536;
				}
				for(var i = 0; i < bq.length; i++){
					bq[i].version++;
					bq[i].version = bq[i].version % 65536;
				}
				if(q.length > 0){
					window.app.socket.emit('change', q[0]);
				}
				if (bq.length > 0){
					window.app.socket.emit('bps', bq[0]);
				}
			},
			bpsFunc:function(data){
				var tfrom = data.from;
				var tto = data.to;
				var ttext = data.text;
				for (var i = 0; i < bq.length; i++){
					if (bq[i].to <= tfrom){
						tfrom += bq[i].text.length + bq[i].from - bq[i].to;
						tto += bq[i].text.length + bq[i].from - bq[i].to;
					}
					else if (bq[i].to <= tto && bq[i].from <= tfrom){
						var tdlen = tto - bq[i].to;
						bq[i].to = tfrom;
						tfrom = bq[i].from + bq[i].text.length;
						tto = tfrom + tdlen;
					}
					else if (bq[i].to <= tto && bq[i].from > tfrom){
						tto = tto + bq[i].text.length + bq[i].from - bq[i].to;
						ttext = bq[i].text + ttext;
						bq[i].from = tfrom;
						bq[i].to = tfrom;					
					}
					else if (bq[i].to > tto && bq[i].from <= tfrom){
						var bqlen = bq[i].text.length;
						//q[i].to = q[i].to + ttext.length + tfrom - tto;
						bq[i].to = bq[i].to + ttext.length + tfrom - tto;
						bq[i].text = bq[i].text + ttext;
						tfrom = bq[i].from + bqlen;
						tto = tfrom;
					}
					else if (bq[i].to > tto && bq[i].from <= tto){
						var bqdlen = bq[i].to - tto;
						tto = bq[i].from;
						bq[i].from = tfrom + ttext.length;
						bq[i].to = bq[i].from + bqdlen;
					}
					else if (bq[i].from > tto){
						bq[i].from += ttext.length + tfrom - tto;
						bq[i].to += ttext.length + tfrom - tto;
					}
					bq[i].version++;
					bq[i].version = bq[i].version % 65536;
				}
				for (var i = 0; i < q.length; i++){
					q[i].version++;
					q[i].version = q[i].version % 65536;
				}
				bps = bps.substr(0, data.from) + data.text + bps.substr(data.to);
				if(debugLock)
					old_bps = old_bps.substr(0, data.from) + data.text + old_bps.substr(data.to);
				if (data.to == data.from + 1){
					if (data.text == "1"){
						var element = $('<div><img src="images/breakpoint.png" /></div>').get(0);
						editor.setGutterMarker(data.from, 'breakpoints', element);
					}
					else if (data.text == "0"){
						var info = editor.lineInfo(data.from);
						if (info.gutterMarkers && info.gutterMarkers["breakpoints"]) {
							editor.setGutterMarker(data.from, 'breakpoints', null);
						}
					}
				}
				doc.version++;
				doc.version = doc.version % 65536;
				if(bq.length > 0){
					window.app.socket.emit('bps', bq[0]);
				}
			},
			okFunc:function(data){
				var chg = q.shift();
				if(!chg)
					return;
				doc.text = doc.text.substr(0, chg.from) + chg.text + doc.text.substr(chg.to);
				doc.version++;
				doc.version = doc.version % 65536;
				for(var i = 0; i < q.length; i++){
					q[i].version++;
					q[i].version = q[i].version % 65536;
				}
				for(var i = 0; i < bq.length; i++){
					bq[i].version++;
					bq[i].version = bq[i].version % 65536;
				}
				if(q.length > 0){
					window.app.socket.emit('change', q[0]);
				}
				if (bq.length > 0){
					window.app.socket.emit('bps', bq[0]);
				}
			},
			changeFunc:function(data){
				lock = true;
				var tfrom = data.from;
				var tto = data.to;
				var ttext = data.text;
				for (var i = 0; i < q.length; i++){
					if (q[i].to <= tfrom){
						tfrom += q[i].text.length + q[i].from - q[i].to;
						tto += q[i].text.length + q[i].from - q[i].to;
					}
					else if (q[i].to <= tto && q[i].from <= tfrom){
						var tdlen = tto - q[i].to;
						q[i].to = tfrom;
						tfrom = q[i].from + q[i].text.length;
						tto = tfrom + tdlen;
					}
					else if (q[i].to <= tto && q[i].from > tfrom){
						tto = tto + q[i].text.length + q[i].from - q[i].to;
						ttext = q[i].text + ttext;
						q[i].from = tfrom;
						q[i].to = tfrom;					
					}
					else if (q[i].to > tto && q[i].from <= tfrom){
						var qlen = q[i].text.length;
						//q[i].to = q[i].to + ttext.length + tfrom - tto;
						q[i].to = q[i].to + ttext.length + tfrom - tto;
						q[i].text = q[i].text + ttext;
						tfrom = q[i].from + qlen;
						tto = tfrom;
					}
					else if (q[i].to > tto && q[i].from <= tto){
						var qdlen = q[i].to - tto;
						tto = q[i].from;
						q[i].from = tfrom + ttext.length;
						q[i].to = q[i].from + qdlen;
					}
					else if (q[i].from > tto){
						q[i].from += ttext.length + tfrom - tto;
						q[i].to += ttext.length + tfrom - tto;
					}
					q[i].version++;
					q[i].version = q[i].version % 65536;
				}
				for (var i = 0; i < bq.length; i++){
					bq[i].version++;
					bq[i].version = bq[i].version % 65536;
				}
				if (bufferfrom != -1){
					if (bufferto == -1){
						if (bufferfrom <= tfrom){
							tfrom += buffertext.length;
							tto += buffertext.length;
						}
						else if (bufferfrom <= tto){
							tto += buffertext.length;
							ttext = buffertext + ttext;
							bufferfrom = tfrom;
						}
						else {
							bufferfrom += ttext.length + tfrom - tto;
						}
					}
					else{
						if (bufferto <= tfrom){
							tfrom += bufferfrom - bufferto;
							tto += bufferfrom - bufferto;
						}
						else if (bufferto <= tto && bufferfrom <= tfrom){
							var tdlen = tto - bufferto;
							bufferto = tfrom;
							tfrom = bufferfrom;
							tto = tfrom + tdlen;
						}
						else if (bufferto <= tto && bufferfrom > tfrom){
							tto = tto + bufferfrom - bufferto;
							bufferfrom = -1;
							bufferto = -1;					
						}
						else if (bufferto > tto && bufferfrom <= tfrom){
							bufferto = bufferto + ttext.length + tfrom - tto;
							buffertext = buffertext + ttext;
							tfrom = bufferfrom;
							tto = tfrom;
						}
						else if (bufferto > tto && bufferfrom <= tto){
							var qdlen = bufferto - tto;
							tto = bufferfrom;
							bufferfrom = tfrom + ttext.length;
							bufferto = bufferfrom + qdlen;
						}
						else if (bufferfrom > tto){
							bufferfrom += ttext.length + tfrom - tto;
							bufferto += ttext.length + tfrom - tto;
						}
					}
				}
				var delta = tfrom + ttext.length - tto;
				var editorDoc = editor.getDoc();
				var hist = editorDoc.getHistory();
				var donefrom = new Array(hist.done.length);
				var doneto = new Array(hist.done.length);
				for (var i = 0; i < hist.done.length; i++) {
					donefrom[i] = editor.indexFromPos(hist.done[i].changes[0].from);
					doneto[i] = editor.indexFromPos(hist.done[i].changes[0].to);
				}
				var undonefrom = new Array(hist.undone.length);
				var undoneto = new Array(hist.undone.length);
				for (var i = 0; i < hist.undone.length; i++) {
					undonefrom[i] = editorDoc.indexFromPos(hist.undone[i].changes[0].from);
					undoneto[i] = editorDoc.indexFromPos(hist.undone[i].changes[0].to);
				}
				for (var i = 0; i < hist.done.length; i++){
					if (doneto[i] <= tfrom){
					}
					else if (doneto[i] <= tto && donefrom[i] <= tfrom){
						hist.done[i].changes[0].to = editor.posFromIndex(tfrom);
						//doneto[i] = tfrom;
					}
					else if (doneto[i] <= tto && donefrom[i] > tfrom){
						hist.done[i].changes[0].from = editor.posFromIndex(tfrom);
						hist.done[i].changes[0].to = editor.posFromIndex(tfrom);					
					}
				}
				for (var i = 0; i < hist.undone.length; i++){
					if (undoneto[i] <= tfrom){
					}
					else if (undoneto[i] <= tto && undonefrom[i] <= tfrom){
						hist.undone[i].changes[0].to = editor.posFromIndex(tfrom);
						//undoneto[i] = tfrom;
					}
					else if (undoneto[i] <= tto && undonefrom[i] > tfrom){
						hist.undone[i].changes[0].from = editor.posFromIndex(tfrom);
						hist.undone[i].changes[0].to = editor.posFromIndex(tfrom);					
					}
				}
				editor.replaceRange(ttext, editor.posFromIndex(tfrom), editor.posFromIndex(tto));
				for (var i = 0; i < hist.done.length; i++){
					if (doneto[i] <= tfrom){
					}
					else if (doneto[i] <= tto && donefrom[i] <= tfrom){					
					}
					else if (doneto[i] <= tto && donefrom[i] > tfrom){		
					}
					else if (doneto[i] > tto && donefrom[i] <= tfrom){
						hist.done[i].changes[0].to = editor.posFromIndex(doneto[i] + delta);
						/*var arr = ttext.split("\n");
						hist.done[i].changes[0].text[hist.done[i].changes[0].text.length-1] += arr[0];
						arr.shift();
						if (arr.length > 0)
							hist.done[i].changes[0].text = hist.done[i].changes[0].text.concat(arr);*/
					}				
					else if (doneto[i] > tto && donefrom[i] <= tto){
						hist.done[i].changes[0].from = editor.posFromIndex(tfrom + ttext.length);
						hist.done[i].changes[0].to = editor.posFromIndex(donefrom[i] + doneto[i] - tto);
					}
					else if (donefrom[i] > tto){
						hist.done[i].changes[0].from = editor.posFromIndex(donefrom[i] + ttext.length + tfrom - tto);
						hist.done[i].changes[0].to = editor.posFromIndex(doneto[i] + ttext.length + tfrom - tto);
					}
				}
				for (var i = 0; i < hist.undone.length; i++){
					if (undoneto[i] <= tfrom){
					}
					else if (undoneto[i] <= tto && undonefrom[i] <= tfrom){					
					}
					else if (undoneto[i] <= tto && undonefrom[i] > tfrom){		
					}
					else if (undoneto[i] > tto && undonefrom[i] <= tfrom){
						hist.undone[i].changes[0].to = editor.posFromIndex(undoneto[i] + delta);
						/*var arr = ttext.split("\n");
						hist.undone[i].changes[0].text[hist.undone[i].changes[0].text.length-1] += arr[0];
						arr.shift();
						if (arr.length > 0)
							hist.undone[i].changes[0].text = hist.undone[i].changes[0].text.concat(arr);*/
					}				
					else if (undoneto[i] > tto && undonefrom[i] <= tto){
						hist.undone[i].changes[0].from = editor.posFromIndex(tfrom + ttext.length);
						hist.undone[i].changes[0].to = editor.posFromIndex(undonefrom[i] + undoneto[i] - tto);
					}
					else if (undonefrom[i] > tto){
						hist.undone[i].changes[0].from = editor.posFromIndex(undonefrom[i] + ttext.length + tfrom - tto);
						hist.undone[i].changes[0].to = editor.posFromIndex(undoneto[i] + ttext.length + tfrom - tto);
					}
				}
				for (var i = 0; i < hist.done.length; i++){
					hist.done[i].anchorAfter = hist.done[i].changes[0].from;
					hist.done[i].anchorBefore = hist.done[i].changes[0].from;
					hist.done[i].headAfter = hist.done[i].changes[0].from;
					hist.done[i].headBefore = hist.done[i].changes[0].from;
				}
				for (var i = 0; i < hist.undone.length; i++){
					hist.undone[i].anchorAfter = hist.undone[i].changes[0].from;
					hist.undone[i].anchorBefore = hist.undone[i].changes[0].from;
					hist.undone[i].headAfter = hist.undone[i].changes[0].from;
					hist.undone[i].headBefore = hist.undone[i].changes[0].from;
				}
				editorDoc.setHistory(hist);
				doc.text = doc.text.substr(0, data.from) + data.text + doc.text.substr(data.to);
				doc.version++;
				doc.version = doc.version % 65536;
				if(q.length > 0){
					window.app.socket.emit('change', q[0]);
				}
				
				var pos = editor.posFromIndex(data.from + data.text.length);
				cursors[data.name].pos = data.from + data.text.length;
				editor.addWidget(pos, cursors[data.name].element, false);
			},
			runFunc:function(data){
				this.appendtochatbox(strings['systemmessage'], 'system', data.name + '&nbsp;&nbsp;' + strings['runsaprogram'], new Date(data.time));
				this.setrun();
				operationLock = false;
			},
			stdinFunc:function(data){
				this.appendtoconsole(data.data, 'stdin');
			},
			stdoutFunc:function(data){
				this.appendtoconsole(data.data);
			},
			stderrFunc:function(data){
				this.appendtoconsole(data.data, 'stderr');
			},
			exitFunc:function(data){
				operationLock = false;
				if(data.err.code !== undefined)
					this.appendtochatbox(strings['systemmessage'], 'system', strings['programfinish'] + '&nbsp;' + data.err.code, new Date(data.time));
				else
					this.appendtochatbox(strings['systemmessage'], 'system', strings['programkilledby'] + '&nbsp;' + data.err.signal, new Date(data.time));

				if(runLock) {
					$('#editor-run').html('<i class="icon-play"></i>');
					$('#editor-run').attr('title', strings['run-title']);
					runLock = false;
				}
				if(debugLock) {
					editor.setValue(old_text);
					this.removeallbreakpoints();
					this.initbreakpoints(old_bps);

					var editordoc = editor.getDoc();
					var hist = editordoc.getHistory();
					hist.done.pop();
					editordoc.setHistory(hist);

					editor.setOption('readOnly', false);	
					if(q.length > 0){
						window.app.socket.emit('change', q[0]);
					}
					$('#editor-debug').html('<i class="icon-eye-open"></i>');
					$('#editor-debug').attr('title', strings['debug-title']);
					this.runtoline(-1);
					for(var k in expressionlist.elements) {
						expressionlist.setValue(expressionlist.elements[k].expression, null);
					}
					debugLock = false;
				}
				this.setrunanddebugstate();
				$('#console-title').text(strings['console'] + strings['finished']);
			},
			debugFunc:function(data){
				this.appendtochatbox(strings['systemmessage'], 'system', data.name + '&nbsp;&nbsp;' + strings['startdebug'], new Date(data.time));
				this.setdebug();

				editor.setOption('readOnly', true);
				old_text = editor.getValue();
				old_bps = bps;
				editor.setValue(data.text);
				this.removeallbreakpoints();
				this.initbreakpoints(data.bps);

				var editordoc = editor.getDoc();
				var hist = editordoc.getHistory();
				hist.done.pop();
				editordoc.setHistory(hist);

				operationLock = false;
			},
			runningFunc:function(data){
				if(!debugLock)
					return;
				waiting = false;
				this.runtoline(-1);
				$('.debugandwait').addClass('disabled');
				$('#console-title').text(strings['console']);
			},
			waitingFunc:function(data){
				if(!debugLock)
					return;
				waiting = true;
				if(typeof data.line === 'number'){
					this.runtoline(data.line - 1);
				}else{
					this.runtoline(-1);
				}
				for(var k in data.exprs) {
					expressionlist.setValue(k, data.exprs[k]);
				}
				$('.debugandwait').removeClass('disabled');
				if(typeof data.line === 'number')
					$('#console-title').text(strings['console'] + strings['waiting']);
				else if(data.line !== null)
					$('#console-title').text(strings['console'] + strings['waiting'] + '[' + data.line + ']');
				else
					$('#console-title').text(strings['console'] + strings['waiting'] + strings['nosource']);
			},
			leaveFunc:function(data){
				memberlistdoc.setonline(data.name, false);
				memberlistdoc.sort();
				this.appendtochatbox(strings['systemmessage'], 'system', data.name + '&nbsp;' + strings['leave'], new Date(data.time));
				if(cursors[data.name]) {
					if(cursors[data.name].element)
						$(cursors[data.name].element).remove();
					delete cursors[data.name];
				}
			},
			chatFunc:function(data){
				var text = htmlescape(data.text);
				var time = new Date(data.time);
				this.appendtochatbox(data.name, (data.name == testUser.get('name')?'self':''), text, time);
			},
			rmexprFunc:function(data){
				expressionlist.removeElementByExpression(data.expr);
			},
			addexprFunc:function(data){
				if(data.expr) {
					expressionlist.addExpression(data.expr);
					expressionlist.setValue(data.expr, data.val);
				}
			},
			backtologin: function() {
				$('#big-one .container').removeAttr('style');
				$('#big-one').animate({
					height: '120px',
					padding: '60px',
					'margin-bottom': '30px'
				}, 'fast', function() {
					$('#big-one').removeAttr('style');
					$('#big-one .container').css('margin', 'auto');
					$('#login-inputName').focus();
					resize();
				});
				$('#nav-head').fadeOut('fast');
				$('#filecontrol').hide();
				$('#editor').hide();
				router.navigate('login', { trigger: true });
				// $('#login').fadeIn('fast');
				$('#footer').fadeIn('fast');
				$('.modal').modal('hide');
			},
			showmessage: function(id, stringid, type) {
				var o = $('#' + id);
				o.removeClass('alert-error');
				o.removeClass('alert-success');
				o.removeClass('alert-info');
				if (type && type != '' && type != 'warning')
					o.addClass('alert-' + type);
				if (strings[stringid])
					$('#' + id + ' span').html(strings[stringid]);
				else
					$('#' + id + ' span').html(stringid);
				o.slideDown();
			},
			showmessageindialog: function(id, stringid, index) {
				if(index === undefined) {
					$('#' + id + ' .control-group').addClass('error');
					if(strings[stringid])
						$('#' + id + ' .help-inline').text(strings[stringid]);
					else
						$('#' + id + ' .help-inline').text(stringid);
				} else {
					$('#' + id + ' .control-group:eq('+index+')').addClass('error');
					if(strings[stringid])
						$('#' + id + ' .help-inline:eq('+index+')').text(strings[stringid]);
					else
						$('#' + id + ' .help-inline:eq('+index+')').text(stringid);
				}
			},
			showmessagebox: function(title, content, timeout) {
				if(strings[title])
					$('#messagedialogLabel').html(strings[title]);
				else
					$('#messagedialogLabel').html(title);
				if(strings[content])
					$('#messagedialogContent').html(strings[content]);
				else
					$('#messagedialogContent').html(content);
				$('#messagedialog').modal('show');
				t = setTimeout('$(\'#messagedialog\').modal(\'hide\');', timeout*1000);
			},
			loading: function(id) {
				if (this.va.loadings[id])
					return;
				var o = $('#' + id);
				o.after('<p id="' + id + '-loading" align="center" style="margin:1px 0 2px 0"><img src="images/loading.gif"/></p>');
				o.hide();
				this.va.loadings[id] = {
					self: o,
					loading: $('#' + id + '-loading')
				};
			},
			removeloading: function (id) {
				if (!this.va.loadings[id])
					return;
				this.va.loadings[id].self.show();
				this.va.loadings[id].loading.remove();
				delete this.va.loadings[id];
			},
			cleanloading: function() {
				for (var k in this.va.loadings) {
					this.removeloading(k);
				}
			},
			getdirstring: function() {
				if(dirMode == 'owned')
					return '/' + currentDir.join('/');
				else {
					var name = currentDir.shift();
					var r = '/' + currentDir.join('/');
					if(currentDir.length == 0) {
						r = '/' + name;
					}
					currentDir.unshift(name);
					return r;
				}
			},
			refreshlistdone: function(data){
				filelist.removeloading();
				if(data.err){
					filelisterror();
					this.showmessagebox('error', 'failed', 1);
				} else {
					$('#current-dir').html(getdirlink());
					if(dirMode == 'owned')
						filelist.setmode(filelist.getmode() | 2);
					else
						filelist.setmode(0);
					if(currentDir.length == 1) {
						if(dirMode == 'owned')
							filelist.setmode(filelist.getmode() | 1);
						filelist.formdocs(data.doc, docshowfilter);
						memberlist.clear();
						memberlist.add(testUser.toJSON());
					} else {
						filelist.setmode(filelist.getmode() & ~1);
						filelist.formdocs(data.doc.docs, docshowfilter, data.doc.members.length > 0, data.doc);
						memberlist.fromdoc(data.doc);
						memberlistdoc.fromdoc(data.doc);
					}
					if(doccallback)
						doccallback();
				}
				operationLock = false;
			},
			refreshfilelist: function(error, callback) {
				operationLock = true;
				filelist.loading();
				dochandler = jQuery.proxy(this,"refreshlistdone");

				//dochandler = this.refreshlistdone;
				doccallback = callback;
				window.app.socket.emit('doc', {
					path: currentDirString
				});
				filelisterror = error;
			},
			getString:function() {
				$('[localization]').html(function(index, old) {
					if($(this).attr('str') == null)
						$(this).attr('str', old);
					if(strings[old])
						return strings[old];
					return old;
				});
				
				$('[title]').attr('title', function(index, old) {
					if($(this).attr('str') == null)
						$(this).attr('str', old);
					if(strings[old])
						return strings[old];
					return old;
				});
			},
			appendtochatbox:function(name, type, content, time) {
				$('#chat-show-inner').append(
					'<p class="chat-element"><span class="chat-name ' + type +
					'">' + name + '&nbsp;&nbsp;' + time.toTimeString().substr(0, 8) + '</span><br />' + content + '</p>'
					);
				var o = $('#chat-show').get(0);
				o.scrollTop = o.scrollHeight;
			},
			appendtoconsole:function(content, type){
				if(type) {
					type = ' class="' + type + '"';
				} else {
					type = '';
				}
				$('#console-inner').append(
					'<span' + type + '">' + htmlescape(content) + '</span>'
				);
				var o = $('#console-inner').get(0);
				o.scrollTop = o.scrollHeight;
			},
			setsavedthen:function(timestamp){
				if(savetimestamp == timestamp) {
					$('#current-doc-state').removeClass('red');
					$('#current-doc-state').text(strings['saved']);
					$('#editor-back').popover('destroy');
					$('#editor-back').attr('title', strings['back']);
					issaving = false;
					this.setrunanddebugstate();
				}
			},			
			setrunanddebugstate:function(){
				$('#editor-run').removeClass('disabled');
				$('#editor-debug').removeClass('disabled');
				if(!this.runenabled())
					$('#editor-run').addClass('disabled');
				if(!this.debugenabled())
					$('#editor-debug').addClass('disabled');
			},
			debugenabled:function (){
				return (debugable && !runLock && (!issaving || debugLock));
			},
 			runenabled:function(){
				return (runable && !debugLock && (!issaving || runLock));
			},
			changelanguage:function(language) {
				if(languagemap[language]) {
					if(modemap[language])
						editor.setOption('mode', modemap[language]);
					else
						editor.setOption('mode', languagemap[language]);
					CodeMirror.autoLoadMode(editor, languagemap[language]);
				} else {
					editor.setOption('mode', 'text/plain');
					CodeMirror.autoLoadMode(editor, '');
				}
			},
			checkrunanddebug:function(){
				var selfthis = this;
				if(ENABLE_RUN) {
					runable = this.isrunable(ext);
				}
				if(ENABLE_DEBUG) {
					debugable = this.isdebugable(ext);
					if(debugable) {
						gutterclick = function(cm, n) {
							if(debugLock && !waiting)
								return;
							if (!selfthis.removebreakpointat(cm, n)){
								selfthis.addbreakpointat(cm, n);
							}
						};
					} else {
						gutterclick = function(cm, n) { };
					}
					this.removeallbreakpoints();
				}
				this.setrunanddebugstate();
			},
			isrunable:function(ext){
				for(var i=0; i<runableext.length; i++) {
					if(runableext[i] == ext)
						return true;
				}
				return false;
			},
			isdebugable:function(ext) {
				for(var i=0; i<debugableext.length; i++) {
					if(debugableext[i] == ext)
						return true;
				}
				return false;
			},
			removebreakpointat:function(cm, n){
				var info = cm.lineInfo(n);
				if (info.gutterMarkers && info.gutterMarkers["breakpoints"]) {
					cm.setGutterMarker(n, 'breakpoints', null);
					//bps = bps.substr(0, n) + "0" + bps.substr(n+1);
					this.sendbreak(n, n+1, "0");
					return true;
				}
				return false;
			},
			sendbreak:function(from, to, text){
				var req = {version:doc.version, from:from, to:to, text:text};
				if(bq.length == 0){
					window.app.socket.emit('bps', req);
				}
				bq.push(req);
			},
			addbreakpointat:function(cm, n){
				var addlen = n - bps.length;
				if (addlen > 0){
					var addtext = "";
					for (var i = bps.length; i < n-1; i++){
						addtext += "0";
					}
					addtext += "1";
					//bps += addtext;
					this.sendbreak(bps.length, bps.length, addtext);
				}
				else{
					//bps = bps.substr(0, n) + "1" + bps.substr(n+1);
					this.sendbreak(n, n+1, "1");
				}

				var element = $('<div><img src="images/breakpoint.png" /></div>').get(0);
				cm.setGutterMarker(n, 'breakpoints', element);
			},
			removeallbreakpoints:function(){
				for (var i = 0; i < bps.length; i++){
					if (bps[i] == "1"){
						var info = editor.lineInfo(i);
						if (info.gutterMarkers && info.gutterMarkers["breakpoints"]) {
							editor.setGutterMarker(i, 'breakpoints', null);
						}
					}
				}
				bps.replace("1", "0");
			},
			setrunanddebugstate:function(){
				$('#editor-run').removeClass('disabled');
				$('#editor-debug').removeClass('disabled');
				if(!this.runenabled())
					$('#editor-run').addClass('disabled');
				if(!this.debugenabled())
					$('#editor-debug').addClass('disabled');
			},
			initbreakpoints:function(bpsstr) {
				bps = bpsstr;
				for (var i = bpsstr.length; i < editor.lineCount(); i++){
					bps += "0";
				}
				for (var i = 0; i < bps.length; i++){
					if (bps[i] == "1"){
						var element = $('<div><img src="images/breakpoint.png" /></div>').get(0);
						editor.setGutterMarker(i, 'breakpoints', element);
					}
				}
			},
			closeconsole:function(){
		    	if(!consoleopen)
					return;
				consoleopen = false;
				$('#under-editor').hide();
				$('#editor-console').removeClass('active');
				resize();
		    },	    
		    openconsole:function(){
		    	if(!consoleopen) {
					consoleopen = true;
					$('#under-editor').show();
					$('#editor-console').addClass('active');
					resize();
				}
				$('#console-input').focus();
		    },
		    setrun:function() {
				runLock = true;
				$('#editor-run').html('<i class="icon-stop"></i>');
				$('#editor-run').attr('title', strings['kill-title']);
				$('#console-inner').html('');
				$('#console-input').val('');
				$('#editor-debug').addClass('disabled');
				$('#console-title').text(strings['console']);
				this.openconsole();
			},
			setdebug:function(){
				debugLock = true;
				$('#editor-debug').html('<i class="icon-eye-close"></i>');
				$('#editor-debug').attr('title', strings['stop-debug-title']);
				$('#console-inner').html('');
				$('#console-input').val('');
				$('#editor-run').addClass('disabled');
				$('#console-title').text(strings['console']);
				this.openconsole();
			},
			runtoline:function(n) {
				if(runningline >= 0) {
					editor.removeLineClass(runningline, '*', 'running');
					editor.setGutterMarker(runningline, 'runat', null);
				}
				if(n >= 0) {
					editor.addLineClass(n, '*', 'running');
					editor.setGutterMarker(n, 'runat', $('<div><img src="images/arrow.png" width="16" height="16" style="min-width:16px;min-width:16px;" /></div>').get(0));
					editor.scrollIntoView({line:n, ch:0});
				}
				runningline = n;
			},
			newcursor: function(content) {
				var cursor = $(
					'<div class="cursor">' +
						'<div class="cursor-not-so-inner">' +
							'<div class="cursor-inner">' +
								'<div class="cursor-inner-inner">' +
								'</div>' +
							'</div>' +
						'</div>' +
					'</div>'
					).get(0);
				$(cursor).find('.cursor-inner').popover({
					html: true,
					content: '<b>' + content + '</b>',
					placement: 'bottom',
					trigger: 'hover'
				});
				return cursor;
			}
		});
		var loginView = commonView.extend({
			template: _.template($('#loginTemplate').html()),
			initialize: function() {
				this.__initialize();
				this.router = this.options.router;
				if (!this.va.loadDone) setTimeout('this.loadfailed',10000);
				testUser.bind("change", function() {
					window.app.socket.emit('login', testUser.toJSON());
				});
			},
			render: function() {
				this.$el.html(this.template);
				if (this.va.loadDone) {
					this.$el.find('#loading-init').remove();
					this.$el.find('#login-control').show();
				}
				// resize();
				return this;
			},
			events: {
				'click #login-button': 'login',
				'click #register-page': 'registerPage',
				'keydown input': 'pressenter'
			},
			loadfailed: function() {
				if (this.va.loadDone)
					return;
				this.va.failed = true;
				$("#loading-init").remove();
				$('#login-error').attr('str', 'loadfailed');
				this.showmessage('login-message', 'loadfailed');
			},
			login: function() {
				var name = $('#login-inputName').val();
				var pass = $('#login-inputPassword').val();
				if (name == '') {
					$('#login-error').attr('str', 'pleaseinput');
					this.showmessage('login-message', 'pleaseinput', 'error');
					return;
				}
				if (this.va.loginLock)
					return;
				this.va.loginLock = true;
				this.loading('login-control');
				testUser.set({
					"name": $('#login-inputName').val(),
					"password": $('#login-inputPassword').val(),
				});
				// window.app.socket.emit('login', {
				// 	name:$('#login-inputName').val(),
				// 	password:$('#login-inputPassword').val()
				// });
			},
			pressenter: function(e) {
				e = e || event;
				if (e.keyCode == 13 && this.va.loadDone)
					this.login();
			},
			registerPage: function() {
				this.router.navigate('register', {
					trigger: true
				});
			}
		});
		var registerView = commonView.extend({
		    template: _.template($("#registerTemplate").html()),
		    initialize: function() {
				this.__initialize();
				this.router = this.options.router;
				testUser.clear({silent : true});
				testUser.unbind('change');
				testUser.bind("change",function(){
					window.app.socket.emit('register', testUser.toJSON());
				});
		    },
		    render: function() {
				this.$el.html(this.template);
				// resize();
				return this;
		    },
		    events: {
		        'click #login-page': 'loginPage',
		        'click #register-button': 'register',
		        'input #register-inputName': 'checkvalid',
		        'focus #register-inputName': 'checkvalid',
		        'keydown': 'pressenter'
		    },
		    checkvalid: function() {
				var name = $('#register-inputName').val();
				if (!/^[A-Za-z0-9]*$/.test(name)) {
					$('#register-error').attr('str', 'name invalid');
					this.showmessage('register-message', 'name invalid');
					return;
				} else if(name.length < 6 || name.length > 20) {
					$('#register-error').attr('str', 'namelength');
					this.showmessage('register-message', 'namelength');
					return;
				} else {
					$('#register-message').slideUp();
				}
			},
			register: function() {
				var name = $('#register-inputName').val();
				var pass = $('#register-inputPassword').val();
				var confirm = $('#register-confirmPassword').val();
				if (!/^[A-Za-z0-9]*$/.test(name)) {
					$('#register-error').attr('str', 'name invalid');
					this.showmessage('register-message', 'name invalid');
					return;
				}
				if (name.length < 6 || name.length > 20) {
					$('#register-error').attr('str', 'namelength');
					this.showmessage('register-message', 'namelength');
					return;
				}
				if (pass.length > 32) {
					$('#register-error').attr('str', 'passlength');
					this.showmessage('register-message', 'passlength');
					return;
				}
				if (pass != confirm) {
					$('#register-error').attr('str', 'doesntmatch');
					this.showmessage('register-message', 'doesntmatch');
					return;
				}
				if (this.va.registerLock)
					return;
				this.va.registerLock = true;
				this.loading('register-control');
				testUser.set({
					name: name,
					password:pass,
					avatar:'images/character.png'
				});
				// window.app.socket.emit('register', {
				// 	name: name,
				// 	password: pass,
				// 	avatar: 'images/character.png'
				// });
			},
			pressenter: function(e) {
		        e = e || event;
		        if (e.keyCode == 13 && this.va.loadDone)
		            this.register();
		    }, 
			loginPage: function() {
			    this.router.navigate('login', {
			    	trigger: true
			    });
			}
		});
		var navView = commonView.extend({
			template: _.template($("#navTemplate").html()),
			initialize: function() {
				//this.model = testUser;
				this.router = this.options.router;
				testUser.unbind('change');
				// testUser.bind('change:avatar',jQuery.proxy(window,function(){
				// 	$('#nav-avatar').attr('src', testUser.get('avatar'));
				// 	$('#changeavatar-img').attr('src', testUser.get('avatar'));
				// 	$('img.user-' + testUser.get('name')).attr('src', testUser.get('avatar'));
				// }));
			},
			render: function() {
				this.$el.html(this.template(testUser.toJSON()));
				return this;
			},
			// changeavatarModel: function() {
			// 	$("#navcontainer").html(" ");
			// 	$("navcontainer").html(this.render())
			// 	this.render().$el.appendTo($('#navcontainer'));
			// },
			events: {
				// 'click #changePassWrd': 'changepasswordopen',
				// 'click #changeavatar1': 'changeavataropen',
				'change #changeavatar-input': 'changeavatar',
				'click #changepassword-button': 'changepassword',
				'keydown #changepassword-old': 'pressenter_changepsw',
				'keydown #changepassword-new': 'pressenter_changepsw',
				'keydown #changepassword-confirm': 'pressenter_changepsw',
				'click #changeavatar-img':'changeavtar_imgFunc'
			},
			changeavtar_imgFunc: function() {
				$("#changeavatar-input").click();
				// $('#changeavatar-message').hide();
				// $('#changeavatar-img').attr('src',testUser.get('avatar'));
			},
			// changepasswordopen: function() {
			// 	$('#changepassword-old').val('');
			// 	$('#changepassword-new').val('');
			// 	$('#changepassword-confirm').val('');
			// 	$('#changepassword .control-group').removeClass('error');
			// 	$('#changepassword .help-inline').text('');
			// },
			// changeavataropen: function() {
			// 	// $('#changeavatar-message').hide();
			// 	// $('#changeavatar-img').attr('src',testUser.get('avatar'));
			// },
			changeavatar: function(ev) {
				var o = $(ev.target)[0];
				if (o.files.length < 0) {
					$('#changeavatar-error').attr('str', 'selectuser');
					this.showmessage('changeavatar-message', 'selectuser', 'error');
					return;
				}
				if (operationLock)
					return;
				operationLock = true;
				var file = o.files[0];
				var reader = new FileReader();
				var self = this;
				reader.onloadend = function() {
					if (reader.error) {
						$('#changeavatar-error').attr('str', reader.err);
						self.showmessage('changeavatar-message', reader.error, 'error');
						operationLock = false;
					} else {
						var s = reader.result;
						var t = s.substr(s.indexOf('base64') + 7);
						if (t.length > 0x100000) {
							$('#changeavatar-error').attr('str', 'too large');
							self.showmessage('changeavatar-message', 'too large', 'error');
						}
						window.app.socket.emit('avatar', {
							type: file.type,
							avatar: t
						});
					}
				};
				reader.readAsDataURL(file);
			},
			changepassword: function() {
				var old = $('#changepassword-old').val();
				var pass = $('#changepassword-new').val();
				var confirm = $('#changepassword-confirm').val();
				$('#changepassword .control-group').removeClass('error');
				$('#changepassword .help-inline').text('');
				if (pass != confirm) {
					this.showmessageindialog('changepassword', 'doesntmatch', 2);
					return;
				}
				if (operationLock)
					return;
				operationLock = true;
				this.loading('changepassword-buttons');
				window.app.socket.emit('password', {
					password: old,
					newPassword: pass
				});
			},
			pressenter_changepsw: function(e) {
				e = e || event;
				if (e.keyCode == 13 && this.va.loadDone)
					this.changepassword();
			}
		});
		var initfilecontrol = commonView.extend({
			initialize: function() {
				this.initfilecontrol();
					// === Style switcher === //
				$('#style-switcher i').click(function()
				{
					if($(this).hasClass('open'))
					{
						$(this).parent().animate({marginRight:'-=190'});
						$(this).removeClass('open');
					} else 
					{
						$(this).parent().animate({marginRight:'+=190'});
						$(this).addClass('open');
					}
					$(this).toggleClass('icon-arrow-left');
					$(this).toggleClass('icon-arrow-right');
				});
				
				$('#style-switcher a').click(function()
				{
					var style = $(this).attr('href').replace('#','');
					$('.skin-color').attr('href','css/popush.'+style+'.css');
					$(this).siblings('a').css({'border-color':'transparent'});
					$(this).css({'border-color':'#aaaaaa'});
				});
			},
			initfilelistevent: function(fl) {
				var self  = this;
				
				fl.onname = function(o) {
					if (operationLock)
						return;
					if (o.type == 'dir') {
						currentDir.push(o.name);
						currentDirString = self.getdirstring();
						self.refreshfilelist(function() {
							currentDir.pop();
							currentDirString = self.getdirstring();
						});
					} else if (o.type == 'doc') {
						if(operationLock)
							return;
						operationLock = true;
						filelist.loading();
						docobj = o;
						window.app.socket.emit('join', {
							path: o.path
						});
						window.app.socket.removeAllListeners();
						router.navigate('editor', { trigger: true });
					}
				};
				fl.ondelete = function(o) {
					if (o.type == 'dir')
						$('#delete').find('.folder').text(strings['folder']);
					else
						$('#delete').find('.folder').text(strings['file']);
					$('#delete-name').text(o.name);
					$('#delete').modal('show');
					deleteconfirm = function() {
						if (operationLock)
							return;
						operationLock = true;
						self.loading('delete-buttons');
						window.app.socket.emit('delete', {
							path: o.path
						});
					};
				};
				fl.onrename = function(o) {
					$('#rename-inputName').val(o.name);
					$('#rename .control-group').removeClass('error');
					$('#rename .help-inline').text('');
					$('#rename').modal('show');
					rename = function() {
						var name = $('#rename-inputName').val();
						name = $.trim(name);
						if (name == '') {
							self.showmessageindialog('rename', 'inputfilename');
							return;
						}
						if (/\/|\\|@/.test(name)) {
							self.showmessageindialog('rename', 'filenameinvalid');
							return;
						}
						if (name == o.name) {
							$('#rename').modal('hide');
							return;
						}
						if (operationLock)
							return;
						operationLock = true;
						self.loading('rename-buttons');
						movehandler = function(data) {
							if (data.err) {
								self.showmessageindialog('rename', data.err, 0);
								operationLock = false;
							} else {
								$('#rename').modal('hide');
								operationLock = false;
								self.refreshfilelist(function() {;
								});
							}
							self.removeloading('rename-buttons');
						};
						window.app.socket.emit('move', {
							path: o.path,
							newPath: currentDirString + '/' + name
						});
					};
				};
				fl.onshare = function(o) {
					$('#share-name').text(o.name);
					$('#share-inputName').val('');
					$('#share-message').hide();
					userlist.fromusers(o.members, '#share-user-list');
					$('#share').modal('show');
					currentsharedoc = o;
				};
				fl.ondownload = function(o) {
					if(operationLock)
						return;
					operationLock = true;
					var emitted = false;
					window.app.socket.on('filedownload', function(data){
						if(!data.err && emitted) {
							var datacontent = data.text;
							console.log(datacontent);
							var filepath = o.path.split('/');
							$('#filedownload').attr("download", filepath[filepath.length-1]);
							$('#filedownload').attr("href", "data:text/plain," + encodeURI(datacontent));
							$('#filedownloaddiv').trigger("click");
							emitted = false;
						}
					});
					window.app.socket.emit('filedownload', {
						path: o.path
					});
					emitted = true;
					operationLock = false;
				};
				fl.onstatistics = function(o) {
					if(operationLock)
						return;
					operationLock = true;
					var oname = o.path.split('/');
					oname = oname[oname.length-1];
					for(var i = 0; i < sharedocs.length; i++) {
						var docname = sharedocs[i].path.split('/');
						docname = docname[docname.length-1];
						if(oname == docname) {
							if(!sharedocs[i].score) {
								alert("服务器忙，请稍后再试");
							}
							else{
								var string = "";
								for(var j = 0; j < sharedocs[i].score.length; j++) {
									string += "用户" + sharedocs[i].score[j][0] + "的贡献积分为" + sharedocs[i].score[j][1] + ";";
								}
								alert(string);
							}
						}
					}
					operationLock = false;
				};
				fl.onstatistics = function(o) {
					if(operationLock)
						return;
					operationLock = true;
					var oname = o.path.split('/');
					oname = oname[oname.length-1];
					for(var i = 0; i < sharedocs.length; i++) {
						var docname = sharedocs[i].path.split('/');
						docname = docname[docname.length-1];
						if(oname == docname) {
							if(!sharedocs[i].score) {
								alert("服务器忙，请稍后再试");
							}
							else{
		
								var data = [];
								var labels = [];
								for (var j = 0; j < sharedocs[i].score.length; j++) {
									data.push(sharedocs[i].score[j][1]);
									labels.push(sharedocs[i].score[j][0]);
								};
								var bardata = {
									labels: labels,
									datasets: [{
										fillColor: "rgba(220,220,220,0.5)",
										strokeColor: "rgba(220,220,220,1)",
										data: data
									}]
								}
					
								var myLine = new Chart(document.getElementById("canvas").getContext("2d")).Bar(bardata);
								$('#canvasModal').modal('toggle')
							}
						}
					}
					operationLock = false;
				};
			},
			initfilecontrol: function() {
				filelist = fileList('#file-list-table');
				filelist.clear();
				this.initfilelistevent(filelist);
				userlist.clear('#share-user-list');
				alluserlists.push(userlist);
				memberlist = userListAvatar('#member-list');
				docshowfilter = this.allselffilter;
			}
		});
		var filecontrolView = commonView.extend({
		    template:_.template($("#filecontrolTemplate").html()),	    
		    initialize: function() {
		    	window.filecontrolscope = this;
		    	this.router = this.options.router;
		    },
			render: function() {
			    this.$el.html(this.template);
				return this;
			},
			events: {
				'click #newfileopen-button': 'newfileopen',
				'click #newfolderopen-button': 'newfolderopen',
				'click #ownedfile-button': 'ownedfilelist',
				'click #sharedfile-button': 'sharedfilelist',
				'click #newfile-button': 'newfile',
				'keydown #newfile-inputName': 'pressenter_newfile',
				'click #deleteconfirm-button': 'deleteconfirm',
				'click #rename-button': 'rename',
				'keydown #rename-inputName': 'pressenter_rename',
				'click #closeshare-button': 'closeshare',
				'keydown #share-inputName': 'pressenter_share',
				'click #share-button': 'share',
				'click #unshare-button': 'unshare',
				'click #logoutId': 'logout'
			},
			logout: function() {
				window.app.socket.emit('logout', {});
				firsttofilelist = true;
				$.removeCookie('sid');
				testUser.clear({
					silent: true
				});
				this.backtologin();
			},
			newfileopen: function() {
				$('#newfile-inputName').val('');
				$('#newfile .control-group').removeClass('error');
				$('#newfile .help-inline').text('');
				$('#newfileLabel').text(strings['newfile']);
				newfiletype = 'doc';
				$("#newfile-inputName").focus();
				//$("#newfile").modal('toggle');
			},
			newfolderopen: function() {
				$('#newfile-inputName').val('');
				$('#newfile .control-group').removeClass('error');
				$('#newfile .help-inline').text('');
				$('#newfileLabel').text(strings['newfolder']);
				newfiletype = 'dir';
				$("#newfile-inputName").focus();
			},
			ownedfilelist: function() {
				if (operationLock)
					return;
				operationLock = true;
				dirMode = 'owned';
				docshowfilter = this.allselffilter;
				currentDir = [testUser.get('name')];
				currentDirString = this.getdirstring();
				$('#current-dir').html(getdirlink());
				this.refreshfilelist(function(){;});

				$('#ownedfile').show();
				$('#ownedfileex').hide();
				$('#sharedfile').removeClass('active');
			},
			allsharefilter: function(o) {
				return currentDir.length > 1 || o.owner.name != testUser.get('name');
			},
			sharedfilelist: function() {
				if (dirMode == 'shared')
					return;
				if (operationLock)
					return;
				operationLock = true;
				dirMode = 'shared';
				docshowfilter = this.allsharefilter;
				currentDir = [testUser.get('name')];
				currentDirString = this.getdirstring();
				$('#current-dir').html(getdirlink());
				this.refreshfilelist(function(){;});
				
				$('#ownedfile').hide();
				$('#ownedfileex').show();
				$('#sharedfile').addClass('active');
			},
			newfile: function() {
				var name = $('#newfile-inputName').val();
				name = $.trim(name);
				if (name == '') {
					this.showmessageindialog('newfile', 'inputfilename');
					return;
				}
				if (/\/|\\|@/.test(name)) {
					this.showmessageindialog('newfile', 'filenameinvalid');
					return;
				}
				if (name.length > 32) {
					this.showmessageindialog('newfile', 'filenamelength');
					return;
				}
				if (operationLock)
					return;
				operationLock = true;
				this.loading('newfile-buttons');
				window.app.socket.emit('new', {
					type: newfiletype,
					path: currentDirString + '/' + name
				});
			},
			pressenter_newfile: function(e) {
				e = e || event;
				if(e.keyCode == 13 && this.va.loadDone)
					this.newfile();
			},
			deleteconfirm: function(){
				deleteconfirm();
			},
			rename: function(){
				rename();
			},
			pressenter_rename: function(e) {
				e = e || event;
				if (e.keyCode == 13 && this.loadDone)
					this.rename();
			},
			closeshare: function() {
				if (operationLock)
					return;
				this.refreshfilelist(function(){;});
				$('#share').modal('hide');
			},
			pressenter_share: function(e) {
				e = e || event;
				if (e.keyCode == 13 && this.va.loadDone)
					this.share();
			},
			share: function(){
				var name = $('#share-inputName').val();
				if (name == '') {
					$('#share-error').attr('str', 'inputusername');
					this.showmessage('share-message', 'inputusername', 'error');
					return;
				}
				if (operationLock)
					return;
				operationLock = true;
				this.loading('share-buttons');
				window.app.socket.emit('share', {
					path: currentsharedoc.path,
					name: name
				});
				router.navigate('filelist', { trigger: true });
			},
			unshare: function() {
				if (selected == -1) {
					$('#share-error').attr('str', 'selectuser');
					this.showmessage('share-message', 'selectuser', 'error');
					return;
				}
				var currentselected = alluserlists[filenumber - 1].models[selected];
				if (operationLock)
					return;
				operationLock = true;
				this.loading('share-buttons');
				window.app.socket.emit('unshare', {
					path: currentsharedoc.path,
					name: currentselected.get('name')
				});
			},
	    });
		var initeditor = commonView.extend({
			selfIniteditor:null,
			initialize: function() {
				//window.app.socket.removeAllListeners();
				selfIniteditor = this;
				this.initeditor();
			},
			winHeight:function() {
				return window.innerHeight || (document.documentElement || document.body).clientHeight;
			},			
		    setNormalScreen:function(){
			    var wrap = editor.getWrapperElement();
				$('#editormain').css('position', 'fixed');
				$('#editormain-inner').css('position', 'relative');
				$('#fullscreentip').hide();
				wrap.className = wrap.className.replace(" CodeMirror-fullscreen", "");
				wrap.style.height = "";
				document.documentElement.style.overflow = "";
			    editor.refresh();
			    editor.focus();
			},	
		    initeditor:function(){
		    	var self = selfIniteditor;
		    	CodeMirror.on(window, "resize", function() {
					var showing = document.getElementsByClassName("CodeMirror-fullscreen")[0];
					if (!showing) return;
					showing.CodeMirror.getWrapperElement().style.height = self.winHeight() + "px";
			    });
			    editor = CodeMirror.fromTextArea($('#editor-textarea').get(0), {
					lineNumbers: true,
					lineWrapping: true,
					indentUnit: 4,
					indentWithTabs: true,
					extraKeys: {
						"Esc": function() {
							if (isFullScreen()) self.setNormalScreen();
							resize();
						},
						"Ctrl-S": self.saveevent
					},
					gutters: ["runat", "CodeMirror-linenumbers", "breakpoints"]
				});
				editor.on("gutterClick", function(cm, n) {
					gutterclick(cm, n);
				});
				expressionlist = expressionList('#varlist-table');
				expressionlist.renameExpression = function(id) {
					this.doneall();
					if (debugLock && !waiting)
						return;
					var input = this.elements[id].elem.find('input');
					var span = this.elements[id].elem.find('.title');
					var expression = span.text();
					span.hide();
					input.val($.trim(expression));
					input.show();
					input.focus();
					input.select();
					this.seteditingelem(id);
				};

				expressionlist.renameExpressionDone = function(id) {
					var input = this.elements[id].elem.find('input');
					var span = this.elements[id].elem.find('span');
					var expression = $.trim(input.val());

					if (debugLock && !waiting) {
						if (!this.elements[id].notnew) {
							this.elements[id].elem.remove();
							delete this.elements[id];
						} else {
							input.hide();
							span.show();
						}
					} else {
						if (this.elements[id].notnew) {
							window.app.socket.emit('rm-expr', {
								expr: this.elements[id].expression
							});
						}

						if (expression != '') {
							window.app.socket.emit('add-expr', {
								expr: expression
							});
						}

						this.elements[id].elem.remove();
						delete this.elements[id];
					}
					this.seteditingelem(null);
				};

				expressionlist.removeExpression = function(id) {
					this.doneall();
					window.app.socket.emit('rm-expr', {
						expr: this.elements[id].expression
					});
				};
				this.registereditorevent();
				gutterclick = function(cm, n) {};
				q._push = q.push;
				q.push = function(element) {
					this._push(element);
					self.setsaving();
				}

				q._shift = q.shift;
				q.shift = function() {
					var r = this._shift();
					if(this.length == 0 && bufferfrom == -1){ // buffertext == "") {
						self.setsaved();
					}
					return r;
				}

				if(!ENABLE_RUN) {
					$('#editor-run').remove();
					if(!ENABLE_DEBUG) {
						$('#editor-console').remove();
					}
				}

				if(!ENABLE_DEBUG) {
					$('#editor-debug').remove();
				}
				if((!Browser.chrome || parseInt(Browser.chrome) < 18) &&
					(!Browser.opera || parseInt(Browser.opera) < 12)) {
					novoice = true;
					$('#voice-on').addClass('disabled');
					$('#voice-on').removeAttr('title');
					$('#voice-on').popover({
						html: true,
						placement: 'left',
						trigger: 'hover',
						container: 'body'
					});
					$('#voice-on').attr('data-content', strings['novoice']);
				}
				memberlistdoc = userListAvatar('#member-list-doc');
				resize();
				$(window).resize(resize);
				$(window).scroll(function() {
					$('#editormain-inner').css('left', (-$(window).scrollLeft()) + 'px');
				});
		    },
		    sendbuffer:function(){
				if (bufferfrom != -1) {
					if (bufferto == -1){
						var req = {version:doc.version, from:bufferfrom, to:bufferfrom, text:buffertext};
						if(q.length == 0){
							window.app.socket.emit('change', req);
						}
						q.push(req);
						buffertext = "";
						bufferfrom = -1;
					}
					else {
						var req = {version:doc.version, from:bufferfrom, to:bufferto, text:buffertext};
						if(q.length == 0){
							window.app.socket.emit('change', req);
						}
						q.push(req);
						bufferfrom = -1;
						bufferto = -1;
					}
					buffertimeout = SAVE_TIME_OUT;
				}
			},
			havebreakat:function(cm, n) {
				var info = cm.lineInfo(n);
				if (info && info.gutterMarkers && info.gutterMarkers["breakpoints"]) {
					return "1";
				}
				return "0";
			},
			sendbreak:function(from, to, text){
				var req = {version:doc.version, from:from, to:to, text:text};
				if(bq.length == 0){
					window.app.socket.emit('bps', req);
				}
				bq.push(req);
			},
			setsaving:function(){
				$('#current-doc-state').addClass('red');
				$('#current-doc-state').text(strings['saving...']);
				$('#editor-back').attr('title', '');
				$('#editor-back').popover({
					html: true,
					content: strings['unsaved'],
					placement: 'right',
					trigger: 'hover',
					container: 'body'
				});
				savetimestamp = 0;
				issaving = true;
				this.setrunanddebugstate();
			},
			save:function(){
				this.setsaving();
				if (timer != null){
					clearTimeout(timer);
				}
				timer = setTimeout("selfIniteditor.sendbuffer()", buffertimeout);
			},
			setsaved:function(){
				savetimestamp = new Date().getTime();
				setTimeout('selfIniteditor.setsavedthen(' + savetimestamp + ')', savetimeout);
				savetimeout = 500;
			},
		    registereditorevent:function() {
		    	var self = selfIniteditor;
	
				CodeMirror.on(editor.getDoc(), 'change', function(editorDoc, chg){

					//console.log(chg);

					if(debugLock){
						return true;
					}

					if(lock){
						lock = false;
						return true;
					}

					var cfrom = editor.indexFromPos(chg.from);
					var cto = editor.indexFromPos(chg.to);
					var removetext = "";
					for (var i = 0; i < chg.removed.length - 1; i++){
						removetext += chg.removed[i] + '\n';
					}
					removetext += chg.removed[chg.removed.length - 1];
					cto = cfrom + removetext.length;
					var cattext = "";
					for (var i = 0; i < chg.text.length - 1; i++){
						cattext += chg.text[i] + '\n';
					}
					cattext += chg.text[chg.text.length - 1];

					var delta = cfrom + cattext.length - cto;

					for (var k in cursors){
						if (cto <= cursors[k].pos){
							cursors[k].pos += delta;
							editor.addWidget(editor.posFromIndex(cursors[k].pos), cursors[k].element, false);
						}
						else if (cfrom < cursors[k].pos) {
							cursors[k].pos = cfrom + cattext.length;
							editor.addWidget(editor.posFromIndex(cursors[k].pos), cursors[k].element, false);
						}
					}
					
					/*if (cfrom == cto && 
						(cfrom == bufferfrom + buffertext.length || bufferfrom == -1)
						&& cattext.length == 1 && 
						((cattext[0] >= 'a' && cattext[0] <= 'z') || (cattext[0] >= 'A' && cattext[0] <= 'Z') ||
						(cattext[0] >= '0' && cattext[0] <= '9'))){
						if (bufferfrom == -1){
							buffertext = cattext;
							bufferfrom = cfrom;
						}
						else {
							buffertext += cattext;
						}
						save();
						return;
					}*/
					var bfrom = chg.from.line;
					var bto = chg.to.line;

					if (chg.text.length != (bto-bfrom+1)){
						self.sendbuffer();
						var req = {version:doc.version, from:cfrom, to:cto, text:cattext};
						if(q.length == 0){
							window.app.socket.emit('change', req);
						}
						q.push(req);
						var btext = "";
						for (var i = 0; i < chg.text.length; i++){
							btext += self.havebreakat(editor, bfrom + i);
						}
						/*
						if (chg.text[0] == "")
							btext = havebreakat(editor, bfrom);
						//var btext = "";
						for (var i = 0; i < chg.text.length - 2; i++){
							btext += "0";
						}
						btext[btext.length-1] = bps[bto];*/
						self.sendbreak(bfrom, bto+1, btext);
						return;
					}
					if (chg.text.length > 1){
						buffertimeout = buffertimeout / 2;
					}
					if (bufferto == -1 && cfrom == cto &&
						(cfrom ==  bufferfrom + buffertext.length ||  bufferfrom == -1)){
						if (bufferfrom == -1){
							buffertext = cattext;
							bufferfrom = cfrom;
						}
						else {
							buffertext += cattext;
						}
						self.save();
						return;
					}
					else if (bufferto == -1 && chg.origin == "+delete" &&
						bufferfrom != -1 && cto == bufferfrom + buffertext.length && cfrom >= bufferfrom){
						buffertext = buffertext.substr(0, cfrom - bufferfrom);
						if (buffertext.length == 0){
							bufferfrom = -1;
							if(q.length == 0){
								self.setsaved();
							}
							return;
						}
						self.save();
						return;
					}
					else if (chg.origin == "+delete" &&
						bufferfrom == -1){
						bufferfrom = cfrom;
						bufferto = cto;
						buffertext = "";
						self.save();
						return;
					}
					else if (bufferto != -1 && chg.origin == "+delete" &&
						cto == bufferfrom){
						bufferfrom = cfrom;
						self.save();
						return;
					}
					else if (bufferfrom != -1) {
						if (bufferto == -1){
							var req = {version:doc.version, from:bufferfrom, to:bufferfrom, text:buffertext};
							if(q.length == 0){
								window.app.socket.emit('change', req);
							}
							q.push(req);
							buffertext = "";
							bufferfrom = -1;
						}
						else {
							var req = {version:doc.version, from:bufferfrom, to:bufferto, text:buffertext};
							if(q.length == 0){
								window.app.socket.emit('change', req);
							}
							q.push(req);
							bufferfrom = -1;
							bufferto = -1;
						}
					}
					
					var req = {version:doc.version, from:cfrom, to:cto, text:cattext};
					if(q.length == 0){
						window.app.socket.emit('change', req);
					}
					q.push(req);
					
				});
			},
			saveevent:function() {
				if(savetimestamp != 0)
					selfIniteditor.setsavedthen(savetimestamp);
				savetimestamp = 0;
			},
		});
		var editorView = commonView.extend({
			template: _.template($("#editorTemplate").html()),
		    initialize: function () {
		    	this.__initialize();
		        this.router = this.options.router;
		    },
		    render: function () {
		        this.$el.html(this.template);
		        return this;
		    },
		    events: {
		        'click #set-fullscreen': 'setFullScreen',
		        'click #toggle-chat': 'togglechat',
		        'click #editor-run': 'run',
		        'click #editor-debug': 'debug',
		        'click #editor-console': 'toggleconsole',
		        'click #editor-back': 'closeeditor',
		        'keydown #console-input': 'pressenter1',
		        'click #debug-step': 'debugstep',
		        'click #debug-next': 'debugnext',
		        'click #debug-finish': 'debugfinish',
		        'click #debug-continue': 'debugcontinue',
		        'keydown #chat-input': 'pressenter2',
		        'click #chat': 'chat',
	            'click #voice-on': 'voice',
	            'click #logoutId': 'logout'
		    },
		   logout: function() {
				window.app.socket.emit('logout', {});
				firsttofilelist = true;
				$.removeCookie('sid');
				testUser.clear({
					silent: true
				});
				this.backtologin();
			},
		    winHeight:function() {
				return window.innerHeight || (document.documentElement || document.body).clientHeight;
			},
		    setFullScreen:function(){
			    var wrap = editor.getWrapperElement();
			    $('#editormain').css('position', 'static');
			    $('#editormain-inner').css('position', 'static');
			    $('#fullscreentip').fadeIn();
			    setTimeout('$(\'#fullscreentip\').fadeOut();', 1000);
			    wrap.className += " CodeMirror-fullscreen";
			    wrap.style.height = this.winHeight() + "px";
			    document.documentElement.style.overflow = "hidden";
			    editor.refresh();
			    editor.focus();
			},
		    togglechat: function (o) {
		        if (viewswitchLock)
		            return;
		        if (chatstate) {
		            $('#editormain').parent().removeClass('span12');
		            $('#editormain').parent().addClass('span9');
		            $('#chatbox').show();
		            $(o).html('<i class="icon-forward"></i>');
		            $(o).attr('title', strings['hide-title']);
		        } else {
		            $('#chatbox').hide();
		            $('#editormain').parent().removeClass('span9');
		            $('#editormain').parent().addClass('span12');
		            $(o).html('<i class="icon-backward"></i>');
		            $(o).attr('title', strings['show-title']);
		        }
		        var o = $('#chat-show').get(0);
		        o.scrollTop = o.scrollHeight;
		        editor.refresh();
		        resize();
		        chatstate = !chatstate;
		    },

		    run: function(){
	    		if(!this.runenabled())
					return;
				if(operationLock)
					return;
				if(runLock) {
					window.app.socket.emit('kill');
				} else {
					window.app.socket.emit('run', {
						version: doc.version,
						type: ext
					});
				}
		    },
		    debug:function(){
	    		if(!this.debugenabled())
					return;
				if(operationLock)
					return;
				operationLock = true;
				if(debugLock) {
					window.app.socket.emit('kill');
				} else {
					window.app.socket.emit('debug', {
						version: doc.version,
						type: ext
					});
				}
		    },
		    toggleconsole:function(){
	    		if(consoleopen) {
					this.closeconsole();
				} else {
					this.openconsole();
				}
		    },

		    leaveVoiceRoom:function(){
		    	while(window.userArray.length > 0){
					$(window.audioArray[window.userArray.shift()]).remove();
				}
				while(window.peerUserArray.length > 0){
					var peerUName = window.peerUserArray.shift();
					if(window.peerArray[peerUName]){
						window.peerArray[peerUName].myOnRemoteStream = function (stream){
							stream.mediaElement.muted = true;
							return;
						};
					}
				}
				if(!window.joinedARoom){
					return;
				}
				$('#voice-on').removeClass('active');
				window.voiceConnection.myLocalStream.stop();
				window.voiceConnection.leave();
				delete window.voiceConnection;
		    },

		    closeeditor:function(){
				window.app.socket.emit('leave', {});
				this.refreshfilelist(function(){;}, function(){
					$("body").animate({scrollTop: oldscrolltop});
				});
				this.leaveVoiceRoom();
				router.navigate('filelist', { trigger: true });
		    },

		    stdin:function() {
		    	if(debugLock && waiting)
					return;

				var text = $('#console-input').val();

				if(runLock || debugLock) {
					window.app.socket.emit('stdin', {
						data: text + '\n'
					});
				} else {
					this.appendtoconsole(text + '\n', 'stdin');
				}

				$('#console-input').val('');
			},

			debugstep:function(){
				if(debugLock && waiting) {
					window.app.socket.emit('step', {
					});
				}
			},

			debugnext:function(){
				if(debugLock && waiting) {
					window.app.socket.emit('next', {
					});
				}
			},

			debugfinish:function(){
				if(debugLock && waiting) {
					window.app.socket.emit('finish', {
					});
				}
			},

			debugcontinue:function(){
				if(debugLock && waiting) {
					window.app.socket.emit('resume', {
					});
				}
			},

			chat:function(){
				var text = $('#chat-input').val();
				if(text == '')
					return;

				window.app.socket.emit('chat', {
					text: text
				});
				$('#chat-input').val('');
			},

			voice:function(){
				if(novoice)
					return;
				if(window.voiceLock){
					return;
				}
				window.voiceLock = true;
				window.voiceon = !window.voiceon;
				if(window.voiceon) {
					if(window.joinedARoom){
						return;
					}
					$('#voice-on').addClass('active');
					try{
						var username = $('#nav-user-name').html();
						var dataRef = new Firebase('https://popush.firebaseIO.com/' + doc.id);
						dataRef.once('value',function(snapShot){
							delete dataRef;
							if (snapShot.val() == null){
								var connection = new RTCMultiConnection(doc.id);
								window.voiceConnection = connection;
								connection.session = "audio-only";
								connection.autoCloseEntireSession = true;

								connection.onstream = function (stream) {
									if ((stream.type == 'remote') && (stream.extra.username != username)) {
										stream.mediaElement.style.display = "none";
										stream.mediaElement.muted = false;
										stream.mediaElement.play();
										document.body.appendChild(stream.mediaElement);
										window.userArray.push(stream.extra.username);
										window.audioArray[stream.extra.username] = stream.mediaElement;
									}
								};
								connection.onUserLeft = function(userid, extra, ejected) {
									$(window.audioArray[extra.username]).remove();
									if(window.peerArray[extra.username]){
										window.peerArray[extra.username].myOnRemoteStream = function (stream){
											stream.mediaElement.muted = true;
											return;
										};
									}
								};
								connection.connect();
								
								connection.open({
									extra: {
										username: username
									},
									interval: 1000
								});
							}
							else{
								var connection = new RTCMultiConnection(doc.id);
								window.voiceConnection = connection;
								connection.session = "audio-only";
								connection.autoCloseEntireSession = true;
								
								connection.onNewSession = function (session){
									if(window.joinedARoom){
										return;
									}
									connection.join(session, {
										username: username
									});
								};
								connection.onstream = function (stream) {
									if ((stream.type == 'remote') && (stream.extra.username != username)) {
										stream.mediaElement.style.display = "none";
										stream.mediaElement.muted = false;
										stream.mediaElement.play();
										window.userArray.push(stream.extra.username);
										window.audioArray[stream.extra.username] = stream.mediaElement;
										document.body.appendChild(stream.mediaElement);
									}
								};
								connection.onUserLeft = function(userid, extra, ejected) {
									if(ejected){
										$('#voice-on').removeClass('active');
										while(window.userArray.length > 0){
											$(window.audioArray[window.userArray.shift()]).remove();
										}
										while(window.peerUserArray.length > 0){
											var peerUName = window.peerUserArray.shift();
											if(window.peerArray[peerUName]){
												window.peerArray[peerUName].myOnRemoteStream = function (stream){
													stream.mediaElement.muted = true;
													return;
												};
											}
										}
										delete window.voiceConnection;
										window.voiceon = !window.voiceon;
									}
									else{
										$(window.audioArray[extra.username]).remove();
										if(window.peerArray[extra.username]){
											window.peerArray[extra.username].myOnRemoteStream = function (stream){
												stream.mediaElement.muted = true;
												return;
											};
										}
									}
								};
								connection.connect();
							}
						});
					}
					catch(err){
						alert(err);
					}
				} else {
					this.leaveVoiceRoom();
				}				
			},
		    pressenter1:function(e) {
				e = e || event;
				if(e.keyCode == 13 && this.va.loadDone)
					this.stdin();
			},

			pressenter2:function(e) {
				e = e || event;
				if(e.keyCode == 13 && this.va.loadDone)
					this.chat();
			}
		});
		popush.Application = Backbone.Router.extend({
			fireditor:false,
			initialize: function(el) {
				this.el = el;
				router = this;
			},
			routes: {
				'': 'login',
				'login': 'login',
				'register': 'register',
				'filelist': 'filelist',
				'editor':'editor',
			},
			login: function() {
				if(localStorage.getItem('fisrtreg') == 0) {
					localStorage.setItem('fisrtreg', 1);
					window.location.reload();
				}
				var flog = true;
				var temp = testUser.toJSON();
				for(var i in temp){
					flog = false;
				}
				if(!flog && thisPage != "" && thisPage != "login") {
					thisPage = "login";
					router.navigate("filelist", {trigger: true});
					return;
				}
				$("#navcontainer").html(" ");
				if(!$.cookie('sid'))
					this.fireditor = false;
				this.clean();
				this.subclean();
				this.currentView = new loginView({router: this});
				this.currentView.render().$el.appendTo($(this.el));
				this.currentView.getString();
 				$('#login-inputName').focus();
 				thisPage = "login";
			},
			register: function() {
				$("#navcontainer").html(" ");
				if(!$.cookie('sid')){
					this.fireditor = false;
				}
				this.clean();
				this.subclean();
				this.currentView = new registerView({router: this});
				this.currentView.render().$el.appendTo($(this.el));
				this.currentView.getString();
				$('#register-inputName').focus();
				thisPage = "register";
			},			
			filelist: function() {
				var flog = true;
				var temp = testUser.toJSON();
				for(var i in temp){
					flog = false;
				}
				if(flog){
					router.navigate("login", {trigger: true});
					return;
				}
				if(!firsttofilelist && thisPage == "login"){
					thisPage = "filelist";
					return;
				}
				this.clean();
				if (!this.fireditor) {
					this.subclean();
					this.subView = new navView({
						router: this
					});
					this.subView.render().$el.appendTo($("#navcontainer"));
					this.subView.getString();
				}
				this.currentView = new filecontrolView({router: this});
				this.currentView.render().$el.appendTo($(this.el));
				this.currentView.getString();
				new initfilecontrol();
				firsttofilelist = false;
				thisPage = "filelist";
				currentDir = [testUser.get('name')];
				currentDirString = this.currentView.getdirstring();
				$('#current-dir').html(getdirlink());
				this.currentView.refreshfilelist(function(){;});
				if($("#nav-head")[0] == null){
					this.subclean();
					this.subView = new navView({
						router: this
					});
					this.subView.render().$el.appendTo($("#navcontainer"));
					this.subView.getString();
				}
				$('#nav-user-name').text(testUser.get("name"));
				$('#nav-avatar').attr('src', testUser.get("avatar"));
				if(dirMode == 'shared'){
					this.currentView.sharedfilelist();
				}
				else{
					this.currentView.ownedfilelist();
				}
			},
			editor:function(){
				this.clean();
				this.currentView = new editorView({router: this});
				this.currentView.render().$el.appendTo($(this.el));
				this.currentView.getString();
				$('#editor-textarea').focus();
				new initeditor();
				this.fireditor = true;
				thisPage = "editor";
				$('#nav-user-name').text(testUser.get("name"));
				$('#nav-avatar').attr('src', testUser.get("avatar"));
				dirMode == 'owned'
			},
			clean: function() {
				if (this.currentView) {
					this.currentView.remove();
					this.currentView = null;
					$(this.el).html('');
				}
			},
			subclean: function() {
				if (this.subView) {
					this.subView.remove();
					this.subView = null;
				}
			}
		});
		window.app.socket = io.connect('127.0.0.1:4444');
	}(popush));

	if (localStorage.getItem('lang') == null || localStorage.getItem('lang') != 'us-en') localStorage.setItem('lang', 'zh-cn');
	transinto[localStorage.getItem('lang')]();

	new popush.Application('#container');
	Backbone.history.start();
	$('boby').show();
});