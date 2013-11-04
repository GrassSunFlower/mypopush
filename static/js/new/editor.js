//协同编辑页面
popush.initeditor = popush.commonView.extend({
	selfIniteditor: null,
	initialize: function() {
		//window.app.socket.removeAllListeners();
		selfIniteditor = this;
		this.initeditor();
	},
	//获取窗口高度
	winHeight: function() {
		return window.innerHeight || (document.documentElement || document.body).clientHeight;
	},
	//退出全屏，将窗口置为正常大小
	setNormalScreen: function() {
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
	//初始化CodeMirror
	initeditor: function() {
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
		//定义变量列表
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
			if (this.length == 0 && bufferfrom == -1) { // buffertext == "") {
				self.setsaved();
			}
			return r;
		}

		if (!ENABLE_RUN) {
			$('#editor-run').remove();
			if (!ENABLE_DEBUG) {
				$('#editor-console').remove();
			}
		}

		if (!ENABLE_DEBUG) {
			$('#editor-debug').remove();
		}
		//针对浏览器初始化语音
		if ((!Browser.chrome || parseInt(Browser.chrome) < 18) &&
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
	//发送不同版本号字符串
	sendbuffer: function() {
		if (bufferfrom != -1) {
			if (bufferto == -1) {
				var req = {
					version: doc.version,
					from: bufferfrom,
					to: bufferfrom,
					text: buffertext
				};
				if (q.length == 0) {
					window.app.socket.emit('change', req);
				}
				q.push(req);
				buffertext = "";
				bufferfrom = -1;
			} else {
				var req = {
					version: doc.version,
					from: bufferfrom,
					to: bufferto,
					text: buffertext
				};
				if (q.length == 0) {
					window.app.socket.emit('change', req);
				}
				q.push(req);
				bufferfrom = -1;
				bufferto = -1;
			}
			buffertimeout = SAVE_TIME_OUT;
		}
	},
	//调试时停留在断点处
	havebreakat: function(cm, n) {
		var info = cm.lineInfo(n);
		if (info && info.gutterMarkers && info.gutterMarkers["breakpoints"]) {
			return "1";
		}
		return "0";
	},
	//从此断点到另一断点
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
	//设置正在保存
	setsaving: function() {
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
	//保存
	save: function() {
		this.setsaving();
		if (timer != null) {
			clearTimeout(timer);
		}
		timer = setTimeout("selfIniteditor.sendbuffer()", buffertimeout);
	},
	//设置已保存
	setsaved: function() {
		savetimestamp = new Date().getTime();
		setTimeout('selfIniteditor.setsavedthen(' + savetimestamp + ')', savetimeout);
		savetimeout = 500;
	},
	//触发事件
	registereditorevent: function() {
		var self = selfIniteditor;

		CodeMirror.on(editor.getDoc(), 'change', function(editorDoc, chg) {

			//console.log(chg);

			if (debugLock) {
				return true;
			}

			if (lock) {
				lock = false;
				return true;
			}

			var cfrom = editor.indexFromPos(chg.from);
			var cto = editor.indexFromPos(chg.to);
			var removetext = "";
			for (var i = 0; i < chg.removed.length - 1; i++) {
				removetext += chg.removed[i] + '\n';
			}
			removetext += chg.removed[chg.removed.length - 1];
			cto = cfrom + removetext.length;
			var cattext = "";
			for (var i = 0; i < chg.text.length - 1; i++) {
				cattext += chg.text[i] + '\n';
			}
			cattext += chg.text[chg.text.length - 1];

			var delta = cfrom + cattext.length - cto;

			for (var k in cursors) {
				if (cto <= cursors[k].pos) {
					cursors[k].pos += delta;
					editor.addWidget(editor.posFromIndex(cursors[k].pos), cursors[k].element, false);
				} else if (cfrom < cursors[k].pos) {
					cursors[k].pos = cfrom + cattext.length;
					editor.addWidget(editor.posFromIndex(cursors[k].pos), cursors[k].element, false);
				}
			}

			var bfrom = chg.from.line;
			var bto = chg.to.line;

			if (chg.text.length != (bto - bfrom + 1)) {
				self.sendbuffer();
				var req = {
					version: doc.version,
					from: cfrom,
					to: cto,
					text: cattext
				};
				if (q.length == 0) {
					window.app.socket.emit('change', req);
				}
				q.push(req);
				var btext = "";
				for (var i = 0; i < chg.text.length; i++) {
					btext += self.havebreakat(editor, bfrom + i);
				}
				self.sendbreak(bfrom, bto + 1, btext);
				return;
			}
			if (chg.text.length > 1) {
				buffertimeout = buffertimeout / 2;
			}
			if (bufferto == -1 && cfrom == cto &&
				(cfrom == bufferfrom + buffertext.length || bufferfrom == -1)) {
				if (bufferfrom == -1) {
					buffertext = cattext;
					bufferfrom = cfrom;
				} else {
					buffertext += cattext;
				}
				self.save();
				return;
			} else if (bufferto == -1 && chg.origin == "+delete" &&
				bufferfrom != -1 && cto == bufferfrom + buffertext.length && cfrom >= bufferfrom) {
				buffertext = buffertext.substr(0, cfrom - bufferfrom);
				if (buffertext.length == 0) {
					bufferfrom = -1;
					if (q.length == 0) {
						self.setsaved();
					}
					return;
				}
				self.save();
				return;
			} else if (chg.origin == "+delete" &&
				bufferfrom == -1) {
				bufferfrom = cfrom;
				bufferto = cto;
				buffertext = "";
				self.save();
				return;
			} else if (bufferto != -1 && chg.origin == "+delete" &&
				cto == bufferfrom) {
				bufferfrom = cfrom;
				self.save();
				return;
			} else if (bufferfrom != -1) {
				if (bufferto == -1) {
					var req = {
						version: doc.version,
						from: bufferfrom,
						to: bufferfrom,
						text: buffertext
					};
					if (q.length == 0) {
						window.app.socket.emit('change', req);
					}
					q.push(req);
					buffertext = "";
					bufferfrom = -1;
				} else {
					var req = {
						version: doc.version,
						from: bufferfrom,
						to: bufferto,
						text: buffertext
					};
					if (q.length == 0) {
						window.app.socket.emit('change', req);
					}
					q.push(req);
					bufferfrom = -1;
					bufferto = -1;
				}
			}

			var req = {
				version: doc.version,
				from: cfrom,
				to: cto,
				text: cattext
			};
			if (q.length == 0) {
				window.app.socket.emit('change', req);
			}
			q.push(req);

		});
	},
	//ctrl-s对应保存事件
	saveevent: function() {
		if (savetimestamp != 0)
			selfIniteditor.setsavedthen(savetimestamp);
		savetimestamp = 0;
	},
});
//control层
popush.editorView = popush.commonView.extend({
	template: _.template($("#editorTemplate").html()),
	initialize: function() {
		this.__initialize();
		this.router = this.options.router;
	},
	render: function() {
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
	//登出
	logout: function() {
		window.app.socket.emit('logout', {});
		firsttofilelist = true;
		$.removeCookie('sid');
		testUser.clear({
			silent: true
		});
		this.backtologin();
	},
	//得到页面高度
	winHeight: function() {
		return window.innerHeight || (document.documentElement || document.body).clientHeight;
	},
	//设置全屏
	setFullScreen: function() {
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
	//弹出聊天框
	togglechat: function(o) {
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
	//运行程序
	run: function() {
		if (!this.runenabled())
			return;
		if (operationLock)
			return;
		if (runLock) {
			window.app.socket.emit('kill');
		} else {
			window.app.socket.emit('run', {
				version: doc.version,
				type: ext
			});
		}
	},
	//调试程序
	debug: function() {
		if (!this.debugenabled())
			return;
		if (operationLock)
			return;
		operationLock = true;
		if (debugLock) {
			window.app.socket.emit('kill');
		} else {
			window.app.socket.emit('debug', {
				version: doc.version,
				type: ext
			});
		}
	},
	//控制台弹出
	toggleconsole: function() {
		if (consoleopen) {
			this.closeconsole();
		} else {
			this.openconsole();
		}
	},
	//离开语音聊天
	leaveVoiceRoom: function() {
		while (window.userArray.length > 0) {
			$(window.audioArray[window.userArray.shift()]).remove();
		}
		while (window.peerUserArray.length > 0) {
			var peerUName = window.peerUserArray.shift();
			if (window.peerArray[peerUName]) {
				window.peerArray[peerUName].myOnRemoteStream = function(stream) {
					stream.mediaElement.muted = true;
					return;
				};
			}
		}
		if (!window.joinedARoom) {
			return;
		}
		$('#voice-on').removeClass('active');
		window.voiceConnection.myLocalStream.stop();
		window.voiceConnection.leave();
		delete window.voiceConnection;
	},
	//关闭协同编辑页面
	closeeditor: function() {
		window.app.socket.emit('leave', {});
		this.refreshfilelist(function() {;
		}, function() {
			$("body").animate({
				scrollTop: oldscrolltop
			});
		});
		this.leaveVoiceRoom();
		router.navigate('filelist', {
			trigger: true
		});
	},
	//控制台输入
	stdin: function() {
		if (debugLock && waiting)
			return;

		var text = $('#console-input').val();

		if (runLock || debugLock) {
			window.app.socket.emit('stdin', {
				data: text + '\n'
			});
		} else {
			this.appendtoconsole(text + '\n', 'stdin');
		}

		$('#console-input').val('');
	},
	//逐语句调试
	debugstep: function() {
		if (debugLock && waiting) {
			window.app.socket.emit('step', {});
		}
	},
	//逐过程调试
	debugnext: function() {
		if (debugLock && waiting) {
			window.app.socket.emit('next', {});
		}
	},
	//调试结束
	debugfinish: function() {
		if (debugLock && waiting) {
			window.app.socket.emit('finish', {});
		}
	},
	//继续调试
	debugcontinue: function() {
		if (debugLock && waiting) {
			window.app.socket.emit('resume', {});
		}
	},
	//聊天
	chat: function() {
		var text = $('#chat-input').val();
		if (text == '')
			return;

		window.app.socket.emit('chat', {
			text: text
		});
		$('#chat-input').val('');
	},
	//语音聊天
	voice: function() {
		if (novoice)
			return;
		if (window.voiceLock) {
			return;
		}
		window.voiceLock = true;
		window.voiceon = !window.voiceon;
		if (window.voiceon) {
			if (window.joinedARoom) {
				return;
			}
			$('#voice-on').addClass('active');
			try {
				var username = $('#nav-user-name').html();
				var dataRef = new Firebase('https://popush.firebaseIO.com/' + doc.id);
				dataRef.once('value', function(snapShot) {
					delete dataRef;
					if (snapShot.val() == null) {
						var connection = new RTCMultiConnection(doc.id);
						window.voiceConnection = connection;
						connection.session = "audio-only";
						connection.autoCloseEntireSession = true;

						connection.onstream = function(stream) {
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
							if (window.peerArray[extra.username]) {
								window.peerArray[extra.username].myOnRemoteStream = function(stream) {
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
					} else {
						var connection = new RTCMultiConnection(doc.id);
						window.voiceConnection = connection;
						connection.session = "audio-only";
						connection.autoCloseEntireSession = true;

						connection.onNewSession = function(session) {
							if (window.joinedARoom) {
								return;
							}
							connection.join(session, {
								username: username
							});
						};
						connection.onstream = function(stream) {
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
							if (ejected) {
								$('#voice-on').removeClass('active');
								while (window.userArray.length > 0) {
									$(window.audioArray[window.userArray.shift()]).remove();
								}
								while (window.peerUserArray.length > 0) {
									var peerUName = window.peerUserArray.shift();
									if (window.peerArray[peerUName]) {
										window.peerArray[peerUName].myOnRemoteStream = function(stream) {
											stream.mediaElement.muted = true;
											return;
										};
									}
								}
								delete window.voiceConnection;
								window.voiceon = !window.voiceon;
							} else {
								$(window.audioArray[extra.username]).remove();
								if (window.peerArray[extra.username]) {
									window.peerArray[extra.username].myOnRemoteStream = function(stream) {
										stream.mediaElement.muted = true;
										return;
									};
								}
							}
						};
						connection.connect();
					}
				});
			} catch (err) {
				alert(err);
			}
		} else {
			this.leaveVoiceRoom();
		}
	},
	//控制台输入，回车快捷键
	pressenter1: function(e) {
		e = e || event;
		if (e.keyCode == 13 && this.va.loadDone)
			this.stdin();
	},
	//聊天输入，回车快捷键
	pressenter2: function(e) {
		e = e || event;
		if (e.keyCode == 13 && this.va.loadDone)
			this.chat();
	}
});