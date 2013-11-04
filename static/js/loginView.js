// 登陆页面
popush.loginView = popush.commonView.extend({
	template: _.template($('#loginTemplate').html()),
	//初始化登陆页面
	initialize: function() {
		this.__initialize();
		this.router = this.options.router;
		if (!this.va.loadDone) setTimeout('this.loadfailed', 10000);
		testUser.bind("change", function() {
			window.app.socket.emit('login', testUser.toJSON());
		});
	},
	// 渲染登陆页面
	render: function() {
		this.$el.html(this.template);
		if (this.va.loadDone) {
			this.$el.find('#loading-init').remove();
			this.$el.find('#login-control').show();
		}
		return this;
	},
	events: {
		'click #login-button': 'login',
		'click #register-page': 'registerPage',
		'keydown input': 'pressenter'
	},
	// 读取失败
	loadfailed: function() {
		if (this.va.loadDone)
			return;
		this.va.failed = true;
		$("#loading-init").remove();
		$('#login-error').attr('str', 'loadfailed');
		this.showmessage('login-message', 'loadfailed');
	},
	// 登陆函数
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
	// 绑定回车键
	pressenter: function(e) {
		e = e || event;
		if (e.keyCode == 13 && this.va.loadDone)
			this.login();
	},
	// 跳转注册页面
	registerPage: function() {
		this.router.navigate('register', {
			trigger: true
		});
	}
});