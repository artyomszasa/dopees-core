import { describe, it } from 'mocha';
import { expect } from 'chai';
import { TimeSpan, DateTime } from '../src/datetime';

describe('TimeSpan', () => {
  it('parse', () => {
    let res = new TimeSpan('00:00:00.001').totalMilliseconds;
    expect(res).equal(1);
    res = new TimeSpan('00:00:00.1').totalMilliseconds;
    expect(res).equal(100);
    let dt = new TimeSpan('00:01');
    expect(dt.minutes).equal(1);
    dt = new TimeSpan('0:1');
    expect(dt.minutes).equal(1);
    dt = new TimeSpan('12.10:11:05.38');
    expect(dt.days).equal(12);
    expect(dt.hours).equal(10);
    expect(dt.minutes).equal(11);
    expect(dt.seconds).equal(5);
    expect(dt.milliseconds).equal(380);
  });
});

describe('DateTime', () => {
  it('addMonths', () => {
    const source = new DateTime({
      year: 2018,
      month: 1,
      day: 31,
      hours: 12
    });
    let res = source.addMonths(1);
    expect(res.year).equal(2018);
    expect(res.month).equal(2);
    expect(res.day).equal(28); // !!!
    expect(res.hours).equal(12);
    expect(res.minutes).equal(0);

    res = source.addMonths(1.5);
    expect(res.year).equal(2018);
    expect(res.month).equal(3);
    expect(res.day).equal(14); // !!!
    expect(res.hours).equal(12);
    expect(res.minutes).equal(0);

    res = source.addMonths(-1);
    expect(res.year).equal(2017);
    expect(res.month).equal(12);
    expect(res.day).equal(31); // !!!
    expect(res.hours).equal(12);
    expect(res.minutes).equal(0);
  });
  it('compareTo', () => {
    const a = new DateTime({
      year: 2018,
      month: 1,
      day: 31,
      hours: 12
    });
    const b = new DateTime({
      year: 2018,
      month: 1,
      day: 30,
      hours: 12
    });
    expect(a.compareTo(b)).eq(1);
    expect(b.compareTo(a)).eq(-1);
    expect(a.compareTo(a)).eq(0);
  });
});
