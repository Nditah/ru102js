const redis = require('redis');
const { promisify } = require('util');

// Create a client and connect to Redis.
const client = redis.createClient({
  host: 'localhost',
  port: 6379,
  // password: 'password',
});

// Use Node's built in promisify to wrap the Redis
// command functions we are going to use in promises.
const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);

// Chain promises together to call Redis commands and
// process the results.
setAsync('hello', 'world')
  .then(res => console.log(res)) // OK
  .then(() => getAsync('hello'))
  .then(res => console.log(res)) // world
  .then(() => client.quit());

// const getMembers2 = async (key) => {
//   const members = [];
//   let cursorPosition = '0';
//   do {
//     const scanResponse = await client.sscanAsync(
//       key,
//       cursorPosition,
//       'MATCH',
//       '*',
//       'COUNT',
//       1000,
//     );
//     cursorPosition = scanResponse[0];
//     members.push(...scanResponse[1]);
//   } while (cursorPosition !== '0');

//   return members;
// };
