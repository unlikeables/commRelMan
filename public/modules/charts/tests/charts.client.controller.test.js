'use strict';

(function() {
	// Charts Controller Spec
	describe('Charts Controller Tests', function() {
		// Initialize global variables
		var ChartsController,
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

			// Initialize the Charts controller.
			ChartsController = $controller('ChartsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Chart object fetched from XHR', inject(function(Charts) {
			// Create sample Chart using the Charts service
			var sampleChart = new Charts({
				name: 'New Chart'
			});

			// Create a sample Charts array that includes the new Chart
			var sampleCharts = [sampleChart];

			// Set GET response
			$httpBackend.expectGET('charts').respond(sampleCharts);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.charts).toEqualData(sampleCharts);
		}));

		it('$scope.findOne() should create an array with one Chart object fetched from XHR using a chartId URL parameter', inject(function(Charts) {
			// Define a sample Chart object
			var sampleChart = new Charts({
				name: 'New Chart'
			});

			// Set the URL parameter
			$stateParams.chartId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/charts\/([0-9a-fA-F]{24})$/).respond(sampleChart);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.chart).toEqualData(sampleChart);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Charts) {
			// Create a sample Chart object
			var sampleChartPostData = new Charts({
				name: 'New Chart'
			});

			// Create a sample Chart response
			var sampleChartResponse = new Charts({
				_id: '525cf20451979dea2c000001',
				name: 'New Chart'
			});

			// Fixture mock form input values
			scope.name = 'New Chart';

			// Set POST response
			$httpBackend.expectPOST('charts', sampleChartPostData).respond(sampleChartResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Chart was created
			expect($location.path()).toBe('/charts/' + sampleChartResponse._id);
		}));

		it('$scope.update() should update a valid Chart', inject(function(Charts) {
			// Define a sample Chart put data
			var sampleChartPutData = new Charts({
				_id: '525cf20451979dea2c000001',
				name: 'New Chart'
			});

			// Mock Chart in scope
			scope.chart = sampleChartPutData;

			// Set PUT response
			$httpBackend.expectPUT(/charts\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/charts/' + sampleChartPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid chartId and remove the Chart from the scope', inject(function(Charts) {
			// Create new Chart object
			var sampleChart = new Charts({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Charts array and include the Chart
			scope.charts = [sampleChart];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/charts\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleChart);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.charts.length).toBe(0);
		}));
	});
}());