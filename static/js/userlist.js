var allUserListsAvatar = [];

function userListAvatar(div) {

	var obj = $(div);
	
	var elements = {};
	
	var n = allUserListsAvatar.length;
	
	r = {
	
		elements: elements,
		
		clear: function() {
			obj.html('');
			elements = {};
			this.elements = elements;
		},
		
		add: function(user, owner) {
			var userobj = $(
				'<img id="avatar' + n + '-' + user.name + '" src="' + user.avatar + '" width="40" height="40"' +
				' class="pull-left online shared-character user-' + user.name + '" />'
				);
			obj.append(userobj);
			$('#avatar' + n + '-' + user.name).popover({
				html: true,
				content: '<img class="pull-left popover-character user-' + user.name + '" src="' + user.avatar + '" width="48" height="48" />' +
				'<b>' + user.name + '</b><br /><span></span><div style="clear:both;"></div>',
				placement: 'bottom',
				trigger: 'hover'
			});
			user.obj = userobj;
			user.online = false;
			user.owner = false;
			if(owner)
				user.owner = true;
			elements[user.name] = user;
		},
		
		remove: function(username) {
			$('#avatar' + n + '-' + username).remove();
			if(elements[username])
				delete elements[username];
		},
		
		fromdoc: function(doc) {
			this.clear();
			doc.members.sort(function(a,b) {
				return a.name>b.name?1:-1;
			});
			this.add(doc.owner, true);
			for(var i=0; i<doc.members.length; i++) {
				var user = doc.members[i];
				this.add(user);
			}
		},
		
		refreshpopover: function(user) {
			$('#avatar' + n + '-' + user.name).popover('destroy');
			$('#avatar' + n + '-' + user.name).popover({
				html: true,
				content: '<img class="pull-left popover-character user-' + user.name + '" src="' + user.avatar + '" width="48" height="48" />' +
				'<b>' + user.name + '</b><br /><span></span><div style="clear:both;"></div>',
				placement: 'bottom',
				trigger: 'hover'
			});
		},
		
		setonline: function(username, online) {
			if(online)
				$('#avatar' + n + '-' + username).addClass('online');
			else
				$('#avatar' + n + '-' + username).removeClass('online');
			elements[username].online = online;
		},
		
		setalloffline: function() {
			for(var i in elements) {
				var user = elements[i];
				$('#avatar' + n + '-' + user.name).removeClass('online');
				user.online = false;
			}
		},
		
		sort: function() {
			var arr = [];
			for(var i in elements) {
				arr.push(elements[i]);
			}
			arr.sort(function(a, b) {
				return (
					(a.owner && !b.owner)?-1:
					(!a.owner && b.owner)?1:
					(a.online && !b.online)?-1:
					(!a.online && b.online)?1:
					(a.name>b.name)?1:-1
					);
			});
			for(var i=0; i<arr.length; i++) {
				obj.append(arr[i].obj);
			}
		}
	};
	
	allUserListsAvatar.push(r);
	
	return r;
	
}
