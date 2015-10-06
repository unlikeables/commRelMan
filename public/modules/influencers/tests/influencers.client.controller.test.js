'use strict';

(function() {
	// Influencers Controller Spec
	describe('Influencers Controller Tests', function() {
		// Initialize global variables
		var InfluencersController,
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

			// Initialize the Influencers controller.
			InfluencersController = $controller('InfluencersController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Influencer object fetched from XHR', inject(function(Influencers) {
			// Create sample Influencer using the Influencers service
			var sampleInfluencer = new Influencers({
				name: 'New Influencer'
			});

			// Create a sample Influencers array that includes the new Influencer
			var sampleInfluencers = [sampleInfluencer];

			// Set GET response
			$httpBackend.expectGET('influencers').respond(sampleInfluencers);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.influencers).toEqualData(sampleInfluencers);
		}));

		it('$scope.findOne() should create an array with one Influencer object fetched from XHR using a influencerId URL parameter', inject(function(Influencers) {
			// Define a sample Influencer object
			var sampleInfluencer = new Influencers({
				name: 'New Influencer'
			});

			// Set the URL parameter
			$stateParams.influencerId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/influencers\/([0-9a-fA-F]{24})$/).respond(sampleInfluencer);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.influencer).toEqualData(sampleInfluencer);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Influencers) {
			// Create a sample Influencer object
			var sampleInfluencerPostData = new Influencers({
				name: 'New Influencer'
			});

			// Create a sample Influencer response
			var sampleInfluencerResponse = new Influencers({
				_id: '525cf20451979dea2c000001',
				name: 'New Influencer'
			});

			// Fixture mock form input values
			scope.name = 'New Influencer';

			// Set POST response
			$httpBackend.expectPOST('influencers', sampleInfluencerPostData).respond(sampleInfluencerResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Influencer was created
			expect($location.path()).toBe('/influencers/' + sampleInfluencerResponse._id);
		}));

		it('$scope.update() should update a valid Influencer', inject(function(Influencers) {
			// Define a sample Influencer put data
			var sampleInfluencerPutData = new Influencers({
				_id: '525cf20451979dea2c000001',
				name: 'New Influencer'
			});

			// Mock Influencer in scope
			scope.influencer = sampleInfluencerPutData;

			// Set PUT response
			$httpBackend.expectPUT(/influencers\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/influencers/' + sampleInfluencerPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid influencerId and remove the Influencer from the scope', inject(function(Influencers) {
			// Create new Influencer object
			var sampleInfluencer = new Influencers({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Influencers array and include the Influencer
			scope.influencers = [sampleInfluencer];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/influencers\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleInfluencer);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.influencers.length).toBe(0);
		}));
	});
}());