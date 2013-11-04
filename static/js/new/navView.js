popush.navView = popush.commonView.extend({
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
		'click #changeavatar-img': 'changeavtar_imgFunc'
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