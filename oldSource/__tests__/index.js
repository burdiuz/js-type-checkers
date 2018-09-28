import createTypeChecked from '../index';

describe('index', () => {
  it('should export string as default', () => {
    expect(typeof createTypeChecked).toEqual('function');
  });
});
