//头部分，包括用户信息修改
popush.navView = popush.commonView.extend({
	template: _.template($("#navTemplate").html()),
	initialize: function() {
		this.router = this.options.router;
		testUser.unbind('change');
	},
	render: function() {
		this.$el.html(this.template(testUser.toJSON()));
		return this;
	},
	events: {
		'change #changeavatar-input': 'changeavatar',
		'click #changepassword-button': 'changepassword',
		'keydown #changepassword-old': 'pressenter_changepsw',
		'keydown #changepassword-new': 'pressenter_changepsw',
		'keydown #changepassword-confirm': 'pressenter_changepsw',
		'click #changeavatar-img': 'changeavtar_imgFunc'
	},
	//修改头像
	changeavtar_imgFunc: function() {
		$("#changeavatar-input").click();
	},
	//修改用户头像
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
	//修改用户密码
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
	//修改密码，回车快捷键
	pressenter_changepsw: function(e) {
		e = e || event;
		if (e.keyCode == 13 && this.va.loadDone)
			this.changepassword();
	}
});