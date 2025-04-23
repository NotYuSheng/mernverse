export async function fetchMessages() {
    const response = await fetch('/api/messages');
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return response.json();
  }
  