/**
 * PROGRESSIVE INTERFACE CONTRACTS
 * Shows how the same interface evolves through the three lines
 */

// ============================================
// CONCEPT LINE - Everything is 'any'
// ============================================
export namespace ConceptLine {
  // Simple event emitter - no types needed!
  export const emitEvent = (eventName: any, payload: any) => {
    console.log(`📤 Event: ${eventName}`, payload);
    // In concept, maybe just use window.postMessage or callbacks
    window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));
  };
  
  export const listenToEvent = (eventName: any, handler: any) => {
    console.log(`👂 Listening to: ${eventName}`);
    window.addEventListener(eventName, (e: any) => handler(e.detail));
  };
  
  // Master View implementation (concept)
  export const MasterView = {
    selectAccount: (account: any) => {
      console.log("Master View: Account selected", account);
      emitEvent("account:selected", account);
    }
  };
  
  // Detail View implementation (concept)
  export const DetailView = {
    handleAccountSelection: (account: any) => {
      console.log("Detail View: Received account", account);
      // Just open with the data, no validation
      openDetailModal(account);
    }
  };
}

// ============================================
// PROTOTYPE LINE - TypeScript interfaces
// ============================================
export namespace PrototypeLine {
  // Now we have types!
  export interface AccountSelectedEvent {
    accountId: number;
    accountName: string;
    accountType: 'Commercial' | 'Residential' | 'Industrial';
  }
  
  export interface LocationSelectedEvent {
    locationId: number;
    locationName: string;
    accountId: number;
    address: string;
  }
  
  // Type-safe event emitter
  export interface EventMap {
    'account:selected': AccountSelectedEvent;
    'location:selected': LocationSelectedEvent;
    'detail-view:closed': { accountId: number; hasChanges: boolean };
  }
  
  export const emitEvent = <K extends keyof EventMap>(
    eventName: K,
    payload: EventMap[K]
  ) => {
    // TypeScript ensures payload matches event type
    window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));
  };
  
  export const listenToEvent = <K extends keyof EventMap>(
    eventName: K,
    handler: (payload: EventMap[K]) => void
  ) => {
    window.addEventListener(eventName, (e: any) => handler(e.detail));
  };
  
  // Master View with types
  export class MasterView {
    selectAccount(account: AccountSelectedEvent) {
      // TypeScript enforces shape
      emitEvent('account:selected', account);
    }
  }
  
  // Detail View with types
  export class DetailView {
    constructor() {
      // Type-safe listener
      listenToEvent('account:selected', this.handleAccountSelection);
    }
    
    handleAccountSelection(account: AccountSelectedEvent) {
      // account is properly typed!
      console.log(`Opening detail for ${account.accountName}`);
    }
  }
}

// ============================================
// PRODUCTION LINE - Runtime validation with Zod
// ============================================
export namespace ProductionLine {
  import { z } from 'zod';
  
  // Zod schemas with runtime validation
  export const AccountSelectedEventSchema = z.object({
    accountId: z.number().positive(),
    accountName: z.string().min(1).max(100),
    accountType: z.enum(['Commercial', 'Residential', 'Industrial']),
    // Production adds audit fields
    selectedBy: z.string(),
    selectedAt: z.date(),
    sessionId: z.string().uuid()
  });
  
  export const LocationSelectedEventSchema = z.object({
    locationId: z.number().positive(),
    locationName: z.string().min(1),
    accountId: z.number().positive(),
    address: z.string(),
    // Production adds security context
    tenantId: z.string().uuid(),
    permissions: z.array(z.string())
  });
  
  // Type AND runtime safe event emitter
  export class SecureEventBus {
    private schemas = {
      'account:selected': AccountSelectedEventSchema,
      'location:selected': LocationSelectedEventSchema
    };
    
    emit<K extends keyof typeof this.schemas>(
      eventName: K,
      payload: unknown
    ) {
      // Runtime validation!
      const schema = this.schemas[eventName];
      const validated = schema.parse(payload); // Throws if invalid
      
      // Log for audit
      console.log(`[AUDIT] Event: ${eventName}`, {
        timestamp: new Date(),
        payload: validated,
        user: getCurrentUser()
      });
      
      // Emit validated event
      window.dispatchEvent(
        new CustomEvent(eventName, { detail: validated })
      );
    }
    
    listen<K extends keyof typeof this.schemas>(
      eventName: K,
      handler: (payload: z.infer<typeof this.schemas[K]>) => void
    ) {
      window.addEventListener(eventName, (e: any) => {
        // Validate incoming events too!
        const schema = this.schemas[eventName];
        try {
          const validated = schema.parse(e.detail);
          handler(validated);
        } catch (error) {
          console.error(`Invalid event payload for ${eventName}:`, error);
          // Production: Send to error tracking
          Sentry.captureException(error);
        }
      });
    }
  }
  
  // Production Master View with full validation
  export class MasterView {
    constructor(private eventBus: SecureEventBus) {}
    
    selectAccount(accountId: number) {
      // Fetch account with security checks
      const account = await this.fetchAccountSecurely(accountId);
      
      // Emit with full production context
      this.eventBus.emit('account:selected', {
        accountId: account.id,
        accountName: account.name,
        accountType: account.type,
        selectedBy: getCurrentUser().id,
        selectedAt: new Date(),
        sessionId: getSessionId()
      });
    }
    
    private async fetchAccountSecurely(accountId: number) {
      // Production: Check permissions, multi-tenant isolation, etc.
      const canAccess = await checkPermissions('accounts:read', accountId);
      if (!canAccess) throw new ForbiddenError();
      
      return await fetchWithRetry(`/api/accounts/${accountId}`);
    }
  }
}