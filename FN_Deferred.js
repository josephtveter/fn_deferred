/*
	Created by: Joseph Tveter
	email: josephtveter@gmail.com
	git: https://github.com/josephtveter/fn_deferred
	GPL: Use and Enjoy.  This is an example of my work. I am always open to hear about new employment oppertunities.

	Purpose:
		This library is to give Promise Object support.  If your site needs to support promises but also needs to support IE, so you can not use window.Promise.  Jquery is nice, but it is heavy.  FN_Deferred weighs in about 3kb.  FN_Deferred is a great stable micro library. Give it a whirl.   
*/
(function(global){
	
	var delay = function () {
		if ( typeof setImmediate != "undefined" ) {
			return setImmediate;
		}
		else if ( typeof process != "undefined" ) {
			return process.nextTick;
		}
		else {
			return function ( arg ) {
				if(arg){
					setTimeout( arg, 0 );
				}
			};
		}
	}();

	/**
	 * Iterates obj and executes fn
	 *
	 * Parameters for fn are 'value', 'index'
	 *
	 * @method each
	 * @private
	 * @param  {Array}    obj Array to iterate
	 * @param  {Function} fn  Function to execute on index values
	 * @return {Array}        Array
	 */
	function each ( obj, fn ) {
		var nth = obj.length,
		    i   = -1;

		while ( ++i < nth ) {
			if ( fn.call( obj, obj[i], i ) === false ) {
				break;
			}
		}
		return obj;
	}


	var Deferred = function(resolvedCallBack, rejectedCallBack, timeout, id)
	{
		var self = this;
		this.id = id || null;
		timeout = !isNaN(timeout) && timeout !== true ? timeout : 0;

		var onDone = [];
		var onAlways = [];
		var onFail = [];

		this.state = Deferred.state.PENDING;
		this.value = null;

		if(resolvedCallBack)
		{
			onDone.push(resolvedCallBack);
		}
		if(rejectedCallBack)
		{
			onFail.push(rejectedCallBack);
		}

		/**
		 * Rejects the Promise
		 *
		 * @method reject
		 * @param  {Mixed} arg Rejection outcome
		 * @return {Object}    Deferred instance
		 */
		this.reject = function ( arg ) {
			if ( self.state > Deferred.state.PENDING ) {
				return self;
			}
			self.state = Deferred.state.FAILURE;
			process.apply(this, arguments);
			return self;
		};

		/**
		 * Resolves the Promise
		 *
		 * @method resolve
		 * @param  {Mixed} arg Resolution outcome
		 * @return {Object}    Deferred instance
		 */
		this.resolve = function ( arg ) {
			if ( self.state > Deferred.state.PENDING ) {
				return self;
			}
			self.state = Deferred.state.SUCCESS;
			process.apply(this, arguments);
			return self;
		};

		/**
		 * Returns the Deferred Promise. This is included to ease in jquery replacement
		 *
		 * @method promise
		 * @return {Object}       Deferred instance
		 */
		this.promise = function ( arg ) {
			return self;
		};

		/**
		 * Registers a function to execute after Promise is reconciled
		 *
		 * @method always
		 * @param  {Function} arg Function to execute
		 * @return {Object}       Deferred instance
		 */
		this.always = function ( arg ) {
			if ( typeof arg == "function" ) {
				if(self.state !== Deferred.state.PENDING)
				{
					delay(arg(self.value, self.isResolved()));
				}
				onAlways.push( arg );
			}
			return self;
		};

		/**
		 * Registers a function to execute after Promise is resolved
		 *
		 * @method done
		 * @param  {Function} arg Function to execute
		 * @return {Object}       Deferred instance
		 */
		this.done = function ( arg ) {
			if ( typeof arg == "function" ) {
				if(self.state === Deferred.state.SUCCESS)
				{
					delay(arg(self.value, true));
				}
				onDone.push( arg );
			}
			return self;
		};

		/**
		 * Registers handler(s) for the Promise
		 *
		 * @method then
		 * @param  {Function} success Executed when/if promise is resolved
		 * @param  {Function} failure [Optional] Executed when/if promise is broken
		 * @return {Object}           New Promise instance
		 */
		this.then = function ( onFulfilled, onRejected ) {
			self.done( onFulfilled );
			self.fail( onRejected );
			return self;
		};

		/**
		 * Registers a function to execute after Promise is rejected
		 *
		 * @method fail
		 * @param  {Function} arg Function to execute
		 * @return {Object}       Deferred instance
		 */
		self.fail = function ( arg ) {
			if ( typeof arg == "function" ) {
				if(self.state === Deferred.state.FAILURE)
				{
					delay(arg(self.value, false));
				}
				onFail.push( arg );
			}
			return self;
		};
		/**
		 * Registers a function to execute after Promise is rejected
		 *
		 * @method catch
		 * @param  {Function} arg Function to execute
		 * @return {Object}       Deferred instance
		 */
		this.catch = this.fail;

		/**
		 * Determines if Deferred is rejected
		 *
		 * @method isRejected
		 * @return {Boolean} `true` if rejected
		 */
		this.isRejected = function () {
			return ( self.state === Deferred.state.FAILURE );
		};

		/**
		 * Determines if Deferred is resolved
		 *
		 * @method isResolved
		 * @return {Boolean} `true` if resolved
		 */
		this.isResolved = function () {
			return ( self.state === Deferred.state.SUCCESS );
		};

		/**
		 * Gets the state of the Promise
		 *
		 * @method state
		 * @return {String} Describes the status
		 */
		this.status = function () {
			var state = self.state;
			var rtn = Deferred.status[state];
			
			return rtn;
		};

		var retryProcess = true;
		var process = function(arg) {
			var success, value;
			var that = this;
			if ( self.state === Deferred.state.PENDING ) {
				return self;
			}

			self.value = arguments;

			var mapped = function(val)
			{
				try 
				{
					val.apply(that, self.value);
				}
				catch(e)
				{
					console.warn("Deferred callback Failed for state - "+self.status()+": "+e.message);
					// TODO FAIL???
					if(retryProcess)
					{
						retryProcess = false;
						self.state = Deferred.state.FAILURE;
						process({errorType: "deferred_callback_error", error: e, message: "An Error occured in this function: "+val.toString()});
					}
				}
			};
			if(self.state === Deferred.state.SUCCESS)
			{
				onDone.map(mapped);
			}
			else if(self.state === Deferred.state.FAILURE)
			{
				onFail.map(mapped);
			}
			onAlways.map(mapped);
			return self;
		};

		if(timeout)
		{
			window.setTimeout(function()
			{
				if(self.state === Deferred.state.PENDING)
				{
					self.reject({errorType: "deferred_timed_out"});
				}
			}, timeout);
		}
	};

	/**
	 * States of a Promise
	 *
	 * @private
	 * @type {Object}
	 */
	Deferred.state = {
		PENDING : 0,
		FAILURE : 1,
		SUCCESS : 2
	};

	/**
	 * Status of a Promise
	 *
	 * @private
	 * @type {Array}
	 */
	Deferred.status = [
		"pending",
		"rejected",
		"resolved"
	];

	/**
	 * Accepts Deferreds or Promises as arguments or an Array
	 *
	 * @method when
	 * @return {Object} Deferred instance
	 */
	Deferred.when = function () {
		var i     = 0,
		    defer = new Deferred(),
		    args  = [].slice.call( arguments ),
		    nth,
		    callback = null;

		// Did we receive an Array? if so it overrides any other arguments
		if ( args[0] instanceof Array ) {
			args = args[0];
		}
		if( typeof arguments[1] === "function")
		{
			callback = arguments[1];
		}

		// How many instances to observe?
		nth = args.length;

		// None, end on next tick
		if ( nth === 0 ) {
			defer.resolve( null );
		}
		// Setup and wait
		else {
			each( args, function ( p ) {
				p.then( function () {
					if ( ++i === nth && !defer.isResolved() ) {
						if ( args.length > 1 ) {
							defer.resolve( args.map( function ( obj ) {
								return obj.value;
							} ) );
							if ( callback ) {
							callback(args.map( function ( obj ) {
									return obj.value;
								} ));
							}
							
						}
						else {
							defer.resolve( args[0].value );
							if ( callback ) {
							callback( args[0].value );
							}
						}
					}
				}, function () {
					if ( !defer.isResolved() ) {
						if ( args.length > 1 ) {
							defer.reject( args.map( function ( obj ) {
								return obj.value;
							} ) );
							if ( callback ) {
							callback(args.map( function ( obj ) {
									return obj.value;
								} ));
							}
						}
						else {
							defer.reject( args[0].value );
							if ( callback ) {
							callback( args[0].value );
							}
						}
					}
				} );
			} );
		}

		return defer;
	};

	if ( typeof exports !== "undefined" ) {
	    module.exports = Deferred;
	}
	else if ( typeof define === "function" && define.amd) {
	    define( "Deferred", [], function(){ return Deferred;});
	}
	else if ( typeof define === "function" ) {
	    define( "Deferred", Deferred);
	}
	else {
	    window.Deferred = Deferred;
	}
})(this);