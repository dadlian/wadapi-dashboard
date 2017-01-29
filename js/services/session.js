angular.module('Console').factory('SessionService',function($http,$timeout,$q,localStorageService,chantico) {
	var user = {};
	
	function setAccessTokens(data){
		$http.defaults.headers.common['Authorization'] = "Basic "+btoa(data.key+":"+data.secret);
	}
	
	function configure(){
		setAccessTokens(user);
	}
	
	return {
		isLoggedIn:function(){
			return "username" in this.getLoggedInUser();
		},
		getLoggedInUser:function(){
			if(!user.username && localStorageService.get("user")){
				user = JSON.parse(localStorageService.get("user"));
				configure();
			}
			return user;
		},
		login: function(username,password) {
			var promises = Array();
			return $http.get(chantico.root+"/apis/"+chantico.apiId+"/users?"+new Date().getTime(),{
				params: {"usernames":username},
				headers: {"Authorization":"Basic "+btoa(chantico.key+":"+chantico.secret)}
			}).then(function(response){
				if(response.data.entries.length > 0 && response.data.entries[0].role == "master"){
					user.username = username;
					user.role = response.data.entries[0].role;
					
					return $http.get(response.data.entries[0].tokens+"?"+new Date().getTime(),{
						headers: {"Authorization":"Basic "+btoa(username+":"+password)}
					}).then(function(response){
						user.key = response.data.key;
						user.secret = response.data.secret;
						user.renew = response.data.renew;
						user.expiry = response.data.expiry;
						configure();
						localStorageService.set("user",JSON.stringify(user));
						
						return user;
					}).catch(function(){
						return false;
					})
				}else{
					return false;
				}
			})
		},
		logout: function(){
			for(field in user){
				delete user[field];
			}
			
			localStorageService.remove("user");
		}
	}
});