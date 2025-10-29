/**
 * @jest-environment jsdom
 */

import React from 'react';
import { expect, test, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import Button from "@/components/Button.tsx";

test('test callback', () => {
    const cb = vi.fn();
    const { getByText } = render(<Button onClick={cb}> hello </Button>);
    const button = getByText(/hello/);
    fireEvent.click(button);
    expect(cb).toHaveBeenCalled();
})
