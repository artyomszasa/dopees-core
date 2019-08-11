import { describe, it } from 'mocha';
import { expect } from 'chai';
import { FormUrlEncodedContent } from '../src/http';

describe('FormUrlEncodedContent', () => {
  // accepted case --> strings only
  it('Record-OK', async (done) => {
    try {
      const content = new FormUrlEncodedContent({
        key1: 'value1',
        key2: 'value2'
      });
      const text = await content.text();
      expect(text).equal('key1=value1&key2=value2');
    } catch (exn) {
      done(exn);
    }
  });
});
