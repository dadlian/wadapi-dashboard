angular.module('Console').factory('APIService',function($http,$filter,api) {
	return {
		search: function(page,records){
			var params = {
				page:page,
				records:records
			}
			
			return $http.get(api.root+"/apis?"+new Date(),{
				params:params
			}).then(function(response){
				var apis = [];
				for(var i = 0; i < response.data.entries.length; i++){
					var nextAPI = response.data.entries[i];
					apis.push(nextAPI);
				}
				
				return apis;
			})
		},
		getRequestsBreakdown: function(api,days){
			var startDate = new Date();
			startDate.setDate(startDate.getDate() - days);
			
			var params = {
				from:$filter('date')(startDate,"yyyy-MM-dd"),
				order:"asc"
			}
			
			return $http.get(api.requests+"?"+new Date(),{
				params:params
			}).then(function(response){
				return response.data.requests;
			})
		},
		getMostRequested: function(api){
			var params = {
				from:$filter('date')(new Date(),"yyyy-MM-dd"),
				aggregator:"endpoint",
				order:"desc",
				records:10
			}
			
			return $http.get(api.requests+"?"+new Date(),{
				params:params
			}).then(function(response){
				return response.data.requests;
			})
		},
		getSlowestRequests: function(api){
			var params = {
				from:$filter('date')(new Date(),"yyyy-MM-dd"),
				aggregator:"endpoint",
				order:"desc",
				records:10
			}
			
			return $http.get(api.runtimes+"?"+new Date(),{
				params:params
			}).then(function(response){
				return response.data.runtimes;
			})
		}
	}
});