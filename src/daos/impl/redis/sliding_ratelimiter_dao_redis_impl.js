const redis = require('./redis_client');
/* eslint-disable no-unused-vars */
const keyGenerator = require('./redis_key_generator');
const timeUtils = require('../../../utils/time_utils');
/* eslint-enable */

/* eslint-disable no-unused-vars */

// Challenge 7
const hitSlidingWindow = async (name, opts) => {
  const client = redis.getClient();
  const windowSize = opts.interval;
  const key = keyGenerator.getSliddingRateLimiterKey(name, windowSize, opts.maxHits);
  const rand = Math.random().toString(16).substr(2, 8);
  const millis = timeUtils.getCurrentTimestampMillis();
  const pipeline = client.batch();

  pipeline.zadd(key, millis, `${millis}:${rand}`);
  pipeline.zremrangebyscore(key, 0, (millis - windowSize));
  pipeline.zcard(key);

  const response = await pipeline.execAsync();
  const hits = parseInt(response[2], 10);

  let hitsRemaining;
  if (hits > opts.maxHits) {
    // Too many hits.
    hitsRemaining = -1;
  } else {
    // Return number of hits remaining.
    hitsRemaining = opts.maxHits - hits;
  }
  return hitsRemaining;
};

/* eslint-enable */

module.exports = {
  /**
   * Record a hit against a unique resource that is being
   * rate limited.  Will return 0 when the resource has hit
   * the rate limit.
   * @param {string} name - the unique name of the resource.
   * @param {Object} opts - object containing interval and maxHits details:
   *   {
   *     interval: 1,
   *     maxHits: 5
   *   }
   * @returns {Promise} - Promise that resolves to number of hits remaining,
   *   or 0 if the rate limit has been exceeded..
   */
  hit: hitSlidingWindow,
};
