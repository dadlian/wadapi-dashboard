angular.module('Console',['ngRoute','chart.js','LocalStorageModule','monospaced.mousewheel']).config(function($routeProvider){
	$routeProvider.when("/api",{
		templateUrl:"views/api.html",
		controller:"APIController"
	}).when("/endpoint",{
		templateUrl:"views/endpoint.html",
		controller:"EndpointController"	
	}).when("/login",{
		templateUrl:"views/login.html",
		controller:"LoginController"	
	}).otherwise({
		redirectTo:"/api"
	});
}).run(function($rootScope,$location,SessionService) {
	$rootScope.$on( "$routeChangeStart", function(event,next,current){
		if(!SessionService.isLoggedIn()){
			$location.path("/login");
		}else if(SessionService.isLoggedIn() && next.templateUrl === "views/login.html"){
			$location.path("/");
		}
	});
});