# taskqueue
An task queue object that can handle sync and async tasks

## Examples

```javascript
function asyncTask() {
  return new Promise(function (resolve) {
    setTimeout(() => {
      console.log('Async Task');
      resolve();
    }, 2000);
  });
}

function syncTask() {
  console.log('Sync task');
}

var taskQ = TaskQueue();
taskQ.addTasks([asyncTask, syncTask]);
taskQ.completeTasks().then(() => console.log('Tasks completed'));

//result :
//'Async task'
//'Sync task'
//'Tasks completed'
```
