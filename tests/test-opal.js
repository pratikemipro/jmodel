define(['../library/opal.js'], function (opal) {
	
	window.opal = opal;
	
	//
	// Utility functions
	//
	
	module('Utility functions');
	
	test('type', function () {
	
		var fred = 'fred',
			age = 12,
			hello = function () { alert('hello'); },
			obj = {};
	
		equals( opal.type(fred),	'string',	'type works on strings' );
		equals( opal.type(age),		'number',	'type works on numbers' );
		equals( opal.type(hello),	'function', 'type works on functions' );
		equals( opal.type(obj),		'object',	'type works on objects' );
		
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
	// Function methods
	//
	
	module('Function');
	
	test('argument', function () {
	
		equals( Function.argument(0).call(this,'red','green','blue'), 'red', 'Function.argument(0) works');
		equals( Function.argument(1).call(this,'red','green','blue'), 'green', 'Function.argument(1) works');
		equals( Function.argument(2).call(this,'red','green','blue'), 'blue', 'Function.argument(2) works');
		equals( Function.argument(4).call(this,'red','green','blue'), undefined, 'Function.argument(4) returns undefined if beyond bounds');
		
		equals( Function.argument(2).hastype('string').call(this,'red','green','blue'), true, 'Function.argument(4).hastype returns false if type does not match' );
		equals( Function.argument(2).hastype('number').call(this,'red','green','blue'), false, 'Function.argument(4).hastype returns false if type does not match' );
		
	});
	
	test('identity', function () {
	
		var fred = 'fred';
	
		equals( Function.identity(fred), fred, 'identity function returns object unchanged' );
		
	});

	test('pipe', function () {

		var times2 = function (x) { return 2*x; },
			addten = function (x) { return x+10; };

		equals( Function.pipe(times2,addten)(7), 24, 'piping of two functions works' );
		equals( Function.pipe(addten,times2)(7), 34, 'piping works in opposite direction' );
		equals( Function.pipe(times2)(7), 14, 'pipe of a single function is just that function' );	
		equals( Function.pipe()(7), 7, 'pipe of no functions is identity' );

	});
	
	test('compose', function () {
	
		var times2 = function (x) { return 2*x; },
			addten = function (x) { return x+10; };
			
		equals( Function.compose(times2,addten)(7), 34, 'composition of two functions works' );
		equals( Function.compose(addten,times2)(7), 24, 'composition works in opposite direction' );
		equals( Function.compose(times2)(7), 14, 'composition of a single function is just that function' );	
		equals( Function.compose()(7), 7, 'composition of no functions is identity' );
		
	});
	
	test('or', function () {
	
		equals( Function.or()(5), false, "or of zero arguments is false");
		equals( Function.or(opal.eq(5))(5), true, "or with one argument returns true when predicate is true" );
		equals( Function.or(opal.eq(5))(7), false, "or with one argument returns false when predicate is false" );
		
		equals( Function.or(opal.eq(5),opal.eq(6))(5), true, "or with two arguments returns true when first is true"  );
		equals( Function.or(opal.eq(5),opal.eq(6))(6), true, "or with two arguments returns true when second is true"  );
		equals( Function.or(opal.eq(5),opal.eq(6))(7), false, "or with two arguments returns false when neither is true"  );
		
	});
	
	test('and', function () {
	
		equals( Function.and()(5), true, "or of zero arguments is true");
		equals( Function.and(opal.eq(5))(5), true, "and with one argument returns true when predicate is true" );
		equals( Function.and(opal.eq(5))(7), false, "and with one argument returns false when predicate is false" );
		
		equals( Function.and(opal.lt(5),opal.lt(6))(3), true, "and with two arguments returns true when both are true"  );
		equals( Function.and(opal.eq(5),opal.eq(6))(6), false, "and with two arguments returns false when first is false"  );
		equals( Function.and(opal.eq(5),opal.eq(6))(5), false, "or with two arguments returns false when second is false"  );
		equals( Function.and(opal.eq(5),opal.eq(6))(7), false, "or with two arguments returns false when neither is true"  );
		
	});
	
	test('not', function () {
	
		equals( opal.not(opal.eq(5))(6), true, 'not returns true when predicate returns false' );
		equals( opal.not(opal.eq(5))(5), false, 'not returns false when predicate returns true' );
		
		
	});
	
	test('ordering', function () {
	
		var people = [{forename:'john',surname:'smith'},{forename:'emily',surname:'jones'},{forename:'chris',surname:'smith'},{forename:'rich',surname:'jones'}];
		
		deepEqual(people.sort(Function.ordering(Object.property('surname').asc(),Object.property('forename').asc())), [{forename:'emily',surname:'jones'},{forename:'rich',surname:'jones'},{forename:'chris',surname:'smith'},{forename:'john',surname:'smith'}], 'composite orderings work');
		
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
	
	test('except', function () {
	
		var faulty = function () {throw 'bang!';},
			handled = faulty.except(function (err) { return 'Error: '+err;});
			
		equal(handled(), 'Error: bang!', 'except works correctly in simplest case');
		
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
	
	test('post', function () {
	
		var log = function (c,a,b) { logged = a+'+'+b+'='+c; },
			add = (function (a,b) { return a+b; }).post(log),
			logged = '';
			
		equal( add(2,3), 5, 'Post-function does not affect operation of function');
		equal( logged, '2+3=5', 'Post-function is run and has access to arguments and return value');
		
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
	
	test('is', function () {
	
		var sum = function (a,b) { return a+b; },
			odd  = function (a) { return a % 2 === 1; }; 
			
		equal( sum.is(odd)(2,3), true, 'is works when predicate true'  );
		equal( sum.is(odd)(3,3), false, 'is works when predicate false'  );
		
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
	
	test('asc', function () {
			
		equals( Function.identity.asc()(3,7), -1, 'first argument less returns -1 (integers)' );
		equals( Function.identity.asc()(7,7), 0, 'arguments equal return 0 (integers)' );
		equals( Function.identity.asc()(7,3), 1, 'first argument greater returns 1 (integers)' );
		
		equals( Function.identity.asc()('alice','fred'), -1, 'first argument less returns -1 (strings)' );
		equals( Function.identity.asc()('fred','fred'), 0, 'arguments equal return 0 (strings)' );
		equals( Function.identity.asc()('fred','alice'), 1, 'first argument greater returns 1 (strings)' );
	
		var people = [{forename:'john',surname:'smith'},{forename:'emily',surname:'jones'},{forename:'chris',surname:'smith'},{forename:'rich',surname:'jones'}];
		
		deepEqual(people.sort(Object.property('forename').asc()), [{forename:'chris',surname:'smith'},{forename:'emily',surname:'jones'},{forename:'john',surname:'smith'},{forename:'rich',surname:'jones'}], 'asc produces ordering that sorts into ascending order');
		
	});
	
	test('desc', function () {
	
		var people = [{forename:'john',surname:'smith'},{forename:'emily',surname:'jones'},{forename:'chris',surname:'smith'},{forename:'rich',surname:'jones'}];
		
		deepEqual(people.sort(Object.property('forename').desc()), [{forename:'rich',surname:'jones'},{forename:'john',surname:'smith'},{forename:'emily',surname:'jones'},{forename:'chris',surname:'smith'}], 'asc produces ordering that sorts into ascending order');
		
	});
	
	test('create', function () {
	
		equals(Date.create(1997,8,29) instanceof Date, true, 'creates an instance of the right constructor');
		equals(Date.create(1997,8,29).getFullYear(), 1997, 'object is initialised with correct arguments'  );
		
	});
	
	
	//
	// Object
	//
	
	module('Object');
	
	test('extend', function () {
	
		var source = {forename:'john',surname:'smith'},
			target = {};
			
		Object.extend(target,source);
		
		equals( target.forename, 'john','Copies first property correctly');
		equals( target.surname, 'smith','Copies second property correctly');
		
	});
	
	test('construct', function () {
	
		function Person (name, age) {
			this.name = name;
			this.age = age;
		}
		
		equals( Object.construct(Person)('fred',16) instanceof Person, true, 'Creates object of correct type');
		equals( Object.construct(Person)('fred',16).name, 'fred', 'First argument passed correctly');
		equals( Object.construct(Person)('fred',16).age, 16, 'Second argument passed correctly');
		
		equals( Object.construct(Person,'fred')(16).name, 'fred', 'Arguments can be passed in at definition time' );
		equals( Object.construct(Person,'fred')(16).age, 16, 'Arguments at call time passed in correctly when there are definition time arguments' );
		
		equals( typeof Object.construct(String)('fred'), 'string', 'Construct handles strings correctly' );
		equals( typeof Object.construct(Number)(7), 'number', 'Construct handles numbers correctly' );
		
		equals( Object.construct(Date)('1997-8-29') instanceof Date, true, 'Construct handles dates correctly' );
		
	});
	
	test('ensure', function () {
	
		function Person (name, age) {
			this.name = name;
			this.age = age;
		}
		
		var fred = new Person('fred',30);
		
		equals( Object.ensure(Person)(fred), fred, 'Acts as identity when object is already of type');
		equals( Object.ensure(Person)('jane',28) instanceof Person, true, 'Constructs new object when arguments not already of type');
		
		equals( Object.ensure(Person,'fred')(28).name, 'fred', 'Allows passing at definition time' );
		
	});
	
	test('project', function () {
		var person = {forename:'john',surname:'smith',department:'IT',age:18};
		deepEqual( Object.project('forename','surname')(person), {forename:'john',surname:'smith'}, 'projection works');
	});
	
	test('property', function () {
	
		var fred = {forename:'Fred',surname:'Smith'};
		
		equals( Object.property('surname')(fred), 'Smith', 'property works on properties that exist' );
		equals( Object.property('age')(fred), undefined, 'property returns "undefined" for properties that do not exist');
		
		Object.property('surname','Jones')(fred);
		equals( fred.surname, 'Jones', 'property allows setting of values at creation time' );
		
		equals( Object.property('age',17)(fred), false, 'returns false on attempting to set property that does not exist');
		
		equals(fred.age, undefined, 'property is not set if it does not exist');
		
	});
	
	test('method', function () {
	
		var Adder = function () {
		    this.unit = function () { return 0; };
		    this.add = function (a,b) { return a+b; };
		};
		
		var adder = new Adder();
		
		equals( Object.method('unit')(adder),    0,     	'Method works without any arguments');
		equals( Object.method('test')(adder),    undefined, 'Method returns "undefined" if method does not exist.' );
		equals( Object.method('add',2,3)(adder), 5,     	'Method works with arguments at creation time');
		
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
		
		equals( Object.resolve('age')(person),  18,           'Resolve works with properties');
		equals( Object.resolve('name')(person), 'John Smith', 'Resolve works with methods');
		
		Object.resolve('age',17)(person);
		equals( person.age, 17, 'Resolve updates properties with values given at creation time');
	    
		Object.resolve('Forename','Adam')(person);
	    equals( person.forename, 'Adam', 'Resolve updates methods with values given at creation time');
	    
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
		
		equals( Object.path('name.last')(person), 'Smith', 'path works for paths specified in a string');
		equals( Object.path('name/last','/')(person), 'Smith', 'path works for paths specified in a string with alternative separator');
		equals( Object.path(['name','first'])(person), 'John', 'path works for paths specified in an array');
		equals( Object.path('job.title')(person), 'Developer', 'path works for containing methods');
		equals( Object.path(['job','title'])(person), 'Developer', 'path works for paths containing methods specified as arrays');
		equals( Object.path('job.salary')(person), undefined, 'path returns undefined for paths that do not exist.');
		
	});
	
	test('transform', function () {
		
		person = {
		    forename: 'John',
		    surname: 'Smith',
		    fullname: ''
		};
		
		Object.transform('forename',Object.method('toUpperCase'))(person);
		equals( person.forename, 'JOHN', 'transform works correctly without extractor');
		
		Object.transform('fullname',Object.method('toUpperCase'),function (obj) {return obj.forename+' '+obj.surname;})(person);
		equals( person.fullname, 'JOHN SMITH', 'transform works correctly with extractor');
		
	});
	
	
	//
	// Function composition
	//
	
	module('Function composition');
	
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
	   
	   deepEqual( opal.push(['red','green','blue'],'cyan'), ['red','green','blue','cyan'], 'Push works');
	    
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