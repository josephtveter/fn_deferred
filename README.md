# fn_deferred

Purpose:
	This library is to give Promise A Object support.  If your site needs to support promises but also needs to support IE, so you can not use window.Promise.  Jquery is nice, but it is heavy.  FN_Deferred weighs in about 3kb.  FN_Deferred is a great stable micro library. Give it a whirl.  

Multiple callback methods!

	However you prefer to get your deferred objects Callbacks we can do them all.
				
	- You can pass the callbacks in.
	var deferred = new Deferred(doneCallback, failCallback);
	
	- You can register them like jquery
	deferred.done(doneCallback).fail(failCallback).always(alwaysCallback);

	- You can register them like traditional Promise A
	deferred.then(doneCallback, failCallback);

	- You can register them like window.Promise
	deferred.then(doneCallback).catch(failCallback);	


Resolve or Reject Multiple arguments

	var deferred = new Deferred();
	deferred.done(function(result, result2)
	{
		console.log("Result1: "+result+" Result2: "+result2);
	}); 
	deferred.resolve("A", "B");


	var deferred = new Deferred();
	deferred.fail(function(error, error2)
	{
		console.log("error: "+error+" error2: "+error2);
	}); 
	deferred.reject("A", "B");


Check the status of the Deferred

	var deferred = new Deferred();
	var rejected = deferred.isRejected();
	var resolved = deferred.isResolved();
	var status = deferred.status();


Get the value of a resolved or rejected Deferred

	var deferred = new Deferred();
	var value = deferred.value;


Can easily replace Jquery! FN_Deferred Supports promise method.

	var deferred = new Deferred();
	return deferred.promise(); 
