define(['../opal.js'], function (opal) {
	
	
	//
	// Utility functions
	//
	
	module('Utility functions');
	
	test('arg', function () {
	
		equals( opal.arg(0).call(this,'red','green','blue'), 'red', 'arg(0) works');
		equals( opal.arg(1).call(this,'red','green','blue'), 'green', 'arg(1) works');
		equals( opal.arg(2).call(this,'red','green','blue'), 'blue', 'arg(2) works');
		equals( opal.arg(4).call(this,'red','green','blue'), undefined, 'arg(n) returns undefined if beyond bounds');
		
		equals( opal.arg(2).hastype('string').call(this,'red','green','blue'), true, 'arg(n).hastype returns false if type does not match' );
		equals( opal.arg(2).hastype('number').call(this,'red','green','blue'), false, 'arg(n).hastype returns false if type does not match' );
		
	});
	
	test('extend', function () {
		
		var fred = {forename:'fred'},
			test = {};
		
		opal.extend(fred,test);
			
		equals(test.forename, 'fred', 'extend copies properties' );
		
	});
	
	test('delegateTo', function () {
	
		var fred = {
			forename: 'fred',
			surname: 'smith',
			name: function () { return this.forename+' '+this.surname;  }
		},
			test = {
				forename: 'jane',
				surname: 'jones'
			};
			
		test.name = opal.delegateTo(fred,'name');
		
		equals( test.name(), 'fred smith', 'delegate runs method on another object' );
		
	});
	
	//
	// Function.prototype methods
	//
	
	module('Function.prototype');

	test('as', function () {
	
		var fn = function () { return 'red'; };
			
		equals( fn.as('test').displayName, 'test', 'as sets displayName of function' );
		equals( fn.as('test')(), 'red', 'function runs normally after use of "as"' );
		
	});
	
	test('extend', function () {
	
		var fn = function () { return 'red'; };
			
		equals( fn.extend({type:'accessor'}).type, 'accessor', 'extend sets properties of function' );
		equals( fn.extend({type:'accessor'})(), 'red', 'function runs normally after use of "extend"' );
		
	});
	
	test('bind', function () {
	
		var person = {name:'fred'},
			getName = function () { return this.name; };
			
		equals( getName.bind(person)(), 'fred', 'bind works' );
		
	});
	
	test('curry', function () {
	    
	   var add = function (a,b) { return a+b; };
	   
	   var Multiplier = function () {
            this.multiply = function (a,b) { return a*b; };
	   };
	   
	   var multiplier = new Multiplier();
	   
	   equals( add.curry(3)(5), 8, 'curry works');
	    
	});
	
	test('memo', function () {
	
		var add = function (a,b) { return a+b; }.memo();
		
		equals( add(2,3), 5, 'memoized function works normally on first call');
		equals( add(2,3), 5, 'memoized function works normally on subsequent calls');
		
	});
	
	test('then', function () {
	
		var red = function (arr) { arr.push('red'); return arr; },
			green = function (arr) { arr.push('green'); return arr; },
			blue = function (arr) { arr.push('blue'); return arr; };
			
		deepEqual( red.then(green)([]), ['red','green'], 'then works' );
		deepEqual( red.then(green.then(blue))([]), red.then(green).then(blue)([]), 'then is associative' );
		
	});
	
	test('but', function () {
	
		var arr = [],
			red = function (arr) { arr.push('red'); return arr; },
			length = function (arr) { return arr.length; };
		
		equal( red.but(length)(arr), 1, 'return value of second returned' );
		deepEqual( arr, ['red'], 'first function has been applied');
		
	});
	
	test('pre', function () {
	
		var a = 0,
			red = function () { return 'red'; },
			inc = function () { a++; },
			getA = function () { return a; };
		
		equal( red.pre(inc)(), 'red', 'pre does not interfere with function' );
		equal( a, 1, 'pre function runs first');
		equal( getA.pre(inc)(), 2, 'pre function runs first');
		
	});
	
	test('and', function () {
	
		var gt = function (x) {return x>2; },
			lt = function (x) {return x<6; },
			comp = gt.and(lt);
			
		equal(comp(4), true, 'true if both conditions true');
		equal(comp(1), false, 'false if first condition false');
		equal(comp(7), false, 'false if second condition false');
		
	});
	
	test('or', function () {
	
		var gt = function (x) {return x>2; },
			lt = function (x) {return x<2; },
			comp = gt.or(lt);
			
		equal(comp(3), true, 'true if first condition true');
		equal(comp(1), true, 'true if second condition true');
		equal(comp(2), false, 'false if both conditions false');
		
	});
	
	test('eq', function () {
		
		var add2 = function (x) { return x+2; };
		
		equal( add2.eq(5)(3), true, 'returns true when function applied to arguments equals value supplied to predicate' );
		equal( add2.eq(6)(3), false, 'returns false when function applied to arguments does not equal value supplied to predicate' );
		
	});
	
	test('neq', function () {
		
		var add2 = function (x) { return x+2; };
		
		equal( add2.neq(5)(3), false, 'returns false when function applied to arguments equals value supplied to predicate' );
		equal( add2.neq(6)(3), true, 'returns true when function applied to arguments does not equal value supplied to predicate' );
		
	});
	
	test('lt', function () {
		
		var add2 = function (x) { return x+2; };
		
		equal( add2.lt(5)(2), true, 'returns true when function applied to arguments is less than value supplied to predicate' );
		equal( add2.lt(5)(3), false, 'returns false when function applied to arguments is not less than value supplied to predicate' );
		
	});
	
	test('isa', function () {
	
		function Mammal () {}
		
		function Cat () {}
		Cat.prototype = new Mammal();
		
		function Dog () {}
		Dog.prototype = new Mammal();
		
		function get (type) { return type === 'cat' ? new Cat() : new Dog(); }
		
		equal( get.isa(Cat)('cat'), true, 'returns true when function applied to argument has constructor supplied to predicate'  );
		equal( get.isa(Dog)('cat'), false, 'returns false when function applied to argument has constructor supplied to predicate'  );
		equal( get.isa(Mammal)('cat'), true, 'respects inheritance'  );
		
	});
	
	test('hastype', function () {
	
		function test () { return 'red'; }
		
		equal( test.hastype('string')(), true, 'returns true when function returns a value of specified type' );
		equal( test.hastype('number')(), false, 'returns false when function returns a value not of specified type' );
		
	});
	
	
	//
	// Function composition
	//
	
	module('Function composition');
	
	test('pipe', function () {

		var times2 = function (x) { return 2*x; },
			addten = function (x) { return x+10; };

		equals( opal.pipe(times2,addten)(7), 24, 'piping of two functions works' );
		equals( opal.pipe(addten,times2)(7), 34, 'piping works in opposite direction' );
		equals( opal.pipe(times2)(7), 14, 'pipe of a single function is just that function' );	
		equals( opal.pipe()(7), 7, 'pipe of no functions is identity' );

	});
	
	test('compose', function () {
	
		var times2 = function (x) { return 2*x; },
			addten = function (x) { return x+10; };
			
		equals( opal.compose(times2,addten)(7), 34, 'composition of two functions works' );
		equals( opal.compose(addten,times2)(7), 24, 'composition works in opposite direction' );
		equals( opal.compose(times2)(7), 14, 'composition of a single function is just that function' );	
		equals( opal.compose()(7), 7, 'composition of no functions is identity' );
		
	});
	
	test('parallel', function () {

	    var times2 = function (x) { return 2*x; },
			addten = function (x) { return x+10; };

		var result1 = opal.parallel(times2,addten)(5);

	    equals( result1[0], 10, 'parallel without labels returns correct first value');
	    equals( result1[1], 15, 'parallel without labels returns correct second value');

/*	    var result2 = opal.parallel({
	        doubled: double,
	        addedten: addten
	    })(5);

	    equals( result2.doubled,  10, 'parallel with label in call returns correct first value');
	    equals( result2.addedten, 15, 'parallel with label in call returns correct second value'); */

	    times2.label = 'doubled';
	    addten.label = 'addedten';

	    var result3 = opal.parallel(times2,addten)(5);

	    equals( result3.doubled,  10, 'parallel with label as function properties returns correct first value');
	    equals( result3.addedten, 15, 'parallel with label as function properties returns correct second value');

	    var result4 = opal.parallel(times2,addten)({doubled:2,addedten:3});

	    equals( result4.doubled,  4,  'parallel with label as function properties and labelled parameters returns correct first value');
	    equals( result4.addedten, 13, 'parallel with label as function properties and labelled parameters returns correct second value');

	});
	
	
	//
	// Function application
	//
	
	module('Function application');
	
	test('apply', function () {
		
		var times2 = function (x) { return 2*x; };
		
		var Tripler = function () {
		    this.triple = function (x) { return 3*x; };
		};
		
		var tripler = new Tripler();
		
		equals( opal.apply(times2,3), 6, 'apply works without context' );
		equals( opal.apply(tripler, tripler.triple, 3), 9, 'apply works with context' );
		
	});
	
	test('applyto', function () {
		
		var times2 = function (x) { return 2*x; };
		
		var Tripler = function () {
		    this.triple = function (x) { return 3*x; };
		};
		
		var tripler = new Tripler();
		
		equals( opal.applyto(3)(times2), 6, 'applyto works without context' );
		equals( opal.applyto(3)(tripler,tripler.triple), 9, 'applyto works with context');
		
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
		
	});
	
	test('method', function () {
	
		var Adder = function () {
		    this.unit = function () { return 0; };
		    this.add = function (a,b) { return a+b; };
		};
		
		var adder = new Adder();
		
		equals( opal.method('unit')(adder),    0,     	  'Method works without any arguments');
		equals( opal.method('test')(adder),    undefined, 'Method returns "undefined" if method does not exist.' );
		equals( opal.method('add',2,3)(adder), 5,     	  'Method works with arguments at creation time');
		equals( opal.method('add')(adder,2,3), 5,     	  'Method works with arguments at invocation time');
		equals( opal.method('add',2)(adder,3), 5,     	  'Method works with mixed arguments');
		
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
		};
		
		var person = new Person('John','Smith',18);
		
		equals( opal.resolve('age')(person),  18,           'Resolve works with properties');
		equals( opal.resolve('name')(person), 'John Smith', 'Resolve works with methods');
		
		equals( opal.resolve('age',17)(person).age, 17, 'Resolve updates properties with values given at creation time');
	    
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
	
	module('Predicates (object)');
	
	test('is', function () {
		
		var object = {Forename:'Test1'};
		var other = {Forename:'Test2'};
		equals( opal.is(object)(object), true, "returns true on predicate's object" );
		equals( opal.is(object)(other),  false, "returns false on other objects" );
	
	});
	
	test('is_of_type', function () {
	
		equals( opal.is_of_type('number')(3), true, 'works for numbers when true');
		equals( opal.is_of_type('number')('abc'), false, 'works for numbers when false');
		
		equals( opal.is_of_type('string')('abc'), true, 'works for strings when true');
		equals( opal.is_of_type('string')(3), false, 'works for strings when false');
		
		equals( opal.is_of_type('boolean')(true), true, 'works for booleans when true');
		equals( opal.is_of_type('boolean')('abc'), false, 'works for booleans when false');
		
		equals( opal.is_of_type('object')({a:1}), true, 'works for objects when true');
		equals( opal.is_of_type('object')('abc'), false, 'works for objects when false');
		
		equals( opal.is_of_type('function')(function () {}), true, 'works for functions when true');
		equals( opal.is_of_type('function')('abc'), false, 'works for functions when false');
		
		equals( opal.is_of_type('undefined')(), true, 'works for undefined when true');
		equals( opal.is_of_type('undefined')('abc'), false, 'works for undefined when false');
				
	});
	
	test('isa', function () {
		
		var Mammal 	= function () {},
			mammal  = new Mammal(),
			Fish 	= function () {},
			fish	= new Fish();
			
		equals( opal.isa(Mammal)(mammal), true,  "returns true on object with matching constructor");
		equals( opal.isa(Mammal)(fish),   false, "returns false on object without matching constructor");
		equals( opal.isa(Object)([]),	  true,	 "works with inheritance");
		
	});
	
	test('has', function () {
	
		var person = {forename:'fred',age:function () { return 18; }};
		
		equals( opal.has('forename')(person), true, 'returns true when object has property');
		equals( opal.has('age')(person), true, 'returns true when object has method');
		equals( opal.has('surnane')(person), false, 'returns false when object does not have property');
		
	});
	
	module('Predicates (value comparison)');
	
	test('eq', function () {
		
		equals( opal.eq(3)(3), true, 'returns true if values equal');
		equals( opal.eq(3)(2), false, 'returns false if values not equal');
		
	});
	
	test('neq', function () {
		
		equals( opal.neq(3)(3), false, 'returns false if values equal');
		equals( opal.neq(3)(2), true, 'returns true if values not equal');
		
	});
	
	test('lt', function () {
		
		equals( opal.lt(3)(2), true, 'returns true if value less than target');
		equals( opal.lt(3)(3), false, 'returns false if value equal to target');
		equals( opal.lt(3)(4), false, 'returns false if value greater than target');
		
	});
	
	test('gt', function () {
		
		equals( opal.gt(3)(2), false, 'returns false if value less than target');
		equals( opal.gt(3)(3), false, 'returns false if value equal to target');
		equals( opal.gt(3)(4), true, 'returns true if value greater than target');
		
	});
	
	test('lte', function () {
		
		equals( opal.lte(3)(2), true, 'returns true if value less than target');
		equals( opal.lte(3)(3), true, 'returns true if value equal to target');
		equals( opal.lte(3)(4), false, 'returns false if value greater than target');
		
	});
	
	test('gte', function () {
		
		equals( opal.gte(3)(2), false, 'returns false if value less than target');
		equals( opal.gte(3)(3), true, 'returns true if value equal to target');
		equals( opal.gte(3)(4), true, 'returns true if value greater than target');
		
	});
	
	test('between', function () {
		
		equals( opal.between(3,5)(2), false, 'returns false if value below range');
		equals( opal.between(3,5)(3), true, 'returns true if value equals lower boundary of range');
		equals( opal.between(3,5)(4), true, 'returns true if value within range');
		equals( opal.between(3,5)(5), true, 'returns true if value equals upper boundary of range');
		equals( opal.between(3,5)(6), false, 'returns false if value above range');
		
	});
	
	test('regex', function () {
		
		equals( opal.regex(/re/)('fred'), true,  'returns true when candidate matches regular expression' );
		equals( opal.regex(/re/)('john'), false, 'returns false when candidate does not match regular expression' );
		
	});
	
	module('Predicates (generic)');
	
	test('istrue', function () {
	
		equals( opal.istrue(true), true, 'returns true for true value');
		equals( opal.istrue(false), false, 'returns false for false value');
		equals( opal.istrue(7), false, 'returns false for non-booleans value');
		
	});
	
	test('isnull', function () {
	
		equals( opal.isnull(null), true, 'returns true for null value');
		equals( opal.isnull(false), false, 'returns false for false value');
		equals( opal.isnull(7), false, 'returns false for truthy non-null value');
		
	});
	
	module('Logical connectives');
	
	test('or', function () {
	
		equals( opal.or()(5), false, "or of zero arguments is false");
		equals( opal.or(opal.eq(5))(5), true, "or with one argument returns true when predicate is true" );
		equals( opal.or(opal.eq(5))(7), false, "or with one argument returns false when predicate is false" );
		
		equals( opal.or(opal.eq(5),opal.eq(6))(5), true, "or with two arguments returns true when first is true"  );
		equals( opal.or(opal.eq(5),opal.eq(6))(6), true, "or with two arguments returns true when second is true"  );
		equals( opal.or(opal.eq(5),opal.eq(6))(7), false, "or with two arguments returns false when neither is true"  );
		
	});
	
	test('and', function () {
	
		equals( opal.and()(5), true, "or of zero arguments is true");
		equals( opal.and(opal.eq(5))(5), true, "and with one argument returns true when predicate is true" );
		equals( opal.and(opal.eq(5))(7), false, "and with one argument returns false when predicate is false" );
		
		equals( opal.and(opal.lt(5),opal.lt(6))(3), true, "and with two arguments returns true when both are true"  );
		equals( opal.and(opal.eq(5),opal.eq(6))(6), false, "and with two arguments returns false when first is false"  );
		equals( opal.and(opal.eq(5),opal.eq(6))(5), false, "or with two arguments returns false when second is false"  );
		equals( opal.and(opal.eq(5),opal.eq(6))(7), false, "or with two arguments returns false when neither is true"  );
		
	});
	
	test('not', function () {
	
		equals( opal.not(opal.eq(5))(6), true, 'not returns true when predicate returns false' );
		equals( opal.not(opal.eq(5))(5), false, 'not returns false when predicate returns true' );
		
		
	});
	
/*	
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
	
	test('set', function () {
		
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
*/


});