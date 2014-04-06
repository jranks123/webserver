// script.js

	//create app and add ngroute
	var adminApp = angular.module('adminApp', ['ngRoute']);

	// configure our routes
	adminApp.config(function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl : 'content/home.html',
				controller  : 'mainController'
			})

			.when('/about', {
				templateUrl : 'content/about.html',
				controller  : 'aboutController'
			})

			.when('/music', {
				templateUrl : 'content/music.html',
				controller  : 'musicController'
			})

			.when('/reflektor', {
				templateUrl : 'content/reflektor.html',
				controller  : 'reflektorController'
			})

			.when('/thesuburbs', {
				templateUrl : 'content/thesuburbs.html',
				controller  : 'thesuburbsController'
			})

			.when('/neonbible', {
				templateUrl : 'content/neonbible.html',
				controller  : 'neonbibleController'
			})

			.when('/funeral', {
				templateUrl : 'content/funeral.html',
				controller  : 'funeralController'
			})

			.when('/afep', {
				templateUrl : 'content/afep.html',
				controller  : 'afepController'
			})

			.when('/video', {
				templateUrl : 'content/video.html',
				controller  : 'videoController'
			})

			.when('/live', {
				templateUrl : 'content/live.html',
				controller  : 'liveController'
			})

			.when('/blog', {
				templateUrl : 'content/blog.html',
				controller  : 'blogController'
			})

			.when('/themes', {
				templateUrl : 'content/themes.html',
				controller  : 'themesController'
			})

			.when('/saveVideo', {
				templateUrl : 'content/video.html',
				controller  : 'themesController'
			})


			.when('/failDate', {
				templateUrl : 'content/faildate.html',
				controller  : 'themesController'
			})

			.when('/failVideo', {
				templateUrl : 'content/failvideo.html',
				controller  : 'themesController'
			})

			.when('/failPassword', {
				templateUrl : 'content/failpassword.html',
				controller  : 'themesController'
			})

			.when('/failNewUser', {
				templateUrl : 'content/failnewuser.html',
				controller  : 'themesController'
			})


			.when('/account', {
				templateUrl : 'content/user.html',
				controller  : 'userController'
			});

		//$locationProvider.html5Mode(true);
	});

	/*adminApp.controller('FormCtrl', function ($scope, $http) {
		$scope.data = {
		        vid1: "default",
		        vid2: "default",
		        vid3 : "default"
		    };*/




	adminApp.controller('mainController', function($scope) {
		$scope.message = 'Home splash';
	});

	adminApp.controller('aboutController', function($scope) {
		$scope.message = 'Bio page';
	});

	adminApp.controller('musicController', function($scope) {
		$scope.message = 'Music page baby';
	});

	adminApp.controller('reflektorController', function($scope) {
		$scope.message = '';
	});


	adminApp.controller('thesuburbsController', function($scope) {
		$scope.message = '';
	});

	adminApp.controller('neonbibleController', function($scope) {
		$scope.message = 'Music page baby';
	});	

	adminApp.controller('funeralController', function($scope) {
		$scope.message = 'Home splash';
	});

	adminApp.controller('afepController', function($scope) {
		$scope.message = 'Bio page';
	});

	adminApp.controller('videoController', function($scope) {
		$scope.message = 'Music page baby';
	});

	adminApp.controller('liveController', function($scope) {
		$scope.message = 'Home splash';
	});

	adminApp.controller('blogController', function($scope) {
		$scope.message = 'Bio page';
	});

	adminApp.controller('themesController', function($scope) {
		$scope.message = 'Music page baby';
	});

		adminApp.controller('userController', function($scope) {
		$scope.message = 'Music page baby';
	});