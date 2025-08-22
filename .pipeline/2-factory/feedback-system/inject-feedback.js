/**
 * FEEDBACK INJECTION SCRIPT
 * Add this single line to ANY HTML concept page:
 * <script src="../../2-factory/feedback-system/inject-feedback.js"></script>
 * 
 * That's it. Everything else is automatic.
 */

(function() {
    // Check if already injected
    if (window.__feedbackSystemInjected) return;
    window.__feedbackSystemInjected = true;

    // Inject styles
    const styles = `
        <style>
            .feedback-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                font-size: 28px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 99999;
                transition: transform 0.3s;
            }
            .feedback-btn:hover {
                transform: scale(1.1);
            }
            
            .feedback-popup {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                z-index: 100000;
            }
            
            .feedback-popup.show {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .feedback-form {
                background: white;
                padding: 30px;
                border-radius: 15px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .feedback-form h2 {
                margin: 0 0 20px 0;
                color: #333;
            }
            
            .feedback-field {
                margin-bottom: 15px;
            }
            
            .feedback-field label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #555;
            }
            
            .feedback-field input,
            .feedback-field select,
            .feedback-field textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
                box-sizing: border-box;
            }
            
            .feedback-field textarea {
                resize: vertical;
                min-height: 80px;
            }
            
            .feedback-context {
                background: #f0f0f0;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                font-size: 12px;
                color: #666;
            }
            
            .feedback-buttons {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
            }
            
            .feedback-submit {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            }
            
            .feedback-cancel {
                background: #ccc;
                color: #333;
                border: none;
                padding: 12px 30px;
                border-radius: 5px;
                cursor: pointer;
            }
            
            .feedback-result {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                z-index: 100001;
                max-width: 400px;
                text-align: center;
            }
            
            .feedback-result.success {
                border-top: 5px solid #4CAF50;
            }
            
            .feedback-result h3 {
                color: #4CAF50;
                margin: 0 0 15px 0;
            }
            
            .feedback-estimate {
                background: #e8f5e9;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                font-size: 18px;
                color: #2e7d32;
                font-weight: bold;
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);

    // Create feedback button
    const button = document.createElement('button');
    button.className = 'feedback-btn';
    button.innerHTML = '💡';
    button.title = 'Submit Feedback';
    document.body.appendChild(button);

    // Create feedback popup
    const popup = document.createElement('div');
    popup.className = 'feedback-popup';
    popup.innerHTML = `
        <div class="feedback-form">
            <h2>💡 Share Your Feedback</h2>
            
            <div class="feedback-context" id="feedbackContext">
                Loading context...
            </div>
            
            <div class="feedback-field">
                <label>What would you like to improve?</label>
                <textarea id="feedbackDescription" placeholder="Describe your idea or issue..." required></textarea>
            </div>
            
            <div class="feedback-field">
                <label>Type</label>
                <select id="feedbackType">
                    <option value="ui">UI/Visual Change</option>
                    <option value="feature">New Feature</option>
                    <option value="enhancement">Enhancement</option>
                    <option value="bug">Bug Fix</option>
                    <option value="performance">Performance</option>
                </select>
            </div>
            
            <div class="feedback-field">
                <label>Priority</label>
                <select id="feedbackPriority">
                    <option value="low">Nice to have</option>
                    <option value="medium">Important</option>
                    <option value="high">Critical</option>
                </select>
            </div>
            
            <div class="feedback-buttons">
                <button class="feedback-cancel" onclick="closeFeedback()">Cancel</button>
                <button class="feedback-submit" onclick="submitFeedback()">Submit & Process</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    // Context capture
    function captureContext() {
        const context = {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            elements: {
                visible: document.querySelectorAll('*').length,
                buttons: document.querySelectorAll('button').length,
                inputs: document.querySelectorAll('input, select, textarea').length
            }
        };

        // Try to capture app-specific context
        if (window.selectedAccount) context.selectedAccount = window.selectedAccount;
        if (window.selectedLocation) context.selectedLocation = window.selectedLocation;
        if (window.selectedWorkOrder) context.selectedWorkOrder = window.selectedWorkOrder;

        return context;
    }

    // Open feedback
    window.openFeedback = function() {
        const context = captureContext();
        document.getElementById('feedbackContext').innerHTML = `
            <strong>Current Context:</strong><br>
            Page: ${context.url.split('/').pop()}<br>
            ${context.selectedAccount ? `Account: ${context.selectedAccount}<br>` : ''}
            ${context.selectedLocation ? `Location: ${context.selectedLocation}<br>` : ''}
            Viewport: ${context.viewport}
        `;
        popup.classList.add('show');
    };

    // Close feedback
    window.closeFeedback = function() {
        popup.classList.remove('show');
        document.getElementById('feedbackDescription').value = '';
    };

    // Submit feedback
    window.submitFeedback = async function() {
        const feedback = {
            id: `FB-${Date.now()}`,
            description: document.getElementById('feedbackDescription').value,
            type: document.getElementById('feedbackType').value,
            priority: document.getElementById('feedbackPriority').value,
            context: captureContext(),
            timestamp: new Date().toISOString()
        };

        // Process feedback
        const result = await processFeedbackToTask(feedback);
        
        // Save to file system (using Node.js bridge)
        await saveTaskToFile(result.task);
        
        // Show result
        showResult(result);
        
        // Close popup
        closeFeedback();
    };

    // Process feedback into task
    async function processFeedbackToTask(feedback) {
        // Estimate based on type
        const estimates = {
            ui: { time: '30 minutes', complexity: 'low' },
            feature: { time: '4-8 hours', complexity: 'high' },
            enhancement: { time: '1-2 hours', complexity: 'medium' },
            bug: { time: '1 hour', complexity: 'medium' },
            performance: { time: '2-4 hours', complexity: 'high' }
        };

        const estimate = estimates[feedback.type];
        
        const task = {
            id: `TASK-${Date.now()}`,
            title: feedback.description.substring(0, 50),
            description: feedback.description,
            type: feedback.type,
            priority: feedback.priority,
            estimate: estimate.time,
            complexity: estimate.complexity,
            context: feedback.context,
            createdAt: feedback.timestamp,
            status: 'pending',
            implementation: generateImplementationSteps(feedback)
        };

        return { task, estimate };
    }

    // Generate implementation steps
    function generateImplementationSteps(feedback) {
        const steps = {
            ui: [
                'Locate the UI component',
                'Update CSS/HTML',
                'Test responsive design',
                'Verify cross-browser'
            ],
            feature: [
                'Design feature specification',
                'Create UI mockup',
                'Implement backend logic',
                'Build frontend components',
                'Add tests',
                'Update documentation'
            ],
            enhancement: [
                'Review current implementation',
                'Design enhancement',
                'Update components',
                'Test changes'
            ],
            bug: [
                'Reproduce issue',
                'Identify root cause',
                'Implement fix',
                'Add regression test'
            ],
            performance: [
                'Profile current performance',
                'Identify bottlenecks',
                'Implement optimizations',
                'Measure improvements'
            ]
        };

        return steps[feedback.type] || ['Analyze', 'Implement', 'Test'];
    }

    // Save task to file (this would need a backend in production)
    async function saveTaskToFile(task) {
        // Store in localStorage for now
        const tasks = JSON.parse(localStorage.getItem('feedbackTasks') || '[]');
        tasks.push(task);
        localStorage.setItem('feedbackTasks', JSON.stringify(tasks));
        
        // In production, this would POST to a server that writes to the file system
        console.log('Task saved:', task);
        
        // Simulate file save
        const filename = `.pipeline/1-inputs/requirements/feedback-tasks/${task.id}.json`;
        console.log(`Would save to: ${filename}`);
    }

    // Show result
    function showResult(result) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'feedback-result success';
        resultDiv.innerHTML = `
            <h3>✅ Feedback Processed!</h3>
            <p>Your feedback has been converted into a development task.</p>
            <div class="feedback-estimate">
                ⏱️ Estimated Time: ${result.estimate.time}
            </div>
            <p><strong>Task ID:</strong> ${result.task.id}</p>
            <p>This feature will be ready in the next iteration!</p>
            <button onclick="this.parentElement.remove()" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 15px;
            ">OK, Got it!</button>
        `;
        document.body.appendChild(resultDiv);
    }

    // Attach click handler to button
    button.onclick = openFeedback;

    // Log success
    console.log('✅ Feedback system injected! Click the 💡 button to submit feedback.');
})();