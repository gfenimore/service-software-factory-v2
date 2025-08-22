/**
 * CONTEXTUAL FEEDBACK SYSTEM
 * Less intrusive, more intelligent
 * Appears when users need it, not constantly
 */

class ContextualFeedback {
    constructor() {
        this.context = {
            currentView: null,
            selectedAccount: null,
            selectedLocation: null,
            selectedWorkOrder: null,
            lastAction: null,
            actionCount: 0,
            timeOnElement: {}
        };
        
        this.feedbackData = {
            contextual: [],
            patterns: [],
            decisions: []
        };
        
        this.init();
    }
    
    init() {
        // Add subtle feedback trigger button
        this.addMinimalTrigger();
        
        // Track context silently
        this.trackUserContext();
        
        // Add keyboard shortcut for power users
        this.addKeyboardTrigger();
        
        // Detect moments of pause (thinking)
        this.detectPauseMoments();
    }
    
    // Minimal, non-intrusive trigger
    addMinimalTrigger() {
        const trigger = document.createElement('div');
        trigger.id = 'feedback-trigger';
        trigger.innerHTML = `
            <button style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: #fbbf24;
                border: 2px solid #f59e0b;
                color: #78350f;
                font-size: 20px;
                cursor: pointer;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                z-index: 9998;
                transition: all 0.2s;
            " 
            onmouseover="this.style.transform='scale(1.1)'"
            onmouseout="this.style.transform='scale(1)'"
            title="Feedback (F1)">
                💭
            </button>
        `;
        
        trigger.querySelector('button').onclick = () => this.showContextualFeedback();
        document.body.appendChild(trigger);
        
        // Add pulse animation when user seems stuck
        this.addPulseWhenStuck();
    }
    
    // Show feedback UI based on current context
    showContextualFeedback() {
        const modal = document.createElement('div');
        modal.id = 'contextual-feedback-modal';
        
        // Determine context-specific questions
        const contextQuestions = this.getContextualQuestions();
        
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 style="margin: 0; font-size: 18px; color: #111827;">Quick Feedback</h2>
                        <button onclick="contextualFeedback.closeFeedback()" style="
                            background: none;
                            border: none;
                            font-size: 24px;
                            cursor: pointer;
                            color: #6b7280;
                        ">×</button>
                    </div>
                    
                    <!-- Current Context Display -->
                    <div style="
                        background: #f9fafb;
                        border: 1px solid #e5e7eb;
                        border-radius: 6px;
                        padding: 12px;
                        margin-bottom: 16px;
                        font-size: 14px;
                        color: #6b7280;
                    ">
                        <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">Your current context:</div>
                        ${this.getContextDescription()}
                    </div>
                    
                    <!-- Context-Specific Questions -->
                    <div style="margin-bottom: 16px;">
                        ${contextQuestions}
                    </div>
                    
                    <!-- General Feedback -->
                    <div style="
                        border-top: 1px solid #e5e7eb;
                        padding-top: 16px;
                        margin-top: 16px;
                    ">
                        <div style="font-weight: 600; color: #374151; margin-bottom: 8px;">
                            Anything else?
                        </div>
                        <textarea id="general-feedback" style="
                            width: 100%;
                            height: 60px;
                            padding: 8px;
                            border: 1px solid #d1d5db;
                            border-radius: 6px;
                            font-size: 14px;
                            resize: vertical;
                        " placeholder="Optional comments..."></textarea>
                    </div>
                    
                    <!-- Submit -->
                    <div style="display: flex; gap: 8px; margin-top: 16px;">
                        <button onclick="contextualFeedback.submitFeedback()" style="
                            flex: 1;
                            background: #10b981;
                            color: white;
                            padding: 10px;
                            border: none;
                            border-radius: 6px;
                            font-weight: 600;
                            cursor: pointer;
                        ">Submit Feedback</button>
                        <button onclick="contextualFeedback.closeFeedback()" style="
                            padding: 10px 20px;
                            background: #f3f4f6;
                            color: #374151;
                            border: 1px solid #d1d5db;
                            border-radius: 6px;
                            cursor: pointer;
                        ">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Get questions based on what user is doing
    getContextualQuestions() {
        let questions = '';
        
        // If they selected an account
        if (this.context.selectedAccount && !this.context.selectedLocation) {
            questions += `
                <div style="margin-bottom: 12px;">
                    <div style="font-weight: 600; color: #374151; margin-bottom: 6px;">
                        About "${this.context.selectedAccount}" account:
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 14px;">
                            <input type="checkbox" name="account-feedback" value="easy-to-find">
                            Easy to find the account I needed
                        </label>
                        <label style="font-size: 14px;">
                            <input type="checkbox" name="account-feedback" value="missing-info">
                            Missing information I expected to see
                        </label>
                        <label style="font-size: 14px;">
                            <input type="checkbox" name="account-feedback" value="too-much-info">
                            Too much information displayed
                        </label>
                    </div>
                </div>
            `;
        }
        
        // If they selected a location
        if (this.context.selectedLocation) {
            questions += `
                <div style="margin-bottom: 12px;">
                    <div style="font-weight: 600; color: #374151; margin-bottom: 6px;">
                        About location navigation:
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="quick-feedback-btn" onclick="contextualFeedback.quickFeedback('location-clear')" style="
                            padding: 6px 12px;
                            border: 1px solid #d1d5db;
                            border-radius: 6px;
                            background: white;
                            cursor: pointer;
                            font-size: 13px;
                        ">👍 Clear & logical</button>
                        <button class="quick-feedback-btn" onclick="contextualFeedback.quickFeedback('location-confused')" style="
                            padding: 6px 12px;
                            border: 1px solid #d1d5db;
                            border-radius: 6px;
                            background: white;
                            cursor: pointer;
                            font-size: 13px;
                        ">😕 Confusing</button>
                        <button class="quick-feedback-btn" onclick="contextualFeedback.quickFeedback('location-slow')" style="
                            padding: 6px 12px;
                            border: 1px solid #d1d5db;
                            border-radius: 6px;
                            background: white;
                            cursor: pointer;
                            font-size: 13px;
                        ">🐌 Too many clicks</button>
                    </div>
                </div>
            `;
        }
        
        // If they've been on the same view for a while
        if (this.context.timeOnElement[this.context.lastAction] > 10000) {
            questions += `
                <div style="margin-bottom: 12px; background: #fef3c7; padding: 8px; border-radius: 6px;">
                    <div style="font-weight: 600; color: #92400e; margin-bottom: 6px;">
                        🤔 You seem to be looking for something?
                    </div>
                    <input type="text" id="looking-for" placeholder="What are you trying to find?" style="
                        width: 100%;
                        padding: 6px;
                        border: 1px solid #fbbf24;
                        border-radius: 4px;
                        font-size: 14px;
                    ">
                </div>
            `;
        }
        
        // Always include MVP scoping
        questions += `
            <div style="margin-bottom: 12px;">
                <div style="font-weight: 600; color: #374151; margin-bottom: 6px;">
                    For MVP v1.0, this feature is:
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                    <button onclick="contextualFeedback.scopeDecision('must-have')" style="
                        padding: 8px;
                        border: 2px solid #10b981;
                        border-radius: 6px;
                        background: #dcfce7;
                        cursor: pointer;
                        font-size: 13px;
                        font-weight: 600;
                        color: #166534;
                    ">✅ Must Have</button>
                    <button onclick="contextualFeedback.scopeDecision('nice-to-have')" style="
                        padding: 8px;
                        border: 2px solid #3b82f6;
                        border-radius: 6px;
                        background: #dbeafe;
                        cursor: pointer;
                        font-size: 13px;
                        font-weight: 600;
                        color: #1e40af;
                    ">👍 Nice to Have</button>
                    <button onclick="contextualFeedback.scopeDecision('later')" style="
                        padding: 8px;
                        border: 2px solid #f59e0b;
                        border-radius: 6px;
                        background: #fef3c7;
                        cursor: pointer;
                        font-size: 13px;
                        font-weight: 600;
                        color: #92400e;
                    ">📅 Version 2</button>
                    <button onclick="contextualFeedback.scopeDecision('not-needed')" style="
                        padding: 8px;
                        border: 2px solid #ef4444;
                        border-radius: 6px;
                        background: #fee2e2;
                        cursor: pointer;
                        font-size: 13px;
                        font-weight: 600;
                        color: #991b1b;
                    ">❌ Not Needed</button>
                </div>
            </div>
        `;
        
        return questions;
    }
    
    // Track user context silently
    trackUserContext() {
        // Override selection functions to track context
        if (window.selectAccount) {
            const original = window.selectAccount;
            window.selectAccount = (account) => {
                this.context.selectedAccount = account.name;
                this.context.lastAction = 'account-selection';
                this.context.actionCount++;
                original(account);
            };
        }
        
        if (window.selectLocation) {
            const original = window.selectLocation;
            window.selectLocation = (location) => {
                this.context.selectedLocation = location.name;
                this.context.lastAction = 'location-selection';
                this.context.actionCount++;
                original(location);
            };
        }
        
        if (window.selectWorkOrder) {
            const original = window.selectWorkOrder;
            window.selectWorkOrder = (order) => {
                this.context.selectedWorkOrder = order.title;
                this.context.lastAction = 'workorder-selection';
                this.context.actionCount++;
                original(order);
            };
        }
        
        // Track time on elements
        let lastActionTime = Date.now();
        document.addEventListener('click', () => {
            const now = Date.now();
            const timeSinceLast = now - lastActionTime;
            
            if (this.context.lastAction) {
                this.context.timeOnElement[this.context.lastAction] = timeSinceLast;
            }
            
            lastActionTime = now;
        });
    }
    
    // Detect when user might be stuck
    detectPauseMoments() {
        let inactivityTimer;
        let lastActivity = Date.now();
        
        const resetTimer = () => {
            lastActivity = Date.now();
            clearTimeout(inactivityTimer);
            
            inactivityTimer = setTimeout(() => {
                // User has been inactive for 15 seconds
                this.showSubtlePrompt();
            }, 15000);
        };
        
        document.addEventListener('click', resetTimer);
        document.addEventListener('mousemove', resetTimer);
        document.addEventListener('keypress', resetTimer);
        
        resetTimer();
    }
    
    // Subtle prompt when user seems stuck
    showSubtlePrompt() {
        const trigger = document.querySelector('#feedback-trigger button');
        if (trigger) {
            // Add gentle pulse
            trigger.style.animation = 'pulse 2s ease-in-out 3';
            
            // Show toast
            this.showToast('Need help? Press F1 for quick feedback', 3000);
        }
    }
    
    // Add CSS for pulse animation
    addPulseWhenStuck() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Keyboard trigger for power users
    addKeyboardTrigger() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.showContextualFeedback();
            }
        });
    }
    
    // Get human-readable context
    getContextDescription() {
        let description = '';
        
        if (this.context.selectedAccount) {
            description += `Account: <strong>${this.context.selectedAccount}</strong>`;
        }
        
        if (this.context.selectedLocation) {
            description += ` → Location: <strong>${this.context.selectedLocation}</strong>`;
        }
        
        if (this.context.selectedWorkOrder) {
            description += ` → Work Order: <strong>${this.context.selectedWorkOrder}</strong>`;
        }
        
        if (!description) {
            description = 'No selection (browsing accounts)';
        }
        
        return description;
    }
    
    // Handle quick feedback buttons
    quickFeedback(type) {
        this.feedbackData.contextual.push({
            type,
            context: this.context,
            timestamp: Date.now()
        });
        
        // Visual feedback
        event.target.style.background = '#10b981';
        event.target.style.color = 'white';
        event.target.disabled = true;
    }
    
    // Handle scope decisions
    scopeDecision(scope) {
        this.feedbackData.decisions.push({
            feature: this.getContextDescription(),
            scope,
            context: this.context,
            timestamp: Date.now()
        });
        
        // Visual feedback
        event.target.style.borderWidth = '3px';
        
        this.showToast(`Marked as ${scope}`, 2000);
    }
    
    // Submit feedback
    submitFeedback() {
        const generalFeedback = document.getElementById('general-feedback')?.value;
        const lookingFor = document.getElementById('looking-for')?.value;
        
        const feedback = {
            context: this.context,
            timestamp: Date.now(),
            general: generalFeedback,
            lookingFor,
            contextualFeedback: this.feedbackData.contextual,
            scopeDecisions: this.feedbackData.decisions
        };
        
        console.log('📊 Contextual Feedback Submitted:', feedback);
        
        // Save to session storage
        const allFeedback = JSON.parse(sessionStorage.getItem('contextualFeedback') || '[]');
        allFeedback.push(feedback);
        sessionStorage.setItem('contextualFeedback', JSON.stringify(allFeedback));
        
        this.showToast('Thank you for your feedback!', 2000);
        this.closeFeedback();
    }
    
    // Close feedback modal
    closeFeedback() {
        const modal = document.getElementById('contextual-feedback-modal');
        if (modal) {
            modal.remove();
        }
    }
    
    // Show toast notification
    showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: #1f2937;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 9997;
            animation: slideIn 0.3s ease-out;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), duration);
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.contextualFeedback = new ContextualFeedback();
    });
} else {
    window.contextualFeedback = new ContextualFeedback();
}