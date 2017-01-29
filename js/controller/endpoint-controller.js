angular.module('Console').controller('EndpointController',function($scope,EndpointService,VariantService){
	$scope.variants = {
		currentPage:1,
		totalPages:1,
		pageLength:10,
		sort:"request",
		order:1,
		headings:Array(),
		listing:Array(),
		frame:Array()
	}
	
	$scope.profiler = {
		objects: {
			currentPage:1,
			totalPages:1,
			pageLength:10,
			sort:"class",
			order:1,
			listing:Array(),
			frame:Array(),
			summary:{
				loadtime:0
			}
		},
		queries: {
			currentPage:1,
			totalPages:1,
			pageLength:10,
			sort:"query",
			order:1,
			listing:Array(),
			frame:Array(),
			summary:{
				runtime:0
			}
		},
		calls: {
			currentPage:1,
			totalPages:1,
			pageLength:10,
			sort:"call",
			order:1,
			listing:Array(),
			frame:Array(),
			summary:{
				roundtrip:0
			}
		},
		custom: {
			currentPage:1,
			totalPages:1,
			pageLength:10,
			sort:"key",
			order:1,
			listing:Array(),
			frame:Array(),
			summary:{
				duration:0
			}
		}
	}
	
	$scope.changeVariantPage = function($page){
		$scope.variants.currentPage = $page;
		$scope.variants.totalPages = Math.ceil($scope.selection.endpoint.variants.listing.slice(1).length/$scope.variants.pageLength);
		$scope.variants.frame.length = 0;
		
		var startIndex = ($scope.variants.currentPage-1)*$scope.variants.pageLength;
		for(var i=startIndex; i < Math.min(startIndex+$scope.variants.pageLength,$scope.variants.listing.length); i++){
			$scope.variants.frame.push($scope.variants.listing[i]);
		}
	}
	
	$scope.changeListingPage = function(listing,$page){
		$scope.profiler[listing].currentPage = $page;
		$scope.profiler[listing].totalPages = Math.ceil($scope.profiler[listing].listing.slice(1).length/$scope.profiler[listing].pageLength);
		$scope.profiler[listing].frame.length = 0;
		
		var startIndex = ($scope.profiler[listing].currentPage-1)*$scope.profiler[listing].pageLength;
		for(var i=startIndex; i < Math.min(startIndex+$scope.profiler[listing].pageLength,$scope.profiler[listing].listing.length); i++){
			$scope.profiler[listing].frame.push($scope.profiler[listing].listing[i]);
		}
	}
	
	$scope.getVariantIndex = function(queryString){
		for(var i=0; i < $scope.selection.endpoint.variants.listing.length; i++){
			if($scope.selection.endpoint.variants.listing[i]['query-string'] == queryString){
				return i;
			}
		}
		
		return -1;
	}
	
	$scope.toggleOrder = function($column){
		if($scope.variants.sort == $column){
			$scope.variants.order = -1*$scope.variants.order;
		}else{
			$scope.variants.order = 1;
			$scope.variants.sort = $column;
		}
	}
	
	$scope.toggleListingOrder = function(listing,$column){
		if($scope.profiler[listing].sort == $column){
			$scope.profiler[listing].order = -1*$scope.profiler[listing].order;
		}else{
			$scope.profiler[listing].order = 1;
			$scope.profiler[listing].sort = $column;
		}
	}
	
	$scope.sortVariants = function(){
		 $scope.variants.listing.sort(function(a, b){
			if($scope.variants.sort == "request"){
				return a.request > b.request?$scope.variants.order*1:(a.request < b.request?$scope.variants.order*-1:0);
			}else{
				a = parseFloat(a[$scope.variants.sort]);
				b = parseFloat(b[$scope.variants.sort]);
				
				return $scope.variants.order*(a - b);
			}
		});
		 
		$scope.changeVariantPage($scope.variants.currentPage);
	}
	
	$scope.sortListing = function(listing){
		$scope.profiler[listing].listing.sort(function(a, b){
			if(['class','query','call','key'].indexOf($scope.profiler[listing].sort) >= 0){
				var sortField = $scope.profiler[listing].sort;
				return a[sortField] > b[sortField]?$scope.profiler[listing].order*1:(a[sortField] < b[sortField]?$scope.profiler[listing].order*-1:0);
			}else{
				a = parseFloat(a[$scope.profiler[listing].sort]);
				b = parseFloat(b[$scope.profiler[listing].sort]);
				
				return $scope.profiler[listing].order*(a - b);
			}
		});
		 
		$scope.changeListingPage(listing,$scope.profiler[listing].currentPage);
	}
	
	$scope.$watch("selection.endpoint.request",function(newValue){
		if(newValue){
			//Initialise Pagination for new Endpoint
			$scope.variants.sort = "average-runtime";
			$scope.variants.order = 1;
			$scope.variants.listing.length = 0;
			for(var i=0; i < $scope.selection.endpoint.variants.listing.slice(1).length; i++){
				$scope.variants.listing.push($scope.selection.endpoint.variants.listing.slice(1)[i]);
			}
			$scope.variants.headings = Object.keys($scope.variants.listing[0].parameters);
			
			$scope.changeVariantPage(1);
		}
	});
	
	$scope.$watch("selection.variant['query-string']",function(newValue){
		if(newValue && newValue != "Overall"){
			//Load Object Profiling Data
			VariantService.getObjectData($scope.selection.variant).then(function(objects){
				$scope.profiler.objects.listing.length = 0;
				$scope.profiler.objects.summary.loadtime = 0;
				
				for(var i=0; i < objects.length; i++){
					objects[i]['total-loadtime'] = objects[i]['request-instances'] * objects[i]['instance-loadtime'];
					$scope.profiler.objects.listing.push(objects[i]);
					$scope.profiler.objects.summary.loadtime += parseFloat(objects[i]['total-loadtime']);
				}
				
				$scope.changeListingPage('objects',1);
			});
			
			//Load Query Profiling Data
			VariantService.getQueryData($scope.selection.variant).then(function(queries){
				$scope.profiler.queries.listing.length = 0;
				$scope.profiler.queries.summary.runtime = 0;
				
				for(var i=0; i < queries.length; i++){
					queries[i]['total-runtime'] = queries[i]['request-executions'] * queries[i]['query-runtime'];
					$scope.profiler.queries.listing.push(queries[i]);
					$scope.profiler.queries.summary.runtime += parseFloat(queries[i]['total-runtime']);
				}
				
				$scope.changeListingPage('queries',1);
			});
			
			//Load Call Profiling Data
			VariantService.getCallData($scope.selection.variant).then(function(calls){
				$scope.profiler.calls.listing.length = 0;
				$scope.profiler.calls.summary.instances = 0;
				$scope.profiler.calls.summary.roundtrip = 0;
				
				for(var i=0; i < calls.length; i++){
					calls[i]['total-roundtrip'] = calls[i]['request-calls'] * calls[i]['call-roundtrip'];
					$scope.profiler.calls.listing.push(calls[i]);
					$scope.profiler.calls.summary.roundtrip += parseFloat(calls[i]['total-roundtrip']);
				}
				
				$scope.changeListingPage('calls',1);
			});
			
			//Load Custom Profiling Data
			VariantService.getCustomData($scope.selection.variant).then(function(custom){
				$scope.profiler.custom.listing.length = 0;
				$scope.profiler.custom.summary.runs = 0;
				
				$scope.profiler.custom.summary.duration = 0;
				for(var i=0; i < custom.length; i++){
					custom[i]['total-duration'] = custom[i]['runs'] * custom[i]['duration'];
					$scope.profiler.custom.listing.push(custom[i]);
					$scope.profiler.custom.summary.duration += parseFloat(custom[i]['total-duration']);
				}
				
				$scope.changeListingPage('custom',1);
			});
		}
	});
	
	$scope.$watch("variants.sort",function(newValue,oldValue){
		if(newValue != oldValue){
			$scope.sortVariants();
		}
	})
	
	$scope.$watch("variants.order",function(newValue,oldValue){
		if(newValue != oldValue){
			$scope.sortVariants();
		}
	})

	$scope.$watch("profiler.objects.sort",function(newValue,oldValue){
		if(newValue != oldValue){
			$scope.sortListing('objects');
		}
	})
	
	$scope.$watch("profiler.objects.order",function(newValue,oldValue){
		if(newValue != oldValue){
			$scope.sortListing('objects');
		}
	})

	$scope.$watch("profiler.queries.sort",function(newValue,oldValue){
		if(newValue != oldValue){
			$scope.sortListing('queries');
		}
	})
	
	$scope.$watch("profiler.queries.order",function(newValue,oldValue){
		if(newValue != oldValue){
			$scope.sortListing('queries');
		}
	})

	$scope.$watch("profiler.calls.sort",function(newValue,oldValue){
		if(newValue != oldValue){
			$scope.sortListing('calls');
		}
	})
	
	$scope.$watch("profiler.calls.order",function(newValue,oldValue){
		if(newValue != oldValue){
			$scope.sortListing('calls');
		}
	})

	$scope.$watch("profiler.custom.sort",function(newValue,oldValue){
		if(newValue != oldValue){
			$scope.sortListing('custom');
		}
	})
	
	$scope.$watch("profiler.custom.order",function(newValue,oldValue){
		if(newValue != oldValue){
			$scope.sortListing('custom');
		}
	})
})