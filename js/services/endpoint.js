angular.module('Console').factory('EndpointService',function($http,$filter,api) {
	return {
		search: function(api,page,records,sort,order){
			var params = {
				page:page,
				records:records,
				sort:sort?sort:"uri",
				order:order?order:"asc"
			}
			
			return $http.get(api.endpoints.self+"?"+new Date(),{
				params:params
			}).then(function(response){
				var endpoints = [];
				for(var i = 0; i < response.data.entries.length; i++){
					var nextEndpoint = response.data.entries[i];
					endpoints.push(nextEndpoint);
				}
				
				return endpoints;
			})
		},
		getRequestsBreakdown: function(endpoint,days){
			var startDate = new Date();
			startDate.setDate(startDate.getDate() - days);
			
			var params = {
				from:$filter('date')(startDate,"yyyy-MM-dd"),
				order:"asc"
			}
			
			return $http.get(endpoint.requests+"?"+new Date(),{
				params:params
			}).then(function(response){
				return response.data.requests;
			})
		},
		getRuntimesBreakdown: function(endpoint,days){
			var startDate = new Date();
			startDate.setDate(startDate.getDate() - days);
			
			var params = {
				from:$filter('date')(startDate,"yyyy-MM-dd"),
				order:"asc"
			}
			
			return $http.get(endpoint.runtimes+"?"+new Date(),{
				params:params
			}).then(function(response){
				return response.data.runtimes;
			})
		}
	}
});