// 文件页面初始化部分
popush.initfilecontrol = popush.commonView.extend({
	// 初始化
	initialize: function() {
		this.initfilecontrol();
		// === Style switcher === //
		$('#style-switcher i').click(function() {
			if ($(this).hasClass('open')) {
				$(this).parent().animate({
					marginRight: '-=190'
				});
				$(this).removeClass('open');
			} else {
				$(this).parent().animate({
					marginRight: '+=190'
				});
				$(this).addClass('open');
			}
			$(this).toggleClass('icon-arrow-left');
			$(this).toggleClass('icon-arrow-right');
		});

		$('#style-switcher a').click(function() {
			var style = $(this).attr('href').replace('#', '');
			$('.skin-color').attr('href', 'css/popush.' + style + '.css');
			$(this).siblings('a').css({
				'border-color': 'transparent'
			});
			$(this).css({
				'border-color': '#aaaaaa'
			});
		});
	},
	// 绑定文件列表事件
	initfilelistevent: function(fl) {
		var self = this;

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
				if (operationLock)
					return;
				operationLock = true;
				filelist.loading();
				docobj = o;
				window.app.socket.emit('join', {
					path: o.path
				});
				window.app.socket.removeAllListeners();
				router.navigate('editor', {
					trigger: true
				});
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
			userlist.fromusers(o.members);
			$('#share').modal('show');
			currentsharedoc = o;
		};
		fl.ondownload = function(o) {
			if (operationLock)
				return;
			operationLock = true;
			var emitted = false;
			window.app.socket.on('filedownload', function(data) {
				if (!data.err && emitted) {
					var datacontent = data.text;
					console.log(datacontent);
					var filepath = o.path.split('/');
					$('#filedownload').attr("download", filepath[filepath.length - 1]);
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
			if (operationLock)
				return;
			operationLock = true;
			var oname = o.path.split('/');
			oname = oname[oname.length - 1];
			for (var i = 0; i < sharedocs.length; i++) {
				var docname = sharedocs[i].path.split('/');
				docname = docname[docname.length - 1];
				if (oname == docname) {
					if (!sharedocs[i].score) {
						alert("服务器忙，请稍后再试");
					} else {
						var data = [];
						var series = Math.floor(Math.random() * 10) + 1;
						for (var i = 0; i < series; i++) {
							data[i] = {
								label: "Series" + (i + 1),
								data: Math.floor(Math.random() * 100) + 1
							}
						}

						// var data = [];
						// for(var j = 0; j < sharedocs[i].score.length; j++)
						// 	data[j] = { label: sharedocs[i].score[j][0], data: 0.5 };
						var pie = $.plot($(".pie"), data, {
							series: {
								pie: {
									show: true,
									radius: 3 / 4,
									label: {
										show: true,
										radius: 3 / 4,
										formatter: function(label, series) {
											return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' + label + '<br/>' + Math.round(series.percent) + '%</div>';
										},
										background: {
											opacity: 0.5,
											color: '#000'
										}
									},
									innerRadius: 0.2
								},
								legend: {
									show: false
								}
							}
						});
						alert(1);
						$('#stata').click();
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
		userlist = userList('#share-user-list');
		userlist.clear();
		memberlist = userListAvatar('#member-list');
		memberlistdoc = userListAvatar('#member-list-doc');
		docshowfilter = this.allselffilter;
	}
});
// 文件列表页面
popush.filecontrolView = popush.commonView.extend({
	template: _.template($("#filecontrolTemplate").html()),
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
	// 登出
	logout: function() {
		window.app.socket.emit('logout', {});
		firsttofilelist = true;
		$.removeCookie('sid');
		testUser.clear({
			silent: true
		});
		this.backtologin();
	},
	// 打开新建文件框
	newfileopen: function() {
		$('#newfile-inputName').val('');
		$('#newfile .control-group').removeClass('error');
		$('#newfile .help-inline').text('');
		$('#newfileLabel').text(strings['newfile']);
		newfiletype = 'doc';
		$("#newfile-inputName").focus();
	},
	// 打开新建文件夹框
	newfolderopen: function() {
		$('#newfile-inputName').val('');
		$('#newfile .control-group').removeClass('error');
		$('#newfile .help-inline').text('');
		$('#newfileLabel').text(strings['newfolder']);
		newfiletype = 'dir';
		$("#newfile-inputName").focus();
	},
	// 切换至私有文件列表
	ownedfilelist: function() {
		if (operationLock)
			return;
		operationLock = true;
		dirMode = 'owned';
		docshowfilter = this.allselffilter;
		currentDir = [testUser.get('name')];
		currentDirString = this.getdirstring();
		$('#current-dir').html(getdirlink());
		this.refreshfilelist(function() {;
		});

		$('#ownedfile').show();
		$('#ownedfileex').hide();
		$('#sharedfile').removeClass('active');
	},
	allsharefilter: function(o) {
		return currentDir.length > 1 || o.owner.name != testUser.get('name');
	},
	// 切换至共享文件列表
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
		this.refreshfilelist(function() {;
		});

		$('#ownedfile').hide();
		$('#ownedfileex').show();
		$('#sharedfile').addClass('active');
	},
	// 新建文件
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
	// 新建文件框绑定回车
	pressenter_newfile: function(e) {
		e = e || event;
		if (e.keyCode == 13 && this.va.loadDone)
			this.newfile();
	},
	// 确认删除
	deleteconfirm: function() {
		deleteconfirm();
	},
	// 确认重命名
	rename: function() {
		rename();
	},
	// 重命名回车事件绑定
	pressenter_rename: function(e) {
		e = e || event;
		if (e.keyCode == 13 && this.loadDone)
			this.rename();
	},
	// 关闭共享页面
	closeshare: function() {
		if (operationLock)
			return;
		this.refreshfilelist(function() {;
		});
		$('#share').modal('hide');
	},
	// 共享回车事件绑定
	pressenter_share: function(e) {
		e = e || event;
		if (e.keyCode == 13 && this.va.loadDone)
			this.share();
	},
	// 共享
	share: function() {
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
	},
	// 解除共享
	unshare: function() {
		var selected = userlist.getselection();
		if (!selected) {
			$('#share-error').attr('str', 'selectuser');
			this.showmessage('share-message', 'selectuser', 'error');
			return;
		}
		if (operationLock)
			return;
		operationLock = true;
		this.loading('share-buttons');
		window.app.socket.emit('unshare', {
			path: currentsharedoc.path,
			name: selected.name
		});
	},
});