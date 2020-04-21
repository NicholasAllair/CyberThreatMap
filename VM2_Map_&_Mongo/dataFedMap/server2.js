/**
 * Creates a unix socket server and waits for a python client to interact
 */
const net = require('net');
const fs = require('fs');

const socketPath = '/tmp/node-python-sock';
// Callback for socket
const handler = (socket) => {

  // Listen for data from client
  socket.on('data', (bytes) => {

    // Decode byte string
    const msg = bytes.toString();

    console.log(msg);

    if (msg === 'python connected')
      return socket.write('hi');

    // Let python know we want it to close
    socket.write('end');
    // Exit the process


  });

};

// Remove an existing socket
fs.unlink(
  socketPath,
  // Create the server, give it our callback handler and listen at the path
  () => net.createServer(handler).listen(socketPath)
);
