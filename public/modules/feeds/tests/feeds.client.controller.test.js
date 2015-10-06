'use strict';

(function() {
	// Feeds Controller Spec
	describe('Feeds Controller Tests', function() {
		// Initialize global variables
		var FeedsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Feeds controller.
			FeedsController = $controller('FeedsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Feed object fetched from XHR', inject(function(Feeds) {
			// Create sample Feed using the Feeds service
			var sampleFeed = new Feeds({
				name: 'New Feed'
			});

			// Create a sample Feeds array that includes the new Feed
			var sampleFeeds = [sampleFeed];

			// Set GET response
			$httpBackend.expectGET('feeds').respond(sampleFeeds);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.feeds).toEqualData(sampleFeeds);
		}));

		it('$scope.findOne() should create an array with one Feed object fetched from XHR using a feedId URL parameter', inject(function(Feeds) {
			// Define a sample Feed object
			var sampleFeed = new Feeds({
				name: 'New Feed'
			});

			// Set the URL parameter
			$stateParams.feedId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/feeds\/([0-9a-fA-F]{24})$/).respond(sampleFeed);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.feed).toEqualData(sampleFeed);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Feeds) {
			// Create a sample Feed object
			var sampleFeedPostData = new Feeds({
				name: 'New Feed'
			});

			// Create a sample Feed response
			var sampleFeedResponse = new Feeds({
				_id: '525cf20451979dea2c000001',
				name: 'New Feed'
			});

			// Fixture mock form input values
			scope.name = 'New Feed';

			// Set POST response
			$httpBackend.expectPOST('feeds', sampleFeedPostData).respond(sampleFeedResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Feed was created
			expect($location.path()).toBe('/feeds/' + sampleFeedResponse._id);
		}));

		it('$scope.update() should update a valid Feed', inject(function(Feeds) {
			// Define a sample Feed put data
			var sampleFeedPutData = new Feeds({
				_id: '525cf20451979dea2c000001',
				name: 'New Feed'
			});

			// Mock Feed in scope
			scope.feed = sampleFeedPutData;

			// Set PUT response
			$httpBackend.expectPUT(/feeds\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/feeds/' + sampleFeedPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid feedId and remove the Feed from the scope', inject(function(Feeds) {
			// Create new Feed object
			var sampleFeed = new Feeds({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Feeds array and include the Feed
			scope.feeds = [sampleFeed];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/feeds\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleFeed);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.feeds.length).toBe(0);
		}));
	});
}());