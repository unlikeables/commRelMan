'use strict';

(function() {
	// Csvs Controller Spec
	describe('Csvs Controller Tests', function() {
		// Initialize global variables
		var CsvsController,
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

			// Initialize the Csvs controller.
			CsvsController = $controller('CsvsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Csv object fetched from XHR', inject(function(Csvs) {
			// Create sample Csv using the Csvs service
			var sampleCsv = new Csvs({
				name: 'New Csv'
			});

			// Create a sample Csvs array that includes the new Csv
			var sampleCsvs = [sampleCsv];

			// Set GET response
			$httpBackend.expectGET('csvs').respond(sampleCsvs);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.csvs).toEqualData(sampleCsvs);
		}));

		it('$scope.findOne() should create an array with one Csv object fetched from XHR using a csvId URL parameter', inject(function(Csvs) {
			// Define a sample Csv object
			var sampleCsv = new Csvs({
				name: 'New Csv'
			});

			// Set the URL parameter
			$stateParams.csvId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/csvs\/([0-9a-fA-F]{24})$/).respond(sampleCsv);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.csv).toEqualData(sampleCsv);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Csvs) {
			// Create a sample Csv object
			var sampleCsvPostData = new Csvs({
				name: 'New Csv'
			});

			// Create a sample Csv response
			var sampleCsvResponse = new Csvs({
				_id: '525cf20451979dea2c000001',
				name: 'New Csv'
			});

			// Fixture mock form input values
			scope.name = 'New Csv';

			// Set POST response
			$httpBackend.expectPOST('csvs', sampleCsvPostData).respond(sampleCsvResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Csv was created
			expect($location.path()).toBe('/csvs/' + sampleCsvResponse._id);
		}));

		it('$scope.update() should update a valid Csv', inject(function(Csvs) {
			// Define a sample Csv put data
			var sampleCsvPutData = new Csvs({
				_id: '525cf20451979dea2c000001',
				name: 'New Csv'
			});

			// Mock Csv in scope
			scope.csv = sampleCsvPutData;

			// Set PUT response
			$httpBackend.expectPUT(/csvs\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/csvs/' + sampleCsvPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid csvId and remove the Csv from the scope', inject(function(Csvs) {
			// Create new Csv object
			var sampleCsv = new Csvs({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Csvs array and include the Csv
			scope.csvs = [sampleCsv];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/csvs\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleCsv);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.csvs.length).toBe(0);
		}));
	});
}());