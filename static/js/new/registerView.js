// 注册页面View
popush.registerView = popush.commonView.extend({
	template: _.template($("#registerTemplate").html()),
	initialize: function() {
		this.__initialize();
		this.router = this.options.router;
		testUser.clear({
			silent: true
		});
		testUser.unbind('change');
		testUser.bind("change", function() {
			window.app.socket.emit('register', testUser.toJSON());
		});
	},
	render: function() {
		this.$el.html(this.template);
		return this;
	},
	events: {
		'click #login-page': 'loginPage',
		'click #register-button': 'register',
		'input #register-inputName': 'checkvalid',
		'focus #register-inputName': 'checkvalid',
		'keydown': 'pressenter'
	},
	// 实时检测用户名是否正确
	checkvalid: function() {
		var name = $('#register-inputName').val();
		if (!/^[A-Za-z0-9]*$/.test(name)) {
			$('#register-error').attr('str', 'name invalid');
			this.showmessage('register-message', 'name invalid');
			return;
		} else if (name.length < 6 || name.length > 20) {
			$('#register-error').attr('str', 'namelength');
			this.showmessage('register-message', 'namelength');
			return;
		} else {
			$('#register-message').slideUp();
		}
	},
	// 点击注册后的函数
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
			password: pass,
			avatar: 'images/character.png'
		});
	},
	// 回车键事件，进行注册
	pressenter: function(e) {
		e = e || event;
		if (e.keyCode == 13 && this.va.loadDone)
			this.register();
	},
	// 点击登录按钮
	loginPage: function() {
		this.router.navigate('login', {
			trigger: true
		});
	}
});