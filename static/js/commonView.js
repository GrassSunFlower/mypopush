var popush = window.popush || {};
// 页面的一般通用属性
popush.commonView = popush.SocketView.extend({
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
		'set': 'setFunc',
		'join': 'joinFunc',
		'unauthorized': 'unauthorizedFunc',
		'bps': 'bpsFunc',
		'bpsok': 'bpsokFunc',
		'ok': 'okFunc',
		'change': 'changeFunc',
		'chat': 'chatFunc',
		'leave': 'leaveFunc',
		'stdin': 'stdinFunc',
		'run': 'runFunc',
		'stdout': 'stdoutFunc',
		'stderr': 'stderrFunc',
		'exit': 'exitFunc',
		'debug': 'debugFunc',
		'running': 'runningFunc',
		'waiting': 'waitingFunc',
		'leave': 'leaveFunc',
		'rm-expr': 'rmexprFunc',
		'add-expr': 'addexprFunc',
		'getcontribution': 'getcontriFunc'
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
	// 连接函数
	connFunc: function(data) {
		window.app.socket.emit('version', {});
	},
	// 登陆函数
	loginFunc: function(data) {
		if (data.err) {
			if (data.err == 'expired') {
				$.removeCookie('sid');
			} else {
				$('#login-error').attr('str', data.err);
				this.showmessage('login-message', data.err, 'error');
			}
		} else {
			operationLock = false;
			testUser.set(data.user, {
				silent: true
			});
			router.navigate('filelist', {
				trigger: true
			});
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
				docs: data.user.docs
			});
			setTimeout(function() {
				sharedocs = data.user.docs;
				for (var i = 0; i < sharedocs.length; i++) {
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
	// 注册函数
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
		testUser.clear({
			silent: true
		});
		this.removeloading('register-control');
		this.va.registerLock = false;
	},
	docFunc: function(data) {
		dochandler(data);
	},
	// 新建文件
	newFunc: function(data) {
		if (data.err) {
			this.showmessageindialog('newfile', data.err);
		} else {
			$('#newfile').modal('hide');
			if (newfiletype == 'doc')
				this.showmessagebox('newfile', 'createfilesuccess', 1);
			else
				this.showmessagebox('newfolder', 'createfoldersuccess', 1);
		}
		this.removeloading('newfile-buttons');
		operationLock = false;
		this.refreshfilelist(function() {;
		});
	},
	// 修改密码
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
	// 删除文件
	deleteFunc: function(data) {
		$('#delete').modal('hide');
		if (data.err) {
			this.showmessagebox('delete', data.err, 1);
			operationLock = false;
		} else {
			operationLock = false;
			this.refreshfilelist(function() {;
			});
		}
		this.removeloading('delete-buttons');
	},
	moveFunc: function(data) {
		movehandler(data);
	},
	sharedone: function(data) {
		if (!data.err) {
			userlist.fromusers(data.doc.members);
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
			dochandler = jQuery.proxy(this, "sharedone");
			window.app.socket.emit('doc', {
				path: currentsharedoc.path
			});
		}
	},
	unshareFunc: function(data) {
		if (data.err) {
			$('#share-error').attr('str', data.err);
			this.showmessage('share-message', data.err, 'error');
			operationLock = false;
			this.removeloading('share-buttons');
		} else {
			dochandler = jQuery.proxy(this, "sharedone");
			window.app.socket.emit('doc', {
				path: currentsharedoc.path
			});
		}
	},
	// 更换头像
	avatarFunc: function(data) {
		if (data.err) {
			$('#changeavatar-error').attr('str', data.err);
			this.showmessage('changeavatar-message', data.err, 'error');
		} else {
			testUser.set({
				avatar: data.url
			});
			$('#nav-avatar').attr('src', testUser.get('avatar'));
			$('#changeavatar-img').attr('src', testUser.get('avatar'));
			$('img.user-' + testUser.get('name')).attr('src', testUser.get('avatar'));
			memberlist.refreshpopover(testUser.toJSON());
			memberlistdoc.refreshpopover(testUser.toJSON());
			$('#changeavatar-error').attr('str', 'changeavatarok');
			this.showmessage('changeavatar-message', 'changeavatarok');
		}
		operationLock = false;
	},
	setFunc: function(data) {
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

		if (currentDir.length == 1) {
			memberlistdoc.fromdoc(docobj);
		}
		memberlistdoc.setalloffline();
		memberlistdoc.setonline(testUser.get('name'), true);

		for (var k in cursors) {
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
		for (var i in data.users) {
			memberlistdoc.setonline(i, true);
			if (i == testUser.get('name'))
				continue;
			var cursor = newcursor(i);
			if (cursors[i] && cursors[i].element)
				$(cursors[i].element).remove();
			cursors[i] = {
				element: cursor,
				pos: 0
			};
		}
		memberlistdoc.sort();

		filelist.removeloading();
		$('#console-inner').html('');
		this.closeconsole();
		expressionlist.clear();
		for (var k in data.exprs) {
			expressionlist.addExpression(k);
			expressionlist.setValue(k, data.exprs[k]);
		}

		$('#console-title').text(strings['console']);

		resize();
		$('body').scrollTop(99999);

		if (data.running) {
			this.setrun();
		}
		if (data.debugging) {
			this.setdebug();
			editor.setOption('readOnly', true);
			old_text = data.text;
			old_bps = data.bps;
			if (data.state == 'waiting') {
				waiting = true;
				this.runtoline(data.line - 1);
				$('.debugandwait').removeClass('disabled');
				if (data.line !== null)
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
	joinFunc: function(data) {
		if (data.err) {
			showmessageindialog('openeditor', data.err);
			$('#editor').slideUp('fast');
			$('#filecontrol').slideDown('fast');
		} else {
			memberlistdoc.setonline(data.name, true);
			memberlistdoc.sort();
			this.appendtochatbox(strings['systemmessage'], 'system', data.name + '&nbsp;' + strings['join'], new Date(data.time));
			var cursor = newcursor(data.name);
			if (cursors[data.name] && cursors[data.name].element)
				$(cursors[data.name].element).remove();
			cursors[data.name] = {
				element: cursor,
				pos: 0
			};
		}
	},
	unauthorizedFunc: function(data) {
		this.backtologin();
		$('#login-error').attr('str', 'needrelogin');
		this.showmessage('login-message', 'needrelogin', 'error');

		if (!window.joinedARoom) {
			return;
		}
		window.joinedARoom = false;
		window.voiceConnection.myLocalStream.stop();
		window.voiceConnection.leave();
		while (window.userArray.length > 0) {
			$(window.audioArray[window.userArray.shift()]).remove();
		}
		delete window.voiceConnection;
	},
	bpsokFunc: function(data) {
		var chg = bq.shift();
		if (!chg)
			return;
		bps = bps.substr(0, chg.from) + chg.text + bps.substr(chg.to);
		if (debugLock)
			old_bps = old_bps.substr(0, chg.from) + chg.text + old_bps.substr(chg.to);
		doc.version++;
		doc.version = doc.version % 65536;
		for (var i = 0; i < q.length; i++) {
			q[i].version++;
			q[i].version = q[i].version % 65536;
		}
		for (var i = 0; i < bq.length; i++) {
			bq[i].version++;
			bq[i].version = bq[i].version % 65536;
		}
		if (q.length > 0) {
			window.app.socket.emit('change', q[0]);
		}
		if (bq.length > 0) {
			window.app.socket.emit('bps', bq[0]);
		}
	},
	// 断点
	bpsFunc: function(data) {
		var tfrom = data.from;
		var tto = data.to;
		var ttext = data.text;
		for (var i = 0; i < bq.length; i++) {
			if (bq[i].to <= tfrom) {
				tfrom += bq[i].text.length + bq[i].from - bq[i].to;
				tto += bq[i].text.length + bq[i].from - bq[i].to;
			} else if (bq[i].to <= tto && bq[i].from <= tfrom) {
				var tdlen = tto - bq[i].to;
				bq[i].to = tfrom;
				tfrom = bq[i].from + bq[i].text.length;
				tto = tfrom + tdlen;
			} else if (bq[i].to <= tto && bq[i].from > tfrom) {
				tto = tto + bq[i].text.length + bq[i].from - bq[i].to;
				ttext = bq[i].text + ttext;
				bq[i].from = tfrom;
				bq[i].to = tfrom;
			} else if (bq[i].to > tto && bq[i].from <= tfrom) {
				var bqlen = bq[i].text.length;
				//q[i].to = q[i].to + ttext.length + tfrom - tto;
				bq[i].to = bq[i].to + ttext.length + tfrom - tto;
				bq[i].text = bq[i].text + ttext;
				tfrom = bq[i].from + bqlen;
				tto = tfrom;
			} else if (bq[i].to > tto && bq[i].from <= tto) {
				var bqdlen = bq[i].to - tto;
				tto = bq[i].from;
				bq[i].from = tfrom + ttext.length;
				bq[i].to = bq[i].from + bqdlen;
			} else if (bq[i].from > tto) {
				bq[i].from += ttext.length + tfrom - tto;
				bq[i].to += ttext.length + tfrom - tto;
			}
			bq[i].version++;
			bq[i].version = bq[i].version % 65536;
		}
		for (var i = 0; i < q.length; i++) {
			q[i].version++;
			q[i].version = q[i].version % 65536;
		}
		bps = bps.substr(0, data.from) + data.text + bps.substr(data.to);
		if (debugLock)
			old_bps = old_bps.substr(0, data.from) + data.text + old_bps.substr(data.to);
		if (data.to == data.from + 1) {
			if (data.text == "1") {
				var element = $('<div><img src="images/breakpoint.png" /></div>').get(0);
				editor.setGutterMarker(data.from, 'breakpoints', element);
			} else if (data.text == "0") {
				var info = editor.lineInfo(data.from);
				if (info.gutterMarkers && info.gutterMarkers["breakpoints"]) {
					editor.setGutterMarker(data.from, 'breakpoints', null);
				}
			}
		}
		doc.version++;
		doc.version = doc.version % 65536;
		if (bq.length > 0) {
			window.app.socket.emit('bps', bq[0]);
		}
	},
	okFunc: function(data) {
		var chg = q.shift();
		if (!chg)
			return;
		doc.text = doc.text.substr(0, chg.from) + chg.text + doc.text.substr(chg.to);
		doc.version++;
		doc.version = doc.version % 65536;
		for (var i = 0; i < q.length; i++) {
			q[i].version++;
			q[i].version = q[i].version % 65536;
		}
		for (var i = 0; i < bq.length; i++) {
			bq[i].version++;
			bq[i].version = bq[i].version % 65536;
		}
		if (q.length > 0) {
			window.app.socket.emit('change', q[0]);
		}
		if (bq.length > 0) {
			window.app.socket.emit('bps', bq[0]);
		}
	},
	// 修改
	changeFunc: function(data) {
		lock = true;
		var tfrom = data.from;
		var tto = data.to;
		var ttext = data.text;
		for (var i = 0; i < q.length; i++) {
			if (q[i].to <= tfrom) {
				tfrom += q[i].text.length + q[i].from - q[i].to;
				tto += q[i].text.length + q[i].from - q[i].to;
			} else if (q[i].to <= tto && q[i].from <= tfrom) {
				var tdlen = tto - q[i].to;
				q[i].to = tfrom;
				tfrom = q[i].from + q[i].text.length;
				tto = tfrom + tdlen;
			} else if (q[i].to <= tto && q[i].from > tfrom) {
				tto = tto + q[i].text.length + q[i].from - q[i].to;
				ttext = q[i].text + ttext;
				q[i].from = tfrom;
				q[i].to = tfrom;
			} else if (q[i].to > tto && q[i].from <= tfrom) {
				var qlen = q[i].text.length;
				//q[i].to = q[i].to + ttext.length + tfrom - tto;
				q[i].to = q[i].to + ttext.length + tfrom - tto;
				q[i].text = q[i].text + ttext;
				tfrom = q[i].from + qlen;
				tto = tfrom;
			} else if (q[i].to > tto && q[i].from <= tto) {
				var qdlen = q[i].to - tto;
				tto = q[i].from;
				q[i].from = tfrom + ttext.length;
				q[i].to = q[i].from + qdlen;
			} else if (q[i].from > tto) {
				q[i].from += ttext.length + tfrom - tto;
				q[i].to += ttext.length + tfrom - tto;
			}
			q[i].version++;
			q[i].version = q[i].version % 65536;
		}
		for (var i = 0; i < bq.length; i++) {
			bq[i].version++;
			bq[i].version = bq[i].version % 65536;
		}
		if (bufferfrom != -1) {
			if (bufferto == -1) {
				if (bufferfrom <= tfrom) {
					tfrom += buffertext.length;
					tto += buffertext.length;
				} else if (bufferfrom <= tto) {
					tto += buffertext.length;
					ttext = buffertext + ttext;
					bufferfrom = tfrom;
				} else {
					bufferfrom += ttext.length + tfrom - tto;
				}
			} else {
				if (bufferto <= tfrom) {
					tfrom += bufferfrom - bufferto;
					tto += bufferfrom - bufferto;
				} else if (bufferto <= tto && bufferfrom <= tfrom) {
					var tdlen = tto - bufferto;
					bufferto = tfrom;
					tfrom = bufferfrom;
					tto = tfrom + tdlen;
				} else if (bufferto <= tto && bufferfrom > tfrom) {
					tto = tto + bufferfrom - bufferto;
					bufferfrom = -1;
					bufferto = -1;
				} else if (bufferto > tto && bufferfrom <= tfrom) {
					bufferto = bufferto + ttext.length + tfrom - tto;
					buffertext = buffertext + ttext;
					tfrom = bufferfrom;
					tto = tfrom;
				} else if (bufferto > tto && bufferfrom <= tto) {
					var qdlen = bufferto - tto;
					tto = bufferfrom;
					bufferfrom = tfrom + ttext.length;
					bufferto = bufferfrom + qdlen;
				} else if (bufferfrom > tto) {
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
		for (var i = 0; i < hist.done.length; i++) {
			if (doneto[i] <= tfrom) {} else if (doneto[i] <= tto && donefrom[i] <= tfrom) {
				hist.done[i].changes[0].to = editor.posFromIndex(tfrom);
				//doneto[i] = tfrom;
			} else if (doneto[i] <= tto && donefrom[i] > tfrom) {
				hist.done[i].changes[0].from = editor.posFromIndex(tfrom);
				hist.done[i].changes[0].to = editor.posFromIndex(tfrom);
			}
		}
		for (var i = 0; i < hist.undone.length; i++) {
			if (undoneto[i] <= tfrom) {} else if (undoneto[i] <= tto && undonefrom[i] <= tfrom) {
				hist.undone[i].changes[0].to = editor.posFromIndex(tfrom);
				//undoneto[i] = tfrom;
			} else if (undoneto[i] <= tto && undonefrom[i] > tfrom) {
				hist.undone[i].changes[0].from = editor.posFromIndex(tfrom);
				hist.undone[i].changes[0].to = editor.posFromIndex(tfrom);
			}
		}
		editor.replaceRange(ttext, editor.posFromIndex(tfrom), editor.posFromIndex(tto));
		for (var i = 0; i < hist.done.length; i++) {
			if (doneto[i] <= tfrom) {} else if (doneto[i] <= tto && donefrom[i] <= tfrom) {} else if (doneto[i] <= tto && donefrom[i] > tfrom) {} else if (doneto[i] > tto && donefrom[i] <= tfrom) {
				hist.done[i].changes[0].to = editor.posFromIndex(doneto[i] + delta);
			} else if (doneto[i] > tto && donefrom[i] <= tto) {
				hist.done[i].changes[0].from = editor.posFromIndex(tfrom + ttext.length);
				hist.done[i].changes[0].to = editor.posFromIndex(donefrom[i] + doneto[i] - tto);
			} else if (donefrom[i] > tto) {
				hist.done[i].changes[0].from = editor.posFromIndex(donefrom[i] + ttext.length + tfrom - tto);
				hist.done[i].changes[0].to = editor.posFromIndex(doneto[i] + ttext.length + tfrom - tto);
			}
		}
		for (var i = 0; i < hist.undone.length; i++) {
			if (undoneto[i] <= tfrom) {} else if (undoneto[i] <= tto && undonefrom[i] <= tfrom) {} else if (undoneto[i] <= tto && undonefrom[i] > tfrom) {} else if (undoneto[i] > tto && undonefrom[i] <= tfrom) {
				hist.undone[i].changes[0].to = editor.posFromIndex(undoneto[i] + delta);
			} else if (undoneto[i] > tto && undonefrom[i] <= tto) {
				hist.undone[i].changes[0].from = editor.posFromIndex(tfrom + ttext.length);
				hist.undone[i].changes[0].to = editor.posFromIndex(undonefrom[i] + undoneto[i] - tto);
			} else if (undonefrom[i] > tto) {
				hist.undone[i].changes[0].from = editor.posFromIndex(undonefrom[i] + ttext.length + tfrom - tto);
				hist.undone[i].changes[0].to = editor.posFromIndex(undoneto[i] + ttext.length + tfrom - tto);
			}
		}
		for (var i = 0; i < hist.done.length; i++) {
			hist.done[i].anchorAfter = hist.done[i].changes[0].from;
			hist.done[i].anchorBefore = hist.done[i].changes[0].from;
			hist.done[i].headAfter = hist.done[i].changes[0].from;
			hist.done[i].headBefore = hist.done[i].changes[0].from;
		}
		for (var i = 0; i < hist.undone.length; i++) {
			hist.undone[i].anchorAfter = hist.undone[i].changes[0].from;
			hist.undone[i].anchorBefore = hist.undone[i].changes[0].from;
			hist.undone[i].headAfter = hist.undone[i].changes[0].from;
			hist.undone[i].headBefore = hist.undone[i].changes[0].from;
		}
		editorDoc.setHistory(hist);
		doc.text = doc.text.substr(0, data.from) + data.text + doc.text.substr(data.to);
		doc.version++;
		doc.version = doc.version % 65536;
		if (q.length > 0) {
			window.app.socket.emit('change', q[0]);
		}

		var pos = editor.posFromIndex(data.from + data.text.length);
		cursors[data.name].pos = data.from + data.text.length;
		editor.addWidget(pos, cursors[data.name].element, false);
	},
	// 运行
	runFunc: function(data) {
		this.appendtochatbox(strings['systemmessage'], 'system', data.name + '&nbsp;&nbsp;' + strings['runsaprogram'], new Date(data.time));
		this.setrun();
		operationLock = false;
	},
	stdinFunc: function(data) {
		this.appendtoconsole(data.data, 'stdin');
	},
	stdoutFunc: function(data) {
		this.appendtoconsole(data.data);
	},
	stderrFunc: function(data) {
		this.appendtoconsole(data.data, 'stderr');
	},
	exitFunc: function(data) {
		operationLock = false;
		if (data.err.code !== undefined)
			this.appendtochatbox(strings['systemmessage'], 'system', strings['programfinish'] + '&nbsp;' + data.err.code, new Date(data.time));
		else
			this.appendtochatbox(strings['systemmessage'], 'system', strings['programkilledby'] + '&nbsp;' + data.err.signal, new Date(data.time));

		if (runLock) {
			$('#editor-run').html('<i class="icon-play"></i>');
			$('#editor-run').attr('title', strings['run-title']);
			runLock = false;
		}
		if (debugLock) {
			editor.setValue(old_text);
			this.removeallbreakpoints();
			this.initbreakpoints(old_bps);

			var editordoc = editor.getDoc();
			var hist = editordoc.getHistory();
			hist.done.pop();
			editordoc.setHistory(hist);

			editor.setOption('readOnly', false);
			if (q.length > 0) {
				window.app.socket.emit('change', q[0]);
			}
			$('#editor-debug').html('<i class="icon-eye-open"></i>');
			$('#editor-debug').attr('title', strings['debug-title']);
			this.runtoline(-1);
			for (var k in expressionlist.elements) {
				expressionlist.setValue(expressionlist.elements[k].expression, null);
			}
			debugLock = false;
		}
		this.setrunanddebugstate();
		$('#console-title').text(strings['console'] + strings['finished']);
	},
	// 调试
	debugFunc: function(data) {
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
	runningFunc: function(data) {
		if (!debugLock)
			return;
		waiting = false;
		this.runtoline(-1);
		$('.debugandwait').addClass('disabled');
		$('#console-title').text(strings['console']);
	},
	waitingFunc: function(data) {
		if (!debugLock)
			return;
		waiting = true;
		if (typeof data.line === 'number') {
			this.runtoline(data.line - 1);
		} else {
			this.runtoline(-1);
		}
		for (var k in data.exprs) {
			expressionlist.setValue(k, data.exprs[k]);
		}
		$('.debugandwait').removeClass('disabled');
		if (typeof data.line === 'number')
			$('#console-title').text(strings['console'] + strings['waiting']);
		else if (data.line !== null)
			$('#console-title').text(strings['console'] + strings['waiting'] + '[' + data.line + ']');
		else
			$('#console-title').text(strings['console'] + strings['waiting'] + strings['nosource']);
	},
	// 离开聊天
	leaveFunc: function(data) {
		memberlistdoc.setonline(data.name, false);
		memberlistdoc.sort();
		this.appendtochatbox(strings['systemmessage'], 'system', data.name + '&nbsp;' + strings['leave'], new Date(data.time));
		if (cursors[data.name]) {
			if (cursors[data.name].element)
				$(cursors[data.name].element).remove();
			delete cursors[data.name];
		}
	},
	// 聊天
	chatFunc: function(data) {
		var text = htmlescape(data.text);
		var time = new Date(data.time);
		this.appendtochatbox(data.name, (data.name == testUser.get('name') ? 'self' : ''), text, time);
	},
	rmexprFunc: function(data) {
		expressionlist.removeElementByExpression(data.expr);
	},
	addexprFunc: function(data) {
		if (data.expr) {
			expressionlist.addExpression(data.expr);
			expressionlist.setValue(data.expr, data.val);
		}
	},
	// 退回登陆
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
		router.navigate('login', {
			trigger: true
		});
		$('#footer').fadeIn('fast');
		$('.modal').modal('hide');
	},
	// 页面发送消息
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
	// 通过对话框发送消息
	showmessageindialog: function(id, stringid, index) {
		if (index === undefined) {
			$('#' + id + ' .control-group').addClass('error');
			if (strings[stringid])
				$('#' + id + ' .help-inline').text(strings[stringid]);
			else
				$('#' + id + ' .help-inline').text(stringid);
		} else {
			$('#' + id + ' .control-group:eq(' + index + ')').addClass('error');
			if (strings[stringid])
				$('#' + id + ' .help-inline:eq(' + index + ')').text(strings[stringid]);
			else
				$('#' + id + ' .help-inline:eq(' + index + ')').text(stringid);
		}
	},
	showmessagebox: function(title, content, timeout) {
		if (strings[title])
			$('#messagedialogLabel').html(strings[title]);
		else
			$('#messagedialogLabel').html(title);
		if (strings[content])
			$('#messagedialogContent').html(strings[content]);
		else
			$('#messagedialogContent').html(content);
		$('#messagedialog').modal('show');
		t = setTimeout('$(\'#messagedialog\').modal(\'hide\');', timeout * 1000);
	},
	// 载入
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
	// 移除loading
	removeloading: function(id) {
		if (!this.va.loadings[id])
			return;
		this.va.loadings[id].self.show();
		this.va.loadings[id].loading.remove();
		delete this.va.loadings[id];
	},
	// 清理loading
	cleanloading: function() {
		for (var k in this.va.loadings) {
			this.removeloading(k);
		}
	},
	// 得到目录
	getdirstring: function() {
		if (dirMode == 'owned')
			return '/' + currentDir.join('/');
		else {
			var name = currentDir.shift();
			var r = '/' + currentDir.join('/');
			if (currentDir.length == 0) {
				r = '/' + name;
			}
			currentDir.unshift(name);
			return r;
		}
	},
	refreshlistdone: function(data) {
		filelist.removeloading();
		if (data.err) {
			filelisterror();
			this.showmessagebox('error', 'failed', 1);
		} else {
			$('#current-dir').html(getdirlink());
			if (dirMode == 'owned')
				filelist.setmode(filelist.getmode() | 2);
			else
				filelist.setmode(0);
			if (currentDir.length == 1) {
				if (dirMode == 'owned')
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
			if (doccallback)
				doccallback();
		}
		operationLock = false;
	},
	// 刷新文件列表
	refreshfilelist: function(error, callback) {
		operationLock = true;
		filelist.loading();
		dochandler = jQuery.proxy(this, "refreshlistdone");
		doccallback = callback;
		window.app.socket.emit('doc', {
			path: currentDirString
		});
		filelisterror = error;
	},
	// 得到代替文字
	getString: function() {
		$('[localization]').html(function(index, old) {
			$(this).attr('str', old);
			if (strings[old])
				return strings[old];
			return old;
		});

		$('[title]').attr('title', function(index, old) {
			$(this).attr('str', old);
			if (strings[old])
				return strings[old];
			return old;
		});
	},
	// 添加聊天信息
	appendtochatbox: function(name, type, content, time) {
		$('#chat-show-inner').append(
			'<p class="chat-element"><span class="chat-name ' + type +
			'">' + name + '&nbsp;&nbsp;' + time.toTimeString().substr(0, 8) + '</span><br />' + content + '</p>'
		);
		var o = $('#chat-show').get(0);
		o.scrollTop = o.scrollHeight;
	},
	// 添加运行结果
	appendtoconsole: function(content, type) {
		if (type) {
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
	setsavedthen: function(timestamp) {
		if (savetimestamp == timestamp) {
			$('#current-doc-state').removeClass('red');
			$('#current-doc-state').text(strings['saved']);
			$('#editor-back').popover('destroy');
			$('#editor-back').attr('title', strings['back']);
			issaving = false;
			this.setrunanddebugstate();
		}
	},
	setrunanddebugstate: function() {
		$('#editor-run').removeClass('disabled');
		$('#editor-debug').removeClass('disabled');
		if (!this.runenabled())
			$('#editor-run').addClass('disabled');
		if (!this.debugenabled())
			$('#editor-debug').addClass('disabled');
	},
	debugenabled: function() {
		return (debugable && !runLock && (!issaving || debugLock));
	},
	runenabled: function() {
		return (runable && !debugLock && (!issaving || runLock));
	},
	// 更换语言
	changelanguage: function(language) {
		if (languagemap[language]) {
			if (modemap[language])
				editor.setOption('mode', modemap[language]);
			else
				editor.setOption('mode', languagemap[language]);
			CodeMirror.autoLoadMode(editor, languagemap[language]);
		} else {
			editor.setOption('mode', 'text/plain');
			CodeMirror.autoLoadMode(editor, '');
		}
	},
	checkrunanddebug: function() {
		var selfthis = this;
		if (ENABLE_RUN) {
			runable = this.isrunable(ext);
		}
		if (ENABLE_DEBUG) {
			debugable = this.isdebugable(ext);
			if (debugable) {
				gutterclick = function(cm, n) {
					if (debugLock && !waiting)
						return;
					if (!selfthis.removebreakpointat(cm, n)) {
						selfthis.addbreakpointat(cm, n);
					}
				};
			} else {
				gutterclick = function(cm, n) {};
			}
			this.removeallbreakpoints();
		}
		this.setrunanddebugstate();
	},
	isrunable: function(ext) {
		for (var i = 0; i < runableext.length; i++) {
			if (runableext[i] == ext)
				return true;
		}
		return false;
	},
	isdebugable: function(ext) {
		for (var i = 0; i < debugableext.length; i++) {
			if (debugableext[i] == ext)
				return true;
		}
		return false;
	},
	// 移除断点
	removebreakpointat: function(cm, n) {
		var info = cm.lineInfo(n);
		if (info.gutterMarkers && info.gutterMarkers["breakpoints"]) {
			cm.setGutterMarker(n, 'breakpoints', null);
			//bps = bps.substr(0, n) + "0" + bps.substr(n+1);
			this.sendbreak(n, n + 1, "0");
			return true;
		}
		return false;
	},
	sendbreak: function(from, to, text) {
		var req = {
			version: doc.version,
			from: from,
			to: to,
			text: text
		};
		if (bq.length == 0) {
			window.app.socket.emit('bps', req);
		}
		bq.push(req);
	},
	// 添加断点
	addbreakpointat: function(cm, n) {
		var addlen = n - bps.length;
		if (addlen > 0) {
			var addtext = "";
			for (var i = bps.length; i < n - 1; i++) {
				addtext += "0";
			}
			addtext += "1";
			//bps += addtext;
			this.sendbreak(bps.length, bps.length, addtext);
		} else {
			//bps = bps.substr(0, n) + "1" + bps.substr(n+1);
			this.sendbreak(n, n + 1, "1");
		}

		var element = $('<div><img src="images/breakpoint.png" /></div>').get(0);
		cm.setGutterMarker(n, 'breakpoints', element);
	},
	// 移除所有断点
	removeallbreakpoints: function() {
		for (var i = 0; i < bps.length; i++) {
			if (bps[i] == "1") {
				var info = editor.lineInfo(i);
				if (info.gutterMarkers && info.gutterMarkers["breakpoints"]) {
					editor.setGutterMarker(i, 'breakpoints', null);
				}
			}
		}
		bps.replace("1", "0");
	},
	setrunanddebugstate: function() {
		$('#editor-run').removeClass('disabled');
		$('#editor-debug').removeClass('disabled');
		if (!this.runenabled())
			$('#editor-run').addClass('disabled');
		if (!this.debugenabled())
			$('#editor-debug').addClass('disabled');
	},
	// 初始化断点
	initbreakpoints: function(bpsstr) {
		bps = bpsstr;
		for (var i = bpsstr.length; i < editor.lineCount(); i++) {
			bps += "0";
		}
		for (var i = 0; i < bps.length; i++) {
			if (bps[i] == "1") {
				var element = $('<div><img src="images/breakpoint.png" /></div>').get(0);
				editor.setGutterMarker(i, 'breakpoints', element);
			}
		}
	},
	// 隐藏运行结果
	closeconsole: function() {
		if (!consoleopen)
			return;
		consoleopen = false;
		$('#under-editor').hide();
		$('#editor-console').removeClass('active');
		resize();
	},
	// 打开运行结果
	openconsole: function() {
		if (!consoleopen) {
			consoleopen = true;
			$('#under-editor').show();
			$('#editor-console').addClass('active');
			resize();
		}
		$('#console-input').focus();
	},
	setrun: function() {
		runLock = true;
		$('#editor-run').html('<i class="icon-stop"></i>');
		$('#editor-run').attr('title', strings['kill-title']);
		$('#console-inner').html('');
		$('#console-input').val('');
		$('#editor-debug').addClass('disabled');
		$('#console-title').text(strings['console']);
		this.openconsole();
	},
	setdebug: function() {
		debugLock = true;
		$('#editor-debug').html('<i class="icon-eye-close"></i>');
		$('#editor-debug').attr('title', strings['stop-debug-title']);
		$('#console-inner').html('');
		$('#console-input').val('');
		$('#editor-run').addClass('disabled');
		$('#console-title').text(strings['console']);
		this.openconsole();
	},
	runtoline: function(n) {
		if (runningline >= 0) {
			editor.removeLineClass(runningline, '*', 'running');
			editor.setGutterMarker(runningline, 'runat', null);
		}
		if (n >= 0) {
			editor.addLineClass(n, '*', 'running');
			editor.setGutterMarker(n, 'runat', $('<div><img src="images/arrow.png" width="16" height="16" style="min-width:16px;min-width:16px;" /></div>').get(0));
			editor.scrollIntoView({
				line: n,
				ch: 0
			});
		}
		runningline = n;
	}
});