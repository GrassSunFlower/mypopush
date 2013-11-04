//存储登陆相关常量
popush.appView = Backbone.View.extend({
	loadDone: false,
	failed: false,
	loadings: {},
	firstconnect: true,
	loginLock: false
});
window.app.va = new popush.appView();