'use strict';

(function() {
	// Accounts Controller Spec
	describe('Accounts Controller Tests', function() {
		// Initialize global variables
		var AccountsController,
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

			// Initialize the Accounts controller.
			AccountsController = $controller('AccountsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Account object fetched from XHR', inject(function(Accounts) {
			// Create sample Account using the Accounts service
			var sampleAccount = new Accounts({
				name: 'New Account'
			});

			// Create a sample Accounts array that includes the new Account
			var sampleAccounts = [sampleAccount];

			// Set GET response
			$httpBackend.expectGET('accounts').respond(sampleAccounts);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.accounts).toEqualData(sampleAccounts);
		}));

		it('$scope.findOne() should create an array with one Account object fetched from XHR using a accountId URL parameter', inject(function(Accounts) {
			// Define a sample Account object
			var sampleAccount = new Accounts({
				name: 'New Account'
			});

			// Set the URL parameter
			$stateParams.accountId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/accounts\/([0-9a-fA-F]{24})$/).respond(sampleAccount);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.account).toEqualData(sampleAccount);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Accounts) {
			// Create a sample Account object
			var sampleAccountPostData = new Accounts({
				name: 'New Account'
			});

			// Create a sample Account response
			var sampleAccountResponse = new Accounts({
				_id: '525cf20451979dea2c000001',
				name: 'New Account'
			});

			// Fixture mock form input values
			scope.name = 'New Account';

			// Set POST response
			$httpBackend.expectPOST('accounts', sampleAccountPostData).respond(sampleAccountResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Account was created
			expect($location.path()).toBe('/accounts/' + sampleAccountResponse._id);
		}));

		it('$scope.update() should update a valid Account', inject(function(Accounts) {
			// Define a sample Account put data
			var sampleAccountPutData = new Accounts({
				_id: '525cf20451979dea2c000001',
				name: 'New Account'
			});

			// Mock Account in scope
			scope.account = sampleAccountPutData;

			// Set PUT response
			$httpBackend.expectPUT(/accounts\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/accounts/' + sampleAccountPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid accountId and remove the Account from the scope', inject(function(Accounts) {
			// Create new Account object
			var sampleAccount = new Accounts({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Accounts array and include the Account
			scope.accounts = [sampleAccount];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/accounts\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleAccount);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.accounts.length).toBe(0);
		}));
	});
}());