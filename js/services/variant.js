angular.module('Console').factory('VariantService',function($http,$filter,api) {
	return {
		search: function(endpoint,page,records,sort,order){
			var params = {
				page:page,
				records:records,
				sort:sort?sort:"query",
				order:order?order:"asc"
			}
			
			return $http.get(endpoint.variants.self+"?"+new Date(),{
				params:params
			}).then(function(response){
				var variants = [];
				for(var i = 0; i < response.data.entries.length; i++){
					var nextVariant = response.data.entries[i];
					variants.push(nextVariant);
				}
				
				return variants;
			})
		},
		getRequestsBreakdown: function(variant,days){
			var startDate = new Date();
			startDate.setDate(startDate.getDate() - days);
			
			var params = {
				from:$filter('date')(startDate,"yyyy-MM-dd"),
				order:"asc"
			}
			
			return $http.get(variant.requests+"?"+new Date(),{
				params:params
			}).then(function(response){
				return response.data.requests;
			})
		},
		getRuntimesBreakdown: function(variant,days){
			var startDate = new Date();
			startDate.setDate(startDate.getDate() - days);
			
			var params = {
				from:$filter('date')(startDate,"yyyy-MM-dd"),
				order:"asc"
			}
			
			return $http.get(variant.runtimes+"?"+new Date(),{
				params:params
			}).then(function(response){
				return response.data.runtimes;
			})
		},
		getObjectData: function(variant){
			var params = {
				page:1,
				records:1000
			}
			
			return $http.get(variant.objects+"?"+new Date(),{
				params:params
			}).then(function(response){
				return response.data.entries;
			})
		},
		getQueryData: function(variant){
			var params = {
				page:1,
				records:1000
			}
			
			return $http.get(variant.queries+"?"+new Date(),{
				params:params
			}).then(function(response){
				return response.data.entries;
			})
		},
		getCallData: function(variant){
			var params = {
				page:1,
				records:1000
			}
			
			return $http.get(variant.calls+"?"+new Date(),{
				params:params
			}).then(function(response){
				return response.data.entries;
			})
		},
		getCustomData: function(variant){
			var params = {
				page:1,
				records:1000
			}
			
			return $http.get(variant.custom+"?"+new Date(),{
				params:params
			}).then(function(response){
				return response.data.entries;
			})
		}
	}
});