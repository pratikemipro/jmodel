define(['../opal.js'], function (opal) {
	
	//
	// Function composition
	//
	
	module('Function composition');
	
	test('pipe', function () {

		var double = function (x) { return 2*x; },
			addten = function (x) { return x+10; };

		equals( opal.pipe(double,addten)(7), 24, 'piping of two functions works' );
		equals( opal.pipe(addten,double)(7), 34, 'piping works in opposite direction' );
		equals( opal.pipe(double)(7), 14, 'pipe of a single function is just that function' );	
		equals( opal.pipe()(7), 7, 'pipe of no functions is identity' );

	});
	
	test('compose', function () {
	
		var double = function (x) { return 2*x; },
			addten = function (x) { return x+10; };
			
		equals( opal.compose(double,addten)(7), 34, 'composition of two functions works' );
		equals( opal.compose(addten,double)(7), 24, 'composition works in opposite direction' );
		equals( opal.compose(double)(7), 14, 'composition of a single function is just that function' );	
		equals( opal.compose()(7), 7, 'composition of no functions is identity' );
		
	});
	
	test('parallel', function () {

	    var double = function (x) { return 2*x; },
			addten = function (x) { return x+10; };

		var result1 = opal.parallel(double,addten)(5);

	    equals( result1[0], 10, 'parallel without labels returns correct first value');
	    equals( result1[1], 15, 'parallel without labels returns correct second value');

/*	    var result2 = opal.parallel({
	        doubled: double,
	        addedten: addten
	    })(5);

	    equals( result2.doubled,  10, 'parallel with label in call returns correct first value');
	    equals( result2.addedten, 15, 'parallel with label in call returns correct second value'); */

	    double.label = 'doubled';
	    addten.label = 'addedten';

	    var result3 = opal.parallel(double,addten)(5);

	    equals( result3.doubled,  10, 'parallel with label as function properties returns correct first value');
	    equals( result3.addedten, 15, 'parallel with label as function properties returns correct second value');

	    var result4 = opal.parallel(double,addten)({doubled:2,addedten:3});

	    equals( result4.doubled,  4,  'parallel with label as function properties and labelled parameters returns correct first value');
	    equals( result4.addedten, 13, 'parallel with label as function properties and labelled parameters returns correct second value');

	});
	
	
	//
	// Function application
	//
	
	module('Function application');
	
	test('apply', function () {
		
		var double = function (x) { return 2*x; };
		
		var Tripler = function () {
		    this.triple = function (x) { return 3*x; };
		};
		
		var tripler = new Tripler();
		
		equals( opal.apply(double,3), 6, 'apply works without context' );
		equals( opal.apply(tripler, tripler.triple, 3), 9, 'apply works with context' );
		
	});
	
	test('applyto', function () {
		
		var double = function (x) { return 2*x; };
		
		var Tripler = function () {
		    this.triple = function (x) { return 3*x; };
		};
		
		var tripler = new Tripler();
		
		equals( opal.applyto(3)(double), 6, 'applyto works without context' );
		equals( opal.applyto(3)(tripler,tripler.triple), 9, 'applyto works with context');
		
	});
	
	test('curry', function () {
	    
	   var add = function (a,b) { return a+b; };
	   
	   var Multiplier = function () {
            this.multiply = function (a,b) { return a*b };
	   };
	   
	   var multiplier = new Multiplier();
	   
	   equals( opal.curry(add,3)(5), 8, 'curry works without context');
	   equals( opal.curry(multiplier,multiplier.multiply,4)(3), 12, 'curry works with context');
	    
	});
	
	
	//
	// Object functions
	//
	
	module('Object functions');
	
	test('identity', function () {
	
		var fred = 'fred';
	
		equals( opal.identity(fred), fred, 'identity function returns object unchanged' );
		
	});
	
	test('type', function () {
	
		var fred = 'fred',
			age = 12,
			hello = function () { alert('hello'); },
			obj = {},
			no = null;
	
		equals( opal.type(fred),	'string',	'type works on strings' );
		equals( opal.type(age),		'number',	'type works on numbers' );
		equals( opal.type(hello),	'function', 'type works on functions' );
		equals( opal.type(obj),		'object',	'type works on objects' );
		equals( opal.type(no),		false,		'type works on nulls' );
		
	});
	
	test('property', function () {
	
		var fred = {forename:'Fred',surname:'Smith'};
		
		equals( opal.property('surname')(fred), 'Smith', 'property works on properties that exist' );
		equals( opal.property('age')(fred), undefined, 'property returns "undefined" for properties that do not exist');
		
		equals( opal.property('surname','Jones')(fred).surname, 'Jones', 'property allows setting of values at creation time' );
		equals( opal.property('surname')(fred,'Smith').surname, 'Smith', 'property allows setting of values at invocation time' );
		
	});
	
	test('method', function () {
	
		var Adder = function () {
		    this.unit = function () { return 0; };
		    this.add = function (a,b) { return a+b; };
		}
		
		var adder = new Adder();
		
		equals( opal.method('unit')(adder),    0,     'Method works without any arguments');
		equals( opal.method('test')(adder),    false, 'Method returns false if method does not exist.' )
		equals( opal.method('add',2,3)(adder), 5,     'Method works with arguments at creation time');
		equals( opal.method('add')(adder,2,3), 5,     'Method works with arguments at invocation time');
		equals( opal.method('add',2)(adder,3), 5,     'Method works with mixed arguments');
		
	});
	
	test('resolve', function () {
	    
	    var Person = function (forename,surname,age) {
		    this.forename = forename;
		    this.surname = surname;
		    this.age = age;
		    this.name = function () { return this.forename + ' ' + this.surname; };
		    this.Forename = function (forename) {
	            this.forename = forename;
	            return this;
		    };
		}
		
		var person = new Person('John','Smith',18);
		
		equals( opal.resolve('age')(person),  18,           'Resolve works with properties');
		equals( opal.resolve('name')(person), 'John Smith', 'Resolve works with methods');
		
		equals( opal.resolve('age',17)(person).age, 17, 'Resolve updates properties with values given at creation time');
	    equals( opal.resolve('age')(person,19).age, 19, 'Resolve updates properties with values given at invocation time');
	    
	    equals( opal.resolve('Forename','Adam')(person).forename, 'Adam', 'Resolve updates methods with values given at creation time');
	    equals( opal.resolve('Forename')(person,'Bob').forename, 'Bob', 'Resolve updates methods with values given at invocation time');
	    
	});
	
	test('path', function () {
		
		var person = {
		    name: {
		        first: 'John',
		        last: 'Smith'
		    },
		    job: function () {
		        return {
		            company: 'Cyberdyne',
		            title: 'Developer'
		        };
		    }
		};
		
		equals( opal.path('name.last')(person), 'Smith', 'path works for paths specified in a string');
		equals( opal.path('name/last','/')(person), 'Smith', 'path works for paths specified in a string with alternative separator');
		equals( opal.path(['name','first'])(person), 'John', 'path works for paths specified in an array');
		equals( opal.path('job.title')(person), 'Developer', 'path works for containing methods');
		equals( opal.path(['job','title'])(person), 'Developer', 'path works for paths containing methods specified as arrays');
		equals( opal.path('job.salary')(person), undefined, 'path returns undefined for paths that do not exist.');
		
	});
	
	test('transform', function () {
		
		person = {
		    forename: 'John',
		    surname: 'Smith',
		    fullname: ''
		};
		
		equals( (opal.transform('forename',opal.method('toUpperCase'))(person)).forename, 'JOHN', 'transform works correctly without extractor');
		equals( (opal.transform('fullname',opal.method('toUpperCase'),function (obj) {return obj.forename+' '+obj.surname;})(person)).fullname, 'JOHN SMITH', 'transform works correctly with extractor');
		
	});
	
	
	//
	// Reduction functions
	//
	
	module('Reduction functions');
	
	test('plus', function () {
	   
	   equals( opal.plus(2,3), 5, 'Plus performs addition' ); 
       equals( opal.plus(opal.plus.unit,3), 3, 'Plus has a unit' );
       equals( opal.plus.label, 'sum', 'The label for plus is "sum"' ); 
	    
	});
	
	test('times', function () {
	   
	   equals( opal.times(2,3), 6, 'Times performs multiplication' ); 
       equals( opal.times(opal.times.unit,3), 3, 'Times has a unit' );
       equals( opal.times.label, 'product', 'The label for times is "product"' ); 
	    
	});
	
	test('count', function () {
	   
	   equals( opal.count()(2,'red'), 3, 'Count without a predicate increments accumulator' );
	   equals( opal.count(opal.is_of_type('string'))(2,'red'), 3, 'Count with a predicate increments accumulator on match' );
       equals( opal.count(opal.is_of_type('string'))(2,7), 2, 'Count with a predicate does not increment accumulator on no match' );
       equals( opal.count().unit, 0, 'Count has a unit');
       equals( opal.count().label, 'count', 'The label for count is "count"'); 
	    
	});
	
	test('withmethod', function () {
	   
	   equals( opal.withmethod('concat')('fred','smith'), 'fredsmith', 'Withmethod words');
	    
	});
	
	test('push', function () {
	   
	   equals( (opal.push(['red','green','blue'],'cyan'))[3], 'cyan', 'Push words');
	    
	});
	
	
	//
	// Set construction
	//
	
	module('Set construction');
	
	test('Set constructor', function () {
	   
	   var set = new opal.Set('red','green','blue');
	   
	   equals( set.count(), 3, 'Set returns a set with correct cardinality');
	   equals( set.first(), 'red', 'Set returns a set that has correct first element');
	    
	});
	
	test('Set.fromArray', function () {
	    
	    var set = opal.Set.fromArray(['red','green','blue']);
	    
	    equals( set instanceof opal.Set, true, 'Set.fromArray returns a set');
	    equals( set.count(), 3, 'Set.fromArray returns a set with correct cardinality');
	    equals( set.first(), 'red', 'Set.fromArray has correct first element');
	    
	});
	
	test('Set.fromArguments', function () {
	   
	   function makeSet () {
	       return opal.Set.fromArguments(arguments);
	   }
	   
	   var set = makeSet('red','green','blue');
	   
	   equals( set instanceof opal.Set, true, 'Set.fromArguments returns a set');
	    equals( set.count(), 3, 'Set.fromArguments returns a set with correct cardinality');
	    equals( set.first(), 'red', 'Set.fromArguments has correct first element');
	    
	});
	
	test('Set creation', function () {
		
		equals( opal.set(['red','green','blue']).count(), 3, "creation from array" );
		equals( opal.set('red','green','blue').count(), 3, "creation from arguments" );
		
	});
	
	
	//
	// Set mutators
	//
	
	module('Set mutators');
	
	test('add', function () {
		
		var testSet = opal.set();
		testSet.add('red');
		testSet.add('green');
		
		equals( testSet.count(), 2, "addition of non-duplicate objects" );
		equals( testSet.add('blue').count(), 3, "addition of non-duplicate succeeds" );
		equals( testSet.add('green').count(), 3, "addition of duplicate fails" );
		
		// NOTE: Test constraints here
		// NOTE: Test that ".added" is set correctly
		// NOTE: text that index is updated correctly
		
	});
	
	test('remove', function () {
		var testSet = opal.set('red','green','blue');
		var removed = testSet.remove(function (candidate) { return candidate === 'red' });
		equals(testSet.first(), 'green', 'element removal works');
		equals(removed.first(), 'red', 'correct removed element returned');
		// NOTE: Test that length is managed correctly
		// NOTE: text that index is updated correctly
	});
	
	test('sort', function () {
		
		var testSet = opal.set('red','green','blue');
		testSet.sort(function (a,b) {
			return    a < b ? -1
					: a > b ? 1
					: 0;
		});
		
		equals(testSet.first(),'blue','sorting works');
		
	});

});