/**
 * Base Repository Interface and Abstract Class
 *
 * ARCHITECTURE: Repository pattern for data access abstraction
 * Enables database technology switching without affecting business logic
 * As per audit recommendations for loose coupling
 */

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

export interface QueryOptions {
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface Repository<T extends BaseEntity, CreateDTO, UpdateDTO> {
  findAll(options?: QueryOptions): Promise<T[]>
  findById(id: string): Promise<T | null>
  findOne(conditions: Partial<T>): Promise<T | null>
  findMany(conditions: Partial<T>, options?: QueryOptions): Promise<T[]>
  create(data: CreateDTO): Promise<T>
  update(id: string, data: UpdateDTO): Promise<T>
  delete(id: string): Promise<void>
  count(conditions?: Partial<T>): Promise<number>
  exists(id: string): Promise<boolean>
}

/**
 * Base repository with common functionality
 */
export abstract class BaseRepository<T extends BaseEntity, CreateDTO, UpdateDTO>
  implements Repository<T, CreateDTO, UpdateDTO>
{
  protected abstract tableName: string

  abstract findAll(options?: QueryOptions): Promise<T[]>
  abstract findById(id: string): Promise<T | null>
  abstract findOne(conditions: Partial<T>): Promise<T | null>
  abstract findMany(conditions: Partial<T>, options?: QueryOptions): Promise<T[]>
  abstract create(data: CreateDTO): Promise<T>
  abstract update(id: string, data: UpdateDTO): Promise<T>
  abstract delete(id: string): Promise<void>
  abstract count(conditions?: Partial<T>): Promise<number>

  /**
   * Check if entity exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const entity = await this.findById(id)
    return entity !== null
  }

  /**
   * Log operations in development
   */
  protected log(operation: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.constructor.name}] ${operation}`, data || '')
    }
  }
}
