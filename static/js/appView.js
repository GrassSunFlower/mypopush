var popush = window.popush || {};
popush.appView = Backbone.View.extend({
	loadDone: false,
	failed: false,
	loadings: {},
	firstconnect: true,
	loginLock: false
});
app.va = new popush.appView();