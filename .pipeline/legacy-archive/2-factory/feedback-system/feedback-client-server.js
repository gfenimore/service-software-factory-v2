/**
 * FEEDBACK CLIENT - SERVER VERSION
 * 
 * Drop this into any HTML to connect to the feedback server.
 * NO MANUAL EXPORT NEEDED!
 * 
 * Usage:
 * 1. Start server: npm run feedback:server
 * 2. Add to HTML: <script src="feedback-client-server.js"></script>
 * 3. Submit feedback - it goes straight to the server!
 */

(function() {
    // Configuration
    const FEEDBACK_SERVER = 'http://localhost:3456';
    
    // Check if already injected
    if (window.__feedbackClientInjected) return;
    window.__feedbackClientInjected = true;
    
    // Inject styles (same as before)
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
            
            .session-info {
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 8px 12px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 99998;
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
    
    // Create session info display
    const sessionInfo = document.createElement('div');
    sessionInfo.className = 'session-info';
    sessionInfo.innerHTML = 'Connecting to feedback server...';
    document.body.appendChild(sessionInfo);
    
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
                <button class="feedback-submit" onclick="submitFeedback()">Submit</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
    
    // Check server connection
    async function checkServer() {
        try {
            const response = await fetch(`${FEEDBACK_SERVER}/session`);
            const data = await response.json();
            
            sessionInfo.innerHTML = `📡 Session: ${data.session.id} | Feedback: ${data.stats.total}`;
            sessionInfo.style.background = 'rgba(76, 175, 80, 0.9)';
            
            return true;
        } catch (error) {
            sessionInfo.innerHTML = '⚠️ Feedback server offline';
            sessionInfo.style.background = 'rgba(244, 67, 54, 0.9)';
            console.error('Feedback server not running. Start with: npm run feedback:server');
            return false;
        }
    }
    
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
        
        // Capture app-specific context
        if (window.selectedAccount) context.selectedAccount = window.selectedAccount;
        if (window.selectedLocation) context.selectedLocation = window.selectedLocation;
        if (window.selectedWorkOrder) context.selectedWorkOrder = window.selectedWorkOrder;
        
        return context;
    }
    
    // Open feedback
    window.openFeedback = async function() {
        // Check server first
        const serverOnline = await checkServer();
        if (!serverOnline) {
            if (!confirm('Feedback server is offline. Start it with:\nnpm run feedback:server\n\nContinue anyway?')) {
                return;
            }
        }
        
        const context = captureContext();
        document.getElementById('feedbackContext').innerHTML = `
            <strong>Current Context:</strong><br>
            Page: ${context.url.split('/').pop()}<br>
            ${context.selectedAccount ? `Account: ${context.selectedAccount}<br>` : ''}
            ${context.selectedLocation ? `Location: ${context.selectedLocation}<br>` : ''}
            ${context.selectedWorkOrder ? `Work Order: ${context.selectedWorkOrder}<br>` : ''}
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
            description: document.getElementById('feedbackDescription').value,
            type: document.getElementById('feedbackType').value,
            priority: document.getElementById('feedbackPriority').value,
            context: captureContext(),
            timestamp: new Date().toISOString(),
            
            // Add complexity estimate for quick-fix detection
            complexity: document.getElementById('feedbackType').value === 'ui' ? 'low' : 'medium'
        };
        
        try {
            // Submit to server
            const response = await fetch(`${FEEDBACK_SERVER}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(feedback)
            });
            
            const result = await response.json();
            
            // Show result
            showResult(result);
            
            // Update session info
            await checkServer();
            
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            alert('Failed to submit feedback. Is the server running?\nnpm run feedback:server');
        }
        
        // Close popup
        closeFeedback();
    };
    
    // Show result
    function showResult(result) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'feedback-result success';
        
        const quickFixMessage = result.isQuickFix ? 
            '<p style="color: #ff9800; font-weight: bold;">⚡ Quick Fix - Applied Immediately!</p>' : '';
        
        resultDiv.innerHTML = `
            <h3>✅ Feedback Received!</h3>
            ${quickFixMessage}
            <p><strong>ID:</strong> ${result.feedbackId}</p>
            <p><strong>Session:</strong> ${result.sessionId}</p>
            <div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                <strong>Session Stats:</strong><br>
                Total: ${result.sessionStats.total}<br>
                Quick Fixes: ${result.sessionStats.quickFixes}<br>
                Pipeline: ${result.sessionStats.fullPipeline}<br>
                Resolved: ${result.sessionStats.resolved}
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 15px;
            ">OK</button>
        `;
        document.body.appendChild(resultDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (resultDiv.parentElement) {
                resultDiv.remove();
            }
        }, 5000);
    }
    
    // Attach click handler to button
    button.onclick = openFeedback;
    
    // Initial server check
    checkServer();
    
    // Periodic server check
    setInterval(checkServer, 30000); // Every 30 seconds
    
    // Log success
    console.log('✅ Feedback client connected!');
    console.log('🚀 Server endpoint:', FEEDBACK_SERVER);
    console.log('💡 Click the feedback button to submit!');
})();