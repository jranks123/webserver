// script.js

	// create the module and name it adminApp
        // also include ngRoute for all our routing needs
	var adminApp = angular.module('adminApp', ['ngRoute']);

	// configure our routes
	adminApp.config(function($routeProvider) {
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

			.when('/account', {
				templateUrl : 'content/user.html',
				controller  : 'userController'
			});
	});

	adminApp.controller('mainController', function($scope) {
		$scope.message = 'Home splash';
	});

	adminApp.controller('aboutController', function($scope) {
		$scope.message = 'Bio page';
	});

	adminApp.controller('musicController', function($scope) {
		$scope.message = 'Music page baby';
	});