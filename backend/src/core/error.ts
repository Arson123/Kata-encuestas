// mapping de errores → HTTP
export function mapErrorToHttp(error: Error): { status: number; message: string } {
  // Example mapping
  return { status: 500, message: error.message };
}