import { io } from 'socket.io-client';

const socket = io('/'); // Nginx proxies WebSocket traffic

export default socket;
