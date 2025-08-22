/**
 * Feedback Collector Component
 * Captures user enhancement ideas with context
 */

class FeedbackCollector {
    constructor() {
        this.feedbackQueue = [];
        this.currentContext = {};
    }

    /**
     * Capture current UI state as context
     */
    captureContext() {
        return {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            activeElement: {
                id: document.activeElement?.id,
                class: document.activeElement?.className,
                tag: document.activeElement?.tagName
            },
            // Capture application state
            appState: {
                selectedAccount: window.selectedAccount || null,
                selectedLocation: window.selectedLocation || null,
                selectedWorkOrder: window.selectedWorkOrder || null,
                searchQuery: document.querySelector('#searchInput')?.value || '',
                visibleItems: {
                    accounts: document.querySelectorAll('.account-item').length,
                    locations: document.querySelectorAll('.location-item').length,
                    workOrders: document.querySelectorAll('.work-order-item').length
                }
            },
            // Screenshot placeholder (would need additional library)
            screenshot: null
        };
    }

    /**
     * Create feedback form
     */
    createFeedbackForm() {
        const formHTML = `
            <div id="feedbackModal" class="feedback-modal">
                <div class="feedback-content">
                    <h3>💡 Share Your Idea</h3>
                    
                    <div class="feedback-context">
                        <h4>Current Context</h4>
                        <pre id="contextDisplay"></pre>
                    </div>

                    <form id="feedbackForm">
                        <div class="form-group">
                            <label>Feedback Type:</label>
                            <select id="feedbackType" required>
                                <option value="">Select type...</option>
                                <option value="ui">UI/UX Improvement</option>
                                <option value="data">Data/Display Issue</option>
                                <option value="enhancement">Enhancement</option>
                                <option value="feature">New Feature</option>
                                <option value="performance">Performance</option>
                                <option value="bug">Bug/Issue</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Priority:</label>
                            <select id="priority">
                                <option value="low">Nice to have</option>
                                <option value="medium">Would improve workflow</option>
                                <option value="high">Critical for usability</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Description:</label>
                            <textarea id="description" rows="4" required 
                                placeholder="Describe your idea or issue..."></textarea>
                        </div>

                        <div class="form-group">
                            <label>Expected Behavior (optional):</label>
                            <textarea id="expectedBehavior" rows="2" 
                                placeholder="What should happen instead?"></textarea>
                        </div>

                        <div class="form-group">
                            <label>Component/Area:</label>
                            <input type="text" id="component" 
                                placeholder="e.g., Account List, Search, Navigation">
                        </div>

                        <div class="form-actions">
                            <button type="submit">Submit Feedback</button>
                            <button type="button" onclick="feedbackCollector.close()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add styles
        const styles = `
            <style>
                .feedback-trigger {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 60px;
                    height: 60px;
                    font-size: 24px;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    z-index: 9998;
                }
                
                .feedback-modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 9999;
                }
                
                .feedback-modal.active {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .feedback-content {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                
                .feedback-context {
                    background: #f5f5f5;
                    padding: 10px;
                    border-radius: 4px;
                    margin-bottom: 15px;
                    max-height: 150px;
                    overflow-y: auto;
                }
                
                .feedback-context pre {
                    margin: 0;
                    font-size: 11px;
                }
                
                .form-group {
                    margin-bottom: 15px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                }
                
                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                
                .form-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }
                
                .form-actions button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .form-actions button[type="submit"] {
                    background: #28a745;
                    color: white;
                }
            </style>
        `;

        // Inject into page
        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.insertAdjacentHTML('beforeend', formHTML);
        
        // Add trigger button
        const trigger = document.createElement('button');
        trigger.className = 'feedback-trigger';
        trigger.innerHTML = '💡';
        trigger.onclick = () => this.open();
        document.body.appendChild(trigger);
    }

    /**
     * Open feedback form
     */
    open() {
        this.currentContext = this.captureContext();
        const modal = document.getElementById('feedbackModal');
        const contextDisplay = document.getElementById('contextDisplay');
        
        // Display context
        contextDisplay.textContent = JSON.stringify(this.currentContext.appState, null, 2);
        
        modal.classList.add('active');
        
        // Attach submit handler
        document.getElementById('feedbackForm').onsubmit = (e) => {
            e.preventDefault();
            this.submit();
        };
    }

    /**
     * Close feedback form
     */
    close() {
        document.getElementById('feedbackModal').classList.remove('active');
        document.getElementById('feedbackForm').reset();
    }

    /**
     * Submit feedback
     */
    submit() {
        const feedback = {
            id: `FB-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: document.getElementById('feedbackType').value,
            priority: document.getElementById('priority').value,
            description: document.getElementById('description').value,
            expectedBehavior: document.getElementById('expectedBehavior').value,
            component: document.getElementById('component').value,
            context: this.currentContext,
            status: 'new'
        };

        // Save to queue
        this.feedbackQueue.push(feedback);
        
        // Save to localStorage (in real app, would send to server)
        this.saveFeedback(feedback);
        
        // Show confirmation
        this.showConfirmation(feedback);
        
        // Close form
        this.close();
    }

    /**
     * Save feedback to storage
     */
    saveFeedback(feedback) {
        const existing = JSON.parse(localStorage.getItem('conceptFeedback') || '[]');
        existing.push(feedback);
        localStorage.setItem('conceptFeedback', JSON.stringify(existing));
        
        // Also save to file for processing (would be API call in production)
        console.log('Feedback saved:', feedback);
        
        // In future: could trigger idea processor here
        // this.triggerIdeaProcessor(feedback);
    }

    /**
     * Show confirmation message
     */
    showConfirmation(feedback) {
        const message = `
            <div style="position: fixed; top: 20px; right: 20px; 
                        background: #28a745; color: white; 
                        padding: 15px; border-radius: 4px; z-index: 10000;">
                ✅ Feedback submitted! ID: ${feedback.id}
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', message);
        
        setTimeout(() => {
            document.body.lastElementChild.remove();
        }, 3000);
    }

    /**
     * Export feedback for processing
     */
    exportFeedback() {
        const feedback = JSON.parse(localStorage.getItem('conceptFeedback') || '[]');
        const blob = new Blob([JSON.stringify(feedback, null, 2)], 
                              {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feedback-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    }

    /**
     * Future: Trigger idea processor
     */
    async triggerIdeaProcessor(feedback) {
        // This would call an agent/processor to:
        // 1. Analyze the feedback
        // 2. Generate a user story if it's a feature
        // 3. Create a component if it's simple enough
        // 4. Add to backlog if it needs more analysis
        
        console.log('Would trigger idea processor for:', feedback.type);
        
        // Example processor call (future implementation):
        // const result = await fetch('/api/process-idea', {
        //     method: 'POST',
        //     body: JSON.stringify(feedback)
        // });
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.feedbackCollector = new FeedbackCollector();
    
    // Auto-initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.feedbackCollector.createFeedbackForm();
        });
    } else {
        window.feedbackCollector.createFeedbackForm();
    }
}

// Export for use in Node/processors
if (typeof module !== 'undefined') {
    module.exports = FeedbackCollector;
}