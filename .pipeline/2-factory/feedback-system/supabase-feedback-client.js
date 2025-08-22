/**
 * SUPABASE FEEDBACK CLIENT
 * 
 * Drop-in replacement for localStorage that automatically syncs to Supabase!
 * NO MORE MANUAL EXPORTS!
 */

class SupabaseFeedbackClient {
    constructor(supabaseUrl, supabaseKey) {
        // Initialize Supabase client (would be passed from environment)
        this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        this.projectId = this.getProjectId();
        this.iterationId = this.getIterationId();
    }
    
    async submitFeedback(feedbackData) {
        console.log('🚀 Submitting feedback to Supabase...');
        
        try {
            // Prepare data for Supabase
            const submission = {
                description: feedbackData.description,
                type: feedbackData.type,
                priority: feedbackData.priority,
                
                // Context
                page_url: feedbackData.context.url,
                viewport_width: feedbackData.context.viewport?.width,
                viewport_height: feedbackData.context.viewport?.height,
                selected_account: feedbackData.context.selectedAccount,
                selected_location: feedbackData.context.selectedLocation,
                selected_work_order: feedbackData.context.selectedWorkOrder,
                
                // Project tracking
                project_id: this.projectId,
                iteration_id: this.iterationId,
                
                // Initial estimates (client-side)
                time_estimate: feedbackData.estimate,
                complexity: feedbackData.complexity,
                implementation_steps: feedbackData.implementation
            };
            
            // Submit to Supabase
            const { data, error } = await this.supabase
                .from('feedback_submissions')
                .insert([submission])
                .select()
                .single();
            
            if (error) throw error;
            
            console.log('✅ Feedback saved to Supabase!', data);
            
            // Also save to localStorage as backup
            this.saveToLocalBackup(data);
            
            // Return the saved data with ID
            return {
                success: true,
                feedbackId: data.id,
                message: 'Feedback submitted successfully!',
                data: data
            };
            
        } catch (error) {
            console.error('❌ Supabase error:', error);
            
            // Fallback to localStorage if Supabase fails
            console.log('📦 Falling back to localStorage...');
            return this.saveToLocalStorage(feedbackData);
        }
    }
    
    async getFeedbackStatus(feedbackId) {
        // Check the status of submitted feedback
        const { data, error } = await this.supabase
            .from('feedback_submissions')
            .select(`
                *,
                feedback_requirements (
                    requirement_id,
                    busm_mappings,
                    mock_data
                ),
                feedback_implementations (
                    status,
                    completed_at
                )
            `)
            .eq('id', feedbackId)
            .single();
        
        if (error) {
            console.error('Error fetching status:', error);
            return null;
        }
        
        return data;
    }
    
    async subscribeToUpdates(feedbackId, callback) {
        // Real-time subscription to feedback updates
        const subscription = this.supabase
            .channel(`feedback:${feedbackId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'feedback_submissions',
                    filter: `id=eq.${feedbackId}`
                },
                (payload) => {
                    console.log('📡 Real-time update:', payload);
                    callback(payload.new);
                }
            )
            .subscribe();
        
        return subscription;
    }
    
    async getDashboardStats() {
        // Get statistics for dashboard
        const { data, error } = await this.supabase
            .from('feedback_submissions')
            .select('type, priority, status, created_at')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching stats:', error);
            return null;
        }
        
        // Calculate statistics
        const stats = {
            total: data.length,
            byType: {},
            byPriority: {},
            byStatus: {},
            recentSubmissions: data.slice(0, 10)
        };
        
        data.forEach(item => {
            stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
            stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
            stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
        });
        
        return stats;
    }
    
    // Utility methods
    getProjectId() {
        // Get from URL, config, or environment
        return window.location.hostname.replace(/\./g, '-');
    }
    
    getIterationId() {
        // Get current iteration from somewhere
        return `iteration-${Date.now()}`;
    }
    
    saveToLocalBackup(data) {
        // Keep local backup just in case
        const backups = JSON.parse(localStorage.getItem('feedbackBackups') || '[]');
        backups.push({
            ...data,
            backedUpAt: new Date().toISOString()
        });
        localStorage.setItem('feedbackBackups', JSON.stringify(backups));
    }
    
    saveToLocalStorage(feedbackData) {
        // Fallback when Supabase is unavailable
        const tasks = JSON.parse(localStorage.getItem('feedbackTasks') || '[]');
        const task = {
            ...feedbackData,
            id: `LOCAL-${Date.now()}`,
            savedAt: new Date().toISOString(),
            syncPending: true
        };
        tasks.push(task);
        localStorage.setItem('feedbackTasks', JSON.stringify(tasks));
        
        return {
            success: true,
            feedbackId: task.id,
            message: 'Feedback saved locally (will sync when online)',
            data: task
        };
    }
    
    async syncPendingFeedback() {
        // Sync any locally-saved feedback to Supabase
        const tasks = JSON.parse(localStorage.getItem('feedbackTasks') || '[]');
        const pending = tasks.filter(t => t.syncPending);
        
        console.log(`📤 Syncing ${pending.length} pending feedback items...`);
        
        for (const task of pending) {
            const result = await this.submitFeedback(task);
            if (result.success && !result.data.syncPending) {
                // Remove from pending
                task.syncPending = false;
                task.syncedAt = new Date().toISOString();
                task.supabaseId = result.feedbackId;
            }
        }
        
        // Update localStorage
        localStorage.setItem('feedbackTasks', JSON.stringify(tasks));
        
        console.log('✅ Sync complete!');
    }
}

// Example usage in the feedback form:
/*
const feedbackClient = new SupabaseFeedbackClient(
    'https://your-project.supabase.co',
    'your-anon-key'
);

// When user submits feedback:
async function submitFeedback() {
    const feedback = {
        description: document.getElementById('feedbackDescription').value,
        type: document.getElementById('feedbackType').value,
        // ... etc
    };
    
    const result = await feedbackClient.submitFeedback(feedback);
    
    if (result.success) {
        // Subscribe to real-time updates
        feedbackClient.subscribeToUpdates(result.feedbackId, (update) => {
            console.log('Your feedback status:', update.status);
            if (update.status === 'implemented') {
                alert('🎉 Your feature is ready!');
            }
        });
    }
}
*/