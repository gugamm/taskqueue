function TaskQueue() {
	if (!(this instanceof TaskQueue)) {
		return new TaskQueue();
	}
	
	var tasks = [];
	var tasksResults = [];
	var executing = false;
	var shouldStop = false;
	var completeResolvers = [];
	var stopResolvers = [];
	
	const completeResolve = function (obj) {
		completeResolvers.forEach(resolver => resolver(obj));
	}	
	const stopResolve = function (obj) {
		stopResolvers.forEach(resolver => resolver(obj));
	}	
	const resolve = function (obj) {
		completeResolve(obj);
		stopResolve(obj);
		executing = false;
		completeResolvers = [];
		stopResolvers = [];	
	}
	
	const addTask  = function (task) {
		tasks = [...tasks, task];
		return () => {
			tasks = tasks.filter(t => t !== task);
		}
	}
	const addTasks = function (newTasks) {
		tasks = [...tasks, ...newTasks];
		return () => {
			tasks = tasks.filter(t => {
				for (var i = 0; i < newTasks.length; i++) 
					if (t === newTasks[i])
						return false;
				return true;
			});
		}
	}
	
	const removeTask = function (task) {
		tasks = tasks.filter(t => t !== task);
	}
	const clearTasks = function () {
		tasks = [];
	}
	
	const completeTasks = function () {
		return new Promise(function (r) {
			completeResolvers = [...completeResolvers, r];
			if (!executing) {
				tasksResults = [];
				shouldStop = false;
				executing = true;
				processTask();
			}
		});
	}
	
	const stopExecuting = function () {
		return new Promise(function (r) {
			if (!executing)
				r([]);
			else {
				stopResolvers = [...stopResolvers, r];
				shouldStop = true;
			}
		});
	};
	
	const qTaskCount = function () {
		return tasks.length;
	}
	
	const isExecuting = function () {
		return executing;
	}
	
	const processTask = function () {
		if (!executing)
			return;
		
		if (shouldStop) {
			resolve(tasksResults);
			return;
		}
		
		if (tasks.length < 1)
			resolve(tasksResults);
		
		const task = tasks[0];
		tasks = tasks.slice(1);
		
		const taskResult = task();
		
		if (taskResult instanceof Promise) 
			taskResult.then((result) => {
				tasksResults = [...tasksResults, result];
				processTask();
			}).catch((err) => {
				tasksResults = [...tasksResults, err];
				processTask();
			});
		else {	
			tasksResults = [...tasksResults, taskResult];
			processTask();
		}
	}
	
	const getCopyOfTasks = function (f) {
		f([...tasks]);
	}
	
	this.addTask        = addTask;
	this.addTasks       = addTasks;
	this.removeTask     = removeTask;
	this.clearTasks     = clearTasks;
	
	this.completeTasks  = completeTasks;
	this.stopExecuting  = stopExecuting;
	this.qTaskCount     = qTaskCount;
	this.isExecuting    = isExecuting;
	
	this.getCopyOfTasks = getCopyOfTasks;
}
