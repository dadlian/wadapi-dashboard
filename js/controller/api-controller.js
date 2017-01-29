angular.module('Console').controller('APIController',function($scope,APIService){
	$scope.endpoints = {
		currentPage:1,
		totalPages:1,
		pageLength:10,
		sort:"request",
		order:1,
		listing:Array(),
		frame:Array()
	}
	
	$scope.requestsTrend = {
		days:["","","","","","","","","","","","","",""],
		requests:[[0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
	}
	
	$scope.mostRequested = {
		endpoints:["","","","","","","","","","","","","",""],
		requests:[[0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
	}
	
	$scope.slowestRequests = {
		endpoints:["","","","","","","","","","","","","",""],
		requests:[[0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
	}
	
	$scope.dailyChartOptions = {
		scales:{
			xAxes: [{
				display: false
			}]
		}
	}
	
	$scope.changeEndpointPage = function($page){
		$scope.endpoints.currentPage = $page;
		$scope.endpoints.totalPages = Math.ceil($scope.selection.api.endpoints.listing.length/$scope.endpoints.pageLength);
		$scope.endpoints.frame.length = 0;
		
		var startIndex = ($scope.endpoints.currentPage-1)*$scope.endpoints.pageLength;
		for(var i=startIndex; i < Math.min(startIndex+$scope.endpoints.pageLength,$scope.endpoints.listing.length); i++){
			$scope.endpoints.frame.push($scope.endpoints.listing[i]);
		}
	}
	
	$scope.getEndpointIndex = function(request){
		for(var i=0; i < $scope.selection.api.endpoints.listing.length; i++){
			if($scope.selection.api.endpoints.listing[i].request == request){
				return i;
			}
		}
		
		return -1;
	}
	
	$scope.toggleOrder = function($column){
		if($scope.endpoints.sort == $column){
			$scope.endpoints.order = -1*$scope.endpoints.order;
		}else{
			$scope.endpoints.order = 1;
			$scope.endpoints.sort = $column;
		}
	}
	
	$scope.sortEndpoints = function(){
		 $scope.endpoints.listing.sort(function(a, b){
			if($scope.endpoints.sort == "request"){
				return a.request > b.request?$scope.endpoints.order*1:(a.request < b.request?$scope.endpoints.order*-1:0);
			}else{
				a = parseFloat(a[$scope.endpoints.sort]);
				b = parseFloat(b[$scope.endpoints.sort]);
				
				return $scope.endpoints.order*(a - b);
			}
		});
		 
		$scope.changeEndpointPage($scope.endpoints.currentPage);
	}
	
	$scope.$watch("selection.api.name",function(newValue){
		if(newValue){
			//Initialise Pagination for new API
			$scope.endpoints.sort = "request";
			$scope.endpoints.order = 1;
			$scope.endpoints.listing.length = 0;
			for(var i=0; i < $scope.selection.api.endpoints.listing.length; i++){
				$scope.endpoints.listing.push($scope.selection.api.endpoints.listing[i]);
			}
			
			$scope.changeEndpointPage(1);
	
			//Load Requests per Day Chart Data
			APIService.getRequestsBreakdown($scope.selection.api,14).then(function(data){
				$scope.requestsTrend.days.length = 0;
				$scope.requestsTrend.requests[0].length = 0;
				
				for(day in data){
					$scope.requestsTrend.days.push(day);
					$scope.requestsTrend.requests[0].push(data[day]);
				}
			})
	
			//Load Today's Most Requested Data
			APIService.getMostRequested($scope.selection.api).then(function(data){
				$scope.mostRequested.endpoints.length = 0;
				$scope.mostRequested.requests[0].length = 0;
				
				for(endpoint in data){
					$scope.mostRequested.endpoints.push(endpoint);
					$scope.mostRequested.requests[0].push(data[endpoint]);
				}
			})
	
			//Load Today's Most Requested Data
			APIService.getSlowestRequests($scope.selection.api).then(function(data){
				$scope.slowestRequests.endpoints.length = 0;
				$scope.slowestRequests.requests[0].length = 0;
				
				for(endpoint in data){
					$scope.slowestRequests.endpoints.push(endpoint);
					$scope.slowestRequests.requests[0].push(data[endpoint]);
				}
			})
		}
	});
	
	$scope.$watch("endpoints.sort",function(newValue,oldValue){
		if(newValue != oldValue){
			$scope.sortEndpoints();
		}
	})
	
	$scope.$watch("endpoints.order",function(newValue,oldValue){
		if(newValue != oldValue){
			$scope.sortEndpoints();
		}
	})
})