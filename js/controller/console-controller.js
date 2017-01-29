angular.module('Console').controller('ConsoleController',function($scope,$filter,$timeout,$location,$window,SessionService,APIService,EndpointService,VariantService){
	$scope.state = {
		authenticated:SessionService.isLoggedIn(),
		loading:false,
		failed:false,
		activeUser:SessionService.getLoggedInUser(),
		availableAPIs:Array()
	}
	
	$scope.selection = {
		api:{
			"name":"",
			"root":"",
			"endpoints":[]
		},
		endpoint:{
			"request":"",
			"variants":{
				"listing":Array()
			}
		},
		variant:{
			"query-string":""
		}
	}
	
	$scope.logout = function(){
		$scope.state.loading = true;
		SessionService.logout();
		
		$timeout(function(){
			location.reload(),
			3000
		});
	}
	
	$scope.$watch("state.authenticated",function(newValue){
		if(newValue){
			$scope.state.loading = true;
			APIService.search(1,25).then(function(apis){
				for(var i = 0; i < apis.length; i++){
					apis[i].endpoints.listing = Array();
					$scope.state.availableAPIs.push(apis[i]);
				}
				
				$scope.selectAPI(0).then(function(){
					$scope.state.loading = false;
				});
			});
		}
	});
	
	$scope.selectAPI = function($index){
		$scope.state.loading = true;
			
		//Reset Selected Endpoint
		$scope.selection.endpoint.request = "";
		$scope.selection.endpoint.variants.listing.length = 0;
		
		//Reset Selected Variant
		$scope.selection.variant['query-string'] = "";
			
		return EndpointService.search($scope.state.availableAPIs[$index],1,500).then(function(endpoints){
			for(field in $scope.state.availableAPIs[$index]){
				$scope.selection.api[field] = $scope.state.availableAPIs[$index][field];
			}
			
			$scope.selection.api.endpoints.listing.length = 0;
			for(var i=0; i < endpoints.length; i++){
				$scope.selection.api.endpoints.listing.push(endpoints[i]);
			}
			
			$location.path("/api");
			$scope.state.loading = false;
		});
	}
	
	$scope.selectEndpoint = function($index){
		$scope.state.loading = true;
		return VariantService.search($scope.selection.api.endpoints.listing[$index],1,500).then(function(variants){
			for(field in $scope.selection.api.endpoints.listing[$index]){
				$scope.selection.endpoint[field] = $scope.selection.api.endpoints.listing[$index][field];
			}
		
			$scope.selection.endpoint.variants.listing = Array();
			$scope.selection.endpoint.variants.listing.length = 0;
			$scope.selection.endpoint.variants.listing[0] = {
				"query-string":"Overall",
				"average-runtime":$scope.selection.endpoint["average-runtime"],
				"daily-requests":$scope.selection.endpoint["daily-requests"],
				"runtime-data":{
					days:["","","","","","","","","","","","","",""],
					values:[[0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
				},
				"request-data":{
					days:["","","","","","","","","","","","","",""],
					values:[[0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
				}
			}
			
			for(var field in $scope.selection.endpoint.variants.listing[0]){
				$scope.selection.variant[field] = $scope.selection.endpoint.variants.listing[0][field];
			}
	
			//Load Endpoint Requests per Day Data
			EndpointService.getRequestsBreakdown($scope.selection.endpoint,14).then(function(data){
				$scope.selection.variant['request-data'].days.length = 0;
				$scope.selection.variant['request-data'].values[0].length = 0;
				
				for(day in data){
					$scope.selection.variant['request-data'].days.push(day);
					$scope.selection.variant['request-data'].values[0].push(data[day]);
				}
			})
	
			//Load Endpoint Runtime Data
			EndpointService.getRuntimesBreakdown($scope.selection.endpoint,14).then(function(data){
				$scope.selection.variant['runtime-data'].days.length = 0;
				$scope.selection.variant['runtime-data'].values[0].length = 0;
				
				for(day in data){
					$scope.selection.variant['runtime-data'].days.push(day);
					$scope.selection.variant['runtime-data'].values[0].push(data[day]);
				}
			})
			
			for(var i=0; i < variants.length; i++){
				$scope.selection.endpoint.variants.listing.push(variants[i]);
			}
			
			$location.path("/endpoint");
			$scope.state.loading = false;
		});
	}
	
	$scope.selectVariant = function($index){
		$scope.state.loading = true;
		for(var field in $scope.selection.endpoint.variants.listing[$index]){
			$scope.selection.variant[field] = $scope.selection.endpoint.variants.listing[$index][field];
		}
	
		//Load Variant Requests per Day Data
		VariantService.getRequestsBreakdown($scope.selection.variant,14).then(function(data){
			$scope.selection.variant['request-data'].days.length = 0;
			$scope.selection.variant['request-data'].values[0].length = 0;
			
			for(day in data){
				$scope.selection.variant['request-data'].days.push(day);
				$scope.selection.variant['request-data'].values[0].push(data[day]);
			}
		})

		//Load Variant Runtime Data
		EndpointService.getRuntimesBreakdown($scope.selection.variant,14).then(function(data){
			$scope.selection.variant['runtime-data'].days.length = 0;
			$scope.selection.variant['runtime-data'].values[0].length = 0;
			
			for(day in data){
				$scope.selection.variant['runtime-data'].days.push(day);
				$scope.selection.variant['runtime-data'].values[0].push(data[day]);
			}
		})
		
		$window.scrollTo(0, 0);
		$scope.state.loading = false;
	}
	
	$scope.scrollCategory = function($event,$delta,$deltaX,$deltaY){
		$event.preventDefault();
		if($($event.target).prop("tagName") == "LI"){
			scrollPane = $($event.target).parent();
		}else{
			scrollPane = $($event.target).find("ul");
		}
		
		var visibleHeight = 186;
		var itemHeight = 31;
		var scrollTop = scrollPane.position().top;
		
		if(($deltaY < 0 && $deltaY*scrollTop < scrollPane.height()-visibleHeight) || ($deltaY > 0 && $deltaY*scrollTop < 0)){
			scrollPane.css({top:scrollTop+($deltaY*itemHeight)});
		}
	}
})