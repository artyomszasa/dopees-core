import { describe, it } from 'mocha';
import { expect } from 'chai';
import { TimeSpan } from '../src/datetime';

describe('TimeSpan', () => {
  it('parse', () => {
    let res = new TimeSpan("00:00:00.001").totalMilliseconds;
    expect(res).equal(1);
    res = new TimeSpan("00:00:00.1").totalMilliseconds;
    expect(res).equal(100);
    let dt = new TimeSpan("00:01");
    expect(dt.minutes).equal(1);
    dt = new TimeSpan("0:1");
    expect(dt.minutes).equal(1);
    dt = new TimeSpan("12.10:11:05.38");
    expect(dt.days).equal(12);
    expect(dt.hours).equal(10);
    expect(dt.minutes).equal(11);
    expect(dt.seconds).equal(5);
    expect(dt.milliseconds).equal(380);
  })
});