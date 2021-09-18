const config = require('better-config');

config.set('../config.json');

const redis = require('../src/daos/impl/redis/redis_client');
const keyGenerator = require('../src/daos/impl/redis/redis_key_generator');

const testSuiteName = 'try_redis_impl';

const testKeyPrefix = `test:${testSuiteName}`;

keyGenerator.setPrefix(testKeyPrefix);
const client = redis.getClient();

/* eslint-disable no-undef */

beforeAll(() => {
  jest.setTimeout(60000);
});

afterEach(async () => {
  const testKeys = await client.keysAsync(`${testKeyPrefix}:*`);

  if (testKeys.length > 0) {
    await client.delAsync(testKeys);
  }
});

afterAll(() => {
  // Release Redis connection.
  client.quit();
});


test.skip(`${testSuiteName}: verify if Earth is in planets`, async () => {
  const verified = await client.sismemberAsync('myplanets', 'Earth');
  console.log(typeof verified);
  expect(verified).toBe(1);
});


test.skip(`${testSuiteName}: find the recently added sorted set element`, async () => {
  await client.hmsetAsync('hw1.3', {
    name: 'Jane Doe',
    age: 42,
  });
  const person = await client.hgetallAsync('hw1.3');
  console.log(`${typeof person}, ${typeof person.name}, ${typeof person.age}`);
  expect(typeof person).toEqual('object');
});


test.only(`${testSuiteName}: find the metrics`, async () => {
  const insert = async (minuteOfDay, element) => client.zaddAsync('metrics', minuteOfDay, element);
  await insert(0, 'A');
  await insert(1, 'B');
  await insert(2, 'C');
  await insert(3, 'A');
  const results = await client.zrangeAsync('metrics', 0, -1);
  console.log('********************************');
  console.log(`${typeof results}`, results);
  expect(typeof results).toEqual('object');
});

/*
 GEORADIUS sites:geo -122.271111  37.804363 20 km
 STORE intermediateGeroResult

 ZINTERSCORE sitesInRediusWithCapacities 2
 intermediateGeoResults
 sites:capacities:ranking
 WEIGHTS 0 1

ZRANGEBYSCORE sitesInRediusWithCapacities 0.2 +inf

lconst findAll = async () => {
  const client = redis.getClient();
  const pipeline = client.batch();
  pipeline.zrange(keyGenerator.getSiteGeoKey(), 0, -1);
  const siteIds = await pipeline.execAsync();
  const pipeline2 = client.batch();
  await Promise.all(siteIds.map(siteId => pipeline2.hgetall(keyGenerator.getSiteHashKey(siteId))));
  const sites = await pipeline2.execAsync();
  const result = sites.filter(site => !!site).map(site => remap(site));
  console.log({ result });
  return result;
};
*/
