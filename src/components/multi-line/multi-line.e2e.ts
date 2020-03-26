import { newE2EPage } from '@stencil/core/testing';

describe('cc-multi-line', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cc-multi-line></cc-multi-line>');

    const element = await page.find('cc-multi-line');
    expect(element).toHaveClass('hydrated');
  });
});
