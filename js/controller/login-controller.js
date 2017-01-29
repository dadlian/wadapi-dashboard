angular.module('Console').controller('LoginController',
	function($scope,$location,SessionService){
		$scope.credentials = {
			username:"",
			password:""
		}
		
		$scope.login = function(form){
			if(!$scope.credentials.username || !$scope.credentials.password){
				angular.forEach(form.$error.required, function(field) {
					field.$setDirty();
				});
				
				return;
			}
			
			$scope.state.loading = true;
			$scope.state.failed = false;
			SessionService.login($scope.credentials.username,$scope.credentials.password).then(function(activeUser){
				if(activeUser){
					$scope.state.authenticated = true;
					$location.path("/");
				}else{
					$scope.state.loading = false;
					$scope.state.failed = true;
				}
			})
		}
	}
)