
export function handleResponse(data: any = {}, message: string = 'Success') {
  return {
    error: false,
    message,
    data
  };
}

