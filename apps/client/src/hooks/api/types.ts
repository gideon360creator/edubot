export interface ServerResponse<T> {
  status: 'success' | 'error'
  message: string
  data: T
}
