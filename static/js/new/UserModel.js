var popush = window.popush || {};
var app = {};
popush.UserModel = Backbone.Model.extend({
	initialize: function() {
	},
	defaluts: {

	}
});
popush.UserList = Backbone.Collection.extend({
			model:popush.UserModel,
			clear: function(div) {
				($(div)).html('');
				for (var i = this.length - 1; i >= 0; i--) {
					this.pop();
				};
				selected = -1;
				filenumber = -1;
			},
			
			myadd: function(user, div) {
				n = alluserlists.length;
				i = this.length;
				($(div)).append(
					'<li><a id = "' + n * i + '">'+
					'<img class="userlistimg user-' + user.name + '" height="32" width="32" src="' + user.avatar + '">' + user.name + '</a></li>'
				);
				var currentdiv = '#' + n * i;
				($(currentdiv)).click(function(event){
					var m = $(this).attr("id");
					($("#share-user-list")).find('li').removeClass('active');
					($("#share-user-list")).find('li:eq('+ m / n+')').addClass('active');
					filenumber = n;
					selected = m / n;
				});
				this.add([{
					'name':user.name,
					'avatar':user.avatar,
				}]);
			},
			
			fromusers: function(users, div) {
				this.clear(div);
				users.sort(function(a,b) {
					return a.name>b.name?1:-1;
				});
				for(var i=0; i<users.length; i++) {
					userlist.myadd(users[i], div);
				}
			}
		});
var testUser = new popush.UserModel();
var userlist = new popush.UserList();