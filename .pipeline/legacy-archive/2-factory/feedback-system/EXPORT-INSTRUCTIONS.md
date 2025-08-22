# How to Export Your Feedback from Browser

## Quick Steps:

1. **Open the browser console** where you submitted feedback
   - Press F12 or right-click → Inspect → Console

2. **Run this command in the console:**
   ```javascript
   copy(localStorage.getItem('feedbackTasks'))
   ```

3. **Paste the result** into a new file called `my-feedback.json`

4. **Save the file** in the current directory

5. **Tell me when ready** and I'll process it!

## Alternative: View in Console

If you just want to see what you submitted, run:
```javascript
JSON.parse(localStorage.getItem('feedbackTasks'))
```

This will show all your feedback items in the console.

## To Get Just the Latest Item:

```javascript
const tasks = JSON.parse(localStorage.getItem('feedbackTasks'));
console.log('Latest feedback:', tasks[tasks.length - 1]);
```