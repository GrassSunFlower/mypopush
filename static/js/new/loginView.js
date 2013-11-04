// 登录页面View
popush.loginView = popush.commonView.extend({
	template: _.template($('#loginTemplate').html()),
	initialize: function() {
		this.__initialize();
		this.router = this.options.router;
		if (!this.va.loadDone) setTimeout('this.loadfailed', 10000);
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
	// 检测是否连接上服务器的函数
	loadfailed: function() {
		if (this.va.loadDone)
			return;
		this.va.failed = true;
		$("#loading-init").remove();
		$('#login-error').attr('str', 'loadfailed');
		this.showmessage('login-message', 'loadfailed');
	},
	// 点击登录后的函数
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
	},
	// 回车键事件，进行登录
	pressenter: function(e) {
		e = e || event;
		if (e.keyCode == 13 && this.va.loadDone)
			this.login();
	},
	// 点击注册按钮
	registerPage: function() {
		this.router.navigate('register', {
			trigger: true
		});
	}
});