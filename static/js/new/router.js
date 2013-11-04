popush.Application = Backbone.Router.extend({
	fireditor: false,
	initialize: function(el) {
		this.el = el;
		router = this;
	},
	routes: {
		'': 'login',
		'login': 'login',
		'register': 'register',
		'filelist': 'filelist',
		'editor': 'editor',
	},
	login: function() {
		if (localStorage.getItem('fisrtreg') == 0) {
			localStorage.setItem('fisrtreg', 1);
			window.location.reload();
		}
		var flog = true;
		var temp = testUser.toJSON();
		for (var i in temp) {
			flog = false;
		}
		if (!flog && thisPage != "" && thisPage != "login") {
			thisPage = "login";
			router.navigate("filelist", {
				trigger: true
			});
			return;
		}
		$("#navcontainer").html(" ");
		if (!$.cookie('sid'))
			this.fireditor = false;
		this.clean();
		this.subclean();
		this.currentView = new popush.loginView({
			router: this
		});
		this.currentView.render().$el.appendTo($(this.el));
		this.currentView.getString();
		$('#login-inputName').focus();
		thisPage = "login";
	},
	register: function() {
		$("#navcontainer").html(" ");
		if (!$.cookie('sid')) {
			this.fireditor = false;
		}
		this.clean();
		this.subclean();
		this.currentView = new popush.registerView({
			router: this
		});
		this.currentView.render().$el.appendTo($(this.el));
		this.currentView.getString();
		$('#register-inputName').focus();
		thisPage = "register";
	},
	filelist: function() {
		var flog = true;
		var temp = testUser.toJSON();
		for (var i in temp) {
			flog = false;
		}
		if (flog) {
			router.navigate("login", {
				trigger: true
			});
			return;
		}
		if (!firsttofilelist && thisPage == "login") {
			thisPage = "filelist";
			return;
		}
		this.clean();
		if (!this.fireditor) {
			this.subclean();
			this.subView = new popush.navView({
				router: this
			});
			this.subView.render().$el.appendTo($("#navcontainer"));
			this.subView.getString();
		}
		this.currentView = new popush.filecontrolView({
			router: this
		});
		this.currentView.render().$el.appendTo($(this.el));
		this.currentView.getString();
		new popush.initfilecontrol();
		firsttofilelist = false;
		thisPage = "filelist";
		currentDir = [testUser.get('name')];
		currentDirString = this.currentView.getdirstring();
		$('#current-dir').html(getdirlink());
		this.currentView.refreshfilelist(function() {;
		});
		if ($("#nav-head")[0] == null) {
			this.subclean();
			this.subView = new popush.navView({
				router: this
			});
			this.subView.render().$el.appendTo($("#navcontainer"));
			this.subView.getString();
		}
		$('#nav-user-name').text(testUser.get("name"));
		$('#nav-avatar').attr('src', testUser.get("avatar"));
		if (dirMode == 'shared') {
			this.currentView.sharedfilelist();
		} else {
			this.currentView.ownedfilelist();
		}
	},
	editor: function() {
		this.clean();
		this.currentView = new popush.editorView({
			router: this
		});
		this.currentView.render().$el.appendTo($(this.el));
		this.currentView.getString();
		$('#editor-textarea').focus();
		new popush.initeditor();
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
if (localStorage.getItem('lang') == null || localStorage.getItem('lang') != 'us-en') localStorage.setItem('lang', 'zh-cn');
	transinto[localStorage.getItem('lang')]();
new popush.Application('#container');
Backbone.history.start();
$('boby').show();